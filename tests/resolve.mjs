// 模块解析钩子：@/xxx → src/xxx；没写扩展名的依次试 .ts、/index.ts（测试只引用 .ts，不引用带 JSX 的 .tsx）
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = new URL("../src/", import.meta.url);
const HAS_EXTENSION = /\.(?:[cm]?[jt]s|json)$/;

export async function resolve(specifier, context, next) {
  const target = specifier.startsWith("@/") ? new URL(specifier.slice(2), SRC).href : specifier;
  const local = target.startsWith(".") || target.startsWith("file:");
  if (local && !HAS_EXTENSION.test(target) && context.parentURL) {
    const base = new URL(target, context.parentURL).href;
    for (const suffix of [".ts", "/index.ts"]) {
      if (existsSync(fileURLToPath(base + suffix))) return next(base + suffix, context);
    }
  }
  return next(target, context);
}
