import { bryceCanyon } from "./brca";
import { channelIslands } from "./chis";
import { craterLake } from "./crla";
import { denali } from "./dena";
import { deathValley } from "./deva";
import { gallery } from "./gallery.generated";
import { googlePlaces } from "./google";
import { grandCanyon } from "./grca";
import { grandTeton } from "./grte";
import { lassenVolcanic } from "./lavo";
import { mountRainier } from "./mora";
import { northCascades } from "./noca";
import { olympic } from "./olym";
import { redwood } from "./redw";
import { sequoiaKingsCanyon } from "./seki";
import { trails, type TrailPath } from "./trails.generated";
import type { Attraction, GooglePlace, Photo } from "./types";
import { yellowstone } from "./yell";
import { yosemite } from "./yose";
import { zion } from "./zion";

export type { Attraction, AttractionKind, GooglePlace, Hike, Photo, TimeOfDay } from "./types";
export type { TrailPath } from "./trails.generated";

export interface AttractionWithPhoto extends Attraction {
  /** 主图，等于 gallery 第一张 */
  photo?: Photo;
  /** 图集（Wikimedia Commons），最多 6 张 */
  gallery: Photo[];
  /** Google Maps 评分和评论数快照 */
  google?: GooglePlace;
  /** 本公园内按 Google 评论数的热度排名，从 1 开始；游客中心、园外景点和没有 Google 数据的景点不排 */
  hotRank?: number;
  /** 按 OpenStreetMap 步道算出的路线 */
  trailLine?: TrailPath;
}

const withData: AttractionWithPhoto[] = [
  ...yosemite,
  ...sequoiaKingsCanyon,
  ...channelIslands,
  ...redwood,
  ...lassenVolcanic,
  ...craterLake,
  ...mountRainier,
  ...olympic,
  ...northCascades,
  ...yellowstone,
  ...grandTeton,
  ...deathValley,
  ...zion,
  ...bryceCanyon,
  ...grandCanyon,
  ...denali,
].map((attraction) => ({
  ...attraction,
  photo: gallery[attraction.id]?.[0],
  gallery: gallery[attraction.id] ?? [],
  google: googlePlaces[attraction.id],
  trailLine: trails[attraction.id],
}));

// 游客中心人人都会路过，评论多不代表值得专门去；园外的镇子、景点（比如 Jackson 镇广场）也不算公园的热度，都不参与排名
const hotRanks = new Map<string, number>();
for (const park of new Set(withData.map((attraction) => attraction.park))) {
  withData
    .filter(
      (attraction) =>
        attraction.park === park && attraction.google && attraction.kind !== "visitor" && !attraction.outsidePark,
    )
    .sort((a, b) => b.google!.reviews - a.google!.reviews)
    .forEach((attraction, index) => hotRanks.set(attraction.id, index + 1));
}

export const attractions: AttractionWithPhoto[] = withData.map((attraction) => ({
  ...attraction,
  hotRank: hotRanks.get(attraction.id),
}));

export function getParkAttractions(parkCode: string): AttractionWithPhoto[] {
  return attractions.filter((attraction) => attraction.park === parkCode);
}
