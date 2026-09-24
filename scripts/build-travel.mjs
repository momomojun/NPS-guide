// 用 OSRM（OpenStreetMap 路网）预先算好车程表，排行程时直接查表，不在网页里实时调用。
// 每个公园一张表（公园定位点 + 各景点的出发点），外加公园之间的一张表。
// 新增景点后重新跑：node scripts/build-travel.mjs
import { writeFileSync } from "node:fs";
import { attractions, parks, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/attractions/travel.generated.ts", import.meta.url);

async function durationTable(points) {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(";");
  const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=duration`, {
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
  const nodes = ["gateway", ...stops.map((a) => a.id)];
  const points = [park.gateway, ...stops.map((a) => a.start ?? a)];
  parkTravel[park.code] = { nodes, minutes: await durationTable(points) };
  console.log(`${park.code}: ${nodes.length} 个点`);
  await sleep(1100); // OSRM 公共服务要求每秒最多 1 次请求
}

const interParkTravel = {
  nodes: parks.map((p) => p.code),
  minutes: await durationTable(parks.map((p) => p.gateway)),
};

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-travel.mjs 生成，请勿手改。车程（分钟）来自 OSRM，路网数据 © OpenStreetMap contributors。
export interface TravelTable {
  nodes: string[];
  minutes: (number | null)[][];
}

export const parkTravel: Record<string, TravelTable> = ${JSON.stringify(parkTravel)};

export const interParkTravel: TravelTable = ${JSON.stringify(interParkTravel)};
`,
);
console.log("写入车程表");
