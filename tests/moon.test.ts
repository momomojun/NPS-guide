import assert from "node:assert/strict";
import { test } from "node:test";
import { moonNight, moonPhase } from "../src/lib/moon";

// 布莱斯峡谷（山地时间）；2026 年 8 月 12 日新月（日全食那天），8 月 28 日满月，9 月 4 日前后下弦月
const BRYCE = { lat: 37.62, lon: -112.17, zone: "America/Denver" };
const night = (date: string, from = 21 * 60, to = 23 * 60) => moonNight(date, from, to, BRYCE.lat, BRYCE.lon, BRYCE.zone);

test("月相：新月几乎不亮，满月全亮", () => {
  assert.ok(moonPhase(new Date(Date.UTC(2026, 7, 12, 18))).fraction < 0.02);
  assert.ok(moonPhase(new Date(Date.UTC(2026, 7, 28, 4))).fraction > 0.98);
});

test("满月前后日落时升起，整晚都在天上", () => {
  const full = night("2026-08-28");
  assert.ok(full.fraction > 0.95);
  // 布莱斯这天约 19:55 日落，月亮在之后不久升起，第二天早上才落下
  assert.ok(full.rise !== null && full.rise > 19 * 60 + 45 && full.rise < 21 * 60, `rise ${full.rise}`);
  assert.ok(full.set !== null && full.set > 24 * 60 + 6 * 60);
  assert.equal(full.upMin, 120);
});

test("新月整晚很暗；下弦月半夜才升起，前半夜看星空不受影响", () => {
  const dark = night("2026-08-12");
  assert.ok(dark.fraction < 0.02);
  assert.equal(dark.upMin, 0);
  const lastQuarter = night("2026-09-04");
  assert.equal(lastQuarter.waxing, false);
  assert.ok(lastQuarter.rise !== null && lastQuarter.rise > 23 * 60, `rise ${lastQuarter.rise}`);
  assert.equal(lastQuarter.upMin, 0);
});
