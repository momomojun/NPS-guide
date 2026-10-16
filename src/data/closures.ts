// 临时关闭：施工、山洪、山火、火山活动这类不是每年都有的封路、封步道（每年冬天封的季节性山路在 roads.ts，开放月份写在景点的 openMonths）。
// 自动生成攻略排到关着的日子就不排、写明原因；手动排的行程在那天那个景点下面提醒；公园页“开放情况”里列出来。
// 2026-10-13 按 NPS 公告（alerts 接口的 Park Closure 和各公园 Current Conditions 页面）、Parks Canada 公告逐个核对过；
// 之后每过几周再核对一次，重开了就把 reopen 改成重开那天（或者整条删掉），checked 改成核对的日期。

export interface TempClosure {
  /** 关闭的景点 id */
  attractions: string[];
  /** 从哪天起关（这天起去不了） */
  from: string;
  /** 预计哪天重开（这天起能去）；null 是没公布 */
  reopen: string | null;
  /**
   * 重开时间没公布、但肯定要很久的（要修好几年的工程、山火后的边坡）：一直当关着。
   * 不填的话，核对那天起 UNKNOWN_REOPEN_DAYS 天内当关着，再往后只提醒“可能还关着，出发前看公告”
   */
  longTerm?: boolean;
  /**
   * 只在每周这几天关（0 是星期日）：大烟山 Cades Cove 环路 5–9 月每个周三不让车进。
   * 不填就是 from 到 reopen 之间天天关。每年都有、但下一年还没公布的，按往年的规律另写一条
   */
  weekdays?: number[];
  /** 为什么关、有什么替代 */
  reasonZh: string;
  source: string;
  /** 最后核对的日期 */
  checked: string;
}

/** 没公布重开时间的临时关闭，核对后这么多天内当关着 */
export const UNKNOWN_REOPEN_DAYS = 90;

export const tempClosures: TempClosure[] = [
  {
    attractions: ["zion-watchman-trail"],
    from: "2026-08-31",
    reopen: null,
    reasonZh:
      "守望者步道 2026 年 8 月底起因维修关闭，重开日期未定；可以改走同样从游客中心出发、几乎没有坡的帕鲁斯步道，或坐班车去河滨步道。",
    source: "https://www.nps.gov/zion/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["badl-notch-trail"],
    from: "2026-08-31",
    reopen: null,
    reasonZh:
      "Notch 步道和步道两侧 30 米内全部封闭，NPS 在修已经不安全的那段木梯，没有公布重开日期；可以改走同一个停车场的 Door、Window 步道，或者去 Saddle Pass 爬一段恶地之墙。",
    source: "https://www.nps.gov/badl/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["meve-far-view-sites"],
    from: "2026-09-17",
    reopen: null,
    reasonZh:
      "去 Far View Sites 和 Cedar Tree Tower 的支路因道路施工封闭，车辆和行人都不能进；可以去 Mesa Top Loop 看同样是台地顶村落的半地穴屋和 Mesa Top Sites。",
    source: "https://www.nps.gov/meve/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["cave-walnut-canyon-drive"],
    from: "2022-08-01",
    reopen: null,
    longTerm: true,
    reasonZh:
      "2022 年 8 月的山洪冲毁了这条砂石路，NPS 计划重新设计更耐冲刷的路基，施工排在联邦 2027 财年，重开时间未定；可以改去进园公路边的胡桃峡谷观景台，或走游客中心旁的奇瓦瓦沙漠自然步道。",
    source: "https://www.nps.gov/cave/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["crla-cleetwood-cove"],
    from: "2026-01-01",
    reopen: "2029-07-01",
    longTerm: true,
    reasonZh:
      "唯一能下到湖边的步道和码头整体重建、全线关闭，NPS 预计 2029 年夏季重开，这期间没有湖上游船，也上不了巫师岛；可以改走守望者峰、加菲尔德峰或斯科特山步道从高处看湖。",
    source: "https://www.nps.gov/crla/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["jasp-maligne-canyon"],
    from: "2024-07-24",
    reopen: null,
    longTerm: true,
    reasonZh:
      "2024 年山火后峡谷两侧山坡不稳，从第一桥停车场到第五桥路口一段禁止进入，重开时间未定（冬季的峡谷冰上徒步也去不了）；可以改去同在玛琳湖路上的药湖和玛琳湖。",
    source: "https://parks.canada.ca/pn-np/ab/jasper",
    checked: "2026-10-13",
  },
  {
    attractions: ["jasp-mount-edith-cavell"],
    from: "2024-07-24",
    reopen: null,
    longTerm: true,
    reasonZh:
      "2024 年山火后 Cavell 路两侧山坡不稳，车辆和行人都不能进，冰川之路和 Cavell 草甸步道也关闭；Parks Canada 计划 2026 年秋到 2027 年春加固边坡，重开时间以公告为准。可以改去冰原大道上的阿萨巴斯卡冰川。",
    source: "https://parks.canada.ca/pn-np/ab/jasper",
    checked: "2026-10-13",
  },
  {
    attractions: ["whsa-interdune-boardwalk"],
    from: "2024-04-01",
    reopen: null,
    longTerm: true,
    reasonZh:
      "2024 年 4 月一架 F-16 坠毁在园内，沙丘大道第 3–5.5 英里划为安全走廊（可以开车通过，但不能停车、下车），木栈道随之关闭，重开时间未定；可以改走沙丘生命自然步道、干湖步道，或直接开到沙丘中心。",
    source: "https://www.nps.gov/whsa/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["bibe-santa-elena-canyon", "bibe-hot-springs"],
    from: "2026-10-01",
    reopen: null,
    reasonZh:
      "山洪冲毁了路面：Cottonwood 营地到圣埃伦娜峡谷的铺装路、Hot Springs Road 都封着（Old Maverick Road、River Road 也封了），重开时间未定，开车到不了这两个步道口；可以去奇索斯盆地的 Window、Lost Mine 步道，或者 Boquillas 峡谷。",
    source: "https://www.nps.gov/bibe/planyourvisit/conditions.htm",
    checked: "2026-10-15",
  },
  {
    attractions: ["sagu-bajada-loop", "sagu-valley-view-overlook", "sagu-signal-hill"],
    from: "2026-09-11",
    reopen: null,
    reasonZh:
      "9 月的暴雨山洪冲坏了路面，西区整条 Bajada 环线（Hohokam Road、Golden Gate Road）禁止进入，修好才重开；西区的红山游客中心、Desert Discovery 步道、King Canyon 步道口照常开放，东区全部开放。",
    source: "https://www.nps.gov/sagu/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["grte-moose-wilson-road"],
    from: "2026-09-08",
    reopen: "2026-11-16",
    reasonZh:
      "Moose-Wilson Road 北段（LSR 保护区到 Moose）施工封闭到 11 月 15 日，之后接着冬季封路；保护区可以从南边 Teton Village 一侧开进去。",
    source: "https://www.nps.gov/grte/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["havo-keanakakoi"],
    from: "2026-10-01",
    reopen: null,
    reasonZh:
      "山顶地震增多、火山活动不稳，Keanakākoʻi 这一侧（老环山公路、附近观景点和通到这里的火山口边缘步道）临时关闭，Devastation 停车场照常开放；可以去 Uēkahuna、Kīlauea 观景台看火山口。",
    source: "https://www.nps.gov/havo/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["havo-mauna-loa-road"],
    from: "2026-09-23",
    reopen: "2026-10-30",
    reasonZh:
      "第二道牛栏（Kīpukapuaulu 往上约 3 公里）到观景台一段因伐树全封，车、人、自行车都不能进，为之后的道路整修做准备（Kīpukapuaulu 步道也因危险树木关闭）。",
    source: "https://www.nps.gov/havo/planyourvisit/conditions.htm",
    checked: "2026-10-13",
  },
  {
    attractions: ["glac-two-medicine-lake", "glac-running-eagle-falls"],
    from: "2026-09-08",
    reopen: null,
    longTerm: true,
    reasonZh:
      "Two Medicine 路改造：9 月 8 日起封到 Running Eagle Falls 步道口，9 月中下旬起从 49 号公路路口全封，露营地整年关闭；工程预计 2027 年底完工（可能拖到 2028 年），2027 年夏天能不能进还没公布；可以改去东侧的圣玛丽湖和 Many Glacier。",
    source: "https://www.nps.gov/glac/planyourvisit/conditions.htm",
    checked: "2026-10-15",
  },
  {
    attractions: ["grsm-cades-cove", "grsm-abrams-falls"],
    from: "2026-05-06",
    reopen: "2026-10-01",
    weekdays: [3],
    reasonZh:
      "Cades Cove 环路 5 月初到 9 月底每个周三全天不让机动车进（Vehicle-free Wednesdays），只能走路或骑车（环路一圈约 18 公里，路口有租车店）；Abrams Falls 的步道口在环路中段，也开不过去。想开车看就换一天。",
    source: "https://www.nps.gov/grsm/planyourvisit/cades-cove-vehicle-free-days.htm",
    checked: "2026-10-15",
  },
  {
    // 2023 年起每年都有，2027 年的日期还没公布，按往年 5 月第一个到 9 月最后一个周三估
    attractions: ["grsm-cades-cove", "grsm-abrams-falls"],
    from: "2027-05-05",
    reopen: "2027-09-30",
    weekdays: [3],
    reasonZh:
      "Cades Cove 环路每年 5 月初到 9 月底的周三全天不让机动车进（2027 年的日期按往年估，还没公布），只能走路或骑车；Abrams Falls 的步道口在环路中段，也开不过去。想开车看就换一天。",
    source: "https://www.nps.gov/grsm/planyourvisit/cades-cove-vehicle-free-days.htm",
    checked: "2026-10-15",
  },
];
