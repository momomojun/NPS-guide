import "server-only";
import * as OpenCC from "opencc-js";
import type { Locale } from "./config";

// cn → twp：简体转台湾正体，并替换常用词汇（信息→資訊、视频→影片）
const toTraditional = OpenCC.Converter({ from: "cn", to: "twp" });

export function localize(text: string, locale: Locale): string {
  if (locale !== "zh-Hant") return text;
  return (
    toTraditional(text)
      // OpenCC 不转计量单位：台湾把“米”叫“公尺”。只改数字（或模板占位符）后面的，避免误伤“玉米”这类词
      .replace(/(\d\s*)多米/g, "$1多公尺")
      .replace(/([\d}])\s*米/g, "$1 公尺")
      // OpenCC 会把“岩”转成异体字“巖”，台湾标准字是“岩”
      .replace(/巖/g, "岩")
  );
}
