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
| `src/proxy.ts`、`src/lib/site-auth.ts`、`src/app/[locale]/login/`、`src/app/api/login/` | 访问密码：设了 `SITE_PASSWORD`，没登录的页面跳到登录页、接口返回 401；登录后存一个一年有效的 HttpOnly cookie（值是密码的哈希，改密码就全部失效）。图标、manifest、service worker 这些静态文件不拦 |
| `src/i18n/` | 界面文案。简体撰写，繁体用 OpenCC 自动转换（台湾用语，“米”转“公尺”） |
| `src/data/parks.ts` | 所有公园：特色介绍、园内片区、定位点、时区、常用机场、常一起玩的公园（`nearby`）、非居民附加费、住宿建议。`kind: "site"` 是园外名胜（羚羊峡谷、马蹄湾、纪念碑谷、波浪谷），页面上和国家公园分开列；`country: "CA"` 是加拿大的公园；`agency` 写归谁管 |
| `src/data/fees-manual.ts` | NPS 门票接口里没有的门票：加拿大的国家公园（按天收、加元，汇率 `CAD_TO_USD`）和园外名胜（部落公园、BLM、城市停车场）；预算里按一车和按人取便宜的 |
| `src/data/activities.ts` | 各公园的特别活动、节庆和季节现象（火瀑布、天文节、游船、漂流、骑马……）：月份、怎么预约、2026 年的特殊情况 |
| `src/data/airports.ts` | 各公园常用机场的位置，自动生成攻略时当出发 / 回程地 |
| `scripts/build-asian-groceries.py`、`scripts/asian-names.mjs`、`scripts/data/asian-groceries.json` | 亚洲超市补漏：Python + duckdb 读 Overture Maps 的地点数据，按 `asian-names.mjs` 的店名规则（OSM 那边也用它）挑出各公园补给范围里和常用机场附近的亚洲超市，人工排除的写在 EXCLUDE；结果存成 JSON 提交进仓库，`data:services` 合并时不需要 Python |
| `src/data/attractions/` | 每个公园一个文件的景点数据；`*.generated.ts` 由脚本生成，不要手改；`google.ts` 是 Google Maps 评分和评论数的手动快照；`route-fixes.ts` 修正 OSRM 明显估错的个别砂石路车程 |
| `src/data/lodging.ts` | 各公园的推荐住宿：园内酒店、门户小镇和民宿区（`rental`，Airbnb 整套房子集中的地方）；有 `airbnb` 地名的会按行程日期生成 Airbnb 搜索链接；车程已算进车程表 |
| `src/lib/planner.ts` | 排行程：公园内按路线排序 → 按天切分（让最累的一天尽量轻松）→ 当天按日出日落排顺序；早上从前一晚住处出发、晚上回当晚住处都算进去；班车季私家车开不进去的景点按“开到换乘点 + 等车 + 坐车”算，赶不上末班车会提醒 |
| `src/data/roads.ts`、`src/lib/roads.ts` | 季节性山路（Tioga Road、冰川点路、向阳大道洛根山口段、20 号公路山口段、雷尼尔山两个山口）：路名、说明、要走这条路的景点；历年开通、关闭日期在 `roads.generated.ts`。按最近 20 个正常年份（疫情、修路的年份不算）算出某一天往年通车的比例：8 月 15 日前按开通算，之后按关闭算，当年已经知道的按当年说。行程里每天第一个要走这条路的景点下面说一次，不到一半的年份通车用警告色、总览里提醒并建议挪到把握大的那天；定了日期的自动生成攻略按出发这几天里把握最大的一天挑，不到一半就不排。`attractions` 是路通了就能去的（定了日期不再按开放月份算），`afterRoad` 是路通了还要等步道化雪的（两个都看）。公园页画出最近 15 年每年的通车时段 |
| `src/data/shuttles.ts`、`src/lib/shuttle.ts` | 班车季只能坐班车的路（锡安峡谷景观道、大峡谷 Hermit Road 和 Kaibab Rim、马里波萨巨杉林、红杉 Moro Rock 周末、班夫梦莲湖、Kennecott……）：季节、首末班车（有的跟着日落走）、每站坐多久、换乘点在哪；同一站的几个景点之间按走路算；`carFree` 的线（Kennecott）连住处也不通车，住在线上的去线外也要先坐回换乘点。数据由研究整理，时刻表年份写在 `scheduleYear` |
| `src/data/bookings.ts`、`src/lib/booking.ts` | 要提前订的：园内住宿、营地、许可证抽签、入园预约、船票和团，各自的开放规则（滚动开放、每月整段放、按季抽签、按月抽签、提前几天、固定日期）；按行程日期算出哪天开订、还剩几天，生成 .ics 日历提醒。针对没收录的地方（营地等）的规则只在公园页列出 |
| `src/lib/generate-trip.ts` | 自动生成攻略：可以几个顺路的公园一起排（比如盐湖城进出，先大提顿再黄石）。按月份去掉关闭和要抽签的景点（要订票的照排、提醒提前订），按必去、热度、当月最佳和节奏挑景点，路线从出发地排到回程地，再按车程和住宿偏好（不限 / 酒店 / 民宿）选每晚住处；太满的一天去掉最不重要的景点，有空的天再补 |
| `src/lib/trip-store.ts` | 行程（含每晚住处）存在浏览器 localStorage，自用阶段不需要账号 |
| `src/lib/trip-share.ts`、`src/components/plan/trip-share.tsx` | 电脑和手机之间传行程：整个行程压缩（fflate）后放在链接的 `#trip=` 里，附二维码，打开链接先问要不要换掉现在的行程；也能导出、导入 JSON 文件 |
| `src/components/plan/today-panel.tsx`、`src/lib/use-now.ts` | “今天”模式：出发后打开行程页，最上面是今天的下一站、按现在的时间推算的到达时间、日落倒计时、导航链接；到了点“到了”（记下到达时间，按停够了再走推算后面），走的时候点“走了”（这一站完成） |
| `src/lib/personal-pace.ts` | 个人配速：两次打卡之间就是实际停留，和估算比出倍数；徒步至少 2 站、其他景点至少 3 站才算，各取中位数（忘了点“走了”这种偶尔的离谱数字影响不大），限制在 0.6–1.8 倍，和 1 差不到 0.1 不调整。还没去的景点按这个倍数算停留（行程卡片上附原估算），重排、“今天”的推算都用它；“今天”面板里可以改回原来的估算（存在出行设置的 `usePace`） |
| `src/lib/offline-maps.ts`、`src/components/plan/offline-maps.tsx` | 出发前下载离线地图：按每天去的范围算出要下载的地图瓦片和景点照片，交给 service worker 存进单独的缓存（不会被自动清理） |
| `src/lib/geocode.ts`、`src/lib/osrm-client.ts` | 自定义住处：Photon 搜酒店 / 地址，OSRM 在浏览器里算到各景点的车程 |
| `src/lib/nps.ts`、`src/lib/nlr.ts` | NPS 公告和门票、NLR 充电桩 |
| `src/app/api/` | 接口：`alerts`（行程里几个公园的 NPS 公告，带中文翻译）、`weather`（Open-Meteo 16 天预报 + NWS 预警）、`prices/flights`（机票价格）、`prices/gas`（各州油价）、`services/[park]` 和 `gallery/[park]`（构建时生成的静态 JSON） |
| `src/lib/alert-match.ts`、`src/lib/weather.ts` | 公告按景点英文名 / 片区对到行程景点（关闭类只看标题）；天气预报和预警 |
| `src/lib/prices/` | 价格数据源一层：`serpapi.ts`（配了 key 用）、`google-flights.ts`（自用低频抓取，缓存 6 小时）、`google-tfs.ts`（Google Flights 链接参数）、`links.ts`（Kayak / Expedia 比价链接）、`car-rates.ts`（Kayak 租车参考价快照）、`fuel.ts`（AAA 各州油价快照，加拿大两省用 finder.com 的省均价换算）、`gas.ts`（AAA 实时油价，12 小时读一次，读不到用快照） |
| `src/lib/translate.ts`、`src/lib/alert-translate.ts` | NPS 公告翻成中文：DeepL（配了 key）→ MyMemory（免费）→ Google 网页翻译（仅自用）；页面上中文和原文一起显示，注明是机器翻译 |
| `src/lib/self-use.ts` | 自用阶段的抓取开关（Google Flights 机票、AAA 油价、Google 网页翻译）：开发模式默认开，部署后设 `SELF_USE_SCRAPE=1` 才开 |
| `src/components/prices/` | 价格页：机票（可以一次比较某个公园附近的几个机场）、各机场租车参考价、公园所在各州的油价和油费 / 电费计算 |
| `src/components/plan/` | 行程页：每天的卡片（天气、公告、班车）、总览、要提前订的（`trip-bookings.tsx`）、攻略说明、补给、机票和租车、预算（`budget.ts` 计算）、打印和离线保存 |
| `src/data/creators.ts` | 博主同款路线：YouTube / B 站视频（中文、英语、日语、韩语、西语、法语、意语、德语博主）按文稿、简介或章节整理的路线、季节、对景点的评价和提醒，景点卡片上显示“博主怎么说” |
| `src/lib/seasons.ts` | 什么时候去：按月份整理每个公园能去的景点比例、去不了的必去景点、往年同期天气和特别活动，页面按出发日期打分 |
| `public/sw.js`、`src/app/manifest.ts` | 离线：构建版注册 service worker，缓存看过的页面、脚本、接口数据和地图瓦片；可以装到手机主屏 |
| `src/components/map/park-map.tsx`、`sources.ts` | MapLibre 地图：OpenFreeMap 底图 + 地形阴影 + 卫星图（美国用 USGS，加拿大用 EOX Sentinel-2）+ 3D 地形，都不需要 key |
| `src/app/globals.css` | 设计基调：纸色底、墨色字、砂岩红强调色；标题 Cormorant Garamond + 思源宋体，正文 Jost；开场动画、滚动渐显 |
| `src/components/home/` | 首页：开场动画、全屏轮播、公园目录、线描地图（`src/data/map.generated.ts`） |
| `src/components/site/` | 页头（压在大图上时透明，滚动后变纸色）、页脚、滚动渐显 |

## 部署

推荐 Vercel（个人用免费，推送到 GitHub 自动部署）：Vercel 用 GitHub 登录 → Add New → Project → 导入这个仓库 → 填环境变量 → Deploy。构建命令、输出目录都用默认的（`npm run build` 前会自动复制 MapLibre worker）。

| 环境变量 | 部署时 |
|---|---|
| `SITE_PASSWORD` | 建议设。部署后的网址是公开的，而自用阶段的 Google Maps 评分快照、自用抓取都不适合公开 |
| `DATA_GOV_API_KEY` | 基本必填。`DEMO_KEY` 按 IP 限次数，Vercel 的出口 IP 是很多网站共用的 |
| `SELF_USE_SCRAPE` | 设了密码、只有自己用时才设成 `1`。Google 对云服务器的请求拦得更严，机票价格可能查不到，查不到就只给比价链接 |
| `DEEPL_API_KEY`、`SERPAPI_API_KEY` | 可选。MyMemory 的免费额度也是按 IP 算的，部署后翻译更容易用完，配 DeepL 更稳 |

- 手机上用：HTTPS 下 service worker 才能注册，所以离线功能要部署后才有；iPhone 用 Safari“添加到主屏幕”，安卓用 Chrome“安装应用”。
- 在微信里直接点 `*.vercel.app` 的链接可能会被拦，用手机浏览器打开，或者给项目绑一个自己的域名。
- `vercel.app` 在中国大陆经常打不开；自用阶段人在美国不受影响，以后要给国内用户用，需要国内的服务器和备案（见下一节）。
- 本机和手机连同一个 Wi-Fi 时也能临时看：`npm run build && npm run start`，手机打开 `http://电脑的局域网 IP:3000`。前提是电脑把这个网络设成“专用网络”并允许 Node.js 通过防火墙；公共 Wi-Fi 下别这么做。这种方式是 HTTP，离线功能不可用。

## 以后做成微信小程序

小程序不是把网站“放上去”，而是微信里另一套运行环境（WXML / WXSS / JS，没有浏览器的 DOM），现在的 Next.js 网站不能直接变成小程序。有两条路：

1. **套壳（web-view 里嵌网页）**：改动最少，但限制很多。个人主体的小程序不能用 web-view，只有企业、组织主体可以；嵌的网页要配成“业务域名”，域名必须完成 ICP 备案，这意味着服务器要放在中国大陆（Vercel 不行）；网页在国内打开，还会碰到下面说的地图和照片问题。
2. **用 Taro 重写界面（推荐）**：[Taro](https://taro.zone) 可以用 React 写、编译成微信小程序。能直接搬过去的是纯数据和纯逻辑：`src/data/`（公园、景点、住宿、活动）、`src/lib/planner.ts`、`generate-trip.ts`、`seasons.ts`、预算计算等；要重写的是所有界面组件、地图、存储和网络请求。

走第 2 条路的步骤：

1. **注册小程序**（[mp.weixin.qq.com](https://mp.weixin.qq.com)）：选个人或企业主体。个人主体要中国大陆身份证实名的微信号；海外公司可以注册海外主体。
2. **小程序备案**：2023 年 9 月起，小程序上线前必须先在后台完成备案（个人要人脸核验）。
3. **选服务类目**：个人主体能选的类目有限，旅游类有些子类目要资质，以后台显示为准。
4. **开发**：
   - 地图：MapLibre 用不了，改用小程序自带的 `map` 组件（腾讯地图）。它的美国地图数据比较粗，徒步路线用 `polyline` 自己画。在国内展示地图要用有资质的图源，OpenFreeMap / OpenStreetMap 的瓦片不能直接用。
   - 数据：主包最多 2MB、全部分包加起来约 20MB。车程表、步道、补给点这些大数据要放到云存储，按需下载。
   - 存储：行程从 localStorage 改成 `wx.setStorage`；离线靠小程序自己的缓存，不需要 service worker。
   - 照片：Wikimedia Commons 在中国大陆打不开，要转存到自己的云存储或 CDN，并保留作者和授权署名。
   - 外链：小程序里不能直接打开 YouTube、B 站这些外部网页，博主视频改成“复制链接”。
5. **后端**：NPS 公告、天气、价格这些接口，放到[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)的云函数或云托管里（小程序只能请求后台配置过、而且备案过的域名，用云开发可以省掉自己备案域名这一步）。云开发按套餐收费。
6. **提交审核、发布**：用微信开发者工具上传代码，在后台提交审核，通过后发布。

工作量上，界面基本要重写，接近再做一遍现在网站的前端。建议自用阶段先用网页版（添加到主屏幕、离线可用）；真要给国内用户用时再做小程序，并先把排行程的逻辑整理成一个独立的包，让网站和小程序共用。

## 数据脚本

新增或修改景点、推荐住宿后，重新生成对应的数据（都是 `src/data/attractions/*.generated.ts`）：

```bash
npm run data:gallery     # 每个景点从 Wikimedia Commons 挑最多 6 张照片（photoFile 排第一），查缩略图、作者、授权
npm run data:travel      # 用 OSRM 按道路算各景点、住宿之间的车程；相邻公园（nearby）另算跨园直达的车程
npm run data:trails      # 按 trail 途经点，用 Valhalla 沿 OpenStreetMap 步道生成徒步路线
npm run data:map         # 首页线描地图：Natural Earth 州界、加拿大省界按 Albers 投影成 SVG，公园和城市位置一起算好
npm run data:asian       # 亚洲超市补漏：Overture Maps 的地点数据（要 Python 和 duckdb：pip install duckdb），写到 scripts/data/asian-groceries.json
npm run data:services    # 补给点：OSM 的加油站、超市、亚洲超市和餐厅 + NLR 快充，再合并上面 Overture 的亚洲超市（ONLY=grte,zion 只查几个公园，SKIP_OSM=1 只补快充，再加 SKIP_NLR=1 就只重新合并亚洲超市、不联网）
npm run data:climate     # 往年同期天气：Open-Meteo 历史数据 2016–2025 年按月平均，每个片区取离平均位置最近的景点
npm run data:fees        # 门票：NPS API feespasses（只查 NPS 管的公园，加拿大和园外名胜手写在 fees-manual.ts）
npm run data:perdiem     # 住宿和餐饮参考：GSA Per Diem（按住宿所在的县），阿拉斯加和加拿大不在范围内
npm run data:roads       # 季节性山路的历年开通、关闭日期：NPS（优胜美地、冰川）和 WSDOT 的历年表，今年的日期先补进脚本里的 FIXES
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

- [x] 景点地图：24 座美国国家公园、加拿大落基山 3 座国家公园和 4 处园外名胜，共 487 个景点（优胜美地 33 个、黄石 29 个、落基山 24 个），地图和列表联动；坐标、出发点、徒步数据、开放季节、许可证。酒店不算景点（历史酒店放在住宿里）
- [x] 景点图集：每个景点最多 6 张 Wikimedia Commons 照片，卡片里切换，点开全屏看（左右键 / 滑动切换）
- [x] 中英文对照（地图标签、卡片），一键到 Google Maps 核对位置和评分
- [x] 196 条徒步路线按 OpenStreetMap 真实步道画出，标出步道口；行程地图显示真实开车路线，可以看全程（每天一种颜色）或某一天
- [x] 热度排名：按 Google Maps 评论数在每个公园内排名（2026-09-23 / 09-24 快照，之后新加的公园在加入当天补查），卡片上显示 Google 评分和评论数，默认按热度排序
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
- [x] 什么时候去：选出发日期或月份，所有公园分成最适合、可以去、不太合适，每座写明原因
- [x] 博主同款路线：49 条 YouTube / B 站路线（涉及 23 座公园和名胜；中文博主 20 条，美国、日本、韩国、欧洲和拉美博主 29 条），按公园和语言筛选，可以一键照着排行程；景点卡片上显示博主评价
- [x] 价格页：不排行程也能单独查机票（比较公园附近的几个机场）、各机场租车参考价、各州实时油价和油费计算；行程预算的油费也用实时油价
- [x] 行程发到手机：链接和二维码（整个行程压缩在链接里，不经过服务器），也能导出、导入文件
- [x] “今天”模式：出发后打开行程页先看到今天的下一站、按现在时间推算的到达时间、日落倒计时和导航，到了点一下按实际进度重排
- [x] 出发前下载离线地图：按每天去的范围下载地图和景点照片，没信号也能看
- [x] 要提前订的：按行程日期算出园内住宿、营地、许可证抽签、入园预约、船票和团各自哪天开订、还剩几天、错过了还有什么机会，导出 .ics 日历提醒；公园页列出这个公园所有要提前订的和开放规则
- [x] 班车算进时间：班车季私家车开不进去的路（锡安峡谷景观道、大峡谷 Hermit Road 和 Kaibab Rim、马里波萨巨杉林、红杉 Moro Rock 周末、班夫梦莲湖、Kennecott 私营接驳车），车程按开到换乘点 + 等车 + 坐车算，赶不上末班车提醒；公园页列出班车的季节和首末班
- [x] 更多公园：犹他东部的拱门、峡谷地、圆顶礁，约书亚树、落基山、冰川，阿拉斯加的基奈峡湾、兰格尔–圣伊莱亚斯；加拿大落基山的班夫、贾斯珀、幽鹤（门票按天收、加元，卫星图换成 Sentinel-2，首页地图加上加拿大）；园外名胜羚羊峡谷、马蹄湾、纪念碑谷、波浪谷，和国家公园分开列，写明归谁管、怎么进

### v2 差异化

- [x] 季节性山路：6 条冬天封闭的山路按近 20 年的开通、关闭日期算“往年这一天通没通车”，行程里对到具体哪天、自动生成攻略按日期挑，公园页画出历年通车时段
- [ ] 日期开放（其余）：营地、游客中心、更多支路的历年开关日期（NPS 实时 alerts 已经对到行程里）
- [ ] 补能地图：手机信号；桩的可靠度评分 + 打卡（能用 / 坏了 / 找不到）（充电桩和加油站已经能画到行程地图上）
- [x] 亚洲补给补漏：OSM 的亚洲超市很不全，用 Overture Maps 的地点数据补（人工看过一遍，去掉标错的），各公园常用机场附近也各收最近的 5 家，行程页补给里有“落地后”
- [x] 根据实际打卡学习个人配速，自动调整后续时间估算：“今天”里到了、走了各点一下，徒步和其他景点分开学倍数
- [ ] 车程也按实际打卡校准（OSRM 在园区里偏乐观，路边停车、堵车都没算）

### v3 机票 / 租车

- 自用阶段：脚本低频抓取（如 fast-flights）+ 缓存；临时查询让 Claude 操作浏览器
- 公开后：换成付费或合作数据源（如 SerpApi、affiliate 接口）
- 价格数据源单独抽成一层，换源不影响上层

## 数据源

| 用途 | 来源 | Key |
|---|---|---|
| 公园信息、alerts、门票、things to do | NPS API（`developer.nps.gov`） | api.data.gov |
| 加拿大的公园、园外名胜 | Parks Canada、纳瓦霍部落公园（Navajo Nation Parks & Recreation）、BLM、佩吉市的官方页面：门票、班车、预约，手动整理（2026-09-28） | 不需要 |
| 充电桩（含 Tesla） | NLR Alternative Fuel Stations API（`developer.nlr.gov`；旧域名 `developer.nrel.gov` 已于 2026-05-29 停用） | api.data.gov |
| 露营地、permit 设施信息 | Recreation.gov RIDB | 单独申请 |
| 天气预报、往年同期 | Open-Meteo（预报 16 天；历史 ERA5，CC BY 4.0） | 不需要 |
| 天气预警 | NWS（`api.weather.gov`） | 不需要 |
| 季节性山路历年开通、关闭日期 | NPS 历年表（优胜美地 Tioga Road、冰川点路；冰川 Logan Pass）、WSDOT 山口历年表（Chinook、Cayuse、North Cascades Highway）；最近几年按官方新闻稿和当地新闻补 | 不需要 |
| 空气质量 / 山火烟雾 | AirNow API | 单独申请 |
| 油价 | AAA 各州均价（自用阶段 12 小时读一次 AAA 页面，读不到用 2026-09-26 快照）；加拿大两省用 finder.com 2026-09-22 的省均价快照；以后可换 EIA API | 不需要 |
| 公告翻译 | DeepL API Free（每月 50 万字符）；没配就用 MyMemory（免费，匿名每天约 5,000 字符），自用阶段再退到 Google 网页翻译 | DeepL 可选 |
| 机票 | 自用阶段低频抓取 Google Flights 结果页；配了 key 用 SerpApi | SerpApi 可选 |
| 租车 | Kayak 各机场参考价（2026-09-26 手动快照，新加公园的机场 09-28、09-29）+ 比价链接 | 不需要 |
| 博主路线 | YouTube / B 站公开视频的文稿、简介、章节（转述 + 链接；外语视频翻译后转述） | 不需要 |
| 餐饮、住宿成本基准 | GSA Per Diem API | api.data.gov |
| 景点坐标、加油站、亚洲超市等 POI | OpenStreetMap（Overpass） | 不需要 |
| 亚洲超市补漏 | Overture Maps places（AWS 上的公开 GeoParquet，duckdb 按范围读；CDLA Permissive 2.0，页面上注明来源） | 不需要 |
| 景点照片 | Wikimedia Commons（按授权署名） | 不需要 |
| 车程 | OSRM 公共服务（景点和推荐住宿预先生成车程表；自定义住处在浏览器里实时查） | 不需要 |
| 搜索酒店 / 地址 | Photon（基于 OpenStreetMap） | 不需要 |
| 徒步路线 | Valhalla 公共服务（FOSSGIS），OpenStreetMap 步道 | 不需要 |
| 热度、评分 | Google Maps 评分和评论数（自用阶段在浏览器里手动快照）；公开后换 Google Places API | 公开后需要 Google Cloud |
| 地图底图 / 地形 / 卫星 | OpenFreeMap、AWS Terrain Tiles、USGS The National Map（美国）、EOX Sentinel-2 cloudless（加拿大） | 不需要 |
| 首页线描地图 | Natural Earth 州界、省界（公共领域） | 不需要 |
| 字体 | Google Fonts（Cormorant Garamond、Jost、思源宋体），next/font 构建时下载、自托管 | 不需要 |

## 注意事项

- NPS API 只有"现在"的状态，季节性开放规律要自己整理历年数据；部分字段（如 trail 时长、Yosemite 路况）是空的
- NLR 充电桩数据里有"暂时不可用"和很久没确认的站，要做可靠度评分
- OSM 亚洲超市数据有误报（地名 Chinese Camp、China Peak 滑雪场）和漏报（优胜美地、红杉一带一家没有），用 Overture Maps 补：Overture 里大部分亚洲超市只标了 grocery_store，所以和 OSM 一样按店名认（规则在 `scripts/asian-names.mjs`，两边共用）；Overture 标成亚洲超市的里面也混着餐厅、咖啡馆、加油站小店、坐标放错的日本 7-Eleven，按名字排除或者写进 `build-asian-groceries.py` 的 EXCLUDE。Overture 的品牌字段常常不准（拉斯维加斯的店标着 Winnipeg 分店的品牌），只给“地名 (街名)”这种只写分店名的店加品牌
- Google 评分和评论数目前是手动快照，不会自动更新。Google 条款不允许复制保存这些数据，自用可以；公开上线前要换成 Google Places API 实时查询（按字段计费，除 place_id 外不能长期缓存，要署名），或者去掉数字只留跳转链接
- 同一景点在 Google 上常分成景点、步道口、观景台几个条目，评论分散；快照取评论最多的条目。从观景台出发的步道（比如从日落点下去的纳瓦霍环线）评论容易记在观景台上，名次会偏低。游客中心和园外景点（比如 Jackson 镇广场）不参与排名
- 景点的临时关闭、特别活动的日期和价格是 2026 年 9 月 24 日查的（关闭说明在 `closedNote`，其他写在提示里），之后要复查：
  - 目前关闭（`openMonths: []`）：火山口湖 Cleetwood Cove 步道 2026–2028 年重建（湖上游船也停）、锡安守望者步道维修、优胜美地奇尔努阿尔纳瀑布（Dome Fire）
  - 大峡谷 2026 年 8 月 29 日山洪：幻影牧场、North Kaibab、South Kaibab 的 Tip-Off 以下关闭，峡谷里没有饮用水，南缘园内酒店暂停过夜接待，预计感恩节前后恢复供水
  - 优胜美地 Glacier Point Road 9 月 23 日起因 Dome Fire 临时封闭、雾径上段 10 月底前按日期开放；雷尼尔山 Sunrise 路因山火关闭；奥林匹克 Hoh River 桥 9 月 24 日到 10 月 13 日分三段全封、Rialto Beach 10 月 15 日前封路；大提顿 Moose-Wilson Road 北段 9 月 8 日到 11 月 15 日封闭、杰克逊湖水位低游船提前停航；德纳里巴士 2026 年只到 Mile 43
  - 长期：Carbon River / Mowich Lake 因 Fairfax 桥关闭而没收录、黄石 Biscuit Basin 2024 年水热爆炸后关闭、死亡谷 Darwin Falls 的砾石路冲毁（要从 190 号公路走进去）
  - 9 月 28 日新加的公园：贾斯珀 Maligne Canyon 和 Mount Edith Cavell 因山火损毁 2026 年全年关闭（Cavell 的边坡修复排到 2026 年秋到 2027 年春，没有重开日期）；冰川 Two Medicine 片区 2026 年 9 月起施工封路，预计到 2027 年底甚至 2028 年，2027 年夏天能不能进还不知道；冰川向阳大道一般 6 月下旬到 7 月中才全线通车，洛根山口一带的景点按 7–10 月算
- 冰川 2026 年进园不用预约；7 月 1 日到 9 月 7 日洛根山口私家车限停 3 小时，Logan Pass 班车改成凭票（Recreation.gov，每张 $1）。2027 年会不会继续还没公布，预约规则按 2026 年写
- 园外名胜不是国家公园：羚羊峡谷只能跟纳瓦霍授权的向导团进，波浪谷要抽签，马蹄湾的停车场归佩吉市；这些地方都不收国家公园年卡，门票写在 `src/data/fees-manual.ts`
- 时区：艾伯塔省从 2026 年 11 月 1 日起全年固定在 UTC-6（不再拨回冬令时），时区数据库 2026c 版起才有这条规则，浏览器或 Node 的时区数据太旧的话，班夫、贾斯珀冬天的时间会差一小时。幽鹤所在的 Field 一带据说也跟着改了，但没找到 BC 省的官方说明，三座公园都按 `America/Edmonton` 算
- 阿拉斯加的基奈峡湾、兰格尔–圣伊莱亚斯是 2026-09-29 加的：Exit Glacier 路通常 10 月底到次年 5 月中不通汽车；峡湾游船大约 5–9 月，西北峡湾全天航线的月份是估计的；Kennecott 的私营接驳车没有公开时刻表，季节（5 月 25 日到 9 月 15 日）、间隔（45 分钟）和车程（20 分钟）都是按 NPS 的说明和选矿厂导览季估的；McCarthy Road 是 60 英里砂石路，多数租车公司的合同不允许开
- 海峡群岛只能坐船上岛，每个岛按一整天的行程算，出发点是 Ventura 码头；船票要提前在 Island Packers 订
- 车程按自驾算，班车季只能坐班车的路按班车算（`src/data/shuttles.ts`）。班车每站坐多久多是按官方全程时间和站间距离估算的；时刻表只有 2026 年的，之后的年份按同样的日期估算。德纳里公园路巴士本身就是一个景点（时长含坐车），没有再按班车算
- 季节性山路（`scripts/build-roads.mjs`）：冰川的历年表 2023 年以后没更新，2023–2025 年的关闭日期是按当地新闻补的（2024 年 10 月 17 日因结冰提前关，之后有没有短暂重开没查到）；冰川 2013 年政府停摆提前关、没记关闭日期，只算开通。每年秋天路都关了以后，把今年的开通、关闭日期补进 FIXES 再跑 `npm run data:roads`。优胜美地冰川点路 2026 年 9 月 23 日起因 Dome Fire 临时封闭，没算作季节关闭，写在说明里
- 预约规则（`src/data/bookings.ts`）是 2026-09-28 按官方页面整理的，没查到官方写明的就没收（比如 Yavapai Lodge 提前多久开订）；2027 年的季度抽签日期、Moraine Lake 班车开订日这类还没公布的，按 2026 年的写并在说明里注明
- 不爬小红书（没有 API，有法律风险）；博主内容只做摘要 + 链接 / 嵌入
- 博主路线（`src/data/creators.ts`）是 2026-09-26 整理的：中文 YouTube 视频多数读了“内容转文字”的文稿；外语视频整理时 YouTube 的文稿接口返回 400（不绕过），只按简介和章节整理，章节名起得很文艺的（比如 Kay & ZooKatsu）地点是我们按顺序对应的；国籍没核实的博主只标语言；Reddit 在内置浏览器里打不开、X 搜索要登录、4travel 拒绝访问，暂时都没收。B 站视频大多只有标题、标签和很短的简介（AI 字幕要登录，不登录），信息少的会标明；内容是转述，不照抄原话。播放量是快照
- 机票自用抓取只在点“查机票价格”时请求，同一查询缓存 6 小时、两次间隔至少 3 秒；页面结构变了或者被拦就返回空，只给链接。开发模式默认开，部署后要设 `SELF_USE_SCRAPE=1`（旧名 `PRICE_SCRAPE` 也认）才开，这个开关也管 AAA 实时油价和 Google 网页翻译；公开上线前换成 SerpApi 等正式接口
- 租车参考价是手动快照，淡旺季差很多，只当参考；洛杉矶最便宜的几家是机场外的小公司。油价读不到 AAA 时用 2026-09-26 的快照
- 公告翻译是机器翻译，质量一般（MyMemory 常把地名直译，比如 Mormon Row），以原文为准；配 DeepL 免费 key 会好很多。同一段原文只翻一次、缓存 30 天；MyMemory 额度用完或被限流后暂停 6 小时，译不出来就只显示原文
- 预算里的住宿、餐饮用 GSA 联邦出差标准，旺季和园内酒店通常更贵；阿拉斯加和加拿大不在 GSA 范围里，按其他几晚平均估（整趟都没有的话按每晚 $150、每人每天餐饮 $68）

## 待办

- [ ] 申请 api.data.gov 免费 key：https://api.data.gov/signup/ （NPS、NLR、GSA 通用；DEMO_KEY 每小时只有 30 次）
- [ ] （可选）申请 SerpApi 免费 key：https://serpapi.com （每月 250 次，机票价格更稳定，部署后也能用）
- [x] 初始化项目骨架：Next.js 16 + TypeScript + Tailwind
- [ ] 部署到 Vercel；需要存数据时再上 Postgres + PostGIS（如 Supabase）
