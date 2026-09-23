import Link from "next/link";
import { notFound } from "next/navigation";
import { parks, regionOrder } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">{dict.home.title}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{dict.home.intro}</p>
      </div>

      {regionOrder.map((region) => (
        <section key={region}>
          <h2 className="mb-3 text-sm font-semibold text-stone-500">{dict.regions[region]}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parks
              .filter((park) => park.region === region)
              .map((park) => (
                <li key={park.code}>
                  <Link
                    href={`/${locale}/parks/${park.code}`}
                    className="block h-full rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-500 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="text-lg font-semibold">{localize(park.nameZh, locale)}</div>
                    <div className="text-sm text-stone-500">{park.nameEn}</div>
                    <div className="mt-3 text-xs text-stone-500">
                      {dict.home.airports}：{park.airports.join(" · ")}
                    </div>
                    {park.nonresidentSurcharge && (
                      <span className="mt-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        {dict.home.nonresident}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
