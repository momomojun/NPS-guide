import "server-only";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { Park } from "@/data/parks";
import type { Locale } from "./config";
import { localize } from "./convert";

// 景点和公园的中文内容都用简体撰写，繁体页面在服务端转换后再交给客户端组件

export function localizeAttraction(attraction: AttractionWithPhoto, locale: Locale): AttractionWithPhoto {
  if (locale === "zh-Hans") return attraction;
  const t = (text: string) => localize(text, locale);
  return {
    ...attraction,
    nameZh: t(attraction.nameZh),
    summary: t(attraction.summary),
    tips: attraction.tips?.map(t),
    permit: attraction.permit && t(attraction.permit),
    start: attraction.start && { ...attraction.start, nameZh: t(attraction.start.nameZh) },
  };
}

export function localizePark(park: Park, locale: Locale): Park {
  if (locale === "zh-Hans") return park;
  const t = (text: string) => localize(text, locale);
  return {
    ...park,
    nameZh: t(park.nameZh),
    intro: t(park.intro),
    areas: Object.fromEntries(Object.entries(park.areas).map(([key, name]) => [key, t(name)])),
    gateway: { ...park.gateway, nameZh: t(park.gateway.nameZh) },
  };
}
