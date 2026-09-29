// 离线：公园里常没信号。只在构建版（npm run build / 部署后）注册，开发模式不注册。
// - 页面：先上网取，取不到用存下的（打开过或者点过“离线保存”的页面）
// - /_next/static、MapLibre worker：文件名带哈希，存下后直接用
// - /api：先上网取，取不到用上次的（公告、天气、补给点、图集）；机票价格不存
// - 地图瓦片、照片：看过的存下来（最多 4000 个），没网时用；地图样式和瓦片索引先上网取（瓦片版本每周更新）
const VERSION = "v2";
const PAGES = `nps-pages-${VERSION}`;
const STATIC = `nps-static-${VERSION}`;
const DATA = `nps-data-${VERSION}`;
const TILES = `nps-tiles-${VERSION}`;
const MAX_TILES = 4000;
// 出发前“下载离线地图”存的瓦片和照片：单独放，不随版本清掉，也不受 MAX_TILES 限制
const OFFLINE = "nps-offline";
const OFFLINE_CONCURRENCY = 6;
const TILE_HOSTS = [
  "tiles.openfreemap.org",
  "elevation-tiles-prod.s3.amazonaws.com",
  "s3.amazonaws.com",
  "basemap.nationalmap.gov",
  "upload.wikimedia.org",
  // 景点照片的缩略图在这个域名上
  "thumb.wikimedia.org",
  // 加拿大公园的卫星图
  "tiles.maps.eox.at",
];
const NETWORK_TIMEOUT = 6000;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith("nps-") && key !== OFFLINE && !key.endsWith(VERSION)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    // 在所有缓存里找：离线地图包里也存着样式和瓦片索引
    const cached = (await caches.match(request)) || (await caches.match(request, { ignoreSearch: true }));
    if (cached) return cached;
    // 主屏图标打开的是不带语言的 /plan（联网时会按浏览器语言跳转），没网时用存下的简体或繁体页面
    const { pathname } = new URL(request.url);
    if (request.mode === "navigate" && !/^\/zh-Han[st](\/|$)/.test(pathname)) {
      for (const locale of ["zh-Hans", "zh-Hant"]) {
        const localized = await cache.match(`/${locale}${pathname === "/" ? "" : pathname}`, { ignoreSearch: true });
        if (localized) return localized;
      }
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  // 先在所有缓存里找（包括下载的离线地图包）
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    if (limit) trim(cache, limit);
  }
  return response;
}

/** 超过上限就删掉最早存的 */
async function trim(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/prices/")) return;
    if (request.mode === "navigate" || url.searchParams.has("_rsc")) {
      event.respondWith(networkFirst(request, PAGES));
    } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/maplibre/")) {
      event.respondWith(cacheFirst(request, STATIC));
    } else if (url.pathname.startsWith("/api/")) {
      event.respondWith(networkFirst(request, DATA));
    }
    return;
  }

  if (!TILE_HOSTS.includes(url.hostname)) return;
  // OpenFreeMap 的样式和瓦片索引（TileJSON）会指向每周更新的瓦片版本，旧版本过一阵会删掉：
  // 这类文件先上网取，断网才用存下的；瓦片、字体、图标这些带版本或不会变的才直接用缓存
  const versionedTile = /\.(pbf|mvt|png|jpe?g|webp)$/.test(url.pathname) || url.pathname.includes("/fonts/");
  if (url.hostname === "tiles.openfreemap.org" && !versionedTile) {
    event.respondWith(networkFirst(request, TILES));
    return;
  }
  event.respondWith(cacheFirst(request, TILES, MAX_TILES));
});

// “离线保存”：页面把要存的地址（当前页面、它用到的脚本和样式、行程的公告 / 天气 / 补给点）发过来，一次存好
self.addEventListener("message", (event) => {
  if (event.data?.type !== "precache") return;
  const port = event.ports[0];
  event.waitUntil(
    (async () => {
      let saved = 0;
      let failed = 0;
      for (const href of event.data.urls) {
        try {
          const url = new URL(href, self.location.origin);
          const cacheName = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/maplibre/")
            ? STATIC
            : url.pathname.startsWith("/api/")
              ? DATA
              : PAGES;
          const response = await fetch(url, { credentials: "same-origin" });
          if (!response.ok) throw new Error(String(response.status));
          await (await caches.open(cacheName)).put(url, response);
          saved++;
        } catch {
          failed++;
        }
      }
      port?.postMessage({ saved, failed });
    })(),
  );
});

// “下载离线地图”：页面发来要存的瓦片、照片地址，几个一起下载，存进 OFFLINE；边下边报进度。
// 已经存过的不再下载。都按 CORS 请求存：地图就是这样请求瓦片的；照片服务器也允许跨域，
// 存成普通响应（不透明响应在 Chrome 里每个要占好几 MB 的配额），<img> 请求时照样能用。
self.addEventListener("message", (event) => {
  if (event.data?.type !== "offline-download" && event.data?.type !== "offline-clear") return;
  const port = event.ports[0];
  if (event.data.type === "offline-clear") {
    event.waitUntil(caches.delete(OFFLINE).then(() => port?.postMessage({ type: "cleared" })));
    return;
  }
  const urls = event.data.urls;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE);
      let done = 0;
      let failed = 0;
      let next = 0;
      const report = () => port?.postMessage({ type: "progress", done, failed, total: urls.length });
      const worker = async () => {
        while (next < urls.length) {
          const href = urls[next++];
          try {
            if (!(await cache.match(href))) {
              const response = await fetch(href, { mode: "cors" });
              if (!response.ok) throw new Error(String(response.status));
              await cache.put(href, response);
            }
          } catch {
            failed++;
          }
          done++;
          if (done % 20 === 0) report();
        }
      };
      await Promise.all(Array.from({ length: OFFLINE_CONCURRENCY }, worker));
      port?.postMessage({ type: "done", done, failed, total: urls.length });
    })(),
  );
});
