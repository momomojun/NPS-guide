// 美国的 63 座国家公园（名字就叫 National Park 的；NPS 一共管 400 多处，其余是国家纪念地、休闲区、历史公园等）
// 和加拿大落基山的 3 座：榜单页的游客人次、设立时间线和公园页的“档案”用。
// 设立日期是成为国家公园的日期（按 NPS 的 National Park System Areas Listed in Chronological Order 整理的
// Wikipedia「List of national parks of the United States」，面积是 NPS 2023 年的面积报告），2026-10-02 整理。
// 很多公园之前已经是国家纪念地（大峡谷 1908 年、锡安 1909 年……），这里只算升为国家公园的那天。

export interface NationalPark {
  /** NPS 单位代码（小写）：查游客人次用；红杉（sequ）和国王峡谷（kica）是两座，网站上合成一个公园页 seki */
  code: string;
  nameZh: string;
  nameEn: string;
  /** 所在州，几个州用顿号隔开 */
  statesZh: string;
  /** 成为国家公园的日期 */
  established: string;
  /** 面积（平方公里） */
  areaKm2: number;
  /** 网站上的公园页代码；没收录的没有 */
  page?: string;
}

// [NPS 代码, 中文名, 英文名, 所在州, 设立日期, 面积（平方公里）, 网站上的公园页]，按设立日期排
type Row = [string, string, string, string, string, number, string?];

const rows: Row[] = [
  ["yell", "黄石", "Yellowstone", "怀俄明、蒙大拿、爱达荷", "1872-03-01", 8983, "yell"],
  ["sequ", "红杉", "Sequoia", "加州", "1890-09-25", 1635, "seki"],
  ["yose", "优胜美地", "Yosemite", "加州", "1890-10-01", 3083, "yose"],
  ["mora", "雷尼尔山", "Mount Rainier", "华盛顿州", "1899-03-02", 957, "mora"],
  ["crla", "火山口湖", "Crater Lake", "俄勒冈", "1902-05-22", 741, "crla"],
  ["wica", "风洞", "Wind Cave", "南达科他", "1903-01-09", 137, "wica"],
  ["meve", "梅萨维德", "Mesa Verde", "科罗拉多", "1906-06-29", 212, "meve"],
  ["glac", "冰川", "Glacier", "蒙大拿", "1910-05-11", 4100, "glac"],
  ["romo", "落基山", "Rocky Mountain", "科罗拉多", "1915-01-26", 1076, "romo"],
  ["havo", "夏威夷火山", "Hawaiʻi Volcanoes", "夏威夷", "1916-08-01", 1395, "havo"],
  ["lavo", "拉森火山", "Lassen Volcanic", "加州", "1916-08-09", 431, "lavo"],
  ["dena", "德纳里", "Denali", "阿拉斯加", "1917-02-26", 19186, "dena"],
  ["acad", "阿卡迪亚", "Acadia", "缅因", "1919-02-26", 199, "acad"],
  ["grca", "大峡谷", "Grand Canyon", "亚利桑那", "1919-02-26", 4863, "grca"],
  ["zion", "锡安", "Zion", "犹他", "1919-11-19", 596, "zion"],
  ["hosp", "温泉", "Hot Springs", "阿肯色", "1921-03-04", 22],
  ["brca", "布莱斯峡谷", "Bryce Canyon", "犹他", "1928-02-25", 145, "brca"],
  ["grte", "大提顿", "Grand Teton", "怀俄明", "1929-02-26", 1255, "grte"],
  ["cave", "卡尔斯巴德洞窟", "Carlsbad Caverns", "新墨西哥", "1930-05-14", 189, "cave"],
  ["ever", "大沼泽地", "Everglades", "佛罗里达", "1934-05-30", 6106, "ever"],
  ["grsm", "大烟山", "Great Smoky Mountains", "北卡罗来纳、田纳西", "1934-06-15", 2114, "grsm"],
  ["shen", "仙纳度", "Shenandoah", "弗吉尼亚", "1935-12-26", 811, "shen"],
  ["olym", "奥林匹克", "Olympic", "华盛顿州", "1938-06-29", 3734, "olym"],
  ["kica", "国王峡谷", "Kings Canyon", "加州", "1940-03-04", 1869, "seki"],
  ["isro", "皇家岛", "Isle Royale", "密歇根", "1940-04-03", 2314],
  ["maca", "猛犸洞", "Mammoth Cave", "肯塔基", "1941-07-01", 293],
  ["bibe", "大弯", "Big Bend", "得克萨斯", "1944-06-12", 3242, "bibe"],
  ["viis", "维尔京群岛", "Virgin Islands", "美属维尔京群岛", "1956-08-02", 61],
  ["hale", "哈莱阿卡拉", "Haleakalā", "夏威夷", "1961-07-01", 136, "hale"],
  ["pefo", "石化林", "Petrified Forest", "亚利桑那", "1962-12-09", 896, "pefo"],
  ["cany", "峡谷地", "Canyonlands", "犹他", "1964-09-12", 1366, "cany"],
  ["noca", "北瀑布", "North Cascades", "华盛顿州", "1968-10-02", 2043, "noca"],
  ["redw", "红木", "Redwood", "加州", "1968-10-02", 563, "redw"],
  ["arch", "拱门", "Arches", "犹他", "1971-11-12", 310, "arch"],
  ["care", "圆顶礁", "Capitol Reef", "犹他", "1971-12-18", 979, "care"],
  ["gumo", "瓜达卢佩山", "Guadalupe Mountains", "得克萨斯", "1972-09-30", 350, "gumo"],
  ["voya", "航海家", "Voyageurs", "明尼苏达", "1975-04-08", 883],
  ["badl", "恶地", "Badlands", "南达科他", "1978-11-10", 982, "badl"],
  ["thro", "西奥多·罗斯福", "Theodore Roosevelt", "北达科他", "1978-11-10", 285, "thro"],
  ["chis", "海峡群岛", "Channel Islands", "加州", "1980-03-05", 1010, "chis"],
  ["bisc", "比斯坎", "Biscayne", "佛罗里达", "1980-06-28", 700, "bisc"],
  ["gaar", "北极之门", "Gates of the Arctic", "阿拉斯加", "1980-12-02", 30448, "gaar"],
  ["glba", "冰川湾", "Glacier Bay", "阿拉斯加", "1980-12-02", 13045, "glba"],
  ["katm", "卡特迈", "Katmai", "阿拉斯加", "1980-12-02", 14870, "katm"],
  ["kefj", "基奈峡湾", "Kenai Fjords", "阿拉斯加", "1980-12-02", 2710, "kefj"],
  ["kova", "科伯克谷", "Kobuk Valley", "阿拉斯加", "1980-12-02", 7085, "kova"],
  ["lacl", "克拉克湖", "Lake Clark", "阿拉斯加", "1980-12-02", 10602, "lacl"],
  ["wrst", "兰格尔–圣伊莱亚斯", "Wrangell–St. Elias", "阿拉斯加", "1980-12-02", 33683, "wrst"],
  ["grba", "大盆地", "Great Basin", "内华达", "1986-10-27", 312, "grba"],
  ["npsa", "美属萨摩亚", "American Samoa", "美属萨摩亚", "1988-10-31", 33],
  ["drto", "干龟岛", "Dry Tortugas", "佛罗里达", "1992-10-26", 262, "drto"],
  ["sagu", "巨人柱", "Saguaro", "亚利桑那", "1994-10-14", 376, "sagu"],
  ["deva", "死亡谷", "Death Valley", "加州、内华达", "1994-10-31", 13793, "deva"],
  ["jotr", "约书亚树", "Joshua Tree", "加州", "1994-10-31", 3218, "jotr"],
  ["blca", "甘尼森黑峡谷", "Black Canyon of the Gunnison", "科罗拉多", "1999-10-21", 125, "blca"],
  ["cuva", "凯霍加谷", "Cuyahoga Valley", "俄亥俄", "2000-10-11", 132],
  ["cong", "康加里", "Congaree", "南卡罗来纳", "2003-11-10", 108],
  ["grsa", "大沙丘", "Great Sand Dunes", "科罗拉多", "2004-09-24", 434, "grsa"],
  ["pinn", "尖峰石阵", "Pinnacles", "加州", "2013-01-10", 108, "pinn"],
  ["jeff", "圣路易斯拱门", "Gateway Arch", "密苏里", "2018-02-22", 0.8],
  ["indu", "印第安纳沙丘", "Indiana Dunes", "印第安纳", "2019-02-15", 62],
  ["whsa", "白沙", "White Sands", "新墨西哥", "2019-12-20", 592, "whsa"],
  ["neri", "新河峡谷", "New River Gorge", "西弗吉尼亚", "2020-12-27", 28, "neri"],
];

/** 按设立日期排；同一天设立的（1980 年 12 月 2 日阿拉斯加 7 座）按英文名 */
export const nationalParks: NationalPark[] = rows.map(([code, nameZh, nameEn, statesZh, established, areaKm2, page]) => ({
  code,
  nameZh,
  nameEn,
  statesZh,
  established,
  areaKm2,
  ...(page ? { page } : {}),
}));

export interface PendingPark {
  nameZh: string;
  nameEn: string;
  statesZh: string;
  /** 国会通过的日期 */
  passed: string;
}

/**
 * 可能的下一座：奇里卡瓦国家纪念地（亚利桑那东南角）升为国家公园的法案 2026 年 10 月 1 日参议院通过、等总统签字。
 * 签了以后把它加进上面的列表（代码 chir），这里改成 undefined
 */
export const pendingPark: PendingPark | undefined = {
  nameZh: "奇里卡瓦",
  nameEn: "Chiricahua",
  statesZh: "亚利桑那",
  passed: "2026-10-01",
};

export interface CanadianPark {
  /** 网站上的公园页代码 */
  code: string;
  nameZh: string;
  nameEn: string;
  provinceZh: string;
  /** 最早设立保护区的日期（班夫 1885 年是温泉保护区，1887 年起叫落基山公园；幽鹤、贾斯珀也是先设保护区、森林公园） */
  established: string;
  areaKm2: number;
}

/** 加拿大落基山（Parks Canada 管理），按设立日期排；面积按 Parks Canada */
export const canadianParks: CanadianPark[] = [
  { code: "banf", nameZh: "班夫", nameEn: "Banff", provinceZh: "艾伯塔", established: "1885-11-25", areaKm2: 6641 },
  { code: "yoho", nameZh: "幽鹤", nameEn: "Yoho", provinceZh: "不列颠哥伦比亚", established: "1886-10-10", areaKm2: 1313 },
  { code: "jasp", nameZh: "贾斯珀", nameEn: "Jasper", provinceZh: "艾伯塔", established: "1907-09-14", areaKm2: 10878 },
];

/** 网站公园页 → 对应的 NPS 国家公园（seki 是红杉和国王峡谷两座） */
export const nationalParksOf = (page: string) => nationalParks.filter((park) => park.page === page);
