// 由 scripts/build-fees.mjs 生成，请勿手改。门票来自 NPS API（feespasses），2026-09-29 查。
export interface ParkFees {
  /** 自驾车（含车上所有人），美元；免费的公园为 0 */
  vehicle: number;
  /** 步行 / 骑行，每人 */
  perPerson?: number;
  motorcycle?: number;
  /** 一句中文说明：免费、另有渡船 / 州立公园收费、分时段预约等，没有就不写 */
  note?: string;
}

export const feesUpdated = "2026-09-29";

export const parkFees: Record<string, ParkFees> = {
  yose: {"vehicle":35,"perPerson":20,"motorcycle":30},
  seki: {"vehicle":35,"perPerson":20,"motorcycle":30,"note":"红杉和国王峡谷两个公园共用一张门票，7 天内两边都能进，不用预约"},
  chis: {"vehicle":0,"note":"公园不收门票；上岛只能坐船，Island Packers 的船票才是主要花费，要提前订"},
  jotr: {"vehicle":30,"perPerson":15,"motorcycle":25},
  redw: {"vehicle":0,"note":"国家公园和三座州立公园都不收门票；Fern Canyon / Gold Bluffs Beach 等部分日用区另收每车 $8–12（Fern Canyon 只收现金或支票），America the Beautiful 年卡可以抵"},
  lavo: {"vehicle":30,"perPerson":15,"motorcycle":25,"note":"冬季（12 月 1 日到次年 4 月 15 日）每车 $10，摩托车、步行 / 骑行也都是 $10"},
  crla: {"vehicle":30,"perPerson":15,"motorcycle":25,"note":"上面是夏季价（5 月中到 10 月底）；11 月到次年 5 月中每车 $20、摩托车 $15"},
  mora: {"vehicle":30,"perPerson":15,"motorcycle":25},
  olym: {"vehicle":30,"perPerson":15,"motorcycle":25},
  noca: {"vehicle":0},
  yell: {"vehicle":35,"perPerson":20,"motorcycle":30},
  grte: {"vehicle":35,"perPerson":20,"motorcycle":30},
  glac: {"vehicle":35,"perPerson":20,"motorcycle":30,"note":"上面是夏季价；11 月到次年 4 月每车 $25、步行 / 骑行每人 $15、摩托车 $20"},
  romo: {"vehicle":35,"perPerson":20,"motorcycle":30,"note":"上面是 7 天票；只玩一天可以买 1 天票：每车 $30、步行 / 骑行每人 $15、摩托车 $25"},
  deva: {"vehicle":30,"perPerson":15,"motorcycle":25},
  zion: {"vehicle":35,"perPerson":20,"motorcycle":30},
  brca: {"vehicle":35,"perPerson":20,"motorcycle":30},
  grca: {"vehicle":35,"perPerson":20,"motorcycle":30},
  arch: {"vehicle":30,"perPerson":15,"motorcycle":25},
  cany: {"vehicle":30,"perPerson":15,"motorcycle":25},
  care: {"vehicle":20,"perPerson":10,"motorcycle":15},
  dena: {"vehicle":0,"perPerson":15},
  kefj: {"vehicle":0,"note":"公园不收门票；峡湾和潮水冰川只能坐船看，游船票才是主要花费"},
  wrst: {"vehicle":0,"note":"公园不收门票；去 Kennecott 的私营接驳车、选矿厂导览和观光飞行另付"},
};
