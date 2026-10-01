import assert from "node:assert/strict";
import { test } from "node:test";
import { isFederalHoliday, shuttleFor, shuttleLeg, shuttleOptions } from "../src/lib/shuttle";

test("锡安峡谷景观道：班车季要坐班车，冬天（12 月中）私家车能开进去", () => {
  assert.equal(shuttleFor("zion-emerald-pools", "2027-07-01")?.system.id, "zion-canyon");
  assert.equal(shuttleFor("zion-emerald-pools", "2027-12-10"), null);
  // 圣诞到元旦这几天又开班车（季节跨年）
  assert.equal(shuttleFor("zion-emerald-pools", "2027-12-30")?.system.id, "zion-canyon");
  assert.equal(shuttleFor("zion-emerald-pools", "2028-01-02")?.system.id, "zion-canyon");
});

test("同一站下车的几个地方走过去，同一条线上坐车，从外面过来先开到换乘点", () => {
  const date = "2027-07-01";
  const lodge = shuttleFor("zion-emerald-pools", date)!;
  const patriarchs = shuttleFor("zion-patriarchs", date)!;
  assert.equal(shuttleLeg(lodge, lodge, date, () => 0)?.mode, "walk");
  const ride = shuttleLeg(patriarchs, lodge, date, () => 0)!;
  assert.equal(ride.mode, "ride");
  // 站间 6 分钟 + 平均等车半个间隔（10 分钟一班）
  assert.equal(ride.minutes, 6 + 5);
  const fromOutside = shuttleLeg(null, lodge, date, () => 20)!;
  assert.equal(fromOutside.mode, "in");
  assert.ok(fromOutside.minutes > 20 + 25);
});

test("不在班车线上的景点不用坐", () => {
  assert.deepEqual(shuttleOptions("zion-kolob", "2027-07-01"), []);
  assert.equal(shuttleLeg(null, null, "2027-07-01", () => 30), null);
});

test("联邦假日（有的班车只在周末和假日开）", () => {
  assert.equal(isFederalHoliday("2027-07-05"), true); // 7 月 4 日是周日，周一补假
  assert.equal(isFederalHoliday("2027-05-31"), true); // 阵亡将士纪念日，5 月最后一个周一
  assert.equal(isFederalHoliday("2027-06-01"), false);
});
