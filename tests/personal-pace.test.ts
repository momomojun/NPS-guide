import assert from "node:assert/strict";
import { test } from "node:test";
import { learnPace, NEUTRAL_PACE, paceAdjusts, pacedMinutes } from "../src/lib/personal-pace";
import type { TripItem } from "../src/lib/trip-store";

const STOPS: Record<string, { durationMin: number; kind: string }> = {
  a: { durationMin: 60, kind: "viewpoint" },
  b: { durationMin: 120, kind: "landmark" },
  c: { durationMin: 30, kind: "viewpoint" },
  d: { durationMin: 45, kind: "viewpoint" },
  h1: { durationMin: 120, kind: "hike" },
  h2: { durationMin: 180, kind: "hike" },
  short: { durationMin: 10, kind: "viewpoint" },
};
const stopOf = (id: string) => STOPS[id];
const HOUR = 3_600_000;
/** 按估算的 factor 倍停留的打卡 */
const visit = (id: string, factor: number, start = 0): TripItem => ({
  id,
  status: "done",
  arrivedAt: start,
  leftAt: start + STOPS[id].durationMin * factor * 60_000,
});

test("打卡太少不调整", () => {
  const pace = learnPace([visit("a", 1.5), visit("b", 1.5), visit("h1", 1.5)], stopOf);
  assert.equal(pace.other, 1);
  assert.equal(pace.hike, 1);
  assert.equal(paceAdjusts(pace), false);
});

test("其他景点满 3 站、徒步满 2 站分别学", () => {
  const pace = learnPace(
    [visit("a", 1.3), visit("b", 1.3, HOUR), visit("c", 1.3, 2 * HOUR), visit("h1", 0.8), visit("h2", 0.8, HOUR)],
    stopOf,
  );
  assert.equal(pace.other, 1.3);
  assert.equal(pace.hike, 0.8);
  assert.deepEqual(pace.samples, { hike: 2, other: 3 });
});

test("取中位数：偶尔忘了点“走了”影响不大", () => {
  const pace = learnPace([visit("a", 1.2), visit("b", 1.2), visit("c", 1.2), visit("d", 5)], stopOf);
  assert.equal(pace.other, 1.2);
});

test("太短的景点、没走的、跳过的、差不多的都不算", () => {
  const items: TripItem[] = [
    visit("short", 3),
    { id: "a", status: "planned", arrivedAt: 0 },
    { id: "b", status: "skipped", arrivedAt: 0, leftAt: HOUR },
    visit("c", 1.05),
    visit("d", 1.05),
    visit("a", 1.05),
  ];
  assert.deepEqual(learnPace(items, stopOf), { ...NEUTRAL_PACE, samples: { hike: 0, other: 3 } });
});

test("按配速算停留：取整到 5 分钟，最多 1.8 倍", () => {
  assert.equal(pacedMinutes({ durationMin: 15, kind: "viewpoint" }, { ...NEUTRAL_PACE, other: 1.3 }), 20);
  assert.equal(pacedMinutes({ durationMin: 120, kind: "hike" }, { ...NEUTRAL_PACE, other: 1.3 }), 120);
  const slow = learnPace([visit("a", 4), visit("b", 4), visit("c", 4)], stopOf);
  assert.equal(slow.other, 1.8);
});
