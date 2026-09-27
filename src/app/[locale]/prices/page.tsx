import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceCenter } from "@/components/prices/price-center";
import { SectionNav } from "@/components/site/section-nav";
import { airports } from "@/data/airports";
import { parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { parkState } from "@/lib/prices/fuel";

export async function generateMetadata({ params }: PageProps<"/[locale]/prices">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).prices.title };
}

// 价格页静态生成：机票按需查，油价在浏览器里取 /api/prices/gas，租车是快照
export default async function PricesPage({ params }: PageProps<"/[locale]/prices">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.prices;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-14 pb-28 sm:px-10">
      <header className="max-w-3xl">
        <p className="eyebrow text-mute">{t.eyebrow}</p>
        <h1 className="mt-5 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-tight">{t.title}</h1>
        <p className="mt-5 text-sm leading-7 text-ink-soft">{t.intro}</p>
      </header>
      <div className="mt-10">
        <SectionNav
          label={t.nav.label}
          inset
          items={[
            { id: "flights", label: t.nav.flights },
            { id: "car", label: t.nav.car },
            { id: "gas", label: t.nav.gas },
          ]}
        />
      </div>
      <div className="mt-10">
        <PriceCenter
          locale={locale}
          airports={Object.fromEntries(
            Object.entries(airports).map(([code, airport]) => [
              code,
              { ...airport, nameZh: localize(airport.nameZh, locale), city: localize(airport.city, locale) },
            ]),
          )}
          parks={parks.map((park) => ({
            code: park.code,
            nameZh: localize(park.nameZh, locale),
            airports: park.airports,
            state: parkState[park.code],
          }))}
          text={{ ...t, units: dict.units, states: dict.plan.budget.states }}
        />
      </div>
      <p className="mt-16 text-[11px] leading-5 text-mute">{t.source}</p>
    </div>
  );
}
