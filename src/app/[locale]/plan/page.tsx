import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Planner } from "@/components/plan/planner";
import { attractions } from "@/data/attractions";
import { lodgingOptions } from "@/data/lodging";
import { parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizeAttraction, localizeLodging, localizePark } from "@/i18n/content";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[locale]/plan">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).plan.title };
}

// 行程存在浏览器里，页面本身只提供景点、公园和住宿数据
export default async function PlanPage({ params }: PageProps<"/[locale]/plan">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-14 pb-28 sm:px-10">
      <Planner
      locale={locale}
      attractions={attractions.map((a) => localizeAttraction(a, locale))}
      lodgingOptions={lodgingOptions.map((option) => localizeLodging(option, locale))}
      parks={parks.map((source) => {
        const park = localizePark(source, locale);
        return {
          code: park.code,
          nameZh: park.nameZh,
          nameEn: park.nameEn,
          lat: park.gateway.lat,
          lon: park.gateway.lon,
          timeZone: park.timeZone,
        };
      })}
      text={{ plan: dict.plan, kinds: dict.kinds, units: dict.units, map: dict.map, trip: dict.trip }}
      />
    </div>
  );
}
