import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditedPhoto } from "@/components/credited-photo";
import { ParksOverviewMap } from "@/components/parks-overview-map";
import { getParkAttractions } from "@/data/attractions";
import { parks, regionOrder } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dict.home.title}</h1>
          <p className="mt-2 max-w-3xl text-stone-600 dark:text-stone-400">{dict.home.intro}</p>
        </div>
        <Link
          href={`/${locale}/plan`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {dict.home.planCta}
        </Link>
      </div>

      <ParksOverviewMap
        locale={locale}
        text={dict.map}
        parks={parks.map((park) => ({
          code: park.code,
          name: localize(park.nameZh, locale),
          lat: park.gateway.lat,
          lon: park.gateway.lon,
        }))}
      />

      {regionOrder.map((region) => (
        <section key={region}>
          <h2 className="mb-3 text-sm font-semibold text-stone-500">{dict.regions[region]}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {parks
              .filter((park) => park.region === region)
              .map((park) => {
                const cover = getParkAttractions(park.code).find((a) => a.mustSee && a.photo)?.photo;
                return (
                  <li key={park.code}>
                    <Link
                      href={`/${locale}/parks/${park.code}`}
                      className="block h-full overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-emerald-500 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
                    >
                      {cover && (
                        <CreditedPhoto
                          photo={cover}
                          alt=""
                          creditTemplate={dict.attraction.photoCredit}
                          sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                          className="h-32"
                          linkCredit={false}
                        />
                      )}
                      <div className="p-4">
                        <div className="text-lg font-semibold">{localize(park.nameZh, locale)}</div>
                        <div className="text-sm text-stone-500">{park.nameEn}</div>
                        <div className="mt-2 text-xs text-stone-500">
                          {fill(dict.home.attractions, { n: getParkAttractions(park.code).length })} ·{" "}
                          {dict.home.airports}：{park.airports.join(" · ")}
                        </div>
                        {park.nonresidentSurcharge && (
                          <span className="mt-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            {dict.home.nonresident}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
