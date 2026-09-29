// 门票：NPS API 的 feespasses（所有公园一次查完），整理成自驾车（整车）、步行 / 骑行每人、摩托车三种价格，
// 再加一句中文说明：免门票、按人收、真正的花费是船票或州立公园停车费、冬季价、分时段预约等。
// 说明（NOTES）是对照 2026-09-26 查到的原文手写的（落基山、冰川是 09-28，基奈峡湾、兰格尔–圣伊莱亚斯是 09-29）；重新跑时会打印每个公园的原文，有变化就改 NOTES。
// 非居民每人 $100 的附加费不在这里，见 parks.ts 的 nonresidentSurcharge。
// 输出 src/data/fees.generated.ts。重新跑：npm run data:fees
//
// 走 api.data.gov：.env.local 里填了 DATA_GOV_API_KEY 就用，没填用 DEMO_KEY（次数很少，还和网站本身共用），
// 次数用完就等一会儿再查。原始返回在 node_modules/.cache 里存 12 小时，这期间重跑不再请求。
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parks as allParks, sleep, USER_AGENT } from "./load-data.mjs";

// 园外名胜（羚羊谷、马蹄湾……）和加拿大的公园不归 NPS，门票手写在 src/data/fees-manual.ts
const parks = allParks.filter((park) => park.kind !== "site" && park.country !== "CA");

const OUTPUT = new URL("../src/data/fees.generated.ts", import.meta.url);
const CACHE = new URL("../node_modules/.cache/nps-guide/", import.meta.url);
const ENV_FILE = new URL("../.env.local", import.meta.url);
const API = "https://developer.nps.gov/api/v1/feespasses";
const UPDATED = new Date().toLocaleDateString("sv"); // 形如 2026-09-26

if (existsSync(ENV_FILE)) process.loadEnvFile(fileURLToPath(ENV_FILE));
const API_KEY = process.env.DATA_GOV_API_KEY || "DEMO_KEY";

/** 按公园手写的一句说明，没有就不写 */
const NOTES = {
  seki: "红杉和国王峡谷两个公园共用一张门票，7 天内两边都能进，不用预约",
  chis: "公园不收门票；上岛只能坐船，Island Packers 的船票才是主要花费，要提前订",
  redw: "国家公园和三座州立公园都不收门票；Fern Canyon / Gold Bluffs Beach 等部分日用区另收每车 $8–12（Fern Canyon 只收现金或支票），America the Beautiful 年卡可以抵",
  lavo: "冬季（12 月 1 日到次年 4 月 15 日）每车 $10，摩托车、步行 / 骑行也都是 $10",
  crla: "上面是夏季价（5 月中到 10 月底）；11 月到次年 5 月中每车 $20、摩托车 $15",
  romo: "上面是 7 天票；只玩一天可以买 1 天票：每车 $30、步行 / 骑行每人 $15、摩托车 $25",
  glac: "上面是夏季价；11 月到次年 4 月每车 $25、步行 / 骑行每人 $15、摩托车 $20",
  kefj: "公园不收门票；峡湾和潮水冰川只能坐船看，游船票才是主要花费",
  wrst: "公园不收门票；去 Kennecott 的私营接驳车、选矿厂导览和观光飞行另付",
};

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
 * 用 DEMO_KEY 时每个接口每小时只有十来次（按滚动的一小时算）：剩 2 次以下就等自己最早的一次请求满一小时，
 * 给网站本身留一点
 */
async function dataGov(url) {
  if (API_KEY === "DEMO_KEY" && rateRemaining !== null && rateRemaining <= 2) {
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

/** entranceFeeType 形如 "Entrance - Private Vehicle"；商业团体、非居民附加费不算 */
function feeKind(type) {
  if (/commercial|group|non-?resident/i.test(type)) return null;
  if (/private vehicle/i.test(type)) return "vehicle";
  if (/motorcycle/i.test(type)) return "motorcycle";
  if (/per person|individual|walk|bicycle/i.test(type)) return "perPerson";
  return null;
}

// parkCode 可以一次传好几个（逗号分隔）：所有公园 1 次请求查完；万一少了哪个再单独查
const infoByPark = new Map();
const batchUrl = `${API}?parkCode=${parks.map((park) => park.code).join(",")}`;
const batch = await cached("fees-all", batchUrl, () => dataGov(batchUrl));
for (const item of batch.data ?? []) infoByPark.set(item.parkCode, item);
for (const park of parks.filter((p) => !infoByPark.has(p.code))) {
  const url = `${API}?parkCode=${park.code}`;
  const data = await cached(`fees-${park.code}`, url, async () => {
    await sleep(1000);
    return dataGov(url);
  });
  const item = data.data?.find((d) => d.parkCode === park.code);
  if (!item) throw new Error(`NPS API 没有 ${park.code} 的门票数据`);
  infoByPark.set(park.code, item);
}

const parkFees = {};
for (const park of parks) {
  const info = infoByPark.get(park.code);
  const fees = info.fees ?? [];

  // 同一种有好几个价（比如夏季 / 冬季）时取最高的，冬季价写进说明
  const prices = {};
  for (const fee of fees) {
    const kind = feeKind(fee.entranceFeeType ?? "");
    const cost = Number(fee.cost);
    if (kind && Number.isFinite(cost)) prices[kind] = Math.max(prices[kind] ?? 0, cost);
  }
  parkFees[park.code] = {
    vehicle: prices.vehicle ?? 0,
    ...(prices.perPerson != null && { perPerson: prices.perPerson }),
    ...(prices.motorcycle != null && { motorcycle: prices.motorcycle }),
    ...(NOTES[park.code] && { note: NOTES[park.code] }),
  };

  // 打印原文，方便核对 NOTES
  console.log(`\n${park.code}: ${JSON.stringify(parkFees[park.code])}${info.isFeeFreePark ? "（isFeeFreePark）" : ""}`);
  for (const fee of fees) {
    console.log(`  - ${fee.entranceFeeType} $${fee.cost}: ${(fee.description ?? "").replace(/\s+/g, " ").slice(0, 240)}`);
  }
  for (const [key, value] of Object.entries(info)) {
    if (typeof value === "string" && value.trim() && !/url|parkCode|ordinal/i.test(key)) {
      console.log(`  [${key}] ${value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400)}`);
    }
  }
}

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-fees.mjs 生成，请勿手改。门票来自 NPS API（feespasses），${UPDATED} 查。
export interface ParkFees {
  /** 自驾车（含车上所有人），美元；免费的公园为 0 */
  vehicle: number;
  /** 步行 / 骑行，每人 */
  perPerson?: number;
  motorcycle?: number;
  /** 一句中文说明：免费、另有渡船 / 州立公园收费、分时段预约等，没有就不写 */
  note?: string;
}

export const feesUpdated = "${UPDATED}";

export const parkFees: Record<string, ParkFees> = {
${parks.map((park) => `  ${park.code}: ${JSON.stringify(parkFees[park.code])},`).join("\n")}
};
`,
);
console.log(`\n写入 ${parks.length} 个公园的门票（api.data.gov 剩 ${rateRemaining ?? "?"}）`);
