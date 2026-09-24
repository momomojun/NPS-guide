// 脚本共用：直接 import 项目里的 TypeScript 数据文件（Node 24 会自动去掉类型标注）
import { deathValley } from "../src/data/attractions/deva.ts";
import { denali } from "../src/data/attractions/dena.ts";
import { grandCanyon } from "../src/data/attractions/grca.ts";
import { bryceCanyon } from "../src/data/attractions/brca.ts";
import { sequoiaKingsCanyon } from "../src/data/attractions/seki.ts";
import { yosemite } from "../src/data/attractions/yose.ts";
import { zion } from "../src/data/attractions/zion.ts";
import { lodgingOptions } from "../src/data/lodging.ts";
import { parks } from "../src/data/parks.ts";

export { lodgingOptions, parks };

export const attractions = [
  ...yosemite,
  ...sequoiaKingsCanyon,
  ...deathValley,
  ...zion,
  ...bryceCanyon,
  ...grandCanyon,
  ...denali,
];

export const USER_AGENT = "nps-guide/0.1 (personal trip planner; https://github.com/momomojun/NPS-guide)";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
