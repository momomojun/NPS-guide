"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
import { IconBed, IconClose, IconGrip } from "@/components/icons";
import { ParkMap, type MapLeg, type MapPoint, type MapTrail } from "@/components/map/park-map";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import type { ParkActivity } from "@/data/activities";
import type { Airport } from "@/data/airports";
import type { AttractionWithPhoto } from "@/data/attractions";
import { googleMapsUrl } from "@/data/attractions/google";
import type { Photo } from "@/data/attractions/types";
import type { LodgingOption } from "@/data/lodging";
import { fill, formatDuration } from "@/i18n/format";
import { addDays, monthOf, nominalDate } from "@/lib/dates";
import { airbnbUrl } from "@/lib/airbnb";
import { generateTrip, guideParks } from "@/lib/generate-trip";
import { drivingMinutesFrom, drivingRoute } from "@/lib/osrm-client";
import { buildTimeline, NOMINAL_SUN, rankLodging, type PlanStop } from "@/lib/planner";
import { minutesOfDay, sunTimes } from "@/lib/sun";
import { moveItem, setNight } from "@/lib/trip-edit";
import { planTrip } from "@/lib/trip-plan";
import {
  MAX_DAYS,
  removeFromTrip,
  resetTrip,
  resizeDays,
  tripIds,
  updateTrip,
  useTrip,
  type Trip,
  type TripLodging,
} from "@/lib/trip-store";
import { DayCard } from "./day-card";
import { dayColor } from "./day-colors";
import { GuideSummary } from "./guide-summary";
import { LodgingSelector } from "./lodging-selector";
import { StopDetails } from "./stop-details";
import { TripOverview } from "./trip-overview";
import { TripWizard, type WizardInput, type WizardPlace } from "./trip-wizard";
import type { DayView, DragSpot, PlannerPark, PlannerText, ResolvedLodging, SunInfo } from "./types";

const LODGING_COLOR = "#2f4a5a";
/** 地图显示整个行程（每天一种颜色） */
const ALL_DAYS = -1;
/** 自定义住处只查这个范围内公园的景点车程 */
const MEASURE_RADIUS_KM = 400;

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function Planner({
  attractions,
  parks,
  lodgingOptions,
  airports,
  activities,
  text,
  locale,
}: {
  attractions: AttractionWithPhoto[];
  parks: PlannerPark[];
  lodgingOptions: LodgingOption[];
  airports: Record<string, Airport>;
  /** 各公园的特别活动，攻略说明里按月份列出 */
  activities: ParkActivity[];
  text: PlannerText;
  locale: string;
}) {
  const t = text.plan;
  const trip = useTrip();
  const [mapDay, setMapDay] = useState(ALL_DAYS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 行程里展开详情的景点；“添加景点”列表里展开的另算
  const [openId, setOpenId] = useState<string | null>(null);
  const [browseId, setBrowseId] = useState<string | null>(null);
  // 图集按公园懒加载：点开详情时才去取
  const [galleries, setGalleries] = useState<Record<string, Record<string, Photo[]>>>({});
  const requestedGalleries = useRef(new Set<string>());
  const [today, setToday] = useState(0);
  const [pickedPark, setPickedPark] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<DragSpot | null>(null);
  const [dragTarget, setDragTarget] = useState<DragSpot | null>(null);
  const [wizardOpen, setWizardOpen] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  // 真实开车路线，按途经点缓存；null 表示查失败，退回画虚线
  const [roadRoutes, setRoadRoutes] = useState<Record<string, [number, number][] | null>>({});

  const byId = useMemo(() => new Map(attractions.map((a) => [a.id, a])), [attractions]);
  const parkByCode = useMemo(() => new Map(parks.map((p) => [p.code, p])), [parks]);
  const optionById = useMemo(() => new Map(lodgingOptions.map((o) => [o.id, o])), [lodgingOptions]);
  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-TW" : "zh-CN", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale],
  );

  const duration = (minutes: number) => formatDuration(minutes, text.units);
  /** 显示用的日期：只有定了具体出发日期才有 */
  const dateOf = (day: number) => (trip.startDate ? addDays(trip.startDate, day) : null);
  /** 算日出日落、季节提示用的日期：只定了月份时按那个月的 15 号 */
  const refDateOf = (day: number) =>
    trip.startDate ? addDays(trip.startDate, day) : trip.month ? addDays(nominalDate(trip.month), day) : null;
  const tripMonth = trip.startDate ? monthOf(trip.startDate) : (trip.month ?? null);

  const resolve = (lodging: TripLodging | null | undefined): ResolvedLodging | undefined => {
    if (!lodging) return undefined;
    if (lodging.kind === "custom") {
      // 出发 / 回程机场按当前语言显示名字（生成攻略时存下的是当时页面语言的名字）
      const airport = lodging.endpoint ? airports[lodging.id.replace(/^custom-(origin|destination)-/, "")] : undefined;
      return { ...lodging, name: airport ? `${airport.nameZh}（${airport.code}）` : lodging.name, custom: true };
    }
    const option = optionById.get(lodging.id);
    return option
      ? {
          id: option.id,
          lat: option.lat,
          lon: option.lon,
          name: option.nameZh,
          custom: false,
          inPark: option.inPark,
          note: option.note,
          rental: option.rental,
          airbnb: option.airbnb,
        }
      : undefined;
  };
  const nightAt = (night: number) => resolve(trip.nights[night]);

  const sunInfo = (day: number, parkCode: string | undefined): SunInfo => {
    const date = refDateOf(day);
    const park = parkCode ? parkByCode.get(parkCode) : undefined;
    if (!date || !park) return { kind: "unknown" };
    const sun = sunTimes(date, park.lat, park.lon);
    if (sun.kind !== "normal") return { kind: sun.kind };
    return {
      kind: "normal",
      window: { sunrise: minutesOfDay(sun.sunrise, park.timeZone), sunset: minutesOfDay(sun.sunset, park.timeZone) },
    };
  };
  const sunWindow = (day: number, parkCode: string) => {
    const info = sunInfo(day, parkCode);
    return info.kind === "normal" ? info.window : NOMINAL_SUN;
  };

  // 逐天推算时间线：早上从前一晚住处出发，晚上回当晚住处
  const dayViews: DayView[] = [];
  let previous: PlanStop | undefined;
  for (let day = 0; day < trip.days.length; day++) {
    const rows = trip.days[day].flatMap((item, index) => {
      const stop = byId.get(item.id);
      return stop ? [{ item, index, stop }] : [];
    });
    const from = nightAt(day);
    const to = nightAt(day + 1);
    const sun = sunInfo(day, rows[0]?.stop.park ?? previous?.park);
    const timeline = buildTimeline(
      rows.map((row) => row.stop),
      { sun: sun.kind === "normal" ? sun.window : NOMINAL_SUN, from, to, previous },
    );
    dayViews.push({ day, date: refDateOf(day), rows, sun, timeline, from, to });
    previous = rows.at(-1)?.stop ?? previous;
  }

  // 第 night 晚的推荐住处：当天最后一站所在公园和第二天第一站所在公园的住宿，按车程排序
  const rankedFor = (night: number) => {
    const lastStop = dayViews[night - 1]?.rows.at(-1)?.stop;
    const nextStop = dayViews[night]?.rows[0]?.stop;
    const parksNearby = new Set([lastStop?.park, nextStop?.park].filter(Boolean));
    const candidates = lodgingOptions
      .filter((option) => parksNearby.has(option.park))
      .map((option) => resolve({ kind: "option", id: option.id })!);
    return rankLodging(candidates, lastStop, nextStop);
  };
  /** 第 night 晚住 lodging 的话，在 Airbnb 上按整段连住的日期搜 */
  const airbnbFor = (night: number) => (lodging: ResolvedLodging) => {
    if (!lodging.airbnb) return undefined;
    const same = (k: number) => trip.nights[k]?.id === lodging.id;
    let first = night;
    let last = night;
    while (first - 1 >= 1 && same(first - 1)) first--;
    while (last + 1 < trip.dayCount && same(last + 1)) last++;
    return airbnbUrl(lodging.airbnb, dateOf(first - 1), dateOf(last));
  };
  const searchNearFor = (night: number) => {
    const stop = dayViews[night - 1]?.rows.at(-1)?.stop ?? dayViews[night]?.rows[0]?.stop;
    const park = parks.find((p) => p.code === (stop?.park ?? pickerPark)) ?? parks[0];
    return stop ?? { lat: park.lat, lon: park.lon };
  };

  const measure = (place: { lat: number; lon: number }) => {
    const nearbyParks = new Set(
      parks.filter((park) => distanceKm(place, park) < MEASURE_RADIUS_KM).map((park) => park.code),
    );
    return drivingMinutesFrom(
      place,
      attractions.filter((a) => nearbyParks.has(a.park)).map((a) => ({ id: a.id, ...(a.start ?? a) })),
    );
  };

  const allIds = tripIds(trip);
  // “添加景点”默认显示行程里第一个景点所在的公园（景点 id 以公园代码开头）
  const pickerPark = pickedPark ?? allIds[0]?.split("-")[0] ?? parks[0]?.code ?? "";
  const plannedCount = trip.days.flat().filter((item) => item.status === "planned").length;

  const runPlan = (fromDay: number) =>
    updateTrip((current: Trip) => ({
      ...current,
      days: planTrip(current, byId, sunWindow, nightAt, fromDay),
      pool: [],
    }));
  const autoPlan = () => {
    if (plannedCount > 0 && !window.confirm(t.autoPlanConfirm)) return;
    runPlan(0);
  };
  const clearTrip = () => {
    if (window.confirm(t.clearConfirm)) resetTrip();
  };
  // 给还没定的每晚（第 1 天到最后一天的晚上）选车程最短的推荐住处
  const fillLodging = () =>
    updateTrip((current) => {
      let next = current;
      for (let night = 1; night <= current.dayCount; night++) {
        const best = current.nights[night] ? undefined : rankedFor(night)[0];
        if (best) next = setNight(next, night, { kind: "option", id: best.lodging.id });
      }
      return next;
    });
  const hasEmptyNight = trip.nights.slice(1).some((night) => night === null) && plannedCount > 0;

  // 自动生成攻略：查出发地、回程地到各景点的车程，再挑景点、排每天、定住宿
  const generate = async (input: WizardInput) => {
    if (allIds.length > 0 && !window.confirm(t.wizard.replaceConfirm)) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const park = parkByCode.get(input.parks[0]);
      if (!park) return;
      const stops = attractions.filter((a) => input.parks.includes(a.park));
      const targets = stops.map((a) => ({ id: a.id, ...(a.start ?? a) }));
      const originMinutes = await drivingMinutesFrom(input.origin, targets);
      const destinationMinutes =
        input.destination.id === input.origin.id ? originMinutes : await drivingMinutesFrom(input.destination, targets);
      const endpoint = (place: WizardPlace, minutes: Record<string, number>, role: "origin" | "destination") => ({
        kind: "custom" as const,
        id: `custom-${role}-${place.id}`,
        name: place.name,
        lat: place.lat,
        lon: place.lon,
        minutes,
        endpoint: role,
      });
      const sunFor = (day: number) => {
        const sun = sunTimes(addDays(input.startDate || nominalDate(input.month), day), park.lat, park.lon);
        return sun.kind === "normal"
          ? { sunrise: minutesOfDay(sun.sunrise, park.timeZone), sunset: minutesOfDay(sun.sunset, park.timeZone) }
          : NOMINAL_SUN;
      };
      const { trip: generated } = generateTrip(
        {
          ...input,
          origin: endpoint(input.origin, originMinutes, "origin"),
          destination: endpoint(input.destination, destinationMinutes, "destination"),
        },
        {
          stops,
          lodging: lodgingOptions
            .filter((option) => input.parks.includes(option.park))
            .map((option) => ({
              id: option.id,
              lat: option.lat,
              lon: option.lon,
              inPark: option.inPark,
              rental: option.rental,
              airbnb: option.airbnb,
            })),
          sunFor,
        },
      );
      updateTrip(() => generated);
      setMapDay(ALL_DAYS);
      setOpenId(null);
      setWizardOpen(false);
    } catch {
      setGenerateError(t.wizard.error);
    } finally {
      setGenerating(false);
    }
  };
  const showWizard = wizardOpen ?? allIds.length === 0;
  const guideParkList = trip.guide
    ? guideParks(trip.guide).flatMap((code) => parks.filter((park) => park.code === code))
    : [];

  const drag = {
    source: dragSource,
    target: dragTarget,
    start: (spot: DragSpot) => setDragSource(spot),
    over: (spot: DragSpot) => {
      if (dragTarget?.day !== spot.day || dragTarget.index !== spot.index) setDragTarget(spot);
    },
    drop: () => {
      if (dragSource && dragTarget) {
        updateTrip((current) => moveItem(current, dragSource.day, dragSource.index, dragTarget.day, dragTarget.index));
      }
      setDragSource(null);
      setDragTarget(null);
    },
    end: () => {
      setDragSource(null);
      setDragTarget(null);
    },
  };

  const loadGallery = (park: string) => {
    if (requestedGalleries.current.has(park)) return;
    requestedGalleries.current.add(park);
    fetch(`/api/gallery/${park}`)
      .then((res) => (res.ok ? (res.json() as Promise<Record<string, Photo[]>>) : {}))
      .catch(() => ({}))
      .then((photos) => setGalleries((current) => ({ ...current, [park]: photos })));
  };
  /** 还没取到时是 undefined */
  const photosOf = (stop: AttractionWithPhoto) => {
    const park = galleries[stop.park];
    return park ? (park[stop.id] ?? []) : undefined;
  };

  const selectOnMap = (id: string) => {
    setSelectedId(id);
    const stop = byId.get(id);
    if (!stop || !allIds.includes(id)) return;
    setOpenId(id);
    loadGallery(stop.park);
    // 等详情展开后再滚过去
    requestAnimationFrame(() =>
      document.getElementById(`plan-item-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const selectInList = (day: number, id: string) => {
    setSelectedId(id);
    // 看整个行程时保持全程视图，只高亮这个景点
    if (mapDay !== ALL_DAYS) setMapDay(day);
    const opening = openId !== id;
    setOpenId(opening ? id : null);
    const stop = byId.get(id);
    if (opening && stop) loadGallery(stop.park);
  };
  const toggleBrowse = (id: string) => {
    const opening = browseId !== id;
    setBrowseId(opening ? id : null);
    const stop = byId.get(id);
    if (opening && stop) loadGallery(stop.park);
  };
  const parkHref = (stop: AttractionWithPhoto) => `/${locale}/parks/${stop.park}#attraction-${stop.id}`;
  const detailsFor = (stop: AttractionWithPhoto, month: number | null, onClose: () => void, actions?: ReactNode) => (
    <StopDetails
      stop={stop}
      photos={photosOf(stop)}
      month={month}
      parkNameEn={parkNameEn(stop.park)}
      parkHref={parkHref(stop)}
      text={text}
      actions={actions}
      onClose={onClose}
    />
  );

  // 地图：整个行程（每天一种颜色）或者某一天：前一晚住处 → 景点 → 当晚住处
  const scheduledDays = dayViews.filter((view) => view.rows.length > 0);
  const showAll = mapDay === ALL_DAYS && trip.days.length > 1;
  const mapIndex = Math.min(Math.max(mapDay, 0), trip.days.length - 1);
  const mapViews = showAll ? scheduledDays : dayViews[mapIndex]?.rows.length ? [dayViews[mapIndex]] : [];
  const lodgingPoint = (lodging: ResolvedLodging): MapPoint => ({
    id: `lodging-${lodging.id}`,
    lat: lodging.lat,
    lon: lodging.lon,
    label: lodging.name,
    color: LODGING_COLOR,
    badge: lodging.endpoint === "origin" ? "起" : lodging.endpoint === "destination" ? "终" : "住",
  });
  const mapPoints: MapPoint[] = [];
  const mapTrails: MapTrail[] = [];
  // 开车是开到停车场 / 步道口，再沿步道走到景点；每天一段路线
  const dayRoutes: { day: number; points: { lat: number; lon: number }[] }[] = [];
  const pointIds = new Set<string>();
  const addPoint = (point: MapPoint) => {
    if (pointIds.has(point.id)) return;
    pointIds.add(point.id);
    mapPoints.push(point);
  };
  for (const view of mapViews) {
    const route: { lat: number; lon: number }[] = [];
    if (view.from) {
      addPoint(lodgingPoint(view.from));
      route.push(view.from);
    }
    view.rows.forEach(({ stop }, k) => {
      if (stop.trailLine) {
        const [lon, lat] = stop.trailLine.path[0];
        addPoint({ id: `${stop.id}:trailhead`, lat, lon, label: "", color: "#ffffff", small: true });
        mapTrails.push({ id: stop.id, path: stop.trailLine.path });
      }
      addPoint({
        id: stop.id,
        lat: stop.lat,
        lon: stop.lon,
        label: stop.nameZh,
        sublabel: showAll ? fill(t.day, { n: view.day + 1 }) : stop.nameEn,
        color: showAll ? dayColor(view.day) : KIND_COLORS[stop.kind],
        badge: String(k + 1),
      });
      route.push(stop.start ?? stop);
    });
    if (view.to) {
      addPoint(lodgingPoint(view.to));
      route.push(view.to);
    }
    if (route.length > 1) dayRoutes.push({ day: view.day, points: route });
  }
  if (mapViews.length === 0) {
    for (const id of allIds) {
      const stop = byId.get(id);
      if (stop) addPoint({ id, lat: stop.lat, lon: stop.lon, label: stop.nameZh, sublabel: stop.nameEn, color: KIND_COLORS[stop.kind] });
    }
  }

  const keyOf = (points: { lat: number; lon: number }[]) =>
    points.map((p) => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(";");
  const routeKeys = dayRoutes.map((route) => keyOf(route.points));
  const routeKeyList = routeKeys.join("|");
  // 真实开车路线一段一段地查（OSRM 公共服务，别一下子并发太多）
  const pendingRoutes = useRef(new Set<string>());
  useEffect(() => {
    const missing = (routeKeyList ? routeKeyList.split("|") : []).filter(
      (key) => !(key in roadRoutes) && !pendingRoutes.current.has(key),
    );
    if (missing.length === 0) return;
    missing.forEach((key) => pendingRoutes.current.add(key));
    (async () => {
      for (const key of missing) {
        try {
          const path = await drivingRoute(key);
          setRoadRoutes((current) => ({ ...current, [key]: path }));
        } catch {
          setRoadRoutes((current) => ({ ...current, [key]: null }));
        } finally {
          pendingRoutes.current.delete(key);
        }
      }
    })();
  }, [routeKeyList, roadRoutes]);
  const mapLegs: MapLeg[] = dayRoutes.map((route, k) => {
    const road = roadRoutes[routeKeys[k]];
    return {
      id: `day-${route.day}`,
      color: dayColor(route.day),
      path: road ?? route.points.map((p) => [p.lon, p.lat] as [number, number]),
      straight: !road,
    };
  });
  const mapLegend = showAll
    ? dayRoutes.map((route) => ({ color: dayColor(route.day), label: fill(t.day, { n: route.day + 1 }) }))
    : undefined;
  const parkNameEn = (code: string) => parkByCode.get(code)?.nameEn ?? "";

  const chip = (active: boolean) =>
    `pb-1 text-[13px] transition-colors ${
      active ? "border-b border-ink text-ink" : "border-b border-transparent text-mute hover:text-ink"
    }`;
  const card = "bg-paper-deep/70";
  // 下划线式输入框
  const field =
    "mt-2 block border-b border-ink/30 bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none";
  const select = "border-b border-ink/30 bg-transparent py-1 text-sm focus:border-ink focus:outline-none";

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="eyebrow text-mute">Itinerary · {t.title}</p>
        <h1 className="mt-5 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-tight">{t.title}</h1>
        <p className="mt-5 text-sm leading-7 text-ink-soft">{t.intro}</p>
      </header>

      <section className="border-t border-ink pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow text-mute">{t.wizard.eyebrow}</p>
            <h2 className="mt-4 font-serif text-2xl leading-snug">{t.wizard.title}</h2>
            {showWizard && <p className="mt-3 text-sm leading-7 text-ink-soft">{t.wizard.intro}</p>}
          </div>
          <button type="button" className="link-line text-xs tracking-[0.1em]" onClick={() => setWizardOpen(!showWizard)}>
            {showWizard ? t.wizard.collapse : t.wizard.open}
          </button>
        </div>
        {showWizard && (
          <div className="mt-8">
            <TripWizard
              parks={parks}
              airports={airports}
              text={text}
              busy={generating}
              error={generateError}
              onGenerate={generate}
            />
          </div>
        )}
      </section>

      <div className={`${card} flex flex-wrap items-end gap-x-8 gap-y-5 p-6`}>
        <label className="eyebrow text-mute">
          {t.startDate}
          <input
            type="date"
            value={trip.startDate}
            onChange={(event) =>
              updateTrip((current) => ({
                ...current,
                startDate: event.target.value,
                month: event.target.value ? undefined : current.month,
              }))
            }
            className={field}
          />
        </label>
        <label className="eyebrow text-mute">
          {t.month}
          <select
            value={trip.startDate ? "" : (trip.month ?? "")}
            onChange={(event) =>
              updateTrip((current) => ({
                ...current,
                startDate: "",
                month: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
            className={field}
          >
            <option value="">{t.monthUnset}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {fill(t.monthOption, { m })}
              </option>
            ))}
          </select>
        </label>
        <label className="eyebrow text-mute">
          {t.days}
          <select
            value={trip.dayCount}
            onChange={(event) => updateTrip((current) => resizeDays(current, Number(event.target.value)))}
            className={field}
          >
            {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {fill(t.dayOption, { n })}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={buttonPrimary} onClick={autoPlan} disabled={allIds.length === 0}>
          {t.autoPlan}
        </button>
        <button type="button" className={buttonSecondary} onClick={fillLodging} disabled={!hasEmptyNight} title={t.lodging.fillHint}>
          <IconBed className="text-sm" />
          {t.lodging.fillAll}
        </button>
        <button type="button" className={buttonSecondary} onClick={clearTrip} disabled={allIds.length === 0}>
          {t.clear}
        </button>
        {!trip.startDate && !trip.month && <p className="basis-full text-xs text-clay-700">{t.noDate}</p>}
        {plannedCount > 0 && <p className="basis-full text-xs text-mute">{t.lodging.fillHint}</p>}
      </div>

      {allIds.length === 0 && (
        <p className="border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">{t.empty}</p>
      )}

      {trip.days.some((day) => day.length > 0) && (
        <TripOverview
          views={dayViews}
          dateLabels={dayViews.map((view) =>
            trip.startDate ? dateFormat.format(new Date(`${dateOf(view.day)}T00:00:00Z`)) : null,
          )}
          parkName={(code) => parkByCode.get(code)?.nameZh ?? code}
          month={tripMonth}
          startDate={trip.startDate}
          dayCount={trip.dayCount}
          text={text}
          onJump={(day) => document.getElementById(`plan-day-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      )}

      {trip.guide && guideParkList.length > 0 && allIds.length > 0 && (
        <GuideSummary
          guide={trip.guide}
          parks={guideParkList}
          month={tripMonth}
          origin={nightAt(0)}
          destination={nightAt(trip.dayCount)}
          outboundMin={dayViews[0]?.timeline.entries[0]?.driveMin}
          inboundMin={dayViews.at(-1)?.timeline.returnDriveMin || undefined}
          nights={Array.from({ length: Math.max(trip.dayCount - 1, 0) }, (_, i) => ({
            night: i + 1,
            lodging: nightAt(i + 1),
            ranked: rankedFor(i + 1),
            airbnbHref: airbnbFor(i + 1),
          }))}
          nameOf={(id) => byId.get(id)?.nameZh ?? id}
          tripIds={allIds}
          permitOf={(id) => byId.get(id)?.permit}
          closedNoteOf={(id) => byId.get(id)?.closedNote}
          activities={activities.filter((activity) => guideParkList.some((p) => p.code === activity.park))}
          attractionExists={(id) => byId.has(id)}
          text={text}
        />
      )}

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="space-y-6 lg:col-span-7">
          {trip.pool.length > 0 && (
            <section className="border border-dashed border-ink/30 p-6">
              <h2 className="font-serif text-xl">{fill(t.pool, { n: trip.pool.length })}</h2>
              <p className="mt-1 text-xs text-mute">{t.poolHint}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {trip.pool.map((id) => (
                  <li key={id} className="flex items-center gap-1 border border-line bg-paper py-1 pr-1 pl-3 text-xs">
                    {byId.get(id)?.nameZh ?? id}
                    <button
                      type="button"
                      aria-label={t.actions.remove}
                      title={t.actions.remove}
                      className="p-1 text-mute hover:text-ink"
                      onClick={() => removeFromTrip(id)}
                    >
                      <IconClose />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plannedCount > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-mute">
              <IconGrip /> {t.dragHint}
            </p>
          )}

          {dayViews.map((view) => {
            const night = view.day + 1;
            const parkNames = [...new Set(view.rows.map((row) => row.stop.park))].map(
              (code) => parkByCode.get(code)?.nameZh ?? code,
            );
            return (
              <DayCard
                key={view.day}
                view={view}
                color={dayColor(view.day)}
                dayCount={trip.days.length}
                itemCount={trip.days[view.day].length}
                dateLabel={trip.startDate ? dateFormat.format(new Date(`${dateOf(view.day)}T00:00:00Z`)) : null}
                parkNames={parkNames}
                text={text}
                selectedId={selectedId}
                openId={openId}
                details={(stop) => detailsFor(stop, view.date ? monthOf(view.date) : tripMonth, () => setOpenId(null))}
                onSelect={(id) => selectInList(view.day, id)}
                onEdit={updateTrip}
                mapsUrl={(stop) => googleMapsUrl(stop, parkNameEn(stop.park))}
                drag={drag}
                header={
                  view.day === 0 && view.rows.length > 0 ? (
                    <LodgingSelector
                      label={t.lodging.start}
                      hint={t.lodging.startHint}
                      current={view.from}
                      ranked={rankedFor(0)}
                      searchNear={searchNearFor(0)}
                      text={text}
                      onChange={(lodging) => updateTrip((current) => setNight(current, 0, lodging))}
                      measure={measure}
                      airbnbHref={airbnbFor(0)}
                    />
                  ) : undefined
                }
                footer={
                  <LodgingSelector
                    label={(() => {
                      const lodging = trip.nights[night];
                      return lodging?.kind === "custom" && lodging.endpoint === "destination"
                        ? t.lodging.end
                        : t.lodging.tonight;
                    })()}
                    current={view.to}
                    ranked={rankedFor(night)}
                    previous={trip.nights[night - 1]}
                    searchNear={searchNearFor(night)}
                    text={text}
                    onChange={(lodging) => updateTrip((current) => setNight(current, night, lodging))}
                    measure={measure}
                    airbnbHref={night < trip.dayCount ? airbnbFor(night) : undefined}
                  />
                }
              />
            );
          })}

          {plannedCount > 0 && trip.days.length > 1 && (
            <section className={`${card} p-6`}>
              <h2 className="font-serif text-xl">{t.replan}</h2>
              <p className="mt-1 text-xs leading-6 text-mute">{t.replanHint}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  {t.replanToday}
                  <select
                    value={Math.min(today, trip.days.length - 1)}
                    onChange={(event) => setToday(Number(event.target.value))}
                    className={select}
                  >
                    {trip.days.map((_, day) => (
                      <option key={day} value={day}>
                        {fill(t.day, { n: day + 1 })}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className={buttonPrimary} onClick={() => runPlan(Math.min(today, trip.days.length - 1))}>
                  {t.replanButton}
                </button>
              </div>
            </section>
          )}

          <section className="border-t border-ink pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl">{t.add}</h2>
              <select
                value={pickerPark}
                aria-label={t.addPlaceholder}
                onChange={(event) => setPickedPark(event.target.value)}
                className={select}
              >
                {parks.map((park) => (
                  <option key={park.code} value={park.code}>
                    {park.nameZh}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-mute">{t.addHint}</p>
            <ul className="mt-4 divide-y divide-line">
              {attractions
                .filter((a) => a.park === pickerPark)
                .map((a) => (
                  <li key={a.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="group/stop min-w-0 text-left"
                        aria-expanded={browseId === a.id}
                        onClick={() => toggleBrowse(a.id)}
                      >
                        <span className="mr-2 inline-block size-1.5 rounded-full align-middle" style={{ backgroundColor: KIND_COLORS[a.kind] }} />
                        <span className="font-serif text-base group-hover/stop:text-clay-700">{a.nameZh}</span>
                        {a.mustSee && <span className="ml-1.5 text-[11px] text-clay-600">★</span>}
                        <span className="ml-2 text-xs text-mute">{duration(a.durationMin)}</span>
                        {a.hotRank !== undefined && (
                          <span className="ml-2 text-xs text-clay-700">{fill(text.attraction.hotRank, { n: a.hotRank })}</span>
                        )}
                        <span className="ml-2 text-xs text-ink-soft group-hover/stop:text-clay-700">
                          {browseId === a.id ? t.hideDetails : t.showDetails}
                        </span>
                      </button>
                      <AddToTripButton id={a.id} text={text.trip} />
                    </div>
                    {browseId === a.id && <div className="mt-3">{detailsFor(a, tripMonth, () => setBrowseId(null))}</div>}
                  </li>
                ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-4 lg:sticky lg:top-24">
            {trip.days.length > 1 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-label={t.showOnMap}>
                <button type="button" className={chip(showAll)} aria-pressed={showAll} onClick={() => {
                    setMapDay(ALL_DAYS);
                    setSelectedId(null);
                  }}
                >
                  {t.wholeTrip}
                </button>
                {trip.days.map((_, day) => (
                  <button
                    key={day}
                    type="button"
                    className={chip(!showAll && day === mapIndex)}
                    aria-pressed={!showAll && day === mapIndex}
                    onClick={() => {
                      setMapDay(day);
                      setSelectedId(null);
                    }}
                  >
                    {fill(t.day, { n: day + 1 })}
                  </button>
                ))}
              </div>
            )}
            <ParkMap
              points={mapPoints}
              trails={mapTrails}
              highlightTrailId={selectedId}
              legs={mapLegs}
              legend={mapLegend}
              fitKey={showAll ? "all" : String(mapIndex)}
              selectedId={selectedId}
              onSelect={(id) => {
                if (!id.startsWith("lodging-")) selectOnMap(id);
              }}
              text={text.map}
              className="h-96 lg:h-[calc(100vh-10rem)]"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-mute">{t.credit}</p>
    </div>
  );
}
