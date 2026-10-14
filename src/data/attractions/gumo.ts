import type { Attraction } from "./types";

// 瓜达卢佩山：园内没有穿过山里的公路，几个片区各从 62/180 号公路（或北边新墨西哥的 137 号公路）单独开进去：
// Pine Springs 和 Frijole Ranch 挨着游客中心；McKittrick 峡谷在东北约 7 英里外，有大门、只能白天进；
// Salt Basin 沙丘在西边，要绕经 Dell City 走约 1.5 小时；Dog Canyon 在北边，从 Pine Springs 开过去约 2 小时。
// 坐标：游客中心、步道口、泉水、山顶按 OpenStreetMap 和 NPS places / things to do 接口核对。
// 时间都按山地时间（公园用山地时间，手机常显示中部时间，快一小时）。
const PINE_SPRINGS_TH = { lat: 31.89666, lon: -104.82819, nameZh: "Pine Springs 步道口停车场（营地旁）" };
const FRIJOLE_TH = { lat: 31.90653, lon: -104.80157, nameZh: "Frijole Ranch 停车场" };
const MCKITTRICK_TH = { lat: 31.97721, lon: -104.75201, nameZh: "McKittrick 峡谷游客站停车场" };
/** McKittrick 峡谷只许白天进：每天 8:00–17:00（山地时间），17:00 锁上 62/180 号公路边的大门，之前必须出来 */
const MCKITTRICK_HOURS = [{ open: "08:00", close: "17:00" }];

export const guadalupeMountains: Attraction[] = [
  // ===== Pine Springs =====
  {
    id: "gumo-pine-springs-vc",
    park: "gumo",
    nameZh: "Pine Springs 游客中心",
    nameEn: "Pine Springs Visitor Center",
    kind: "visitor",
    area: "pine-springs",
    lat: 31.89433,
    lon: -104.82173,
    start: { lat: 31.89326, lon: -104.82246, nameZh: "游客中心停车场" },
    durationMin: 30,
    hours: [{ open: "08:00", close: "16:00" }],
    summary:
      "公园的主游客中心，在 62/180 号公路边、瓜达卢佩峰脚下；有讲二叠纪礁石和山里生态的展览、介绍片和书店，背包过夜的许可证、去 Williams Ranch 的大门钥匙都在这里办。",
    tips: [
      "每天 8:00–16:00（山地时间）开放，感恩节、圣诞节、元旦关闭；公园用山地时间，手机常自动跳到中部时间、快一小时，最好手动把时区设成丹佛或埃尔帕索",
      "门票每人 $10（16 岁以上，7 天有效），游客中心刷卡，各步道口有自助缴费信封",
      "园内和附近 35 英里内没有加油站、餐馆和商店，只有游客中心的饮用水",
    ],
    photoFile:
      "Exterior of Pine Springs Visitor Center in Guadalupe Mountains National Park - DPLA - 5d40a1148c389ccf1ee2409147573b27.jpg",
  },
  {
    id: "gumo-pinery",
    park: "gumo",
    nameZh: "Pinery 驿站遗址步道",
    nameEn: "Pinery Trail (Butterfield Stage Station Ruins)",
    kind: "hike",
    area: "pine-springs",
    lat: 31.89409,
    lon: -104.81719,
    start: { lat: 31.89326, lon: -104.82246, nameZh: "游客中心停车场" },
    durationMin: 30,
    trail: { via: [{ lat: 31.89409, lon: -104.81719 }] },
    hike: { distanceMi: 0.75, gainFt: 40, difficulty: "easy" },
    summary:
      "从游客中心走一条约 600 米的铺装小路，到 1858 年 Butterfield 陆路邮政马车线上的 Pinery 驿站遗址，只剩几段石墙，背后是瓜达卢佩峰。路边有沙漠植物的解说牌，能推轮椅，也可以牵狗。",
    tips: ["遗址很脆弱，不要爬墙", "这条和营地到游客中心的小路是园内少数能带狗走的步道"],
    photoFile: "Pinery Stage Stop, TX.jpg",
  },
  {
    id: "gumo-guadalupe-peak",
    park: "gumo",
    nameZh: "瓜达卢佩峰（得州最高点）",
    nameEn: "Guadalupe Peak Trail",
    kind: "hike",
    area: "pine-springs",
    lat: 31.89146,
    lon: -104.86067,
    start: PINE_SPRINGS_TH,
    durationMin: 420,
    trail: { via: [{ lat: 31.89146, lon: -104.86067 }] },
    hike: { distanceMi: 8.4, gainFt: 3000, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [3, 4, 5, 10, 11],
    mustSee: true,
    summary:
      "爬上海拔 2,667 米的“得州之巅”：往返约 13.5 公里、爬升约 900 米，从沙漠灌丛一路爬进松树和花旗松林，最后一段沿着崖边的碎石路到山顶。山顶立着 1958 年美国航空为纪念 Butterfield 邮路一百周年竖的不锈钢金字塔，旁边就是 El Capitan 绝壁的顶，西边是一望无际的盐碱平原。",
    tips: [
      "一般要 6–8 小时，天亮就出发；每人至少带 3–4 升水，山顶比山下冷约 5°C、风也大得多，带防风外套",
      "夏天午后常有雷暴，山顶完全暴露、容易遭雷击，看到云堆起来就下山；冬春大风天风速可能大到走不稳",
      "春秋周末步道口停车场上午就会停满，停满了就停游客中心，沿营地连接小路走过来；山顶不是厕所，要自带垃圾袋式便袋把排泄物带下山",
    ],
    photoFile: "Summit of the Guadalupe Peak DSC 5539 ad.JPG",
  },
  {
    id: "gumo-devils-hall",
    park: "gumo",
    nameZh: "Devil's Hall（魔鬼走廊）",
    nameEn: "Devil's Hall Trail",
    kind: "hike",
    area: "pine-springs",
    lat: 31.90643,
    lon: -104.84754,
    start: PINE_SPRINGS_TH,
    durationMin: 210,
    trail: { via: [{ lat: 31.90643, lon: -104.84754 }] },
    hike: { distanceMi: 4.2, gainFt: 550, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [3, 4, 10, 11],
    summary:
      "沿 Pine Spring 峡谷往里走约 1.6 公里后下到干河床，在大石头间手脚并用往上爬，经过一段天然的层状石阶，尽头是两侧石灰岩壁只隔几米、像走廊一样的窄峡谷。往返约 6.8 公里，10 月底到 11 月中峡谷里的枫树会变红。",
    tips: [
      "河床里全是松动的石头和大圆石，要爬，穿抓地好的鞋、带登山杖；下雨或有积水时很滑，不要去",
      "回程从河床上来接回步道的地方容易错过，傍晚走的话带头灯",
      "和瓜达卢佩峰同一个步道口，红叶季周末很早就停满",
    ],
    photoFile: "Devil's Hall.JPG",
  },
  {
    id: "gumo-el-capitan-viewpoint",
    park: "gumo",
    nameZh: "El Capitan 观景点（62/180 号公路）",
    nameEn: "El Capitan Viewpoint",
    kind: "viewpoint",
    area: "highway",
    lat: 31.85426,
    lon: -104.84404,
    durationMin: 15,
    bestTime: ["sunrise", "sunset"],
    mustSee: true,
    summary:
      "62/180 号公路爬上 Guadalupe Pass 的路上，路边停车点正对 El Capitan：一面从沙漠里笔直立起的石灰岩绝壁，就是二叠纪海底礁石的前缘，几十公里外都能看到。往游客中心方向再开一点还有一处能看到瓜达卢佩峰山顶的停车点。",
    tips: [
      "东西两个方向的车道都有停车点，不用掉头；清早和傍晚岩壁被照成橙色最好看",
      "从埃尔帕索方向开来，盐碱平原上远远就能看到 El Capitan，路边有好几处能停车拍照",
    ],
    photoFile: "Guadalupe Mountains and El Capitan 2006.jpg",
  },

  // ===== Frijole Ranch =====
  {
    id: "gumo-frijole-ranch",
    park: "gumo",
    nameZh: "Frijole 牧场",
    nameEn: "Frijole Ranch History Museum",
    kind: "landmark",
    area: "frijole",
    lat: 31.90779,
    lon: -104.80114,
    start: FRIJOLE_TH,
    durationMin: 30,
    bestTime: ["morning", "afternoon"],
    summary:
      "游客中心东北约 2.4 公里，山脚下一片泉水滋养的绿洲：老牧场主屋现在是小历史博物馆，讲从阿帕奇人、拓荒牧场到建立国家公园的故事；旁边有一间单间小学校舍和泉水屋，院子里大树成荫、有野餐桌，清早傍晚常有鹿和鸟来喝水。",
    tips: [
      "博物馆只在春秋旺季、有工作人员或志愿者时开门；院子和野餐区每天都开",
      "Smith Spring 环线、Manzanita 泉都从这里出发，可以连在一起走",
    ],
    photoFile: "Frijole Ranch.JPG",
  },
  {
    id: "gumo-smith-spring",
    park: "gumo",
    nameZh: "Smith Spring 环线",
    nameEn: "Smith Spring Loop Trail",
    kind: "hike",
    area: "frijole",
    lat: 31.91872,
    lon: -104.80692,
    start: FRIJOLE_TH,
    durationMin: 90,
    trail: {
      via: [
        { lat: 31.91036, lon: -104.79841 },
        { lat: 31.91872, lon: -104.80692 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2.3, gainFt: 400, difficulty: "moderate", loop: true },
    bestTime: ["morning"],
    bestMonths: [3, 4, 10, 11],
    summary:
      "从 Frijole 牧场出发的约 3.7 公里环线：先走铺装路到 Manzanita 泉（一个长满芦苇的小水塘，能推轮椅到这里），再沿山坡爬到藏在悬崖下的 Smith 泉，泉边是西黄松、得州马德隆和大齿枫，像沙漠里突然冒出的一小片树林，回程一路看山下的沙漠。",
    tips: [
      "泉水边常有鸟和鹿，是园内最好的观鸟步道之一；不要碰泉水、别下去踩",
      "秋天大齿枫变红，是不想走远路也能看到红叶的地方；全程没有大坡，适合半天",
    ],
    photoFile: "Manzanita Spring in Guadalupe Mountains National Park.jpg",
  },

  // ===== McKittrick 峡谷 =====
  {
    id: "gumo-mckittrick-nature-trail",
    park: "gumo",
    nameZh: "McKittrick 峡谷游客站和自然步道",
    nameEn: "McKittrick Canyon Contact Station & Nature Trail",
    kind: "hike",
    area: "mckittrick",
    lat: 31.97761,
    lon: -104.75215,
    start: MCKITTRICK_TH,
    durationMin: 50,
    trail: { loop: true },
    hike: { distanceMi: 0.9, difficulty: "moderate", loop: true },
    hours: MCKITTRICK_HOURS,
    summary:
      "峡谷口的小游客站（户外展板和厕所）旁边一条 1.4 公里的小环线，沿着干沟爬上一面向阳的沙漠坡，再从背阴、植物更茂盛的一侧下来，路边解说牌讲沙漠植物和二叠纪礁石，从坡顶能看到峡谷口。不打算走远的话，在这里感受一下 McKittrick 峡谷就够了。",
    tips: [
      "从 62/180 号公路转进支路开到游客站；路口的大门每天 8:00 开、17:00 锁，必须 17:00 前开出来",
      "游客站一般没人值班，门票在停车场的自助缴费机或信封交",
    ],
    photoFile: "McKittrick Canyon Trail 2008.jpg",
  },
  {
    id: "gumo-pratt-cabin",
    park: "gumo",
    nameZh: "McKittrick 峡谷 · Pratt 小屋",
    nameEn: "McKittrick Canyon Trail to Pratt Cabin",
    kind: "hike",
    area: "mckittrick",
    lat: 31.98364,
    lon: -104.78066,
    start: MCKITTRICK_TH,
    durationMin: 180,
    trail: { via: [{ lat: 31.98364, lon: -104.78066 }] },
    hike: { distanceMi: 4.8, gainFt: 300, difficulty: "moderate" },
    hours: MCKITTRICK_HOURS,
    bestTime: ["morning"],
    bestMonths: [10, 11],
    mustSee: true,
    summary:
      "被称作“得州最美的地方”的峡谷：沿着时隐时现的 McKittrick 溪往里走，两次过溪，两侧是几百米高的石灰岩壁，谷底长着大齿枫、得州马德隆和橡树，10 月底到 11 月初红黄一片。约 3.9 公里处是石油地质学家 Wallace Pratt 1930 年代建的石头小屋，门廊下和野餐桌旁正好歇脚吃午饭，往返约 7.7 公里。",
    tips: [
      "红叶一般 10 月最后一周到 11 月第一周最盛（每年不同），这时周末停车场常满、会限流“出一辆进一辆”，尽量平日来、8 点开门就到",
      "17:00 前必须开出大门，往返留足 3–4 小时；为保护溪里的生态，只走步道、不要下水",
      "体力好可以继续走到 Grotto（往返约 11 公里）或更远的 The Notch",
    ],
    photoFile: "McKittrick Canyon Foliage 2008.jpg",
  },
  {
    id: "gumo-grotto",
    park: "gumo",
    nameZh: "McKittrick 峡谷 · Grotto 和猎人小屋",
    nameEn: "McKittrick Canyon Trail to the Grotto & Hunter Line Shack",
    kind: "hike",
    area: "mckittrick",
    lat: 31.9705,
    lon: -104.78814,
    start: MCKITTRICK_TH,
    durationMin: 270,
    trail: { via: [{ lat: 31.98364, lon: -104.78066 }, { lat: 31.9705, lon: -104.78814 }] },
    hike: { distanceMi: 7, gainFt: 600, difficulty: "moderate" },
    hours: MCKITTRICK_HOURS,
    bestTime: ["morning"],
    bestMonths: [10, 11],
    summary:
      "过了 Pratt 小屋继续沿南 McKittrick 峡谷往里走，到 Grotto：一处像小洞穴一样露出钟乳石的岩壁，前面有几张石头桌凳，树荫很深；再往前一点是 1920 年代牧场留下的猎人小屋（Hunter Line Shack）。往返约 11 公里、爬升不到 200 米，比到 Pratt 小屋多走约 3.5 公里，红叶往里更密。",
    tips: [
      "要 3–5 小时，最晚中午前从停车场出发，才赶得上 17:00 关门",
      "Grotto 之后步道开始陡爬上 The Notch（往返约 14.5 公里），那段只适合体力很好的人",
    ],
    photoFile: "Hunter Line Shack.JPG",
  },

  // ===== Salt Basin 沙丘 =====
  {
    id: "gumo-salt-basin-dunes",
    park: "gumo",
    nameZh: "Salt Basin 石膏沙丘",
    nameEn: "Salt Basin Dunes",
    kind: "hike",
    area: "salt-basin",
    lat: 31.92578,
    lon: -104.98224,
    start: { lat: 31.92349, lon: -105.00631, nameZh: "Salt Basin 沙丘步道口（Williams Road 尽头）" },
    durationMin: 150,
    trail: { via: [{ lat: 31.92578, lon: -104.98224 }] },
    hike: { distanceMi: 3.5, gainFt: 150, difficulty: "moderate" },
    bestTime: ["sunset"],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    mustSee: true,
    summary:
      "公园偏远的西侧，瓜达卢佩山西壁脚下的一片白色石膏沙丘，最高约 30 米，和背后黑色的绝壁对比强烈；沙子是西边盐湖蒸发留下的石膏被风吹过来堆成的，和白沙国家公园同一个道理但人少得多。从步道口沿沙地小路走约 2.5 公里才到沙丘，沙丘上可以随便走、随便爬。",
    tips: [
      "从 Pine Springs 要绕经 Dell City，开约 1.5 小时，最后一段是黏土路：下雨后极滑、车会陷，雨天和雨后几天别去；路上常有牛",
      "只能日出到日落后 30 分钟之间来，不许露营；夏天沙丘上常超过 38°C，只在凉快的季节来，带足水",
      "傍晚夕阳把山壁照成橙红色最好看，但看完要摸黑开一段土路，小心慢开",
    ],
    photoFile: "Salt Basin Dunes - Flickr - aspidoscelis.jpg",
  },

  // ===== Dog Canyon =====
  {
    id: "gumo-dog-canyon",
    park: "gumo",
    nameZh: "Dog Canyon（Indian Meadow 自然步道）",
    nameEn: "Dog Canyon & Indian Meadow Nature Trail",
    kind: "hike",
    area: "dog-canyon",
    lat: 31.99794,
    lon: -104.83335,
    start: { lat: 31.99371, lon: -104.834, nameZh: "Dog Canyon 步道口和护林站" },
    durationMin: 45,
    trail: { loop: true },
    hike: { distanceMi: 0.6, difficulty: "easy", loop: true },
    bestTime: ["morning", "afternoon"],
    bestMonths: [5, 6, 9, 10],
    summary:
      "公园北端海拔约 1,900 米的一条林木茂密的峡谷，四面是陡崖，比 Pine Springs 凉快、风也小得多，几乎没什么人。护林站对面的 Indian Meadow 自然步道是约 1 公里的平缓小环线，穿过草地、杜松林和枫树，野生动物很多；想爬山可以从这里上 Marcus 观景点或 Lost Peak 一带的高地。",
    tips: [
      "从 Pine Springs 开过去约 2 小时（要绕回新墨西哥，经 Carlsbad 走 137 号公路，最后一小段是砂石路），从 Carlsbad 约 1.5 小时",
      "上游的枫树常比 McKittrick 峡谷早一两周变色",
      "护林站只在有人手时开，没有商店、加油站和手机信号；营地只有 13 个营位，要预约",
    ],
  },
];
