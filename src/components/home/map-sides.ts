/** 公园名在圆点的哪一侧 */
export type Side = "left" | "right" | "below" | "above";

/** 首选的一侧放不下（压到别的圆点、名字，或者出了地图）时，按这个顺序换 */
export const SIDES: Side[] = ["right", "left", "below", "above"];

/** 名字的方框放在圆点各侧时的样式（地图挤的时候 MapDeclutter 会换成别的一侧） */
export const LABEL_CLASS: Record<Side, string> = {
  right: "absolute whitespace-nowrap left-6 top-1/2 -translate-y-1/2",
  left: "absolute whitespace-nowrap right-6 top-1/2 -translate-y-1/2 text-right",
  below: "absolute whitespace-nowrap top-6 left-1/2 -translate-x-1/2 text-center",
  above: "absolute whitespace-nowrap bottom-6 left-1/2 -translate-x-1/2 text-center",
};
