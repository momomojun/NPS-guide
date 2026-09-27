import type { MetadataRoute } from "next";

// 装到手机主屏后像 App 一样打开；离线靠 public/sw.js
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NPS Guide · 美国国家公园行程规划",
    short_name: "NPS Guide",
    description: "美国国家公园的景点地图、行程规划和实时公告，没信号时也能看行程。",
    // 不带语言前缀：联网时按浏览器语言跳到简体或繁体，离线时 sw.js 找存下的那个
    start_url: "/plan",
    scope: "/",
    display: "standalone",
    background_color: "#f4efe7",
    theme_color: "#f4efe7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
