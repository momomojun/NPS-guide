import { bryceCanyon } from "./brca";
import { denali } from "./dena";
import { deathValley } from "./deva";
import { grandCanyon } from "./grca";
import { photos } from "./photos.generated";
import { sequoiaKingsCanyon } from "./seki";
import type { Attraction, Photo } from "./types";
import { yosemite } from "./yose";
import { zion } from "./zion";

export type { Attraction, AttractionKind, Hike, Photo, TimeOfDay } from "./types";

export interface AttractionWithPhoto extends Attraction {
  photo?: Photo;
}

export const attractions: AttractionWithPhoto[] = [
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
}));

export function getParkAttractions(parkCode: string): AttractionWithPhoto[] {
  return attractions.filter((attraction) => attraction.park === parkCode);
}
