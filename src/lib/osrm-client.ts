import { fixedMinutes } from "@/data/attractions/route-fixes";
import { correctedMinutes } from "./drive-speed";

// 浏览器里直接调用 OSRM 公共服务（支持跨域）：加自定义住处时查一次车程表，行程地图上查当天的真实开车路线
const TABLE_URL = "https://router.project-osrm.org/table/v1/driving/";
const ROUTE_URL = "https://router.project-osrm.org/route/v1/driving/";

export interface DrivingRoute {
  /** [经度, 纬度] 折线 */
  path: [number, number][];
  /** 全程公里数，算油费用 */
  km: number;
}

/** 按顺序经过各点的开车路线，coords 形如 "lon,lat;lon,lat" */
export async function drivingRoute(coords: string): Promise<DrivingRoute> {
  const res = await fetch(`${ROUTE_URL}${coords}?overview=full&geometries=geojson`);
  const data = (await res.json()) as {
    code: string;
    routes?: { distance: number; geometry: { coordinates: [number, number][] } }[];
  };
  if (data.code !== "Ok" || !data.routes?.[0]) throw new Error(`OSRM: ${data.code}`);
  return { path: data.routes[0].geometry.coordinates, km: data.routes[0].distance / 1000 };
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
    const res = await fetch(`${TABLE_URL}${coords}?sources=0&annotations=duration,distance`);
    const data = (await res.json()) as { code: string; durations?: (number | null)[][]; distances?: (number | null)[][] };
    if (data.code !== "Ok" || !data.durations) throw new Error(`OSRM: ${data.code}`);
    batch.forEach((destination, k) => {
      const seconds = data.durations![0][k + 1];
      const meters = data.distances?.[0][k + 1];
      if (seconds == null) return;
      const minutes = meters == null ? Math.round(seconds / 60) : correctedMinutes(seconds, meters);
      result[destination.id] = fixedMinutes(minutes, destination.id);
    });
  }
  return result;
}
