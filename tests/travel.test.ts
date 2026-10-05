import assert from "node:assert/strict";
import { test } from "node:test";
import { NO_ROAD_MIN, travelMinutes } from "../src/lib/travel";

test("车程表：不通公路的两点（夏威夷和本土、两座夏威夷的岛）按很远算，不按半小时；同一座岛上照常查表", () => {
  assert.equal(travelMinutes("havo-uekahuna", "yose-tunnel-view"), NO_ROAD_MIN);
  assert.equal(travelMinutes("havo-uekahuna", "hale-sunrise"), NO_ROAD_MIN);
  const summit = travelMinutes("havo-uekahuna", "havo-nahuku");
  assert.ok(summit > 0 && summit < 60, `${summit}`);
});
