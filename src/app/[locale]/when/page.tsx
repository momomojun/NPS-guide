import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeasonGuide } from "@/components/when/season-guide";
import { isSite, parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { parkSeason } from "@/lib/seasons";

export async function generateMetadata({ params }: PageProps<"/[locale]/when">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).when.title };
}

// 页面静态生成，“现在”是哪天在浏览器里算
export default async function WhenPage({ params }: PageProps<"/[locale]/when">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.when;
  const seasons = parks.filter((park) => !isSite(park)).map((park) => {
    const season = parkSeason(park);
    const text = (value: string) => localize(value, locale);
    return {
      ...season,
      nameZh: text(season.nameZh),
      tagline: text(season.tagline),
      seasonNote: text(season.seasonNote),
      months: season.months.map((month) => ({
        ...month,
        closedMustSee: month.closedMustSee.map(text),
        events: month.events.map(text),
      })),
    };
  });

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-14 pb-28 sm:px-10">
      <header className="max-w-3xl">
        <p className="eyebrow text-mute">{t.eyebrow}</p>
        <h1 className="mt-5 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-tight">{t.title}</h1>
        <p className="mt-5 text-sm leading-7 text-ink-soft">{fill(t.intro, { n: seasons.length })}</p>
      </header>
      <div className="mt-10">
        <SeasonGuide parks={seasons} locale={locale} text={{ ...t, units: dict.units }} />
      </div>
    </div>
  );
}
