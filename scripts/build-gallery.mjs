// 给每个景点挑一组照片（Wikimedia Commons）：按名字搜 + 景点附近带坐标的照片，
// 精选图（Featured / Quality / Valued）、分辨率高、横图优先，去掉地图、标牌、示意图、老照片。
// 景点数据里手选的 photoFile 固定排第一；同一张照片只给一个景点用。
// 输出 src/data/attractions/gallery.generated.ts。重新跑：npm run data:gallery
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { attractions, parks, sleep, USER_AGENT } from "./load-data.mjs";

const OUTPUT = new URL("../src/data/attractions/gallery.generated.ts", import.meta.url);
const API = "https://commons.wikimedia.org/w/api.php";
const THUMB_WIDTH = 960;
const PER_ATTRACTION = 6;
const MAX_PER_AUTHOR = 2;
const GEO_RADIUS_M = 500;
/** 候选太少时，附近照片放宽到这个半径 */
const WIDE_RADIUS_M = 1500;
const FEW_CANDIDATES = 12;

/** 人工看过、不合适的照片（按文件名开头匹配）。"*" 对所有景点生效，其余只对该景点生效 */
const EXCLUDE = {
  "*": [
    "Path to Taft Point IMG 4333",
    "Bridalveil Fall, Yosemite Park, California 04",
    "MRNP — The original 1906 National Park Inn",
    "Milky Way Arc over Yosemite",
    "A late afternoon in Tuolumne Grove",
    "Tuolumne Grove Trailhead",
    "Hetch-Hetchy-dam-site",
    "Hetch Hetchy Reservoir, Yosemite National Park, California (21546718026)",
    "Hetch Hetchy Reservoir, Yosemite National Park, California (21572917035)",
    "Entering Yosemite from Mono Lake",
    "May Lake, Yosemite National Park (19442457775)",
    "Red Tree Among Green Trees",
    "NPS pioneer-yosemite-history-center",
    "The giant General Sherman tree with Foundation members",
    "Pentagramma pallida",
    "Larrea tridentata",
    "Slow Pedestrian Traffic",
    "Metepeira arizonica",
    "-conservationlands15",
    "Ranger at Zion Canyon Visitor Center with junior rangers",
    "Zion Canyon Line",
    "Construction of new trail, Watchman Housing Area",
    "Highway Bridge over North Fork of Virgin River",
    "Clearing of right-of-way for new Highway 1",
    "General location of the new road",
    "Me at Observation Point",
    "Shuttle buses at Zion Human History Museum",
    "Bryce Canyon at Night (153100",
    "Flickr - brewbooks - Life in the Alpine Zone - Wheeler Peak",
    "Yavapai Geology Museum Ronnie Covlin",
    "Grand Canyon, Moran Point, Wikiekspedycja",
    "Snow Removal at Tusayan",
    "NPS Rangers Cinimin and Mariah",
    "Denali Depot",
    "Welcome to beautiful downtown Talkeetna",
    "CALLE EN TALKEETNA",
    "Talkeetna, AK 99676",
    "PARADA EN LA PARKER HIGHWAY",
    "Denali Princess Wilderness Lodge",
    "Path to Taft Point IMG 4339",
    "Yosemite National park.",
    "Yosemite Valley - Flickr - Harold Litwiler",
    "2013-09-19 18 55 05 Cathedral Spires near sunset",
    "Yosemite National Park, California, USA (27672492842)",
    "Erythranthe montioides",
    "General Grant National Memorial New York",
    "CalaverasBigTrees",
    "Big Sur Oakgrove View",
    "Quercus chrysolepis",
    "People standing in front of the visitor center in Death Valley",
    "Display of Books on Death Valley",
    "Europe - Roumanie",
    "Springdale Line to Zion Canyon Visitor Center",
    "Zion NP bus facility",
    "Zion NP HQ and museum",
    "Poa fendleriana",
    "Sunset Point at Bryce Canyon - panoramio",
    "Sleeping Cowgirl Drover",
    "Grand Canyon. July 2012",
    "NPS Ranger Cinimin",
    "SummerFest SM",
    "Scenes from the Denali South Viewpoint",
    "American Flag in Zion Canyon",
    "Zion NP EOC",
    "Alaska Railroad EMD",
    "Reading an Interpretive Panel",
    "Calocedrus decurrens",
    "Dawn Patrol, 1969",
    "Kings Canyon National Park, Shaver Lake",
    "Sarcodes sanguinea",
    "Neotamias alpinus",
    "Uta stansburiana",
    "Dusky horkelia",
    // Furnace Creek 的高尔夫球场，不是魔鬼高尔夫球场
    "Death Valley Golf Course",
    // 新加的 8 个公园：动植物、人物活动、老照片、别处的同名地点
    "Leucosticte tephrocotis",
    "Campanula prenanthoides",
    "C angustifolium",
    "Santa Rosa Island, Ford Point, March 18, 2003",
    "Ventura, CA, The Pier and Santa Rosa Island",
    "ICE PLANTS ON ANACAPA",
    "Island fox, San Miguel Island, oct 1971",
    "Start of Skyline Trail - Comes Well Recommended",
    "National Park Service 2016 Centennial",
    "Curt Jacquot",
    "Roger Andrasick",
    "Christine Falls Bridge under construction in 1927",
    "Longmire Museum during move",
    "People loading pulp wood",
    "First Christian Church, Port Angeles",
    "The hotel at Sol Duc, 1912",
    "Cape Flattery Cape York Peninsula",
    "Animals mammal river otters",
    "Animals mountain beaver",
    "(View) Plate",
    "(Text Page)",
    "Tent for workers at Newhalem, 1935",
    "Tourists boarding Skagit tour boat, circa 1970s",
    "Couple with fish, 1952",
    "Diablo Dam, 1931",
    "Reflector Bar (1930)",
    "Cascadian Farms",
    "Morning Glory Pool 1956",
    "Vice President Mike Pence",
    "Road Clearing from Southwest Area",
    "Crescent City skyline",
    "Crescent City, CA, USA - panoramio",
    "Caffee in the Prairie Creek",
    "Forest at Pinnacles Overlook-Fremont Winema",
    "PINNACLES AT WINTER RIDGE",
    "Lyndon Baines Johnson Memorial Grove",
    "LBJ Memorial Grove",
    "Blue Heron at LBJ Memorial Grove",
    "Sequoia sempervirens LBJ",
    "Hemitomes congestum",
    "Pearly everlasting",
    "Rhytisma arbuti",
    "Coast Silk Tassel",
    "When the weather sucks, take macros",
    "Anything playing at the theater in Orick",
    "San Miguel Rescue",
    "Crater Lake NP, OR, North Rim",
    "Rebecca Lofgren",
    "Our group at Meany Rock Bench",
    "Animals elk female face",
    "Wildlife bear forest Hoh",
    "Plate LXXXVIII",
    "Flag raising at Golden West",
    "Rangers working at Golden West",
    "Ross Dam control room, 1970s",
    "Ruby Inn, 1926",
    "Workers at Diablo Dam site",
    "Mt. Washington & Big Lake",
    "BLM Winter Bucket List",
    "(L-R)",
    "David Baszucki",
    "Sunset near the Boy Scout Trail",
    "CERRO ALTO",
    "Car-Barrel Scenic Road",
    "Wing Lake ski tour",
    "Southeast slide path",
    "Pouzarella",
    "SpottedTowhee",
    "Three park rangers",
    "Lady Liberty of Orick",
    "Diplacus",
    "Rana aurora",
    "Buzonium",
    "Linnaea borealis",
    "Penstemon",
    "WTA on the",
    "Pumice and plants",
    "Ranger ",
    "Rangers ",
    "REYP ranger",
    "T E D D Y",
  ],
  "noca-rainy-lake": ["Point 7509 ft", "Whistler Mountain"],
  "noca-blue-lake": ["A Floatplane lifts off from Lake Chelan"],
  "olym-lake-quinault": [
    "Lake Quinault Lodge",
    "2803 Lake Quinault Lodge",
    "2825 Lake Quinault Lodge",
    "Hotel Quinault",
    "No. 5 Quinault",
    "Historic Lake Quinault Lodge",
    "Lake Quinault tribal",
    "The Original Lake Quinault Lodge",
  ],
  "grte-teton-park-road": [
    "Winter Recreation on the Teton Park Road",
    "ALF in Grand Teton",
    "Views along Grand Loop Road",
    "East Entrance Road",
  ],
  "grte-snake-river-overlook": ["Unvieling of Ansel Adams stamps"],
  "grte-craig-thomas-vc": ["Donor Recognition Wall"],
  "grte-lsr-preserve": ["Laurance S Rockefeller Porch Roof Collapse", "Claw marks of a Black Bear"],
  "grte-moose-wilson-road": ["YCP work on Moose-Wilson Road", "Accessible Horse Mounting"],
  "grte-signal-mountain": ["Artemisia", "Signal Mountain Lodge"],
  "grte-colter-bay": ["Coyote (", "U.S. Park Ranger", "Marshmallows", "Female Brewers Blackbird"],
  "grte-aerial-tram": ["START Bus", "Construction crane", "Greg Garza"],
  "grte-elk-refuge": [
    "Elk antler arch",
    "Bridger-Teton NF HQ",
    "Eclipse Viewing",
    "Million Dollar Cowboy Bar",
    "Jackson Hole Museum",
  ],
  "grte-jackson-town-square": ["Blueberries, Farmers Market", "Wort Hotel"],
  "grte-taggart-lake": ["Taggart Lake Trailhead"],
  "noca-trail-of-the-cedars": ["Seattle City Light Number 6"],
  "noca-diablo-lake-cruise": ["Skagit Tours bus", "My bike above", "Diablo Incline Railway"],
  "yell-mystic-falls": ["Cliff Geyser"],
  "yell-upper-geyser-basin": [
    "Morning Glory Pool 0",
    "Morning Glory Pool, Yellowstone",
    "Morning Glory Pool (",
    "Morning Glory Pool &",
    "Yellowstone N.P., Morning Glory Pool",
    "Yellowstone National Park (WY, USA), Lower Geyser Basin",
  ],
  "yell-lake-yellowstone": [
    "Lake Yellowstone Hotel",
    "Lake Hotel",
    "Ford bus at Lake Yellowstone Hotel",
    "Lake Hotel Yellowstone NP. 02",
    "Lake Hotel Yellowstone NP. 05",
    "Lake Hotel Yellowstone NP. 08",
    "Lake Yellowstone Hotel Sunroom",
    "Lake Yellowstone Hotel Exterior",
    "Lake Yellowstone Hotel Bar",
    "Lake Yellowstone Hotel 1 ",
    "Lake Yellowstone Hotel 2 ",
  ],
  "yell-tower-fall": ["Skiing away from Tower Fall", "Tower Fall General Store"],
  "yell-fairy-falls": ["Fairy Falls (HD)"],
  "yell-canyon-visitor-center": ["Program at Canyon Visitor", "Canyon Visitor Education Center Openeing Day"],
  "yell-old-faithful-visitor-center": ["Tribal games"],
  // 山顶游客中心 2023 年烧毁，不放旧楼的照片
  "olym-hurricane-ridge": [
    "Hurricane Ridge Visitor Center",
    "Hurricane Ridge visitorcenter",
    "Hurricane Ridge VC",
    "Hurricane Ridge Day Lodge",
    "Crosscountry skiing hurricane ridge visitor center",
    "Hurricane Ridge - Olympic National Park - Washington State (",
  ],
  "olym-mount-storm-king": ["Storm King Ranger Station"],
  "olym-hoh-visitor-center": ["Hoh Rain Forest - 54019463021"],
  "olym-largest-sitka-spruce": ["Lk Quinault", "Willaby Creek Trail"],
  "mora-sunrise-visitor-center": ["Waterfall near the peak of Mt Rainier"],
  "mora-burroughs-mountain": ["Evan and Adrie Redman"],
  "crla-mount-scott": ["Mount Scott trail.jpg", "Crater Lake from Mount Scott in 2011 (2) (cropped)"],
  "lavo-brokeoff-mountain": ["Moon set over Brokeoff"],
  "lavo-loomis-museum": ["Loomis Museum Seismographic Building", "Loomis Museum (PB5)"],
  "lavo-summit-lake": ["Summit Lake Fun"],
  "redw-klamath-river-overlook": ["Visitors at Klamath River Overlook"],
  "chis-anacapa-island": ["20170505 NPRW"],
  "redw-grove-of-titans": ["Stout", "Boy Scout", "Redwood trees on the Boy Scout", "US 199"],
  "redw-fern-canyon": ["Van Damme"],
  "chis-prisoners-harbor": ["Approaching Scorpion Harbor", "Scorpion Harbor", "Between "],
  "lavo-kings-creek-falls": ["Bumpass Hell, Lassen NP 2006"],
  "crla-phantom-ship-overlook": ["Wizard Island in Crater Lake National Park - Oregon 2008", "Sun Notch Viewpoint"],
  "crla-plaikni-falls": ["Crater Lake NP, OR, North Rim"],
  "olym-visitor-center": ["Crosscountry skiing hurricane ridge visitor center", "Crossroads in Port Angeles"],
  "noca-visitor-center": ["Ranger talk in Stehekin", "Golden West Visitor Center", "North Cascades Visitor Center in Marblemount"],
  "yell-firehole-canyon-drive": [
    "Yellowstone, Grand Prismatic Spring",
    "Blue Geyser in Yellowstone",
    "Yellowstone Geyser",
    "Gibbon Falls",
  ],
  "yell-lookout-point": ["Lower Fall - viewed from Artist's Point"],
  "yell-inspiration-point": ["Inspiration Point Bryce Canyon November 2018 panorama"],
  "deva-visitor-center": ["Harmony Borax Works", "Stovepipe Wells, Death Valley National Park"],
  "yose-yosemite-falls": ["Yosemite Falls Trail May 2011 001"],
  // 这几张其实是优胜美地瀑布或者别的瀑布
  "yose-horsetail-fall": [
    "Yosemite Valley, Horsetail Fall",
    "Horsetail Fall Yosemite National Park (231895797)",
    "Half Dome and Bridalveil Falls from Tunnel View",
    "Waterfall (179372089)",
  ],
  "yose-cathedral-lakes": ["Cathedral Beach in Yosemite"],
  "yose-may-lake": [
    "Yosemite National Park (California, USA), Yosemite Valley, Mirror Lake",
    "Yosemite National Park (CA, USA), Yosemite Valley, Mirror Lake",
    "Lake Tenaya in Yosemite NP",
  ],
  "yose-valley-view": [
    "Panoramic Overview from Glacier Point",
    "Yosemite National Park (California, USA), Yosemite Valley (Yosemite Tunnel)",
  ],
  "zion-canyon-junction": ["Museum, Zion NP"],
  "seki-big-trees-trail": ["Resurrection Tree Sequoia, Big Stump Grove", "Trail up to Moro Rock"],
  // 别处也有叫 Mist Falls 的瀑布（俄勒冈、华盛顿）
  "seki-mist-falls": ["Mist Falls, Oregon", "Mist falls over the park", "Mist Falls.jpg", "Mist falls.jpg"],
  "zion-visitor-center": ["Kolob Canyons Visitor Center"],
  "zion-scout-lookout": ["Zion National Park Kayenta Trail"],
  "brca-paria-view": ["Randonnée sur Fairyland Loop"],
  "brca-bryce-point": [
    "Inspiration Point Bryce Canyon November 2018 panorama",
    "Trail junction near Sunrise Point",
    "Sunrise Point Bryce Canyon November 2018",
  ],
  "brca-night-sky": ["Grand Canyon Village, AZ 86023", "Bryce Natural Bridge"],
  "dena-visitor-center": ["View of Alaska Range from the Eielson Visitor Center"],
  "dena-mountain-vista": ["Denali bound train vista", "Denali vista (28957517334)"],
};

/** 个别景点：补充搜索词；geo: false 表示不用附近的照片（地点不固定，或者附近照片跟景点无关） */
const TUNING = {
  "yose-horsetail-fall": { search: ["Horsetail Fall firefall", "Horsetail Fall El Capitan"], geo: false },
  "yose-hetch-hetchy": { search: ["Wapama Falls"] },
  "seki-kings-canyon": {
    search: ["Kings Canyon Scenic Byway", "Junction View Kings Canyon", "Kings Canyon Highway 180", "Cedar Grove Kings Canyon"],
  },
  "deva-salt-creek": { search: ["Salt Creek Death Valley", "Salt Creek pupfish"] },
  "brca-night-sky": { search: ["Bryce Canyon night sky", "Bryce Canyon Milky Way", "Bryce Canyon stars night"], geo: false },
  "brca-bristlecone-loop": { search: ["Bristlecone Loop Bryce", "Pinus longaeva Bryce Canyon", "Rainbow Point bristlecone"] },
  "grca-hermits-rest": { search: ["Hermit's Rest Grand Canyon"] },
  "dena-mountain-vista": { search: ["Mountain Vista Denali", "Savage River Denali"] },
  "dena-talkeetna": { search: ["Denali flightseeing", "Ruth Glacier Denali", "Talkeetna floatplane"], geo: false },
  "dena-nenana-rafting": { search: ["Nenana River rafting", "Nenana River canyon Denali"], geo: false },
  "chis-whale-watching": { search: ["Channel Islands whale", "Santa Barbara Channel whale"], geo: false },
  "chis-sea-cave-kayak": { search: ["Channel Islands sea cave kayak", "Scorpion Anchorage kayak", "Santa Cruz Island sea cave"] },
  "redw-avenue-of-the-giants": { search: ["Avenue of the Giants", "Founders Grove Humboldt Redwoods"] },
  "lavo-burney-falls": { search: ["Burney Falls"] },
  "lavo-subway-cave": { search: ["Subway Cave lava tube"] },
  "yell-beartooth-highway": { search: ["Beartooth Highway", "Beartooth Pass"] },
  "olym-cape-flattery": { search: ["Cape Flattery"] },
  "olym-lake-quinault": { search: ["Lake Quinault"] },
  "olym-largest-sitka-spruce": { search: ["Quinault Sitka spruce"] },
  "noca-maple-pass-loop": { search: ["Maple Pass Loop", "Heather Maple Pass"] },
  // “Blue Lake Washington” 会搜到西雅图 Lake Washington 上空的蓝天使飞行表演
  "noca-blue-lake": { search: ["Blue Lake North Cascades", "Blue Lake Early Winters Spires", "Blue Lake Liberty Bell"] },
  "noca-trail-of-the-cedars": { search: ["Trail of the Cedars Newhalem"] },
  // 只写名字会搜到别处的同名地点（英国的 Leyland Titan 公交车、约书亚树的 Boy Scout Trail），加上 redwood
  // 泰坦巨人林的位置以前不公开，Commons 上只有几张几百像素的小图，用同在 Mill Creek 边的 Jedediah Smith 红杉林照片
  "redw-grove-of-titans": { search: ["Grove of Titans redwood", "Mill Creek Jedediah Smith", "Jedediah Smith Redwoods State Park"] },
  "redw-boy-scout-tree": { search: ["Boy Scout Tree Trail redwood"] },
  "crla-plaikni-falls": { search: ["Plaikni Falls"] },
  // 只按名字搜几乎全是牵牛花池，补上城堡、大间歇泉和河畔间歇泉
  "yell-upper-geyser-basin": { search: ["Castle Geyser", "Grand Geyser", "Riverside Geyser"] },
  "yell-lake-yellowstone": { search: ["Yellowstone Lake"] },
  "noca-diablo-lake-cruise": { search: ["Diablo Lake"] },
  "grte-aerial-tram": { search: ["Jackson Hole Aerial Tram", "Rendezvous Mountain tram"] },
  // 保护区就在 Jackson 镇边，附近的照片多半是镇上的酒吧、博物馆
  "grte-elk-refuge": { search: ["National Elk Refuge", "National Elk Refuge elk herd"], geo: false },
  "grte-teton-park-road": { search: ["Teton Park Road", "Cathedral Group Teton"] },
  "grte-signal-mountain": { search: ["Signal Mountain Grand Teton", "Signal Mountain summit Jackson Lake"] },
  "grte-lsr-preserve": { search: ["Phelps Lake Grand Teton", "Laurance S. Rockefeller Preserve"] },
  "grte-moose-wilson-road": { search: ["Moose-Wilson Road"] },
};

/** 搜索时代表公园的词。红杉和国王峡谷的照片一般只写其中一个；拉森的照片很少写全称 */
const SEARCH_PARK = { seki: ["Sequoia", "Kings Canyon"], lavo: ["Lassen"] };
/** 出发点离景点超过这么远（比如海峡群岛的码头）就不搜出发点附近的照片 */
const START_NEARBY_KM = 5;

const BAD_NAME = new RegExp(
  "\\b(" +
    [
      // 地图、标牌、图表
      "maps?|karte|carte|sign|signage|signpost|logo|diagram|brochure|plaque|placard|poster|marker|warning|trail info",
      "parking|toilet|restroom|elevation profile|profile|chart|graph|stamp|ticket|menu|screenshot",
      "master plan|construction details|elevation-section|haer|habs",
      // 画、老照片、卫星图
      "drawing|painting|sketch|engraving|lithograph|postcard|historic photo|hdr|nara|dpla|chs-\\d+|negative",
      "museum and archives|ca ?1[89]\\d\\d|circa 1[89]\\d\\ds?|1[89]\\d0s|, (18\\d\\d|19[0-7]\\d)|plate [lxvic]+|landsat|satellite|aerial|view of earth|iss\\d+|stereo image",
      // 跟景点无关的东西
      "campsites?|campground|campfire|amphitheater|elementary school|library|bookstore|fire hydrant|scion",
      "squirrel|chipmunk|chickadee|raven|newt|spider|mushrooms?|bobcat|mule deer|inat-?\\d+|inaturalist",
      "wikiexpedition|wikiekspedycja|recycling|cemetery|clearcoat|(front|rear) (left|right)|winterfest|summerfest",
      // 动植物特写（附近照片里常混进来）
      "skink|lizard|snake|grosbeak|woodpecker|birds?|wildflowers?|flowers?|plant|sedge|butterfly|insect|beetle|lichen|fern|moss",
      "salamander|jay|egret|falcon|swallows?|crow|vulture|towhee|wren|grouse|otters?|beaver|marmot|mushrooms?|fungus|fungi",
      "sorrel|pasqueflowers?|fleeceflower",
      // 岩石标本特写（地质学者拍的，文件名写岩石名和“152 ka”这样的年代）
      "obsidian|breccia|dacite|porphyritic|quartzose|spherulitic|\\d+ ka",
      // 人物活动、设施、别的东西
      "us navy|blue angels|locomotive|comfort station|outhouse|selfies?|self portrait|reporter|school group|you are here",
      "volunteers?|jewell|deer|fremont[- ]winema|joshua trees?|leyland|captive breeding|caprive breeding",
      "chats with|answers questions|answers visitor questions|ranger answers|speaks with|junior ranger|ranger program|ranger talk|ranger-led|ranger led",
    ].join("|") +
    ")\\b",
  "i",
);
/** 文件名里写了别的公园，多半是搜索词撞车（搜 Blue Lake 搜到一堆火山口湖的照片） */
const PARK_IN_NAME = {
  yose: /yosemite/i,
  seki: /sequoia national|kings canyon/i,
  deva: /death valley/i,
  zion: /\bzion\b/i,
  brca: /bryce/i,
  grca: /grand canyon(?! of (the )?yellowstone)/i,
  dena: /denali/i,
  yell: /yellowstone/i,
  grte: /grand teton/i,
  redw: /redwood national/i,
  lavo: /lassen/i,
  crla: /crater lake/i,
  chis: /channel islands/i,
  mora: /rainier/i,
  olym: /olympic national/i,
  noca: /north cascades/i,
};
const BAD_CATEGORY =
  /\b(paintings?|drawings?|maps?|satellite|aerial|ISS Expedition|astronaut|HAER|HABS|book scans|illustrations?|engravings?|lithographs?|postcards?|historical images|black and white photographs|signs|information boards|plaques|diagrams?|logos?)\b/i;
/** 物种照片常见的文件名：“拉丁学名 + 编号”，比如 “Cortinarius alboviolaceus 832949.jpg”（iNaturalist 导入） */
const SPECIES_PHOTO = /^[A-Z][a-z]+ [a-z]+( (var|subsp)\. [a-z]+)? \d{4,}/;
const BAD_AUTHOR =
  /George A\. Grant|Carl E\. Jepson|Ansel Adams|Carleton Watkins|Matson Collection|Internet Archive Book Images|Albert Bierstadt|William Keith/i;
const QUALITY = {
  "Category:Featured pictures on Wikimedia Commons": 6,
  "Category:Quality images": 4,
  "Category:Valued images sorted by promotion date": 2,
};

const parkName = Object.fromEntries(parks.map((p) => [p.code, p.nameEn]));

function plainText(html) {
  return (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\(talk\s*·\s*contribs\)/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function query(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo|categories",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
    iiextmetadatafilter: "Artist|Credit|LicenseShortName",
    clshow: "!hidden",
    cllimit: "max",
    ...params,
  });
  for (let attempt = 0; attempt < 6; attempt++) {
    let wait = 3000 * (attempt + 1);
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(30_000) });
      if (res.ok) {
        const data = await res.json();
        // 限流、搜索繁忙时也可能是 200 + error / warnings（这时结果是空的），都要重试
        const warning = data.warnings && JSON.stringify(data.warnings);
        if (warning) console.warn(`Commons 警告，稍后重试：${warning.slice(0, 160)}`);
        if (!data.error && !warning) return data.query?.pages ?? [];
      } else if (res.status === 429) {
        wait = Math.max(wait, Number(res.headers.get("retry-after") ?? 0) * 1000);
      }
    } catch {
      // 超时或网络错误，稍后重试
    }
    await sleep(wait);
  }
  // 查不到就整体失败，免得悄悄少了照片
  throw new Error(`Commons 查询失败：${params.gsrsearch ?? params.ggscoord ?? params.titles}`);
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** 景点名里有辨识度的词，用来判断照片是不是拍的这个景点 */
function keywords(nameEn) {
  return nameEn
    .replace(/\(.*?\)/g, " ")
    .split(/[\s–\-&/·,]+/)
    .map((word) => word.replace(/[’']/g, "").toLowerCase())
    .filter((word) => word.length > 2 && !["the", "and", "trail", "loop", "point", "national", "park"].includes(word));
}

function toPhoto(page) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const url = info.thumburl.split("?")[0];
  // 灯箱用的大图：Commons 标准缩略图尺寸里挑不超过原图的，原图太小就直接用原图
  const largeWidth = [1920, 1280].find((width) => info.width >= width);
  return {
    url,
    large: largeWidth ? url.replace(`/${THUMB_WIDTH}px-`, `/${largeWidth}px-`) : info.url,
    width: info.thumbwidth,
    height: info.thumbheight,
    page: info.descriptionurl,
    author: plainText(meta.Artist?.value) || plainText(meta.Credit?.value) || "Unknown",
    license: plainText(meta.LicenseShortName?.value),
  };
}

function excluded(id, title) {
  const lower = title.toLowerCase();
  return [...EXCLUDE["*"], ...(EXCLUDE[id] ?? [])].some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

/**
 * source：name = 按景点名搜到的，extra = TUNING 里补的搜索词，nearby = 景点附近带坐标的。
 * 按名字搜到、文件名里却一个景点关键词都没有的，多半是描述里顺带提到，不要。
 */
function score(page, id, words, source) {
  const info = page.imageinfo?.[0];
  if (!info) return -Infinity;
  const title = page.title.replace(/^File:/, "");
  if (excluded(id, title)) return -Infinity;
  // PNG 多半是地图、渲染图，只要 JPEG
  if (info.mime !== "image/jpeg") return -Infinity;
  // 景点名里的词不算（Lady Bird Johnson Grove 的 bird、Fern Canyon 的 fern）
  const own = words.length > 0 ? new RegExp(`\\b(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi") : null;
  const plain = title.replace(/[_.]/g, " ");
  if (BAD_NAME.test(own ? plain.replace(own, " ") : plain)) return -Infinity;
  if (SPECIES_PHOTO.test(title)) return -Infinity;
  const park = id.split("-")[0];
  if (Object.entries(PARK_IN_NAME).some(([code, pattern]) => code !== park && pattern.test(title))) return -Infinity;
  if ((page.categories ?? []).some((category) => BAD_CATEGORY.test(category.title))) return -Infinity;
  if (BAD_AUTHOR.test(plainText(info.extmetadata?.Artist?.value))) return -Infinity;
  if (info.width < 1200) return -Infinity;
  const ratio = info.width / info.height;
  if (ratio > 2.8 || ratio < 0.6) return -Infinity;

  let value = 0;
  for (const category of page.categories ?? []) value += QUALITY[category.title] ?? 0;
  const lower = title.toLowerCase().replace(/[’']/g, "");
  const hits = words.filter((word) => lower.includes(word)).length;
  if (source === "name" && words.length > 0 && hits === 0) return -Infinity;
  value += words.length > 0 ? (hits / words.length) * 4 : 0;
  if (source !== "nearby") value += 1;
  if (ratio >= 1.25 && ratio <= 2.2) value += 1.5;
  else if (ratio < 1) value -= 1.5;
  if (info.width >= 2400) value += 0.5;
  return value;
}

/** 一个景点的候选照片：名字搜索 + 附近照片，按分数从高到低 */
async function candidatesFor(attraction) {
  const tuning = TUNING[attraction.id] ?? {};
  const words = keywords(attraction.nameEn);
  const name = attraction.nameEn.replace(/\(.*?\)/g, " ").replace(/[–&]/g, " ").replace(/\s+/g, " ").trim();
  const nameTerms = (SEARCH_PARK[attraction.park] ?? [parkName[attraction.park]]).map((park) => `${name} ${park}`);
  const candidates = new Map();
  const add = (pages, source) => {
    for (const page of pages) {
      const value = score(page, attraction.id, words, source);
      if (value === -Infinity) continue;
      const previous = candidates.get(page.title);
      if (!previous || previous.value < value) candidates.set(page.title, { page, value });
    }
  };
  const nearby = async (point, radius) =>
    add(
      await query({
        generator: "geosearch",
        ggscoord: `${point.lat}|${point.lon}`,
        ggsradius: String(radius),
        ggsnamespace: "6",
        ggslimit: "50",
      }),
      "nearby",
    );
  const search = async (term, source) =>
    add(await query({ generator: "search", gsrsearch: `${term} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "30" }), source);

  for (const term of nameTerms) await search(term, "name");
  for (const term of tuning.search ?? []) await search(term, "extra");
  if (tuning.geo !== false) {
    const startNearby = attraction.start && distanceKm(attraction, attraction.start) <= START_NEARBY_KM;
    for (const point of [attraction, startNearby && attraction.start].filter(Boolean)) await nearby(point, GEO_RADIUS_M);
    if (candidates.size < FEW_CANDIDATES) await nearby(attraction, WIDE_RADIUS_M);
  }
  const main = attraction.photoFile ? (await query({ titles: `File:${attraction.photoFile}` }))[0] : undefined;
  return { main, ranked: [...candidates.values()].sort((a, b) => b.value - a.value).map((item) => item.page) };
}

// 调试：ONLY=景点id,景点id 只查这几个景点、打印候选，不写文件
if (process.env.ONLY) {
  for (const id of process.env.ONLY.split(",")) {
    const attraction = attractions.find((a) => a.id === id);
    if (!attraction) throw new Error(`没有景点 ${id}`);
    const { ranked } = await candidatesFor(attraction);
    console.log(`${id}：${ranked.length} 个候选`);
    for (const page of ranked) console.log(`  ${page.title}`);
  }
  process.exit(0);
}

// 增量更新：UPDATE=公园代码或景点id,…（比如新加的公园、改过的景点）只重挑这些景点，
// 其他景点的照片原样保留、也不会被这次挑走；不在数据里的旧景点顺便删掉
const previous =
  process.env.UPDATE && existsSync(OUTPUT)
    ? JSON.parse(readFileSync(OUTPUT, "utf8").replace(/^[\s\S]*?= \{/, "{").replace(/;\s*$/, ""))
    : null;
const updateTokens = process.env.UPDATE?.split(",") ?? [];
const targets = previous
  ? attractions.filter((a) => updateTokens.includes(a.id) || updateTokens.includes(a.park) || !(a.id in previous))
  : attractions;
const titleOf = (photo) => decodeURIComponent(photo.page.split("/wiki/")[1]).replace(/_/g, " ");

// 先并发查候选（几个景点同时查），再按景点顺序挑，保证同一张照片只给排在前面的景点
const CONCURRENCY = 2;
const found = new Array(targets.length);
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < targets.length) {
      const index = next++;
      found[index] = await candidatesFor(targets[index]);
      await sleep(500);
      console.log(`${targets[index].id}: 候选 ${found[index].ranked.length}`);
    }
  }),
);

// 手选的主图先占住，别的景点不能再用；增量更新时，保留下来的照片也占住
const used = new Set(attractions.filter((a) => a.photoFile).map((a) => `File:${a.photoFile}`));
const gallery = {};
if (previous) {
  for (const attraction of attractions) {
    if (targets.includes(attraction)) continue;
    gallery[attraction.id] = previous[attraction.id] ?? [];
    for (const photo of gallery[attraction.id]) used.add(titleOf(photo));
  }
}
targets.forEach((attraction, index) => {
  const { main, ranked } = found[index];
  const picked = [];
  const mainPhoto = main && toPhoto(main);
  if (mainPhoto) picked.push(mainPhoto);
  const authors = new Map(picked.map((photo) => [photo.author, 1]));
  for (const page of ranked) {
    if (picked.length >= PER_ATTRACTION) break;
    if (used.has(page.title)) continue;
    const photo = toPhoto(page);
    if (!photo) continue;
    const count = authors.get(photo.author) ?? 0;
    if (count >= MAX_PER_AUTHOR) continue;
    authors.set(photo.author, count + 1);
    used.add(page.title);
    picked.push(photo);
  }
  gallery[attraction.id] = picked;
  if (picked.length < 4) console.log(`注意：${attraction.id} 只有 ${picked.length} 张`);
});
// 按数据里的景点顺序输出
const ordered = Object.fromEntries(attractions.map((a) => [a.id, gallery[a.id] ?? []]));

writeFileSync(
  OUTPUT,
  `// 由 scripts/build-gallery.mjs 生成，请勿手改。照片来自 Wikimedia Commons，按各自授权署名使用。
import type { Photo } from "./types";

export const gallery: Record<string, Photo[]> = ${JSON.stringify(ordered, null, 2)};
`,
);
console.log(
  `写入 ${Object.keys(ordered).length} 个景点、${Object.values(ordered).flat().length} 张照片${previous ? `（重挑 ${targets.length} 个）` : ""}`,
);
