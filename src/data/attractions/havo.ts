import type { Attraction } from "./types";

// 夏威夷火山国家公园（havo）。坐标按 OpenStreetMap 和 NPS API places 核对；停车场坐标来自 NPS Parking 页面（2025-03-05）。
// 2026 年 10 月的现况（来源见 notes.md）：
// - Kīlauea 山顶 2024 年 12 月 23 日起在 Halemaʻumaʻu 火山口里间歇喷发，到 2026 年 8 月 25 日已经 54 次（每次几小时），
//   9 月 7 日起第 55 次的前兆活动断断续续，10 月 3 日 USGS 仍是 WATCH / ORANGE，还没开始喷泉；喷发区本身一直封闭。
// - Kīlauea 游客中心 2025 年 2 月起闭馆翻修，预计 2026 年底重开；这段时间服务搬到 Kilauea Military Camp 里的欢迎中心（9:00–16:45）。
// - 10 月 1 日起 Keanakākoʻi 一侧因地震增多、火山活动不稳临时关闭；硫磺岸的小桥损坏关闭（木栈道从 Steam Vents 一侧进）；
//   Mauna Loa 路第二道牛栏以上 9 月 23 日到 10 月 29 日伐树封路，Kīpukapuaulu 步道因危险树木关闭；Hōlei 海蚀拱 9 月底塌了。
// - 喷发时如果刮南风，火山渣会落到 Uēkahuna、Kilauea Military Camp 一带，公园会临时封路甚至闭园（2026 年 3 月 10 日、4 月 9 日）。

/** Kīlauea 游客中心停车场：游客中心翻修期间开放约一半，Volcano House、火山艺术中心和几条步道也从这里走 */
const KVC_PARKING = { lat: 19.4295, lon: -155.2571, nameZh: "Kīlauea 游客中心停车场（游客中心翻修中）" };
/** 欢迎中心旁 Kilauea Military Camp 的球场停车场（约 100 个车位），从 KMC 最后一个入口进去 */
const WELCOME_PARKING = { lat: 19.43272, lon: -155.27536, nameZh: "Kilauea Military Camp 球场停车场（欢迎中心）" };
const STEAM_VENTS_PARKING = { lat: 19.43156, lon: -155.26785, nameZh: "Steam Vents 停车场" };
const DEVASTATION_PARKING = { lat: 19.40604, lon: -155.25298, nameZh: "Devastation 步道口停车场" };

export const hawaiiVolcanoes: Attraction[] = [
  {
    id: "havo-welcome-center",
    park: "havo",
    nameZh: "Kīlauea 欢迎中心（临时游客中心）",
    nameEn: "Welcome Center at Kilauea Military Camp",
    kind: "visitor",
    area: "summit",
    lat: 19.43273,
    lon: -155.27384,
    start: WELCOME_PARKING,
    durationMin: 20,
    hours: [{ open: "09:00", close: "16:45" }],
    summary:
      "Kīlauea 游客中心 2025 年 2 月起闭馆翻修（预计 2026 年底重开），这段时间护林员咨询、地图、喷发观景建议、初级护林员手册和公园书店都在 Kilauea Military Camp 里的欢迎中心。门口的公告板写着当天的护林员讲解；穿过草坪、过马路就是能看喷发的火山口边观景点。",
    tips: [
      "每天 9:00–16:45 开放；停车停 KMC 最里面那个入口进去的球场，别停 KMC 客房门口的住客车位",
      "园内手机信号时有时无，进园前下载好离线地图和 NPS App；园内不收现金，门票刷卡或提前在 Recreation.gov 买",
    ],
  },
  {
    id: "havo-uekahuna",
    park: "havo",
    nameZh: "Uēkahuna 观景台",
    nameEn: "Uēkahuna Overlook",
    kind: "viewpoint",
    area: "summit",
    lat: 19.41939,
    lon: -155.28902,
    start: { lat: 19.42023, lon: -155.28897, nameZh: "Uēkahuna 停车场" },
    durationMin: 30,
    mustSee: true,
    summary:
      "Kīlauea 破火山口边缘最高的地方，夏威夷人的圣地。观景平台正对整个破火山口（Kaluapele）和 2018 年大塌陷后又深又宽的 Halemaʻumaʻu 火山口，晴天背后是冒纳罗亚；喷发时这里离熔岩喷泉很近，护林员也常在这里讲解。原来的 Jaggar 博物馆和火山观测站被 2018 年的地震震坏，已经拆掉了。",
    tips: [
      "Crater Rim Drive 西段的尽头，约 70 个车位，比别的观景台好停；长过约 7.6 米或宽过约 2.4 米的车（房车、大巴）不能开过 Kilauea Military Camp",
      "刮南风时喷发的火山渣会落在这里（2026 年 3 月一次就积了 10–18 厘米），喷发时戴眼镜、帽子、穿长袖，渣地上别捡火山玻璃丝",
      "有冲水厕所和饮水机",
    ],
    photoFile: "HAVO 20210930 Blue hour at Uēkahuna J Wei (51541345045).jpg",
  },
  {
    id: "havo-kilauea-overlook",
    park: "havo",
    nameZh: "Kīlauea 观景台",
    nameEn: "Kīlauea Overlook",
    kind: "viewpoint",
    area: "summit",
    lat: 19.42319,
    lon: -155.28406,
    start: { lat: 19.42389, lon: -155.2846, nameZh: "Kīlauea 观景台停车场" },
    durationMin: 20,
    summary:
      "NPS 说这里看 Kīlauea 破火山口和 Halemaʻumaʻu 火山口最震撼：视野没有遮挡，喷发时能一直看到火山口底部的熔岩。观景台边就是火山口边缘步道，往西走约 600 米到 Uēkahuna，一路都能看火山口。",
    tips: [
      "只有 36 个车位，喷发期间傍晚 5 点到晚上 9 点最挤，NPS 建议天亮前来",
      "沿火山口边缘步道往西多走一段（约 1.6 公里、30 分钟）视野更好；只有旱厕",
    ],
    photoFile: "HAVO 20211219 Lava visible from Kilauea Overlook J Wei (51760201945).jpg",
  },
  {
    id: "havo-steam-vents",
    park: "havo",
    nameZh: "喷气孔和蒸汽崖",
    nameEn: "Steam Vents (Kūkamāhuākea) & Steaming Bluff (Wahinekapu)",
    kind: "landmark",
    area: "summit",
    lat: 19.42983,
    lon: -155.26698,
    start: STEAM_VENTS_PARKING,
    durationMin: 20,
    summary:
      "雨水渗到被岩浆烤热的岩石上变成蒸汽，从地缝里冒出来：停车场边就是一排喷气孔，热得长不了大树。走约 150 米到火山口边的蒸汽崖（Wahinekapu），脚下的崖壁一直冒白汽，对面就是整个破火山口，喷发时也是热门观景点。",
    tips: [
      "进园后第一个顺路的观景点，车位只有三十几个，常常停满",
      "过马路就是硫磺岸（Haʻakulamanu）木栈道的西口，两处可以一起走",
    ],
    photoFile: "Steaming Bluff at Hawai‘i Volcanoes National Park (43021152900).jpg",
  },
  {
    id: "havo-sulphur-banks",
    park: "havo",
    nameZh: "硫磺岸（Haʻakulamanu）",
    nameEn: "Haʻakulamanu (Sulphur Banks)",
    kind: "hike",
    area: "summit",
    lat: 19.43216,
    lon: -155.26126,
    start: STEAM_VENTS_PARKING,
    durationMin: 40,
    trail: {
      via: [
        { lat: 19.43142, lon: -155.26536 },
        { lat: 19.43257, lon: -155.26344 },
        { lat: 19.43216, lon: -155.26126 },
      ],
    },
    hike: { distanceMi: 1, difficulty: "easy" },
    summary:
      "火山气体从地缝里冒出来，在岩石上结出黄色的硫磺晶体，酸气把熔岩蚀成红褐色的黏土，空气里一股臭鸡蛋味。木栈道穿过这片几乎不长树的地热区，能近看冒烟的喷气口。",
    tips: [
      "2026 年靠游客中心一侧的小桥损坏关闭，从 Steam Vents 停车场对面的西口进出（这一头也是无障碍步道），原路返回",
      "有心脏病、哮喘等呼吸道疾病的人、孕妇和婴幼儿不要走",
    ],
    photoFile: "Sulphur banks.jpg",
  },
  {
    id: "havo-kupinai-pali",
    park: "havo",
    nameZh: "Kūpinaʻi Pali（Waldron Ledge）",
    nameEn: "Kūpinaʻi Pali (Waldron Ledge)",
    kind: "hike",
    area: "summit",
    lat: 19.42275,
    lon: -155.25688,
    start: KVC_PARKING,
    durationMin: 50,
    trail: {
      via: [
        { lat: 19.42717, lon: -155.2577 },
        { lat: 19.42405, lon: -155.25679 },
        { lat: 19.42275, lon: -155.25688 },
      ],
    },
    hike: { distanceMi: 1, difficulty: "easy" },
    summary:
      "从 Volcano House 旁边沿火山口边缘步道往东南走，脚下是 1983 年 6.7 级地震震塌后改成步道的老环山公路，路面上还留着车道线。尽头的观景点视野最开阔，能看到整个破火山口；它离喷口最远、人也最少，喷发时适合安静地看全景。",
    tips: [
      "铺装路面能推婴儿车和轮椅，但有裂缝和陡坡；Volcano House 后面第一个小观景点下坡很陡，后面大的那个是无障碍的",
      "Volcano House 的餐厅和酒吧也正对火山口，喷发时可以坐着看",
    ],
    photoFile: "Eruption from Waldron Ledge JWei (50748634683).jpg",
  },
  {
    id: "havo-kilauea-iki",
    park: "havo",
    nameZh: "Kīlauea Iki 步道",
    nameEn: "Kīlauea Iki Trail",
    kind: "hike",
    area: "summit",
    lat: 19.41387,
    lon: -155.24979,
    start: { lat: 19.41658, lon: -155.24289, nameZh: "Kīlauea Iki 观景台停车场" },
    durationMin: 180,
    trail: {
      via: [
        { lat: 19.41745, lon: -155.24661 },
        { lat: 19.41738, lon: -155.25206 },
        { lat: 19.41642, lon: -155.25514 },
        { lat: 19.41449, lon: -155.25221 },
        { lat: 19.41387, lon: -155.24979 },
        { lat: 19.41186, lon: -155.24163 },
        { lat: 19.41355, lon: -155.23886 },
      ],
      loop: true,
    },
    hike: { distanceMi: 3.3, gainFt: 400, difficulty: "moderate", loop: true },
    bestTime: ["morning"],
    mustSee: true,
    summary:
      "先沿火山口边的雨林走一段，再顺着火山口壁下降约 120 米，横穿 1959 年喷发留下的熔岩湖：当年这里是翻滚的熔岩湖，熔岩喷泉高达约 580 米，如今湖面凝固成一片龟裂、还冒着热气的黑色平地，走到中间能看到当年的喷口和旁边的 Puʻupuaʻi 渣锥。环线约 5.3 公里。",
    tips: [
      "观景台停车场旺季上午 10 点前就可能满，可以停 Devastation 步道口或 Puʻupuaʻi，经 Byron Ledge 走过来（往返约 9.7 公里），顺路走 Nāhuku 熔岩管",
      "湖底没有遮挡，晒、风大，天气说变就变，带水、帽子和雨衣；熔岩表面有裂缝，跟着石堆标记走",
    ],
    photoFile: "HAVO 20190420 Hikers Floor Kilauea Iki Trail JWei (47616960932).jpg",
  },
  {
    id: "havo-nahuku",
    park: "havo",
    nameZh: "Nāhuku 熔岩管",
    nameEn: "Nāhuku (Thurston Lava Tube)",
    kind: "hike",
    area: "summit",
    lat: 19.41452,
    lon: -155.23727,
    start: { lat: 19.41372, lon: -155.23902, nameZh: "Nāhuku 熔岩管停车场（14 个车位）" },
    durationMin: 30,
    trail: {
      via: [
        { lat: 19.41412, lon: -155.23766 },
        { lat: 19.41493, lon: -155.23688 },
        { lat: 19.41433, lon: -155.23861 },
      ],
      loop: true,
    },
    hike: { distanceMi: 0.4, difficulty: "easy", loop: true },
    bestTime: ["morning"],
    mustSee: true,
    summary:
      "约 500 年前一条熔岩河在地下流过，外壳冷却后留下这条能走进去的熔岩隧道（以前叫瑟斯顿熔岩管）。先沿蕨类和 ʻōhiʻa 树的雨林小路下到洞口，过桥进洞，在灯光照着的隧道里走一段，再爬台阶回到雨林，一圈约 20–30 分钟。",
    tips: [
      "停车场只有 14 个车位，NPS 建议早上 9 点前或下午 5 点后来；满了就停约 800 米外的 Kīlauea Iki 观景台停车场走过来",
      "洞里 8:00–20:00 开灯，其他时间要带手电；地面湿滑、有积水，几处洞顶很低，别摸洞壁和垂下来的树根",
      "2026 年 8 月入口换了新桥，整条环线都开放",
    ],
    photoFile: "Thurston Lava Tube. Hawaii Volcanoes National Park (503990) (22017885880).jpg",
  },
  {
    id: "havo-devastation-trail",
    park: "havo",
    nameZh: "荒芜步道（Devastation Trail）",
    nameEn: "Devastation Trail",
    kind: "hike",
    area: "summit",
    lat: 19.41197,
    lon: -155.25058,
    start: DEVASTATION_PARKING,
    durationMin: 40,
    trail: {
      via: [
        { lat: 19.40959, lon: -155.25284 },
        { lat: 19.41149, lon: -155.25 },
        { lat: 19.41197, lon: -155.25058 },
      ],
    },
    hike: { distanceMi: 1, difficulty: "easy" },
    summary:
      "1959 年 Kīlauea Iki 喷发时，几百米高的熔岩喷泉把火山渣撒满了这片森林，枯树、黑色渣地和慢慢长回来的植物都还在。铺装小路从停车场走到 Puʻupuaʻi 观景台，俯瞰 Kīlauea Iki 火山口和那次喷发堆起来的渣锥。",
    tips: [
      "全程铺装，能推婴儿车和轮椅（有几段坡度超过 8%）；不要爬 Puʻupuaʻi 渣锥",
      "这一带常有夏威夷雁（nēnē），停车、开车都留神，不要喂",
    ],
    photoFile: "HAVO 20191127 Family Devastation Tr JWei (49159631663).jpg",
  },
  {
    id: "havo-keanakakoi",
    park: "havo",
    nameZh: "Keanakākoʻi 火山口",
    nameEn: "Keanakākoʻi (via Old Crater Rim Drive)",
    kind: "hike",
    area: "summit",
    lat: 19.40174,
    lon: -155.2656,
    start: DEVASTATION_PARKING,
    durationMin: 75,
    trail: {
      via: [
        { lat: 19.40545, lon: -155.25652 },
        { lat: 19.40381, lon: -155.26218 },
        { lat: 19.40174, lon: -155.2656 },
      ],
    },
    hike: { distanceMi: 2, difficulty: "easy" },
    summary:
      "沿 2018 年地震震裂、现在只许步行和骑车的老环山公路走约 1.6 公里，到 Keanakākoʻi 火山口和旁边的观景点。名字意思是“石斧洞”，夏威夷人曾在这里采坚硬的玄武岩做石斧；这里离 Halemaʻumaʻu 最近，喷发时能近看熔岩喷泉，晴天还能看到冒纳罗亚和冒纳凯阿。",
    tips: [
      "喷发期间车位极少，满了就去别的观景台；最后约 270 米是松散的火山渣路",
    ],
    photoFile: "HAVO 20211006 Keanakakoi side of Kilauea and visitors J Wei (51563438966).jpg",
  },
  {
    id: "havo-eruption-glow",
    park: "havo",
    nameZh: "夜看火山口红光和喷发",
    nameEn: "Kīlauea Eruption & Night Glow Viewing",
    kind: "experience",
    area: "summit",
    lat: 19.43107,
    lon: -155.27325,
    start: WELCOME_PARKING,
    durationMin: 60,
    bestTime: ["night"],
    mustSee: true,
    summary:
      "2024 年 12 月 23 日起，Halemaʻumaʻu 火山口里的南北两个喷口间歇喷发：到 2026 年 8 月已经喷了 54 次，每次熔岩喷泉持续几个小时（2026 年 3 月的一次高达约 540 米），之间停几天到几周；停的时候喷口夜里也常有红光。天黑后站在火山口边的观景台看最震撼，喷发区本身不开放。欢迎中心对面的步道往下走几分钟就是观景点。",
    tips: [
      "出发前看 USGS 夏威夷火山观测站的每日公告和山顶直播摄像头：最近几次喷发只持续 6–10 小时，可能你到时已经停了",
      "NPS 推荐欢迎中心对面、Kīlauea 观景台和 Uēkahuna（Crater Rim Drive 西段，车位多）；喷发时傍晚 5 点到晚上 9 点车最多，天亮前来人少",
      "南风时火山渣、火山玻璃丝和火山气体（vog）会飘到观景台，戴眼镜、帽子和口罩，穿长袖；空气差或者落渣时公园会临时封路甚至闭园（2026 年 4 月 9 日就闭了一天）",
      "带头灯、保暖外套和雨衣，山顶夜里常只有 10°C 上下",
    ],
    photoFile: "Episode 20 (2025-05-06) of Kilauea's December 2024 eruption.jpg",
  },
  {
    id: "havo-chain-of-craters-road",
    park: "havo",
    nameZh: "火山口链公路",
    nameEn: "Chain of Craters Road",
    kind: "drive",
    area: "chain-of-craters",
    lat: 19.31728,
    lon: -155.162,
    durationMin: 60,
    mustSee: true,
    summary:
      "从 Kīlauea 山顶一路下到海边、全长约 30 公里、落差约 1,100 米的景观公路：上段经过一串塌陷火山口（Pauahi 等），中段穿过 1969–1974 年 Mauna Ulu 喷发流出的大片熔岩原，在 Kealakomo 观景台能看到熔岩一直铺到海边，最后沿 Hōlei 断崖的之字弯下到海岸，路走到被熔岩盖住的地方为止。",
    tips: [
      "沿途没有加油站、水和吃的（终点有厕所），出发前在 Volcano 村加满油",
      "不停车单程约 30 分钟，加上沿途停车、Puʻu Loa 岩画和终点散步，留半天；路尽头不通，原路返回",
    ],
    photoFile: "Chain of Craters Rd, Hawaii Volcanoes National Park (504044) (21805928233).jpg",
  },
  {
    id: "havo-mauna-ulu",
    park: "havo",
    nameZh: "Mauna Ulu 熔岩盾和 Puʻuhuluhulu",
    nameEn: "Maunaulu & Puʻuhuluhulu",
    kind: "hike",
    area: "chain-of-craters",
    lat: 19.3712,
    lon: -155.20516,
    start: { lat: 19.3653, lon: -155.21637, nameZh: "Maunaulu 停车场" },
    durationMin: 120,
    trail: {
      via: [
        { lat: 19.36618, lon: -155.21421 },
        { lat: 19.37251, lon: -155.20969 },
        { lat: 19.37055, lon: -155.20637 },
        { lat: 19.3712, lon: -155.20516 },
      ],
    },
    hike: { distanceMi: 2.5, gainFt: 210, difficulty: "moderate" },
    summary:
      "走过 1969–1974 年 Mauna Ulu 喷发流出的熔岩原，路边有熔岩树模、裂缝和光滑的绳状熔岩，最后约 400 米陡坡爬上长满树的 Puʻuhuluhulu 渣锥。顶上的观景台正对 Mauna Ulu 熔岩盾，晴天能同时看到冒纳罗亚、冒纳凯阿和大海。",
    tips: [
      "熔岩上的路靠石堆（ahu）标记，别动它们，也别自己堆",
      "熔岩原没遮挡，带水、防晒和雨衣；停车场有厕所",
    ],
    photoFile: "Mauna Ulu.jpg",
  },
  {
    id: "havo-puu-loa",
    park: "havo",
    nameZh: "Puʻu Loa 岩画",
    nameEn: "Puʻuloa Petroglyphs",
    kind: "hike",
    area: "chain-of-craters",
    lat: 19.2926,
    lon: -155.12228,
    start: { lat: 19.28891, lon: -155.12995, nameZh: "Puʻu Loa 岩画步道口停车场" },
    durationMin: 75,
    trail: {
      via: [
        { lat: 19.29053, lon: -155.12719 },
        { lat: 19.2926, lon: -155.12228 },
      ],
    },
    hike: { distanceMi: 1.4, difficulty: "moderate" },
    summary:
      "夏威夷最大的岩画群，有 2 万多个刻在熔岩上的图案：人形、帆、圆圈，还有成片的小坑，夏威夷人把新生儿的脐带放进小坑里祈求长寿。步道穿过约 550 年前的熔岩原，在一圈木栈道上看。",
    tips: [
      "岩画很脆弱，只能在木栈道上看，不要走到熔岩上，也不要拓印",
      "熔岩路面起伏不平、太阳很晒，穿抓地的鞋、带水",
    ],
    photoFile: "Puʻu Loa Petroglyphs(7).jpg",
  },
  {
    id: "havo-holei-sea-cliffs",
    park: "havo",
    nameZh: "火山口链公路终点（Hōlei 海崖）",
    nameEn: "End of Chain of Craters Road (Hōlei Sea Cliffs)",
    kind: "viewpoint",
    area: "chain-of-craters",
    lat: 19.29581,
    lon: -155.09567,
    start: { lat: 19.29504, lon: -155.0986, nameZh: "火山口链公路终点停车场" },
    durationMin: 45,
    summary:
      "公路在海边被 Puʻu ʻŌʻō 喷发（1983–2018 年）流下来的熔岩盖住，终点有停车场和厕所。过路障沿老路往前走约 300 米是海崖观景区：黑色玄武岩崖直插大海，浪打上来水花很高。这里原来最有名的 Hōlei 海蚀拱（约 27 米高）2026 年 9 月底塌进了海里。",
    tips: [
      "海蚀拱在 2026 年 9 月 23 日到 27 日之间倒塌；崖边随时可能再塌，只在指定区域看，不要越过绳子",
      "从山顶开下来约 45 分钟，路上没有补给；海边风大、太阳毒，带水",
    ],
    photoFile:
      "2021-10-09 15 14 27 Waves from the Pacific Ocean crashing onto cliffs within Hawaii Volcanoes National Park in Hawaii County, Hawaii.jpg",
  },
  {
    id: "havo-mauna-loa-road",
    park: "havo",
    nameZh: "冒纳罗亚路和观景台",
    nameEn: "Mauna Loa Road & Lookout (Kīpukapuaulu, Tree Molds)",
    kind: "drive",
    area: "mauna-loa",
    lat: 19.49264,
    lon: -155.3854,
    durationMin: 90,
    summary:
      "从 11 号公路岔进去的单车道山路：先经过熔岩树模（Tree Molds）和被熔岩包围的古老森林 Kīpukapuaulu（当地人叫“鸟园”，能看到 ʻapapane 等夏威夷特有的鸟），再穿过 koa、ʻōhiʻa 林爬到海拔约 2,030 米的冒纳罗亚观景台，1937 年修的八角形石亭里能俯瞰 Kīlauea 和远处的大海。",
    tips: [
      "路窄弯多、只有一条车道，会车要靠边让；大巴、房车只能开到 Kīpukapuaulu 的掉头处",
    ],
    photoFile: "Taking in the view from Mauna Loa Lookout (27702549919).jpg",
  },
  {
    id: "havo-kahuku",
    park: "havo",
    nameZh: "Kahuku 园区（Puʻu o Lokuana 渣锥）",
    nameEn: "Kahuku Unit (Puʻu o Lokuana)",
    kind: "hike",
    area: "kahuku",
    lat: 19.06514,
    lon: -155.67853,
    start: { lat: 19.06379, lon: -155.67841, nameZh: "Kahuku 游客接待站停车场" },
    durationMin: 90,
    trail: {
      via: [
        { lat: 19.06849, lon: -155.6801 },
        { lat: 19.06717, lon: -155.68258 },
        { lat: 19.06548, lon: -155.68347 },
        { lat: 19.06514, lon: -155.67853 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2, gainFt: 130, difficulty: "moderate", loop: true },
    hours: [{ open: "08:00", close: "16:00" }],
    summary:
      "公园西南角、以前是夏威夷最大牧场之一的 Kahuku，草坡上散落着渣锥和 1868 年冒纳罗亚喷发的熔岩流，人很少。最受欢迎的 Puʻu o Lokuana 环线约 3.2 公里：沿老牧场路穿过 1868 年的熔岩、走过一条废弃跑道，再爬上被挖开的红色渣锥，顶上能看到 Kaʻū 海岸；赶时间可以只走 0.6 公里的上下小环线。",
    tips: [
      "只在周四到周日 8:00–16:00 开放（周一到周三关），没有饮用水；在 11 号公路 70.5 英里路标附近，从山顶开过来约 1 小时",
      "2026 年 8 月飓风 Lala 后 Lower Palm 步道口以上的土路坑洼很深，建议四驱，除菌站以上的 Kahuku 路封闭；走 Glover、Kona 步道前要在除菌站给鞋底喷酒精，防止 ʻōhiʻa 快速死亡病扩散",
      "周六常有护林员带队徒步和讲座，看公园日历",
    ],
    photoFile: "The area around Puʻu o Lokuana in the Kahuku Unit (bf204e83-fce1-4ca6-85a6-61f34f258ee8).JPG",
  },
  {
    id: "havo-punaluu",
    park: "havo",
    nameZh: "Punaluʻu 黑沙滩",
    nameEn: "Punaluʻu Black Sand Beach",
    kind: "landmark",
    area: "nearby",
    lat: 19.13536,
    lon: -155.50443,
    durationMin: 45,
    outsidePark: true,
    summary:
      "11 号公路边、公园和 Kahuku 之间的黑沙滩，沙子是熔岩遇到海水炸碎的黑色玄武岩颗粒，椰林后面是淡水池塘，常有绿海龟爬上岸晒太阳。从公园开往科纳正好顺路，停 15–45 分钟就够。",
    tips: [
      "2026 年 8 月 29 日起县政府对海滩公园的租约到期、不再管理，厕所锁了、救生员撤了，停车和进出以后怎么安排还没公布；去之前看最新消息，海滩本身按州法律仍对公众开放",
      "海龟受法律保护，至少离 3 米远，不要摸、不要喂；黑沙也不能带走。浪大、暗流强，一般不适合游泳",
    ],
    photoFile: "Green sea turtles on Punaluu Black Sand Beach.JPG",
  },
  {
    id: "havo-rainbow-falls",
    park: "havo",
    nameZh: "彩虹瀑布（希洛）",
    nameEn: "Rainbow Falls (Waiānuenue), Hilo",
    kind: "waterfall",
    area: "nearby",
    lat: 19.71948,
    lon: -155.10959,
    start: { lat: 19.7193, lon: -155.10839, nameZh: "Rainbow Falls 观景台停车场" },
    durationMin: 20,
    bestTime: ["morning"],
    outsidePark: true,
    summary:
      "希洛城边 Wailuku 河上约 24 米高的瀑布，落进一个大水潭；晴天上午阳光从背后照过来，水雾里常挂着彩虹，夏威夷语名字 Waiānuenue 就是“彩虹之水”。停车场走几步就是观景台，离希洛机场约 15 分钟。",
    tips: [
      "州立公园的一部分，免费、白天开放；上午来最容易看到彩虹",
      "雨后水量最大；不要翻过栏杆下到水潭边",
    ],
    photoFile: "Rainbow Falls Hilo Big Island of Hawaii.jpg",
  },
];
