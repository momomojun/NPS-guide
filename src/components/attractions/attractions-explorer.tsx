"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ParkMap, type MapPoint } from "@/components/map/park-map";
import { AddManyButton } from "@/components/trip/add-many-button";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonSecondary } from "@/components/ui";
import type { AttractionKind, AttractionWithPhoto } from "@/data/attractions";
import { fill, formatDuration } from "@/i18n/format";
import { AttractionCard, type AttractionText } from "./attraction-card";
import { KIND_COLORS } from "./kinds";

type Filter = "all" | "mustSee" | AttractionKind;

export function AttractionsExplorer({
  attractions,
  areas,
  text,
}: {
  attractions: AttractionWithPhoto[];
  /** 片区 key → 名称，决定列表分组和顺序 */
  areas: Record<string, string>;
  text: AttractionText;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const mapRef = useRef<HTMLDivElement>(null);
  const t = text.attraction;

  const visible = useMemo(
    () =>
      attractions.filter((a) =>
        filter === "all" ? true : filter === "mustSee" ? a.mustSee : a.kind === filter,
      ),
    [attractions, filter],
  );
  const points = useMemo<MapPoint[]>(
    () =>
      visible.map((a) => ({
        id: a.id,
        lat: a.lat,
        lon: a.lon,
        label: a.nameZh,
        color: KIND_COLORS[a.kind],
        emphasis: a.mustSee,
      })),
    [visible],
  );
  const groups = Object.entries(areas)
    .map(([key, name]) => ({ key, name, items: visible.filter((a) => a.area === key) }))
    .filter((group) => group.items.length > 0);
  const kinds = [...new Set(attractions.map((a) => a.kind))];
  const mustSeeIds = attractions.filter((a) => a.mustSee).map((a) => a.id);
  const selected = attractions.find((a) => a.id === selectedId);

  const scrollToCard = (id: string) =>
    document.getElementById(`attraction-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  // 点地图：弹出小卡片；宽屏时地图是固定的，顺便把列表滚到对应景点
  const selectFromMap = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia("(min-width: 1024px)").matches) scrollToCard(id);
  };
  // 点卡片上的“在地图上看”：手机上先把地图滚回视野
  const selectFromList = (id: string) => {
    setSelectedId(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs transition ${
      active
        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div ref={mapRef} className="scroll-mt-20 lg:sticky lg:top-20">
          <ParkMap
            points={points}
            selectedId={selectedId}
            onSelect={selectFromMap}
            text={text.map}
            className="h-96 lg:h-[calc(100vh-7rem)]"
          >
            {selected && (
              <div className="absolute right-3 bottom-10 left-3 flex max-w-md gap-3 rounded-xl bg-white p-2.5 shadow-lg dark:bg-stone-900">
                {selected.photo && (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <Image src={selected.photo.url} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold">{selected.nameZh}</p>
                    <button
                      type="button"
                      aria-label={t.close}
                      onClick={() => setSelectedId(null)}
                      className="-mt-1 -mr-1 rounded px-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="truncate text-xs text-stone-500">
                    {text.kinds[selected.kind]} · {fill(t.duration, { d: formatDuration(selected.durationMin, text.units) })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <AddToTripButton id={selected.id} text={text.trip} />
                    <button type="button" className={buttonSecondary} onClick={() => scrollToCard(selected.id)}>
                      {t.details}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ParkMap>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(filter === "all")} onClick={() => setFilter("all")}>
              {t.all} {attractions.length}
            </button>
            <button type="button" className={chip(filter === "mustSee")} onClick={() => setFilter("mustSee")}>
              {t.mustSee} {mustSeeIds.length}
            </button>
            {kinds.map((kind) => (
              <button key={kind} type="button" className={chip(filter === kind)} onClick={() => setFilter(kind)}>
                <span className="mr-1 inline-block size-2 rounded-full" style={{ backgroundColor: KIND_COLORS[kind] }} />
                {text.kinds[kind]} {attractions.filter((a) => a.kind === kind).length}
              </button>
            ))}
          </div>
          {mustSeeIds.length > 0 && (
            <AddManyButton
              ids={mustSeeIds}
              label={fill(t.addAllMustSee, { n: mustSeeIds.length })}
              doneLabel={t.allMustSeeAdded}
            />
          )}
        </div>

        {groups.map((group) => (
          <section key={group.key}>
            <h3 className="mb-3 text-sm font-semibold text-stone-500">{group.name}</h3>
            <div className="space-y-4">
              {group.items.map((attraction) => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  text={text}
                  selected={attraction.id === selectedId}
                  onShowOnMap={() => selectFromList(attraction.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
