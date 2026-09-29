import type { Attraction } from "./types";

// 羚羊峡谷部落公园在 98 号公路旁的入口：Antelope Canyon Navajo Tours 等几家从这里坐四驱车去上羚羊，
// 另有几家（Antelope Canyon Tours、Antelope Slot Canyon Tours）从佩吉镇上出发
const UPPER_LOT = { lat: 36.89716, lon: -111.40849, nameZh: "羚羊峡谷部落公园入口停车场（98 号公路）" };

export const antelopeCanyon: Attraction[] = [
  {
    id: "ante-upper-antelope-canyon",
    park: "ante",
    nameZh: "上羚羊峡谷",
    nameEn: "Upper Antelope Canyon",
    kind: "experience",
    area: "upper",
    lat: 36.86257,
    lon: -111.37469,
    start: UPPER_LOT,
    durationMin: 120,
    bestTime: ["morning"],
    bestMonths: [4, 5, 6, 7, 8, 9],
    permit: "只能跟纳瓦霍授权的导览团进，在导览公司官网提前订；2026 年约 $100–150/人（含部落公园每人 $15，正午场次最贵）",
    mustSee: true,
    summary:
      "纳瓦霍语叫 Tsé bighánílíní（“水从岩石中穿过的地方”），峡谷上窄下宽、谷底平坦好走；晴天正午前后阳光从头顶的窄缝直射下来，就是羚羊峡谷最有名的光束。",
    tips: [
      "从停车场坐导览公司的四驱车在沙地河床里开约 15 分钟到峡谷口，峡谷里来回走约 1.2 公里，全程约 1.5–2 小时",
      "光束大约 3 月底到 10 月初出现，10:30–13:30 前后的场次最贵、最早售罄；阴天看不到，也不能因此当天退团",
      "各家都按亚利桑那时间发团（不实行夏令时），夏天从犹他或纳瓦霍保留地其他地方过来要算好时差；一般只许带透明包，普通团不能用三脚架",
    ],
    photoFile: "Upper antelope canyon light beam page arizona - Flickr - Mferbfriske.jpg",
  },
  {
    id: "ante-lower-antelope-canyon",
    park: "ante",
    nameZh: "下羚羊峡谷",
    nameEn: "Lower Antelope Canyon",
    kind: "experience",
    area: "lower",
    lat: 36.903,
    lon: -111.4134,
    start: { lat: 36.90244, lon: -111.4105, nameZh: "下羚羊峡谷停车场（Ken's / Dixie's 签到处）" },
    durationMin: 105,
    permit: "只能跟 Ken's Tours 或 Dixie's 两家纳瓦霍导览团进，在官网提前订；2026 年普通团约 $80.50/人（含部落公园每人 $15）",
    mustSee: true,
    summary:
      "纳瓦霍语叫 Hasdeztwazí（“螺旋状的岩石拱”），比上羚羊更窄更深：沿钢梯下到谷底，在弯来弯去的窄缝里穿行，再从另一头爬梯子出来，岩壁的曲线和颜色变化更多。",
    tips: [
      "要上下好几段陡钢梯（都有扶手），在峡谷里约 1 小时，要提前约 45 分钟到签到处",
      "Dixie's 从 2023 年起任何包都不让带（透明包也不行），只能带手机、相机和水；Ken's 和 Dixie's 都不许用三脚架",
      "7–9 月雨季上游下雨也会引发山洪，导览公司会临时取消，一般可以退款或改期",
    ],
    photoFile: "Lower Antelope Canyon, Page (2).jpg",
  },
  {
    id: "ante-antelope-canyon-x",
    park: "ante",
    nameZh: "羚羊峡谷 X",
    nameEn: "Antelope Canyon X",
    kind: "experience",
    area: "more-slots",
    lat: 36.79916,
    lon: -111.33812,
    start: { lat: 36.81994, lon: -111.30879, nameZh: "Taadidiin Tours 签到处（98 号公路 308 英里标）" },
    durationMin: 120,
    permit: "只能跟 Taadidiin Tours 的导览团进；2026 年徒步团成人 $62、8–17 岁 $52（都含部落公园每人 $15）",
    summary:
      "羚羊溪上游两条狭缝峡谷交叉成 X 形的地方，岩壁的颜色和纹理和上羚羊相近，团小、人少，走得不赶，是上下羚羊订不到时最常见的替代。",
    tips: [
      "签到处在佩吉东南约 16 公里的 98 号公路边，提前 30 分钟到，再坐导览公司的车 10–15 分钟到步道口",
      "进出峡谷都要走一段长长的枕木台阶，回程是上坡；徒步团不许带任何包",
      "5 月到 8 月初中午前后也能看到光束；想用三脚架可以报 3 小时的摄影团",
    ],
    photoFile: "Antelope Canyon-X, Page, AZ (48146462652).jpg",
  },
  {
    id: "ante-waterholes-canyon",
    park: "ante",
    nameZh: "水洞峡谷",
    nameEn: "Waterholes Canyon",
    kind: "experience",
    area: "more-slots",
    lat: 36.82821,
    lon: -111.4944,
    start: { lat: 36.82671, lon: -111.51029, nameZh: "Waterhole Canyon Experience 签到处（89 号公路旁）" },
    durationMin: 120,
    permit: "只能跟纳瓦霍家族经营的 Waterhole Canyon Experience 导览团进，约 $80/人起（以官网为准），8 岁以上",
    summary: "佩吉以南、从 89 号公路桥下穿过的一条狭缝峡谷，波纹岩壁和羚羊峡谷同属纳瓦霍砂岩，团小人少，路线比上羚羊更需要手脚并用。",
    tips: ["签到处在去马蹄湾的 89 号公路边，两处可以排在同一个上午", "坐导览公司的车到峡谷口；雨季遇山洪风险同样会取消"],
    photoFile: "Water Holes Canyon, Page (45719810341).jpg",
  },
];
