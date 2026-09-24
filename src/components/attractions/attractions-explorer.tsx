"use client";

import { useMemo, useRef, useState } from "react";
import { ParkMap, type MapPoint } from "@/components/map/park-map";
import type { AttractionWithPhoto } from "@/data/attractions";
import { AttractionCard, type AttractionText } from "./attraction-card";
import { KIND_COLORS } from "./kinds";

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
  const [mustSeeOnly, setMustSeeOnly] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (mustSeeOnly ? attractions.filter((a) => a.mustSee) : attractions),
    [attractions, mustSeeOnly],
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

  // 点地图 → 列表滚到对应卡片；点卡片 → 地图飞过去（手机上先把地图滚回视野）
  const selectFromMap = (id: string) => {
    setSelectedId(id);
    document.getElementById(`attraction-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const selectFromList = (id: string) => {
    setSelectedId(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs ${
      active
        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div ref={mapRef} className="scroll-mt-4 lg:sticky lg:top-4">
          <ParkMap
            points={points}
            selectedId={selectedId}
            onSelect={selectFromMap}
            text={text.map}
            className="h-80 lg:h-[80vh]"
          />
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="flex gap-2">
          <button type="button" className={chip(!mustSeeOnly)} onClick={() => setMustSeeOnly(false)}>
            {text.attraction.all} {attractions.length}
          </button>
          <button type="button" className={chip(mustSeeOnly)} onClick={() => setMustSeeOnly(true)}>
            {text.attraction.mustSee} {attractions.filter((a) => a.mustSee).length}
          </button>
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
