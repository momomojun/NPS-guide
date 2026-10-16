// 明星同款：明星在网站收录的公园、名胜公开发过的照片，标出在哪拍的、怎么拍同款，链接到原帖。
// 2026-10-15 整理：每条都要有原帖（或本人主页）和可靠的新闻报道确认是这个人、在这个地方；粉丝猜测、地点说不清的不收。
// 不登录 Instagram / X 看帖子，原帖链接没拿到的只给主页和报道。照片不转载，拍法、姿势是我们自己的描述；
// 明星的拍法有危险的（站在没护栏的崖边、坐在行驶中的船头），tipsZh 里写安全的拍法。
// 查过没收的（越过栏杆拍照被批评后删帖的、只发了限时动态的、地点只是“看起来像”的）写在开发文档里。

export type CelebrityPlatform = "instagram" | "x" | "weibo" | "youtube";

export interface CelebrityShot {
  id: string;
  nameZh: string;
  nameEn: string;
  /** 组合（BLACKPINK、BTS……） */
  group?: string;
  /** 国家、地区 */
  countryZh: string;
  /** 公园代码 */
  park: string;
  /** 能对上网站景点的写景点 id，景点卡片上也显示 */
  attraction?: string;
  /** 在哪拍的 */
  placeZh: string;
  /** 发帖日期：YYYY-MM-DD，只知道月份的写 YYYY-MM */
  date: string;
  platform: CelebrityPlatform;
  /** 原帖 */
  postUrl?: string;
  /** 原帖链接没拿到时，给本人主页 */
  profileUrl?: string;
  /** 确认人和地点的报道 */
  sources: string[];
  /** 照片里是怎么拍的：构图、姿势、光线（我们自己的描述） */
  shotZh: string;
  /** 怎么拍同款：站在哪、几点去、要不要预约 */
  howToZh: string;
  tipsZh: string[];
  /** high：原帖打了地点或几家报道都写明；medium：只有一家报道写明，或者地点是按照片推断的 */
  confidence: "high" | "medium";
  /** 拿不准的地方 */
  noteZh?: string;
}

export const celebrityShots: CelebrityShot[] = [
  {
    id: "lisa-lake-powell-2026",
    nameZh: "Lisa",
    nameEn: "LISA",
    group: "BLACKPINK",
    countryZh: "泰国",
    park: "hsbd",
    placeZh: "鲍威尔湖湖面，坐快艇在红岩峡湾之间穿行",
    date: "2026-08-10",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/Db4soz5keAy/",
    sources: [
      "https://www.starnewskorea.com/en/music/2026/08/11/2026081120231330118",
      "https://sports.khan.co.kr/en/article/202608111426007",
    ],
    shotZh:
      "多图帖，配文“Red rock therapy”。主图是她侧坐在快艇船头的软垫上回头笑，镜头从船舱往船头拍，背景是蓝色湖水和两侧发白、发橙的砂岩崖壁；另外几张是船开在峡湾里拍的红岩风景。",
    howToZh:
      "在佩吉的 Wahweap 或 Antelope Point 码头租快艇、包船，开进两边是高崖的窄峡湾（羚羊峡谷水道、Navajo Canyon）最像。上午 9–11 点或傍晚，太阳斜照崖壁时橙色最浓；拍的人坐在船舱里往船头拍，把两侧崖壁收进来。",
    tipsZh: [
      "船开着的时候别坐船头：等船停稳、熄火漂着再摆拍，穿好救生衣。",
      "午后常起风浪，窄峡湾里船多，租船要会开、看好天气。",
    ],
    confidence: "medium",
    noteZh: "帖子没打地点，图片描述和韩国 Star News 的报道写的是鲍威尔湖，具体是哪条峡湾不清楚。",
  },
  {
    id: "jhope-lower-antelope-2026",
    nameZh: "J-Hope（郑号锡）",
    nameEn: "j-hope",
    group: "BTS",
    countryZh: "韩国",
    park: "ante",
    attraction: "ante-lower-antelope-canyon",
    placeZh: "下羚羊峡谷谷底",
    date: "2026-05",
    platform: "instagram",
    profileUrl: "https://www.instagram.com/uarmyhope/",
    sources: ["https://x.com/inquirerdotnet/status/2060877805823435227", "https://fanplus.co.kr/community/bts/131058140"],
    shotZh:
      "BTS 巡演拉斯维加斯站期间顺路去的。竖构图，镜头放低从谷底往上拍：他站在一段稍宽的谷底中间，一只手高举、一条腿抬起像在跳舞，两侧是弯曲的橙红色岩壁，头顶有一束亮光从缝里透下来。",
    howToZh:
      "跟纳瓦霍授权的导览团进（Ken's Tours 或 Dixie Ellis），旺季提前几周订。上午 10 点到下午 1 点光线最好；找谷底稍宽、头顶有亮缝的地方，拍的人蹲低用广角竖拍，被拍的人站在画面下三分之一处做大动作。",
    tipsZh: [
      "峡谷里有几段陡铁梯，不能带包，三脚架一般不让用；导游会催着往前走，提前想好动作。",
      "不要攀爬、蹬踩岩壁，也不要用手摸纹路。",
    ],
    confidence: "medium",
    noteZh: "原帖链接没拿到（不登录只能看到主页最近几条），地点按菲律宾《Inquirer》的转发和韩国粉丝社区的整理。",
  },
  {
    id: "park-shinhye-grand-canyon-2020",
    nameZh: "朴信惠",
    nameEn: "Park Shin-hye",
    countryZh: "韩国",
    park: "grca",
    placeZh: "大峡谷南缘带矮石墙的 Rim Trail 步道",
    date: "2020-01-14",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/B7VMLgunLM9/",
    sources: ["https://theindependent.sg/park-shin-hye-dances-in-grand-canyon-to-zicos-any-song/"],
    shotZh:
      "冬天拍的“Any Song”跳舞短视频：手机横拍、固定机位，她戴渔夫帽、穿长外套在崖边铺装步道上跳舞，左边是一排矮石墙，右后方是层层的峡谷和蓝天，阳光从侧面照过来。",
    howToZh:
      "Mather Point 到 Yavapai Point、Village 一带的 Rim Trail 都是这种带矮石墙的铺装步道。把手机架在步道边，横拍让步道斜着伸向画面深处、峡谷占右半边；上午 9–10 点光线柔、人也少。",
    tipsZh: ["她是在石墙里侧的步道上跳的；不要站到石墙上或翻到墙外去。", "冬天背阴处会结冰，跳之前先看脚下，带防滑鞋套。"],
    confidence: "high",
  },
  {
    id: "hwang-chiyeol-grand-canyon-2018",
    nameZh: "黄致列",
    nameEn: "Hwang Chi-yeul",
    countryZh: "韩国",
    park: "grca",
    placeZh: "大峡谷（看植被像南缘）一块伸出崖边的岩石",
    date: "2018-06-14",
    platform: "instagram",
    profileUrl: "https://www.instagram.com/chiyeul7102/",
    sources: ["https://www.topstarnews.net/news/articleView.html?idxno=428635"],
    shotZh:
      "配文“你好大峡谷”。逆光剪影：他侧身站在一块伸出崖边的岩石顶上眺望峡谷，拍的人在后方低处，人和岩石在画面左边成剪影，右边大片是峡谷，太阳在左上角。",
    howToZh:
      "Mather Point、Yavapai Point、Hopi Point 的观景台都能找到“前景是岩石、后面是峡谷”的角度。上午 9 点前或下午 5 点后太阳低，剪影最好看；拍的人退远用长焦，护栏里侧的人也能拍出站在边上的感觉。",
    tipsZh: [
      "他站的岩石外面没有护栏，不要照搬：大峡谷几乎每年都有人在崖边拍照坠落。人离崖边至少 2 米、站在护栏里侧，靠角度和长焦营造效果。",
      "刮大风、雨雪后岩石湿滑时，不要靠近任何没有护栏的边缘。",
    ],
    confidence: "high",
    noteZh: "原帖链接没拿到，内容以 TopStarNews 的报道为准。",
  },
  {
    id: "yuna-kim-lake-louise-2023",
    nameZh: "金妍儿",
    nameEn: "Kim Yu-na",
    countryZh: "韩国",
    park: "banf",
    attraction: "banf-lake-louise",
    placeZh: "路易斯湖结冰的湖面和湖边长椅",
    date: "2023-05-17",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/CsV09Pgpe2l/",
    sources: ["https://www.newsen.com/news_view.php?uid=202305181729072510"],
    shotZh:
      "配文说在路易斯湖滑冰。首图是她穿着冰鞋坐在湖边积雪里的木长椅上，戴白色毛线帽、双手托腮对镜头笑，背景是雪地、云杉林和半山云雾；后面几张是在冰面上滑冰。",
    howToZh:
      "冬天（约 12 月到 3 月，看冰况）费尔蒙城堡酒店前的湖面会清出一块免费滑冰场，冰鞋在酒店里租。坐在湖边长椅上，拍的人站低一点往上拍，把身后的云杉和山收进来；阴天的雪景反而柔和。",
    tipsZh: [
      "只在酒店清理、维护的那块冰面上滑，别的地方（尤其入水口附近、融雪季）冰可能很薄。",
      "冬天停车场也很满，早上 9 点前到或坐 Roam 公交。",
    ],
    confidence: "high",
    noteZh: "帖子 5 月才发，但路易斯湖 5 月底到 6 月初才化冰，滑冰的照片是更早拍的；想拍同款要冬天去。",
  },
  {
    id: "lee-seyoung-grand-canyon-2019",
    nameZh: "李世荣",
    nameEn: "Lee Se-young",
    countryZh: "韩国",
    park: "grca",
    placeZh: "大峡谷南缘带弧形铁护栏的观景台（像 Mather Point 一带）",
    date: "2019-09-26",
    platform: "instagram",
    sources: ["https://www.xportsnews.com/article/1174402/"],
    shotZh:
      "一段短视频：她背靠观景台的铁护栏、两手搭在栏杆上对镜头笑，身后是层层的峡谷和蓝天白云。镜头平视、人在画面中间偏右。",
    howToZh:
      "Mather Point、Yavapai Point 的观景台都有这种弧形护栏。人靠在护栏里侧，拍的人站在一两米外、和眼睛差不多高，让护栏斜穿画面；上午 10 点前光从东边来，脸不会太暗。",
    tipsZh: [
      "靠在护栏上可以，不要坐上去或翻到外侧拍。",
      "Mather Point 是南缘人最多的观景台，想要干净的背景可以换到 Yavapai Point 或 Pipe Creek Vista。",
    ],
    confidence: "medium",
    noteZh: "原帖链接没拿到，报道只有截图；具体是哪个观景台是按护栏的样子推断的。",
  },
  {
    id: "sugai-yuka-grand-canyon-2023",
    nameZh: "菅井友香",
    nameEn: "Yuka Sugai",
    group: "前樱坂46",
    countryZh: "日本",
    park: "grca",
    placeZh: "大峡谷崖边的岩石平台（帖子打了大峡谷国家公园的地点）",
    date: "2023-05-08",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/Cr-mmlAvZv3/",
    sources: ["https://www.rbbtoday.com/article/2023/05/09/208844.html"],
    shotZh:
      "黄金周第一次去大峡谷。首图横拍：她站在一块伸向峡谷的平顶大岩石上挥手，拍的人在后方稍远处，人在画面中间、拍得很小，大片层层的峡谷和远处的地平线做背景。",
    howToZh:
      "南缘各观景点都有伸出去的岩石平台，大多有护栏。拍的人退后 5–10 米横拍、把人放小，让峡谷占满画面；早上或傍晚太阳低的时候岩层最清楚。",
    tipsZh: ["她站的岩石外侧没有护栏：只站在有护栏或离边缘很远的平台上，靠拍摄距离把峡谷拍大，不要为了效果走到边上。"],
    confidence: "high",
  },
  {
    id: "lee-kiwoo-monument-valley-2019",
    nameZh: "李起宇",
    nameEn: "Lee Ki-woo",
    countryZh: "韩国",
    park: "mova",
    placeZh: "纪念碑谷 The View 下方的谷底红土地，背后是东西两座手套岩",
    date: "2019-09-27",
    platform: "instagram",
    sources: ["https://v.daum.net/v/NldCGHYApK"],
    shotZh:
      "配文自嘲“不是合成的”。他一身卡其绿、戴渔夫帽和墨镜，站在画面右下角的红土和灌木之间，左边和中间是两座手套岩和更远的方山，上半部是大片深蓝天空，红、绿、蓝三色分明。",
    howToZh:
      "从 The View 游客中心往下开 Valley Drive，或者走 Wildcat Trail（唯一能自己走的步道），都能找到以两座手套岩为背景的位置。人站在画面一角、拍全身，留大片天空；上午光照在手套岩正面，颜色最饱和。穿和红土对比强的绿色、卡其色。",
    tipsZh: [
      "只能在 Valley Drive 路边和 Wildcat Trail 上活动，谷里别的地方要跟纳瓦霍导游才能进。",
      "Valley Drive 是坑洼的砂土路，底盘低的租车慢慢开或者报团；夏天中午很热。",
    ],
    confidence: "medium",
    noteZh: "原帖链接没拿到；拍摄点是按照片里手套岩的角度推断的。",
  },
  {
    id: "kourtney-kardashian-lake-powell-2020",
    nameZh: "考特妮·卡戴珊",
    nameEn: "Kourtney Kardashian",
    countryZh: "美国",
    park: "hsbd",
    placeZh: "鲍威尔湖湖岸的红色砂岩前",
    date: "2020-05-25",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/CAnpCr_FsDN/",
    sources: ["https://hollywoodlife.com/2020/05/25/kourtney-kardashian-escapes-la-bikini-desert-photo/"],
    shotZh: "配文“Escape to the desert”。近景：她戴方框墨镜站在一面红色砂岩前摆姿势，岩石的纹理和颜色占满背景。",
    howToZh:
      "从 Wahweap 或 Antelope Point 码头租船，靠到湖湾里有平缓砂岩岸的地方上岸拍；也可以开车到犹他一侧的 Lone Rock Beach，找湖边的红岩当背景。下午光线偏暖，砂岩更红。",
    tipsZh: [
      "夏天中午湖边砂岩烫脚，带水鞋；船靠岸前看清水下有没有礁石。",
      "Lone Rock Beach 在格伦峡谷国家休闲区里，要买休闲区门票（国家公园年卡可用），旺季周末人车很多。",
    ],
    confidence: "high",
  },
  {
    id: "demi-moore-grand-canyon-river-2023",
    nameZh: "黛米·摩尔",
    nameEn: "Demi Moore",
    countryZh: "美国",
    park: "grca",
    placeZh: "科罗拉多河漂流途中的一处支流瀑布",
    date: "2023-10-30",
    platform: "instagram",
    postUrl: "https://www.instagram.com/p/CzCW0oUOTTN/",
    sources: ["https://hollywoodlife.com/2023/10/31/demi-moore-rocks-black-bikini-on-grand-canyon-trip-see-photos/"],
    shotZh:
      "回顾 9 月和朋友们 8 天漂流大峡谷的多图帖：首图是她站在瀑布的水帘里仰头，后面有一群人在瀑布下的合照、穿救生衣在橡皮艇上跳舞，和峡谷风景。",
    howToZh:
      "要跟商业漂流公司走科罗拉多河（3 天到 2 周），热门日期常提前一年以上订；自己组队要参加 NPS 的河道许可抽签。Deer Creek、Elves Chasm 这些支流瀑布是常见的停靠点，导游安排上岸时在水帘里拍。",
    tipsZh: [
      "瀑布下的岩石很滑，听导游安排，不要自己爬到瀑布上面；在船上和水边一直穿救生衣。",
      "2026 年 8 月山洪后谷底的部分设施受影响，报名前看 NPS 的最新公告。",
    ],
    confidence: "high",
    noteZh: "帖子没写是哪一处瀑布。",
  },
  {
    id: "kelly-cheung-grand-canyon-2021",
    nameZh: "张曦雯",
    nameEn: "Kelly Cheung",
    countryZh: "中国香港",
    park: "grca",
    placeZh: "大峡谷南缘崖边高处（从凤凰城过去）",
    date: "2021-10-24",
    platform: "instagram",
    profileUrl: "https://www.instagram.com/kelllycheung/",
    sources: ["https://www.hk01.com/%E5%8D%B3%E6%99%82%E5%A8%9B%E6%A8%82/692457/"],
    shotZh: "说终于亲眼看到大峡谷、照片拍不出它有多美。她穿棉外套配短裤，站在高处背对峡谷，把远处层层的岩壁当背景。",
    howToZh:
      "从凤凰城开车约 3.5 小时到南缘。在 Mather Point 或 Yavapai Point 的护栏边，人背对峡谷，拍的人退后几步把人和峡谷一起收进来。10 月底南缘早晚只有几度，带外套。",
    tipsZh: ["南缘海拔约 2100 米，10 月下旬起可能下雪，早上路面结冰。"],
    confidence: "medium",
    noteZh: "原帖链接没拿到，报道只说在大峡谷国家公园，具体观景点不清楚。",
  },
];
