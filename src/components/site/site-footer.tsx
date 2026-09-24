import Link from "next/link";
import { googleSnapshotDate } from "@/data/attractions/google";
import { parks } from "@/data/parks";
import type { Locale } from "@/i18n/config";
import { localizePark } from "@/i18n/content";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 pb-10 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-serif text-3xl tracking-[0.42em] uppercase sm:text-4xl">{dict.site.wordmark}</p>
            <p className="mt-6 max-w-sm text-sm leading-7 text-paper/55">{t.tagline}</p>
          </div>
          <div className="lg:col-span-3">
            <p className="eyebrow text-paper/40">{t.parksTitle}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {parks.map((source) => {
                const park = localizePark(source, locale);
                return (
                  <li key={park.code}>
                    <Link href={`/${locale}/parks/${park.code}`} className="group inline-flex items-baseline gap-2">
                      <span className="font-serif text-base transition-colors group-hover:text-clay-300">{park.nameZh}</span>
                      <span className="text-[11px] tracking-[0.14em] text-paper/35 uppercase">{park.nameEn}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lg:col-span-4">
            <p className="eyebrow text-paper/40">{t.dataTitle}</p>
            <p className="mt-6 text-sm leading-7 text-paper/55">{t.sources}</p>
            <p className="mt-3 text-sm leading-7 text-paper/55">{fill(t.googleNote, { date: googleSnapshotDate })}</p>
          </div>
        </div>
        <div className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-6 text-xs tracking-[0.06em] text-paper/40">
          <p>{t.disclaimer}</p>
          <p>© 2026 {dict.site.name}</p>
        </div>
      </div>
    </footer>
  );
}
