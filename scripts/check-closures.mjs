// 临时关闭核对：拿 NPS 最新的公告和 src/data/closures.ts 逐条对一遍，列出要人工看的地方：
//   1. 公告里新出现的关闭，对到了网站上的景点、但临时关闭数据里还没有的（可能要加）
//   2. 临时关闭数据里还关着、公告里已经找不到对应关闭公告的（可能已经重开，要去公园的 Current Conditions 页面确认）
// 公告是一段英文，不写是哪个景点、哪天重开，所以只列出来、不自动改数据。
// npm run check:closures；JSON=1 只输出 JSON（给定时任务用）。.env.local 里填了 DATA_GOV_API_KEY 就用，没填用 DEMO_KEY。
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tempClosures } from "../src/data/closures.ts";
import { seasonalRoads } from "../src/data/roads.ts";
import { npsCodeOf } from "../src/data/parks.ts";
import { alertsForStop, closedByAlerts } from "../src/lib/alert-match.ts";
import { attractions, parks, sleep, USER_AGENT } from "./load-data.mjs";

const ENV_FILE = new URL("../.env.local", import.meta.url);
if (existsSync(ENV_FILE)) process.loadEnvFile(fileURLToPath(ENV_FILE));
const API_KEY = process.env.DATA_GOV_API_KEY || "DEMO_KEY";
const JSON_ONLY = process.env.JSON === "1";
// 本机的日期（toISOString 是 UTC，美国晚上会算成第二天）
const today = new Date().toLocaleDateString("en-CA");

// 网站的公园代码 → 查 NPS 公告的代码（加拿大的公园、大多数园外名胜查不到）
const codes = new Map(parks.flatMap((park) => (npsCodeOf(park) ? [[park.code, npsCodeOf(park)]] : [])));
const alerts = [];
const failed = [];
const batch = [...codes.entries()];
for (let i = 0; i < batch.length; i += 10) {
  const part = batch.slice(i, i + 10);
  const url = `https://developer.nps.gov/api/v1/alerts?parkCode=${part.map(([, nps]) => nps).join(",")}&limit=500&api_key=${API_KEY}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } }).catch(() => null);
  if (!res?.ok) {
    failed.push(...part.map(([code]) => code));
    continue;
  }
  const data = await res.json();
  for (const alert of data.data ?? []) {
    // 一个 NPS 代码可能对应网站上的几个页面（马蹄湾查的是 glca），都算上
    for (const [code, nps] of part) {
      if (nps === alert.parkCode) alerts.push({ ...alert, park: code, updated: alert.lastIndexedDate });
    }
  }
  await sleep(500);
}

// 1. 公告说关了、对到了景点、数据里没有的
const active = tempClosures.filter((closure) => !closure.reopen || closure.reopen > today);
const known = new Set(active.flatMap((closure) => closure.attractions));
const byStop = closedByAlerts(attractions, alerts);
const fresh = new Map();
for (const [id, alert] of byStop) {
  if (known.has(id)) continue;
  const entry = fresh.get(alert.id) ?? { park: alert.park, title: alert.title, url: alert.url, attractions: [], seasonalRoad: false };
  entry.attractions.push(id);
  fresh.set(alert.id, entry);
}

// 季节性山路上的景点（下雪封了 Trail Ridge Road 这种）：roads.ts 按往年算，近期出发的攻略按实时公告排，一般不用加临时关闭
const onRoads = new Set(seasonalRoads.flatMap((road) => [...road.attractions, ...(road.afterRoad ?? [])]));
// 标题写着 Seasonal 的（大盆地惠勒峰景观道冬季关闭）按景点的开放月份算，也一般不用加
for (const entry of fresh.values()) entry.seasonalRoad = /\bseasonal\b/i.test(entry.title) || entry.attractions.every((id) => onRoads.has(id));

// 2. 数据里还关着、公告里找不到的（长期工程、加拿大的公园不看：公告常常不再提）。
// 公园常把封路写在“危险”“注意”类公告的正文里（巨人柱的 Bajada 环线），所以这里不限类别、正文也看
const closingText = (alert) => /\bclos(ed|ure|ures|ing)\b/i.test(`${alert.title} ${alert.description}`);
const mentioned = new Set(
  attractions.filter((stop) => alertsForStop(stop, alerts.filter(closingText)).length > 0).map((stop) => stop.id),
);
const stale = active
  // 每周固定几天关的（Cades Cove 周三禁车）公告里一般不提，也不看
  .filter((closure) => !closure.longTerm && !closure.weekdays && codes.has(closure.attractions[0].split("-")[0]))
  .filter((closure) => !closure.attractions.some((id) => byStop.has(id) || mentioned.has(id)))
  .map((closure) => ({ attractions: closure.attractions, from: closure.from, reopen: closure.reopen, checked: closure.checked, source: closure.source }));

// 3. 预计重开的日子已经过了的（数据里可以删掉了）
const reopened = tempClosures
  .filter((closure) => closure.reopen && closure.reopen <= today)
  .map((closure) => ({ attractions: closure.attractions, reopen: closure.reopen }));

const report = { date: today, alerts: alerts.length, failed, fresh: [...fresh.values()], stale, reopened };
if (JSON_ONLY) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log(`${today}：读到 ${alerts.length} 条公告${failed.length ? `，没读到 ${failed.join(", ")}` : ""}`);
  console.log(`\n公告里新出现的关闭（数据里还没有）：${report.fresh.length} 条`);
  for (const item of report.fresh) {
    const note = item.seasonalRoad ? "（季节性关闭，一般不用加）" : "";
    console.log(`  [${item.park}] ${item.title}${note}\n    对到：${item.attractions.join(", ")}\n    ${item.url}`);
  }
  console.log(`\n数据里还关着、公告里找不到（可能已经重开）：${stale.length} 处`);
  for (const item of stale) console.log(`  ${item.attractions.join(", ")}（${item.from} 起，${item.checked} 核对）\n    ${item.source}`);
  console.log(`\n预计重开的日子已经过了（可以从数据里删掉）：${reopened.length} 处`);
  for (const item of reopened) console.log(`  ${item.attractions.join(", ")}（${item.reopen} 重开）`);
}
// 有要人工看的就返回 1，定时任务据此决定要不要提醒
process.exitCode = report.fresh.length || stale.length || reopened.length ? 1 : 0;
