import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Planner } from "@/components/plan/planner";
import { attractions } from "@/data/attractions";
import { parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizeAttraction, localizePark } from "@/i18n/content";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[locale]/plan">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).plan.title };
}

// 行程存在浏览器里，页面本身只提供景点和公园数据
export default async function PlanPage({ params }: PageProps<"/[locale]/plan">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <Planner
      locale={locale}
      attractions={attractions.map((a) => localizeAttraction(a, locale))}
      parks={parks.map((source) => {
        const park = localizePark(source, locale);
        return {
          code: park.code,
          nameZh: park.nameZh,
          lat: park.gateway.lat,
          lon: park.gateway.lon,
          timeZone: park.timeZone,
        };
      })}
      text={{ plan: dict.plan, kinds: dict.kinds, units: dict.units, map: dict.map, trip: dict.trip }}
    />
  );
}
