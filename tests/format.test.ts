import assert from "node:assert/strict";
import { test } from "node:test";
import { fill, tidyChinese } from "../src/i18n/format";

test("汉字紧挨着英文、数字开头或结尾的值补空格", () => {
  assert.equal(
    fill("第 {day} 天要走{road}：", { day: 2, road: "Stevens Canyon Road（史蒂文斯峡谷路）" }),
    "第 2 天要走 Stevens Canyon Road（史蒂文斯峡谷路）：",
  );
  assert.equal(fill("，住{names}", { names: "National Park Inn" }), "，住 National Park Inn");
  assert.equal(fill("（{states}均价）", { states: "WA、OR" }), "（WA、OR 均价）");
  assert.equal(fill("在那个月{days}申请", { days: "1–15 日" }), "在那个月 1–15 日申请");
});

test("已经有空格、挨着标点或者值是中文的不动", () => {
  assert.equal(fill("近 {n} 年", { n: 20 }), "近 20 年");
  assert.equal(fill("去{name}看日出", { name: "倒影湖" }), "去倒影湖看日出");
  assert.equal(fill("{year} 年：{open}通车", { year: 2026, open: "5 月 22 日" }), "2026 年：5 月 22 日通车");
  assert.equal(fill("{date}{time}开订", { date: "1 月 5 日", time: " 7:00（太平洋时间）" }), "1 月 5 日 7:00（太平洋时间）开订");
  assert.equal(fill("从{from}去", { from: "" }), "从去");
  assert.equal(fill("https://tiles/{z}/{x}/{y}.png", { z: 8, x: 41, y: 99 }), "https://tiles/8/41/99.png");
  assert.equal(fill("还没有 {missing}", {}), "还没有 {missing}");
});

test("机器翻译：汉字和英文、数字之间补空格，去掉括号里的空格", () => {
  assert.equal(
    tidyChinese("白河路（ White River Road ）和白河露营地（ WR Campground ）于2026年9月27日起关闭"),
    "白河路（White River Road）和白河露营地（WR Campground）于 2026 年 9 月 27 日起关闭",
  );
  assert.equal(tidyChinese("雷尼尔山Fryingpan Creek桥梁更换项目"), "雷尼尔山 Fryingpan Creek 桥梁更换项目");
  assert.equal(tidyChinese("到 2029 年， Fryingpan Creek Bridge 两侧 ；"), "到 2029 年，Fryingpan Creek Bridge 两侧；");
  assert.equal(tidyChinese("已经有空格的 SR 165 不变"), "已经有空格的 SR 165 不变");
});
