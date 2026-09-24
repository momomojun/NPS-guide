"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";

export interface MapPoint {
  id: string;
  lat: number;
  lon: number;
  label: string;
  /** 第二行小字，一般是英文名，方便对照 Google Maps */
  sublabel?: string;
  color: string;
  /** 必去景点画大一点，标签优先显示 */
  emphasis?: boolean;
  /** 圆点里显示的字：行程序号，或住处的“住” */
  badge?: string;
  /** 小白点（步道口），不显示标签、不能点 */
  small?: boolean;
}

export interface MapTrail {
  id: string;
  /** [经度, 纬度] */
  path: [number, number][];
}

export interface MapText {
  map: string;
  satellite: string;
  terrain: string;
  routeNote: string;
  loading: string;
  trailLegend: string;
  roadLegend: string;
}

// 都是免费、不需要 key 的服务
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const IMAGERY_TILES =
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";
// worker 文件由 scripts/copy-maplibre-worker.mjs 复制到 public/
const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

const TRAIL_COLOR = "#b45309";
const TRAIL_HIGHLIGHT = "#dc2626";
const ROAD_COLOR = "#2563eb";

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

function pointsToGeoJSON(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.lon, point.lat] },
      properties: {
        id: point.id,
        label: point.label,
        color: point.color,
        emphasis: point.emphasis ?? false,
        small: point.small ?? false,
        ...(point.sublabel ? { sublabel: point.sublabel } : {}),
        ...(point.badge === undefined ? {} : { badge: point.badge }),
      },
    })),
  };
}

function linesToGeoJSON(lines: { id: string; coordinates: [number, number][] }[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: lines
      .filter((line) => line.coordinates.length > 1)
      .map((line) => ({
        type: "Feature",
        geometry: { type: "LineString", coordinates: line.coordinates },
        properties: { id: line.id },
      })),
  };
}

function fitToPoints(map: MapLibreMap, points: MapPoint[], animate: boolean) {
  if (points.length === 0) return;
  const duration = animate ? 600 : 0;
  if (points.length === 1) {
    map.easeTo({ center: [points[0].lon, points[0].lat], zoom: 11, duration });
    return;
  }
  const lons = points.map((p) => p.lon);
  const lats = points.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ],
    { padding: 64, maxZoom: 13, duration },
  );
}

export function ParkMap({
  points,
  selectedId = null,
  onSelect,
  trails,
  highlightTrailId = null,
  route,
  roadPath,
  text,
  className = "",
  children,
}: {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** 徒步路线 */
  trails?: MapTrail[];
  /** 高亮哪条步道（一般是选中的景点） */
  highlightTrailId?: string | null;
  /** 按顺序用虚线连起来（行程模式，还没拿到真实道路时） */
  route?: { lat: number; lon: number }[];
  /** 真实开车路线 [经度, 纬度]，有它就不画虚线 */
  roadPath?: [number, number][];
  text: MapText;
  className?: string;
  /** 叠在地图上的内容，比如选中景点的卡片 */
  children?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // 只有点的集合变了才重新缩放，改状态、切选中不会让地图乱跳
  const fittedKeyRef = useRef("");
  const [ready, setReady] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [terrain, setTerrain] = useState(false);

  const handleSelect = useEffectEvent((id: string) => onSelect?.(id));

  // 地图只初始化一次；maplibre-gl 依赖浏览器环境，动态加载
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;

    import("maplibre-gl").then(({ Map, NavigationControl, ScaleControl, AttributionControl, setWorkerUrl }) => {
      if (cancelled || !containerRef.current) return;
      setWorkerUrl(WORKER_URL);
      const instance = new Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [-116, 37.5],
        zoom: 5,
        attributionControl: false,
      });
      map = instance;
      instance.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
      instance.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");
      instance.addControl(new AttributionControl({ compact: true }), "bottom-right");

      instance.on("load", () => {
        // 地形阴影和卫星图插在文字标注下面
        const firstLabel = instance.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
        const dem = {
          type: "raster-dem" as const,
          tiles: [TERRAIN_TILES],
          encoding: "terrarium" as const,
          tileSize: 256,
          maxzoom: 14,
          attribution: "Terrain: Mapzen / AWS Open Data",
        };
        instance.addSource("hillshade-dem", dem);
        instance.addSource("terrain-dem", dem);
        instance.addLayer(
          {
            id: "hillshade",
            type: "hillshade",
            source: "hillshade-dem",
            paint: { "hillshade-exaggeration": 0.35, "hillshade-shadow-color": "#473b24" },
          },
          firstLabel,
        );
        instance.addSource("imagery", {
          type: "raster",
          tiles: [IMAGERY_TILES],
          tileSize: 256,
          maxzoom: 16,
          attribution: "USGS The National Map",
        });
        instance.addLayer(
          { id: "imagery", type: "raster", source: "imagery", layout: { visibility: "none" } },
          firstLabel,
        );

        instance.addSource("road", { type: "geojson", data: EMPTY });
        instance.addLayer({
          id: "road",
          type: "line",
          source: "road",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": ROAD_COLOR, "line-width": 4, "line-opacity": 0.75 },
        });
        instance.addSource("trails", { type: "geojson", data: EMPTY });
        instance.addLayer({
          id: "trails",
          type: "line",
          source: "trails",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": TRAIL_COLOR, "line-width": 2.5, "line-dasharray": [2, 1.2] },
        });
        instance.addLayer({
          id: "trails-highlight",
          type: "line",
          source: "trails",
          filter: ["==", ["get", "id"], ""],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": TRAIL_HIGHLIGHT, "line-width": 4.5 },
        });
        instance.addSource("route", { type: "geojson", data: EMPTY });
        instance.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": "#0f766e", "line-width": 2.5, "line-dasharray": [2, 2] },
        });
        instance.addSource("points", { type: "geojson", data: EMPTY });
        instance.addLayer({
          id: "points-selected",
          type: "circle",
          source: "points",
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 15,
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#111827",
          },
        });
        instance.addLayer({
          id: "points",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": [
              "case",
              ["==", ["get", "small"], true],
              3.5,
              ["has", "badge"],
              10,
              ["==", ["get", "emphasis"], true],
              8,
              6,
            ],
            "circle-color": ["get", "color"],
            "circle-stroke-width": ["case", ["==", ["get", "small"], true], 1.5, 2],
            "circle-stroke-color": ["case", ["==", ["get", "small"], true], "#57534e", "#ffffff"],
          },
        });
        instance.addLayer({
          id: "points-badge",
          type: "symbol",
          source: "points",
          filter: ["has", "badge"],
          layout: {
            "text-field": ["get", "badge"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#ffffff" },
        });
        instance.addLayer({
          id: "points-label",
          type: "symbol",
          source: "points",
          filter: ["!=", ["get", "small"], true],
          layout: {
            // 中文名一行，英文名小一号放第二行
            "text-field": [
              "case",
              ["has", "sublabel"],
              ["format", ["get", "label"], {}, "\n", {}, ["get", "sublabel"], { "font-scale": 0.8 }],
              ["get", "label"],
            ],
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
            "text-offset": [0, 1.1],
            "text-anchor": "top",
            "text-optional": true,
            "symbol-sort-key": ["case", ["==", ["get", "emphasis"], true], 0, 1],
          },
          paint: { "text-color": "#1c1917", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        });

        instance.on("click", "points", (event) => {
          const feature = event.features?.[0];
          const id = feature?.properties?.id;
          if (typeof id === "string" && feature?.properties?.small !== true) handleSelect(id);
        });
        instance.on("mouseenter", "points", () => {
          instance.getCanvas().style.cursor = "pointer";
        });
        instance.on("mouseleave", "points", () => {
          instance.getCanvas().style.cursor = "";
        });

        mapRef.current = instance;
        setReady(true);
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("points") as GeoJSONSource).setData(pointsToGeoJSON(points));
    (map.getSource("trails") as GeoJSONSource).setData(
      linesToGeoJSON((trails ?? []).map((trail) => ({ id: trail.id, coordinates: trail.path }))),
    );
    (map.getSource("road") as GeoJSONSource).setData(
      linesToGeoJSON(roadPath ? [{ id: "road", coordinates: roadPath }] : []),
    );
    (map.getSource("route") as GeoJSONSource).setData(
      linesToGeoJSON(
        route && !roadPath ? [{ id: "route", coordinates: route.map((p) => [p.lon, p.lat] as [number, number]) }] : [],
      ),
    );
    const key = points.map((p) => p.id).join("|");
    if (key !== fittedKeyRef.current) {
      // 第一次直接跳过去，之后换点集再用动画
      fitToPoints(map, points, fittedKeyRef.current !== "");
      fittedKeyRef.current = key;
    }
  }, [ready, points, trails, route, roadPath]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter("points-selected", ["==", ["get", "id"], selectedId ?? ""]);
    map.setFilter("trails-highlight", ["==", ["get", "id"], highlightTrailId ?? ""]);
    const point = points.find((p) => p.id === selectedId);
    if (point) map.easeTo({ center: [point.lon, point.lat], zoom: Math.max(map.getZoom(), 12), duration: 800 });
  }, [ready, points, selectedId, highlightTrailId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("imagery", "visibility", satellite ? "visible" : "none");
  }, [ready, satellite]);

  useEffect(() => {
    const map = mapRef.current;
    // 只在开关真正变化时动，免得打断刚开始的缩放动画
    if (!ready || !map || terrain === (map.getTerrain() !== null)) return;
    map.setTerrain(terrain ? { source: "terrain-dem", exaggeration: 1.3 } : null);
    map.easeTo({ pitch: terrain ? 60 : 0, duration: 800 });
  }, [ready, terrain]);

  const toggle = (active: boolean) =>
    `rounded-md px-2 py-1 ${active ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"}`;
  const hasTrails = (trails?.length ?? 0) > 0;
  const showStraightRoute = !roadPath && route && route.length > 1;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 ${className}`}>
      {/* maplibre 的 CSS 会把容器设成 position: relative，所以用 h-full 而不是 inset-0 撑满 */}
      <div ref={containerRef} className={`h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`} />
      {!ready && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center text-sm text-stone-400">
          {text.loading}
        </div>
      )}
      <div className="absolute top-2 left-2 space-y-1.5">
        <div className="flex gap-1 rounded-lg bg-white/95 p-1 text-xs shadow">
          <button type="button" className={toggle(!satellite)} onClick={() => setSatellite(false)}>
            {text.map}
          </button>
          <button type="button" className={toggle(satellite)} onClick={() => setSatellite(true)}>
            {text.satellite}
          </button>
          <button
            type="button"
            className={toggle(terrain)}
            aria-pressed={terrain}
            onClick={() => setTerrain((value) => !value)}
          >
            {text.terrain}
          </button>
        </div>
        {(hasTrails || roadPath || showStraightRoute) && (
          <div className="flex w-fit flex-col gap-0.5 rounded-lg bg-white/90 px-2 py-1 text-[11px] text-stone-600 shadow">
            {roadPath && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1 w-4 rounded" style={{ backgroundColor: ROAD_COLOR }} />
                {text.roadLegend}
              </span>
            )}
            {hasTrails && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: TRAIL_COLOR }} />
                {text.trailLegend}
              </span>
            )}
            {showStraightRoute && <span>{text.routeNote}</span>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
