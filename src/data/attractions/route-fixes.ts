// OSRM 对个别砂石路估得太慢，进出这些景点的车程按这里减掉的分钟数修正。
// 车程表（scripts/build-travel.mjs）和浏览器里现查的车程（自定义住处、自动生成攻略的出发地）都用这张表。
export const routeFixes: Record<string, number> = {
  // Cascade River Road 约 37 公里（后半段砂石路），OSRM 按约 13 km/h 算要 174 分钟，实际约 1 小时 20 分
  "noca-cascade-pass": 90,
};

/** 修正后的车程：不低于 5 分钟 */
export function fixedMinutes(minutes: number, ...stopIds: string[]): number {
  const fix = stopIds.reduce((sum, id) => sum + (routeFixes[id] ?? 0), 0);
  return fix ? Math.max(5, minutes - fix) : minutes;
}
