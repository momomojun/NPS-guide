// 往年同期天气：每个公园的每个片区取一个点——离片区里各景点（有步道口 / 停车点用那里）平均位置最近的那个景点。
// 不直接用平均位置：大峡谷南缘、火山口湖这种沿着弯曲边缘排开的景点，平均位置会掉进峡谷或湖里，海拔差很多。
// 用 Open-Meteo 历史天气（ERA5 再分析）2016–2025 年逐日的最高、最低气温、降水和降雪，按月平均。
// 输出 src/data/climate.generated.ts。新增片区、景点位置变了之后重新跑：npm run data:climate
// 已经算过、位置挪动不到 1 公里的片区直接沿用（历史数据不会变），只查新的；想全部重查就先删掉输出文件。
//
// Open-Meteo 免费接口按数据量计次：10 年逐日、4 个变量，一个点就算约 104 次；
// 每个 IP 每分钟 600 次、每小时 5,000 次、每天 10,000 次（按 UTC 整点、零点清零）。
// 所以每个点之间隔 13 秒，超出每小时的限额就等到下一个整点再接着查，73 个片区要跨两个小时。
// 每查完一个点就写一次文件，中途停了再跑会接着查。
import { existsSync, writeFileSync } from "node:fs";
import { attractions, parks, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/climate.generated.ts", import.meta.url);
const API = "https://archive-api.open-meteo.com/v1/archive";
const FIRST_YEAR = 2016;
const LAST_YEAR = 2025;
const YEARS_LABEL = `${FIRST_YEAR}–${LAST_YEAR}`;
const YEARS = LAST_YEAR - FIRST_YEAR + 1;
/** 两个点之间至少隔这么久：一分钟最多 5 个点（约 520 次），不碰每分钟 600 次的限额 */
const SPACING_MS = 13_000;
/** 日降水 ≥ 1 mm 算降水日，日降雪 ≥ 1 cm 算降雪日 */
const WET_MM = 1;
const SNOW_CM = 1;

const round = (value, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits;
const mean = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;
function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
const untilNextHour = () => 3_600_000 - (Date.now() % 3_600_000);
const untilNextMinute = () => 60_000 - (Date.now() % 60_000);

// 上次的结果：年份相同、位置没变的片区不重查
const previous = existsSync(OUTPUT) ? await import(OUTPUT.href) : null;
const reusable = previous?.climateYears === YEARS_LABEL ? previous.climate : {};

let lastRequest = 0;
async function archive(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: `${FIRST_YEAR}-01-01`,
    end_date: `${LAST_YEAR}-12-31`,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum",
    timezone: "auto",
  });
  for (let attempt = 1; ; attempt++) {
    await sleep(Math.max(0, lastRequest + SPACING_MS - Date.now()));
    lastRequest = Date.now();
    const res = await fetch(`${API}?${params}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(120_000),
    }).catch(() => null);
    if (res?.ok) return res.json();
    const reason = res ? ((await res.json().catch(() => null))?.reason ?? `HTTP ${res.status}`) : "网络错误";
    if (/daily/i.test(reason)) throw new Error(`Open-Meteo：${reason}（明天再跑，已经查好的片区会沿用）`);
    if ((res && res.status !== 429 && res.status < 500) || attempt >= 6) throw new Error(`Open-Meteo：${reason}`);
    // 超出每小时 / 每分钟的限额：等计数清零（整点后的第一分钟内清零，多等一会儿）
    const wait = /hourly/i.test(reason)
      ? untilNextHour() + 90_000
      : /minutely/i.test(reason)
        ? untilNextMinute() + 5_000
        : 30_000 * attempt;
    console.log(`  ${reason}，${Math.ceil(wait / 1000)} 秒后重试`);
    await sleep(wait);
  }
}

/** 逐日数据 → 12 个月的平均 */
function monthly(daily) {
  const sums = Array.from({ length: 12 }, () => ({ high: 0, low: 0, tempDays: 0, precip: 0, wet: 0, snow: 0 }));
  daily.time.forEach((date, i) => {
    const month = sums[Number(date.slice(5, 7)) - 1];
    const high = daily.temperature_2m_max[i];
    const low = daily.temperature_2m_min[i];
    const precip = daily.precipitation_sum[i];
    const snow = daily.snowfall_sum[i];
    if (high != null && low != null) {
      month.high += high;
      month.low += low;
      month.tempDays++;
    }
    if (precip != null) {
      month.precip += precip;
      if (precip >= WET_MM) month.wet++;
    }
    if (snow != null && snow >= SNOW_CM) month.snow++;
  });
  return sums.map((month) => ({
    high: round(month.high / month.tempDays, 1),
    low: round(month.low / month.tempDays, 1),
    wetDays: round(month.wet / YEARS, 1),
    snowDays: round(month.snow / YEARS, 1),
    precipMm: round(month.precip / YEARS),
  }));
}

const climate = {};

// 每个片区一行，方便看改了哪里；还没查到的片区先用上次的结果，保证文件随时是完整的
function write() {
  const lines = parks.map((park) => {
    const areas = Object.keys(park.areas)
      .map((area) => [area, climate[park.code]?.[area] ?? reusable[park.code]?.[area]])
      .filter(([, value]) => value)
      .map(([area, value]) => `    ${JSON.stringify(area)}: ${JSON.stringify(value)},`);
    return `  ${park.code}: {\n${areas.join("\n")}\n  },`;
  });
  writeFileSync(
    OUTPUT,
    `// 由 scripts/build-climate.mjs 生成，请勿手改。往年同期天气：Open-Meteo 历史数据（ERA5，CC BY 4.0），${YEARS_LABEL} 年逐日数据按月平均。
export interface MonthClimate {
  /** 平均最高、最低气温（°C，1 位小数） */
  high: number;
  low: number;
  /** 平均每月降水日（日降水 ≥ ${WET_MM} mm） */
  wetDays: number;
  /** 平均每月降雪日（日降雪 ≥ ${SNOW_CM} cm） */
  snowDays: number;
  /** 平均月降水量（mm） */
  precipMm: number;
}

export interface AreaClimate {
  lat: number;
  lon: number;
  /** Open-Meteo 返回的海拔（米）：按 90 米分辨率地形取这个点的高度，气温已按这个海拔修正 */
  elevation: number;
  /** 下标 0 是 1 月 */
  months: MonthClimate[];
}

export const climateYears = "${YEARS_LABEL}";

/** 公园 → 园内片区（parks.ts 的 areas 的 key）→ 往年气候 */
export const climate: Record<string, Record<string, AreaClimate>> = {
${lines.join("\n")}
};
`,
  );
}

let fetched = 0;
for (const park of parks) {
  climate[park.code] = {};
  for (const area of Object.keys(park.areas)) {
    const stops = attractions.filter((a) => a.park === park.code && a.area === area);
    if (stops.length === 0) {
      console.log(`${park.code}/${area}: 没有景点，跳过`);
      continue;
    }
    const points = stops.map((a) => a.start ?? a);
    const center = { lat: mean(points.map((p) => p.lat)), lon: mean(points.map((p) => p.lon)) };
    const nearest = points.reduce((best, p) => (distanceKm(p, center) < distanceKm(best, center) ? p : best));
    const lat = round(nearest.lat, 3);
    const lon = round(nearest.lon, 3);
    const old = reusable[park.code]?.[area];
    if (old && distanceKm(old, { lat, lon }) < 1) {
      climate[park.code][area] = old;
      continue;
    }
    const data = await archive(lat, lon);
    const result = { lat, lon, elevation: Math.round(data.elevation), months: monthly(data.daily) };
    climate[park.code][area] = result;
    fetched++;
    write();
    const [jan, jul] = [result.months[0], result.months[6]];
    console.log(
      `${park.code}/${area}: ${result.elevation} m · 1 月 ${jan.low}~${jan.high}°C 雪 ${jan.snowDays} 天 · 7 月 ${jul.low}~${jul.high}°C 雨 ${jul.wetDays} 天`,
    );
  }
}
write();
console.log(`写入往年气候：新查 ${fetched} 个片区，其余沿用`);
