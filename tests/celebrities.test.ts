import assert from "node:assert/strict";
import { test } from "node:test";
import { attractions } from "../src/data/attractions";
import { celebrityShots } from "../src/data/celebrities";
import { parks } from "../src/data/parks";

test("明星同款：公园、景点都存在，有报道来源，链接和日期格式对", () => {
  const parkCodes = new Set(parks.map((park) => park.code));
  const byId = new Map(attractions.map((a) => [a.id, a]));
  const ids = new Set<string>();
  for (const shot of celebrityShots) {
    assert.ok(!ids.has(shot.id), `重复：${shot.id}`);
    ids.add(shot.id);
    assert.ok(parkCodes.has(shot.park), `没有这个公园：${shot.park}`);
    if (shot.attraction) {
      assert.equal(byId.get(shot.attraction)?.park, shot.park, `${shot.id} 的景点不在这座公园：${shot.attraction}`);
    }
    assert.match(shot.date, /^\d{4}-\d{2}(-\d{2})?$/);
    assert.ok(shot.sources.length > 0, `${shot.id} 没有报道来源`);
    for (const url of [shot.postUrl, shot.profileUrl, ...shot.sources].filter(Boolean)) assert.match(url!, /^https:\/\//);
    // 原帖、主页都没有的要在说明里写清楚
    if (!shot.postUrl) assert.ok(shot.noteZh, `${shot.id} 没有原帖链接，要写明`);
    assert.ok(shot.shotZh.length > 20 && shot.howToZh.length > 20);
  }
});
