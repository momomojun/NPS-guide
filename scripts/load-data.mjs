// 脚本共用：直接 import 项目里的 TypeScript 数据文件（Node 24 会自动去掉类型标注）
import { deathValley } from "../src/data/attractions/deva.ts";
import { denali } from "../src/data/attractions/dena.ts";
import { grandCanyon } from "../src/data/attractions/grca.ts";
import { bryceCanyon } from "../src/data/attractions/brca.ts";
import { sequoiaKingsCanyon } from "../src/data/attractions/seki.ts";
import { yosemite } from "../src/data/attractions/yose.ts";
import { zion } from "../src/data/attractions/zion.ts";
import { channelIslands } from "../src/data/attractions/chis.ts";
import { redwood } from "../src/data/attractions/redw.ts";
import { lassenVolcanic } from "../src/data/attractions/lavo.ts";
import { craterLake } from "../src/data/attractions/crla.ts";
import { mountRainier } from "../src/data/attractions/mora.ts";
import { olympic } from "../src/data/attractions/olym.ts";
import { northCascades } from "../src/data/attractions/noca.ts";
import { yellowstone } from "../src/data/attractions/yell.ts";
import { grandTeton } from "../src/data/attractions/grte.ts";
import { arches } from "../src/data/attractions/arch.ts";
import { canyonlands } from "../src/data/attractions/cany.ts";
import { capitolReef } from "../src/data/attractions/care.ts";
import { antelopeCanyon } from "../src/data/attractions/ante.ts";
import { horseshoeBend } from "../src/data/attractions/hsbd.ts";
import { monumentValley } from "../src/data/attractions/mova.ts";
import { theWave } from "../src/data/attractions/wave.ts";
import { banff } from "../src/data/attractions/banf.ts";
import { jasper } from "../src/data/attractions/jasp.ts";
import { yoho } from "../src/data/attractions/yoho.ts";
import { joshuaTree } from "../src/data/attractions/jotr.ts";
import { rockyMountain } from "../src/data/attractions/romo.ts";
import { glacier } from "../src/data/attractions/glac.ts";
import { lodgingOptions } from "../src/data/lodging.ts";
import { parks } from "../src/data/parks.ts";

export { lodgingOptions, parks };

export const attractions = [
  ...yosemite,
  ...sequoiaKingsCanyon,
  ...channelIslands,
  ...redwood,
  ...lassenVolcanic,
  ...craterLake,
  ...mountRainier,
  ...olympic,
  ...northCascades,
  ...yellowstone,
  ...grandTeton,
  ...deathValley,
  ...zion,
  ...bryceCanyon,
  ...grandCanyon,
  ...denali,
  ...arches,
  ...canyonlands,
  ...capitolReef,
  ...antelopeCanyon,
  ...horseshoeBend,
  ...monumentValley,
  ...theWave,
  ...banff,
  ...jasper,
  ...yoho,
  ...joshuaTree,
  ...rockyMountain,
  ...glacier,
];

export const USER_AGENT = "nps-guide/0.1 (personal trip planner; https://github.com/momomojun/NPS-guide)";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
