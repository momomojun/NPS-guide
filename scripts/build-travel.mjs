// 用 OSRM（OpenStreetMap 路网）预先算好车程表，排行程时直接查表，不在网页里实时调用。
// 每个公园一张表（公园定位点 + 各景点的出发点 + 推荐住宿），外加公园之间的一张表；
// 相邻、常一起玩的公园（parks.ts 的 nearby）再加一张跨公园的表，比如从大提顿的住处直接开到黄石的景点。
// 最后一张是各机场（airports.ts）到各公园定位点的表，自动生成攻略时估算落地后要开多久。
// 新增景点或住宿后重新跑：npm run data:travel
import { writeFileSync } from "node:fs";
import { airports } from "../src/data/airports.ts";
import { fixedMinutes } from "../src/data/attractions/route-fixes.ts";
import { attractions, lodgingOptions, parks, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/attractions/travel.generated.ts", import.meta.url);

/** sources / destinations 是 points 的下标：只算从前者到后者的那一块，不填就是全部两两之间 */
async function durationTable(points, { sources, destinations } = {}) {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(";");
  const subset =
    (sources ? `&sources=${sources.join(";")}` : "") + (destinations ? `&destinations=${destinations.join(";")}` : "");
  const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=duration${subset}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  const data = await res.json();
  if (data.code !== "Ok") throw new Error(`OSRM: ${data.code} ${data.message ?? ""}`);
  // 秒 → 分钟；路网不通时 OSRM 返回 null
  return data.durations.map((row) => row.map((s) => (s == null ? null : Math.round(s / 60))));
}

const parkTravel = {};
for (const park of parks) {
  const stops = attractions.filter((a) => a.park === park.code);
  const stays = lodgingOptions.filter((l) => l.park === park.code);
  const nodes = ["gateway", ...stops.map((a) => a.id), ...stays.map((l) => l.id)];
  const points = [park.gateway, ...stops.map((a) => a.start ?? a), ...stays];
  const minutes = (await durationTable(points)).map((row, i) =>
    row.map((m, j) => (m == null || i === j ? m : fixedMinutes(m, nodes[i], nodes[j]))),
  );
  parkTravel[park.code] = { nodes, minutes };
  console.log(`${park.code}: ${nodes.length} 个点`);
  await sleep(1100); // OSRM 公共服务要求每秒最多 1 次请求
}

const interParkTravel = {
  nodes: parks.map((p) => p.code),
  minutes: await durationTable(parks.map((p) => p.gateway)),
};

// 相邻公园：两边的点合起来查一次，只留 A→B 和 B→A 两块（公园内部的已经在各自的表里）
const pairTravel = {};
for (const park of parks) {
  for (const otherCode of park.nearby ?? []) {
    const other = parks.find((p) => p.code === otherCode);
    const key = [park.code, otherCode].sort().join("|");
    if (!other || pairTravel[key]) continue;
    const [first, second] = key.split("|");
    const nodesOf = (code) => [
      ...attractions.filter((a) => a.park === code).map((a) => ({ id: a.id, point: a.start ?? a })),
      ...lodgingOptions.filter((l) => l.park === code).map((l) => ({ id: l.id, point: l })),
    ];
    const a = nodesOf(first);
    const b = nodesOf(second);
    const table = await durationTable([...a, ...b].map((n) => n.point));
    const fix = (m, from, to) => (m == null ? m : fixedMinutes(m, from, to));
    pairTravel[key] = {
      a: a.map((n) => n.id),
      b: b.map((n) => n.id),
      ab: a.map((from, i) => b.map((to, j) => fix(table[i][a.length + j], from.id, to.id))),
      ba: b.map((from, i) => a.map((to, j) => fix(table[a.length + i][j], from.id, to.id))),
    };
    console.log(`${key}: ${a.length} × ${b.length}`);
    await sleep(1100);
  }
}

// 机场 → 公园定位点：一次查完，只要“从机场出发”这一块
const airportCodes = Object.keys(airports);
const airportTravel = {
  airports: airportCodes,
  parks: parks.map((p) => p.code),
  minutes: await durationTable([...airportCodes.map((code) => airports[code]), ...parks.map((p) => p.gateway)], {
    sources: airportCodes.map((_, i) => i),
    destinations: parks.map((_, j) => airportCodes.length + j),
  }),
};
console.log(`机场: ${airportCodes.length} × ${parks.length}`);

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-travel.mjs 生成，请勿手改。车程（分钟）来自 OSRM，路网数据 © OpenStreetMap contributors。
export interface TravelTable {
  nodes: string[];
  minutes: (number | null)[][];
}

export const parkTravel: Record<string, TravelTable> = ${JSON.stringify(parkTravel)};

export const interParkTravel: TravelTable = ${JSON.stringify(interParkTravel)};

/** 相邻公园之间：ab[i][j] 是从 a[i] 开到 b[j] 的分钟数，ba 反过来 */
export interface PairTable {
  a: string[];
  b: string[];
  ab: (number | null)[][];
  ba: (number | null)[][];
}

export const pairTravel: Record<string, PairTable> = ${JSON.stringify(pairTravel)};

/** 机场到各公园定位点的开车分钟数（OSRM）：minutes[i][j] 是从 airports[i] 开到 parks[j] */
export interface AirportTable {
  airports: string[];
  parks: string[];
  minutes: (number | null)[][];
}

export const airportTravel: AirportTable = ${JSON.stringify(airportTravel)};
`,
);
console.log("写入车程表");
