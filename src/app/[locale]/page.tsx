import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContinueTrip } from "@/components/home/continue-trip";
import { ParksOverviewMap } from "@/components/parks-overview-map";
import { AddManyButton } from "@/components/trip/add-many-button";
import { buttonSecondary } from "@/components/ui";
import { getParkAttractions } from "@/data/attractions";
import { parks, regionOrder } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizeAttraction, localizePark } from "@/i18n/content";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatMonths } from "@/i18n/format";

// “本月适合去”按当前月份计算，页面每天重新生成一次
export const revalidate = 86400;

const HERO_ATTRACTION = "yose-tunnel-view";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.home;

  const localParks = parks.map((park) => localizePark(park, locale));
  const parkNames = Object.fromEntries(localParks.map((park) => [park.code, park.nameZh]));
  const heroPhoto = getParkAttractions("yose").find((a) => a.id === HERO_ATTRACTION)?.photo;
  const month = new Date().getMonth() + 1;
  const inSeason = localParks.filter((park) => park.bestMonths.includes(month));

  return (
    <div className="space-y-14">
      <section className="relative isolate -mt-2 overflow-hidden rounded-3xl bg-stone-800">
        {heroPhoto && (
          <Image
            // 主视觉用 1920 宽的缩略图，Wikimedia 支持这一档
            src={heroPhoto.url.replace("/960px-", "/1920px-")}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1248px, 100vw"
            className="-z-10 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="flex min-h-[28rem] flex-col justify-end gap-6 p-6 sm:p-10 lg:min-h-[34rem]">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl leading-tight font-bold sm:text-5xl">{t.heroTitle}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">{t.heroSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/plan`}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-white shadow hover:bg-emerald-400"
              >
                {t.planCta}
              </Link>
              <a
                href="#parks"
                className="rounded-xl bg-white/15 px-5 py-2.5 font-medium text-white backdrop-blur hover:bg-white/25"
              >
                {t.browseCta}
              </a>
            </div>
            <ContinueTrip href={`/${locale}/plan`} parkNames={parkNames} locale={locale} text={t} />
          </div>
        </div>
        {heroPhoto && (
          <a
            href={heroPhoto.page}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-4 text-[10px] text-white/60 hover:text-white"
          >
            {fill(dict.attraction.photoCredit, { author: heroPhoto.author, license: heroPhoto.license })}
          </a>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t.stepsTitle}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {inSeason.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
            <h2 className="text-xl font-semibold">{fill(t.seasonTitle, { month })}</h2>
            <p className="text-sm text-stone-500">{t.seasonHint}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inSeason.map((park) => (
              <li key={park.code}>
                <Link
                  href={`/${locale}/parks/${park.code}`}
                  className="block h-full rounded-2xl border-l-4 border-emerald-500 bg-white p-4 transition hover:shadow-md dark:bg-stone-900"
                >
                  <p className="font-semibold">
                    {park.nameZh} <span className="text-sm font-normal text-stone-500">{park.nameEn}</span>
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{park.seasonNote}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t.mapTitle}</h2>
        <ParksOverviewMap
          locale={locale}
          text={dict.map}
          className="h-80 sm:h-[26rem]"
          // 本土 6 个公园放在一张图上，阿拉斯加单独给个入口，免得地图缩得太小
          parks={localParks
            .filter((park) => park.region !== "alaska")
            .map((park) => ({ code: park.code, name: park.nameZh, lat: park.gateway.lat, lon: park.gateway.lon }))}
        >
          <Link
            href={`/${locale}/parks/dena`}
            className="absolute bottom-10 left-3 rounded-lg bg-white/95 px-3 py-2 text-sm font-medium text-stone-800 shadow hover:bg-white"
          >
            {t.alaska}
          </Link>
        </ParksOverviewMap>
      </section>

      <section id="parks" className="scroll-mt-24 space-y-8">
        <h2 className="text-xl font-semibold">{t.parksTitle}</h2>
        {regionOrder.map((region) => (
          <div key={region}>
            <h3 className="mb-3 text-sm font-semibold text-stone-500">{dict.regions[region]}</h3>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {localParks
                .filter((park) => park.region === region)
                .map((park) => {
                  const parkAttractions = getParkAttractions(park.code).map((a) => localizeAttraction(a, locale));
                  const mustSee = parkAttractions.filter((a) => a.mustSee);
                  const cover = mustSee.find((a) => a.photo)?.photo;
                  return (
                    <li
                      key={park.code}
                      className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
                    >
                      <Link href={`/${locale}/parks/${park.code}`} className="group relative block h-48 bg-stone-200">
                        {cover && (
                          <Image
                            src={cover.url}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                          <p className="text-xl font-bold">{park.nameZh}</p>
                          <p className="text-sm text-white/80">{park.nameEn}</p>
                        </div>
                        {park.nonresidentSurcharge && (
                          <span className="absolute top-3 right-3 rounded-full bg-amber-100/95 px-2 py-0.5 text-xs text-amber-900">
                            {t.nonresident}
                          </span>
                        )}
                      </Link>
                      {cover && (
                        <a
                          href={cover.page}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate px-4 pt-1.5 text-[10px] text-stone-400 hover:text-stone-600"
                        >
                          {fill(dict.attraction.photoCredit, { author: cover.author, license: cover.license })}
                        </a>
                      )}
                      <div className="flex flex-1 flex-col gap-2.5 p-4 pt-2">
                        <p className="line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                          {park.intro}
                        </p>
                        <p className="text-sm">
                          🔥{" "}
                          {fill(t.hottest, {
                            names: parkAttractions
                              .filter((a) => a.hotRank !== undefined)
                              .sort((a, b) => a.hotRank! - b.hotRank!)
                              .slice(0, 3)
                              .map((a) => a.nameZh)
                              .join("、"),
                          })}
                        </p>
                        <p className="text-xs text-stone-500">
                          {fill(t.bestMonths, { months: formatMonths(park.bestMonths, dict.units) })} ·{" "}
                          {fill(t.attractions, { n: parkAttractions.length })} · {t.airports}{" "}
                          {park.airports.join(" · ")}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                          <Link href={`/${locale}/parks/${park.code}`} className={buttonSecondary}>
                            {t.viewPark}
                          </Link>
                          {mustSee.length > 0 && (
                            <AddManyButton
                              ids={mustSee.map((a) => a.id)}
                              label={fill(t.addMustSee, { n: mustSee.length })}
                              doneLabel={t.addedMustSee}
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
