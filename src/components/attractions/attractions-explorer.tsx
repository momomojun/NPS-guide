"use client";

import { useMemo, useRef, useState } from "react";
import { CommonsImage } from "@/components/commons-image";
import { IconClose, IconTrail } from "@/components/icons";
import { ParkMap, type MapPoint, type MapTrail } from "@/components/map/park-map";
import { AddManyButton } from "@/components/trip/add-many-button";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import type { AttractionKind, AttractionWithPhoto } from "@/data/attractions";
import { googleMapsUrl, googleSnapshotDate } from "@/data/attractions/google";
import { fill, formatDuration } from "@/i18n/format";
import { AttractionCard, linkButton, PopularityBadge, type AttractionText } from "./attraction-card";
import { KIND_COLORS } from "./kinds";

type Filter = "all" | "mustSee" | AttractionKind;
type Sort = "rank" | "area";

/** 按热度名次；不排名的游客中心按评论数接在后面，没有 Google 数据的放最后 */
function byPopularity(a: AttractionWithPhoto, b: AttractionWithPhoto) {
  return (
    (a.hotRank ?? Infinity) - (b.hotRank ?? Infinity) || (b.google?.reviews ?? 0) - (a.google?.reviews ?? 0)
  );
}

export function AttractionsExplorer({
  attractions,
  areas,
  parkNameEn,
  text,
}: {
  attractions: AttractionWithPhoto[];
  /** 片区 key → 名称，决定按片区分组时的顺序 */
  areas: Record<string, string>;
  parkNameEn: string;
  text: AttractionText;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("rank");
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
    () => [
      // 步道口的小白点画在下面，景点标记盖在上面
      ...visible.flatMap((a) =>
        a.trailLine
          ? [{ id: `${a.id}:trailhead`, lat: a.trailLine.path[0][1], lon: a.trailLine.path[0][0], label: "", color: "#ffffff", small: true }]
          : [],
      ),
      ...visible.map((a) => ({
        id: a.id,
        lat: a.lat,
        lon: a.lon,
        label: a.nameZh,
        sublabel: a.nameEn,
        color: KIND_COLORS[a.kind],
        emphasis: a.mustSee,
      })),
    ],
    [visible],
  );
  const trails = useMemo<MapTrail[]>(
    () => visible.flatMap((a) => (a.trailLine ? [{ id: a.id, path: a.trailLine.path }] : [])),
    [visible],
  );
  const groups =
    sort === "rank"
      ? [{ key: "rank", name: "", items: [...visible].sort(byPopularity) }]
      : Object.entries(areas)
          .map(([key, name]) => ({ key, name, items: visible.filter((a) => a.area === key) }))
          .filter((group) => group.items.length > 0);
  const kinds = [...new Set(attractions.map((a) => a.kind))];
  const mustSeeIds = attractions.filter((a) => a.mustSee).map((a) => a.id);
  const selected = attractions.find((a) => a.id === selectedId);

  const scrollToCard = (id: string) =>
    document.getElementById(`attraction-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

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

  const filterClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 pb-1 text-[13px] transition-colors ${
      active ? "border-b border-ink text-ink" : "border-b border-transparent text-mute hover:text-ink"
    }`;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div ref={mapRef} className="scroll-mt-20 lg:sticky lg:top-24">
          <ParkMap
            points={points}
            trails={trails}
            highlightTrailId={selectedId}
            selectedId={selectedId}
            onSelect={selectFromMap}
            text={text.map}
            className="h-[26rem] lg:h-[calc(100vh-8rem)]"
          >
            {selected && (
              <div className="absolute right-3 bottom-10 left-3 flex max-w-md gap-4 bg-paper p-3 shadow-[0_12px_40px_rgba(28,27,24,0.18)]">
                {selected.photo && (
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-paper-deep">
                    <CommonsImage src={selected.photo.url} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-xl leading-tight">{selected.nameZh}</p>
                      <p className="eyebrow mt-1 truncate text-mute">{selected.nameEn}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={t.close}
                      onClick={() => setSelectedId(null)}
                      className="-mt-1 -mr-1 p-1 text-mute hover:text-ink"
                    >
                      <IconClose />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-ink-soft">
                    <p>
                      {text.kinds[selected.kind]} · {fill(t.duration, { d: formatDuration(selected.durationMin, text.units) })}
                    </p>
                    <PopularityBadge attraction={selected} text={text} />
                    {selected.trailLine && (
                      <p className="inline-flex items-center gap-1.5 text-clay-700">
                        <IconTrail />
                        {fill(t.trailLength, {
                          km: selected.trailLine.km.toFixed(1),
                          type: selected.trailLine.loop ? t.loopTrail : t.oneWay,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <AddToTripButton id={selected.id} text={text.trip} />
                    <a className={linkButton} href={googleMapsUrl(selected, parkNameEn)} target="_blank" rel="noreferrer" title={t.googleMapsHint}>
                      {t.googleMaps}
                    </a>
                    <button type="button" className={linkButton} onClick={() => scrollToCard(selected.id)}>
                      {t.details}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ParkMap>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="space-y-5 border-t border-ink pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-5">
              {(["rank", "area"] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setSort(mode)} className={filterClass(sort === mode)}>
                  {mode === "rank" ? t.sortByRank : t.sortByArea}
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
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button type="button" className={filterClass(filter === "all")} onClick={() => setFilter("all")}>
              {t.all}
              <span className="text-[11px] tabular-nums opacity-60">{attractions.length}</span>
            </button>
            <button type="button" className={filterClass(filter === "mustSee")} onClick={() => setFilter("mustSee")}>
              {t.mustSee}
              <span className="text-[11px] tabular-nums opacity-60">{mustSeeIds.length}</span>
            </button>
            {kinds.map((kind) => (
              <button key={kind} type="button" className={filterClass(filter === kind)} onClick={() => setFilter(kind)}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: KIND_COLORS[kind] }} />
                {text.kinds[kind]}
                <span className="text-[11px] tabular-nums opacity-60">{attractions.filter((a) => a.kind === kind).length}</span>
              </button>
            ))}
          </div>
          {sort === "rank" && (
            <p className="text-[11px] leading-5 text-mute">{fill(t.popularityNote, { date: googleSnapshotDate })}</p>
          )}
        </div>

        <div className="mt-10 space-y-12">
          {groups.map((group) => (
            <section key={group.key}>
              {group.name && <h3 className="eyebrow mb-6 border-b border-line pb-3 text-mute">{group.name}</h3>}
              <div className="space-y-12">
                {group.items.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    parkNameEn={parkNameEn}
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
    </div>
  );
}
