import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttractionsExplorer } from "@/components/attractions/attractions-explorer";
import { AlertsSection } from "@/components/park/alerts-section";
import { ChargersSection } from "@/components/park/chargers-section";
import { FeesSection } from "@/components/park/fees-section";
import { Section, SectionSkeleton } from "@/components/section";
import { getParkAttractions } from "@/data/attractions";
import { getPark } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizeAttraction, localizePark } from "@/i18n/content";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { isUsingDemoKey } from "@/lib/datagov";

// 不写 generateStaticParams：页面每次请求时渲染，接口数据由 fetch 缓存兜住，
// 这样 build 不会一次性调几十次接口，接口失败也不会把错误页缓存下来。

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/parks/[code]">): Promise<Metadata> {
  const { locale, code } = await params;
  const park = getPark(code);
  if (!park || !hasLocale(locale)) return {};
  return { title: `${localize(park.nameZh, locale)} ${park.nameEn}` };
}

export default async function ParkPage({ params }: PageProps<"/[locale]/parks/[code]">) {
  const { locale, code } = await params;
  const source = getPark(code);
  if (!source || !hasLocale(locale)) notFound();
  const park = localizePark(source, locale);
  const dict = getDictionary(locale);
  const t = dict.park;
  const attractions = getParkAttractions(park.code).map((a) => localizeAttraction(a, locale));

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Link
          href={`/${locale}`}
          className="text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
        >
          {dict.common.allParks}
        </Link>

        <header>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{dict.regions[park.region]}</p>
          <h1 className="mt-1 text-3xl font-bold">
            {park.nameZh} <span className="text-xl font-normal text-stone-500">{park.nameEn}</span>
          </h1>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
            <div className="flex">
              <dt>{t.gateway}：</dt>
              <dd>{park.gateway.nameZh}</dd>
            </div>
            <div className="flex">
              <dt>{t.airports}：</dt>
              <dd>{park.airports.join(" · ")}</dd>
            </div>
          </dl>
          <p className="mt-4 max-w-4xl leading-relaxed text-stone-700 dark:text-stone-300">{park.intro}</p>
          {park.nonresidentSurcharge && (
            <p className="mt-3 max-w-4xl rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              {t.nonresidentNote}
            </p>
          )}
        </header>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t.attractionsTitle}</h2>
        <AttractionsExplorer
          attractions={attractions}
          areas={park.areas}
          parkNameEn={park.nameEn}
          text={{
            attraction: dict.attraction,
            kinds: dict.kinds,
            difficulty: dict.difficulty,
            timeOfDay: dict.timeOfDay,
            units: dict.units,
            trip: dict.trip,
            map: dict.map,
          }}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">{t.infoTitle}</h2>

        {isUsingDemoKey() && (
          <p className="rounded-lg border border-dashed border-stone-300 p-3 text-xs text-stone-500 dark:border-stone-700">
            {dict.common.demoKeyNotice}
          </p>
        )}

        <Suspense fallback={<SectionSkeleton title={t.alerts.title} />}>
          <AlertsSection parkCode={park.code} dict={dict} />
        </Suspense>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Suspense fallback={<SectionSkeleton title={t.fees.title} />}>
            <FeesSection parkCode={park.code} dict={dict} />
          </Suspense>
          <div className="lg:col-span-2">
            <Suspense fallback={<SectionSkeleton title={t.chargers.title} />}>
              <ChargersSection park={park} dict={dict} />
            </Suspense>
          </div>
        </div>
      </section>

      <Section title={t.upcoming.title}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-stone-400">
          {t.upcoming.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
