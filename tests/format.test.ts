import assert from "node:assert/strict";
import { test } from "node:test";
import { localize } from "../src/i18n/convert";
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

test("繁体：音译地名里的“里”、不湿的“干”不转错", () => {
  assert.equal(localize("德纳里峰", "zh-Hant"), "德納里峰");
  assert.equal(localize("马里波萨巨杉林", "zh-Hant"), "馬里波薩巨杉林");
  assert.equal(localize("沿干河床走到干湖", "zh-Hant"), "沿乾河床走到乾湖");
  assert.equal(localize("干龟岛、维尔京群岛", "zh-Hant"), "乾龜島、維京群島");
  // 该转的照样转：里面、树干
  assert.equal(localize("峡谷里的树干", "zh-Hant"), "峽谷裡的樹幹");
  assert.equal(localize("约 2,000 米", "zh-Hant"), "約 2,000 公尺");
});

test("繁体：台湾用语别换过头（窗口、分区），十几分钟、公交也转对", () => {
  assert.equal(localize("要在预约的 2 小时窗口内进园", "zh-Hant"), "要在預約的 2 小時窗口內進園");
  assert.equal(localize("按环线分区玩", "zh-Hant"), "按環線分區玩");
  assert.equal(localize("开车只隔十几分钟", "zh-Hant"), "開車只隔十幾分鐘");
  assert.equal(localize("坐 Roam 6 路公交", "zh-Hant"), "坐 Roam 6 路公車");
  // 该换的照样换：视频→影片、信息→資訊
  assert.equal(localize("视频里的信息", "zh-Hant"), "影片裡的資訊");
});
