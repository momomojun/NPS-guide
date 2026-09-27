"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
import { IconBed, IconClose, IconGrip } from "@/components/icons";
import { ParkMap, type MapLeg, type MapPoint, type MapTrail } from "@/components/map/park-map";
import { SectionNav, type SectionLink } from "@/components/site/section-nav";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import type { ParkActivity } from "@/data/activities";
import type { Airport } from "@/data/airports";
import type { AttractionWithPhoto } from "@/data/attractions";
import { googleMapsUrl } from "@/data/attractions/google";
import type { Photo } from "@/data/attractions/types";
import { climate } from "@/data/climate.generated";
import type { LodgingOption } from "@/data/lodging";
import type { ServicePoint } from "@/data/services.generated";
import { fill, formatDuration } from "@/i18n/format";
import { addDays, monthOf, nominalDate } from "@/lib/dates";
import { airbnbUrl } from "@/lib/airbnb";
import { alertsForStop, type AlertsResponse } from "@/lib/alert-match";
import { flightKey, useFlightStore } from "@/lib/flight-store";
import { generateTrip, guideParks } from "@/lib/generate-trip";
import { drivingMinutesFrom, drivingRoute, type DrivingRoute } from "@/lib/osrm-client";
import { buildTimeline, NOMINAL_SUN, rankLodging, type PlanStop } from "@/lib/planner";
import { formatClock, minutesOfDay, sunTimes } from "@/lib/sun";
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
import { useTripPrefs } from "@/lib/trip-prefs";
import { useJson, useJsonAll, useToday } from "@/lib/use-json";
import type { GasPrices } from "@/lib/prices/gas";
import type { WeatherResponse } from "@/lib/weather-types";
import { computeBudget, type BudgetNight } from "./budget";
import { DayCard } from "./day-card";
import { dayColor } from "./day-colors";
import { daysBetween, FlightsCar, tripFlight } from "./flights-car";
import { GuideSummary } from "./guide-summary";
import { LodgingSelector } from "./lodging-selector";
import { StopDetails } from "./stop-details";
import { TripAlerts } from "./trip-alerts";
import { TripBudget } from "./trip-budget";
import { TripOverview } from "./trip-overview";
import { SERVICE_COLORS, SERVICE_KINDS, TripSupplies, type SupplyEntry, type SupplyStay } from "./trip-supplies";
import { TripTools } from "./trip-tools";
import { TripWizard, useRequestedPark, type WizardInput, type WizardPlace } from "./trip-wizard";
import type { DayView, DragSpot, PlannerPark, PlannerText, ResolvedLodging, SunInfo } from "./types";
import { alertCovers, type DayWeather } from "./weather";
import { weatherNotes } from "./weather-line";

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
  servicesUpdated,
  text,
  locale,
}: {
  attractions: AttractionWithPhoto[];
  parks: PlannerPark[];
  lodgingOptions: LodgingOption[];
  airports: Record<string, Airport>;
  /** 各公园的特别活动，攻略说明里按月份列出 */
  activities: ParkActivity[];
  /** 补给点数据的日期 */
  servicesUpdated: string;
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
  const [roadRoutes, setRoadRoutes] = useState<Record<string, DrivingRoute | null>>({});
  const [showSupplies, setShowSupplies] = useState(false);
  const prefs = useTripPrefs();
  const flightStore = useFlightStore();
  const todayDate = useToday();

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
  // 从公园页“用这个公园生成攻略”过来，或者行程还是空的，就展开生成攻略
  const requestedPark = useRequestedPark();
  const showWizard = wizardOpen ?? (allIds.length === 0 || requestedPark !== null);
  const hasStops = trip.days.some((day) => day.length > 0);
  const sectionLinks: SectionLink[] = [
    { id: "plan-wizard", label: t.nav.wizard },
    ...(hasStops ? [{ id: "plan-overview", label: t.nav.overview }] : []),
    ...(trip.guide && allIds.length > 0 ? [{ id: "plan-guide", label: t.nav.guide }] : []),
    ...trip.days.map((_, day) => ({ id: `plan-day-${day}`, label: fill(t.day, { n: day + 1 }), color: dayColor(day) })),
    ...(hasStops
      ? [
          { id: "plan-supplies", label: t.nav.supplies },
          { id: "plan-flights", label: t.nav.flights },
          { id: "plan-budget", label: t.nav.budget },
        ]
      : []),
    { id: "plan-add", label: t.nav.add },
    // 宽屏时地图一直在右边，只有手机上地图在最下面，才需要跳过去
    { id: "plan-map", label: t.nav.map, mobileOnly: true },
  ];
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
      routesHref={`/${locale}/routes?park=${stop.park}`}
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
  // 每天的开车路线：前一晚住处 → 各景点的停车场 / 步道口（再沿步道走到景点）→ 当晚住处。地图和油费都用
  const allRoutes = scheduledDays
    .map((view) => ({
      day: view.day,
      points: [
        ...(view.from ? [view.from] : []),
        ...view.rows.map(({ stop }) => stop.start ?? stop),
        ...(view.to ? [view.to] : []),
      ],
    }))
    .filter((route) => route.points.length > 1);
  const pointIds = new Set<string>();
  const addPoint = (point: MapPoint) => {
    if (pointIds.has(point.id)) return;
    pointIds.add(point.id);
    mapPoints.push(point);
  };
  for (const view of mapViews) {
    if (view.from) addPoint(lodgingPoint(view.from));
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
    });
    if (view.to) addPoint(lodgingPoint(view.to));
  }
  if (mapViews.length === 0) {
    for (const id of allIds) {
      const stop = byId.get(id);
      if (stop) addPoint({ id, lat: stop.lat, lon: stop.lon, label: stop.nameZh, sublabel: stop.nameEn, color: KIND_COLORS[stop.kind] });
    }
  }

  const keyOf = (points: { lat: number; lon: number }[]) =>
    points.map((p) => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(";");
  const routeKeys = allRoutes.map((route) => keyOf(route.points));
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
          const route = await drivingRoute(key);
          setRoadRoutes((current) => ({ ...current, [key]: route }));
        } catch {
          setRoadRoutes((current) => ({ ...current, [key]: null }));
        } finally {
          pendingRoutes.current.delete(key);
        }
      }
    })();
  }, [routeKeyList, roadRoutes]);
  const mapDays = new Set(mapViews.map((view) => view.day));
  const shownRoutes = allRoutes.flatMap((route, k) => (mapDays.has(route.day) ? [{ ...route, key: routeKeys[k] }] : []));
  const mapLegs: MapLeg[] = shownRoutes.map((route) => {
    const road = roadRoutes[route.key];
    return {
      id: `day-${route.day}`,
      color: dayColor(route.day),
      path: road?.path ?? route.points.map((p) => [p.lon, p.lat] as [number, number]),
      straight: !road,
    };
  });
  const mapLegend = showAll
    ? shownRoutes.map((route) => ({ color: dayColor(route.day), label: fill(t.day, { n: route.day + 1 }) }))
    : undefined;
  // 全程公里数：有真实路线用路线长度，还没查到的按车程估（平均时速 65 公里）
  let totalKm = 0;
  let distanceEstimated = false;
  allRoutes.forEach((route, k) => {
    const road = roadRoutes[routeKeys[k]];
    if (road) totalKm += road.km;
    else {
      totalKm += (dayViews[route.day].timeline.driveMin * 65) / 60;
      distanceEstimated = true;
    }
  });
  const parkNameEn = (code: string) => parkByCode.get(code)?.nameEn ?? "";
  const parkName = (code: string) => parkByCode.get(code)?.nameZh ?? code;
  const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));

  // 行程里的公园，按第一次去的顺序
  const stopParks = [...new Set(dayViews.flatMap((view) => view.rows.map((row) => row.stop.park)))];
  const lastStop = dayViews.flatMap((view) => view.rows).at(-1)?.stop;

  // NPS 实时公告：按景点英文名、片区名对到行程里的景点
  const alertsUrl = stopParks.length ? `/api/alerts?parks=${[...stopParks].sort().join(",")}&locale=${locale}` : null;
  const alertsData = useJson<AlertsResponse>(alertsUrl);
  const parkAlerts = alertsData?.alerts ?? [];
  const alertsOf = (stop: AttractionWithPhoto) => alertsForStop(stop, parkAlerts);
  const affected = new Map<string, string[]>();
  for (const view of dayViews) {
    for (const { stop } of view.rows) {
      for (const alert of alertsOf(stop)) affected.set(alert.id, [...(affected.get(alert.id) ?? []), stop.nameZh]);
    }
  }

  // 天气：定了具体日期、16 天以内的用预报（每天一个地点：第一站，没有就用住处），其他用往年同期
  const weatherPlace = (view: DayView) => view.rows[0]?.stop ?? view.to ?? view.from;
  const forecastEnd = todayDate ? addDays(todayDate, 15) : null;
  const pointKey = (place: { lat: number; lon: number }) => `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
  const forecastKeys =
    trip.startDate && todayDate && forecastEnd
      ? [
          ...new Set(
            dayViews.flatMap((view) => {
              const date = dateOf(view.day)!;
              const place = weatherPlace(view);
              return date >= todayDate && date <= forecastEnd && place ? [pointKey(place)] : [];
            }),
          ),
        ]
      : [];
  const weatherUrl = forecastKeys.length ? `/api/weather?points=${forecastKeys.join("|")}` : null;
  const weatherData = useJson<WeatherResponse>(weatherUrl);
  /** 算往年同期用哪个景点的片区：这天的第一站，没有就往前找 */
  const climateStop = (day: number) => {
    for (let d = day; d >= 0; d--) {
      const stop = dayViews[d].rows[0]?.stop;
      if (stop) return stop;
    }
    return dayViews.find((view) => view.rows.length > 0)?.rows[0]?.stop;
  };
  const dayWeather: (DayWeather | undefined)[] = dayViews.map((view) => {
    const date = dateOf(view.day);
    const place = weatherPlace(view);
    if (date && place && todayDate && weatherData) {
      const i = forecastKeys.indexOf(pointKey(place));
      const entry = i >= 0 ? weatherData.forecasts[i]?.find((forecast) => forecast.date === date) : undefined;
      if (entry) {
        const alerts = (weatherData.alerts[i] ?? []).filter((alert) => alertCovers(alert, date, todayDate));
        return { kind: "forecast", day: entry, alerts };
      }
    }
    const stop = climateStop(view.day);
    if (!view.date || !stop) return undefined;
    const areas = climate[stop.park];
    const area = areas?.[stop.area] ?? (areas ? Object.values(areas)[0] : undefined);
    const month = monthOf(view.date);
    return area ? { kind: "climate", month, climate: area.months[month - 1] } : undefined;
  });

  // 总览里“要注意”：预报按天说，往年同期按公园说一次，再加上提到行程景点的公告
  const liveNotes: string[] = [];
  const climateSeen = new Set<string>();
  dayViews.forEach((view, day) => {
    const weather = dayWeather[day];
    if (!weather || view.rows.length === 0) return;
    for (const note of weatherNotes(weather, text)) {
      if (weather.kind === "forecast") {
        liveNotes.push(fill(t.overview.weatherDay, { day: day + 1, note }));
        continue;
      }
      const park = view.rows[0].stop.park;
      if (climateSeen.has(park + note)) continue;
      climateSeen.add(park + note);
      liveNotes.push(fill(t.overview.weatherPark, { park: parkName(park), note }));
    }
  });
  const alertStops = [...new Set([...affected.values()].flat())];
  if (alertStops.length) liveNotes.push(fill(t.overview.alertStops, { names: alertStops.join("、") }));

  // 补给点：按公园取，住处附近的超市、加油、快充、亚洲超市和餐厅
  const serviceUrls = stopParks.map((code) => `/api/services/${code}`);
  const serviceResults = useJsonAll<ServicePoint[]>(serviceUrls);
  const supplyPoints = serviceUrls.every((url) => url in serviceResults)
    ? serviceUrls.flatMap((url) => serviceResults[url] ?? [])
    : undefined;
  const supplyStays: SupplyStay[] = [];
  for (let night = 1; night <= trip.dayCount; night++) {
    const lodging = nightAt(night);
    if (!lodging || lodging.endpoint) continue;
    const last = supplyStays.at(-1);
    if (last && last.id === lodging.id && last.nights.at(-1) === night - 1) last.nights.push(night);
    else supplyStays.push({ id: lodging.id, nights: [night], name: lodging.name, lat: lodging.lat, lon: lodging.lon });
  }
  const supplyEntries: SupplyEntry[] = stopParks.flatMap((code) => {
    const stop = dayViews.flatMap((view) => view.rows).find((row) => row.stop.park === code)?.stop;
    if (!stop) return [];
    const at = stop.start ?? stop;
    return [{ park: code, parkName: parkName(code), stop: { nameZh: stop.nameZh, lat: at.lat, lon: at.lon } }];
  });
  // 地图上显示补给点：只画行程上各点附近的
  const supplyExtras: MapPoint[] =
    showSupplies && supplyPoints
      ? supplyPoints
          .filter((point) => mapPoints.some((shown) => !shown.small && distanceKm(shown, point) < 20))
          .slice(0, 600)
          .map((point, i) => ({
            id: `supply-${i}`,
            lat: point.lat,
            lon: point.lon,
            label: point.name,
            color: SERVICE_COLORS[point.kind],
          }))
      : [];
  const supplyLegend = SERVICE_KINDS.map((kind) => ({ color: SERVICE_COLORS[kind], label: t.supplies.kinds[kind] }));

  // 机票和租车：第 1 天一早从机场出发，去程按前一天到；最后一天 17 点前回到机场就坐当晚的航班，否则第二天
  const firstDate = trip.startDate || (trip.month ? nominalDate(trip.month) : "");
  const lastReturn = dayViews.at(-1)?.timeline.returnAt;
  const sameDayReturn = lastReturn !== undefined && lastReturn <= 17 * 60;
  const outDate = firstDate ? addDays(firstDate, -1) : null;
  const lastDate = firstDate ? addDays(firstDate, trip.dayCount - 1) : null;
  const backDate = lastDate ? (sameDayReturn ? lastDate : addDays(lastDate, 1)) : null;
  const endpointAirport = (lodging: TripLodging | null | undefined, role: "origin" | "destination") =>
    lodging?.kind === "custom" && lodging.endpoint === role
      ? airports[lodging.id.slice(`custom-${role}-`.length)]
      : undefined;
  const tripArrive = endpointAirport(trip.nights[0], "origin");
  const tripLeave = endpointAirport(trip.nights[trip.dayCount], "destination");
  const firstPark = parkByCode.get(stopParks[0] ?? "");
  const lastPark = parkByCode.get(lastStop?.park ?? "");
  const arriveAirport = tripArrive ?? (firstPark ? airports[firstPark.airports[0]] : undefined);
  const leaveAirport = tripLeave ?? tripArrive ?? (lastPark ? airports[lastPark.airports[0]] : undefined);
  const home = prefs.homeAirport;
  const mainFlight =
    home && arriveAirport && leaveAirport && outDate && backDate
      ? tripFlight(home, arriveAirport.code, leaveAirport.code, outDate, backDate, prefs.travelers)
      : null;
  const mainFlightPrice = mainFlight ? flightStore[flightKey(mainFlight)]?.quotes[0]?.price : undefined;
  const flightRoute =
    mainFlight && arriveAirport && leaveAirport
      ? arriveAirport.code === leaveAirport.code
        ? `${home} ⇄ ${arriveAirport.code}`
        : `${home} → ${arriveAirport.code} · ${leaveAirport.code} → ${home}`
      : undefined;
  const rentalDays = outDate && backDate ? daysBetween(outDate, backDate) : trip.dayCount;

  // 实时油价（价格页同一个接口），读不到就用快照
  const gasData = useJson<GasPrices>(hasStops ? "/api/prices/gas" : null);
  // 预算：没定住处的晚上也算一晚（按其他几晚的平均）；最后一晚是回程机场就不算
  const budgetNights: BudgetNight[] = [];
  for (let night = 1; night <= trip.dayCount; night++) {
    const lodging = trip.nights[night];
    const endpoint = lodging?.kind === "custom" && lodging.endpoint;
    if (endpoint || (night === trip.dayCount && !lodging)) continue;
    const date = refDateOf(night - 1);
    budgetNights.push({
      lodgingId: lodging?.kind === "option" ? lodging.id : undefined,
      month: date ? monthOf(date) : todayDate ? monthOf(todayDate) : 7,
    });
  }
  const budget = computeBudget({
    prefs,
    parks: stopParks.flatMap((code) => {
      const park = parkByCode.get(code);
      return park ? [{ code, nonresidentSurcharge: park.nonresidentSurcharge }] : [];
    }),
    nights: budgetNights,
    dayCount: trip.dayCount,
    km: totalKm,
    rentalDays,
    pickup: prefs.flyAndRent ? arriveAirport?.code : undefined,
    flights: mainFlightPrice,
    gas: gasData ? Object.fromEntries(Object.entries(gasData.states).map(([state, fuel]) => [state, fuel.regular])) : undefined,
  });

  // 离线保存时一起存的数据
  const offlineUrls = [
    ...(alertsUrl ? [alertsUrl] : []),
    ...(weatherUrl ? [weatherUrl] : []),
    ...serviceUrls,
    ...stopParks.map((code) => `/api/gallery/${code}`),
  ];

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

      <SectionNav label={t.nav.label} items={sectionLinks} inset />

      <section id="plan-wizard" className="scroll-mt-32 border-t border-ink pt-6 print:hidden">
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

      <div className={`${card} flex flex-wrap items-end gap-x-8 gap-y-5 p-6 print:hidden`}>
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
        {hasStops && <TripTools dataUrls={offlineUrls} text={text} />}
      </div>

      {allIds.length === 0 && (
        <p className="border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">{t.empty}</p>
      )}

      {hasStops && (
        <TripOverview
          views={dayViews}
          dateLabels={dayViews.map((view) =>
            trip.startDate ? dateFormat.format(new Date(`${dateOf(view.day)}T00:00:00Z`)) : null,
          )}
          parkName={parkName}
          month={tripMonth}
          startDate={trip.startDate}
          dayCount={trip.dayCount}
          text={text}
          onJump={(day) => document.getElementById(`plan-day-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          extraNotes={liveNotes}
          budget={{ total: budget.total, perPerson: budget.perPerson }}
        >
          <TripAlerts
            alerts={parkAlerts}
            affected={affected}
            failed={alertsData?.failed ?? []}
            loading={alertsData === undefined}
            parkName={parkName}
            text={text}
          />
        </TripOverview>
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
            <section className="border border-dashed border-ink/30 p-6 print:hidden">
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
            <p className="flex items-center gap-1.5 text-xs text-mute print:hidden">
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
                weather={dayWeather[view.day]}
                alertsFor={alertsOf}
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
            <section className={`${card} p-6 print:hidden`}>
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

          {hasStops && (
            <TripSupplies
              stays={supplyStays}
              entries={supplyEntries}
              points={supplyPoints}
              showOnMap={showSupplies}
              onToggleMap={setShowSupplies}
              updated={servicesUpdated}
              text={text}
            />
          )}
          {hasStops && (
            <FlightsCar
              prefs={prefs}
              arrive={arriveAirport}
              leave={leaveAirport}
              fromTrip={Boolean(tripArrive)}
              firstPark={firstPark}
              lastPark={lastPark}
              airports={airports}
              outDate={outDate}
              backDate={backDate}
              sameDayReturn={sameDayReturn}
              returnTime={lastReturn !== undefined ? formatClock(lastReturn) : undefined}
              monthOnly={trip.startDate ? null : (trip.month ?? null)}
              formatDate={formatDate}
              store={flightStore}
              text={text}
              locale={locale}
            />
          )}
          {hasStops && (
            <TripBudget
              budget={budget}
              prefs={prefs}
              parkName={parkName}
              stateName={(code) => t.budget.states[code] ?? code}
              pickup={arriveAirport?.code}
              rentalDays={rentalDays}
              flightRoute={flightRoute}
              distanceEstimated={distanceEstimated}
              dayCount={trip.dayCount}
              fuelDate={gasData?.date}
              text={text}
            />
          )}

          <section id="plan-add" className="scroll-mt-32 border-t border-ink pt-5 print:hidden">
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

        <div className="lg:col-span-5 print:hidden">
          <div id="plan-map" className="scroll-mt-32 space-y-4 lg:sticky lg:top-32">
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
              extras={supplyExtras}
              extrasLegend={supplyLegend}
              selectedId={selectedId}
              onSelect={(id) => {
                if (!id.startsWith("lodging-")) selectOnMap(id);
              }}
              text={text.map}
              className="h-96 lg:h-[calc(100vh-12rem)]"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-mute">{t.credit}</p>
    </div>
  );
}
