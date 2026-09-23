import "server-only";
import * as OpenCC from "opencc-js";
import type { Locale } from "./config";

// cn → twp：简体转台湾正体，并替换常用词汇（信息→資訊、视频→影片）
const toTraditional = OpenCC.Converter({ from: "cn", to: "twp" });

export function localize(text: string, locale: Locale): string {
  return locale === "zh-Hant" ? toTraditional(text) : text;
}
