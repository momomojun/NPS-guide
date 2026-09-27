"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { IconArrowUpRight } from "@/components/icons";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import type { CreatorLanguage, CreatorRoute } from "@/data/creators";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { addToTrip, MAX_DAYS, tripIds, updateTrip, useTrip } from "@/lib/trip-store";

export type RoutesText = Dictionary["routes"];

const noSubscribe = () => () => {};
const useParkParam = () =>
  useSyncExternalStore(noSubscribe, () => new URLSearchParams(window.location.search).get("park"), () => null);

type Sort = "views" | "recent";

const LANGUAGE_ORDER: CreatorLanguage[] = ["zh", "en", "ja", "ko", "es", "fr", "it", "de"];

export function CreatorRoutes({
  routes,
  parks,
  stopNames,
  locale,
  text,
}: {
  routes: CreatorRoute[];
  /** 公园代码 → 中文名（有博主路线的公园） */
  parks: { code: string; nameZh: string }[];
  /** 景点 id → 名字和公园（路线里用到的） */
  stopNames: Record<string, { nameZh: string; park: string }>;
  locale: string;
  text: RoutesText;
}) {
  const router = useRouter();
  const trip = useTrip();
  const requested = useParkParam();
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [language, setLanguage] = useState<CreatorLanguage | null>(null);
  const [sort, setSort] = useState<Sort>("views");
  const [done, setDone] = useState<string | null>(null);
  const park = picked === undefined ? requested : picked;

  // 公园和语言两个筛选叠加；每个选项后面的数字按另一个筛选算
  const inPark = routes.filter((route) => !park || route.parks.includes(park));
  const inLanguage = routes.filter((route) => !language || route.language === language);
  const languages = LANGUAGE_ORDER.filter((code) => routes.some((route) => route.language === code));
  const visible = inPark
    .filter((route) => !language || route.language === language)
    .sort((a, b) => (sort === "views" ? b.views - a.views : b.published.localeCompare(a.published)));

  const views = (n: number) => (n >= 10000 ? fill(text.viewsWan, { n: (n / 10000).toFixed(1) }) : fill(text.views, { n }));
  const known = (stop: string) => stop in stopNames;

  const apply = (route: CreatorRoute) => {
    const days = (route.route ?? []).map((day) => day.stops.filter(known)).filter((ids) => ids.length > 0);
    if (days.length === 0) return;
    if (route.byDay) {
      if (tripIds(trip).length > 0 && !window.confirm(text.replaceConfirm)) return;
      const kept = days.slice(0, MAX_DAYS);
      updateTrip(() => ({
        version: 2,
        startDate: "",
        dayCount: kept.length,
        days: kept.map((ids) => [...new Set(ids)].map((id) => ({ id, status: "planned" as const }))),
        pool: [],
        nights: Array.from({ length: kept.length + 1 }, () => null),
      }));
    } else {
      addToTrip([...new Set(days.flat())]);
    }
    setDone(route.id);
    router.push(`/${locale}/plan`);
  };

  const chip = (active: boolean) =>
    `border px-3 py-1.5 text-xs transition-colors ${active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink hover:border-ink"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={text.filter}>
          <button type="button" className={chip(!park)} onClick={() => setPicked(null)}>
            {text.all}
            <span className="ml-1.5 opacity-60">{inLanguage.length}</span>
          </button>
          {parks.map((p) => (
            <button key={p.code} type="button" className={chip(park === p.code)} onClick={() => setPicked(p.code)}>
              {p.nameZh}
              <span className="ml-1.5 opacity-60">{inLanguage.filter((route) => route.parks.includes(p.code)).length}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-xs">
          {(["views", "recent"] as Sort[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={`pb-0.5 ${sort === key ? "border-b border-ink text-ink" : "text-mute hover:text-ink"}`}
            >
              {text.sort[key]}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-1.5" role="group" aria-label={text.languageFilter}>
          <button type="button" className={chip(!language)} onClick={() => setLanguage(null)}>
            {text.allLanguages}
            <span className="ml-1.5 opacity-60">{inPark.length}</span>
          </button>
          {languages.map((code) => (
            <button key={code} type="button" className={chip(language === code)} onClick={() => setLanguage(code)}>
              {text.languages[code]}
              <span className="ml-1.5 opacity-60">{inPark.filter((route) => route.language === code).length}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && <p className="mt-10 text-sm text-mute">{text.empty}</p>}

      <ul className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-2">
        {visible.map((route) => {
          const linked = (route.route ?? []).flatMap((day) => day.stops).filter(known);
          return (
            <li key={route.id} id={route.id} className="scroll-mt-32 border-t border-ink pt-5">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mute">
                <span
                  className={`px-1.5 py-0.5 text-[11px] tracking-[0.08em] text-paper ${
                    route.platform === "youtube" ? "bg-clay-700" : "bg-[#2f6f9f]"
                  }`}
                >
                  {text.platforms[route.platform]}
                </span>
                <span className="border border-line px-1.5 py-0.5 text-[11px] text-ink-soft">
                  {text.languages[route.language]}
                  {route.origin && ` · ${route.origin}`}
                </span>
                <span className="text-ink-soft">{route.creator}</span>
                <span>· {fill(text.published, { date: route.published })}</span>
                <span>· {views(route.views)}</span>
                <span>· {fill(text.minutes, { n: route.durationMin })}</span>
              </p>
              <h2 className="mt-3 font-serif text-xl leading-snug">
                <a href={route.url} target="_blank" rel="noreferrer" className="hover:text-clay-700">
                  {route.title}
                </a>
              </h2>
              <p className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                {route.parks.map((code) => (
                  <Link key={code} href={`/${locale}/parks/${code}`} className="border border-line px-1.5 py-0.5 text-ink-soft hover:border-ink">
                    {parks.find((p) => p.code === code)?.nameZh ?? code}
                  </Link>
                ))}
                {route.days && <span className="border border-line px-1.5 py-0.5 text-ink-soft">{fill(text.days, { n: route.days })}</span>}
                {route.visited && (
                  <span className="border border-line px-1.5 py-0.5 text-ink-soft">{fill(text.visited, { when: route.visited })}</span>
                )}
                <span className={`px-1.5 py-0.5 ${route.basis === "metadata" ? "text-clay-700" : "text-mute"}`}>{text.basis[route.basis]}</span>
              </p>
              <p className="mt-4 text-[15px] leading-7 text-ink-soft">{route.summary}</p>

              {route.route && route.route.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs tracking-[0.1em] text-mute">{text.route}</p>
                  <ol className="mt-2 space-y-2 text-sm leading-6">
                    {route.route.map((day) => (
                      <li key={day.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-3">
                        <span className="text-xs leading-6 text-mute">{day.label}</span>
                        <span>
                          {day.stops.map((stop, i) => (
                            <span key={`${stop}-${i}`}>
                              {i > 0 && <span className="px-1 text-mute">→</span>}
                              {known(stop) ? (
                                <Link
                                  href={`/${locale}/parks/${stopNames[stop].park}#attraction-${stop}`}
                                  className="text-ink underline decoration-line underline-offset-4 hover:text-clay-700"
                                >
                                  {stopNames[stop].nameZh}
                                </Link>
                              ) : (
                                <span className="text-ink-soft">{stop}</span>
                              )}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {route.notes && route.notes.length > 0 && (
                <details className="group/notes mt-5 border-t border-line pt-3" open={route.notes.length <= 3}>
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-[0.1em] text-ink [&::-webkit-details-marker]:hidden">
                    {fill(text.notes, { n: route.notes.length })}
                    <span className="text-base leading-none text-mute transition-transform duration-300 group-open/notes:rotate-45">+</span>
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-soft">
                    {route.notes.map((note) => (
                      <li key={note.stop}>
                        <span className="text-ink">{stopNames[note.stop]?.nameZh ?? note.stop}</span>：{note.text}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {route.tips && route.tips.length > 0 && (
                <div className="mt-4 border-l border-clay-600 pl-4">
                  <p className="text-xs tracking-[0.1em] text-clay-700">{text.tips}</p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-5 text-ink-soft">
                    {route.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a href={route.url} target="_blank" rel="noreferrer" className={buttonSecondary}>
                  {text.watch} <IconArrowUpRight />
                </a>
                {linked.length > 0 && (
                  <button
                    type="button"
                    className={buttonPrimary}
                    title={route.byDay ? text.applyHint : text.addHint}
                    onClick={() => apply(route)}
                  >
                    {done === route.id ? text.applied : route.byDay ? text.apply : text.addAll}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
