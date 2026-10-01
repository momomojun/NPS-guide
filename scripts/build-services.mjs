// 补给点：加油站、超市、亚洲超市、亚洲餐厅（OpenStreetMap，Overpass 查询），加上直流快充（NLR 充电站 API）。
// 亚洲超市 OSM 漏得多，另外合并 Overture Maps 的（scripts/data/asian-groceries.json，npm run data:asian 生成，
// 含各公园常用机场附近的几家），和 OSM 已有的重复就不要。
// 每个公园查一块范围：景点（有出发点用出发点）和推荐住宿的外包框，四边各放宽 0.3°，门户小镇都在里面。
// 输出 src/data/services.generated.ts（行程地图按公园通过 API 路由取，不打包进网页）。重新跑：npm run data:services
//
// 先查完所有公园的 OSM 补给点，再逐个查快充；每查完一个公园就写一次文件，还没查到的部分先用上次的结果。
// 快充走 api.data.gov：.env.local 里填了 DATA_GOV_API_KEY 就用，没填用 DEMO_KEY（次数很少，
// 还和网站本身共用），每个公园查 1 次，次数用完就等一会儿再查。原始返回在 node_modules/.cache 里存 12 小时，
// 这期间重跑不再请求。
//
// 只重查某几个公园：ONLY=grte,zion npm run data:services；只补快充、OSM 部分沿用上次的：SKIP_OSM=1；
// 快充也沿用上次的：SKIP_NLR=1（两个都设就只是重新合并 Overture 的亚洲超市，不联网）
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ASIAN_SHOP_NAME, CJK, PLACE_NAME, plain } from "./asian-names.mjs";
import { parks, serviceArea, serviceBox, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/services.generated.ts", import.meta.url);
const CACHE = new URL("../node_modules/.cache/nps-guide/", import.meta.url);
const ENV_FILE = new URL("../.env.local", import.meta.url);
const UPDATED = new Date().toLocaleDateString("sv"); // 形如 2026-09-26
const NLR = "https://developer.nlr.gov/api/alt-fuel-stations/v1/nearest.json";
const MAX_RADIUS_MI = 150;
const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const KINDS = ["fuel", "grocery", "asianGrocery", "asianFood", "dcFast"];

if (existsSync(ENV_FILE)) process.loadEnvFile(fileURLToPath(ENV_FILE));
const API_KEY = process.env.DATA_GOV_API_KEY || "DEMO_KEY";
const ONLY = new Set((process.env.ONLY ?? "").split(",").filter(Boolean));
const SKIP_OSM = process.env.SKIP_OSM === "1";
const SKIP_NLR = process.env.SKIP_NLR === "1";
const OVERTURE_FILE = new URL("data/asian-groceries.json", import.meta.url);
const overture = existsSync(OVERTURE_FILE) ? JSON.parse(readFileSync(OVERTURE_FILE, "utf8")) : { parks: {}, airports: {} };
const selected = (park) => ONLY.size === 0 || ONLY.has(park.code);

// ---- 分类规则 ----

/** 亚洲餐厅：按 OSM 的 cuisine 标签（分号分隔，可能是 pan_asian、korean_bbq 这种组合），不收夏威夷 poke */
const ASIAN_CUISINES = new Set([
  "chinese",
  "japanese",
  "korean",
  "vietnamese",
  "thai",
  "asian",
  "sushi",
  "ramen",
  "noodle",
  "noodles",
  "pho",
  "dim_sum",
  "filipino",
  "taiwanese",
  "indian",
  // 同一类的：日式照烧（华盛顿州很多）、饺子、火锅、各地菜系、东南亚和南亚菜
  "teriyaki",
  "dumpling",
  "dumplings",
  "hot_pot",
  "hotpot",
  "udon",
  "izakaya",
  "hibachi",
  "teppanyaki",
  "bento",
  "yakitori",
  "yakiniku",
  "curry",
  "cantonese",
  "sichuan",
  "szechuan",
  "hunan",
  "shanghai",
  "mongolian",
  "malaysian",
  "indonesian",
  "singaporean",
  "burmese",
  "lao",
  "laotian",
  "cambodian",
  "nepalese",
  "nepali",
  "himalayan",
  "pakistani",
  "bangladeshi",
  "sri_lankan",
]);
/** 印第安玉米饼之类，不是印度菜 */
const NOT_ASIAN_CUISINES = new Set(["american_indian", "indian_taco", "indian_tacos", "indian_fry_bread"]);
/** 夏威夷 poke 店常顺带标 japanese / asian，也不算 */
const POKE = /\bpok[eé]\b|\bpoki/i;

function asianCuisine(cuisine) {
  const tokens = cuisine
    .toLowerCase()
    .split(/[;,]/)
    .map((token) => token.trim().replace(/\s+/g, "_"));
  if (tokens.some((token) => token.split("_").includes("poke"))) return false;
  return tokens.some(
    (token) =>
      !NOT_ASIAN_CUISINES.has(token) && (ASIAN_CUISINES.has(token) || token.split("_").some((part) => ASIAN_CUISINES.has(part))),
  );
}

/** 没标 cuisine 的餐厅，店名明显是亚洲菜才算（Indian 常是地名，只认 India） */
const ASIAN_FOOD_NAME =
  /\b(pho|sushi|ramen|teriyaki|thai|chinese|china|japanese|korean|vietnamese|szechuan|sichuan|hunan|mandarin|dim sum|noodles?|wok|panda express|kimchi|bento|dumplings?|hibachi|teppanyaki|asian|oriental|tandoori?|masala|india|nepal(i|ese)?|himalayan?|saigon|hanoi|bangkok|siam|tokyo|kyoto|osaka|seoul|shanghai|peking|beijing|hong kong|manila|filipino|udon|izakaya|bulgogi|bibimbap|banh mi)\b/i;

/** 能买日常食品的大店：沃尔玛、Target、Fred Meyer，会员制的 Costco、Sam's Club */
const GROCERY_STORE_BRANDS = /walmart|target|fred meyer|costco|sam'?s club|smart ?(&|and) ?final/i;

// 店名、菜系在这边按上面的规则分；Overpass 那边不用正则筛店名（对 name 用正则要扫全球的索引，非常慢）
function overpassQuery([south, west, north, east]) {
  const box = `(${south},${west},${north},${east})`;
  return `[out:json][timeout:300];(
nwr["amenity"="fuel"]${box};
nwr["shop"~"^(supermarket|grocery|convenience|department_store|wholesale)$"]["name"]${box};
nwr["amenity"~"^(restaurant|fast_food)$"]["name"]${box};
);out center tags;`;
}

/** OSM 元素 → 补给点；不算的返回 null。rank 是城里太密时谁先留（0 优先），写文件前去掉 */
function classify(element) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat == null || lon == null) return null;
  const base = { lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 };
  const name = tags.name?.trim();
  const brand = tags.brand?.trim();
  const withBrand = (point) => (brand ? { ...point, brand, rank: 0 } : { ...point, rank: 1 });
  const label = plain(`${name ?? ""} ${brand ?? ""}`);
  const looksAsian = (pattern) => !PLACE_NAME.test(label) && (CJK.test(name ?? "") || pattern.test(label));

  if (tags.amenity === "fuel") {
    // 私人加油点、车队卡加油站、码头加油点不算
    if (["private", "no"].includes(tags.access) || tags.boat === "yes") return null;
    if (/cardlock|pacific pride/i.test(label)) return null;
    const title = name || brand;
    return title ? withBrand({ kind: "fuel", name: title, ...base }) : null;
  }
  if (tags.shop && name) {
    if (["supermarket", "grocery", "convenience"].includes(tags.shop) && looksAsian(ASIAN_SHOP_NAME)) {
      return withBrand({ kind: "asianGrocery", name, ...base });
    }
    if (["supermarket", "grocery"].includes(tags.shop)) return withBrand({ kind: "grocery", name, ...base });
    if (["department_store", "wholesale"].includes(tags.shop) && GROCERY_STORE_BRANDS.test(label)) {
      return withBrand({ kind: "grocery", name, ...base });
    }
    return null;
  }
  if (["restaurant", "fast_food"].includes(tags.amenity) && name && !POKE.test(label)) {
    const asian = tags.cuisine ? asianCuisine(tags.cuisine) && !PLACE_NAME.test(label) : looksAsian(ASIAN_FOOD_NAME);
    return asian ? { kind: "asianFood", name, ...base, rank: tags.cuisine ? 0 : 1 } : null;
  }
  return null;
}

// ---- 请求 ----

/** 原始返回存 12 小时：这期间重跑直接用，不重复请求 */
async function cached(label, request, load) {
  const file = new URL(`${label}-${createHash("sha1").update(request).digest("hex").slice(0, 10)}.json`, CACHE);
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < 12 * 3600_000) {
    return JSON.parse(readFileSync(file, "utf8"));
  }
  const data = await load();
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(file, JSON.stringify(data));
  return data;
}

/** Overpass 公共服务常忙：几个镜像轮流试，越等越久 */
async function overpass(query) {
  for (let attempt = 0; attempt < 9; attempt++) {
    const endpoint = OVERPASS[attempt % OVERPASS.length];
    // 超时或网络错误：换下一个镜像
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(400_000),
    }).catch(() => null);
    let status = res ? `HTTP ${res.status}` : "网络错误";
    if (res?.status === 400) throw new Error(`Overpass 查询写错了：${(await res.text()).slice(0, 500)}`);
    if (res?.ok) {
      const data = await res.json().catch(() => null);
      // 查询超时时也返回 200，只是结果不全，remark 里写着 runtime error
      if (data && !data.remark?.includes("error")) return data;
      status = data?.remark ?? "返回不完整";
    }
    console.log(`  ${new URL(endpoint).host} ${status}，${15 * (attempt + 1)} 秒后重试`);
    await sleep(15_000 * (attempt + 1));
  }
  throw new Error("Overpass 失败");
}

/** 这一小时还剩几次（响应头 X-RateLimit-Remaining），和这次运行里每次请求的时间 */
let rateRemaining = null;
const callTimes = [];
/**
 * api.data.gov：超出次数就等 10 分钟再试，最多等 2 小时。
 * 用 DEMO_KEY 时每个接口每小时只有十来次（按滚动的一小时算）：剩 2 次以下就等自己最早的一次请求满一小时，
 * 给网站本身留一点
 */
async function dataGov(url) {
  if (API_KEY === "DEMO_KEY" && rateRemaining !== null && rateRemaining <= 2) {
    const oldest = callTimes.find((time) => Date.now() - time < 3600_000);
    const wait = oldest ? oldest + 3660_000 - Date.now() : 600_000;
    console.log(`  DEMO_KEY 这一小时只剩 ${rateRemaining} 次，等 ${Math.ceil(wait / 60_000)} 分钟`);
    await sleep(wait);
  }
  for (let attempt = 1; ; attempt++) {
    callTimes.push(Date.now());
    const res = await fetch(url, { headers: { "X-Api-Key": API_KEY, "User-Agent": USER_AGENT } });
    if (res.ok) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      rateRemaining = remaining === null ? null : Number(remaining);
      return res.json();
    }
    if (res.status !== 429 || attempt > 12) throw new Error(`api.data.gov ${res.status}: ${await res.text()}`);
    console.log(`  api.data.gov 超出次数限制（${API_KEY === "DEMO_KEY" ? "DEMO_KEY" : "自己的 key"}），10 分钟后重试`);
    await sleep(600_000);
  }
}

// ---- 距离、去重 ----

const toRad = (deg) => (deg * Math.PI) / 180;
function miles(a, b) {
  const h =
    Math.sin(toRad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lon - a.lon) / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(h));
}

/**
 * 同一个店常同时画成点和建筑轮廓：同类、同名 150 米内，或名字一个包含另一个（Chevron / Chevron Extra Mile）
 * 30 米内，算同一个。挨着的不同店（商场里并排的几家餐厅）不合并
 */
const nameKey = (name) => name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
function dedupe(points) {
  const kept = [];
  for (const point of points) {
    const key = nameKey(point.name);
    const duplicate = kept.some((other) => {
      if (other.kind !== point.kind) return false;
      const otherKey = nameKey(other.name);
      const distance = miles(other, point);
      return (otherKey === key && distance < 0.093) || ((otherKey.includes(key) || key.includes(otherKey)) && distance < 0.019);
    });
    if (!duplicate) kept.push(point);
  }
  return kept;
}

/**
 * 城里的点太密（拉斯维加斯、西雅图南郊这种）：同一类每个约 1 公里的格子最多留几个，
 * 有品牌的、标了菜系的优先；乡下和门户小镇的点很稀，基本不受影响。亚洲超市和快充全留
 */
const CELL_DEG = 0.01;
const PER_CELL = { fuel: 3, grocery: 3, asianFood: 3 };
function thin(points) {
  const perCell = new Map();
  return [...points]
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
    .filter((point) => {
      const limit = PER_CELL[point.kind];
      if (!limit) return true;
      const key = `${point.kind}|${Math.floor(point.lat / CELL_DEG)}|${Math.floor(point.lon / CELL_DEG)}`;
      perCell.set(key, (perCell.get(key) ?? 0) + 1);
      return perCell.get(key) <= limit;
    })
    .map((point) => {
      // 排序用的 rank 不写进输出
      const rest = { ...point };
      delete rest.rank;
      return rest;
    });
}

const byKind = (a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.name.localeCompare(b.name) || a.lat - b.lat;

// ---- 输出 ----

/** 合并 Overture 的亚洲超市：公园范围里的和常用机场附近的，离 OSM 已有的亚洲超市 200 米内、或者同名 1 公里内的不要 */
function withOverture(park, points) {
  const candidates = [...(overture.parks[park.code] ?? []), ...park.airports.flatMap((code) => overture.airports[code] ?? [])];
  const added = [];
  for (const candidate of candidates) {
    const same = (other) =>
      other.kind === "asianGrocery" &&
      (miles(other, candidate) < 0.12 || (nameKey(other.name) === nameKey(candidate.name) && miles(other, candidate) < 0.6));
    if (points.some(same) || added.some(same)) continue;
    added.push({ kind: "asianGrocery", name: candidate.name, lat: candidate.lat, lon: candidate.lon, source: "overture" });
  }
  return [...points, ...added].sort(byKind);
}

const previousFile = existsSync(OUTPUT) ? await import(OUTPUT.href) : null;
const previous = previousFile?.services ?? {};
// OSM 沿用上次的，日期也写上次查 OSM 的那天
const updated = SKIP_OSM && previousFile ? previousFile.servicesUpdated : UPDATED;
const osmPoints = {};
const chargerPoints = {};

/** 还没查到的部分用上次的结果，保证文件随时是完整的 */
function write() {
  const lines = parks
    .map((park) => {
      const old = previous[park.code] ?? [];
      const osm = withOverture(
        park,
        (osmPoints[park.code] ?? old.filter((p) => p.kind !== "dcFast")).filter((p) => p.source !== "overture"),
      );
      const chargers = chargerPoints[park.code] ?? old.filter((p) => p.kind === "dcFast");
      return [park.code, [...osm, ...chargers]];
    })
    .filter(([, points]) => points.length > 0)
    .map(([code, points]) => `  ${code}: [\n${points.map((p) => `    p(${JSON.stringify(p)}),`).join("\n")}\n  ],`);
  writeFileSync(
    OUTPUT,
    `// 由 scripts/build-services.mjs 生成，请勿手改。地点来自 OpenStreetMap（© OpenStreetMap contributors），快充来自 NLR，
// 亚洲超市另外合并了 Overture Maps 的（CDLA Permissive 2.0）。
export type ServiceKind = "fuel" | "grocery" | "asianGrocery" | "asianFood" | "dcFast";

export interface ServicePoint {
  kind: ServiceKind;
  name: string;
  lat: number; // 5 decimals
  lon: number;
  /** 品牌（加油站、超市），OSM 的 brand 标签 */
  brand?: string;
  /** 快充：是不是 Tesla 超充 */
  tesla?: boolean;
  /** 快充：直流快充桩数 */
  ports?: number;
  /** 亚洲超市：来自 Overture Maps（不写是 OSM） */
  source?: "overture";
}

export const servicesUpdated = "${updated}";

// 每个点包一层 p(...)：数组元素的类型都是 ServicePoint，上千个点时 TypeScript 不会因为联合类型太复杂而报错
const p = (point: ServicePoint) => point;

/** 按公园代码：公园和门户小镇一带的补给点 */
export const services: Record<string, ServicePoint[]> = {
${lines.join("\n")}
};
`,
  );
}

// 1. OSM：加油站、超市、亚洲超市、亚洲餐厅
for (const [index, park] of parks.entries()) {
  if (SKIP_OSM || !selected(park)) continue;
  const query = overpassQuery(serviceBox(park));
  const osm = await cached(`services-osm-${park.code}`, query, async () => {
    if (index > 0) await sleep(5000); // 公共服务，查询之间至少隔 5 秒
    return overpass(query);
  });
  const found = dedupe(osm.elements.map(classify).filter(Boolean));
  osmPoints[park.code] = thin(found).sort(byKind);
  write();
  const counts = KINDS.slice(0, 4).map((kind) => `${kind} ${osmPoints[park.code].filter((p) => p.kind === kind).length}`);
  const dropped = found.length - osmPoints[park.code].length;
  console.log(`${park.code}: ${counts.join(" · ")}（OSM ${osm.elements.length} 个元素${dropped ? `，城里太密去掉 ${dropped} 个` : ""}）`);
}

// 2. 直流快充：从公园定位点按直线距离查，半径 = 最远的景点 / 住宿 + 25 英里，最多 150 英里
for (const park of parks) {
  if (SKIP_NLR || !selected(park)) continue;
  const radius = Math.min(MAX_RADIUS_MI, Math.ceil(Math.max(...serviceArea(park).map((p) => miles(park.gateway, p))) + 25));
  const params = new URLSearchParams({
    latitude: String(park.gateway.lat),
    longitude: String(park.gateway.lon),
    radius: String(radius),
    fuel_type: "ELEC",
    ev_charging_level: "dc_fast",
    access: "public",
    status: "E",
    limit: "200",
    country: "all",
  });
  const nlr = await cached(`services-nlr-${park.code}`, params.toString(), () => dataGov(`${NLR}?${params}`));
  const chargers = nlr.fuel_stations.map((station) => ({
    kind: "dcFast",
    name: station.station_name.trim(),
    lat: Math.round(station.latitude * 1e5) / 1e5,
    lon: Math.round(station.longitude * 1e5) / 1e5,
    tesla: station.ev_network === "Tesla",
    ports: station.ev_dc_fast_num ?? 0,
  }));
  // NLR 的每条记录是一个站，同一个停车场里的 Tesla 和 Electrify America 是两个站，不合并
  chargerPoints[park.code] = chargers.sort(byKind);
  write();
  const tesla = chargerPoints[park.code].filter((p) => p.tesla).length;
  console.log(
    `${park.code}: dcFast ${chargerPoints[park.code].length}（Tesla ${tesla}，半径 ${radius} 英里${nlr.total_results > 200 ? `，共 ${nlr.total_results} 个只取最近 200` : ""}，api.data.gov 剩 ${rateRemaining ?? "?"}）`,
  );
}

write();
const written = (await import(`${OUTPUT.href}?t=${Date.now()}`)).services;
const count = (kind) => Object.values(written).flat().filter((p) => kind(p)).length;
console.log(`写入补给点：${count(() => true)} 个（其中 Overture 的亚洲超市 ${count((p) => p.source === "overture")} 个）`);
