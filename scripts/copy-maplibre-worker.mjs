// MapLibre v6 的 Web Worker 是单独的 ES 模块文件，打包工具处理不了它的相对路径，
// 所以在 dev / build 前把 worker 和它依赖的 shared 模块复制到 public/maplibre/，
// 地图组件里用 setWorkerUrl 指过去。
import { copyFileSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/maplibre/", import.meta.url);

mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(new URL(file, from), new URL(file, to));
}
