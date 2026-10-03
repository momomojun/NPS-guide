import type { Attraction } from "./types";

// 洞里的几个景点（Big Room、国王宫殿、下层洞穴）都从游客中心坐电梯下去，地面上没有准确位置，地图上统一标在游客中心。
// 2026 年：进洞要分时段入场预约（Recreation.gov，每人 $1）+ 门票（16 岁以上 $15）；
// 游客中心 9:00–17:00，最晚 14:15 买票、14:30 进洞，最后一班出洞电梯 16:45；感恩节、圣诞节、元旦全园关闭。
const VC_PARKING = { lat: 32.1751, lon: -104.44259, nameZh: "游客中心停车场" };
/** 坐电梯、走天然入口进洞都是 9:30–14:30，最后一班出洞电梯 16:45（NPS Operating Hours 页面，2025-05-06 更新） */
const CAVERN_HOURS = [{ open: "09:30", lastEntry: "14:30", close: "16:45" }];
const CAVERN_PERMIT =
  "进洞要先在 Recreation.gov 订分时段入场（每人 $1，30 天前早上 8 点开放），到游客中心再买门票（16 岁以上 $15）";

export const carlsbadCaverns: Attraction[] = [
  {
    id: "cave-visitor-center",
    park: "cave",
    nameZh: "卡尔斯巴德洞窟游客中心",
    nameEn: "Carlsbad Caverns Visitor Center",
    kind: "visitor",
    area: "visitor-center",
    lat: 32.17543,
    lon: -104.4442,
    durationMin: 30,
    summary:
      "建在瓜达卢普山脉的山脊上，买洞穴门票、坐电梯下洞都在这栋楼里；里面还有讲洞穴形成和蝙蝠的展览、介绍片、书店和简餐。",
    tips: [
      "9:00–17:00 开放；洞穴门票最晚 14:15 卖完，14:30 后不能再进洞，最后一班出洞电梯 16:45（以当天公布为准）",
      "洞里除了白水什么都不能吃喝，简餐下午三四点就关，午饭最好在进洞前解决",
      "宠物不能进洞，游客中心有寄养笼舍；感恩节、圣诞节、元旦全园关闭",
    ],
    photoFile: "Carlsbad Caverns National Park, New Mexico, USA 5-2024 1.jpg",
  },
  {
    id: "cave-natural-entrance",
    park: "cave",
    nameZh: "天然入口步道",
    nameEn: "Natural Entrance Trail",
    kind: "hike",
    area: "cavern",
    lat: 32.17708,
    lon: -104.44103,
    start: VC_PARKING,
    durationMin: 75,
    // 只画得出地面上从游客中心走到洞口的一段，洞里的步道 OpenStreetMap 上没有
    trail: {},
    hike: { distanceMi: 1.25, difficulty: "hard" },
    permit: CAVERN_PERMIT,
    hours: CAVERN_HOURS,
    mustSee: true,
    summary:
      "沿着当年探洞者的路线，从巨大的洞口走进去：之字形的铺装步道一路往下降约 230 米（相当于 75 层楼），光线越来越暗，经过魔鬼泉、鲸鱼嘴、冰山石，在地下接上 Big Room 步道。",
    tips: [
      "单程约 2 公里、1 小时左右，建议往下走、逛完 Big Room 再坐电梯上来；反过来往上爬非常累",
      "坡很陡、地面潮湿，穿抓地好的包头鞋；心脏和呼吸系统不好的人不建议走",
      "洞里常年约 13°C，带件薄外套；婴儿车、三脚架都不能带进洞",
    ],
    photoFile: "Natural Entrance Trail.jpg",
  },
  {
    id: "cave-big-room",
    park: "cave",
    nameZh: "大房间（Big Room）",
    nameEn: "Big Room Trail",
    kind: "hike",
    area: "cavern",
    lat: 32.17543,
    lon: -104.4442,
    start: VC_PARKING,
    durationMin: 100,
    hike: { distanceMi: 1.25, difficulty: "easy", loop: true },
    permit: CAVERN_PERMIT,
    hours: CAVERN_HOURS,
    mustSee: true,
    summary:
      "北美按体积最大的单个洞厅。约 2 公里的环形步道基本平坦，一路是巨大的石笋、钟乳石、帷幕石和深不见底的竖井，1924 年探险队用过的绳梯还挂在一处竖井里。从游客中心坐电梯约 1 分钟就下到地下约 230 米。",
    tips: [
      "赶时间可以走中间的近路（约 1 公里、45 分钟）；坐电梯下来的话部分路段能推轮椅，婴儿车不能带",
      "洞里很暗也很安静，说话声能传出几百米；可以用闪光灯，但不能用三脚架",
      "出洞时都要踩过消毒垫，防止蝙蝠的白鼻综合征传进来；去过别的洞穴的鞋子、衣服不要穿进来",
    ],
    photoFile: "Big Room, Carlsbad Cavern (51203204939).jpg",
  },
  {
    id: "cave-kings-palace",
    park: "cave",
    nameZh: "国王宫殿导览",
    nameEn: "King's Palace Tour (ranger-guided)",
    kind: "experience",
    area: "cavern",
    lat: 32.17543,
    lon: -104.4442,
    start: VC_PARKING,
    durationMin: 90,
    permit: "护林员导览：2026 年只在游客中心卖当天的现场票（看人手够不够），成人 $10；另外仍要分时段入场预约和洞穴门票",
    summary:
      "跟护林员走进 Big Room 旁边装饰最密集的四个洞厅，下到游客能到的最深处（地下约 253 米），满眼是卷曲的石枝、帷幕石和细长的“苏打吸管”；中途会关掉所有灯，体验洞里真正的漆黑。",
    tips: [
      "2026 年周四到周二 10:30、13:30 两场（周三不开），只在人手够时开，当天一早到游客中心问",
      "导览票至少提前 30 分钟在游客中心取，每团最多 12 人；6 岁以下不能参加，16 岁以下要大人陪",
      "约 1.6 公里，比天然入口步道轻松，但要再往下走一段，最后有一段很陡的上坡",
    ],
    photoFile: "King's Palace, Carlsbad Cavern (51202313262).jpg",
  },
  {
    id: "cave-lower-cave",
    park: "cave",
    nameZh: "下层洞穴探险导览",
    nameEn: "Lower Cave Tour (ranger-guided)",
    kind: "experience",
    area: "cavern",
    lat: 32.17543,
    lon: -104.4442,
    start: VC_PARKING,
    durationMin: 180,
    permit:
      "要在 Recreation.gov 提前买导览票（成人 $30，儿童和老人卡、残障卡持有者 $15），30 天前开放，每团 12 人；另外仍要分时段入场预约和洞穴门票",
    summary:
      "戴上头盔和头灯，先抓着绳子倒退着下一段湿滑的斜坡，再顺着约 18 米的梯子爬下去，进入 1924 年国家地理探险队考察过的下层洞穴：没有电灯和铺装步道，要钻过窄窄的“佛罗里达锁孔”，还能看到满窝“洞穴珍珠”的 Rookery。",
    tips: [
      "每周三 9:30 一场，约 3 小时；票要在 9:15 前到游客中心取，从游客中心的放映厅出发",
      "12 岁以上才能参加，16 岁以下要大人陪；必须穿抓地好的登山鞋（运动鞋、凉鞋都不行），只能带很小的腰包",
      "怕高、夜盲、膝盖不好的人不适合；参加了下层洞穴，当天就不能再参加国王宫殿导览",
    ],
    photoFile: "Cave Pearls - Rookery, Lower Cave, Carlsbad Cavern (51202462532).jpg",
  },
  {
    id: "cave-bat-flight",
    park: "cave",
    nameZh: "蝙蝠出洞",
    nameEn: "Bat Flight Program",
    kind: "experience",
    area: "visitor-center",
    lat: 32.17694,
    lon: -104.4414,
    start: VC_PARKING,
    durationMin: 75,
    bestTime: ["sunset"],
    openMonths: [4, 5, 6, 7, 8, 9, 10],
    closedNote:
      "蝙蝠冬天飞到墨西哥过冬，护林员讲解只在 4–10 月每天傍晚举行；11 月到次年 3 月看不到大群蝙蝠出洞，洞里的 Big Room 照常开放。",
    bestMonths: [8, 9],
    mustSee: true,
    summary:
      "夏天几十万只巴西犬吻蝠（Brazilian free-tailed bat）住在洞里，日落前后成群从天然入口盘旋着飞出去觅食。先在洞口的露天剧场听护林员讲解，然后安静地看蝙蝠一波接一波从头顶飞过。",
    tips: [
      "免费、不用预约，也不需要洞穴门票；开始时间随日落变，当天在游客中心问",
      "为保护蝙蝠，剧场一带禁止一切电子设备：手机、相机都不能拿出来，也不能拍照",
      "8–9 月刚出生的小蝙蝠加入、北边迁来的蝙蝠路过，数量最多；清晨 4–6 点还能看到蝙蝠从高空俯冲回洞",
      "打雷闪电时取消；宠物不能进剧场",
    ],
    photoFile: "Bat Flight from inside Natural Entrance (51337179183).jpg",
  },
  {
    id: "cave-desert-nature-trail",
    park: "cave",
    nameZh: "奇瓦瓦沙漠自然步道",
    nameEn: "Chihuahuan Desert Nature Trail",
    kind: "hike",
    area: "visitor-center",
    lat: 32.1761,
    lon: -104.43791,
    start: { lat: 32.17561, lon: -104.44146, nameZh: "游客中心东停车场尽头的步道口" },
    durationMin: 30,
    trail: {
      via: [
        { lat: 32.17591, lon: -104.43951 },
        { lat: 32.1761, lon: -104.43791 },
        { lat: 32.17689, lon: -104.43817 },
      ],
      loop: true,
    },
    hike: { distanceMi: 0.7, difficulty: "easy", loop: true },
    summary:
      "游客中心东停车场尽头的 1.1 公里小环线，沿途植物标牌帮你认识龙舌兰、丝兰和仙人掌；上段约 300 米能推轮椅，通到有遮阳亭的观景点，远望瓜达卢普山。",
    tips: ["晚春到初秋的黄昏和夜里封闭，以免打扰出洞的蝙蝠", "等进洞时间或蝙蝠讲解开始前，正好走一圈"],
  },
  {
    id: "cave-walnut-canyon-overlook",
    park: "cave",
    nameZh: "胡桃峡谷观景台",
    nameEn: "Walnut Canyon Overlook",
    kind: "viewpoint",
    area: "walnut-canyon",
    lat: 32.18312,
    lon: -104.43394,
    start: { lat: 32.18195, lon: -104.43394, nameZh: "进园公路旁的观景步道口" },
    durationMin: 15,
    summary:
      "进园公路边一条约 165 米的铺装小路，走到崖边俯瞰 Walnut Canyon 和远处的平原，路边就是奇瓦瓦沙漠的龙舌兰、丝兰和仙人掌。",
    tips: ["在从 White's City 上山的公路边，进出公园顺路停一下"],
    photoFile: "Walnut Canyon Overlook (51202787716).jpg",
  },
  {
    id: "cave-walnut-canyon-drive",
    park: "cave",
    nameZh: "胡桃峡谷沙漠景观道",
    nameEn: "Walnut Canyon Desert Drive",
    kind: "drive",
    area: "walnut-canyon",
    lat: 32.17293,
    lon: -104.50701,
    start: { lat: 32.17711, lon: -104.44764, nameZh: "景观道起点（游客中心西侧）" },
    durationMin: 60,
    openMonths: [],
    closedNote:
      "2022 年 8 月的山洪冲毁了这条砂石路，2026 年仍关闭：NPS 计划重新设计更耐冲刷的路基，施工排在联邦 2027 财年，重开时间未定。可以改去进园公路边的胡桃峡谷观景台，或走游客中心旁的奇瓦瓦沙漠自然步道。",
    summary:
      "从游客中心旁出发，沿山脊和峡谷绕一圈再回到进园公路的 15 公里砂石单行道，一路是龙舌兰、丝兰等奇瓦瓦沙漠植物和层层叠叠的峡谷，平时开一圈约 1 小时。",
    tips: ["重开后也不适合低底盘车，房车、大巴和拖车不能开"],
    photoFile: "Walnut Canyon P1011709mod.jpg",
  },
  {
    id: "cave-rattlesnake-springs",
    park: "cave",
    nameZh: "响尾蛇泉",
    nameEn: "Rattlesnake Springs",
    kind: "landmark",
    area: "rattlesnake",
    lat: 32.11005,
    lon: -104.46683,
    start: { lat: 32.11155, lon: -104.46569, nameZh: "Rattlesnake Springs 野餐区停车场" },
    durationMin: 45,
    summary:
      "主景区以南约 25 公里的一片泉水绿洲，民间资源保护队当年种下的三角叶杨长成了一大片树林，树下有野餐桌和烤架。这里是新墨西哥州有名的观鸟点，一年四季都适合观鸟，春夏常见朱红霸鹟、夏唐纳雀。",
    tips: [
      "日出前 30 分钟开放、日落后 30 分钟关闭，只能白天来，泉里不能游泳",
      "从 White's City 沿 62/180 号公路往南，再转进 Rattlesnake Springs Road，从游客中心开过去约 25 分钟",
    ],
    photoFile: "Rattlesnake Springs Picnic Area (51234084261).jpg",
  },
  {
    id: "cave-slaughter-canyon-cave",
    park: "cave",
    nameZh: "屠宰峡谷洞步道",
    nameEn: "Slaughter Canyon Cave Trail",
    kind: "hike",
    area: "slaughter",
    lat: 32.11227,
    lon: -104.56946,
    start: { lat: 32.11044, lon: -104.56272, nameZh: "Slaughter Canyon 步道口停车场" },
    durationMin: 90,
    trail: {
      via: [
        { lat: 32.11187, lon: -104.56447 },
        { lat: 32.11265, lon: -104.5677 },
        { lat: 32.11227, lon: -104.56946 },
      ],
    },
    hike: { distanceMi: 1, gainFt: 500, difficulty: "hard" },
    bestTime: ["morning"],
    summary:
      "公园西南角的偏远峡谷，陡峭的碎石小路约 0.8 公里爬升约 150 米到 Slaughter Canyon 洞口，一路回望峡谷。洞里有高约 27 米的“君主”石柱，但只能跟护林员进，这个导览 2025 年起因人手不足暂停，2026 年的导览时间表里也没有。",
    tips: [
      "要先下山到 62/180 号公路，再转进 Slaughter Canyon 的县道，从游客中心开过去约 50 分钟，沿途没有水和服务",
      "夏天很热，早上走、带足水；步道窄而陡，下山小心滑",
    ],
    photoFile: "Slaughter Canyon (51202750151).jpg",
  },
];
