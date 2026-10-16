import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import { tempClosures, UNKNOWN_REOPEN_DAYS } from "../src/data/closures";
import { closedByAlerts } from "../src/lib/alert-match";
import { closedAllDays, closureOn } from "../src/lib/closures";
import { addDays } from "../src/lib/dates";

test("临时关闭数据：景点都存在，日期格式对，重开日期在关闭之后", () => {
  const ids = new Set(attractions.map((a) => a.id));
  const day = /^\d{4}-\d{2}-\d{2}$/;
  for (const closure of tempClosures) {
    for (const id of closure.attractions) assert.ok(ids.has(id), `没有这个景点：${id}`);
    assert.match(closure.from, day);
    assert.match(closure.checked, day);
    if (closure.reopen) {
      assert.match(closure.reopen, day);
      assert.ok(closure.reopen > closure.from, closure.attractions.join());
    }
    assert.ok(closure.reasonZh.length > 10 && closure.source.startsWith("https://"));
  }
});

test("临时关闭：重开那天起能去；没公布重开时间的，核对后 90 天内当关着，再往后只提醒可能还关着", () => {
  // Moose-Wilson Road 9 月 8 日起封、11 月 16 日重开
  assert.equal(closureOn("grte-moose-wilson-road", "2026-09-07"), null);
  assert.equal(closureOn("grte-moose-wilson-road", "2026-11-15")?.certain, true);
  assert.equal(closureOn("grte-moose-wilson-road", "2026-11-16"), null);
  // 巨人柱 Bajada 环线：没公布重开时间
  const bajada = tempClosures.find((closure) => closure.attractions.includes("sagu-bajada-loop"))!;
  assert.equal(closureOn("sagu-bajada-loop", addDays(bajada.checked, UNKNOWN_REOPEN_DAYS - 1))?.certain, true);
  assert.equal(closureOn("sagu-bajada-loop", addDays(bajada.checked, UNKNOWN_REOPEN_DAYS + 1))?.certain, false);
  // 要修好几年的（火山口湖 Cleetwood Cove 到 2029 年夏天）一直当关着
  assert.equal(closureOn("crla-cleetwood-cove", "2028-08-01")?.certain, true);
  // 出发几天里有一天开着就不算整趟都去不了
  assert.equal(closedAllDays("grte-moose-wilson-road", ["2026-11-15", "2026-11-16"]), null);
  assert.ok(closedAllDays("grte-moose-wilson-road", ["2026-11-14", "2026-11-15"]));
});

const alert = (park: string, category: string, title: string) => ({
  id: title,
  park,
  title,
  category,
  url: "https://www.nps.gov",
  description: "",
  updated: "2026-10-13 00:00:00.0",
});

test("实时公告：关闭类、标题写着关闭的才算；夜间封路、部分关闭、提醒类不算", () => {
  const romo = attractions.filter((a) => a.park === "romo");
  const closed = closedByAlerts(romo, [alert("romo", "Park Closure", "Trail Ridge Road is temporarily Closed at Rainbow Curve and at Milner Pass")]);
  // Trail Ridge 片区的景点都算关了，Bear Lake 一带不算
  assert.ok(closed.has("romo-rainbow-curve"));
  assert.ok(closed.has("romo-milner-pass"));
  assert.ok(!closed.has("romo-bear-lake"));
  const olym = attractions.filter((a) => a.park === "olym");
  assert.equal(closedByAlerts(olym, [alert("olym", "Park Closure", "Highway 101 Overnight Closures at Hoh River Bridge, October 13-19")]).size, 0);
  assert.equal(closedByAlerts(romo, [alert("romo", "Caution", "Trail Ridge Road closed at Rainbow Curve")]).size, 0);
});

test("每周固定几天关：Cades Cove 夏天只有周三不让车进，攻略不会整趟去掉", () => {
  // 2026-07-15 是周三，07-16 是周四
  assert.ok(closureOn("grsm-cades-cove", "2026-07-15")?.certain);
  assert.equal(closureOn("grsm-cades-cove", "2026-07-16"), null);
  assert.equal(closureOn("grsm-cades-cove", "2026-10-07"), null, "10 月起不再禁车");
  // 只去周三一天才算这几天都去不了
  assert.ok(closedAllDays("grsm-abrams-falls", ["2026-07-15"]));
  assert.equal(closedAllDays("grsm-abrams-falls", ["2026-07-14", "2026-07-15", "2026-07-16"]), null);
  for (const closure of tempClosures.filter((c) => c.weekdays)) {
    assert.ok(closure.reopen, "每周关的要写到哪天为止");
    assert.ok(closure.weekdays!.every((day) => Number.isInteger(day) && day >= 0 && day <= 6));
  }
});
