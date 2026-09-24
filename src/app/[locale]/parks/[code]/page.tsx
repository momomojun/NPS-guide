import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttractionsExplorer } from "@/components/attractions/attractions-explorer";
import { AlertsSection } from "@/components/park/alerts-section";
import { ChargersSection } from "@/components/park/chargers-section";
import { FeesSection } from "@/components/park/fees-section";
import { SectionSkeleton } from "@/components/section";
import { Reveal } from "@/components/site/reveal";
import { getParkAttractions } from "@/data/attractions";
import { getPark } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizeAttraction, localizePark } from "@/i18n/content";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatMonths } from "@/i18n/format";
import { isUsingDemoKey } from "@/lib/datagov";

// 不写 generateStaticParams：页面每次请求时渲染，接口数据由 fetch 缓存兜住，
// 这样 build 不会一次性调几十次接口，接口失败也不会把错误页缓存下来。

const container = "mx-auto max-w-[1600px] px-5 sm:px-10";

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
  const heroPhoto = attractions.find((a) => a.id === park.hero)?.photo;

  const facts: [string, string][] = [
    [t.bestSeason, formatMonths(park.bestMonths, dict.units)],
    [t.airports, park.airports.join(" · ")],
    [t.surcharge, park.nonresidentSurcharge ? t.surchargeValue : t.noSurcharge],
    [t.highlights, fill(t.highlightsValue, { n: attractions.length })],
  ];

  return (
    <>
      <section className="relative h-[88svh] min-h-[620px] overflow-hidden bg-ink text-white">
        {heroPhoto && (
          <Image
            // Commons 缩略图换成 1920 宽做全屏大图
            src={heroPhoto.url.replace("/960px-", "/1920px-")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="animate-kenburns object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        <div className={`${container} relative z-10 flex h-full flex-col justify-end pb-10 lg:pb-14`}>
          <nav className="eyebrow flex items-center gap-3 text-white/70">
            <Link href={`/${locale}#parks`} className="hover:text-white">
              {dict.common.allParks}
            </Link>
            <span className="text-white/40">/</span>
            <span>{dict.regions[park.region]}</span>
          </nav>
          <h1 className="mt-7 font-serif text-[clamp(3.2rem,9vw,8rem)] leading-none font-normal tracking-[0.04em]">
            {park.nameZh}
          </h1>
          <p className="eyebrow mt-6 text-white/80">
            {park.nameEn} National Park · {park.stateEn}
          </p>
          <p className="mt-6 max-w-xl font-serif text-xl text-white/85 sm:text-2xl">{park.tagline}</p>
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/25 pt-6 md:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="eyebrow mt-2 text-white/55">{label}</dt>
                <dd className="font-serif text-lg sm:text-xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {heroPhoto && (
          <a
            href={heroPhoto.page}
            target="_blank"
            rel="noreferrer"
            className="absolute right-5 bottom-3 z-10 text-[10px] text-white/45 hover:text-white/80 sm:right-10"
          >
            {fill(dict.attraction.photoCredit, { author: heroPhoto.author, license: heroPhoto.license })}
          </a>
        )}
      </section>

      <section className={`${container} grid gap-12 py-24 lg:grid-cols-12 lg:py-32`}>
        <p className="eyebrow text-mute lg:col-span-3">{t.introTitle}</p>
        <div className="lg:col-span-6">
          <Reveal>
            <p className="font-serif text-[clamp(1.3rem,2vw,1.8rem)] leading-[1.85]">{park.intro}</p>
          </Reveal>
          {park.nonresidentSurcharge && (
            <p className="mt-10 border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">{t.nonresidentNote}</p>
          )}
        </div>
        <aside className="space-y-10 lg:col-span-3">
          <div>
            <p className="eyebrow text-mute">{t.seasonTitle}</p>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{park.seasonNote}</p>
          </div>
          <div>
            <p className="eyebrow text-mute">{t.areasTitle}</p>
            <ul className="mt-4 border-t border-line text-sm">
              {Object.entries(park.areas).map(([key, name]) => (
                <li key={key} className="border-b border-line py-2.5">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="border-t border-line">
        <div className={`${container} py-20 lg:py-28`}>
          <div className="mb-12">
            <p className="eyebrow text-mute">{t.attractionsEyebrow}</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">
              {fill(t.attractionsTitle, { n: attractions.length })}
            </h2>
          </div>
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
        </div>
      </section>

      <section className="bg-paper-deep">
        <div className={`${container} py-20 lg:py-28`}>
          <p className="eyebrow text-mute">{t.infoEyebrow}</p>
          <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{t.infoTitle}</h2>

          {isUsingDemoKey() && (
            <p className="mt-8 max-w-3xl border-l border-mute pl-5 text-xs leading-6 text-mute">
              {dict.common.demoKeyNotice}
            </p>
          )}

          <div className="mt-14 grid items-start gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Suspense fallback={<SectionSkeleton title={t.alerts.title} />}>
                <AlertsSection parkCode={park.code} dict={dict} />
              </Suspense>
            </div>
            <div className="lg:col-span-5">
              <Suspense fallback={<SectionSkeleton title={t.fees.title} />}>
                <FeesSection parkCode={park.code} dict={dict} />
              </Suspense>
            </div>
          </div>
          <div className="mt-20">
            <Suspense fallback={<SectionSkeleton title={t.chargers.title} />}>
              <ChargersSection park={park} dict={dict} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
