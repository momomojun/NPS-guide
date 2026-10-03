import Link from "next/link";
import type { DarkSky, MediaPick, WorldHeritage } from "@/data/honors";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

/** 公园代码 → 名字和网站上的公园页（没收录的没有 page） */
export type ParkNames = Record<string, { nameZh: string; page?: string }>;

type Text = Dictionary["rankings"];

function ParkLinks({ codes, names, locale, notOnSite }: { codes: string[]; names: ParkNames; locale: string; notOnSite?: string }) {
  return (
    <>
      {codes.map((code, i) => {
        const park = names[code];
        return (
          <span key={code}>
            {i > 0 && "、"}
            {park?.page ? (
              <Link href={`/${locale}/parks/${park.page}`} className="hover:text-clay-700">
                {park.nameZh}
              </Link>
            ) : (
              <span className="text-ink-soft">
                {park?.nameZh ?? code}
                {notOnSite && <span className="ml-1 text-[11px] text-mute">（{notOnSite}）</span>}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

/** 榜单页的媒体推荐：按年份分组，每条写谁选的、条目名、我们概括的理由和原文链接；U.S. News 只列收录了哪些 */
export function PicksSection({
  picks,
  usNews,
  names,
  locale,
  text,
  checked,
}: {
  picks: MediaPick[];
  usNews?: { edition: number; url: string; parks: string[] };
  names: ParkNames;
  locale: string;
  text: Text;
  checked: string;
}) {
  const t = text.picks;
  const editions = [...new Set(picks.map((pick) => pick.edition))].sort((a, b) => b - a);
  return (
    <div>
      <div className="space-y-14">
        {editions.map((edition) => (
          <section key={edition} className="grid gap-x-16 gap-y-5 lg:grid-cols-12">
            <p className="font-serif text-3xl tabular-nums lg:col-span-2">{edition}</p>
            <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2 lg:col-span-10">
              {picks
                .filter((pick) => pick.edition === edition)
                .map((pick) => (
                  <li key={`${pick.outlet}-${pick.title}`} className="border-t border-ink pt-4">
                    <p className="text-xs text-mute">
                      <span className="text-ink-soft">{t.outlets[pick.outlet]}</span> · {t.lists[pick.outlet]} · {t.kinds[pick.kind]}
                    </p>
                    <p className="mt-2 font-serif text-lg leading-snug">
                      <ParkLinks codes={pick.parks} names={names} locale={locale} notOnSite={t.notOnSite} />
                    </p>
                    <p className="mt-1 text-[11px] tracking-[0.06em] text-mute">{pick.title}</p>
                    <p className="mt-3 text-sm leading-7 text-ink-soft">{pick.reasonZh}</p>
                    <a href={pick.url} target="_blank" rel="noreferrer" className="link-line mt-3 inline-block text-xs tracking-[0.1em]">
                      {t.original}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      {usNews && (
        <div className="mt-16 max-w-4xl">
          <h3 className="font-serif text-2xl">{fill(t.usNewsTitle, { year: usNews.edition })}</h3>
          <p className="mt-2 text-xs leading-6 text-mute">
            {fill(t.usNewsIntro, { n: usNews.parks.length, ours: usNews.parks.filter((code) => names[code]?.page).length })}
          </p>
          <p className="mt-4 text-sm leading-8">
            <ParkLinks codes={usNews.parks} names={names} locale={locale} />
          </p>
          <a href={usNews.url} target="_blank" rel="noreferrer" className="link-line mt-3 inline-block text-xs tracking-[0.1em]">
            {t.original}
          </a>
        </div>
      )}
      <p className="mt-12 text-[11px] leading-5 text-mute">{fill(t.checked, { date: checked })}</p>
    </div>
  );
}

/** 榜单页的世界遗产和暗夜公园：同一处世界遗产的几座公园合成一行 */
export function HonorsSection({
  heritage,
  darkSky,
  names,
  locale,
  text,
  checked,
}: {
  heritage: Record<string, WorldHeritage>;
  darkSky: Record<string, DarkSky>;
  names: ParkNames;
  locale: string;
  text: Text;
  checked: string;
}) {
  const t = text.honors;
  // 同一处世界遗产的几座公园合成一行，年份写这处遗产最早列入的那年（冰川湾 1992 年才扩展进去）
  const sites = [...new Set(Object.values(heritage).map((site) => site.url))]
    .map((url) => {
      const codes = Object.keys(heritage).filter((code) => heritage[code].url === url);
      return { site: heritage[codes[0]], codes, year: Math.min(...codes.map((code) => heritage[code].year)) };
    })
    .sort((a, b) => a.year - b.year || a.site.nameEn.localeCompare(b.site.nameEn));
  const usHeritage = Object.keys(heritage).filter((code) => !["banf", "jasp", "yoho"].includes(code)).length;
  const skies = Object.entries(darkSky).sort(([, a], [, b]) => a.year - b.year);

  return (
    <div>
      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <section>
          <h3 className="font-serif text-2xl">{t.heritageTitle}</h3>
          <p className="mt-2 text-xs leading-6 text-mute">{fill(t.heritageIntro, { n: usHeritage })}</p>
          <ul className="mt-5 border-t border-ink">
            {sites.map(({ site, codes, year }) => (
              <li key={site.url} className="flex items-baseline gap-4 border-b border-line py-3">
                <span className="w-12 shrink-0 text-xs text-mute tabular-nums">{year}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base">
                    <ParkLinks codes={codes} names={names} locale={locale} />
                  </p>
                  <a href={site.url} target="_blank" rel="noreferrer" className="mt-0.5 block text-[11px] text-mute hover:text-ink">
                    {site.nameZh} · {site.nameEn}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-serif text-2xl">{t.darkSkyTitle}</h3>
          <p className="mt-2 text-xs leading-6 text-mute">{t.darkSkyIntro}</p>
          <ul className="mt-5 border-t border-ink">
            {skies.map(([code, sky]) => (
              <li key={code} className="flex items-baseline gap-4 border-b border-line py-3">
                <span className="w-12 shrink-0 text-xs text-mute tabular-nums">{sky.year}</span>
                <p className="min-w-0 flex-1 font-serif text-base">
                  <ParkLinks codes={[code]} names={names} locale={locale} />
                  {sky.program === "rasc" && <span className="ml-2 font-sans text-[11px] text-mute">{t.rasc}</span>}
                </p>
                <a href={sky.url} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] text-mute hover:text-ink">
                  {t.source}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-12 text-[11px] leading-5 text-mute">{fill(t.checked, { date: checked })}</p>
    </div>
  );
}
