import type { Attraction } from "./types";

// 三个入口园内互不相通：Homestead 主入口一路通到 Flamingo（主园路约 61 公里），Shark Valley 在北边的 Tamiami Trail 上，
// Gulf Coast 在西北角的 Everglades City；三处之间都要绕到园外开 1 小时左右
const ROYAL_PALM_PARKING = { lat: 25.38251, lon: -80.6096, nameZh: "Royal Palm 游客中心停车场" };
const FLAMINGO_MARINA = { lat: 25.14355, lon: -80.9223, nameZh: "Flamingo 码头（游船售票亭）" };
const SHARK_VALLEY_LOT = { lat: 25.75694, lon: -80.76538, nameZh: "Shark Valley 游客中心停车场" };
// 万岛群游船的报到处：经营商官网写在 815 Oyster Bar Ln（新游客中心）；NPS 的 Gulf Coast 页面还写着以北约 3 公里的 929 Dupont Street（新中心开放前的临时码头）
const GULF_COAST_DOCK = { lat: 25.84556, lon: -81.38681, nameZh: "Marjory Stoneman Douglas 游客中心（游船报到处）" };
// 雨季（5–11 月）湿热、蚊子多，旱季（12–4 月）水退到水塘边，鳄鱼和涉禽最集中
const DRY_SEASON = [12, 1, 2, 3, 4];

export const everglades: Attraction[] = [
  // ===== Homestead 主入口 · Royal Palm =====
  {
    id: "ever-coe-visitor-center",
    park: "ever",
    nameZh: "Ernest F. Coe 游客中心",
    nameEn: "Ernest F. Coe Visitor Center",
    kind: "visitor",
    area: "royal-palm",
    lat: 25.39526,
    lon: -80.5831,
    durationMin: 30,
    summary:
      "Homestead 主入口的游客中心，就在收费站外：有讲草河水流、动植物和公园保护历史的展览和短片，问路况、蚊子情况、当天的护林员活动都在这里。",
    tips: [
      "旱季（11–3 月）一般 8:00–17:00、雨季 9:00–17:00 开放，人手不够时会缩短",
      "门票只收信用卡、借记卡或电子年卡，不收现金；2026 年起 16 岁以上的非美国居民每人另交 $100",
      "进去以后到 Flamingo 一路没有餐馆和加油站，在 Florida City 吃好、加满油再进来",
    ],
    photoFile: "Ernest F. Coe Visitor Center, NPSPhoto (8721462806).jpg",
  },
  {
    id: "ever-anhinga-trail",
    park: "ever",
    nameZh: "蛇鸟步道",
    nameEn: "Anhinga Trail",
    kind: "hike",
    area: "royal-palm",
    lat: 25.383,
    lon: -80.60629,
    start: ROYAL_PALM_PARKING,
    durationMin: 60,
    hike: { distanceMi: 0.8, gainFt: 0, difficulty: "easy", loop: true },
    trail: { via: [{ lat: 25.383, lon: -80.60629 }], loop: true },
    bestTime: ["morning", "afternoon"],
    bestMonths: DRY_SEASON,
    mustSee: true,
    summary:
      "公园里看野生动物最有把握的地方：一圈约 1.3 公里的铺装路和木栈道，架在 Taylor Slough 的水面上。旱季水退，短吻鳄就趴在路边晒太阳，蛇鸟张开翅膀晾羽毛，苍鹭、白鹭、鸬鹚、紫青水鸡近在几米外，几乎不用望远镜。",
    tips: [
      "停车场的黑美洲鹫会啄车上的橡胶密封条和雨刮，游客中心旁免费借防水布和弹力绳把车盖上",
      "鳄鱼离步道很近，保持至少 4–5 米距离，不要喂食；带小孩和推车时看紧",
      "旁边的 Gumbo Limbo 步道是一小圈约 600 米的热带硬木林，顺路走；旱季晚上有护林员带的夜间漫步，用手电照鳄鱼的眼睛",
    ],
    photoFile: "Anhinga Trail (48637524178).jpg",
  },
  {
    id: "ever-nike-missile-site",
    park: "ever",
    nameZh: "Nike 导弹基地 HM-69",
    nameEn: "Nike Missile Site HM-69",
    kind: "landmark",
    area: "royal-palm",
    lat: 25.38938,
    lon: -80.68319,
    durationMin: 60,
    openMonths: [12, 1, 2, 3],
    closedNote:
      "导弹基地平时锁着，只在旱季（大约 12 月到 3 月）由志愿者和护林员开放参观日、带导览；4 月初到 11 月底只能跟 Everglades Institute 的付费课程进去。这段时间可以在 Royal Palm 走蛇鸟步道。",
    hours: [{ open: "10:00", close: "14:00" }],
    summary:
      "1962 年古巴导弹危机后建的防空导弹阵地，一直用到 1979 年：导弹库、装弹棚、警犬犬舍和一枚 Nike Hercules 导弹都保留着，是美国保存得最完整的 Nike 基地之一，在 Royal Palm 往西的一条支路尽头。",
    tips: [
      "不是每天开放：出发前看公园活动日历（Program Calendar）或打 305-242-7700 问哪几天有参观日、导览几点开始",
      "在 Royal Palm 路口附近拐进 Research Road，按指示牌到集合点停车，导览从这里出发",
    ],
    photoFile: "Nike Missile Site HM-69, Everglades, Florida.jpg",
  },

  // ===== 主园路 =====
  {
    id: "ever-pa-hay-okee",
    park: "ever",
    nameZh: "Pa-hay-okee 观景台",
    nameEn: "Pa-hay-okee Overlook",
    kind: "viewpoint",
    area: "main-road",
    lat: 25.44164,
    lon: -80.78395,
    durationMin: 25,
    bestTime: ["morning", "sunset"],
    mustSee: true,
    summary:
      "“Pa-hay-okee”是原住民语言里“草河”的意思。一段约 300 米的木栈道通到一座观景台，眼前是一望无际的锯齿草原，零星点缀着矮柏树岛，最能看出大沼泽地是一条宽几十公里、几乎看不出在流动的河。",
    tips: [
      "从主园路拐进一条短支路就到，离 Royal Palm 约 20 分钟",
      "日落时草原一片金黄，是园里拍日落的好地方；路上常见林鹳、粉红琵鹭在路边的水沟里觅食",
      "观景台没有遮阴，夏天带帽子、驱蚊水",
    ],
    photoFile: "Pa-hay-okee Overlook.JPG",
  },
  {
    id: "ever-mahogany-hammock",
    park: "ever",
    nameZh: "桃花心木林步道",
    nameEn: "Mahogany Hammock Trail",
    kind: "hike",
    area: "main-road",
    lat: 25.32206,
    lon: -80.83368,
    start: { lat: 25.32361, lon: -80.83207, nameZh: "Mahogany Hammock 步道口停车场" },
    durationMin: 30,
    hike: { distanceMi: 0.5, gainFt: 0, difficulty: "easy", loop: true },
    trail: { via: [{ lat: 25.32206, lon: -80.83368 }], loop: true },
    bestTime: ["morning", "afternoon"],
    summary:
      "草原中间一座比周围高出几十厘米的“树岛”（hammock），一圈木栈道钻进茂密的热带硬木林：西印度桃花心木、绞杀榕、挂满凤梨科附生植物的老树，和外面的锯齿草原完全是两个世界。",
    tips: ["林子里阴凉，但雨季蚊子特别多，夏天来要喷足驱蚊水", "林中偶尔能看到树蜗牛和横斑林鸮，安静走、抬头看"],
    photoFile: "Tropical hardwood hammock on Everglades National Park Mahogany Hammock Trail.jpg",
  },
  {
    id: "ever-west-lake",
    park: "ever",
    nameZh: "西湖红树林木栈道",
    nameEn: "West Lake Trail",
    kind: "hike",
    area: "main-road",
    lat: 25.21291,
    lon: -80.85133,
    start: { lat: 25.21456, lon: -80.85036, nameZh: "West Lake 停车场" },
    durationMin: 25,
    hike: { distanceMi: 0.5, gainFt: 0, difficulty: "easy", loop: true },
    trail: { via: [{ lat: 25.21291, lon: -80.85133 }], loop: true },
    summary:
      "快到 Flamingo 时路边的一段木栈道，穿过咸淡水交汇处的红树林，四种红树（红树、黑皑木、白红树和钮扣红树）都能看到，湖边偶尔有美洲鳄。",
    tips: ["离 Flamingo 约 10 分钟，去 Flamingo 的路上顺路停", "冬季湖上常有鸭子、白鹈鹕；夏天蚊子多，停留时间短一点"],
    photoFile: "West lake boardwalk, NPSphoto (9255411617).jpg",
  },

  // ===== Flamingo =====
  {
    id: "ever-flamingo-marina",
    park: "ever",
    nameZh: "Flamingo 码头与游客中心",
    nameEn: "Flamingo Marina & Guy Bradley Visitor Center",
    kind: "landmark",
    area: "flamingo",
    lat: 25.14355,
    lon: -80.9223,
    durationMin: 60,
    bestTime: ["morning", "sunset"],
    bestMonths: DRY_SEASON,
    mustSee: true,
    summary:
      "主园路的尽头，佛罗里达湾边的 Flamingo。码头里常有海牛浮上来换气，美洲鳄趴在船坡和岸边晒太阳；Guy Bradley 游客中心讲这片海湾和红树林，旁边是 2023 年新开的 Flamingo Lodge 和餐厅，往西几百米的 Eco Pond 傍晚有大群涉禽。",
    tips: [
      "从 Ernest F. Coe 游客中心开过来约 61 公里、1 小时，一路没有加油站和餐馆",
      "海牛、鳄鱼都是野生动物：不要喂、不要摸、不要往水里灌淡水给海牛喝（违法）",
      "码头可以租独木舟、皮划艇和自行车；雨季（5–11 月）这里的蚊子是全园最厉害的，长袖长裤加驱蚊水",
    ],
    photoFile: "Flamingo Marina - Everglades National Park - DSC09387.jpg",
  },
  {
    id: "ever-flamingo-boat-tour",
    park: "ever",
    nameZh: "Flamingo 游船（红树林水道 / 佛罗里达湾）",
    nameEn: "Flamingo Boat Tours (Backcountry & Florida Bay)",
    kind: "experience",
    area: "flamingo",
    lat: 25.182,
    lon: -80.916,
    start: FLAMINGO_MARINA,
    durationMin: 90,
    bestMonths: [11, 12, 1, 2, 3, 4],
    permit: "在 Flamingo 码头的售票亭或特许经营商 Flamingo Adventures 官网买票，冬季旺季提前订",
    mustSee: true,
    summary:
      "公园大部分只能坐船看。约 1.5 小时的讲解游船有两条线：全年开的“荒野线”沿 Buttonwood 运河钻进红树林，到 Coot 湾、Whitewater 湾一带，常见美洲鳄、海牛和涉禽；11–4 月加开的佛罗里达湾线开到开阔的浅海湾，能看到海豚和岛上的鸟群。",
    tips: [
      "荒野线 9、11、13、15 点开，佛罗里达湾线（11–4 月）10、12、14、16 点开；开船前 15 分钟到售票亭报到",
      "11 月中到 2 月下旬每天 14:00 的佛罗里达湾线有护林员随船讲解",
      "船上没有遮阳的位置有限，带帽子、防晒和水",
    ],
    photoFile: "Flamingo boat tour, NPSPhoto, Sabrina Diaz (9255461977).jpg",
  },

  // ===== Shark Valley =====
  {
    id: "ever-shark-valley-tram",
    park: "ever",
    nameZh: "Shark Valley 电车导览与观景塔",
    nameEn: "Shark Valley Tram Tour & Observation Tower",
    kind: "experience",
    area: "shark-valley",
    lat: 25.65608,
    lon: -80.76643,
    start: SHARK_VALLEY_LOT,
    durationMin: 120,
    bestTime: ["morning", "afternoon"],
    bestMonths: DRY_SEASON,
    hours: [{ open: "08:30", lastEntry: "18:00" }],
    permit: "电车导览向特许经营商 Shark Valley Tram Tours 买票（成人约 $36），旺季建议提前在官网订",
    mustSee: true,
    summary:
      "一条 24 公里的铺装环线伸进锯齿草原，私家车不能进。约 2 小时的露天电车由讲解员一路讲草河的生态，路边水沟里的短吻鳄常常一条挨一条；半路在一座高约 20 米的螺旋观景塔停一阵，登顶 360 度俯瞰整片草河。不坐电车也可以租自行车骑一圈（约 2.5–3 小时）。",
    tips: [
      "大门 8:30–18:00 开放，18:00 以后车进不来；旺季（12–4 月）停车场常在上午 10 点前停满，出一辆进一辆，最好一早或下午 3 点后来",
      "自行车在游客中心租，8:30–16:00 出租、17:00 前还，一天约 $25；环线几乎没有遮阴，带足水",
      "鳄鱼常趴在路面上，骑车绕开、至少隔 4–5 米；这里没有风扇船，最近的风扇船在 Tamiami Trail 往东 15–20 分钟",
    ],
    photoFile: "Shark Valley Observation Tower Panorama.jpg",
  },

  // ===== Gulf Coast · Everglades City =====
  {
    id: "ever-gulf-coast-visitor-center",
    park: "ever",
    nameZh: "Marjory Stoneman Douglas 游客中心（Gulf Coast）",
    nameEn: "Marjory Stoneman Douglas Visitor Center (Gulf Coast)",
    kind: "visitor",
    area: "gulf-coast",
    lat: 25.84556,
    lon: -81.38681,
    durationMin: 30,
    hours: [{ open: "09:00", close: "17:00" }],
    summary:
      "公园西北角 Everglades City 的新游客中心，以写《大沼泽地：草河》的作家 Marjory Stoneman Douglas 命名，2025 年 12 月剪彩、2026 年开放，取代 2017 年被飓风 Irma 毁掉的旧中心。建在高处，能扛 4.5 米的风暴潮，是万岛群划船和野外露营的出发点。",
    tips: [
      "每天 9:00–17:00 开放；万岛群野外营地的许可证在这里办",
      "旁边有皮划艇下水点，可以划进 Chokoloskee 湾的红树林",
    ],
  },
  {
    id: "ever-ten-thousand-islands-tour",
    park: "ever",
    nameZh: "万岛群游船",
    nameEn: "Ten Thousand Islands Boat Tour",
    kind: "experience",
    area: "gulf-coast",
    lat: 25.795,
    lon: -81.41,
    start: GULF_COAST_DOCK,
    durationMin: 90,
    bestMonths: [11, 12, 1, 2, 3, 4],
    permit: "向公园授权的 Everglades National Park Adventures 订票（官网或现场，成人约 $48 起），旺季提前订",
    summary:
      "墨西哥湾边上成百上千座红树林小岛组成的迷宫。约 1.5 小时的平底游船从 Everglades City 开进 Chokoloskee 湾和万岛群，常有宽吻海豚跟着船头冲浪，冬天能看到白鹈鹕、鹗和海鸟群，运气好会碰到海牛。",
    tips: [
      "全年都开，每天约 4 班，具体时间以订票页面为准；经营商写的报到处在游客中心（815 Oyster Bar Ln），NPS 页面还写着镇北的 929 Dupont Street，订票时确认",
      "这里和 Flamingo、Shark Valley 园内不通，从迈阿密开过来约 1.5 小时、从那不勒斯约 45 分钟",
      "Everglades City 是石蟹（stone crab）的产地，10 月中到次年 5 月是石蟹季，游船后在镇上吃一顿",
    ],
    photoFile: "Mangrove Island, Ten Thousand Islands, NPSPhoto, D.Grimes (9099546183).jpg",
  },
  {
    id: "ever-smallwood-store",
    park: "ever",
    nameZh: "Smallwood 老商店博物馆",
    nameEn: "Smallwood Store Museum",
    kind: "landmark",
    area: "gulf-coast",
    lat: 25.81001,
    lon: -81.36249,
    durationMin: 40,
    hours: [
      { open: "10:00", close: "17:00", months: [12, 1, 2, 3, 4] },
      { open: "11:00", close: "17:00", months: [5, 6, 7, 8, 9, 10, 11] },
    ],
    outsidePark: true,
    summary:
      "Chokoloskee 岛尽头的一座高脚木屋，1906 年起是拓荒者、渔民和塞米诺尔人用兽皮、羽毛换物资的贸易站，店里的货架、账本和老物件都按当年的样子摆着，是了解这片海岸拓荒史最直观的地方。",
    tips: ["门票约 $5，复活节和圣诞节不开，出发前打 239-695-2989 确认", "从 Everglades City 开过堤道约 10 分钟，可以和万岛群游船排在同一个半天"],
  },

  // ===== 园外：Tamiami Trail · Big Cypress =====
  {
    id: "ever-airboat",
    park: "ever",
    nameZh: "Tamiami Trail 风扇船",
    nameEn: "Airboat rides on Tamiami Trail (Coopertown, Gator Park, Everglades Safari Park)",
    kind: "experience",
    area: "tamiami",
    lat: 25.76064,
    lon: -80.56124,
    durationMin: 90,
    outsidePark: true,
    summary:
      "坐风扇船在锯齿草原上贴着水面飞驰，是很多人对大沼泽地的第一印象。Shark Valley 以东的 Tamiami Trail 上有好几家私营公司（最老的 Coopertown 从 1945 年开到现在），船程一般 30–40 分钟，多数还附带短吻鳄表演和小动物园。",
    tips: [
      "国家公园的核心区（Shark Valley、主园路、Flamingo）不许开风扇船，这些公司在公园东北边缘和水利保护区里开",
      "发动机非常吵，公司会发耳塞；坐前排容易被溅湿",
      "各家价格差别大、网上常有团购价；从迈阿密市区开过来约 40 分钟，可以和 Shark Valley 排在同一天",
    ],
    photoFile: "Miami everglades airboat tourism.JPG",
  },
  {
    id: "ever-kirby-storter",
    park: "ever",
    nameZh: "Kirby Storter 木栈道（大柏树）",
    nameEn: "Kirby Storter Boardwalk (Big Cypress National Preserve)",
    kind: "hike",
    area: "tamiami",
    lat: 25.86767,
    lon: -81.15339,
    start: { lat: 25.86852, lon: -81.15437, nameZh: "Kirby Storter 路边公园停车场" },
    durationMin: 30,
    hike: { distanceMi: 1, gainFt: 0, difficulty: "easy" },
    outsidePark: true,
    summary:
      "Tamiami Trail 上大柏树国家保护区（Big Cypress National Preserve）的一段木栈道，穿过落羽杉林和锯齿草原，原本尽头是一个常有短吻鳄和涉禽的鳄鱼洞水塘。",
    tips: [
      "2024 年 10 月一场火烧掉了栈道东段的大部分，到 2026 年仍只开放一部分、走不到尽头的水塘，去之前打 239-695-2000 问开到哪",
      "就在 Shark Valley 和 Everglades City 之间，往返两边时顺路停；有野餐桌和旱厕",
    ],
    photoFile: "Kirby Storter boardwalk, Big Cypress (9267476847).jpg",
  },
  {
    id: "ever-clyde-butcher",
    park: "ever",
    nameZh: "Clyde Butcher 大柏树画廊",
    nameEn: "Clyde Butcher's Big Cypress Gallery",
    kind: "landmark",
    area: "tamiami",
    lat: 25.85495,
    lon: -81.01976,
    durationMin: 40,
    outsidePark: true,
    summary:
      "摄影师 Clyde Butcher 的画廊，被称为“大沼泽地的安塞尔·亚当斯”：几十年来用大画幅相机拍佛罗里达沼泽的黑白风景，巨幅照片很震撼。画廊还带收费的“沼泽漫步”，跟着向导蹚进齐膝深的柏树沼泽。",
    tips: [
      "沼泽漫步要提前在画廊官网订，旱季最舒服；开放时间不固定，出发前在官网确认",
      "往西约 1.5 公里是大柏树保护区的 Oasis 游客中心，旁边运河的木栈道旱季常有一排短吻鳄",
      "门口运河边也常有鳄鱼趴着，别靠近、别喂",
    ],
    photoFile: "American alligator rests in front of sign warning against feeding it outside of Clyde Butcher Big Cypress Gallery.jpg",
  },

  // ===== 园外：Homestead · Florida City =====
  {
    id: "ever-robert-is-here",
    park: "ever",
    nameZh: "Robert Is Here 水果摊",
    nameEn: "Robert Is Here Fruit Stand",
    kind: "landmark",
    area: "homestead",
    lat: 25.44736,
    lon: -80.50186,
    durationMin: 30,
    openMonths: [11, 12, 1, 2, 3, 4, 5, 6, 7, 8],
    closedNote: "每年 9–10 月关门休息，11 月初重新开；可以去 Florida City 的超市买路上的水和零食。",
    hours: [{ open: "09:00", close: "18:00" }],
    outsidePark: true,
    summary:
      "从 1959 年开到现在的路边水果摊，就在去公园主入口的路上：卖芒果、番石榴、人心果、杨桃等南佛罗里达的热带水果，招牌是用现切水果打的奶昔（芒果、Key Lime 最受欢迎），后院还养着山羊和陆龟。",
    tips: ["从这里到 Ernest F. Coe 游客中心约 15 分钟，进园前或出园后顺路", "周末中午排队长，奶昔最好上午来买"],
  },
];
