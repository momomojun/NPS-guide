// 季节性道路历年的开通、关闭日期：优胜美地的 Tioga Road、冰川点路（NPS 历年表 CSV），冰川的向阳大道洛根山口段
// （NPS 历年表网页），华盛顿州的 Chinook、Cayuse 山口和 20 号公路（WSDOT 历年表网页）；
// 历年表里还没有的最近几年、不是积雪造成的年份（疫情封园、修路、风暴毁路）在下面的 FIXES 里手工补。
// 输出 src/data/roads.generated.ts；路名、说明、要走这条路的景点写在 src/data/roads.ts。
// 每年秋天路都关了以后重新跑，今年的日期先补进 FIXES：npm run data:roads
import { writeFileSync } from "node:fs";
import { USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/roads.generated.ts", import.meta.url);
/** 只留这一年以后的（行程按最近 20 个正常年份算，公园页画最近 15 年） */
const FIRST_YEAR = 2000;
const SOURCES = {
  yose: "https://www.nps.gov/common/uploads/sortable_dataset/yose/3100211F-F070-1219-7FB48285E8D08EFB/yose-Websitesortabledataelementsheetsroadscampgroundstrails-CopyRoads.csv",
  glac: "https://www.nps.gov/glac/learn/news/logan-pass-opening-and-closing-dates.htm",
  wsdot: "https://wsdot.wa.gov/travel/roads-bridges/mountain-pass-closure-and-opening-dates",
};

/**
 * 手工修正，按顺序套用。[路, 年份, 开通日, 关闭日]：整行换掉（没有这一年就加上）；
 * [路, 年份, "skip", 原因]：这一年保留，但不算进往年统计。
 */
const FIXES = [
  // 优胜美地：2020 年疫情封园到 6 月 11 日；冰川点路 2022 年修路整年没开、2023 年修路晚开；2026 年的开通日期
  ["yose-tioga-road", 2020, "skip", "疫情封园到 6 月 11 日"],
  ["yose-glacier-point-road", 2020, "skip", "疫情封园到 6 月 11 日"],
  ["yose-glacier-point-road", 2022, "skip", "整年修路没开"],
  ["yose-glacier-point-road", 2023, "skip", "修路晚开"],
  ["yose-tioga-road", 2026, "05-15", null],
  ["yose-glacier-point-road", 2026, "05-09", null],
  // 冰川：几年修路只开一侧，关闭日期取 Logan Pass 还能从另一侧开到的那天；2013 年政府停摆提前关，不算关闭；
  // 2020 年疫情晚开、东段整年没通
  ["glac-logan-pass", 2011, "07-13", "10-17"],
  ["glac-logan-pass", 2012, "06-19", "10-15"],
  ["glac-logan-pass", 2013, "06-21", null],
  ["glac-logan-pass", 2014, "07-02", "10-20"],
  ["glac-logan-pass", 2015, "06-19", "10-19"],
  ["glac-logan-pass", 2017, "06-28", "10-09"],
  ["glac-logan-pass", 2020, "skip", "疫情晚开，东段整年没通"],
  // 2023 年起历年表没更新：开通日期按 NPS 新闻稿；关闭日期按当地新闻（2023 年照常在 10 月第三个周一前的周日关，
  // 2024 年 10 月 17 日因结冰提前关、原定 20 日，2025 年 10 月 14 日下雪提前关）
  ["glac-logan-pass", 2023, "06-13", "10-15"],
  ["glac-logan-pass", 2024, "06-22", "10-17"],
  ["glac-logan-pass", 2025, "06-16", "10-14"],
  ["glac-logan-pass", 2026, "06-22", null],
  // 雷尼尔山两个山口：2019 年秋天临时封过几天，取最后关闭的日子；Cayuse 2007 年冬季风暴毁路到 9 月底才开；
  // 2026 年 5 月 22 日一起重开（WSDOT 新闻稿）
  ["mora-chinook-pass", 2019, "05-23", "11-21"],
  ["mora-cayuse-pass", 2019, "05-23", "11-21"],
  ["mora-cayuse-pass", 2007, "skip", "冬季风暴毁路"],
  ["mora-chinook-pass", 2026, "05-22", null],
  ["mora-cayuse-pass", 2026, "05-22", null],
  // 北瀑布：2026 年春天西段抢修，4 月 30 日只开了东段，6 月 14 日全线通车
  ["noca-north-cascades-highway", 2026, "06-14", null],
];

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n) => String(n).padStart(2, "0");

/** 一个格子里所有的日期（"May 26"、"Oct. 24"、"18-May"、"June 4"），按出现顺序 */
function datesIn(text) {
  const out = [];
  // 月份名前后可能粘着别的字（"May 23reopened"、"temporaryNov. 21"），所以按月份名本身找
  const pattern =
    /(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?!\d)|\b(\d{1,2})-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi;
  for (const m of String(text ?? "").matchAll(pattern)) {
    const month = MONTHS[(m[1] ?? m[4]).toLowerCase()];
    const day = Number(m[2] ?? m[3]);
    if (month && day >= 1 && day <= 31) out.push(`${pad(month)}-${pad(day)}`);
  }
  return out;
}
const first = (text) => datesIn(text)[0] ?? null;
const last = (text) => datesIn(text).at(-1) ?? null;
const didNotOpen = (text) => /did not open/i.test(String(text ?? ""));

/** 网页里的表格 → 每行的格子文字 */
function tables(html) {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(([table]) =>
    [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].map(([row]) =>
      [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) =>
        cell[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(),
      ),
    ),
  );
}

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

const history = {};

// ---- 优胜美地：Tioga Road、冰川点路（CSV：年份, 备注, Tioga 开, Tioga 关, 冰川点开, 冰川点关, …；平均值、中位数那几行没有年份）
{
  const lines = (await get(SOURCES.yose)).replace(/^﻿/, "").split(/\r?\n/);
  const tioga = [];
  const glacierPoint = [];
  for (const cells of lines.slice(1).map((line) => line.split(","))) {
    const year = Number(cells[0]);
    if (!Number.isInteger(year) || year < 1900) continue;
    const [, , tOpen, tClose, gOpen, gClose] = cells;
    if (first(tOpen) || didNotOpen(tOpen)) tioga.push([year, didNotOpen(tOpen) ? null : first(tOpen), first(tClose)]);
    if (first(gOpen) || didNotOpen(gOpen)) glacierPoint.push([year, didNotOpen(gOpen) ? null : first(gOpen), first(gClose)]);
  }
  history["yose-tioga-road"] = tioga;
  history["yose-glacier-point-road"] = glacierPoint;
}

// ---- 冰川：Logan Pass（第二张表，每行几组“年份, 开通, 关闭, 注”）
{
  const rows = tables(await get(SOURCES.glac))[1] ?? [];
  const list = [];
  for (const row of rows) {
    for (let k = 0; k + 2 < row.length; k += 4) {
      const [year, open, close] = row.slice(k, k + 3);
      if (/^\d{4}$/.test(year) && first(open)) list.push([Number(year), first(open), first(close)]);
    }
  }
  history["glac-logan-pass"] = list;
}

// ---- WSDOT：三张表依次是 Chinook Pass（SR 410）、Cayuse Pass（SR 123）、North Cascades Highway（SR 20）
{
  const [chinook, cayuse, sr20] = tables(await get(SOURCES.wsdot));
  const parse = (rows = []) =>
    rows
      .map(([year, open, close]) => [Number(year), first(open), last(close)])
      .filter(([year, open]) => Number.isInteger(year) && open);
  history["mora-chinook-pass"] = parse(chinook);
  history["mora-cayuse-pass"] = parse(cayuse);
  history["noca-north-cascades-highway"] = parse(sr20);
}

for (const [id, year, open, close] of FIXES) {
  const list = history[id];
  if (!list) throw new Error(`没有这条路：${id}`);
  const index = list.findIndex((row) => row[0] === year);
  if (open === "skip") {
    if (index < 0) throw new Error(`${id} 没有 ${year} 年，不能标不算统计`);
    list[index] = [...list[index].slice(0, 3), close];
  } else if (index >= 0) list[index] = [year, open, close];
  else list.push([year, open, close]);
}

const lines = [];
for (const [id, list] of Object.entries(history)) {
  const years = list.filter(([year]) => year >= FIRST_YEAR).sort((a, b) => b[0] - a[0]);
  if (years.length < 20) throw new Error(`${id} 只读到 ${years.length} 年，页面格式可能变了`);
  console.log(`${id.padEnd(30)} ${years.length} 年  ${years[0].join(" ")} … ${years.at(-1).join(" ")}`);
  // 一行放几年，和手写的风格一样不超过约 120 列
  const cells = years.map((row) => JSON.stringify(row).replaceAll(",", ", "));
  const wrapped = [];
  for (const cell of cells) {
    const line = wrapped.at(-1);
    if (line !== undefined && line.length + cell.length + 2 <= 112) wrapped[wrapped.length - 1] = `${line} ${cell},`;
    else wrapped.push(`${cell},`);
  }
  lines.push(`  ${JSON.stringify(id)}: [\n${wrapped.map((line) => `    ${line}`).join("\n")}\n  ],`);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  OUTPUT,
  `// 由 scripts/build-roads.mjs 生成，不要手改（npm run data:roads）。
// 每项是 [年份, 开通日, 关闭日, 不算统计的原因]，说明见 src/data/roads.ts。
import type { RoadYear } from "./roads";

export const roadsChecked = ${JSON.stringify(today)};

export const roadYears: Record<string, RoadYear[]> = {
${lines.join("\n")}
};
`,
);
console.log(`→ ${OUTPUT.pathname}`);
