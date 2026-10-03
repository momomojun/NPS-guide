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
import { kenaiFjords } from "../src/data/attractions/kefj.ts";
import { wrangellStElias } from "../src/data/attractions/wrst.ts";
import { whiteSands } from "../src/data/attractions/whsa.ts";
import { carlsbadCaverns } from "../src/data/attractions/cave.ts";
import { mesaVerde } from "../src/data/attractions/meve.ts";
import { petrifiedForest } from "../src/data/attractions/pefo.ts";
import { greatSandDunes } from "../src/data/attractions/grsa.ts";
import { blackCanyon } from "../src/data/attractions/blca.ts";
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
  ...kenaiFjords,
  ...wrangellStElias,
  ...whiteSands,
  ...carlsbadCaverns,
  ...mesaVerde,
  ...petrifiedForest,
  ...greatSandDunes,
  ...blackCanyon,
];

/** 补给点的查询范围在外包框四边各放宽这么多度，门户小镇都在里面 */
const SERVICE_MARGIN_DEG = 0.3;

/** 一个公园的景点（有出发点用出发点）和推荐住宿：补给点按这些点的范围查 */
export const serviceArea = (park) => [
  ...attractions.filter((a) => a.park === park.code).map((a) => a.start ?? a),
  ...lodgingOptions.filter((l) => l.park === park.code),
];

/** 补给点的查询范围：[南, 西, 北, 东] */
export function serviceBox(park) {
  const points = serviceArea(park);
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  return [
    Math.min(...lats) - SERVICE_MARGIN_DEG,
    Math.min(...lons) - SERVICE_MARGIN_DEG,
    Math.max(...lats) + SERVICE_MARGIN_DEG,
    Math.max(...lons) + SERVICE_MARGIN_DEG,
  ].map((deg) => Math.round(deg * 1000) / 1000);
}

export const USER_AGENT = "nps-guide/0.1 (personal trip planner; https://github.com/momomojun/NPS-guide)";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
