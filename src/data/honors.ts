// 世界遗产、暗夜公园认证和媒体推荐：榜单页和公园页的“档案”用。
// key 都是 NPS 单位代码（红杉 sequ、国王峡谷 kica 分开），加拿大的用网站的公园代码（banf、jasp、yoho）。
// 媒体推荐只记谁选了、条目叫什么、原文链接，为什么选是我们自己的话，不照搬原文；名次不记。

/** 联合国教科文组织世界遗产 */
export interface WorldHeritage {
  /** 世界遗产的正式名字（英文） */
  nameEn: string;
  nameZh: string;
  /** 列入的年份；公园是后来扩展进去的，写扩展的那年 */
  year: number;
  url: string;
}

/** 暗夜认证：DarkSky International（原国际暗天协会）的国际暗夜公园，或者加拿大皇家天文学会（RASC）的暗夜保护区 */
export interface DarkSky {
  program: "darksky" | "rasc";
  year: number;
  url: string;
}

export type Outlet = "lonely-planet" | "natgeo" | "time";

export interface MediaPick {
  outlet: Outlet;
  /** 榜单是哪一年的（Best in Travel 2026） */
  edition: number;
  /** 目的地、体验、读者票选、住宿 */
  kind: "destination" | "experience" | "readers" | "stay";
  /** 榜单上的条目名（原文） */
  title: string;
  /** 对应的公园（NPS 单位代码 / 加拿大的公园代码）；条目是一个州、一个地区时，原文明确提到的公园才算 */
  parks: string[];
  url: string;
  /** 为什么选（我们自己的话） */
  reasonZh: string;
}

const whc = (id: number) => `https://whc.unesco.org/en/list/${id}/`;

/**
 * 美国 63 座国家公园里的 14 座和加拿大落基山 3 座（世界遗产中心的网站 2026 年 9–10 月打不开，按 Wayback 存档核对）。
 * 兰格尔–圣伊莱亚斯 1979 年和加拿大的克卢恩一起列入，冰川湾 1992 年扩展进去；冰川和加拿大的沃特顿湖一起列入。
 * 石化林、白沙在美国的预备名单上，还没列入
 */
export const worldHeritage: Record<string, WorldHeritage> = {
  meve: { nameEn: "Mesa Verde National Park", nameZh: "梅萨维德国家公园", year: 1978, url: whc(27) },
  yell: { nameEn: "Yellowstone National Park", nameZh: "黄石国家公园", year: 1978, url: whc(28) },
  grca: { nameEn: "Grand Canyon National Park", nameZh: "大峡谷国家公园", year: 1979, url: whc(75) },
  ever: { nameEn: "Everglades National Park", nameZh: "大沼泽地国家公园", year: 1979, url: whc(76) },
  wrst: {
    nameEn: "Kluane / Wrangell-St. Elias / Glacier Bay / Tatshenshini-Alsek",
    nameZh: "克卢恩 / 兰格尔–圣伊莱亚斯 / 冰川湾 / 塔琴希尼–阿尔塞克",
    year: 1979,
    url: whc(72),
  },
  glba: {
    nameEn: "Kluane / Wrangell-St. Elias / Glacier Bay / Tatshenshini-Alsek",
    nameZh: "克卢恩 / 兰格尔–圣伊莱亚斯 / 冰川湾 / 塔琴希尼–阿尔塞克",
    year: 1992,
    url: whc(72),
  },
  redw: { nameEn: "Redwood National and State Parks", nameZh: "红木国家和州立公园", year: 1980, url: whc(134) },
  maca: { nameEn: "Mammoth Cave National Park", nameZh: "猛犸洞国家公园", year: 1981, url: whc(150) },
  olym: { nameEn: "Olympic National Park", nameZh: "奥林匹克国家公园", year: 1981, url: whc(151) },
  grsm: { nameEn: "Great Smoky Mountains National Park", nameZh: "大烟山国家公园", year: 1983, url: whc(259) },
  yose: { nameEn: "Yosemite National Park", nameZh: "优胜美地国家公园", year: 1984, url: whc(308) },
  banf: { nameEn: "Canadian Rocky Mountain Parks", nameZh: "加拿大落基山公园群", year: 1984, url: whc(304) },
  jasp: { nameEn: "Canadian Rocky Mountain Parks", nameZh: "加拿大落基山公园群", year: 1984, url: whc(304) },
  yoho: { nameEn: "Canadian Rocky Mountain Parks", nameZh: "加拿大落基山公园群", year: 1984, url: whc(304) },
  havo: { nameEn: "Hawaii Volcanoes National Park", nameZh: "夏威夷火山国家公园", year: 1987, url: whc(409) },
  glac: { nameEn: "Waterton Glacier International Peace Park", nameZh: "沃特顿–冰川国际和平公园", year: 1995, url: whc(354) },
  cave: { nameEn: "Carlsbad Caverns National Park", nameZh: "卡尔斯巴德洞窟国家公园", year: 1995, url: whc(721) },
};

const darkSkyPlace = (slug: string) => `https://darksky.org/places/${slug}/`;

/**
 * DarkSky International 的国际暗夜公园（按它们的地点页和 NPS 的名单核对）：大峡谷 2016 年先拿到临时认证、2019 年正式认证，
 * 按 2019 年；恶地的地点页写 2025 年认证，DarkSky 和 NPS 2026 年 7 月才公布；冰川和加拿大的沃特顿湖一起认证。
 * 贾斯珀是加拿大皇家天文学会（RASC）的暗夜保护区；班夫、幽鹤都没有
 */
export const darkSky: Record<string, DarkSky> = {
  bibe: { program: "darksky", year: 2012, url: darkSkyPlace("big-bend-national-park-dark-sky-park") },
  deva: { program: "darksky", year: 2013, url: darkSkyPlace("death-valley-national-park-dark-sky-park") },
  blca: { program: "darksky", year: 2015, url: darkSkyPlace("black-canyon-of-the-gunnison-national-park-dark-sky-park") },
  cany: { program: "darksky", year: 2015, url: darkSkyPlace("canyonlands-national-park-dark-sky-park") },
  care: { program: "darksky", year: 2015, url: darkSkyPlace("capitol-reef-national-park-dark-sky-park") },
  grba: { program: "darksky", year: 2016, url: darkSkyPlace("great-basin-national-park-dark-sky-park") },
  jotr: { program: "darksky", year: 2017, url: darkSkyPlace("joshua-tree-national-park-dark-sky-park") },
  glac: { program: "darksky", year: 2017, url: darkSkyPlace("waterton-glacier-international-peace-park-dark-sky-park") },
  pefo: { program: "darksky", year: 2018, url: darkSkyPlace("petrified-forest-national-park-dark-sky-park") },
  arch: { program: "darksky", year: 2019, url: darkSkyPlace("arches-national-park-dark-sky-park") },
  brca: { program: "darksky", year: 2019, url: darkSkyPlace("bryce-canyon-national-park-dark-sky-park") },
  grca: { program: "darksky", year: 2019, url: darkSkyPlace("grand-canyon-national-park-dark-sky-park") },
  grsa: { program: "darksky", year: 2019, url: darkSkyPlace("great-sand-dunes-national-park-dark-sky-park") },
  voya: { program: "darksky", year: 2020, url: darkSkyPlace("voyageurs-national-park-dark-sky-park") },
  maca: { program: "darksky", year: 2021, url: darkSkyPlace("mammoth-cave-national-park-dark-sky-park") },
  meve: { program: "darksky", year: 2021, url: darkSkyPlace("mesa-verde-national-park-dark-sky-park") },
  zion: { program: "darksky", year: 2021, url: darkSkyPlace("zion-national-park-dark-sky-park") },
  badl: { program: "darksky", year: 2025, url: darkSkyPlace("badlands-national-park") },
  jasp: { program: "rasc", year: 2011, url: "https://rasc.ca/lpa/jasper-national-park" },
};

/** Lonely Planet 的 Best in Travel 没有单独的条目页：2026 年的按存档，2027 年（2026 年 9 月 22 日公布）的按现在的页面 */
const LP_2026 = "https://web.archive.org/web/20251123074935/https://www.lonelyplanet.com/best-in-travel";
const LP_2027 = "https://www.lonelyplanet.com/best-in-travel";

/**
 * 2024 年以来 Lonely Planet Best in Travel、国家地理 Best of the World、TIME World's Greatest Places 选中的：
 * 只收条目就是这座公园、围绕它，或者是公园里的体验、住宿的；整个州、地区的条目里顺带提一句、只出现在图片说明里的不收
 * （比如 Lonely Planet 2026 的缅因、2027 的新墨西哥和阿拉斯加，国家地理 2026 的毛伊岛）。
 * Lonely Planet 2025 的“被低估的公园”（峡谷地第一、航海家第二）只在书里，网上只有媒体转述，没收
 */
export const mediaPicks: MediaPick[] = [
  {
    outlet: "lonely-planet",
    edition: 2027,
    kind: "destination",
    title: "Redwoods Parks, California",
    parks: ["redw"],
    url: LP_2027,
    reasonZh: "世界上最高的树都在红木国家和州立公园里，还有长满苔藓的老林、海边悬崖和常起雾的海滩。",
  },
  {
    outlet: "lonely-planet",
    edition: 2026,
    kind: "destination",
    title: "Theodore Roosevelt National Park",
    parks: ["thro"],
    url: LP_2026,
    reasonZh:
      "野牛出没的草原和很暗的夜空，连着罗斯福年轻时在这里经营牧场的往事；2026 年 7 月，公园南区旁边的罗斯福总统图书馆开馆。",
  },
  {
    outlet: "lonely-planet",
    edition: 2026,
    kind: "experience",
    title: "Raft the Colorado River",
    parks: ["grca"],
    url: LP_2026,
    reasonZh: "跟漂流公司在大峡谷里的科罗拉多河上漂好几天：没有信号，夜里满天星，吃住和装备都由公司包办。",
  },
  {
    outlet: "lonely-planet",
    edition: 2026,
    kind: "stay",
    title: "Stay at historic Volcano House",
    parks: ["havo"],
    url: LP_2026,
    reasonZh: "住进基拉韦厄火山口边上的老旅馆，房间就能看到火山口，赶上喷发时夜里能看到火光。",
  },
  {
    outlet: "natgeo",
    edition: 2026,
    kind: "destination",
    title: "North Dakota Badlands",
    parks: ["thro"],
    url: "https://www.nationalgeographic.com/travel/best-of-the-world-2026/article/north-dakota-badlands",
    reasonZh: "梅多拉新建的西奥多·罗斯福总统图书馆 2026 年 7 月 4 日开馆，旁边的步道能俯瞰国家公园里的野牛草原。",
  },
  {
    outlet: "natgeo",
    edition: 2026,
    kind: "readers",
    title: "Banff, Canada",
    parks: ["banf"],
    url: "https://www.nationalgeographic.com/travel/article/best-of-the-world-2026",
    reasonZh: "读者票选第一：在加拿大第一座国家公园里，小镇的方便和荒野都有，三个滑雪场、路易斯湖、梦莲湖和温泉。",
  },
  {
    outlet: "natgeo",
    edition: 2026,
    kind: "stay",
    title: "Fairmont Jasper Park Lodge",
    parks: ["jasp"],
    url: "https://www.nationalgeographic.com/travel/best-of-the-world-2026/article/best-new-hotels",
    reasonZh: "最佳新酒店（另外一张小榜）：贾斯珀公园酒店在 2024 年山火后重新开业，客房和餐厅都翻新了，夜空很暗。",
  },
  {
    outlet: "natgeo",
    edition: 2024,
    kind: "experience",
    title: "Bear watch in Katmai National Park",
    parks: ["katm"],
    url: "https://www.nationalgeographic.com/culture/article/best-of-the-world-20-experiences-for-2024",
    reasonZh: "跟团去卡特迈偏远的海岸，看棕熊吃草、挖蛤蜊、抓鲑鱼，比布鲁克斯营地挤满人的观熊台清静得多。",
  },
  {
    outlet: "time",
    edition: 2024,
    kind: "stay",
    title: "Kantishna Roadhouse",
    parks: ["dena"],
    url: "https://time.com/collections/worlds-greatest-places-2024/6992290/kantishna-roadhouse/",
    reasonZh:
      "阿拉斯加原住民企业经营、在德纳里公园路尽头的旅馆；公园路被 Pretty Rocks 滑坡截断以后只能坐小飞机进去，几乎碰不到别人。",
  },
];

/** U.S. News 的美国最佳国家公园（综合旅行专家和游客的评价）：只记收录了哪些（按代码排），不记名次 */
export const usNewsBest: { edition: number; url: string; parks: string[] } | undefined = {
  edition: 2026,
  url: "https://travel.usnews.com/rankings/best-national-parks-in-the-usa/",
  parks: [
    "acad", "arch", "bibe", "brca", "cany", "dena", "deva", "glac", "grca", "grsm", "grte", "hale",
    "havo", "kefj", "meve", "mora", "olym", "redw", "romo", "sequ", "whsa", "yell", "yose", "zion",
  ],
};

/** 整理的日期 */
export const honorsChecked = "2026-10-02";
