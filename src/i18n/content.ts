import "server-only";
import type { ParkActivity } from "@/data/activities";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { LodgingOption } from "@/data/lodging";
import type { Park } from "@/data/parks";
import type { Locale } from "./config";
import { localize } from "./convert";

// 景点、公园、住宿的中文内容都用简体撰写，繁体页面在服务端转换后再交给客户端组件

export function localizeAttraction(attraction: AttractionWithPhoto, locale: Locale): AttractionWithPhoto {
  if (locale === "zh-Hans") return attraction;
  const t = (text: string) => localize(text, locale);
  return {
    ...attraction,
    nameZh: t(attraction.nameZh),
    summary: t(attraction.summary),
    tips: attraction.tips?.map(t),
    permit: attraction.permit && t(attraction.permit),
    closedNote: attraction.closedNote && t(attraction.closedNote),
    start: attraction.start && { ...attraction.start, nameZh: t(attraction.start.nameZh) },
  };
}

export function localizePark(park: Park, locale: Locale): Park {
  if (locale === "zh-Hans") return park;
  const t = (text: string) => localize(text, locale);
  return {
    ...park,
    nameZh: t(park.nameZh),
    tagline: t(park.tagline),
    intro: t(park.intro),
    seasonNote: t(park.seasonNote),
    lodgingTip: t(park.lodgingTip),
    areas: Object.fromEntries(Object.entries(park.areas).map(([key, name]) => [key, t(name)])),
    gateway: { ...park.gateway, nameZh: t(park.gateway.nameZh) },
  };
}

export function localizeLodging(option: LodgingOption, locale: Locale): LodgingOption {
  if (locale === "zh-Hans") return option;
  return { ...option, nameZh: localize(option.nameZh, locale), note: localize(option.note, locale) };
}

export function localizeActivity(activity: ParkActivity, locale: Locale): ParkActivity {
  if (locale === "zh-Hans") return activity;
  const t = (text: string) => localize(text, locale);
  return {
    ...activity,
    nameZh: t(activity.nameZh),
    summary: t(activity.summary),
    booking: activity.booking && t(activity.booking),
    status: activity.status && t(activity.status),
  };
}
