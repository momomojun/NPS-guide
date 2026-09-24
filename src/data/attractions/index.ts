import { bryceCanyon } from "./brca";
import { denali } from "./dena";
import { deathValley } from "./deva";
import { googlePlaces } from "./google";
import { grandCanyon } from "./grca";
import { photos } from "./photos.generated";
import { sequoiaKingsCanyon } from "./seki";
import { trails, type TrailPath } from "./trails.generated";
import type { Attraction, GooglePlace, Photo } from "./types";
import { yosemite } from "./yose";
import { zion } from "./zion";

export type { Attraction, AttractionKind, GooglePlace, Hike, Photo, TimeOfDay } from "./types";
export type { TrailPath } from "./trails.generated";

export interface AttractionWithPhoto extends Attraction {
  photo?: Photo;
  /** Google Maps 评分和评论数快照 */
  google?: GooglePlace;
  /** 本公园内按 Google 评论数的热度排名，从 1 开始；游客中心和没有 Google 数据的景点不排 */
  hotRank?: number;
  /** 按 OpenStreetMap 步道算出的路线 */
  trailLine?: TrailPath;
}

const withData: AttractionWithPhoto[] = [
  ...yosemite,
  ...sequoiaKingsCanyon,
  ...deathValley,
  ...zion,
  ...bryceCanyon,
  ...grandCanyon,
  ...denali,
].map((attraction) => ({
  ...attraction,
  photo: attraction.photoFile ? photos[attraction.photoFile] : undefined,
  google: googlePlaces[attraction.id],
  trailLine: trails[attraction.id],
}));

// 游客中心人人都会路过，评论多不代表值得专门去，不参与热度排名
const hotRanks = new Map<string, number>();
for (const park of new Set(withData.map((attraction) => attraction.park))) {
  withData
    .filter((attraction) => attraction.park === park && attraction.google && attraction.kind !== "visitor")
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
