// 浏览器里直接调用 OSRM 公共服务（支持跨域），只在加自定义住处时用一次，结果存进行程
const TABLE_URL = "https://router.project-osrm.org/table/v1/driving/";
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
      if (seconds != null) result[destination.id] = Math.round(seconds / 60);
    });
  }
  return result;
}
