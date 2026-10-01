import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingRules, type BookingWindow } from "../src/data/bookings";
import { bookingsForTrip, openingFor, openingState } from "../src/lib/booking";

const rule = (id: string) => {
  const found = bookingRules.find((candidate) => candidate.id === id);
  assert.ok(found, `没有这条预约规则：${id}`);
  return found;
};

test("天使降临季度抽签：4 月去的那一季，2 月中旬申请、2 月 26 日出结果", () => {
  const opening = openingFor(rule("zion-angels-landing-permit").window, "2027-04-09");
  assert.deepEqual([opening?.opens, opening?.closes, opening?.results], ["2027-02-13", "2027-02-25", "2027-02-26"]);
});

test("跨年的那一季（12–2 月）：1 月去的，前一年 10 月申请", () => {
  const window = rule("zion-angels-landing-permit").window;
  assert.equal(openingFor(window, "2027-12-15")?.opens, "2027-10-01");
  assert.equal(openingFor(window, "2028-01-20")?.opens, "2027-10-01");
});

test("前一天抽签：去的前一天申请", () => {
  const dayBefore = rule("zion-angels-landing-permit").also?.find((window) => window.type === "days-before");
  assert.ok(dayBefore);
  assert.equal(openingFor(dayBefore, "2027-04-09")?.opens, "2027-04-08");
});

test("Zion Lodge 提前 13 个月整月放：2027 年 10 月的房间 2026 年 9 月 1 日开订", () => {
  assert.equal(openingFor(rule("zion-lodge").window, "2027-10-15")?.opens, "2026-09-01");
});

test("滚动开放：提前几个月就是去的那天往前推几个月", () => {
  const window: BookingWindow = { type: "rolling", months: 6 };
  assert.equal(openingFor(window, "2027-08-31")?.opens, "2027-02-28");
});

test("抽签进行中：还有几天截止", () => {
  const opening = openingFor(rule("zion-angels-landing-permit").window, "2027-04-09")!;
  assert.deepEqual(openingState(opening, "2027-02-20"), { state: "open", sinceDays: 7, closesInDays: 5 });
  assert.equal(openingState(opening, "2027-01-20").state, "upcoming");
  assert.equal(openingState(opening, "2027-02-25").state, "open");
  // 25 日截止、26 日出结果，中间没有等结果的日子
  assert.equal(openingState(opening, "2027-02-26").state, "closed");
  // The Subway：25 日截止、27 日出结果，26 日在等结果
  const subway = openingFor(rule("zion-subway-lottery").window, "2028-02-10")!;
  assert.deepEqual(openingState(subway, "2027-11-26"), { state: "waiting", results: "2027-11-27" });
});

test("行程里去天使降临的那天对上许可证规则", () => {
  const items = bookingsForTrip(
    [
      { day: 0, date: "2027-04-09", parks: ["zion"], stops: ["zion-visitor-center"], lodging: "zion-stay-lodge" },
      { day: 1, date: "2027-04-10", parks: ["zion"], stops: ["zion-angels-landing"] },
    ],
    bookingRules,
  );
  const permit = items.find((item) => item.rule.id === "zion-angels-landing-permit");
  assert.deepEqual(permit?.dates, ["2027-04-10"]);
  assert.ok(items.some((item) => item.rule.id === "zion-lodge"));
});
