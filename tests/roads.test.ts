import assert from "node:assert/strict";
import { test } from "node:test";
import { seasonalRoads } from "../src/data/roads";
import {
  aroundMinutes,
  bestRoadDay,
  openChance,
  recentYears,
  recordYears,
  roadDecides,
  roadFor,
  roadStatus,
} from "../src/lib/roads";

const road = (id: string) => {
  const found = seasonalRoads.find((candidate) => candidate.id === id);
  assert.ok(found, `没有这条路：${id}`);
  return found;
};

test("Tioga Road：明年 6 月 1 日按往年估，近 20 年里 13 年已经通车", () => {
  const status = roadStatus(road("yose-tioga-road"), "2027-06-01");
  assert.deepEqual(status && status.kind === "odds" && [status.phase, status.open, status.known], ["opening", 13, 20]);
});

test("Tioga Road：今年已经知道哪天通车的，按今年说", () => {
  assert.deepEqual(roadStatus(road("yose-tioga-road"), "2026-05-10"), { kind: "notYet", opened: "05-15" });
  assert.deepEqual(roadStatus(road("yose-tioga-road"), "2026-06-10"), { kind: "open", opened: "05-15" });
});

test("向阳大道：6 月 20 日 5/20、6 月 22 日 10/20，秋天按关闭算", () => {
  const glacier = road("glac-logan-pass");
  const count = (date: string) => {
    const status = roadStatus(glacier, date);
    return status?.kind === "odds" ? `${status.open}/${status.known}` : status?.kind;
  };
  assert.equal(count("2027-06-20"), "5/20");
  assert.equal(count("2027-06-22"), "10/20");
  const autumn = roadStatus(glacier, "2027-10-14");
  assert.equal(autumn?.kind === "odds" && autumn.phase, "closing");
  // 2013 年政府停摆没有关闭日期，秋天不算
  assert.equal(autumn?.kind === "odds" && autumn.known, 18);
});

test("疫情、修路的年份不算进统计", () => {
  const glacierPoint = road("yose-glacier-point-road");
  const status = roadStatus(glacierPoint, "2027-05-01");
  assert.ok(status?.kind === "odds");
  assert.equal(status.known, 20);
  assert.ok(glacierPoint.years.some(([year, , , skip]) => year === 2022 && skip));
});

test("把握最大的一天：春天一样大时取靠后的一天", () => {
  const tioga = road("yose-tioga-road");
  const dates = ["2027-01-10", "2027-01-11", "2027-01-12"];
  const best = bestRoadDay(tioga, dates);
  assert.equal(best?.chance, 0);
  assert.equal(best?.date, "2027-01-12");
  assert.equal(bestRoadDay(tioga, ["2027-05-20", "2027-06-20"])?.date, "2027-06-20");
});

test("景点对到路：路通了就能去的和还要等步道化雪的分开", () => {
  const glacier = road("glac-logan-pass");
  assert.equal(roadFor("glac-logan-pass")?.id, glacier.id);
  assert.equal(roadDecides(glacier, "glac-logan-pass"), true);
  assert.equal(roadFor("glac-highline-trail")?.id, glacier.id);
  assert.equal(roadDecides(glacier, "glac-highline-trail"), false);
  assert.equal(roadFor("yose-mirror-lake"), undefined);
});

test("通车把握：当年知道的是 0 或 1，往年估的是比例", () => {
  assert.equal(openChance({ kind: "open", opened: "05-15" }), 1);
  assert.equal(openChance({ kind: "notYet", opened: "05-15" }), 0);
  assert.equal(openChance({ kind: "odds", phase: "opening", open: 13, known: 20 }), 0.65);
});

test("雷尼尔山 Sunrise Road：有记录的 14 年按开通估；关闭日只查到 5 年，秋天不估", () => {
  const sunrise = road("mora-sunrise-road");
  const july = roadStatus(sunrise, "2027-07-01");
  assert.deepEqual(july?.kind === "odds" && [july.phase, july.open, july.known], ["opening", 11, 14]);
  assert.equal(roadStatus(sunrise, "2027-09-20"), null);
  // 2026 年因山火 8 月 7 日起封路：这年不算统计，但 2026 年的行程按它说
  assert.deepEqual(roadStatus(sunrise, "2026-10-05"), { kind: "closed", closed: "08-07" });
  assert.ok(recentYears(sunrise).every(([year]) => year !== 2026));
});

test("Stevens Canyon Road：修路的年份不算，2011 年 9 月修路封路只算开通", () => {
  const stevens = road("mora-stevens-canyon-road");
  const count = (date: string) => {
    const status = roadStatus(stevens, date);
    return status?.kind === "odds" ? `${status.open}/${status.known}` : status?.kind;
  };
  assert.equal(count("2027-05-24"), "4/9");
  assert.equal(count("2027-05-28"), "7/9");
  assert.ok(stevens.years.some(([year, open, close]) => year === 2011 && open === "05-27" && close === null));
});

test("文案：满 20 年说“近 20 年”，不满的说“有记录的 n 年”", () => {
  const text = { recentYears: "近 {n} 年", knownYears: "有记录的 {n} 年" };
  assert.equal(recordYears(20, text), "近 20 年");
  assert.equal(recordYears(14, text), "有记录的 14 年");
});

test("路封着的时候跨两侧要绕到园外：5 月从熊湖去西边的 Holzwarth 要四个多小时，7 月不用绕", () => {
  const may = aroundMinutes("romo-bear-lake", "romo-holzwarth", "2027-05-20");
  assert.ok(may !== null && may > 236, `绕路 ${may} 分钟`);
  assert.equal(aroundMinutes("romo-bear-lake", "romo-holzwarth", "2027-07-20"), null);
  // 同一侧、路上的景点本身、别的公园都不用绕
  assert.equal(aroundMinutes("romo-bear-lake", "romo-moraine-park", "2027-05-20"), null);
  assert.equal(aroundMinutes("romo-bear-lake", "romo-alpine-visitor-center", "2027-05-20"), null);
  assert.equal(aroundMinutes("yose-tunnel-view", "romo-holzwarth", "2027-05-20"), null);
  // 冬天住 Lee Vining 去优胜美地山谷：Tioga Road 封着，要绕 Carson Pass
  assert.ok((aroundMinutes("yose-stay-lee-vining", "yose-tunnel-view", "2027-01-15") ?? 0) > 293);
});

test("冰川 6 月上旬向阳大道没通：西边的雪崩湖去东边的 Rising Sun 走 2 号公路；路边的 Goat Lick 两边都不算绕", () => {
  const around = aroundMinutes("glac-avalanche-lake", "glac-stay-rising-sun", "2027-06-05");
  // 翻洛根山口约 69 分钟；绕 2 号公路：雪崩湖到 West Glacier、West Glacier 到 East Glacier、再到 Rising Sun，两个多小时
  assert.ok(around !== null && around >= 140, `绕路 ${around} 分钟`);
  assert.equal(aroundMinutes("glac-avalanche-lake", "glac-stay-rising-sun", "2027-07-20"), null);
  assert.equal(aroundMinutes("glac-goat-lick", "glac-stay-rising-sun", "2027-06-05"), null);
  assert.equal(aroundMinutes("glac-stay-west-glacier", "glac-goat-lick", "2027-06-05"), null);
});
