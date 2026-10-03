import assert from "node:assert/strict";
import { test } from "node:test";
import { darkSky, mediaPicks, usNewsBest, worldHeritage } from "../src/data/honors";
import { canadianParks, nationalParks } from "../src/data/national-parks";
import { isSite, parks } from "../src/data/parks";
import { annualVisits, dailyByMonth, visitsFirstYear, visitsLastYear } from "../src/data/visits.generated";
import { formatBig } from "../src/i18n/format";
import { crowdLevel, crowdOf } from "../src/lib/crowd";
import { parkVisits, visitRanking, visitsIn } from "../src/lib/visits";

const units = { wan: "{n} 万", yi: "{n} 亿" };

test("63 座国家公园按设立日期排好，网站上的美国国家公园都对得上", () => {
  assert.equal(nationalParks.length, 63);
  assert.equal(new Set(nationalParks.map((park) => park.code)).size, 63);
  const dates = nationalParks.map((park) => park.established);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(nationalParks[0].code, "yell");
  // 网站上每座美国国家公园都在列表里（seki 对应红杉、国王峡谷两座），列表里的公园页也都存在
  const pages = new Set(nationalParks.flatMap((park) => (park.page ? [park.page] : [])));
  const usParks = parks.filter((park) => !isSite(park) && park.country !== "CA").map((park) => park.code);
  assert.deepEqual([...pages].sort(), [...usParks].sort());
  assert.equal(nationalParks.filter((park) => park.page === "seki").length, 2);
});

test("每年人次：12 个月加起来和 NPS 公布的一样，排名对得上 2025 年的前三", () => {
  // NPS 2025 年新闻稿：黄石 4,762,988；大烟山 11,527,939
  assert.equal(visitsIn("yell", 2025), 4762988);
  assert.equal(visitsIn("grsm", 2025), 11527939);
  // 阿拉斯加几座 1982 年才开始统计
  assert.equal(visitsIn("gaar", 1979), null);
  assert.equal(annualVisits.yell.length, visitsLastYear - visitsFirstYear + 1);
  const ranking = visitRanking(2025);
  assert.deepEqual(ranking.slice(0, 3).map((park) => park.code), ["grsm", "zion", "yell"]);
  assert.deepEqual(ranking.map((park) => park.rank), ranking.map((_, i) => i + 1));
});

test("每个月平均每天的人次乘天数，加起来是最近一年的总数", () => {
  const days = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (const code of ["yell", "zion", "cave", "lavo"]) {
    const total = dailyByMonth[code].reduce((sum, perDay, m) => sum + perDay * days[m], 0);
    const latest = visitsIn(code, visitsLastYear)!;
    assert.ok(Math.abs(total / latest - 1) < 0.005, `${code}: ${total} vs ${latest}`);
  }
  // 卡尔斯巴德洞窟 2025 年 10 月政府停摆闭园（0 人次），这个月不算那一年，平均下来还是有人
  assert.ok(dailyByMonth.cave[9] > 500);
});

test("公园页：红杉和国王峡谷加起来，北瀑布另说休闲区，加拿大按财年，园外名胜没有", () => {
  const seki = parkVisits("seki")!;
  assert.equal(seki.latest, visitsIn("sequ", visitsLastYear)! + visitsIn("kica", visitsLastYear)!);
  assert.deepEqual(seki.parts.map((part) => part.nameZh), ["红杉", "国王峡谷"]);
  assert.equal(seki.rank, undefined);
  assert.equal(seki.daily?.length, 12);

  const noca = parkVisits("noca")!;
  assert.ok(noca.complex! > noca.latest * 10);

  const whsa = parkVisits("whsa")!;
  assert.equal(whsa.establishedYear, 2019);
  assert.equal(parkVisits("yell")!.establishedYear, undefined);

  const banff = parkVisits("banf")!;
  assert.equal(banff.source, "canada");
  assert.equal(banff.daily, undefined);
  assert.ok(banff.latest > 4_000_000);

  assert.equal(parkVisits("ante"), null);
});

test("人多不多：按和最挤月份的比例分四档，几个月按天数加权", () => {
  assert.equal(crowdLevel(1), "peak");
  assert.equal(crowdLevel(0.8), "peak");
  assert.equal(crowdLevel(0.6), "busy");
  assert.equal(crowdLevel(0.3), "moderate");
  assert.equal(crowdLevel(0.1), "quiet");
  const daily = [100, 100, 100, 100, 200, 1000, 1000, 1000, 800, 400, 100, 100];
  assert.equal(crowdOf(daily, new Map([[7, 1]]))?.level, "peak");
  // 9 月底出发：9 月 3 天、10 月 7 天
  const crowd = crowdOf(daily, new Map([[9, 3], [10, 7]]))!;
  assert.ok(Math.abs(crowd.ratio - (0.8 * 3 + 0.4 * 7) / 10) < 1e-9);
  assert.equal(crowd.level, "busy");
  assert.equal(crowdOf(undefined, new Map([[7, 1]])), null);
});

test("大数：亿、万，一万以下照常写", () => {
  assert.equal(formatBig(323014305, units), "3.23 亿");
  assert.equal(formatBig(11527939, units), "1153 万");
  assert.equal(formatBig(432498, units), "43 万");
  assert.equal(formatBig(32230, units), "3.2 万");
  assert.equal(formatBig(20127, units), "2 万");
  assert.equal(formatBig(7786, units), "7,786");
});

test("世界遗产、暗夜公园、媒体推荐里的公园代码都对得上", () => {
  const codes = new Set([...nationalParks.map((park) => park.code), ...canadianParks.map((park) => park.code)]);
  const used = [
    ...Object.keys(worldHeritage),
    ...Object.keys(darkSky),
    ...mediaPicks.flatMap((pick) => pick.parks),
    ...(usNewsBest?.parks ?? []),
  ];
  assert.deepEqual(used.filter((code) => !codes.has(code)), []);
  // 美国国家公园里 14 座是世界遗产（或者是世界遗产的一部分）
  assert.equal(Object.keys(worldHeritage).filter((code) => !["banf", "jasp", "yoho"].includes(code)).length, 14);
  assert.equal(new Set(usNewsBest?.parks).size, 24);
});
