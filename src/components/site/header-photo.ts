import "server-only";
import type { HeaderPhoto } from "@/components/site/page-header";
import { attractions } from "@/data/attractions";
import { parks } from "@/data/parks";
import type { Locale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

/** 内页页头用的照片：某个景点的第一张照片，说明写“公园 · 景点” */
export function headerPhoto(id: string, locale: Locale): HeaderPhoto | undefined {
  const attraction = attractions.find((a) => a.id === id);
  const photo = attraction?.photo;
  if (!attraction || !photo) return undefined;
  const park = parks.find((p) => p.code === attraction.park);
  return {
    src: photo.url.replace("/960px-", "/1280px-"),
    href: photo.page,
    credit: fill(getDictionary(locale).attraction.photoCredit, { author: photo.author, license: photo.license }),
    caption: localize([park?.nameZh, attraction.nameZh].filter(Boolean).join(" · "), locale),
  };
}
