import "server-only";
import * as OpenCC from "opencc-js";
import type { Locale } from "./config";

// cn → twp：简体转台湾正体，并替换常用词汇（信息→資訊、视频→影片）
const toTraditional = OpenCC.Converter({ from: "cn", to: "twp" });

/**
 * OpenCC 转错的词，按整词改回来：音译地名里的“里”被当成“裡”（德纳里、马里波萨、弗里蒙特……），
 * 不湿的“干”被当成“幹”（干湖、干河床）；“美属维尔京群岛”它会转成台湾的叫法“維京群島”，单说“维尔京群岛”时不会。
 * 台湾用语替换也有转过头的：“窗口”（预约的时间窗口、售票窗口）被换成电脑的“視窗”，“分区”被换成磁盘的“分割槽”；
 * “十几分钟”的“钟”会转成“鍾”；“公交”不转，台湾叫“公車”
 */
const FIXES: [string, string][] = [
  ["德納裡", "德納里"],
  ["馬裡波薩", "馬里波薩"],
  ["奇裡卡瓦", "奇里卡瓦"],
  ["弗裡蒙特", "弗里蒙特"],
  ["埃弗裡特", "埃弗里特"],
  ["德魯裡", "德魯里"],
  ["塔裡埃森", "塔里埃森"],
  ["裡諾", "里諾"],
  ["幹龜島", "乾龜島"],
  ["幹湖", "乾湖"],
  ["幹河床", "乾河床"],
  ["幹沙", "乾沙"],
  ["幹瀑布", "乾瀑布"],
  ["幹褲", "乾褲"],
  ["空氣幹", "空氣乾"],
  ["就幹了", "就乾了"],
  ["幹了以後", "乾了以後"],
  ["維爾京群島", "維京群島"],
  ["視窗", "窗口"],
  ["分割槽", "分區"],
  ["分鍾", "分鐘"],
  ["公交", "公車"],
];

export function localize(text: string, locale: Locale): string {
  if (locale !== "zh-Hant") return text;
  let converted = toTraditional(text);
  for (const [wrong, right] of FIXES) converted = converted.replaceAll(wrong, right);
  return (
    converted
      // OpenCC 不转计量单位：台湾把“米”叫“公尺”。只改数字（或模板占位符）后面的，避免误伤“玉米”这类词
      .replace(/(\d\s*)多米/g, "$1多公尺")
      .replace(/([\d}])\s*米/g, "$1 公尺")
      // OpenCC 会把“岩”转成异体字“巖”，台湾标准字是“岩”
      .replace(/巖/g, "岩")
  );
}
