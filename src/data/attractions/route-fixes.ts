// OSRM 对个别砂石路估得太慢，进出这些景点的车程按这里减掉的分钟数修正。
// 车程表（scripts/build-travel.mjs）和浏览器里现查的车程（自定义住处、自动生成攻略的出发地）都用这张表。
export const routeFixes: Record<string, number> = {
  // Cascade River Road 约 37 公里（后半段砂石路），OSRM 按约 13 km/h 算要 174 分钟，实际约 1 小时 20 分
  "noca-cascade-pass": 90,
  // 马蹄峡谷西缘步道口：最后约 50 公里是平整的砂石路，OSRM 从 Green River 算要 573 分钟，实际约 1 小时 40 分
  "cany-horseshoe-canyon": 473,
  // Grand Wash 土路尽头（卡西迪拱门步道口）：从游客中心约 8 公里，OSRM 算 38 分钟，实际约 15–20 分钟
  "care-cassidy-arch": 20,
  // 鲍曼湖：从 West Glacier 经 Camas Road 和砂石路 Outside North Fork Road，OSRM 算约 2 小时 50 分，实际约 1.5–2 小时
  "glac-bowman-lake": 60,
};

/** 修正后的车程：不低于 5 分钟 */
export function fixedMinutes(minutes: number, ...stopIds: string[]): number {
  const fix = stopIds.reduce((sum, id) => sum + (routeFixes[id] ?? 0), 0);
  return fix ? Math.max(5, minutes - fix) : minutes;
}
