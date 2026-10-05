import Link from "next/link";
import { googleSnapshotDate } from "@/data/attractions/google";
import { isSite, parks, regionOrder } from "@/data/parks";
import type { Locale } from "@/i18n/config";
import { localizePark } from "@/i18n/content";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

/** 页脚：站名和页面导航，公园按片区分几栏排（几十座排成一长列太长），最后是数据来源和声明 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const local = parks.map((park) => localizePark(park, locale));
  const groups = [
    ...regionOrder.map((region) => ({
      title: dict.regions[region],
      parks: local.filter((park) => park.region === region && !isSite(park)),
    })),
    { title: dict.nav.sites, parks: local.filter(isSite) },
  ].filter((group) => group.parks.length > 0);
  const pages = [
    { href: `/${locale}/plan`, label: dict.nav.plan },
    { href: `/${locale}/when`, label: dict.nav.when },
    { href: `/${locale}/routes`, label: dict.nav.routes },
    { href: `/${locale}/prices`, label: dict.nav.prices },
    { href: `/${locale}/rankings`, label: dict.nav.rankings },
  ];

  return (
    <footer className="cv-auto [--cv-h:900px] bg-ink text-paper print:hidden">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 pb-10 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href={`/${locale}`} className="font-serif text-3xl tracking-[0.42em] uppercase sm:text-4xl">
              {dict.site.wordmark}
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-paper/55">{t.tagline}</p>
          </div>
          <nav className="lg:col-span-3" aria-label={t.pagesTitle}>
            <p className="eyebrow text-paper/55">{t.pagesTitle}</p>
            <ul className="mt-6 space-y-3">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="font-serif text-xl transition-colors hover:text-clay-300">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-4">
            <p className="eyebrow text-paper/55">{t.dataTitle}</p>
            <p className="mt-6 text-sm leading-7 text-paper/55">{t.sources}</p>
            <p className="mt-3 text-sm leading-7 text-paper/55">{fill(t.googleNote, { date: googleSnapshotDate })}</p>
          </div>
        </div>

        <div className="mt-20 border-t border-paper/15 pt-10">
          <p className="eyebrow text-paper/55">{t.parksTitle}</p>
          <div className="mt-8 columns-2 gap-10 sm:columns-3 lg:columns-5 xl:columns-6">
            {groups.map((group) => (
              <div key={group.title} className="mb-9 break-inside-avoid">
                <p className="text-[11px] tracking-[0.14em] text-paper/55">{group.title}</p>
                <ul className="mt-3 space-y-2">
                  {group.parks.map((park) => (
                    <li key={park.code}>
                      <Link
                        href={`/${locale}/parks/${park.code}`}
                        title={park.nameEn}
                        className="font-serif text-[15px] text-paper/85 transition-colors hover:text-clay-300"
                      >
                        {park.nameZh}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-6 text-xs tracking-[0.06em] text-paper/55">
          <p>{t.disclaimer}</p>
          <p>© 2026 {dict.site.name}</p>
        </div>
      </div>
    </footer>
  );
}
