import { STYLE_URL, TERRAIN_TILES } from "@/components/map/sources";

// 出发前下载离线地图：按行程每天的景点和住处，算出要用到的地图瓦片和照片地址，交给 service worker 存下来。
// 底图（OpenFreeMap 矢量瓦片）：每天的范围存到 12 级，景点和住处附近 2 公里存到 14 级（瓦片最细就到 14 级）；
// 地形阴影存到 11 级；卫星图太大，不下载。照片存每个景点的主图（手机上用的两种宽度）。

type Point = { lat: number; lon: number };

/** 一天要去的地方：景点（停车点）和前后两晚的住处 */
export interface OfflineArea {
  points: Point[];
}

export interface OfflinePlan {
  urls: string[];
  tiles: number;
  photos: number;
  /** 估算的大小（MB） */
  megabytes: number;
}

const AREA_PAD_KM = 5;
const DETAIL_RADIUS_KM = 2;
const AREA_ZOOMS = [6, 7, 8, 9, 10, 11, 12];
const DETAIL_ZOOMS = [13, 14];
const TERRAIN_ZOOMS = [6, 7, 8, 9, 10, 11];
/** 估算用的平均大小（KB） */
const TILE_KB = 30;
const TERRAIN_KB = 70;
const PHOTO_KB = 120;

const tileX = (lon: number, zoom: number) => Math.floor(((lon + 180) / 360) * 2 ** zoom);
const tileY = (lat: number, zoom: number) => {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom);
};

/** 经纬度范围（向外扩 padKm）覆盖到的瓦片 */
function tilesIn(box: { south: number; west: number; north: number; east: number }, zoom: number, padKm: number, into: Set<string>) {
  const padLat = padKm / 111;
  const padLon = padKm / (111 * Math.cos((((box.north + box.south) / 2) * Math.PI) / 180));
  const x0 = tileX(box.west - padLon, zoom);
  const x1 = tileX(box.east + padLon, zoom);
  const y0 = tileY(box.north + padLat, zoom);
  const y1 = tileY(box.south - padLat, zoom);
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) into.add(`${zoom}/${x}/${y}`);
}

function boxOf(points: Point[]) {
  return {
    south: Math.min(...points.map((p) => p.lat)),
    north: Math.max(...points.map((p) => p.lat)),
    west: Math.min(...points.map((p) => p.lon)),
    east: Math.max(...points.map((p) => p.lon)),
  };
}

/** 两组瓦片：底图（每天的范围 + 景点附近的细节）和地形 */
export function tilesFor(areas: OfflineArea[]): { base: string[]; terrain: string[] } {
  const base = new Set<string>();
  const terrain = new Set<string>();
  for (const area of areas) {
    if (area.points.length === 0) continue;
    const box = boxOf(area.points);
    for (const zoom of AREA_ZOOMS) tilesIn(box, zoom, AREA_PAD_KM, base);
    for (const zoom of TERRAIN_ZOOMS) tilesIn(box, zoom, AREA_PAD_KM, terrain);
    for (const point of area.points) {
      const around = { south: point.lat, north: point.lat, west: point.lon, east: point.lon };
      for (const zoom of DETAIL_ZOOMS) tilesIn(around, zoom, DETAIL_RADIUS_KM, base);
    }
  }
  return { base: [...base], terrain: [...terrain] };
}

const fill = (template: string, tile: string) => {
  const [z, x, y] = tile.split("/");
  return template.replace("{z}", z).replace("{x}", x).replace("{y}", y);
};

/**
 * 要下载的所有地址：底图样式、图标、Latin 字体（中文标注在手机本地渲染，不用下载）、瓦片索引和瓦片、地形瓦片、照片。
 * 瓦片地址里带着每周更新的版本号，要先读样式和瓦片索引才知道。
 */
export async function planOfflineDownload(areas: OfflineArea[], stopIds: string[]): Promise<OfflinePlan> {
  const style = (await fetch(STYLE_URL).then((res) => res.json())) as {
    sources: Record<string, { type: string; url?: string }>;
    sprite?: string | { id: string; url: string }[];
    glyphs?: string;
    layers: { layout?: Record<string, unknown> }[];
  };
  const urls = [STYLE_URL];

  const sprites = typeof style.sprite === "string" ? [style.sprite] : (style.sprite ?? []).map((sprite) => sprite.url);
  for (const sprite of sprites) urls.push(`${sprite}.json`, `${sprite}.png`, `${sprite}@2x.json`, `${sprite}@2x.png`);

  if (style.glyphs) {
    const stacks = new Set<string>();
    for (const layer of style.layers) {
      const font = layer.layout?.["text-font"];
      if (Array.isArray(font) && font.every((name) => typeof name === "string")) stacks.add(font.join(","));
    }
    stacks.add("Noto Sans Regular");
    for (const stack of stacks) {
      for (const range of ["0-255", "256-511"]) {
        urls.push(style.glyphs.replace("{fontstack}", encodeURIComponent(stack)).replace("{range}", range));
      }
    }
  }

  const { base, terrain } = tilesFor(areas);
  for (const source of Object.values(style.sources)) {
    if (source.type !== "vector" || !source.url) continue;
    const tileJson = (await fetch(source.url).then((res) => res.json())) as { tiles?: string[] };
    const template = tileJson.tiles?.[0];
    if (!template) continue;
    urls.push(source.url, ...base.map((tile) => fill(template, tile)));
  }
  urls.push(...terrain.map((tile) => fill(TERRAIN_TILES, tile)));
  // 照片：行程页本身不带照片，按公园读图集（图集数据也一起存下，离线时景点详情要用），每个景点存主图
  const parks = [...new Set(stopIds.map((id) => id.split("-")[0]))];
  const photoUrls: string[] = [];
  let photoCount = 0;
  for (const park of parks) {
    const galleryUrl = `/api/gallery/${park}`;
    const gallery = (await fetch(galleryUrl)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}))) as Record<string, { url: string }[]>;
    urls.push(galleryUrl);
    for (const id of stopIds) {
      const photo = gallery[id]?.[0];
      // 手机上的卡片用 960 宽，列表小图用 500 宽
      if (!photo || !id.startsWith(`${park}-`)) continue;
      photoUrls.push(photo.url, photo.url.replace("/960px-", "/500px-"));
      photoCount++;
    }
  }
  urls.push(...photoUrls);

  const tiles = base.length + terrain.length;
  return {
    urls: [...new Set(urls)],
    tiles,
    photos: photoCount,
    megabytes: Math.round((base.length * TILE_KB + terrain.length * TERRAIN_KB + photoUrls.length * PHOTO_KB) / 1024),
  };
}
