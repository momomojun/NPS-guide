import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorRoutes } from "@/components/routes/creator-routes";
import { attractions } from "@/data/attractions";
import { creatorRoutes, creatorsUpdated, type CreatorRoute } from "@/data/creators";
import { parks } from "@/data/parks";
import { hasLocale, type Locale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

export async function generateMetadata({ params }: PageProps<"/[locale]/routes">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).routes.title };
}

/** 博主内容用简体转述，繁体页面转换；视频标题是博主原文，不动 */
function localizeRoute(route: CreatorRoute, locale: Locale): CreatorRoute {
  if (locale === "zh-Hans") return route;
  const t = (text: string) => localize(text, locale);
  return {
    ...route,
    summary: t(route.summary),
    origin: route.origin && t(route.origin),
    visited: route.visited && t(route.visited),
    route: route.route?.map((day) => ({ label: t(day.label), stops: day.stops.map((stop) => (/^[a-z]{4}-/.test(stop) ? stop : t(stop))) })),
    notes: route.notes?.map((note) => ({ ...note, text: t(note.text) })),
    tips: route.tips?.map(t),
  };
}

export default async function RoutesPage({ params }: PageProps<"/[locale]/routes">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.routes;

  // 路线里用到的景点：名字和所在公园
  const used = new Set(creatorRoutes.flatMap((route) => [...(route.route?.flatMap((day) => day.stops) ?? []), ...(route.notes?.map((n) => n.stop) ?? [])]));
  const stopNames = Object.fromEntries(
    attractions.filter((a) => used.has(a.id)).map((a) => [a.id, { nameZh: localize(a.nameZh, locale), park: a.park }]),
  );
  const routeParks = parks
    .filter((park) => creatorRoutes.some((route) => route.parks.includes(park.code)))
    .map((park) => ({ code: park.code, nameZh: localize(park.nameZh, locale) }));

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-14 pb-28 sm:px-10">
      <header className="max-w-3xl">
        <p className="eyebrow text-mute">{t.eyebrow}</p>
        <h1 className="mt-5 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-tight">{t.title}</h1>
        <p className="mt-5 text-sm leading-7 text-ink-soft">{t.intro}</p>
      </header>
      <div className="mt-10">
        <CreatorRoutes
          routes={creatorRoutes.map((route) => localizeRoute(route, locale))}
          parks={routeParks}
          stopNames={stopNames}
          locale={locale}
          text={t}
        />
      </div>
      <p className="mt-16 text-[11px] leading-5 text-mute">{fill(t.source, { date: creatorsUpdated })}</p>
    </div>
  );
}
