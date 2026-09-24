import type { AttractionKind } from "@/data/attractions/types";

/** 景点类型的颜色，地图标记和列表共用；取自岩石、植被、水的低饱和色，和纸色底搭 */
export const KIND_COLORS: Record<AttractionKind, string> = {
  viewpoint: "#b8793a",
  hike: "#5d6b3f",
  waterfall: "#3f6b82",
  grove: "#2f5140",
  landmark: "#a04c2e",
  drive: "#6b5a7a",
  experience: "#9c4a5c",
  visitor: "#77716a",
};
