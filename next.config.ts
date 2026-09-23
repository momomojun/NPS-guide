import path from "node:path";
import type { NextConfig } from "next";

// 上层目录还有另一个 package-lock.json，显式指定项目根目录，免得 Next 选错
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
