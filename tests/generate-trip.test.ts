import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { airports } from "../src/data/airports";
import { attractions } from "../src/data/attractions";
import { lodgingOptions } from "../src/data/lodging";
import { parks } from "../src/data/parks";
import { seasonalRoads } from "../src/data/roads";
import { addDays, nominalDate } from "../src/lib/dates";
import { openChance, roadFor, roadStatus } from "../src/lib/roads";
import { generateTrip, type LiveClosures, type Pace } from "../src/lib/generate-trip";
import { buildTimeline, NOMINAL_SUN, type LodgingPoint, type PlanStop } from "../src/lib/planner";
import { minutesOfDay, sunTimes } from "../src/lib/sun";
import { departuresOn } from "../src/lib/tours";
import type { Trip, TripLodging } from "../src/lib/trip-store";

// 和行程页一样的输入调用自动生成攻略。弗雷斯诺到优胜美地、盐湖城到摩押两个公园各景点的车程是 OSRM 查好
// （按车速校正过）存下来的，其他机场不给车程（按直线估算），测试不联网
const fixture = (name: string): Record<string, number> =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
const MINUTES: Record<string, Record<string, number>> = {
  "yose|FAT": fixture("minutes-yose-FAT"),
  "arch,cany|SLC": fixture("minutes-arch-cany-SLC"),
  "glac|FCA": fixture("minutes-glac-FCA"),
};

interface Options {
  parks: string[];
  start?: string;
  month?: number;
  days: number;
  airport: string;
  pace?: Pace;
}

function generate(options: Options) {
  return generateWith(options);
}

function generateWith({ parks: codes, start = "", month, days, airport, pace = "normal" }: Options, live?: LiveClosures) {
  const park = parks.find((p) => p.code === codes[0])!;
  const stops = attractions.filter((a) => codes.includes(a.park));
  const minutes = MINUTES[`${codes.join()}|${airport}`] ?? {};
  const { lat, lon } = airports[airport];
  const endpoint = (role: "origin" | "destination") =>
    ({ kind: "custom", id: `custom-${role}-${airport}`, name: airport, lat, lon, minutes, endpoint: role }) as const;
  const tripMonth = start ? Number(start.slice(5, 7)) : month!;
  const dateFor = (day: number) => addDays(start || nominalDate(tripMonth), day);
  const sunFor = (day: number) => {
    const sun = sunTimes(dateFor(day), park.gateway.lat, park.gateway.lon);
    return sun.kind === "normal"
      ? { sunrise: minutesOfDay(sun.sunrise, park.timeZone), sunset: minutesOfDay(sun.sunset, park.timeZone) }
      : NOMINAL_SUN;
  };
  const lodging = lodgingOptions
    .filter((option) => codes.includes(option.park))
    .map((option) => ({ id: option.id, lat: option.lat, lon: option.lon, inPark: option.inPark, rental: option.rental, airbnb: option.airbnb }));
  const result = generateTrip(
    { parks: codes, month: tripMonth, startDate: start, days, origin: endpoint("origin"), destination: endpoint("destination"), pace, lodgingPref: "any" },
    { stops, lodging, sunFor, dateFor, live },
  );
  return { ...result, timelines: timelinesOf(result.trip, stops, sunFor, dateFor) };
}

/** 按生成好的行程逐天算时间线（和行程页一样） */
function timelinesOf(trip: Trip, stops: PlanStop[], sunFor: (day: number) => { sunrise: number; sunset: number }, dateFor: (day: number) => string) {
  const byId = new Map(stops.map((stop) => [stop.id, stop]));
  const lodgingById = new Map(lodgingOptions.map((option) => [option.id, option]));
  const resolve = (night: TripLodging | null | undefined): LodgingPoint | undefined =>
    !night ? undefined : night.kind === "custom" ? night : lodgingById.get(night.id);
  let previous: PlanStop | undefined;
  return trip.days.map((day, d) => {
    const dayStops = day.map((item) => byId.get(item.id)!);
    const timeline = buildTimeline(dayStops, { sun: sunFor(d), from: resolve(trip.nights[d]), to: resolve(trip.nights[d + 1]), previous, date: dateFor(d) });
    previous = dayStops.at(-1) ?? previous;
    return timeline;
  });
}

const tiogaStops = seasonalRoads.find((road) => road.id === "yose-tioga-road")!.attractions;
const planned = (trip: Trip) => trip.days.flat().map((item) => item.id);

test("优胜美地 4 天（6/1 弗雷斯诺进出）：每天都不太满，最后一天不等日落，天黑前回到机场", () => {
  const { timelines } = generate({ parks: ["yose"], start: "2027-06-01", days: 4, airport: "FAT" });
  for (const timeline of timelines) {
    assert.equal(timeline.overloaded, false);
    assert.equal(timeline.lateReturn, false);
  }
  const last = timelines.at(-1)!;
  assert.ok(last.returnAt !== undefined && last.returnAt < 20 * 60, `最后一天 ${last.returnAt} 才回到机场`);
  assert.ok(last.entries.every((entry) => entry.slot !== "sunset" && entry.slot !== "night"));
});

test("补景点不为 20 分钟的观景点绕三小时（6/1 第一天不去 Tioga Road 上的奥姆斯特德观景点）", () => {
  const { trip } = generate({ parks: ["yose"], start: "2027-06-01", days: 4, airport: "FAT" });
  assert.ok(!trip.days[0].some((item) => item.id === "yose-olmsted-point"));
});

test("偏远片区只为一两个小景点专门绕路的不排；片区别的天还有景点的不算偏远", () => {
  const moab = generate({ parks: ["arch", "cany"], start: "2027-04-20", days: 4, airport: "SLC" });
  // 峡谷地的 Needles 片区离拱门、Island in the Sky 都要开一个半到三小时
  assert.ok(!planned(moab.trip).some((id) => id === "cany-cave-spring" || id === "cany-big-spring-canyon-overlook"));
  assert.ok((moab.guide.skipped.tooFar ?? []).includes("cany-cave-spring"));
  // 锡安峡谷里的族长庭院和别的峡谷景点在同一片区，不算偏远
  const zion = generate({ parks: ["zion"], start: "2027-04-09", days: 3, airport: "LAS" });
  assert.ok(!(zion.guide.skipped.tooFar ?? []).includes("zion-patriarchs"));
});

test("5 月 Trail Ridge Road 还没通：东边、西边（Grand Lake 一侧）之间都按绕到园外算，不按翻山的车程", () => {
  const { trip, timelines } = generate({ parks: ["romo"], start: "2027-05-20", days: 3, airport: "DEN" });
  const west = new Set(seasonalRoads.find((road) => road.id === "romo-trail-ridge-road")!.around!.side);
  trip.days.forEach((day, d) => {
    const night = trip.nights[d];
    let previous = night?.kind === "option" ? night.id : undefined;
    day.forEach((item, k) => {
      if (previous?.startsWith("romo-") && west.has(previous) !== west.has(item.id)) {
        const drive = timelines[d].entries[k].driveMin;
        assert.ok(drive >= 236, `${previous} → ${item.id} 只算了 ${drive} 分钟`);
      }
      previous = item.id;
    });
    assert.equal(timelines[d].lateReturn, false);
  });
});

test("6 月下旬去冰川：向阳大道整天挪到往年通车过半的那天，隐湖观景点也跟过去；游客中心不排在开门之前，游船按班次", () => {
  const { trip, timelines } = generate({ parks: ["glac"], start: "2027-06-18", days: 5, airport: "FCA" });
  const chance = (id: string, day: number) => {
    const status = roadStatus(roadFor(id)!, addDays("2027-06-18", day));
    return status ? openChance(status) : 1;
  };
  trip.days.forEach((day, d) => {
    for (const id of ["glac-going-to-the-sun-road", "glac-logan-pass", "glac-hidden-lake-overlook"]) {
      if (day.some((item) => item.id === id)) assert.ok(chance(id, d) >= 0.5, `${id} 排在第 ${d + 1} 天`);
    }
  });
  const byId = new Map(attractions.map((a) => [a.id, a]));
  trip.days.forEach((day, d) =>
    day.forEach((item, k) => {
      const stop = byId.get(item.id)!;
      const start = timelines[d].entries[k].start;
      if (stop.kind === "visitor") assert.ok(start >= 9 * 60, `${item.id} ${start}`);
      if (stop.kind === "experience" && !stop.bestTime?.length) assert.ok(start >= 8 * 60 + 30, `${item.id} ${start}`);
      // 有固定班次的（Many Glacier 游船、红色老爷车团）排在开的日子，按某一班开始
      const departures = departuresOn(item.id, addDays("2027-06-18", d));
      if (departures) assert.ok(departures.times.includes(start), `${item.id} 第 ${d + 1} 天 ${start}`);
    }),
  );
});

test("5 月 10 日出发：Tioga Road 往年这几天多半没通，沿线景点不排，攻略说明里列为去不了", () => {
  const { trip, guide } = generate({ parks: ["yose"], start: "2027-05-10", days: 3, airport: "FAT" });
  assert.ok(!planned(trip).some((id) => tiogaStops.includes(id)));
  assert.ok(tiogaStops.every((id) => guide.skipped.closed.includes(id)));
});

test("7 月出发：Tioga Road 沿线景点不算关闭", () => {
  const { guide } = generate({ parks: ["yose"], start: "2027-07-10", days: 3, airport: "FAT" });
  assert.ok(!tiogaStops.some((id) => guide.skipped.closed.includes(id)));
});

test("只定了月份：按开放月份算（5 月 Tioga Road 沿线都算关闭）", () => {
  const { guide } = generate({ parks: ["yose"], month: 5, days: 3, airport: "FAT" });
  assert.ok(tiogaStops.every((id) => guide.skipped.closed.includes(id)));
});

test("盐湖城进出，大提顿 + 黄石 6 天：两个公园都去，每天都不太满", () => {
  const { trip, timelines } = generate({ parks: ["grte", "yell"], start: "2027-07-10", days: 6, airport: "SLC" });
  const parksVisited = new Set(planned(trip).map((id) => id.split("-")[0]));
  assert.deepEqual([...parksVisited].sort(), ["grte", "yell"]);
  for (const timeline of timelines) assert.equal(timeline.overloaded, false);
});

test("轻松节奏不排很难、很长的徒步", () => {
  const { trip } = generate({ parks: ["zion"], start: "2027-04-09", days: 3, airport: "LAS", pace: "relaxed" });
  const byId = new Map(attractions.map((a) => [a.id, a]));
  for (const id of planned(trip)) {
    const stop = byId.get(id)!;
    assert.ok(stop.kind !== "hike" || stop.hike?.difficulty !== "hard", `${id} 太难`);
  }
});

test("约书亚树 3 月 2 天：星空排在第一天天黑以后，看星空的时间不算进每天的节奏上限", () => {
  const { trip, timelines } = generate({ parks: ["jotr"], start: "2027-03-01", days: 2, airport: "PSP" });
  const day = trip.days.findIndex((items) => items.some((item) => item.id === "jotr-night-sky"));
  assert.equal(day, 0);
  const entry = timelines[0].entries.at(-1)!;
  assert.equal(entry.id, "jotr-night-sky");
  assert.equal(entry.slot, "night");
  assert.deepEqual(entry.warnings, []);
  assert.equal(timelines[0].overloaded, false);
  assert.equal(timelines[0].lateReturn, false);
});

test("先看日落再看星空：日落观景点排在日落，星空排在天黑以后", () => {
  const byId = new Map(attractions.map((a) => [a.id, a as PlanStop]));
  const sun = { sunrise: 7 * 60 + 30, sunset: 18 * 60 + 45 };
  const timeline = buildTimeline([byId.get("care-goosenecks-sunset-point")!, byId.get("care-panorama-point")!], { sun });
  const [goosenecks, panorama] = timeline.entries;
  assert.equal(goosenecks.slot, "sunset");
  assert.equal(goosenecks.end, sun.sunset + 15);
  assert.equal(panorama.slot, "night");
  assert.equal(panorama.start, sun.sunset + 60);
  assert.deepEqual([...goosenecks.warnings, ...panorama.warnings], []);
});

test("只定了月份：按公布日期举行的满月徒步、卢塞罗湖导览不自动排；定了日期、那天有的才排，按那天的时间", () => {
  const month = generate({ parks: ["whsa", "cave"], month: 11, days: 3, airport: "ELP" });
  assert.ok(!planned(month.trip).some((id) => id === "whsa-moonlight-hike" || id === "whsa-lake-lucero"));
  assert.ok(!Object.values(month.guide.skipped).flat().includes("whsa-moonlight-hike"));
  // 2026 年 11 月 24 日 16:30 有一场
  const dated = generate({ parks: ["whsa", "cave"], start: "2026-11-23", days: 3, airport: "ELP" });
  const day = dated.trip.days.findIndex((items) => items.some((item) => item.id === "whsa-moonlight-hike"));
  if (day >= 0) {
    assert.equal(day, 1);
    const entry = dated.timelines[1].entries.find((item) => item.id === "whsa-moonlight-hike")!;
    assert.equal(entry.start, 16 * 60 + 30);
    assert.deepEqual(entry.warnings, []);
  }
});

test("哈莱阿卡拉 3 月 3 天（卡胡卢伊进出）：山顶日出不排在刚落地那天，排在日出、凌晨从住处出发（开车一个多小时也排），每天都不太满", () => {
  const { trip, timelines } = generate({ parks: ["hale"], start: "2027-03-10", days: 3, airport: "OGG" });
  const day = trip.days.findIndex((items) => items.some((item) => item.id === "hale-sunrise"));
  assert.ok(day > 0, `山顶日出排在第 ${day + 1} 天`);
  const timeline = timelines[day];
  const entry = timeline.entries.find((item) => item.id === "hale-sunrise")!;
  assert.equal(entry.slot, "sunrise");
  assert.equal(timeline.entries[0].id, "hale-sunrise");
  assert.ok(timeline.departAt !== undefined && timeline.departAt < 5 * 60 + 30, `${timeline.departAt} 才出发`);
  for (const t of timelines) assert.equal(t.overloaded, false);
});

test("夏威夷火山 4 月 3 天（希洛进出）：看喷发的红光排在天黑以后、当天最后一站，每天都不太满", () => {
  const { trip, timelines } = generate({ parks: ["havo"], start: "2027-04-14", days: 3, airport: "ITO" });
  const day = trip.days.findIndex((items) => items.some((item) => item.id === "havo-eruption-glow"));
  assert.ok(day >= 0, "没排看喷发");
  const last = timelines[day].entries.at(-1)!;
  assert.equal(last.id, "havo-eruption-glow");
  assert.equal(last.slot, "night");
  for (const t of timelines) assert.equal(t.overloaded, false);
});

test("冰川湾 7 月 3 天（Gustavus 进出）：进湾的全天游船按每天唯一的 7:15 那班排，每天都不太满", () => {
  const { trip, timelines } = generate({ parks: ["glba"], start: "2027-07-14", days: 3, airport: "GST" });
  const day = trip.days.findIndex((items) => items.some((item) => item.id === "glba-day-boat"));
  assert.ok(day >= 0, "没排全天游船");
  const entry = timelines[day].entries.find((item) => item.id === "glba-day-boat")!;
  assert.equal(entry.start, 7 * 60 + 15);
  assert.deepEqual(entry.warnings, []);
  for (const t of timelines) assert.equal(t.overloaded, false);
});

test("卡特迈 7 月 2 天（Homer 进出）：Brooks 瀑布按 Homer 起飞的一日游排；万烟谷要在 Brooks 过夜，不排、列为要抽签的", () => {
  const { trip, guide } = generate({ parks: ["katm"], start: "2027-07-14", days: 2, airport: "HOM" });
  assert.ok(planned(trip).includes("katm-brooks-falls"), planned(trip).join());
  assert.ok(!planned(trip).includes("katm-vtts"));
  assert.ok(guide.skipped.permit.includes("katm-vtts"));
});

test("北极之门 + 德纳里 7 天（费尔班克斯进出）：第一天不空着，路上的育空河、北极圈第一天顺路看，不从 Coldfoot 折回去", () => {
  const { trip } = generate({ parks: ["gaar", "dena"], start: "2027-07-10", days: 7, airport: "FAI" });
  assert.ok(trip.days[0].length > 0, "第一天空着");
  const yukon = trip.days.findIndex((items) => items.some((item) => item.id === "gaar-yukon-river"));
  assert.ok(yukon <= 0, `育空河排在第 ${yukon + 1} 天`);
});

test("瓜达卢佩山 + 卡尔斯巴德洞窟 4 天（埃尔帕索进出）：不为 45 分钟的 Dog Canyon 专门开一天车，列为离其他景点太远", () => {
  const { trip, guide } = generate({ parks: ["gumo", "cave"], start: "2027-10-28", days: 4, airport: "ELP" });
  assert.ok(!planned(trip).includes("gumo-dog-canyon"), planned(trip).join());
  assert.ok(guide.skipped?.tooFar?.includes("gumo-dog-canyon"));
});

test("12 月去红杉与国王峡谷：Cedar Grove 那边的 Zumwalt Meadow 去不了，列在“这个月不开放”里，不排进行程", () => {
  const { trip, guide } = generate({ parks: ["seki"], month: 12, days: 3, airport: "FAT" });
  assert.ok(!planned(trip).includes("seki-zumwalt-meadow"));
  assert.ok(guide.skipped?.closed?.includes("seki-zumwalt-meadow"));
});

test("临时关闭：巨人柱 Bajada 环线山洪后封着，10 月下旬的攻略不排，列为去不了", () => {
  const { trip, guide } = generate({ parks: ["sagu"], start: "2026-10-20", days: 2, airport: "PHX" });
  for (const id of ["sagu-bajada-loop", "sagu-valley-view-overlook", "sagu-signal-hill"]) {
    assert.ok(!planned(trip).includes(id), id);
    assert.ok(guide.skipped?.closed?.includes(id), id);
  }
});

test("临时关闭只关到某一天的：关着的那天不排，挪到重开以后（Moose-Wilson Road 11 月 16 日重开）", () => {
  const { trip, timelines } = generate({ parks: ["grte"], start: "2026-11-14", days: 4, airport: "JAC" });
  const day = trip.days.findIndex((items) => items.some((item) => item.id === "grte-moose-wilson-road"));
  if (day >= 0) {
    assert.ok(day >= 2, `排在了第 ${day + 1} 天（还关着）`);
    assert.ok(!timelines[day].entries.some((entry) => entry.warnings.includes("tempClosed")));
  }
});

test("近期出发：实时公告说关了的景点（下雪封了 Trail Ridge Road）不排，列为去不了", () => {
  const ids = new Set(attractions.filter((a) => a.park === "romo" && a.area === "trail-ridge").map((a) => a.id));
  const { trip, guide } = generateWith({ parks: ["romo"], start: "2027-07-01", days: 3, airport: "DEN" }, { ids, until: "2027-07-10" });
  for (const id of ids) assert.ok(!planned(trip).includes(id), id);
  assert.ok(guide.skipped?.closed?.includes("romo-rainbow-curve"));
  // 出发那天已经过了公告管的两周：照常排
  const later = generateWith({ parks: ["romo"], start: "2027-07-01", days: 3, airport: "DEN" }, { ids, until: "2027-06-20" });
  assert.ok(planned(later.trip).some((id) => ids.has(id)));
});
