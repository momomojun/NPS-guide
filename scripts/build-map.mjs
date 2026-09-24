// 首页的线描地图：美国西南（6 个公园）+ 阿拉斯加小图（德纳里）。
// 州界来自 Natural Earth（公共领域），按 Albers 等积圆锥投影、化简后输出 SVG 路径，
// 公园和参考城市的位置也一起投影好。
// 输出 src/data/map.generated.ts。重新跑：npm run data:map
import { writeFile } from "node:fs/promises";
import { parks, USER_AGENT } from "./load-data.mjs";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson";
const OUTPUT = new URL("../src/data/map.generated.ts", import.meta.url);
const WIDTH = 1000;
const TOLERANCE = 0.8;

const CITIES = [
  { id: "sf", nameZh: "旧金山", nameEn: "San Francisco", lat: 37.7749, lon: -122.4194, map: "west" },
  { id: "la", nameZh: "洛杉矶", nameEn: "Los Angeles", lat: 34.0522, lon: -118.2437, map: "west" },
  { id: "lv", nameZh: "拉斯维加斯", nameEn: "Las Vegas", lat: 36.1699, lon: -115.1398, map: "west" },
  { id: "slc", nameZh: "盐湖城", nameEn: "Salt Lake City", lat: 40.7608, lon: -111.891, map: "west" },
  { id: "phx", nameZh: "凤凰城", nameEn: "Phoenix", lat: 33.4484, lon: -112.074, map: "west" },
  // 阿拉斯加小图只标安克雷奇：费尔班克斯离德纳里太近，标签会挤在一起
  { id: "anc", nameZh: "安克雷奇", nameEn: "Anchorage", lat: 61.2181, lon: -149.9003, map: "alaska" },
];

const VIEWS = {
  west: {
    projection: { lon0: -116, lat0: 37, lat1: 33, lat2: 41 },
    states: ["California", "Nevada", "Utah", "Arizona", "Oregon", "Idaho", "Wyoming", "Colorado", "New Mexico"],
    /** 视野按这几个州的范围取，其余州只露出边缘 */
    focus: ["California", "Nevada", "Utah", "Arizona"],
    labels: { California: "CALIFORNIA", Nevada: "NEVADA", Utah: "UTAH", Arizona: "ARIZONA" },
    margin: 0.04,
  },
  alaska: {
    projection: { lon0: -152, lat0: 63, lat1: 55, lat2: 65 },
    states: ["Alaska"],
    focus: ["Alaska"],
    labels: { Alaska: "ALASKA" },
    margin: 0.05,
    /** 去掉阿留申群岛和东南狭长地带的小岛，只画本土 */
    keep: (ring) => {
      // 本土西端（威尔士王子角）在 -168°，阿留申群岛还跨过了 180° 经线，所以按平均经度筛
      const meanLon = ring.reduce((sum, [lon]) => sum + lon, 0) / ring.length;
      return meanLon > -166 && meanLon < -129 && ring.length > 20;
    },
  },
};

const rad = Math.PI / 180;

function albers({ lon0, lat0, lat1, lat2 }) {
  const n = (Math.sin(lat1 * rad) + Math.sin(lat2 * rad)) / 2;
  const c = Math.cos(lat1 * rad) ** 2 + 2 * n * Math.sin(lat1 * rad);
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(lat0 * rad)) / n;
  return (lon, lat) => {
    const theta = n * (lon - lon0) * rad;
    const rho = Math.sqrt(c - 2 * n * Math.sin(lat * rad)) / n;
    // SVG 的 y 轴向下
    return [rho * Math.sin(theta), -(rho0 - rho * Math.cos(theta))];
  };
}

function simplify(points, tolerance) {
  if (points.length <= 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    const [ax, ay] = points[start];
    const [bx, by] = points[end];
    const length = Math.hypot(bx - ax, by - ay);
    let worst = -1;
    let worstDistance = 0;
    for (let i = start + 1; i < end; i++) {
      const [px, py] = points[i];
      // 闭合的环首尾是同一个点，这时按到该点的距离算
      const distance =
        length === 0
          ? Math.hypot(px - ax, py - ay)
          : Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
      if (distance > worstDistance) {
        worst = i;
        worstDistance = distance;
      }
    }
    if (worstDistance > tolerance) {
      keep[worst] = 1;
      stack.push([start, worst], [worst, end]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function ringsOf(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

/** 面积加权的中心，用来放州名 */
function centroid(ring) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  return [cx / (3 * area), cy / (3 * area)];
}

const round = (value) => Math.round(value * 10) / 10;

console.log("下载 Natural Earth 州界…");
const response = await fetch(SOURCE, { headers: { "User-Agent": USER_AGENT } });
if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}`);
const geojson = await response.json();
const usStates = new Map(
  geojson.features
    .filter((feature) => feature.properties.admin === "United States of America")
    .map((feature) => [feature.properties.name, feature.geometry]),
);

const output = {};
for (const [viewId, view] of Object.entries(VIEWS)) {
  const project = albers(view.projection);
  const projected = new Map();
  for (const name of view.states) {
    const geometry = usStates.get(name);
    if (!geometry) throw new Error(`找不到州：${name}`);
    const rings = ringsOf(geometry).filter((ring) => (view.keep ? view.keep(ring) : true));
    projected.set(name, rings.map((ring) => ring.map(([lon, lat]) => project(lon, lat))));
  }

  // 按重点州的范围定视野，再缩放到 WIDTH 宽
  const focusPoints = view.focus.flatMap((name) => projected.get(name).flat());
  let minX = Math.min(...focusPoints.map(([x]) => x));
  let maxX = Math.max(...focusPoints.map(([x]) => x));
  let minY = Math.min(...focusPoints.map(([, y]) => y));
  let maxY = Math.max(...focusPoints.map(([, y]) => y));
  const padX = (maxX - minX) * view.margin;
  const padY = (maxY - minY) * view.margin;
  minX -= padX;
  maxX += padX;
  minY -= padY;
  maxY += padY;
  const scale = WIDTH / (maxX - minX);
  const height = Math.round((maxY - minY) * scale);
  const toView = ([x, y]) => [(x - minX) * scale, (y - minY) * scale];

  const states = [];
  const labels = [];
  for (const [name, rings] of projected) {
    const viewRings = rings.map((ring) => simplify(ring.map(toView), TOLERANCE)).filter((ring) => ring.length > 3);
    const d = viewRings
      .map((ring) => `M${ring.map(([x, y]) => `${round(x)},${round(y)}`).join("L")}Z`)
      .join("");
    states.push({ name, focus: view.focus.includes(name), d });
    if (view.labels[name]) {
      const largest = viewRings.reduce((a, b) => (b.length > a.length ? b : a));
      const [x, y] = centroid(largest);
      labels.push({ text: view.labels[name], x: round(x), y: round(y) });
    }
  }

  const place = (lon, lat) => toView(project(lon, lat)).map(round);
  const parkPoints = Object.fromEntries(
    parks
      .filter((park) => (viewId === "alaska") === (park.region === "alaska"))
      .map((park) => [park.code, place(park.gateway.lon, park.gateway.lat)]),
  );
  const cities = CITIES.filter((city) => city.map === viewId).map(({ id, nameZh, nameEn, lat, lon }) => {
    const [x, y] = place(lon, lat);
    return { id, nameZh, nameEn, x, y };
  });

  output[viewId] = { width: WIDTH, height, states, labels, parks: parkPoints, cities };
  console.log(`${viewId}: ${WIDTH}×${height}，${states.length} 个州，路径 ${states.reduce((n, s) => n + s.d.length, 0)} 字符`);
}

await writeFile(
  OUTPUT,
  `// 由 scripts/build-map.mjs 生成，请勿手改。州界：Natural Earth（公共领域）

export interface MapView {
  width: number;
  height: number;
  states: { name: string; focus: boolean; d: string }[];
  labels: { text: string; x: number; y: number }[];
  /** 公园代码 → [x, y] */
  parks: Record<string, [number, number]>;
  cities: { id: string; nameZh: string; nameEn: string; x: number; y: number }[];
}

export const westMap: MapView = ${JSON.stringify(output.west)};

export const alaskaMap: MapView = ${JSON.stringify(output.alaska)};
`,
);
console.log(`已写入 ${OUTPUT.pathname}`);
