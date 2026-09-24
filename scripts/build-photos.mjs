// 收集景点数据里的 photoFile，到 Wikimedia Commons 查缩略图地址、作者和授权，
// 生成 src/data/attractions/photos.generated.ts。新增景点照片后重新跑：node scripts/build-photos.mjs
import { writeFileSync } from "node:fs";
import { attractions, sleep, USER_AGENT } from "./load-data.mjs";

// Wikimedia 只对固定的几档宽度生成缩略图，960 是其中之一
const THUMB_WIDTH = 960;
const OUTPUT = new URL("../src/data/attractions/photos.generated.ts", import.meta.url);

function plainText(html) {
  return (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\(talk\s*·\s*contribs\)/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const files = [...new Set(attractions.map((a) => a.photoFile).filter(Boolean))];
const photos = {};

for (let i = 0; i < files.length; i += 50) {
  const batch = files.slice(i, i + 50);
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
    titles: batch.map((file) => `File:${file}`).join("|"),
  });
  const data = await (await fetch(url, { headers: { "User-Agent": USER_AGENT } })).json();
  const originalName = Object.fromEntries((data.query.normalized ?? []).map((n) => [n.to, n.from]));

  for (const page of data.query.pages) {
    const name = (originalName[page.title] ?? page.title).replace(/^File:/, "");
    const info = page.imageinfo?.[0];
    if (!info) {
      console.warn(`找不到文件：${name}`);
      continue;
    }
    const meta = info.extmetadata ?? {};
    photos[name] = {
      // 去掉 Wikimedia 加的 utm 追踪参数
      url: info.thumburl.split("?")[0],
      width: info.thumbwidth,
      height: info.thumbheight,
      page: info.descriptionurl,
      author: plainText(meta.Artist?.value) || plainText(meta.Credit?.value) || "Unknown",
      license: plainText(meta.LicenseShortName?.value),
    };
  }
  await sleep(500);
}

const missing = files.filter((file) => !photos[file]);
if (missing.length) console.warn(`缺少 ${missing.length} 张照片：\n${missing.join("\n")}`);

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-photos.mjs 生成，请勿手改。照片来自 Wikimedia Commons，按各自授权署名使用。
import type { Photo } from "./types";

export const photos: Record<string, Photo> = ${JSON.stringify(photos, null, 2)};
`,
);
console.log(`写入 ${Object.keys(photos).length} 张照片信息`);
