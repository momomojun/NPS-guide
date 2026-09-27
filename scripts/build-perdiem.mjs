// 住宿、吃饭花费的参考：美国联邦政府出差的住宿和餐饮标准（GSA Per Diem），按推荐住宿所在的县查。
// 每个住处先用 FCC 的人口普查区域接口查它在哪个县，再对 GSA 当年各州的“非标准地区”（按县划分）；
// 不在列表里的县用标准费率（Standard Rate）。阿拉斯加不归 GSA 管，德纳里的住宿不查。
// 输出 src/data/perdiem.generated.ts。新增住宿或每年 10 月 GSA 换新财年后重新跑：npm run data:perdiem
//
// GSA 接口走 api.data.gov：.env.local 里填了 DATA_GOV_API_KEY 就用，没填用 DEMO_KEY（次数很少，次数用完就等一会儿），
// 每个州 1 次，原始返回在 node_modules/.cache 里存 12 小时；查过的县一直沿用（县界不会变）。
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { lodgingOptions, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/perdiem.generated.ts", import.meta.url);
const CACHE = new URL("../node_modules/.cache/nps-guide/", import.meta.url);
const COUNTY_CACHE = new URL("perdiem-counties.json", CACHE);
const ENV_FILE = new URL("../.env.local", import.meta.url);
const GSA = "https://api.gsa.gov/travel/perdiem/v2/rates/state";
const FCC = "https://geo.fcc.gov/api/census/area";
/**
 * 联邦财年从前一年 10 月开始（2026 年 10 月到 2027 年 9 月是 2027 财年）。GSA 一般 8 月公布下一财年，
 * 所以 8 月起先试下一财年（今年 + 1），没公布就退回上一年
 */
const today = new Date();
const LATEST_FY = today.getFullYear() + (today.getMonth() >= 7 ? 1 : 0);

if (existsSync(ENV_FILE)) process.loadEnvFile(fileURLToPath(ENV_FILE));
const API_KEY = process.env.DATA_GOV_API_KEY || "DEMO_KEY";

/** 原始返回存 12 小时：这期间重跑直接用，不重复请求 */
async function cached(label, request, load) {
  const file = new URL(`${label}-${createHash("sha1").update(request).digest("hex").slice(0, 10)}.json`, CACHE);
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < 12 * 3600_000) {
    return JSON.parse(readFileSync(file, "utf8"));
  }
  const data = await load();
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(file, JSON.stringify(data));
  return data;
}

/** 这一小时还剩几次（响应头 X-RateLimit-Remaining），和这次运行里每次请求的时间 */
let rateRemaining = null;
const callTimes = [];
/**
 * api.data.gov：超出次数就等 10 分钟再试，最多等 2 小时。
 * 用 DEMO_KEY 时每个接口每小时只有十来次（按滚动的一小时算）：用完了就等自己最早的一次请求满一小时。
 * 网站本身不调 GSA，不用给它留次数
 */
async function dataGov(url) {
  if (API_KEY === "DEMO_KEY" && rateRemaining !== null && rateRemaining <= 0) {
    const oldest = callTimes.find((time) => Date.now() - time < 3600_000);
    const wait = oldest ? oldest + 3660_000 - Date.now() : 600_000;
    console.log(`  DEMO_KEY 这一小时只剩 ${rateRemaining} 次，等 ${Math.ceil(wait / 60_000)} 分钟`);
    await sleep(wait);
  }
  for (let attempt = 1; ; attempt++) {
    callTimes.push(Date.now());
    const res = await fetch(url, { headers: { "X-Api-Key": API_KEY, "User-Agent": USER_AGENT } });
    if (res.ok) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      rateRemaining = remaining === null ? null : Number(remaining);
      return res.json();
    }
    if (res.status !== 429 || attempt > 12) throw new Error(`api.data.gov ${res.status}: ${await res.text()}`);
    console.log(`  api.data.gov 超出次数限制（${API_KEY === "DEMO_KEY" ? "DEMO_KEY" : "自己的 key"}），10 分钟后重试`);
    await sleep(600_000);
  }
}

/** "Mariposa County" → "mariposa"；GSA 的县名不带 County */
const countyKey = (name) =>
  name
    .toLowerCase()
    .replace(/\b(county|parish|borough|census area|municipality)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- 1. 每个住处在哪个县（FCC） ----

const counties = existsSync(COUNTY_CACHE) ? JSON.parse(readFileSync(COUNTY_CACHE, "utf8")) : {};
const stays = lodgingOptions.filter((stay) => stay.park !== "dena");
for (const stay of stays) {
  const key = `${stay.lat},${stay.lon}`;
  if (counties[key]) continue;
  const res = await fetch(`${FCC}?lat=${stay.lat}&lon=${stay.lon}&format=json`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`FCC ${res.status}: ${stay.id}`);
  const place = (await res.json()).results?.[0];
  if (!place) throw new Error(`FCC 查不到县：${stay.id}（${key}）`);
  counties[key] = { county: place.county_name, state: place.state_code };
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(COUNTY_CACHE, JSON.stringify(counties, null, 1));
  await sleep(300);
}
const countyOf = (stay) => counties[`${stay.lat},${stay.lon}`];

// ---- 2. 各州的 GSA 费率 ----

/** 一个州的全部地区；GSA 还没公布这一财年时返回空数组 */
async function stateRates(state, year) {
  const url = `${GSA}/${state}/year/${year}`;
  const data = await cached(`perdiem-gsa-${state}-${year}`, url, () => dataGov(url));
  return (data.rates ?? []).flatMap((group) => group.rate ?? []);
}

const states = [...new Set(stays.map((stay) => countyOf(stay).state))].sort();
let year = LATEST_FY;
const ratesByState = {};
ratesByState[states[0]] = await stateRates(states[0], year);
if (ratesByState[states[0]].length === 0) {
  year--;
  console.log(`GSA 还没有 ${year + 1} 财年的数据，用 ${year} 财年`);
  ratesByState[states[0]] = await stateRates(states[0], year);
}
for (const state of states.slice(1)) {
  await sleep(1000);
  ratesByState[state] = await stateRates(state, year);
}
console.log(`GSA ${year} 财年：${states.map((s) => `${s} ${ratesByState[s].length} 个地区`).join("，")}（api.data.gov 剩 ${rateRemaining ?? "?"}）`);

/** GSA 的 months 按财年（10 月到次年 9 月）列，每个月带月份号；换成下标 0 = 1 月 */
function calendarMonths(rate) {
  const lodging = new Array(12).fill(null);
  for (const month of rate.months.month) lodging[Number(month.number) - 1] = Number(month.value);
  if (lodging.includes(null)) throw new Error(`GSA 月份不全：${rate.city}`);
  return lodging;
}

/** GSA 的 county 字段可能列好几个县，用逗号、斜杠或 and 分开 */
const gsaCounties = (rate) => (rate.county ?? "").split(/,|\/|;|\band\b|&/i).map(countyKey).filter(Boolean);

const perDiem = {};
for (const stay of stays) {
  const { county, state } = countyOf(stay);
  const rates = ratesByState[state];
  const matches = rates.filter((rate) => rate.standardRate !== "true" && gsaCounties(rate).includes(countyKey(county)));
  const standard = rates.find((rate) => rate.standardRate === "true" || /standard rate/i.test(rate.city ?? ""));
  if (matches.length > 1) console.log(`  ${stay.id}：${county} 对上了好几个地区（${matches.map((r) => r.city).join("、")}），用第一个`);
  const rate = matches[0] ?? standard;
  if (!rate) throw new Error(`${state} 没有标准费率：${stay.id}`);
  perDiem[stay.id] = {
    area: matches[0] ? rate.city : "Standard Rate",
    lodging: calendarMonths(rate),
    meals: Number(rate.meals),
  };
  const { area, lodging, meals } = perDiem[stay.id];
  console.log(`${stay.id}: ${county}, ${state} → ${area} · 住宿 $${Math.min(...lodging)}–${Math.max(...lodging)} · 餐饮 $${meals}`);
}

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-perdiem.mjs 生成，请勿手改。美国联邦出差住宿和餐饮标准（GSA Per Diem API），拿来当住宿、吃饭花费的参考。
export interface PerDiem {
  /** GSA 地区名，比如 "Jackson / Pinedale"；不在列表里的地方用 "Standard Rate" */
  area: string;
  /** 每晚住宿标准（美元，不含税），下标 0 是 1 月 */
  lodging: number[];
  /** 每人每天餐饮和杂费（M&IE，美元） */
  meals: number;
}

export const perDiemYear = ${year}; // 所用的 GSA 财年（${year - 1} 年 10 月到 ${year} 年 9 月）

/** 按住宿 id（lodging.ts） */
export const perDiem: Record<string, PerDiem> = {
${Object.entries(perDiem)
  .map(([id, value]) => `  ${JSON.stringify(id)}: ${JSON.stringify(value)},`)
  .join("\n")}
};
`,
);
console.log(`写入 ${Object.keys(perDiem).length} 个住处的 GSA 标准（${year} 财年）`);
