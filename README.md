# park-pilot

面向中文用户的美国国家公园旅行规划工具（项目代号，品牌名以后再定）。

按**日期**回答：公园里什么开了、要不要预约、去哪充电加油、去哪吃饭补给、大概花多少钱；出发后还能根据实际进度调整后面的行程。

## 开发

```bash
npm install
cp .env.example .env.local   # 填入 DATA_GOV_API_KEY；不填则用 DEMO_KEY（每小时 30 次）
npm run dev                  # http://localhost:3000
```

| 位置 | 内容 |
|---|---|
| `src/app/[locale]/` | 页面：首页、公园页 `parks/[code]`、行程页 `plan`。`zh-Hans` 简体、`zh-Hant` 繁体；`src/proxy.ts` 按浏览器语言跳转 |
| `src/i18n/` | 界面文案。简体撰写，繁体用 OpenCC 自动转换（台湾用语，“米”转“公尺”） |
| `src/data/parks.ts` | 7 个公园：特色介绍、园内片区、定位点、时区、常用机场、非居民附加费 |
| `src/data/attractions/` | 每个公园一个文件的景点数据；`*.generated.ts` 由脚本生成，不要手改 |
| `src/data/lodging.ts` | 各公园的推荐住宿：园内酒店 + 门户小镇，车程已算进车程表 |
| `src/lib/planner.ts` | 排行程：公园内按路线排序 → 按天切分（让最累的一天尽量轻松）→ 当天按日出日落排顺序；早上从前一晚住处出发、晚上回当晚住处都算进去 |
| `src/lib/trip-store.ts` | 行程（含每晚住处）存在浏览器 localStorage，自用阶段不需要账号 |
| `src/lib/geocode.ts`、`src/lib/osrm-client.ts` | 自定义住处：Photon 搜酒店 / 地址，OSRM 在浏览器里算到各景点的车程 |
| `src/lib/nps.ts`、`src/lib/nlr.ts` | NPS 公告和门票、NLR 充电桩 |
| `src/components/map/park-map.tsx` | MapLibre 地图：OpenFreeMap 底图 + 地形阴影 + USGS 卫星图 + 3D 地形，都不需要 key |

新增或修改景点、推荐住宿后，重新生成照片署名和车程表：

```bash
npm run data:photos   # 按 photoFile 到 Wikimedia Commons 查缩略图、作者、授权
npm run data:travel   # 用 OSRM 按道路算各景点之间的车程
```

`npm run dev` / `npm run build` 前会自动把 MapLibre 的 worker 文件复制到 `public/maplibre/`（v6 的 worker 是单独的 ES 模块，打包工具处理不了）。

## 目标用户

- 会中文的来美游客和在美华人：中国大陆、台湾、东南亚华人
- 以后扩展到日本、韩国（饮食口味、亚洲超市、自驾习惯相近）
- 内容用简体撰写，OpenCC 自动转繁体（台湾用语）；代码结构预留 ja / ko

## 当前阶段：自用优先

先做到自己出行真的会用，再给别人用。暂不做账号系统，不优先做 SEO。

## 首批公园

| 片区 | 公园 | NPS 代码 | 2026 非居民 $100/人附加费 |
|---|---|---|---|
| 加州 Sierra | Yosemite | `yose` | 是 |
| 加州 Sierra | Sequoia & Kings Canyon | `seki` | 是 |
| 拉斯维加斯出发 | Death Valley | `deva` | 否 |
| 拉斯维加斯出发 | Zion | `zion` | 是 |
| 拉斯维加斯出发 | Bryce Canyon | `brca` | 是 |
| 拉斯维加斯出发 | Grand Canyon | `grca` | 是 |
| 阿拉斯加 | Denali | `dena` | 否 |

## 路线图

### v1 基础功能：地图、景点、规划

- [x] 景点地图：7 个公园共 68 个景点，地图和列表联动；照片、坐标、出发点、徒步数据、开放季节、许可证
- [x] 公园特色介绍，按园内片区分组
- [x] 行程规划：加入行程 → 设日期和天数 → 自动排好每天几点到哪、开车多久
- [x] 按当天日出日落安排日出 / 日落景点，提示季节性关闭、许可证、天黑还在徒步、安排太满
- [x] 手动调整（拖拽排序、换天、完成 / 跳过），按实际进度重排剩余行程
- [x] 住宿：每晚住哪（推荐园内酒店和门户小镇，或搜任意酒店 / 地址），车程从住处算起，一键按车程安排住宿
- [x] 首页：主视觉、继续行程、本月适合去、公园分布地图、公园卡片一键加入必去景点
- [x] 实时信息：NPS 公告、门票、周边充电桩（含可靠度标记）

### v2 差异化

- [ ] 日期开放：选日期 → 哪些路、区域、设施开放（历年开关日期 + NPS 实时 alerts），需要哪些预约 / permit
- [ ] 补能地图：充电桩和加油站画到地图上、手机信号；桩的可靠度评分 + 打卡（能用 / 坏了 / 找不到）
- [ ] 亚洲补给：沿途中超、韩超、日超、东南亚超市，合口味的餐厅，"进园前最后补给点"
- [ ] 预算估算：门票（含非居民规则、年卡是否划算）、油 / 电、餐饮、住宿
- [ ] 根据实际打卡学习个人配速，自动调整后续时间估算
- [ ] PWA 离线可用（公园里经常没信号）

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
| 天气预警 | NWS（`api.weather.gov`） | 不需要 |
| 空气质量 / 山火烟雾 | AirNow API | 单独申请 |
| 油价 | EIA API | 单独申请 |
| 餐饮、住宿成本基准 | GSA Per Diem API | api.data.gov |
| 景点坐标、加油站、亚洲超市等 POI | OpenStreetMap（Overpass） | 不需要 |
| 景点照片 | Wikimedia Commons（按授权署名） | 不需要 |
| 车程 | OSRM 公共服务（景点和推荐住宿预先生成车程表；自定义住处在浏览器里实时查） | 不需要 |
| 搜索酒店 / 地址 | Photon（基于 OpenStreetMap） | 不需要 |
| 地图底图 / 地形 / 卫星 | OpenFreeMap、AWS Terrain Tiles、USGS The National Map | 不需要 |
| 评分 | Google Places API | Google Cloud |

## 注意事项

- NPS API 只有"现在"的状态，季节性开放规律要自己整理历年数据；部分字段（如 trail 时长、Yosemite 路况）是空的
- NLR 充电桩数据里有"暂时不可用"和很久没确认的站，要做可靠度评分
- OSM 亚洲超市数据有误报（地名 Chinese Camp、China Peak 滑雪场）和漏报（Fresno、Visalia 一家没有），需要 Google Places 补漏 + 人工校对
- Google Places 按字段计费；除 place_id 外不长期缓存，按要求署名
- 不爬小红书（没有 API，有法律风险）；博主内容只做摘要 + 链接 / 嵌入

## 待办

- [ ] 申请 api.data.gov 免费 key：https://api.data.gov/signup/ （NPS、NLR、GSA 通用；DEMO_KEY 每小时只有 30 次）
- [x] 初始化项目骨架：Next.js 16 + TypeScript + Tailwind
- [ ] 部署到 Vercel；需要存数据时再上 Postgres + PostGIS（如 Supabase）
