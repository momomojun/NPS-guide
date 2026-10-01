import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_PREFS } from "../src/lib/trip-prefs";
import { decodeTrip, encodeTrip } from "../src/lib/trip-share";
import type { Trip } from "../src/lib/trip-store";

const trip: Trip = {
  version: 2,
  startDate: "2027-06-01",
  dayCount: 2,
  days: [
    [
      { id: "yose-tunnel-view", status: "done", arrivedAt: 1_800_000_000_000, leftAt: 1_800_000_900_000 },
      { id: "yose-el-capitan", status: "planned", arrivedAt: 1_800_001_800_000 },
    ],
    [{ id: "yose-mist-trail", status: "skipped" }],
  ],
  pool: ["yose-glacier-point"],
  nights: [
    {
      kind: "custom",
      id: "custom-origin-FAT",
      name: "FAT",
      lat: 36.7762,
      lon: -119.7181,
      minutes: { "yose-tunnel-view": 120, "yose-half-dome": 130 },
      endpoint: "origin",
    },
    { kind: "option", id: "yose-stay-valley-lodge" },
    null,
  ],
};

test("分享链接来回一趟，行程、打卡时间和设置都在", () => {
  const shared = decodeTrip(encodeTrip({ trip, prefs: { ...DEFAULT_PREFS, travelers: 3, usePace: false } }));
  assert.ok(shared);
  assert.deepEqual(shared.trip.days, trip.days);
  assert.deepEqual(shared.trip.pool, trip.pool);
  assert.equal(shared.prefs?.travelers, 3);
  assert.equal(shared.prefs?.usePace, false);
});

test("分享时自定义住处只留行程里用到的车程", () => {
  const shared = decodeTrip(encodeTrip({ trip }));
  const origin = shared?.trip.nights[0];
  assert.ok(origin?.kind === "custom");
  assert.deepEqual(Object.keys(origin.minutes), ["yose-tunnel-view"]);
});

test("坏链接不会当成行程", () => {
  assert.equal(decodeTrip("not-a-trip"), null);
  assert.equal(decodeTrip(""), null);
});
