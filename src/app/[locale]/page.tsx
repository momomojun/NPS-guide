import Link from "next/link";
import { notFound } from "next/navigation";
import { CommonsImage } from "@/components/commons-image";
import { ContinueTrip } from "@/components/home/continue-trip";
import { Hero, type HeroSlide } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { ParkIndex, type ParkIndexItem } from "@/components/home/park-index";
import { WestMap } from "@/components/home/west-map";
import { IconArrowRight } from "@/components/icons";
import { Reveal } from "@/components/site/reveal";
import { buttonLarge } from "@/components/ui";
import { attractions } from "@/data/attractions";
import { alaskaMap, westMap } from "@/data/map.generated";
import { isSite, parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localizePark } from "@/i18n/content";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatMonths } from "@/i18n/format";

// “当季”按当前月份计算，页面每天重新生成一次
export const revalidate = 86400;

const FINAL_PHOTO = "yose-glacier-point";
/** 开场动画依次滚过的公园；最后再加上首屏第一张大图的公园，停在它上面，幕布拉开正好是它 */
const INTRO_PARKS = ["yell", "grca", "crla", "dena"];
const container = "mx-auto max-w-[1600px] px-5 sm:px-10";

const photoOf = (id: string) => attractions.find((attraction) => attraction.id === id)?.photo;
/** Commons 缩略图换成 1920 宽，做全屏大图 */
const large = (url: string) => url.replace("/960px-", "/1920px-");

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.home;

  const localParks = parks.filter((park) => !isSite(park)).map((park) => localizePark(park, locale));
  const localSites = parks.filter(isSite).map((park) => localizePark(park, locale));
  const month = new Date().getMonth() + 1;
  const inSeason = localParks.filter((park) => park.bestMonths.includes(month));
  const credit = (photo: { author: string; license: string }) => fill(t.photoCredit, photo);

  const slides: HeroSlide[] = localParks.flatMap((park) => {
    const photo = photoOf(park.hero);
    if (!photo) return [];
    return [
      {
        code: park.code,
        href: `/${locale}/parks/${park.code}`,
        nameZh: park.nameZh,
        nameEn: park.nameEn,
        stateEn: park.stateEn,
        tagline: park.tagline,
        image: large(photo.url),
        credit: credit(photo),
        creditHref: photo.page,
      },
    ];
  });

  const indexItems: ParkIndexItem[] = localParks.map((park) => ({
    code: park.code,
    href: `/${locale}/parks/${park.code}`,
    nameZh: park.nameZh,
    nameEn: park.nameEn,
    stateEn: park.stateEn,
    region: dict.regions[park.region],
    tagline: park.tagline,
    months: fill(t.bestMonths, { months: formatMonths(park.bestMonths, dict.units) }),
    attractions: fill(t.attractions, { n: attractions.filter((a) => a.park === park.code).length }),
    inSeason: park.bestMonths.includes(month),
    image: photoOf(park.hero)?.url ?? "",
  }));

  const stats = [
    { value: localParks.length, label: t.stats.parks },
    { value: attractions.filter((a) => localParks.some((park) => park.code === a.park)).length, label: t.stats.attractions },
    { value: attractions.filter((a) => a.trailLine).length, label: t.stats.trails },
  ];
  const cityNames = Object.fromEntries(
    [...westMap.cities, ...alaskaMap.cities].map((city) => [city.id, localize(city.nameZh, locale)]),
  );
  const finalPhoto = photoOf(FINAL_PHOTO);

  return (
    <>
      <Intro
        wordmark={dict.site.wordmark}
        tagline={t.introTagline}
        words={[...INTRO_PARKS.filter((code) => code !== slides[0]?.code), ...(slides[0] ? [slides[0].code] : [])]
          .flatMap((code) => localParks.filter((park) => park.code === code))
          .map((park) => ({ zh: park.nameZh, en: park.nameEn }))}
        skipLabel={t.skip}
      />

      <Hero
        slides={slides}
        planHref={`/${locale}/plan`}
        text={{
          eyebrow: t.heroEyebrow,
          title: t.heroTitle,
          subtitle: t.heroSubtitle,
          planCta: t.planCta,
          browseCta: t.browseCta,
          explore: t.explore,
        }}
        aside={
          <ContinueTrip
            href={`/${locale}/plan`}
            parkNames={Object.fromEntries(localParks.map((park) => [park.code, park.nameZh]))}
            locale={locale}
            text={t}
          />
        }
      />

      {/* 关于：一段大字 + 三个数字 */}
      <section className={`${container} py-28 lg:py-44`}>
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="eyebrow text-mute lg:col-span-3">{t.aboutEyebrow}</p>
          <div className="lg:col-span-9">
            <Reveal>
              <p className="font-serif text-[clamp(1.45rem,2.5vw,2.35rem)] leading-[1.75] text-ink">{t.aboutText}</p>
            </Reveal>
            <dl className="mt-20 grid grid-cols-3 border-t border-line">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 120} className="flex flex-col-reverse pt-7 pr-4">
                  <dt className="mt-4 text-sm text-mute">{stat.label}</dt>
                  <dd className="font-serif text-[clamp(2.8rem,6vw,5.5rem)] leading-none">{stat.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 公园目录 */}
      <section id="parks" className={`${container} scroll-mt-16 pb-28 lg:pb-44`}>
        <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12">
          <p className="eyebrow text-mute lg:col-span-3">{t.parksEyebrow}</p>
          <div className="lg:col-span-9">
            <Reveal>
              <h2 className="font-serif text-[clamp(2.2rem,4.5vw,4rem)] leading-tight">{fill(t.parksTitle, { n: localParks.length })}</h2>
            </Reveal>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">{t.parksHint}</p>
          </div>
        </div>
        <ParkIndex items={indexItems} inSeasonLabel={t.inSeason} />
      </section>

      {/* 园外名胜：不归国家公园管的地方，和国家公园分开放 */}
      {localSites.length > 0 && (
        <section id="places" className="scroll-mt-16 border-t border-line bg-paper-deep">
          <div className={`${container} py-24 lg:py-32`}>
            <div className="mb-12 grid gap-6 lg:grid-cols-12">
              <p className="eyebrow text-mute lg:col-span-3">{t.sitesEyebrow}</p>
              <div className="lg:col-span-9">
                <Reveal>
                  <h2 className="font-serif text-[clamp(1.9rem,3.5vw,3rem)] leading-tight">{t.sitesTitle}</h2>
                </Reveal>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">{t.sitesHint}</p>
              </div>
            </div>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {localSites.map((site, i) => {
                const photo = photoOf(site.hero);
                return (
                  <Reveal key={site.code} as="li" delay={(i % 4) * 100}>
                    <Link href={`/${locale}/parks/${site.code}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-ink/10">
                        {photo && (
                          <CommonsImage
                            src={photo.url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
                        <span className="font-serif text-2xl transition-colors duration-500 group-hover:text-clay-700">{site.nameZh}</span>
                        <span className="eyebrow text-mute">{site.nameEn}</span>
                      </p>
                      <p className="mt-2 text-sm text-ink-soft">{site.tagline}</p>
                      {site.agency && <p className="mt-3 text-xs leading-5 text-mute">{site.agency}</p>}
                      <p className="eyebrow mt-4 inline-flex items-center gap-2 text-ink">
                        {t.sitesMore}
                        <IconArrowRight className="transition-transform duration-500 group-hover:translate-x-1" />
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 当季 */}
      {inSeason.length > 0 && (
        <section className="bg-paper-deep">
          <div className={`${container} grid gap-14 py-28 lg:grid-cols-12 lg:py-36`}>
            <div className="lg:col-span-4">
              <p className="eyebrow text-mute">{t.seasonEyebrow}</p>
              <Reveal>
                <p className="mt-8 font-serif text-[clamp(6rem,14vw,11rem)] leading-[0.85] text-clay-700">
                  {String(month).padStart(2, "0")}
                </p>
              </Reveal>
              <h2 className="mt-8 font-serif text-3xl">{fill(t.seasonTitle, { month })}</h2>
              <p className="mt-3 text-sm text-mute">{t.seasonHint}</p>
              <Link
                href={`/${locale}/when`}
                className="link-line mt-8 inline-flex items-center gap-2 text-xs tracking-[0.1em] text-ink"
              >
                {t.seasonMore} <IconArrowRight />
              </Link>
            </div>
            <ul className="grid content-start gap-x-12 sm:grid-cols-2 lg:col-span-8">
              {inSeason.map((park, i) => (
                <Reveal key={park.code} as="li" delay={(i % 2) * 120} className="border-t border-ink/15 py-8">
                  <Link href={`/${locale}/parks/${park.code}`} className="group block">
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-serif text-2xl transition-colors duration-500 group-hover:text-clay-700">
                        {park.nameZh}
                      </span>
                      <span className="eyebrow text-mute">{park.nameEn}</span>
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink-soft">{park.seasonNote}</p>
                    <p className="eyebrow mt-5 inline-flex items-center gap-2 text-ink">
                      {t.explore}
                      <IconArrowRight className="transition-transform duration-500 group-hover:translate-x-1" />
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 怎么用 */}
      <section className={`${container} py-28 lg:py-40`}>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-mute">{t.stepsEyebrow}</p>
            <Reveal>
              <h2 className="mt-8 max-w-sm font-serif text-[clamp(1.9rem,3vw,2.8rem)] leading-snug">{t.stepsTitle}</h2>
            </Reveal>
          </div>
          <ol className="grid gap-12 sm:grid-cols-3 lg:col-span-8">
            {t.steps.map((step, i) => (
              <Reveal key={step.title} as="li" delay={i * 140} className="border-t border-ink pt-7">
                <span className="font-serif text-5xl text-clay-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-serif text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 地图 */}
      <section className="border-t border-line">
        <div className={`${container} grid gap-14 py-28 lg:grid-cols-12 lg:py-40`}>
          <div className="lg:col-span-4">
            <p className="eyebrow text-mute">{t.mapEyebrow}</p>
            <Reveal>
              <h2 className="mt-8 font-serif text-[clamp(1.9rem,3vw,2.8rem)] leading-snug">{t.mapTitle}</h2>
            </Reveal>
            <p className="mt-6 max-w-sm text-sm leading-7 text-ink-soft">{t.mapText}</p>
          </div>
          <Reveal className="lg:col-span-8">
            <WestMap
              parks={localParks.map((park) => ({
                code: park.code,
                href: `/${locale}/parks/${park.code}`,
                nameZh: park.nameZh,
                nameEn: park.nameEn,
              }))}
              cityNames={cityNames}
              alaskaLabel={`Alaska · ${dict.regions.alaska}`}
            />
          </Reveal>
        </div>
      </section>

      {/* 收尾：一张大图 + 开始规划 */}
      <section className="relative h-[82svh] min-h-[540px] overflow-hidden bg-ink text-white">
        {finalPhoto && (
          <CommonsImage src={large(finalPhoto.url)} alt="" fill sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <p className="eyebrow text-white/70">{t.finalEyebrow}</p>
          <Reveal>
            <h2 className="mt-8 font-serif text-[clamp(2.2rem,5vw,4.6rem)] leading-tight">{t.finalTitle}</h2>
          </Reveal>
          <Link href={`/${locale}/plan`} className={`${buttonLarge} mt-12 bg-paper text-ink hover:bg-white`}>
            {t.finalCta}
            <IconArrowRight className="text-base" />
          </Link>
        </div>
        {finalPhoto && (
          <a
            href={finalPhoto.page}
            target="_blank"
            rel="noreferrer"
            className="absolute right-5 bottom-4 z-10 text-[10px] text-white/45 hover:text-white/80 sm:right-10"
          >
            {credit(finalPhoto)}
          </a>
        )}
      </section>
    </>
  );
}
