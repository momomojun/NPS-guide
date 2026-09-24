import type { AttractionKind } from "@/data/attractions/types";

/** 景点类型的颜色，地图标记和列表共用 */
export const KIND_COLORS: Record<AttractionKind, string> = {
  viewpoint: "#d97706",
  hike: "#059669",
  waterfall: "#0284c7",
  grove: "#15803d",
  landmark: "#ea580c",
  drive: "#7c3aed",
  experience: "#db2777",
  visitor: "#475569",
};
