// 按 OpenStreetMap 上的真实步道生成徒步路线：Valhalla 步行路线，允许所有难度的山路
// （雾径、半穹顶这类在 OSM 里标成 mountain_hiking，默认设置会绕开）。
// 输出 src/data/attractions/trails.generated.ts。新增或修改景点的 trail 后重新跑：npm run data:trails
import { writeFileSync } from "node:fs";
import { attractions, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/attractions/trails.generated.ts", import.meta.url);
const VALHALLA = "https://valhalla1.openstreetmap.de/route";
/** 简化路线时允许的偏差（米），地图上看不出区别，数据小很多 */
const SIMPLIFY_METERS = 4;

/** Valhalla 返回精度为 6 位小数的 encoded polyline，解出来是 [经度, 纬度] */
function decodePolyline6(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lon = 0;
  while (index < encoded.length) {
    const deltas = [];
    for (let axis = 0; axis < 2; axis++) {
      let result = 0;
      let shift = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      deltas.push(result & 1 ? ~(result >> 1) : result >> 1);
    }
    lat += deltas[0];
    lon += deltas[1];
    points.push([lon / 1e6, lat / 1e6]);
  }
  return points;
}

/** Douglas–Peucker：按米计算偏差 */
function simplify(points) {
  if (points.length <= 2) return points;
  const lat0 = (points[0][1] * Math.PI) / 180;
  const xy = points.map(([lon, lat]) => [lon * 111320 * Math.cos(lat0), lat * 110540]);
  const distanceToSegment = (p, a, b) => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let max = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = distanceToSegment(xy[i], xy[first], xy[last]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (index > 0 && max > SIMPLIFY_METERS) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const trails = {};
for (const attraction of attractions.filter((a) => a.trail)) {
  const start = attraction.start ?? attraction;
  const via = attraction.trail.via ?? [{ lat: attraction.lat, lon: attraction.lon }];
  const locations = [start, ...via, ...(attraction.trail.loop ? [start] : [])].map(({ lat, lon }) => ({ lat, lon }));

  const res = await fetch(VALHALLA, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT, "Content-Type": "application/json" },
    body: JSON.stringify({
      locations,
      costing: "pedestrian",
      costing_options: { pedestrian: { max_hiking_difficulty: 6 } },
      units: "kilometers",
    }),
  });
  const data = await res.json();
  if (!data.trip) {
    console.warn(`✗ ${attraction.id}: ${data.error ?? JSON.stringify(data).slice(0, 120)}`);
    await sleep(1100);
    continue;
  }

  const path = data.trip.legs.flatMap((leg, i) => decodePolyline6(leg.shape).slice(i === 0 ? 0 : 1));
  const km = Math.round(data.trip.summary.length * 100) / 100;
  trails[attraction.id] = {
    km,
    loop: Boolean(attraction.trail.loop),
    path: simplify(path).map(([lon, lat]) => [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5]),
  };

  // 打印出来核对：路线长度和我们写的步道长度差太多，就说明途经点不对
  const listed = attraction.hike?.distanceMi ? (attraction.hike.distanceMi * 1.609) / (attraction.trail.loop ? 1 : 2) : null;
  const names = [...new Set(data.trip.legs.flatMap((leg) => leg.maneuvers.flatMap((m) => m.street_names ?? [])))];
  console.log(
    `${attraction.id}: ${km} km${listed ? `（资料 ${listed.toFixed(1)} km）` : ""} · ${trails[attraction.id].path.length} 点 · ${names.slice(0, 4).join(" / ")}`,
  );
  await sleep(1100); // 公共服务，控制请求频率
}

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-trails.mjs 生成，请勿手改。路线由 Valhalla 按 OpenStreetMap 步道计算，© OpenStreetMap contributors。
export interface TrailPath {
  /** 路线长度（公里）：单程，环线是一整圈 */
  km: number;
  loop: boolean;
  /** [经度, 纬度] */
  path: [number, number][];
}

export const trails: Record<string, TrailPath> = ${JSON.stringify(trails)};
`,
);
console.log(`写入 ${Object.keys(trails).length} 条步道`);
