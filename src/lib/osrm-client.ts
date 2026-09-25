import { fixedMinutes } from "@/data/attractions/route-fixes";

// 浏览器里直接调用 OSRM 公共服务（支持跨域）：加自定义住处时查一次车程表，行程地图上查当天的真实开车路线
const TABLE_URL = "https://router.project-osrm.org/table/v1/driving/";
const ROUTE_URL = "https://router.project-osrm.org/route/v1/driving/";

/** 按顺序经过各点的开车路线，coords 形如 "lon,lat;lon,lat"；返回 [经度, 纬度] 折线 */
export async function drivingRoute(coords: string): Promise<[number, number][]> {
  const res = await fetch(`${ROUTE_URL}${coords}?overview=full&geometries=geojson`);
  const data = (await res.json()) as {
    code: string;
    routes?: { geometry: { coordinates: [number, number][] } }[];
  };
  if (data.code !== "Ok" || !data.routes?.[0]) throw new Error(`OSRM: ${data.code}`);
  return data.routes[0].geometry.coordinates;
}
const BATCH = 60;

interface Point {
  lat: number;
  lon: number;
}

/** 从 origin 开车到各个目的地的分钟数；路网不通的目的地不出现在结果里 */
export async function drivingMinutesFrom(
  origin: Point,
  destinations: (Point & { id: string })[],
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (let i = 0; i < destinations.length; i += BATCH) {
    const batch = destinations.slice(i, i + BATCH);
    const coords = [origin, ...batch].map((p) => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(";");
    const res = await fetch(`${TABLE_URL}${coords}?sources=0&annotations=duration`);
    const data = (await res.json()) as { code: string; durations?: (number | null)[][] };
    if (data.code !== "Ok" || !data.durations) throw new Error(`OSRM: ${data.code}`);
    batch.forEach((destination, k) => {
      const seconds = data.durations![0][k + 1];
      if (seconds != null) result[destination.id] = fixedMinutes(Math.round(seconds / 60), destination.id);
    });
  }
  return result;
}
