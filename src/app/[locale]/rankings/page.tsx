import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HonorsSection, PicksSection, type ParkNames } from "@/components/rankings/honors-sections";
import { ParkTimeline } from "@/components/rankings/park-timeline";
import { VisitsRanking } from "@/components/rankings/visits-ranking";
import { SectionNav } from "@/components/site/section-nav";
import { darkSky, honorsChecked, mediaPicks, usNewsBest, worldHeritage } from "@/data/honors";
import { canadianParks, nationalParks, pendingPark } from "@/data/national-parks";
import { canadaSourceUrl, systemVisits, visitsLastYear } from "@/data/visits.generated";
import { hasLocale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatBig } from "@/i18n/format";
import { parkVisits, visitRanking } from "@/lib/visits";
import { headerPhoto } from "@/components/site/header-photo";
import { PageHeader } from "@/components/site/page-header";

export async function generateMetadata({ params }: PageProps<"/[locale]/rankings">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).rankings.title };
}

const container = "mx-auto max-w-[1600px] px-5 sm:px-10";

export default async function RankingsPage({ params }: PageProps<"/[locale]/rankings">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.rankings;
  const text = (value: string) => localize(value, locale);

  const ranking = visitRanking();
  const total = nationalParks.length;
  const oursUnits = nationalParks.filter((park) => park.page).length;
  const parksVisits = ranking.reduce((sum, park) => sum + park.visits, 0);
  const first = nationalParks[0];
  const latest = nationalParks.at(-1)!;
  const dateOf = (iso: string) =>
    fill(t.timeline.date, { y: iso.slice(0, 4), m: Number(iso.slice(5, 7)), d: Number(iso.slice(8, 10)) });

  const stats: [string, string, string][] = [
    [t.stats.parks, fill(t.stats.parksValue, { n: total }), fill(t.stats.parksNote, { n: oursUnits })],
    [t.stats.first, fill(t.stats.year, { year: first.established.slice(0, 4) }), fill(t.stats.firstNote, { name: text(first.nameZh) })],
    [t.stats.latest, fill(t.stats.year, { year: latest.established.slice(0, 4) }), fill(t.stats.latestNote, { name: text(latest.nameZh) })],
    [
      fill(t.stats.visits, { year: visitsLastYear }),
      formatBig(parksVisits, dict.units),
      fill(t.stats.visitsNote, {
        n: total,
        total: formatBig(systemVisits, dict.units),
        share: Math.round((parksVisits / systemVisits) * 100),
      }),
    ],
  ];

  const canada = canadianParks.map((park) => ({ ...park, visits: parkVisits(park.code) }));
  // 媒体推荐、世界遗产里的公园名字和公园页
  const names: ParkNames = Object.fromEntries([
    ...nationalParks.map((park) => [park.code, { nameZh: text(park.nameZh), ...(park.page ? { page: park.page } : {}) }]),
    ...canadianParks.map((park) => [park.code, { nameZh: text(park.nameZh), page: park.code }]),
  ]);
  const best = usNewsBest;
  const usNews = best && {
    ...best,
    // 按设立时间排，不按名次
    parks: nationalParks.map((park) => park.code).filter((code) => best.parks.includes(code)),
  };
  const checked = dateOf(honorsChecked);
  const hasPicks = mediaPicks.length > 0 || usNews !== undefined;
  const hasHonors = Object.keys(worldHeritage).length > 0 || Object.keys(darkSky).length > 0;
  const canadaYear = canada[0].visits?.lastYear ?? 0;

  return (
    <>
      <div className={`${container} pt-14 pb-14`}>
        <PageHeader
          eyebrow={t.eyebrow}
          title={t.title}
          intro={fill(t.intro, { n: total, ours: oursUnits })}
          photo={headerPhoto("yell-grand-prismatic", locale)}
        />
        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-6 lg:grid-cols-4">
          {stats.map(([label, value, note]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="mt-2 text-xs leading-5 text-mute">
                <span className="eyebrow block text-mute">{label}</span>
                <span className="mt-1 block">{note}</span>
              </dt>
              <dd className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-none">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <SectionNav
        label={t.nav.label}
        items={[
          { id: "visits", label: t.nav.visits },
          { id: "timeline", label: t.nav.timeline },
          ...(hasPicks ? [{ id: "picks", label: t.nav.picks }] : []),
          ...(hasHonors ? [{ id: "honors", label: t.nav.honors }] : []),
        ]}
      />

      <section id="visits" className="scroll-mt-28">
        <div className={`${container} py-20 lg:py-24`}>
          <p className="eyebrow text-mute">{t.visits.eyebrow}</p>
          <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{t.visits.title}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-soft">{fill(t.visits.intro, { year: visitsLastYear })}</p>
          <div className="mt-10">
            <VisitsRanking
              rows={ranking.map((park) => ({
                code: park.code,
                nameZh: text(park.nameZh),
                nameEn: park.nameEn,
                statesZh: text(park.statesZh),
                visits: park.visits,
                previous: park.previous,
                areaKm2: park.areaKm2,
                ...(park.page ? { page: park.page } : {}),
              }))}
              year={visitsLastYear}
              locale={locale}
              text={{ ...t.visits, units: dict.units }}
            />
          </div>
          <p className="mt-8 max-w-4xl text-[11px] leading-5 text-mute">{t.visits.note}</p>
          <a
            href="https://irma.nps.gov/Stats/"
            target="_blank"
            rel="noreferrer"
            className="link-line mt-3 inline-block text-xs tracking-[0.1em]"
          >
            {t.visits.source}
          </a>

          <div className="mt-16 max-w-3xl">
            <h3 className="font-serif text-2xl">{t.visits.canadaTitle}</h3>
            <p className="mt-2 text-xs leading-6 text-mute">
              {fill(t.visits.canadaIntro, { year: canadaYear, next: String(canadaYear + 1).slice(2) })}
            </p>
            <ul className="mt-4 border-t border-ink">
              {canada
                .filter((park) => park.visits)
                .sort((a, b) => b.visits!.latest - a.visits!.latest)
                .map((park) => (
                  <li key={park.code} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                    <Link href={`/${locale}/parks/${park.code}`} className="font-serif text-base hover:text-clay-700">
                      {text(park.nameZh)}
                      <span className="ml-2 font-sans text-[10px] tracking-[0.12em] text-mute uppercase">{park.nameEn}</span>
                    </Link>
                    <span className="text-sm tabular-nums">{formatBig(park.visits!.latest, dict.units)}</span>
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-[11px] leading-5 text-mute">{t.visits.canadaNote}</p>
            <a href={canadaSourceUrl} target="_blank" rel="noreferrer" className="link-line mt-3 inline-block text-xs tracking-[0.1em]">
              {t.visits.canadaSource}
            </a>
          </div>
        </div>
      </section>

      <section id="timeline" className="scroll-mt-28 border-t border-line">
        <div className={`${container} py-20 lg:py-24`}>
          <p className="eyebrow text-mute">{t.timeline.eyebrow}</p>
          <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">
            {fill(t.timeline.title, { year: latest.established.slice(0, 4), name: text(latest.nameZh) })}
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-soft">{t.timeline.intro}</p>
          <div className="mt-12">
            <ParkTimeline
              parks={nationalParks.map((park) => ({
                code: park.code,
                nameZh: text(park.nameZh),
                nameEn: park.nameEn,
                statesZh: text(park.statesZh),
                established: park.established,
                ...(park.page ? { page: park.page } : {}),
              }))}
              locale={locale}
              text={t.timeline}
            />
          </div>
          {pendingPark && (
            <p className="mt-12 max-w-3xl border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">
              {fill(t.timeline.pending, {
                n: total + 1,
                name: text(pendingPark.nameZh),
                state: text(pendingPark.statesZh),
                date: dateOf(pendingPark.passed),
              })}
            </p>
          )}
          <div className="mt-16 max-w-3xl">
            <h3 className="font-serif text-2xl">{t.timeline.canadaTitle}</h3>
            <ul className="mt-4 border-t border-ink">
              {canadianParks.map((park) => (
                <li key={park.code} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                  <Link href={`/${locale}/parks/${park.code}`} className="font-serif text-base hover:text-clay-700">
                    {text(park.nameZh)}
                    <span className="ml-2 font-sans text-[10px] tracking-[0.12em] text-mute uppercase">{park.nameEn}</span>
                  </Link>
                  <span className="text-xs text-mute">
                    {dateOf(park.established)} · {text(park.provinceZh)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-5 text-mute">{t.timeline.canadaNote}</p>
          </div>
          <p className="mt-12 text-[11px] leading-5 text-mute">{t.timeline.source}</p>
        </div>
      </section>

      {hasPicks && (
        <section id="picks" className="scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-24`}>
            <p className="eyebrow text-mute">{t.picks.eyebrow}</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{t.picks.title}</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-soft">{t.picks.intro}</p>
            <div className="mt-12">
              <PicksSection
                picks={mediaPicks.map((pick) => ({ ...pick, reasonZh: text(pick.reasonZh) }))}
                usNews={usNews}
                names={names}
                locale={locale}
                text={t}
                checked={checked}
              />
            </div>
          </div>
        </section>
      )}

      {hasHonors && (
        <section id="honors" className="scroll-mt-28 border-t border-line">
          <div className={`${container} py-20 lg:py-24`}>
            <p className="eyebrow text-mute">{t.honors.eyebrow}</p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-tight">{t.honors.title}</h2>
            <div className="mt-12">
              <HonorsSection
                heritage={Object.fromEntries(
                  Object.entries(worldHeritage).map(([code, site]) => [code, { ...site, nameZh: text(site.nameZh) }]),
                )}
                darkSky={darkSky}
                names={names}
                locale={locale}
                text={t}
                checked={checked}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
