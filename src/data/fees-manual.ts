// 不在 NPS 门票接口里的地方的门票，手动整理：加拿大的国家公园、园外名胜（部落公园、BLM、城市停车场……）。
// 查的日期写在 checked 里，出发前以官网为准。

export interface ManualFees {
  currency: "USD" | "CAD";
  /** 一辆车（含车上所有人）；按天收的写在 perDay */
  vehicle?: number;
  /** 每人 */
  perPerson?: number;
  /** 是不是按天收（加拿大国家公园的门票按天算） */
  perDay?: boolean;
  /** 年票 / 通票价格（加拿大 Parks Canada Discovery Pass 家庭票），同一币种 */
  pass?: number;
  /** 中文说明：年卡、跟团费、抽签费…… */
  note: string;
  source: string;
  checked: string;
}

export const manualFees: Record<string, ManualFees> = {
  ante: {
    currency: "USD",
    perPerson: 80.5,
    note:
      "只能跟授权导览团进，这里按最便宜的下羚羊普通团估算（约 $80.50/人，含纳瓦霍部落公园门票 $15）；上羚羊约 $100–150/人（正午场最贵），羚羊峡谷 X 成人 $62/人。国家公园年卡不适用。",
    source: "https://navajonationparks.org/guided-tour-operators/antelope-canyon-tour-operators/",
    checked: "2026-09-28",
  },
  hsbd: {
    currency: "USD",
    vehicle: 10,
    note:
      "佩吉市收的马蹄湾停车费：小汽车、房车每辆 $10，摩托车 $5，国家公园年卡不管用；去 Wahweap 观景点、鲍威尔湖码头另要格伦峡谷国家休闲区门票（每车 $30、7 天有效，年卡可用），大坝观景点和游客中心不收费。",
    source: "https://www.nps.gov/glca/planyourvisit/horseshoe-bend.htm",
    checked: "2026-09-28",
  },
  mova: {
    currency: "USD",
    perPerson: 8,
    note:
      "纳瓦霍部落公园门票每人每天 $8（官网在线预付页面显示 $10），先到先得、不能预约，国家公园年卡不适用；向导团另付，阿甘点在园外、不收费。",
    source: "https://navajonationparks.org/navajo-tribal-parks/monument-valley/",
    checked: "2026-09-28",
  },
  wave: {
    currency: "USD",
    perPerson: 6,
    note:
      "上面是 Wire Pass / Buckskin Gulch 一日徒步的费用（每人 $6，狗也要付，在步道口自助付费）；The Wave 要抽签：每份申请 $6，中签后每人 $7；蘑菇石和 White Pocket 不收费。国家公园年卡都不适用。",
    source: "https://www.recreation.gov/permits/274309",
    checked: "2026-09-28",
  },
  banf: {
    currency: "CAD",
    vehicle: 24.5,
    perPerson: 12.25,
    perDay: true,
    pass: 167.5,
    note:
      "Parks Canada 门票按天收：成人 C$12.25、65 岁以上 C$10.75、17 岁及以下免费，一车家庭 / 团体（最多 7 人）C$24.50。日票在班夫、贾斯珀、幽鹤、库特尼等山地国家公园通用，有效到第二天下午 4 点。住得久可以买 Parks Canada 探索年卡（Discovery Pass，成人 C$83.50、家庭 C$167.50，一年内全加拿大国家公园通用）。美国国家公园年卡（America the Beautiful）在加拿大不能用。2026 年 6 月 19 日到 9 月 7 日 Canada Strong Pass 期间免门票，已经结束。",
    source: "https://parks.canada.ca/voyage-travel/admission",
    checked: "2026-09-28",
  },
  jasp: {
    currency: "CAD",
    vehicle: 24.5,
    perPerson: 12.25,
    perDay: true,
    pass: 167.5,
    note:
      "Parks Canada 门票按天收：成人 C$12.25、65 岁以上 C$10.75、17 岁及以下免费，一车家庭 / 团体（最多 7 人）C$24.50。日票在贾斯珀、班夫、幽鹤、库特尼等山地国家公园通用，有效到第二天下午 4 点。住得久可以买 Parks Canada 探索年卡（Discovery Pass，成人 C$83.50、家庭 C$167.50，一年内全加拿大国家公园通用）。美国国家公园年卡（America the Beautiful）在加拿大不能用。2026 年 6 月 19 日到 9 月 7 日 Canada Strong Pass 期间免门票，已经结束。",
    source: "https://parks.canada.ca/voyage-travel/admission",
    checked: "2026-09-28",
  },
  yoho: {
    currency: "CAD",
    vehicle: 24.5,
    perPerson: 12.25,
    perDay: true,
    pass: 167.5,
    note:
      "Parks Canada 门票按天收：成人 C$12.25、65 岁以上 C$10.75、17 岁及以下免费，一车家庭 / 团体（最多 7 人）C$24.50。日票在幽鹤、班夫、贾斯珀、库特尼等山地国家公园通用，有效到第二天下午 4 点。住得久可以买 Parks Canada 探索年卡（Discovery Pass，成人 C$83.50、家庭 C$167.50，一年内全加拿大国家公园通用）。美国国家公园年卡（America the Beautiful）在加拿大不能用。欧哈拉湖巴士（往返 C$25.50）和伯吉斯页岩导览另外收费。2026 年 6 月 19 日到 9 月 7 日 Canada Strong Pass 期间免门票，已经结束。",
    source: "https://parks.canada.ca/voyage-travel/admission",
    checked: "2026-09-28",
  },
};

/** 加元换美元（预算里统一按美元算） */
export const CAD_TO_USD = 0.707;
export const cadRateDate = "2026-09-28";
