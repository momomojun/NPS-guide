# NPS Guide 开发文档

项目介绍和截图见 [README](../README.md)。这里是本地运行、代码结构、数据脚本、数据源和整理数据时的注意事项。

## 本地运行

```bash
npm install
cp .env.example .env.local   # 填入 DATA_GOV_API_KEY；不填则用 DEMO_KEY（每小时 30 次）；SERPAPI_API_KEY、DEEPL_API_KEY 可选
npm run dev                  # http://localhost:3000
```

| 环境变量 | 用途 | 不填时 |
|---|---|---|
| `DATA_GOV_API_KEY` | NPS、NLR 充电桩、GSA 接口通用的免费 key（https://api.data.gov/signup/） | 用 `DEMO_KEY`，每个 IP 每小时 30 次、每天 50 次 |
| `SERPAPI_API_KEY` | 机票实时价格（SerpApi 的 Google Flights 接口，免费每月 250 次） | 开发模式直接低频抓取 Google Flights 页面，部署后只给比价链接 |
| `DEEPL_API_KEY` | NPS 公告的中文翻译（DeepL API Free，每月 50 万字符） | 用免费的 MyMemory，额度用完时自用阶段再退到 Google 网页翻译 |
| `SELF_USE_SCRAPE` | 设成 `1`：部署后也打开自用抓取（Google Flights、AAA 油价、Google 网页翻译）；旧名 `PRICE_SCRAPE` 也认 | 开发模式开，构建版关 |

## 代码结构

| 位置 | 内容 |
|---|---|
| `src/app/[locale]/` | 页面：首页、公园页 `parks/[code]`、行程页 `plan`、什么时候去 `when`、博主路线 `routes`、机票租车油价 `prices`。`zh-Hans` 简体、`zh-Hant` 繁体；`src/proxy.ts` 按浏览器语言跳转 |
| `src/i18n/` | 界面文案。简体撰写，繁体用 OpenCC 自动转换（台湾用语，“米”转“公尺”） |
| `src/data/parks.ts` | 16 个公园：特色介绍、园内片区、定位点、时区、常用机场、常一起玩的公园（`nearby`）、非居民附加费、住宿建议 |
| `src/data/activities.ts` | 各公园的特别活动、节庆和季节现象（火瀑布、天文节、游船、漂流、骑马……）：月份、怎么预约、2026 年的特殊情况 |
| `src/data/airports.ts` | 各公园常用机场的位置，自动生成攻略时当出发 / 回程地 |
| `src/data/attractions/` | 每个公园一个文件的景点数据；`*.generated.ts` 由脚本生成，不要手改；`google.ts` 是 Google Maps 评分和评论数的手动快照；`route-fixes.ts` 修正 OSRM 明显估错的个别砂石路车程 |
| `src/data/lodging.ts` | 各公园的推荐住宿：园内酒店、门户小镇和民宿区（`rental`，Airbnb 整套房子集中的地方）；有 `airbnb` 地名的会按行程日期生成 Airbnb 搜索链接；车程已算进车程表 |
| `src/lib/planner.ts` | 排行程：公园内按路线排序 → 按天切分（让最累的一天尽量轻松）→ 当天按日出日落排顺序；早上从前一晚住处出发、晚上回当晚住处都算进去 |
| `src/lib/generate-trip.ts` | 自动生成攻略：可以几个顺路的公园一起排（比如盐湖城进出，先大提顿再黄石）。按月份去掉关闭和要抽签的景点（要订票的照排、提醒提前订），按必去、热度、当月最佳和节奏挑景点，路线从出发地排到回程地，再按车程和住宿偏好（不限 / 酒店 / 民宿）选每晚住处；太满的一天去掉最不重要的景点，有空的天再补 |
| `src/lib/trip-store.ts` | 行程（含每晚住处）存在浏览器 localStorage，自用阶段不需要账号 |
| `src/lib/geocode.ts`、`src/lib/osrm-client.ts` | 自定义住处：Photon 搜酒店 / 地址，OSRM 在浏览器里算到各景点的车程 |
| `src/lib/nps.ts`、`src/lib/nlr.ts` | NPS 公告和门票、NLR 充电桩 |
| `src/app/api/` | 接口：`alerts`（行程里几个公园的 NPS 公告，带中文翻译）、`weather`（Open-Meteo 16 天预报 + NWS 预警）、`prices/flights`（机票价格）、`prices/gas`（各州油价）、`services/[park]` 和 `gallery/[park]`（构建时生成的静态 JSON） |
| `src/lib/alert-match.ts`、`src/lib/weather.ts` | 公告按景点英文名 / 片区对到行程景点（关闭类只看标题）；天气预报和预警 |
| `src/lib/prices/` | 价格数据源一层：`serpapi.ts`（配了 key 用）、`google-flights.ts`（自用低频抓取，缓存 6 小时）、`google-tfs.ts`（Google Flights 链接参数）、`links.ts`（Kayak / Expedia 比价链接）、`car-rates.ts`（Kayak 租车参考价快照）、`fuel.ts`（AAA 各州油价快照）、`gas.ts`（AAA 实时油价，12 小时读一次，读不到用快照） |
| `src/lib/translate.ts`、`src/lib/alert-translate.ts` | NPS 公告翻成中文：DeepL（配了 key）→ MyMemory（免费）→ Google 网页翻译（仅自用）；页面上中文和原文一起显示，注明是机器翻译 |
| `src/lib/self-use.ts` | 自用阶段的抓取开关（Google Flights 机票、AAA 油价、Google 网页翻译）：开发模式默认开，部署后设 `SELF_USE_SCRAPE=1` 才开 |
| `src/components/prices/` | 价格页：机票（可以一次比较某个公园附近的几个机场）、各机场租车参考价、公园所在各州的油价和油费 / 电费计算 |
| `src/components/plan/` | 行程页：每天的卡片（天气、公告）、总览、攻略说明、补给、机票和租车、预算（`budget.ts` 计算）、打印和离线保存 |
| `src/data/creators.ts` | 博主同款路线：YouTube / B 站视频（中文、英语、日语、韩语、西语、法语、意语、德语博主）按文稿、简介或章节整理的路线、季节、对景点的评价和提醒，景点卡片上显示“博主怎么说” |
| `src/lib/seasons.ts` | 什么时候去：按月份整理每个公园能去的景点比例、去不了的必去景点、往年同期天气和特别活动，页面按出发日期打分 |
| `public/sw.js`、`src/app/manifest.ts` | 离线：构建版注册 service worker，缓存看过的页面、脚本、接口数据和地图瓦片；可以装到手机主屏 |
| `src/components/map/park-map.tsx` | MapLibre 地图：OpenFreeMap 底图 + 地形阴影 + USGS 卫星图 + 3D 地形，都不需要 key |
| `src/app/globals.css` | 设计基调：纸色底、墨色字、砂岩红强调色；标题 Cormorant Garamond + 思源宋体，正文 Jost；开场动画、滚动渐显 |
| `src/components/home/` | 首页：开场动画、全屏轮播、公园目录、线描地图（`src/data/map.generated.ts`） |
| `src/components/site/` | 页头（压在大图上时透明，滚动后变纸色）、页脚、滚动渐显 |

## 数据脚本

新增或修改景点、推荐住宿后，重新生成对应的数据（都是 `src/data/attractions/*.generated.ts`）：

```bash
npm run data:gallery     # 每个景点从 Wikimedia Commons 挑最多 6 张照片（photoFile 排第一），查缩略图、作者、授权
npm run data:travel      # 用 OSRM 按道路算各景点、住宿之间的车程；相邻公园（nearby）另算跨园直达的车程
npm run data:trails      # 按 trail 途经点，用 Valhalla 沿 OpenStreetMap 步道生成徒步路线
npm run data:map         # 首页线描地图：Natural Earth 州界按 Albers 投影成 SVG，公园和城市位置一起算好
npm run data:services    # 补给点：OSM 的加油站、超市、亚洲超市和餐厅 + NLR 快充（ONLY=grte,zion 只查几个公园，SKIP_OSM=1 只补快充）
npm run data:climate     # 往年同期天气：Open-Meteo 历史数据 2016–2025 年按月平均，每个片区取离平均位置最近的景点
npm run data:fees        # 门票：NPS API feespasses
npm run data:perdiem     # 住宿和餐饮参考：GSA Per Diem（按住宿所在的县），阿拉斯加不在范围内
```

`data:travel` 也会算各机场到公园定位点的车程（机票和租车里比较附近机场用）。

新增景点后，到 Google Maps 查它的评分和评论数，补进 `src/data/attractions/google.ts`（没有的话不参与热度排名）。

照片是按名字搜索 + 景点附近带坐标的照片自动挑的，重新生成后最好人工看一遍：不合适的文件名加进 `scripts/build-gallery.mjs` 的 `EXCLUDE`，搜不到好照片的景点在 `TUNING` 里补搜索词。只想看某几个景点的候选照片（不写文件）：`ONLY=yose-taft-point,seki-mist-falls npm run data:gallery`；只重挑新加的公园或改过的景点、其他照片不动：`UPDATE=grte,olym-lake-quinault npm run data:gallery`（公园代码或景点 id）。

README 里的截图用 `npm run docs:screenshots` 重新生成（`scripts/screenshots.mjs`）：用本机的 Chrome / Edge 打开开着的网站（默认 http://localhost:3000，`BASE=` 可换），现场用“自动生成攻略”排一个黄石 + 大提顿 5 天的行程，截首页、公园页、行程页、什么时候去、博主路线、价格页和手机版，存到 `docs/screenshots/`，另外合成 GitHub 的社交预览图 `docs/social-preview.jpg`。`ONLY=home,plan` 只截其中几张。

`npm run dev` / `npm run build` 前会自动把 MapLibre 的 worker 文件复制到 `public/maplibre/`（v6 的 worker 是单独的 ES 模块，打包工具处理不了）。

## 目标用户

- 会中文的来美游客和在美华人：中国大陆、台湾、东南亚华人
- 以后扩展到日本、韩国（饮食口味、亚洲超市、自驾习惯相近）
- 内容用简体撰写，OpenCC 自动转繁体（台湾用语）；代码结构预留 ja / ko

## 当前阶段：自用优先

先做到自己出行真的会用，再给别人用。暂不做账号系统，不优先做 SEO。

## 路线图

### v1 基础功能：地图、景点、规划

- [x] 景点地图：16 个公园共 279 个景点（优胜美地 33 个、黄石 29 个、大提顿 23 个），地图和列表联动；坐标、出发点、徒步数据、开放季节、许可证。酒店不算景点（历史酒店放在住宿里）
- [x] 景点图集：每个景点最多 6 张 Wikimedia Commons 照片，卡片里切换，点开全屏看（左右键 / 滑动切换）
- [x] 中英文对照（地图标签、卡片），一键到 Google Maps 核对位置和评分
- [x] 114 条徒步路线按 OpenStreetMap 真实步道画出，标出步道口；行程地图显示真实开车路线，可以看全程（每天一种颜色）或某一天
- [x] 热度排名：按 Google Maps 评论数在每个公园内排名（2026-09-23 / 09-24 快照），卡片上显示 Google 评分和评论数，默认按热度排序
- [x] 公园特色介绍，按园内片区分组
- [x] 行程规划：加入行程 → 设日期和天数 → 自动排好每天几点到哪、开车多久
- [x] 按当天日出日落安排日出 / 日落景点，提示季节性关闭、许可证、天黑还在徒步、安排太满
- [x] 手动调整（拖拽排序、换天、完成 / 跳过），按实际进度重排剩余行程
- [x] 住宿：每晚住哪（推荐园内酒店和门户小镇，或搜任意酒店 / 地址），车程从住处算起，一键按车程安排住宿
- [x] 自动生成攻略：只填公园（可以加上顺路的公园）、月份（或具体日期）、天数、从哪出发 / 回到哪（机场或任意地址）、节奏、住宿偏好，自动挑景点、排每天、定每晚住处（附备选和最近的民宿区、Airbnb 链接），列出这个月的特别活动、要提前预约的、不开放的景点（附原因）和没排进去的景点
- [x] 行程里点任何一个景点展开详情：照片、热度和 Google 评分、停留时间、徒步数据、开放情况、简介和实用提示；添加景点前也能先看详情
- [x] 特别活动和开放情况：公园页列出特别活动（月份、预约方式、2026 年情况），目前关闭和季节性开放的景点都写明原因、大概什么时候开、有什么替代
- [x] 导航：页头的“公园”菜单按片区列出所有公园（手机上是全屏菜单，标出当季）；公园页和行程页有吸顶的区块导航，行程页每天一项、滚动时高亮当前区块；公园页可以一键用这个公园生成攻略；长页面有“回到顶部”
- [x] 非居民附加费：标出同车有人持有效年卡（美国居民年卡、非居民年卡或本公园年卡）整车免收
- [x] 首页：开场动画、各公园全屏轮播、公园目录（悬停换图）、当季推荐、美国西部线描地图（阿拉斯加小图）；整站换成纸色底 + 衬线标题的杂志风格
- [x] 实时信息：NPS 公告（附中文机器翻译，原文一起显示）、门票、周边充电桩（含可靠度标记）
- [x] 行程里的实时信息：NPS 公告对到具体景点（显示在那天那个景点下面）；16 天内按天的天气预报和 NWS 预警（高温、雷暴、下雪、严寒、大风），更远或只定了月份时显示往年同期
- [x] 补给：每晚住处附近的超市、加油站、快充、亚洲超市和餐厅，进每个公园前的最后补给；地图上可以叠加补给点
- [x] 机票和租车：按行程的进出机场和日期查机票（配了 SerpApi 用 SerpApi，否则自用低频抓取 Google Flights），比较附近机场（车程 + 价格），租车给参考价和 Kayak / Expedia 链接，异地还车提醒
- [x] 预算：门票（逐个买还是买年卡，含非居民附加费）、住宿和吃饭（GSA 标准）、油费 / 电费（按真实路线公里数）、租车、机票，合计和人均
- [x] 打印 / 存 PDF、离线保存（PWA，构建版可用）
- [x] 什么时候去：选出发日期或月份，16 个公园分成最适合、可以去、不太合适，每座写明原因
- [x] 博主同款路线：49 条 YouTube / B 站路线（16 个公园；中文博主 20 条，美国、日本、韩国、欧洲和拉美博主 29 条），按公园和语言筛选，可以一键照着排行程；景点卡片上显示博主评价
- [x] 价格页：不排行程也能单独查机票（比较公园附近的几个机场）、各机场租车参考价、各州实时油价和油费计算；行程预算的油费也用实时油价

### v2 差异化

- [ ] 日期开放：选日期 → 哪些路、区域、设施开放（历年开关日期 + NPS 实时 alerts），需要哪些预约 / permit
- [ ] 补能地图：手机信号；桩的可靠度评分 + 打卡（能用 / 坏了 / 找不到）（充电桩和加油站已经能画到行程地图上）
- [ ] 亚洲补给补漏：OSM 的亚洲超市很不全，要 Google Places 补漏 + 人工校对（基础版已在行程页的补给里）
- [ ] 根据实际打卡学习个人配速，自动调整后续时间估算
- [ ] 离线地图：现在只缓存看过的瓦片，出发前按行程范围预先下载

### v3 机票 / 租车

- 自用阶段：脚本低频抓取（如 fast-flights）+ 缓存；临时查询让 Claude 操作浏览器
- 公开后：换成付费或合作数据源（如 SerpApi、affiliate 接口）
- 价格数据源单独抽成一层，换源不影响上层

## 数据源

| 用途 | 来源 | Key |
|---|---|---|
| 公园信息、alerts、门票、things to do | NPS API（`developer.nps.gov`） | api.data.gov |
| 充电桩（含 Tesla） | NLR Alternative Fuel Stations API（`developer.nlr.gov`；旧域名 `developer.nrel.gov` 已于 2026-05-29 停用） | api.data.gov |
| 露营地、permit 设施信息 | Recreation.gov RIDB | 单独申请 |
| 天气预报、往年同期 | Open-Meteo（预报 16 天；历史 ERA5，CC BY 4.0） | 不需要 |
| 天气预警 | NWS（`api.weather.gov`） | 不需要 |
| 空气质量 / 山火烟雾 | AirNow API | 单独申请 |
| 油价 | AAA 各州均价（自用阶段 12 小时读一次 AAA 页面，读不到用 2026-09-26 快照）；以后可换 EIA API | 不需要 |
| 公告翻译 | DeepL API Free（每月 50 万字符）；没配就用 MyMemory（免费，匿名每天约 5,000 字符），自用阶段再退到 Google 网页翻译 | DeepL 可选 |
| 机票 | 自用阶段低频抓取 Google Flights 结果页；配了 key 用 SerpApi | SerpApi 可选 |
| 租车 | Kayak 各机场参考价（2026-09-26 手动快照）+ 比价链接 | 不需要 |
| 博主路线 | YouTube / B 站公开视频的文稿、简介、章节（转述 + 链接；外语视频翻译后转述） | 不需要 |
| 餐饮、住宿成本基准 | GSA Per Diem API | api.data.gov |
| 景点坐标、加油站、亚洲超市等 POI | OpenStreetMap（Overpass） | 不需要 |
| 景点照片 | Wikimedia Commons（按授权署名） | 不需要 |
| 车程 | OSRM 公共服务（景点和推荐住宿预先生成车程表；自定义住处在浏览器里实时查） | 不需要 |
| 搜索酒店 / 地址 | Photon（基于 OpenStreetMap） | 不需要 |
| 徒步路线 | Valhalla 公共服务（FOSSGIS），OpenStreetMap 步道 | 不需要 |
| 热度、评分 | Google Maps 评分和评论数（自用阶段在浏览器里手动快照）；公开后换 Google Places API | 公开后需要 Google Cloud |
| 地图底图 / 地形 / 卫星 | OpenFreeMap、AWS Terrain Tiles、USGS The National Map | 不需要 |
| 首页线描地图 | Natural Earth 州界（公共领域） | 不需要 |
| 字体 | Google Fonts（Cormorant Garamond、Jost、思源宋体），next/font 构建时下载、自托管 | 不需要 |

## 注意事项

- NPS API 只有"现在"的状态，季节性开放规律要自己整理历年数据；部分字段（如 trail 时长、Yosemite 路况）是空的
- NLR 充电桩数据里有"暂时不可用"和很久没确认的站，要做可靠度评分
- OSM 亚洲超市数据有误报（地名 Chinese Camp、China Peak 滑雪场）和漏报（Fresno、Visalia 一家没有），需要 Google Places 补漏 + 人工校对
- Google 评分和评论数目前是手动快照，不会自动更新。Google 条款不允许复制保存这些数据，自用可以；公开上线前要换成 Google Places API 实时查询（按字段计费，除 place_id 外不能长期缓存，要署名），或者去掉数字只留跳转链接
- 同一景点在 Google 上常分成景点、步道口、观景台几个条目，评论分散；快照取评论最多的条目。从观景台出发的步道（比如从日落点下去的纳瓦霍环线）评论容易记在观景台上，名次会偏低。游客中心和园外景点（比如 Jackson 镇广场）不参与排名
- 景点的临时关闭、特别活动的日期和价格是 2026 年 9 月 24 日查的（关闭说明在 `closedNote`，其他写在提示里），之后要复查：
  - 目前关闭（`openMonths: []`）：火山口湖 Cleetwood Cove 步道 2026–2028 年重建（湖上游船也停）、锡安守望者步道维修、优胜美地奇尔努阿尔纳瀑布（Dome Fire）
  - 大峡谷 2026 年 8 月 29 日山洪：幻影牧场、North Kaibab、South Kaibab 的 Tip-Off 以下关闭，峡谷里没有饮用水，南缘园内酒店暂停过夜接待，预计感恩节前后恢复供水
  - 优胜美地 Glacier Point Road 9 月 23 日起因 Dome Fire 临时封闭、雾径上段 10 月底前按日期开放；雷尼尔山 Sunrise 路因山火关闭；奥林匹克 Hoh River 桥 9 月 24 日到 10 月 13 日分三段全封、Rialto Beach 10 月 15 日前封路；大提顿 Moose-Wilson Road 北段 9 月 8 日到 11 月 15 日封闭、杰克逊湖水位低游船提前停航；德纳里巴士 2026 年只到 Mile 43
  - 长期：Carbon River / Mowich Lake 因 Fairfax 桥关闭而没收录、黄石 Biscuit Basin 2024 年水热爆炸后关闭、死亡谷 Darwin Falls 的砾石路冲毁（要从 190 号公路走进去）
- 海峡群岛只能坐船上岛，每个岛按一整天的行程算，出发点是 Ventura 码头；船票要提前在 Island Packers 订
- 车程都按自驾算。大峡谷 Hermit Road（3–11 月）和 South Kaibab 步道口、锡安峡谷景观道（班车季）不能开私家车，只能坐园内免费班车，实际花的时间会比行程里长，以后要把班车算进去
- 不爬小红书（没有 API，有法律风险）；博主内容只做摘要 + 链接 / 嵌入
- 博主路线（`src/data/creators.ts`）是 2026-09-26 整理的：中文 YouTube 视频多数读了“内容转文字”的文稿；外语视频整理时 YouTube 的文稿接口返回 400（不绕过），只按简介和章节整理，章节名起得很文艺的（比如 Kay & ZooKatsu）地点是我们按顺序对应的；国籍没核实的博主只标语言；Reddit 在内置浏览器里打不开、X 搜索要登录、4travel 拒绝访问，暂时都没收。B 站视频大多只有标题、标签和很短的简介（AI 字幕要登录，不登录），信息少的会标明；内容是转述，不照抄原话。播放量是快照
- 机票自用抓取只在点“查机票价格”时请求，同一查询缓存 6 小时、两次间隔至少 3 秒；页面结构变了或者被拦就返回空，只给链接。开发模式默认开，部署后要设 `SELF_USE_SCRAPE=1`（旧名 `PRICE_SCRAPE` 也认）才开，这个开关也管 AAA 实时油价和 Google 网页翻译；公开上线前换成 SerpApi 等正式接口
- 租车参考价是手动快照，淡旺季差很多，只当参考；洛杉矶最便宜的几家是机场外的小公司。油价读不到 AAA 时用 2026-09-26 的快照
- 公告翻译是机器翻译，质量一般（MyMemory 常把地名直译，比如 Mormon Row），以原文为准；配 DeepL 免费 key 会好很多。同一段原文只翻一次、缓存 30 天；MyMemory 额度用完或被限流后暂停 6 小时，译不出来就只显示原文
- 预算里的住宿、餐饮用 GSA 联邦出差标准，旺季和园内酒店通常更贵；阿拉斯加（德纳里）不在 GSA 范围里，按其他几晚平均估

## 待办

- [ ] 申请 api.data.gov 免费 key：https://api.data.gov/signup/ （NPS、NLR、GSA 通用；DEMO_KEY 每小时只有 30 次）
- [ ] （可选）申请 SerpApi 免费 key：https://serpapi.com （每月 250 次，机票价格更稳定，部署后也能用）
- [x] 初始化项目骨架：Next.js 16 + TypeScript + Tailwind
- [ ] 部署到 Vercel；需要存数据时再上 Postgres + PostGIS（如 Supabase）
