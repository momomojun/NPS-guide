/** 整个行程的地图上每天一种颜色：砂岩红、松绿、石板蓝、赭黄、紫灰、苔绿、铁锈、湖蓝，和纸色底、墨色字相配 */
const DAY_COLORS = ["#b85f3c", "#3f6f5a", "#2f5f86", "#b08a2e", "#7a5a8c", "#5f7f3a", "#9b4a3a", "#3a7a86"];

export function dayColor(day: number): string {
  return DAY_COLORS[day % DAY_COLORS.length];
}
