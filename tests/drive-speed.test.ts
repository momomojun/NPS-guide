import assert from "node:assert/strict";
import { test } from "node:test";
import { correctedMinutes } from "../src/lib/drive-speed";

const MILE = 1609;

test("主要走高速的长途（平均车速快）按比例缩短：拉斯维加斯到锡安约 175 分钟", () => {
  assert.equal(correctedMinutes(227 * 60, 172 * MILE), 175);
  assert.equal(correctedMinutes(284 * 60, 239 * MILE), 219);
});

test("山路、园区里的路（平均车速慢）不改", () => {
  assert.equal(correctedMinutes(150 * 60, 93 * MILE), 150);
  assert.equal(correctedMinutes(30 * 60, 8 * MILE), 30);
});

test("OSRM 已经按限速算得快的（平均 54 英里/时以上）不再缩短：冰川南边的 2 号公路约 1 小时", () => {
  assert.equal(correctedMinutes(63 * 60, 63 * MILE), 63);
  assert.equal(correctedMinutes(63 * 60, 56 * MILE), 60);
});

test("中间的车速逐渐过渡，不会突然跳", () => {
  const minutes = [39, 40, 41, 42, 43, 44, 45, 46].map((mph) => correctedMinutes(3600, mph * MILE));
  for (let k = 1; k < minutes.length; k++) assert.ok(minutes[k] <= minutes[k - 1] && minutes[k - 1] - minutes[k] <= 5);
  assert.equal(minutes[0], 60);
  assert.equal(minutes.at(-1), 46);
});
