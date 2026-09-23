import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlertsSection } from "@/components/park/alerts-section";
import { ChargersSection } from "@/components/park/chargers-section";
import { FeesSection } from "@/components/park/fees-section";
import { Section, SectionSkeleton } from "@/components/section";
import { getPark } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
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
  const park = getPark(code);
  if (!park || !hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.park;

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}`}
        className="text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
      >
        {dict.common.allParks}
      </Link>

      <header>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{dict.regions[park.region]}</p>
        <h1 className="mt-1 text-3xl font-bold">
          {localize(park.nameZh, locale)}{" "}
          <span className="text-xl font-normal text-stone-500">{park.nameEn}</span>
        </h1>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
          <div className="flex">
            <dt>{t.gateway}：</dt>
            <dd>{localize(park.gateway.nameZh, locale)}</dd>
          </div>
          <div className="flex">
            <dt>{t.airports}：</dt>
            <dd>{park.airports.join(" · ")}</dd>
          </div>
        </dl>
        {park.nonresidentSurcharge && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
            {t.nonresidentNote}
          </p>
        )}
      </header>

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
