import type { Attraction } from "./types";

// 2026-10-13 鲍威尔湖水位 3,519.10 英尺（NPS Changing Lake Levels 页，2026-10-14 更新）。

// Antelope Point 公共下水坡道（Navajo Route 22B 尽头）：水位低于 3,588 英尺时只能人手推下水的皮划艇、桨板下水，机动船不行。
// 跟团、租船送船都在这里集合；Antelope Point Marina 的商业坡道不对公众开放，Hidden Canyon Kayak 特意写明不从码头出发
const ANTELOPE_POINT_RAMP = {
  lat: 36.96238,
  lon: -111.44227,
  nameZh: "Antelope Point 公共下水坡道停车场（Navajo Route 22B 尽头，进门交格伦峡谷门票）",
};
// 皮划艇公司和租船都是 3–10 月营业；冬季水很冷，坡道也可能冬季关闭
const PADDLE_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10];
const ANTELOPE_PADDLE_CLOSED =
  "佩吉的皮划艇公司（Hidden Canyon Kayak、Lake Powell Paddleboards & Kayaks 等）只在 3–10 月营业，11 月到次年 2 月不发团、不租船；湖水 1 月只有约 7°C，Antelope Point 公共坡道冬季也可能关闭。冬天想从水上看羚羊峡谷，可以坐 Antelope Point Marina 的 1 小时游船（冬季也发船），或者跟纳瓦霍导览团走上、下羚羊。";

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
  {
    id: "ante-antelope-canyon-kayak",
    park: "ante",
    nameZh: "皮划艇进羚羊峡谷（鲍威尔湖水上部分）",
    nameEn: "Antelope Canyon by Kayak (Lake Powell)",
    kind: "experience",
    area: "lake",
    lat: 36.93412,
    lon: -111.42298,
    start: ANTELOPE_POINT_RAMP,
    durationMin: 270,
    bestTime: ["morning"],
    openMonths: PADDLE_MONTHS,
    closedNote: ANTELOPE_PADDLE_CLOSED,
    bestMonths: [5, 6, 9, 10],
    permit:
      "跟团在格伦峡谷授权的皮划艇公司官网订（Hidden Canyon Kayak、Lake Powell Paddleboards & Kayaks、Lake Powell Adventure Co.、High Desert Paddle Co. 等）：2026 年划船 + 徒步约 $110–130/人（约 4–4.5 小时），只划船约 $85–90/人（2.5–3 小时）；也可以在佩吉租船自己划（送到坡道，单人约 $60/天起）。另付格伦峡谷门票每车 $30、7 天有效（国家公园年卡可用），不用买纳瓦霍部落公园的门票",
    summary:
      "羚羊峡谷的下游一段早被鲍威尔湖淹成了一条红色砂岩峡湾。从 Antelope Point 坡道划进去，单程约 4 公里，两边岩壁越收越窄，到水的尽头上岸，再沿沙底往里走 1.5–3 公里，就进了一段只能从水上到的狭缝峡谷，人比上、下羚羊少得多。",
    tips: [
      "2026 年 10 月水位只有约 3,519 英尺，坡道已经伸不到水边，从坡道尽头到水边要扛着船走一段沙坡；跟团由向导搬船，自己租船的要自己扛上扛下",
      "下午常起风，春天还常有锋面大风，风大时公司会取消；尽量订早上的团（Hidden Canyon Kayak 划船 + 徒步 8:00、9:00、10:30 集合）。出入口的第一和最后一英里是主航道，快艇的浪比较乱",
      "上岸走的是格伦峡谷休闲区里的那段，不是上、下羚羊；跟着向导到折返点就回头，再往上游就是纳瓦霍保留地（下羚羊一带），要纳瓦霍导览或许可。7–9 月雨季上游下雨也会有山洪，狭缝里别逗留",
      "坡道在纳瓦霍保留地的 22B 号公路尽头，夏天手机可能自动跳成夏令时（快 1 小时）；各家公司都按亚利桑那时间，提前 30–45 分钟到（Lake Powell Paddleboards 要先到佩吉镇上的店里签到）",
      "湖上没有救生员，全程穿救生衣；带足水、防晒和能下水的鞋，6–10 月的团中途可以游泳",
    ],
    photoFile: "Antelope canyon (5097900720).jpg",
  },
  {
    id: "ante-antelope-canyon-boat-tour",
    park: "ante",
    alternativeTo: "ante-antelope-canyon-kayak",
    nameZh: "羚羊峡谷游船（Antelope Point Marina）",
    nameEn: "Antelope Canyon Boat Tour (Antelope Point Marina)",
    kind: "experience",
    area: "lake",
    lat: 36.94713,
    lon: -111.43327,
    start: { lat: 36.96185, lon: -111.43252, nameZh: "Antelope Point Marina 停车场（坐码头的接驳车下到游船售票处）" },
    durationMin: 105,
    permit:
      "在 Antelope Point Marina 官网订，2026 年成人 $50、4–12 岁 $30；另付格伦峡谷门票每车 $30（国家公园年卡可用）",
    summary:
      "不想划船的话，坐码头的平底游船沿鲍威尔湖开进羚羊峡谷的水上部分，在两边陡直的纳瓦霍砂岩之间来回约 1 小时，不用徒步、不下船，老人小孩都能去。",
    tips: [
      "要在开船前 45 分钟到码头游船售票处报到（迟到不退款），从停车场到湖边要坐码头的接驳车下坡",
      "一天好几班，冬季班次少；风大或湖面情况不好会临时取消或改期",
      "码头按亚利桑那时间（和佩吉一样）；Wahweap 那边 Lake Powell Resorts 的羚羊峡谷游船 2026 年“暂停，另行通知”，Lake Powell Adventure Co. 另有从 Wahweap 坡道出发、最多 6 人的 2 小时小船摄影团（$150/人）",
    ],
    photoFile:
      "Antelope Point Marina and Antelope Canyon, Lake Powell, Glen Canyon National Recreation Area, Near Page, Arizona (14017106397).jpg",
  },
];
