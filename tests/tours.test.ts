import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import { buildLiveTimeline, buildTimeline, NOMINAL_SUN, type PlanStop } from "../src/lib/planner";
import { departuresOn, runsOn } from "../src/lib/tours";

const clock = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const boat = attractions.find((a) => a.id === "glac-many-glacier-boat") as PlanStop;

test("Many Glacier 游船：6 月下旬四班，7 月起七班，6 月 10 日以前不开", () => {
  assert.deepEqual(departuresOn(boat.id, "2027-06-21"), { times: ["09:00", "11:00", "14:00", "17:00"].map(clock), checkIn: 30 });
  assert.equal(departuresOn(boat.id, "2027-07-15")?.times.length, 7);
  assert.deepEqual(departuresOn(boat.id, "2027-06-05")?.times, []);
  assert.equal(runsOn(boat.id, "2027-06-05"), false);
  // 没有固定班次的景点、不知道日期的都不限制
  assert.equal(departuresOn("glac-lake-mcdonald", "2027-06-21"), null);
  assert.equal(departuresOn(boat.id, null), null);
  assert.equal(runsOn("glac-lake-mcdonald", "2027-06-21"), true);
});

const liveAt = (now: string, date: string) =>
  buildLiveTimeline([boat], { now: clock(now), sun: NOMINAL_SUN, date }).entries[0];

test("8:45 到码头：9:00 那班来不及提前 30 分钟报到，坐 11:00 的", () => {
  const entry = liveAt("08:45", "2027-06-21");
  assert.equal(entry.start, clock("11:00"));
  assert.equal(entry.waitMin, 135);
  assert.deepEqual(entry.warnings, []);
});

test("最后一班也赶不上、这天不开，分别提醒", () => {
  assert.deepEqual(liveAt("16:45", "2027-06-21").warnings, ["missDeparture"]);
  assert.deepEqual(liveAt("09:00", "2027-06-05").warnings, ["noService"]);
});

test("第一站是只有清早一班的船：按平常 8 点出发赶不上，就提早出发", () => {
  const fjord = attractions.find((a) => a.id === "kefj-northwestern-fjord") as PlanStop;
  const seward = { id: "kefj-stay-seward", lat: 60.1204, lon: -149.4411 };
  const timeline = buildTimeline([fjord], { sun: NOMINAL_SUN, from: seward, to: seward, date: "2027-07-10" });
  // 8:30 开船、提前 1 小时到：最晚 7:30 到码头
  assert.equal(timeline.entries[0].start, clock("08:30"));
  assert.ok(timeline.departAt !== undefined && timeline.departAt + timeline.entries[0].driveMin <= clock("07:30"));
  assert.deepEqual(timeline.entries[0].warnings, []);
});

test("只在部分日子开的（Diablo 湖游船 7 月周三到周日）：定了日期的按星期算，没定的不按", () => {
  const cruise = "noca-diablo-lake-cruise";
  // 2027-07-12 是星期一，2027-07-14 是星期三
  assert.equal(runsOn(cruise, "2027-07-12", true), false);
  assert.equal(runsOn(cruise, "2027-07-14", true), true);
  assert.equal(runsOn(cruise, "2027-07-12"), true);
  // 9 月 8–11 日两段之间不开
  assert.equal(runsOn(cruise, "2027-09-09"), false);
});

test("写了进去时间的（洞穴 9:30–14:30 进洞、16:45 前出来）：早到等开门，晚到、出来太晚都提醒", () => {
  const cave: PlanStop = {
    id: "test-cave",
    park: "test",
    kind: "hike",
    durationMin: 100,
    lat: 32.17543,
    lon: -104.4442,
    hours: [{ open: "09:30", lastEntry: "14:30", close: "16:45" }],
  };
  const at = (now: string) => buildLiveTimeline([cave], { now: clock(now), sun: NOMINAL_SUN }).entries[0];
  assert.equal(at("09:00").start, clock("09:30"));
  assert.deepEqual(at("09:00").warnings, []);
  assert.deepEqual(at("14:45").warnings, ["afterHours"]);
  // 14:20 进去还来得及，但停 100 分钟要到 16:00；停够 3 小时就过了 16:45
  assert.deepEqual(at("14:20").warnings, []);
  const long = buildLiveTimeline([{ ...cave, durationMin: 180 }], { now: clock("14:20"), sun: NOMINAL_SUN });
  assert.deepEqual(long.entries[0].warnings, ["afterHours"]);
});
