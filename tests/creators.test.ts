import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import { creatorRoutes } from "../src/data/creators";
import { parks } from "../src/data/parks";

const byId = new Map(attractions.map((a) => [a.id, a]));
const parkCodes = new Set(parks.map((park) => park.code));
// 路线里的地点：景点 id（"zion-angels-landing"）或中文地名
const looksLikeId = (stop: string) => /^[a-z]{4}-[a-z0-9-]+$/.test(stop);

test("博主路线：id 不重复、和平台对得上，视频有时长、图文没有", () => {
  assert.equal(new Set(creatorRoutes.map((route) => route.id)).size, creatorRoutes.length);
  for (const route of creatorRoutes) {
    assert.match(route.id, route.platform === "youtube" ? /^yt-/ : /^bili-/, route.id);
    assert.match(route.published, /^\d{4}-\d{2}$/, route.id);
    assert.ok(Number.isInteger(route.views) && route.views > 0, route.id);
    const article = route.format === "article";
    assert.equal(article, route.basis === "article", `${route.id}：图文按图文整理，视频不会`);
    assert.equal(route.durationMin === undefined, article, `${route.id}：视频写时长，图文不写`);
    assert.ok(route.summary.length > 0, route.id);
  }
});

test("博主路线：公园都存在，路线和评价里的景点 id 都收录了、属于这条路线的公园", () => {
  for (const route of creatorRoutes) {
    for (const code of route.parks) assert.ok(parkCodes.has(code), `${route.id}：${code}`);
    const stops = [...(route.route?.flatMap((day) => day.stops) ?? []), ...(route.notes?.map((note) => note.stop) ?? [])];
    for (const stop of stops.filter(looksLikeId)) {
      const attraction = byId.get(stop);
      assert.ok(attraction, `${route.id}：没有 ${stop} 这个景点`);
      assert.ok(route.parks.includes(attraction.park), `${route.id}：${stop} 不在 ${route.parks.join("、")}`);
    }
    // 博主评价显示在景点卡片上，只能写收录了的景点
    for (const note of route.notes ?? []) assert.ok(byId.has(note.stop), `${route.id}：评价写在 ${note.stop} 上`);
    // 按天排的路线能一键排进行程，至少要有一天有收录的景点
    if (route.byDay) assert.ok(route.route?.some((day) => day.stops.some((stop) => byId.has(stop))), route.id);
  }
});
