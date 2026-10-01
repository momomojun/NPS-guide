import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import { buildLiveTimeline, NOMINAL_SUN, type PlanStop } from "../src/lib/planner";
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
