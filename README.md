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
| `src/app/[locale]/` | 页面。`zh-Hans` 简体、`zh-Hant` 繁体；`src/proxy.ts` 按浏览器语言跳转 |
| `src/i18n/` | 界面文案。简体撰写，繁体用 OpenCC 自动转换（台湾用语） |
| `src/data/parks.ts` | 7 个公园的基础信息：定位点、常用机场、是否收非居民附加费 |
| `src/lib/nps.ts` | NPS 公告、门票 |
| `src/lib/nlr.ts` | NLR 充电桩，含可靠度标记 |
| `src/components/park/` | 公园页的各个区块，接口失败时单独显示错误，不影响其他区块 |

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

### v1 按日期的公园知识库

- [x] 公园页骨架：实时公告、门票、周边充电桩（含可靠度标记）
- [ ] 日期开放：选日期 → 哪些路、区域、设施开放（历年开关日期 + NPS 实时 alerts），需要哪些预约 / permit
- [ ] 补能地图：充电桩（含 Tesla）、加油站、手机信号；桩的可靠度评分 + 打卡（能用 / 坏了 / 找不到）
- [ ] 亚洲补给：沿途中超、韩超、日超、东南亚超市，合口味的餐厅，"进园前最后补给点"
- [ ] 预算估算：门票（含非居民规则、年卡是否划算）、油 / 电、餐饮、住宿
- [ ] 特色与拍照点：每个公园 Top N，标注最佳季节和时段

### v2 行程规划 + 动态调整

- 行程项分硬约束（已订住宿、permit、timed entry）和软约束（trail、观景点），带优先级，重排只动软约束
- 根据实际打卡学习个人配速，自动重算后续行程
- LLM 出方案，程序校验车程、开放状态、日落时间、硬约束
- PWA 离线可用，每天预先算好 Plan B

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
| 加油站、亚洲超市、医院等 POI | OpenStreetMap Overpass | 不需要 |
| 评分、照片 | Google Places API | Google Cloud |
| 拍照热点 | Flickr / Wikimedia Commons 带坐标的照片 | 单独申请 |

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
