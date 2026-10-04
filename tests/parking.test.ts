import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import type { ParkingRule } from "../src/data/attractions";
import { parkingRules } from "../src/data/parking";
import { shuttleOptions } from "../src/lib/shuttle";
import { arrangeDay, buildTimeline, NOMINAL_SUN, parkingOn, type PlanStop } from "../src/lib/planner";

// 停车场规则用假的（不依赖 parking.ts 里实际收了哪些）：Wolfe Ranch（精致拱门步道口）7–8 月早上 8 点前停满
const clock = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const base = (id: string) => attractions.find((a) => a.id === id) as PlanStop;
const rule: ParkingRule = { fullBy: "08:00", months: [7, 8], noteZh: "满了就换别的步道", source: "test" };
// 精致拱门本来按日落排，这里当成普通的步道（白天去）
const day = (id: string, parking?: ParkingRule) => ({ ...base(id), bestTime: undefined, parking }) as PlanStop;
const arch = day("arch-delicate-arch", rule);
const windows = day("arch-windows");
const moab = { id: "arch-stay-moab", lat: 38.5733, lon: -109.5498 };
const july = "2027-07-14";
const timeline = (stops: PlanStop[], date = july) => buildTimeline(stops, { sun: NOMINAL_SUN, from: moab, to: moab, date });
const arrive = (entry: { start: number; waitMin: number }) => entry.start - entry.waitMin;

test("停车场规则：旺季才算，只在周末满的按星期算，不知道日期的不算", () => {
  // 官方没说几点以后有空位的，按下午 5 点算
  assert.deepEqual(parkingOn(arch, july), { full: clock("08:00"), free: clock("17:00"), freeStated: false, lot: arch.id });
  assert.equal(parkingOn(arch, "2027-10-14"), null);
  assert.equal(parkingOn(arch, null), null);
  const weekends = day("arch-delicate-arch", { ...rule, weekends: true });
  // 2027-07-14 是星期三，07-17 是星期六
  assert.equal(parkingOn(weekends, july), null);
  assert.equal(parkingOn(weekends, "2027-07-17")?.full, clock("08:00"));
});

test("第一站停车场一早就满：提早出发，停满之前到；6 点出发也赶不上的、刚落地的那天不提早，只提醒", () => {
  const first = timeline([arch, windows]).entries[0];
  assert.ok(arrive(first) <= clock("07:45"), `arrive ${arrive(first)}`);
  assert.deepEqual(first.warnings, []);
  // 不是旺季就照常 8 点出发
  assert.equal(timeline([arch, windows], "2027-10-14").departAt, clock("08:00"));
  const dawn = timeline([day("arch-delicate-arch", { ...rule, fullBy: "06:00" }), windows]);
  assert.equal(dawn.departAt, clock("08:00"));
  assert.ok(dawn.entries[0].warnings.includes("parkingFull"));
  const landing = buildTimeline([arch, windows], { sun: NOMINAL_SUN, from: { ...moab, endpoint: "origin" }, to: moab, date: july });
  assert.equal(landing.departAt, clock("08:00"));
});

test("排在后面、到的时候已经停满：提醒；排当天顺序时会把它挪到第一站", () => {
  assert.ok(timeline([windows, arch]).entries[1].warnings.includes("parkingFull"));
  const order = arrangeDay([windows, arch], { sun: NOMINAL_SUN, from: moab, to: moab, date: july });
  assert.equal(order[0].id, arch.id);
});

test("下午又有空位的：那以后到不算满", () => {
  // 早上 8 点前满、下午 3 点以后有空位；排在一个很长的景点后面，下午才到
  const afternoon = day("arch-delicate-arch", { ...rule, freeAfter: "15:00" });
  const long = { ...windows, durationMin: 8 * 60 } as PlanStop;
  const entries = timeline([long, afternoon]).entries;
  assert.ok(arrive(entries[1]) >= clock("15:00"));
  assert.ok(!entries[1].warnings.includes("parkingFull"));
});

test("同一个停车场的几个景点：一天只看第一个，后面的已经停好车了", () => {
  const lot = { ...rule, lot: "arch-windows" };
  const window = day("arch-windows", lot);
  const doubleArch = day("arch-double-arch", lot);
  const entries = timeline([window, doubleArch]).entries;
  assert.deepEqual(entries[0].warnings, []);
  // Double Arch 到的时候已经过了 8 点，但车已经停在 Windows 的停车场了
  assert.ok(arrive(entries[1]) > clock("08:00"));
  assert.deepEqual(entries[1].warnings, []);
});

test("停车场数据：景点都存在，旺季不是只能坐班车去，同一个停车场的规则一样", () => {
  const ids = new Set(attractions.map((a) => a.id));
  for (const [id, parking] of Object.entries(parkingRules)) {
    assert.ok(ids.has(id), id);
    const date = `2027-${String(parking.months[0]).padStart(2, "0")}-15`;
    assert.equal(shuttleOptions(id, date).length, 0, `${id} 班车季只能坐班车`);
    assert.match(parking.fullBy, /^\d\d:\d\d$/);
  }
  const byLot = new Map<string, ParkingRule>();
  for (const parking of Object.values(parkingRules)) {
    if (!parking.lot) continue;
    const other = byLot.get(parking.lot);
    if (other) assert.equal(other, parking, parking.lot);
    byLot.set(parking.lot, parking);
  }
});

test("要等日落的：可以晚点再过来，按开始的时间看停车场（精致拱门的日落徒步，下午 3 点以后有空位）", () => {
  const sunset = { ...base("arch-delicate-arch"), parking: { ...rule, freeAfter: "15:00" } } as PlanStop;
  const entries = timeline([windows, sunset]).entries;
  // 中午就到了、等到傍晚才出发：按出发的时间（3 点以后）看，不算满
  assert.ok(entries[1].waitMin > 0 && entries[1].start > clock("15:00"));
  assert.ok(!entries[1].warnings.includes("parkingFull"));
});
