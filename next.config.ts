import path from "node:path";
import type { NextConfig } from "next";

// 上层目录还有另一个 package-lock.json，显式指定项目根目录，免得 Next 选错
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  images: {
    // 景点照片来自 Wikimedia Commons；缩略图在 thumb 域名，小图直接用原图
    remotePatterns: [
      { protocol: "https", hostname: "thumb.wikimedia.org", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
    ],
  },
};

export default nextConfig;
