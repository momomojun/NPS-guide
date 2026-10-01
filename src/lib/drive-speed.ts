// 车程校正：浏览器里现查的车程（src/lib/osrm-client.ts）和预先生成的车程表（scripts/build-travel.mjs）共用，
// 所以这个文件不引用别的模块（脚本直接用 Node 读）
// OSRM 公共服务开高速的车速偏慢很多：拉斯维加斯到锡安平均才 45 英里/时（实际约 65），盐湖城到摩押、拉斯维加斯到大峡谷
// 也慢 25–40%；山路、园区里的路只慢 5% 左右。所以按平均车速分：平均 40 英里/时以下不改，45 以上（主要走高速）
// 乘 0.77，中间线性过渡。按 7 条常走路线对过（机场到锡安、摩押、大峡谷、优胜美地、黄石、雷尼尔山），误差在 ±10% 以内。
// 平均已经到 54 英里/时以上的，说明 OSRM 用上了路边的限速（比如冰川南边的 2 号公路，原始 63 分钟、实际约 65 分钟），
// 不再缩短；51 到 54 之间逐渐过渡
const SLOW_KMH = 64;
const HIGHWAY_KMH = 72;
const FAST_KMH = 82;
const ACCURATE_KMH = 87;
const HIGHWAY_FACTOR = 0.77;

const ramp = (value: number, from: number, to: number) => Math.min(Math.max((value - from) / (to - from), 0), 1);

/** OSRM 的秒数和米数 → 更接近实际的分钟数 */
export function correctedMinutes(seconds: number, meters: number): number {
  const kmh = seconds > 0 ? meters / 1000 / (seconds / 3600) : 0;
  const highway = ramp(kmh, SLOW_KMH, HIGHWAY_KMH) * (1 - ramp(kmh, FAST_KMH, ACCURATE_KMH));
  return Math.round((seconds / 60) * (1 - highway * (1 - HIGHWAY_FACTOR)));
}
