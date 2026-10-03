// 游客人次：美国 63 座国家公园按 NPS 的游客统计（IRMA Visitor Use Statistics，Recreation Visits），
// 加拿大落基山 3 座按 Parks Canada 的开放数据（按财年：4 月到次年 3 月）。
// 输出 src/data/visits.generated.ts。每年 NPS 公布上一年的数字以后（一般是二三月）重新跑：npm run data:visits
//
// NPS：irmaservices.nps.gov 的 stats 接口按月给 1979 年以来每个单位的人次（不用 key），一次查 8 个单位。
//   每年的人次就是 12 个月加起来，和 NPS 每年的新闻稿对得上（2025 年黄石 4,762,988）。
//   每个月平均每天多少人：最近 3 年里每年各月占全年的比例取平均，再乘最近一年的总数、除以当月天数。
//   按比例平均，是因为有的公园改过统计方法，某一年整体高一截（红木 2025 年翻了一倍），直接平均人数会被拉偏；
//   某个月的比例不到 3 年中位数的一半（政府停摆闭园、山火封路，比如卡尔斯巴德洞窟 2025 年 10 月是 0）就不算那年的这个月。
// Parks Canada：open.canada.ca 上每个财年一个数据集（2001–02 到 2018–19 合在一个表里），用 CKAN 接口按标题找。
import { writeFileSync } from "node:fs";
import { canadianParks, nationalParks } from "../src/data/national-parks.ts";
import { sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/visits.generated.ts", import.meta.url);
const NPS_API = "https://irmaservices.nps.gov/v3/rest/stats/visitation";
const CKAN = "https://open.canada.ca/data/api/action/package_search";
const FIRST_YEAR = 1979;
/** 按月算人多不多用最近几年 */
const MONTH_YEARS = 3;
/** 某年某个月的比例不到这几年中位数的这么多，算那个月出了状况（闭园、封路），不算进平均 */
const ANOMALY = 0.5;
/** 北瀑布国家公园的人次只算公园本身，20 号公路、Diablo 湖一带在 Ross Lake 国家休闲区，Stehekin 在 Chelan 湖国家休闲区 */
const EXTRA_UNITS = ["rola", "lach"];
const DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(120_000),
    }).catch(() => null);
    if (res?.ok) return res.json();
    if (attempt >= 4) throw new Error(`${url}：${res ? `HTTP ${res.status}` : "网络错误"}`);
    await sleep(5_000 * attempt);
  }
}

// 最近一个完整的年份：去年 12 月有数字就用去年，不然用前年
const thisYear = new Date().getFullYear();
const probe = await getJson(`${NPS_API}?unitCodes=YELL&startMonth=12&startYear=${thisYear - 1}&endMonth=12&endYear=${thisYear - 1}`);
const LAST_YEAR = probe.some((row) => row.RecreationVisitors > 0) ? thisYear - 1 : thisYear - 2;
const YEARS = LAST_YEAR - FIRST_YEAR + 1;

// 单位 → "年-月" → 人次
const monthly = new Map();
const units = [...nationalParks.map((park) => park.code), ...EXTRA_UNITS];
for (let i = 0; i < units.length; i += 8) {
  const batch = units.slice(i, i + 8);
  const params = `unitCodes=${batch.join(",").toUpperCase()}&startMonth=1&startYear=${FIRST_YEAR}&endMonth=12&endYear=${LAST_YEAR}`;
  const rows = await getJson(`${NPS_API}?${params}`);
  for (const row of rows) {
    const code = row.UnitCode.toLowerCase();
    if (!monthly.has(code)) monthly.set(code, new Map());
    monthly.get(code).set(`${row.Year}-${row.Month}`, row.RecreationVisitors);
  }
  console.log(`NPS：${batch.join(", ")}`);
  await sleep(1_000);
}

const valueOf = (code, year, month) => monthly.get(code)?.get(`${year}-${month}`);
/** 每年的人次；这一年一个月的数字都没有（阿拉斯加几座 1982 年才开始统计）是 null */
const annualOf = (code) =>
  Array.from({ length: YEARS }, (_, i) => {
    const year = FIRST_YEAR + i;
    const months = Array.from({ length: 12 }, (_, m) => valueOf(code, year, m + 1)).filter((v) => v !== undefined);
    return months.length ? months.reduce((sum, v) => sum + v, 0) : null;
  });

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** 每个月平均每天多少人（见文件开头的算法） */
function dailyOf(code, annual) {
  const years = Array.from({ length: MONTH_YEARS }, (_, i) => LAST_YEAR - i);
  const totals = years.map((year) => annual[year - FIRST_YEAR] ?? 0);
  if (totals.some((total) => total <= 0)) return null;
  const shares = years.map((year, y) =>
    Array.from({ length: 12 }, (_, m) => (valueOf(code, year, m + 1) ?? 0) / totals[y]),
  );
  const average = Array.from({ length: 12 }, (_, m) => {
    const values = shares.map((share) => share[m]);
    const typical = median(values);
    const kept = values.filter((value) => value >= typical * ANOMALY);
    return kept.reduce((sum, v) => sum + v, 0) / kept.length;
  });
  const sum = average.reduce((a, b) => a + b, 0);
  return average.map((share, m) => Math.round(((share / sum) * totals[0]) / DAYS[m]));
}

// NPS 管的所有地方（国家公园以外还有纪念地、休闲区……）这一年加起来
const systemRows = await getJson(`https://irmaservices.nps.gov/v3/rest/stats/total/${LAST_YEAR}`);
const systemVisits = systemRows.reduce((sum, row) => sum + row.RecreationVisitors, 0);

const annualVisits = {};
const dailyByMonth = {};
for (const code of units) {
  annualVisits[code] = annualOf(code);
  if (!EXTRA_UNITS.includes(code)) dailyByMonth[code] = dailyOf(code, annualVisits[code]);
}

// Parks Canada：每个财年一个数据集，英文的 CSV
const search = await getJson(`${CKAN}?q=${encodeURIComponent('title:"Parks Canada attendance"')}&rows=50`);
const canada = Object.fromEntries(canadianParks.map((park) => [park.code, new Map()]));
const placeOf = Object.fromEntries(canadianParks.map((park) => [`${park.nameEn} National Park`, park.code]));
const parseNumber = (cell) => {
  const n = Number(cell.replace(/[",]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};
/** 最近一个财年的数据集页面，页面上给来源链接 */
let canadaSource = { year: 0, url: "" };
for (const dataset of search.result.results) {
  const resource = dataset.resources.find(
    (r) => /csv/i.test(r.format) && (r.language ?? []).includes("en") && /attendance/i.test(r.url),
  );
  if (!resource) continue;
  const url = resource.url.startsWith("/") ? `https://open.canada.ca${resource.url}` : resource.url;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`Parks Canada ${url}：HTTP ${res.status}`);
  // 有的文件开头带 BOM、不是 UTF-8，这里只用到英文地名和数字，按 latin1 读就行
  const text = new TextDecoder("latin1").decode(await res.arrayBuffer()).replace(/^ï»¿/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  // 表头：Place,2001-02,2002-03,… 或者 Place,2024-25 FY Attendance
  const years = lines[0].split(",").slice(1).map((cell) => Number(cell.match(/(\d{4})/)?.[1]));
  const latest = Math.max(...years.filter(Boolean));
  if (latest > canadaSource.year) canadaSource = { year: latest, url: `https://open.canada.ca/data/en/dataset/${dataset.id}` };
  for (const line of lines.slice(1)) {
    const cells = line.match(/("[^"]*"|[^,]*)(,|$)/g).map((cell) => cell.replace(/,$/, ""));
    const code = placeOf[cells[0].replace(/"/g, "").trim()];
    if (!code) continue;
    years.forEach((year, i) => {
      const value = parseNumber(cells[i + 1] ?? "");
      if (year && value) canada[code].set(year, value);
    });
  }
  console.log(`Parks Canada：${dataset.title_translated?.en ?? dataset.title}`);
}
const canadaYears = [...canada.banf.keys()];
const CANADA_FIRST = Math.min(...canadaYears);
const CANADA_LAST = Math.max(...canadaYears);
const canadaVisits = Object.fromEntries(
  Object.entries(canada).map(([code, byYear]) => [
    code,
    Array.from({ length: CANADA_LAST - CANADA_FIRST + 1 }, (_, i) => byYear.get(CANADA_FIRST + i) ?? null),
  ]),
);

/** 数组按每行不超过 112 个字符折行，和 roads.generated.ts 一样 */
function wrapped(key, values) {
  const cells = values.map((value) => (value === null ? "null" : String(value)));
  const lines = [];
  for (const cell of cells) {
    const line = lines.at(-1);
    if (line !== undefined && line.length + cell.length + 2 <= 112) lines[lines.length - 1] = `${line} ${cell},`;
    else lines.push(`${cell},`);
  }
  const single = `  ${key}: [${cells.join(", ")}],`;
  return single.length <= 120 ? single : `  ${key}: [\n${lines.map((line) => `    ${line}`).join("\n")}\n  ],`;
}

const dailyYears = `${LAST_YEAR - MONTH_YEARS + 1}–${LAST_YEAR}`;
writeFileSync(
  OUTPUT,
  `// 由 scripts/build-visits.mjs 生成，不要手改（npm run data:visits）。
// 美国：NPS 游客统计（IRMA Visitor Use Statistics 的 Recreation Visits，美国政府数据）；
// 加拿大：Parks Canada attendance（open.canada.ca，Open Government Licence – Canada），按财年（4 月到次年 3 月）。

/** 每年人次从这一年开始（下标 0） */
export const visitsFirstYear = ${FIRST_YEAR};
/** 最近一个完整的年份 */
export const visitsLastYear = ${LAST_YEAR};
/** 这一年 NPS 管的所有地方（400 多处）一共多少人次 */
export const systemVisits = ${systemVisits};

/** NPS 单位代码 → 每年的游客人次；null 是那年还没有统计。rola、lach 是北瀑布旁边的两个国家休闲区 */
export const annualVisits: Record<string, (number | null)[]> = {
${Object.entries(annualVisits)
  .map(([code, values]) => wrapped(code, values))
  .join("\n")}
};

/** 每个月平均每天多少人次（下标 0 是 1 月）：${dailyYears} 年各月的比例平均，按 ${LAST_YEAR} 年的总数折算 */
export const dailyYears = "${dailyYears}";
export const dailyByMonth: Record<string, number[]> = {
${Object.entries(dailyByMonth)
  .filter(([, values]) => values)
  .map(([code, values]) => wrapped(code, values))
  .join("\n")}
};

/** Parks Canada：财年开始的那一年（${CANADA_LAST} 是 ${CANADA_LAST}–${String(CANADA_LAST + 1).slice(2)} 财年）→ 人次，下标 0 是 ${CANADA_FIRST} */
export const canadaFirstYear = ${CANADA_FIRST};
/** 最近一个财年的数据集（来源链接） */
export const canadaSourceUrl = "${canadaSource.url}";
export const canadaVisits: Record<string, (number | null)[]> = {
${Object.entries(canadaVisits)
  .map(([code, values]) => wrapped(code, values))
  .join("\n")}
};
`,
);
const top = Object.entries(annualVisits)
  .filter(([code]) => !EXTRA_UNITS.includes(code))
  .map(([code, values]) => [code, values.at(-1) ?? 0])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
console.log(`写入 ${LAST_YEAR} 年：${top.map(([code, n]) => `${code} ${n.toLocaleString("en-US")}`).join("、")}……`);
console.log(`加拿大 ${CANADA_FIRST}–${CANADA_LAST} 财年：班夫 ${canadaVisits.banf.at(-1)?.toLocaleString("en-US")}`);
