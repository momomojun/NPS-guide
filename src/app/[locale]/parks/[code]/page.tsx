import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { AttractionsExplorer } from "@/components/attractions/attractions-explorer";
import { ActivitiesSection } from "@/components/park/activities-section";
import { CommonsImage } from "@/components/commons-image";
import { AlertsSection } from "@/components/park/alerts-section";
import { BookingsSection } from "@/components/park/bookings-section";
import { ChargersSection } from "@/components/park/chargers-section";
import { FeesSection } from "@/components/park/fees-section";
import { ParkProfile } from "@/components/park/park-profile";
import { RoadsSection } from "@/components/park/roads-section";
import { VisitsSection } from "@/components/park/visits-section";
import { SectionSkeleton } from "@/components/section";
import { IconArrowRight } from "@/components/icons";
import { SectionNav } from "@/components/site/section-nav";
import { Reveal } from "@/components/site/reveal";
import { activities } from "@/data/activities";
import { bookingRules } from "@/data/bookings";
import { getParkAttractions } from "@/data/attractions";
import { CelebrityShotItem } from "@/components/attractions/celebrity-shots";
import { celebrityShots } from "@/data/celebrities";
import { creatorRoutes, type CreatorRoute } from "@/data/creators";
import { lodgingOptions } from "@/data/lodging";
import { getPark, isSite, npsCodeOf } from "@/data/parks";
import type { RoadYear } from "@/data/roads";
import { shuttleSystems } from "@/data/shuttles";
import { hasLocale } from "@/i18n/config";
import { localizeActivity, localizeAttraction, localizeCelebrity, localizePark } from "@/i18n/content";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatMonths } from "@/i18n/format";
import { isUsingDemoKey } from "@/lib/datagov";
import { roadsOf } from "@/lib/roads";
import { parkVisits } from "@/lib/visits";
import { tempClosures } from "@/data/closures";
import { weekdaysZh } from "@/lib/closures";

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
  const parkActivities = activities.filter((a) => a.park === park.code).map((a) => localizeActivity(a, locale));
  const parkRoads = roadsOf(park.code).map((road) => ({
    ...road,
    nameZh: localize(road.nameZh, locale),
    noteZh: localize(road.noteZh, locale),
    years: road.years.map(([year, open, close, skip]): RoadYear =>
      skip ? [year, open, close, localize(skip, locale)] : [year, open, close],
    ),
  }));
  // 游客人次（园外名胜没有）
  const visits = parkVisits(park.code);
  // 照片条：Google 评论最多的几处（没有评论数的按必去、原来的顺序），首图那处已经在最上面了，不重复
  const highlights = attractions
    .filter((a) => a.photo && a.kind !== "visitor" && a.id !== park.hero)
    .map((a, i) => ({ a, i }))
    .sort(
      (x, y) =>
        (y.a.google?.reviews ?? 0) - (x.a.google?.reviews ?? 0) ||
        Number(Boolean(y.a.mustSee)) - Number(Boolean(x.a.mustSee)) ||
        x.i - y.i,
    )
    .slice(0, 5)
    .map(({ a }) => a);
  // 还没重开的临时关闭（施工、山洪……），公园页“开放情况”里列出来
  const today = new Date().toISOString().slice(0, 10);
  const parkClosures = tempClosures
    .filter((closure) => closure.attractions.some((id) => attractions.some((a) => a.id === id)))
    .filter((closure) => !closure.reopen || closure.reopen > today)
    .map((closure) => ({
      ids: closure.attractions.filter((id) => attractions.some((a) => a.id === id)),
      reason: localize(closure.reasonZh, locale),
      reopen: closure.reopen,
      checked: closure.checked,
      ...(closure.weekdays ? { weekdays: weekdaysZh(closure.weekdays), from: closure.from } : {}),
    }));
  const hasSeasonInfo =
    parkActivities.length > 0 ||
    attractions.some((a) => a.openMonths) ||
    parkClosures.length > 0 ||
    parkRoads.length > 0 ||
    visits !== null;
  // “适用于”只写没收录的地名会让人以为只管那几处，所以有这一行时把对上的景点和住宿也列上
  const targetName = (id: string) =>
    attractions.find((a) => a.id === id)?.nameZh ?? localize(lodgingOptions.find((l) => l.id === id)?.nameZh ?? id, locale);
  const parkBookings = bookingRules
    .filter((rule) => rule.park === park.code)
    .map((rule) => ({
      ...rule,
      titleZh: localize(rule.titleZh, locale),
      noteZh: localize(rule.noteZh, locale),
      ...(rule.places?.length ? { places: [...rule.targets.map(targetName), ...rule.places] } : {}),
    }));
  const parkShuttles = shuttleSystems
    .filter((system) => system.park === park.code)
    .map((system) => ({
      ...system,
      nameZh: localize(system.nameZh, locale),
      offSeasonZh: system.offSeasonZh && localize(system.offSeasonZh, locale),
      noteZh: system.noteZh && localize(system.noteZh, locale),
      hub: {
        ...system.hub,
        nameZh: localize(system.hub.nameZh, locale),
        parkingZh: system.hub.parkingZh && localize(system.hub.parkingZh, locale),
      },
    }));
  // 旺季早上就停满的停车场：共用一个停车场的几个景点合成一行
  const parkParking = attractions
    .filter((a) => a.parking)
    .reduce<{ id: string; nameZh: string; rule: NonNullable<(typeof attractions)[number]["parking"]> }[]>((rows, a) => {
      const same = rows.find((row) => a.parking!.lot && row.rule.lot === a.parking!.lot);
      if (same) same.nameZh += `、${a.nameZh}`;
      else rows.push({ id: a.id, nameZh: a.nameZh, rule: a.parking! });
      return rows;
    }, []);
  const hasBookings = parkBookings.length > 0 || parkShuttles.length > 0 || parkParking.length > 0;

  const site = isSite(park);
  const canada = park.country === "CA";
  const facts: [string, string][] = [
    [t.bestSeason, formatMonths(park.bestMonths, dict.units)],
    [t.airports, park.airports.join(" · ")],
    site || canada
      ? [t.agency, park.agency ?? ""]
      : [t.surcharge, park.nonresidentSurcharge ? t.surchargeValue : t.noSurcharge],
    [t.highlights, fill(t.highlightsValue, { n: attractions.length })],
  ];

  // 明星同款：能对上景点的按景点的先后排在前面，只知道在这座公园的排后面
  const parkCelebs = celebrityShots
    .filter((shot) => shot.park === park.code)
    .map((shot) => localizeCelebrity(shot, locale))
    .sort((a, b) => Number(!a.attraction) - Number(!b.attraction) || b.date.localeCompare(a.date));
  const parkCreators = creatorRoutes
    .filter((route) => route.parks.includes(park.code))
    .sort((a, b) => b.views - a.views);
  // 公园页只放 4 条：先每种语言挑播放量最高的一条（中文博主排前面），不够再按播放量补；
  // 只有标题的（basis 是 metadata）排到最后
  const byDetail = [...parkCreators.filter((route) => route.basis !== "metadata"), ...parkCreators.filter((route) => route.basis === "metadata")];
  const firstOfLanguage = byDetail.filter((route, i) => byDetail.findIndex((r) => r.language === route.language) === i && route.basis !== "metadata");
  const featuredCreators = [
    ...firstOfLanguage.filter((route) => route.language === "zh"),
    ...firstOfLanguage.filter((route) => route.language !== "zh"),
    ...byDetail.filter((route) => !firstOfLanguage.includes(route)),
  ].slice(0, 4);
  const r = dict.routes;
  // 视频按播放量，图文按阅读量
  const viewsText = (route: CreatorRoute) => {
    const article = route.format === "article";
    return route.views >= 10000
      ? fill(article ? r.readsWan : r.viewsWan, { n: (route.views / 10000).toFixed(1) })
      : fill(article ? r.reads : r.views, { n: route.views });
  };

  return (
    <>
      <section className="relative h-[88svh] min-h-[620px] overflow-hidden bg-ink text-white">
        {heroPhoto && (
          // 从首页公园目录点进来时，目录里那张大图放大成这张首图（同名的 ViewTransition）
          <ViewTransition name={`park-photo-${park.code}`} share="park-morph" default="none">
            <div className="absolute inset-0">
              <CommonsImage
                // Commons 缩略图换成 1920 宽做全屏大图
                src={heroPhoto.url.replace("/960px-", "/1920px-")}
                alt=""
                fill
                priority
                sizes="100vw"
                className="animate-kenburns object-cover"
              />
            </div>
          </ViewTransition>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        <div className={`${container} relative z-10 flex h-full flex-col justify-end pb-10 lg:pb-14`}>
          <nav className="eyebrow flex items-center gap-3 text-white/70">
            <Link href={`/${locale}${site ? "#places" : "#parks"}`} className="hover:text-white">
              {site ? dict.common.sites : dict.common.allParks}
            </Link>
            <span className="text-white/40">/</span>
            <span>{dict.regions[park.region]}</span>
          </nav>
          <h1 className="mt-7 font-serif text-[clamp(3.2rem,9vw,8rem)] leading-none font-normal tracking-[0.04em]">
            {park.nameZh}
          </h1>
          <p className="eyebrow mt-6 text-white/80">
            {site ? park.nameEn : `${park.nameEn} National Park`} · {park.stateEn}
            {canada && " · Canada"}
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

      <SectionNav
        label={t.nav.label}
        items={[
          { id: "overview", label: t.nav.overview },
          ...(hasSeasonInfo ? [{ id: "activities", label: t.nav.activities }] : []),
          ...(hasBookings ? [{ id: "bookings", label: t.nav.bookings }] : []),
          { id: "attractions", label: t.nav.attractions },
          ...(parkCreators.length > 0 ? [{ id: "creators", label: t.nav.creators }] : []),
          ...(parkCelebs.length > 0 ? [{ id: "celebs", label: t.nav.celebs }] : []),
          { id: "live", label: t.nav.live },
        ]}
        actions={
          <Link
            href={`/${locale}/plan?park=${park.code}`}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-xs tracking-[0.12em] text-paper transition-colors hover:bg-clay-700"
          >
            {t.nav.generate}
          </Link>
        }
      />

      <section id="overview" className={`${container} grid scroll-mt-32 gap-12 py-24 lg:grid-cols-12 lg:py-32`}>
        <p className="eyebrow text-mute lg:col-span-3">{t.introTitle}</p>
        <div className="lg:col-span-6">
          <Reveal>
            <p className="font-serif text-[clamp(1.3rem,2vw,1.8rem)] leading-[1.85]">{park.intro}</p>
          </Reveal>
          {canada && (
            <div className="mt-10 border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">
              <p className="eyebrow text-clay-700">{t.canadaTitle}</p>
              <p className="mt-2">{t.canadaNote}</p>
            </div>
          )}
          {park.nonresidentSurcharge && (
            <div className="mt-10 border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">
              <p className="eyebrow text-clay-700">{t.nonresidentTitle}</p>
              <p className="mt-2">{t.nonresidentNote}</p>
              <p className="mt-2">{t.nonresidentWaiver}</p>
              <a
                href="https://www.nps.gov/aboutus/nonresident-fees.htm"
                target="_blank"
                rel="noreferrer"
                className="link-line mt-3 inline-block text-xs text-mute"
              >
                {t.nonresidentSource}
              </a>
            </div>
          )}
        </div>
        <aside className="space-y-10 lg:col-span-3">
          <div>
            <p className="eyebrow text-mute">{t.seasonTitle}</p>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{park.seasonNote}</p>
          </div>
          <ParkProfile code={park.code} visits={visits} locale={locale} dict={dict} />
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

      {/* 照片条：几处最热门的景点，点了跳到下面的景点卡片 */}
      {highlights.length >= 3 && (
        <section className="border-t border-line">
          <div className={`${container} py-20 lg:py-28`}>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-14">
              <div>
                <p className="eyebrow text-mute">{t.highlightsEyebrow}</p>
                <h2 className="mt-5 font-serif text-[clamp(1.9rem,3vw,2.8rem)] leading-tight">{t.highlightsTitle}</h2>
              </div>
              <a href="#attractions" className="link-line inline-flex items-center gap-2 text-xs tracking-[0.1em]">
                {fill(t.highlightsAll, { n: attractions.length })} <IconArrowRight />
              </a>
            </div>
            <ol className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 sm:-mx-10 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-8 lg:overflow-visible lg:px-0">
              {highlights.map((a, i) => (
                <li key={a.id} className={`w-[64vw] shrink-0 snap-start sm:w-[36vw] lg:w-auto ${i % 2 ? "lg:mt-16" : ""}`}>
                  <a href={`#attraction-${a.id}`} className="group block">
                    <Reveal image delay={i * 90} className="relative aspect-[3/4] overflow-hidden bg-paper-deep">
                      <CommonsImage
                        src={a.photo!.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 36vw, 64vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Reveal>
                    <p className="mt-4 flex items-baseline gap-3">
                      <span className="font-serif text-sm text-clay-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-serif text-xl transition-colors duration-500 group-hover:text-clay-700">{a.nameZh}</span>
                    </p>
                    <p className="eyebrow mt-1.5 text-mute">{a.nameEn}</p>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {hasSeasonInfo && (
        <section id="activities" className="cv-auto [--cv-h:3000px] scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-28`}>
            <p className="eyebrow mb-12 text-mute">{t.activities.eyebrow}</p>
            <ActivitiesSection activities={parkActivities} attractions={attractions} closures={parkClosures} dict={dict} />
            {visits && <VisitsSection visits={visits} locale={locale} dict={dict} />}
            {parkRoads.length > 0 && <RoadsSection roads={parkRoads} attractions={attractions} dict={dict} />}
          </div>
        </section>
      )}

      {hasBookings && (
        <section id="bookings" className="cv-auto [--cv-h:2000px] scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-28`}>
            <p className="eyebrow mb-12 text-mute">{t.bookings.eyebrow}</p>
            <BookingsSection
              rules={parkBookings}
              shuttles={parkShuttles}
              parking={parkParking}
              planHref={`/${locale}/plan?park=${park.code}`}
              dict={dict}
            />
          </div>
        </section>
      )}

      <section id="attractions" className="scroll-mt-28 border-t border-line">
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
            imagery={canada ? "eox" : "usgs"}
            routesHref={`/${locale}/routes?park=${park.code}`}
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

      {parkCreators.length > 0 && (
        <section id="creators" className="cv-auto [--cv-h:1500px] scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-28`}>
            <p className="eyebrow text-mute">{r.parkEyebrow}</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{r.parkTitle}</h2>
            <ul className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {featuredCreators.map((route) => (
                <li key={route.id} className="border-t border-ink pt-4">
                  <p className="text-xs text-mute">
                    <span className="text-ink-soft">{route.creator}</span> · {r.platforms[route.platform]}
                    {route.format === "article" && ` ${r.article}`} · {r.languages[route.language]} · {viewsText(route)}
                    {route.days ? ` · ${fill(r.days, { n: route.days })}` : ""}
                  </p>
                  <a href={route.url} target="_blank" rel="noreferrer" className="mt-2 block font-serif text-lg leading-snug hover:text-clay-700">
                    {route.title}
                  </a>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">{localize(route.summary, locale)}</p>
                  <Link href={`/${locale}/routes?park=${park.code}#${route.id}`} className="link-line mt-3 inline-block text-xs text-mute">
                    {r.route} · {fill(r.notes, { n: route.notes?.length ?? 0 })}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/routes?park=${park.code}`} className="link-line mt-12 inline-flex items-center gap-2 text-xs tracking-[0.1em]">
              {fill(r.parkMore, { n: parkCreators.length })} <IconArrowRight />
            </Link>
          </div>
        </section>
      )}

      {parkCelebs.length > 0 && (
        <section id="celebs" className="cv-auto [--cv-h:1500px] scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-28`}>
            <p className="eyebrow text-mute">{t.celebsEyebrow}</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{t.celebsTitle}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">{t.celebsText}</p>
            <ul className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {parkCelebs.map((shot) => {
                const stop = shot.attraction ? attractions.find((a) => a.id === shot.attraction) : undefined;
                return (
                  <li key={shot.id} className="border-t border-ink pt-4">
                    {stop && (
                      <a href={`#attraction-${stop.id}`} className="eyebrow mb-2 block text-mute hover:text-clay-700">
                        {stop.nameZh}
                      </a>
                    )}
                    <CelebrityShotItem shot={shot} text={dict} />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <section id="live" className="cv-auto [--cv-h:1500px] scroll-mt-28 bg-paper-deep">
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
                <AlertsSection parkCode={npsCodeOf(park)} officialUrl={park.officialUrl} dict={dict} locale={locale} />
              </Suspense>
            </div>
            <div className="lg:col-span-5">
              <Suspense fallback={<SectionSkeleton title={t.fees.title} />}>
                <FeesSection parkCode={park.code} npsCode={npsCodeOf(park)} dict={dict} />
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
