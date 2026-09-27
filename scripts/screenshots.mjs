// README 用的网页截图：用本机装好的 Chrome / Edge（puppeteer-core，不另外下载浏览器）打开网站，
// 截首页、公园页、行程页、什么时候去、博主路线、价格页和手机版，存到 docs/screenshots/，另外合成一张 GitHub 社交预览图。
// 先把网站开着（npm run dev，或者 npm run build && npm run start），再 npm run docs:screenshots。
// BASE=http://localhost:3001 换地址；CHROME=浏览器路径；ONLY=home,plan 只截其中几张。
// 行程页的截图是现场用“自动生成攻略”排的：黄石 + 大提顿 5 天，出发日期取两周后。
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = new URL("../docs/screenshots/", import.meta.url);
const ONLY = process.env.ONLY?.split(",").filter(Boolean);
const CHROME =
  process.env.CHROME ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((path) => existsSync(path));
if (!CHROME) throw new Error("找不到 Chrome / Edge，用 CHROME=浏览器路径 指定");

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const QUALITY = 84;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const file = (name) => new URL(name, OUT);
/** 两周后的日期：天气预报能覆盖到，行程页会显示每天的天气 */
const tripDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

/** 开发模式左下角的 Next.js 按钮、右下角的“回到顶部”不要进截图 */
const HIDE_DEV_UI = 'nextjs-portal,[aria-label="回到顶部"]{display:none!important}';

async function openPage(browser, { width, height, scale = 1, mobile = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile });
  // 跳过开场动画（记成刚播过）
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("nps-intro", String(Date.now()));
    } catch {
      // 忽略
    }
  });
  return page;
}

async function go(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 90000 });
  await page.addStyleTag({ content: HIDE_DEV_UI });
  await page.evaluate(() => document.fonts.ready);
}

/** 等屏幕里看得到的图片都加载完（屏幕外的懒加载图片不管） */
async function imagesLoaded(page, timeout = 15000) {
  await page
    .waitForFunction(
      () =>
        [...document.images].every((image) => {
          const box = image.getBoundingClientRect();
          const visible = box.bottom > 0 && box.top < innerHeight && box.width > 0;
          return !visible || image.complete;
        }),
      { timeout, polling: 250 },
    )
    .catch(() => console.warn("  有图片没加载完，照样截"));
}

/** 滚到某个区块的开头（区块自己带 scroll-margin，避开吸顶的导航），等滚动渐显和图片；offset 是再往下滚多少 */
async function scrollTo(page, selector, settle = 1800, offset = 0) {
  await page.waitForSelector(selector, { timeout: 60000 });
  await page.evaluate(
    (sel, extra) => {
      document.querySelector(sel).scrollIntoView({ block: "start", behavior: "instant" });
      if (extra) window.scrollBy({ top: extra, behavior: "instant" });
    },
    selector,
    offset,
  );
  await sleep(settle);
  await imagesLoaded(page);
}

/** 地图画完：有画布，而且一段时间内不再有新的瓦片请求 */
async function mapSettled(page, quietMs = 2500, timeout = 30000) {
  await page.waitForSelector(".maplibregl-canvas", { timeout });
  await page.waitForNetworkIdle({ idleTime: quietMs, timeout }).catch(() => console.warn("  地图瓦片一直在加载，照样截"));
}

async function shot(page, name, options = {}) {
  await page.screenshot({ path: file(name), type: "jpeg", quality: QUALITY, ...options });
  console.log(`  ✓ ${name}`);
}

/** 点一个文字里带 text 的按钮 */
async function clickText(page, selector, text) {
  const ok = await page.evaluate(
    (sel, t) => {
      const target = [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(t));
      target?.click();
      return Boolean(target);
    },
    selector,
    text,
  );
  if (!ok) throw new Error(`找不到按钮：${text}`);
}

/** 用“自动生成攻略”排一个黄石 + 大提顿 5 天的行程（存在这个浏览器的 localStorage 里，后面的截图接着用） */
async function generateTrip(page) {
  await go(page, `/zh-Hans/plan?park=yell&date=${tripDate}`);
  await page.waitForSelector("#plan-wizard form", { timeout: 60000 });
  await clickText(page, "#plan-wizard button", "大提顿");
  await page.evaluate(() => {
    const select = [...document.querySelectorAll("#plan-wizard select")].find((el) => [...el.options].some((o) => o.text === "5 天"));
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
    setter.call(select, "5");
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await sleep(300);
  await clickText(page, "#plan-wizard button[type=submit]", "生成");
  await page.waitForSelector("#plan-overview", { timeout: 60000 });
  // 出发地、回程地到各景点的车程要在浏览器里现查
  await page.waitForNetworkIdle({ idleTime: 2000, timeout: 60000 }).catch(() => {});
}

const shots = {
  async home(browser) {
    const page = await openPage(browser, DESKTOP);
    await go(page, "/zh-Hans");
    await page.waitForFunction(() => document.documentElement.dataset.heroReady === "1", { timeout: 30000 }).catch(() => {});
    await sleep(2600);
    await shot(page, "home.jpg");
    await page.close();
  },

  async park(browser) {
    const page = await openPage(browser, DESKTOP);
    await go(page, "/zh-Hans/parks/yell");
    await scrollTo(page, "#attractions");
    // 地图是进入视野后才创建的，等它出来再量位置
    await page.waitForSelector("#attractions .maplibregl-canvas", { timeout: 30000 });
    const toMap = await page.evaluate(() => document.querySelector("#attractions .maplibregl-canvas").getBoundingClientRect().top);
    await page.evaluate((y) => window.scrollBy({ top: y - 150, behavior: "instant" }), toMap);
    await sleep(1500);
    await imagesLoaded(page);
    await mapSettled(page);
    await shot(page, "park.jpg");
    await page.close();
  },

  async plan(browser) {
    const page = await openPage(browser, DESKTOP);
    await generateTrip(page);
    await scrollTo(page, "#plan-overview", 2500);
    await mapSettled(page);
    await shot(page, "plan.jpg");
    await scrollTo(page, "#plan-day-1", 2000);
    await mapSettled(page);
    await shot(page, "plan-day.jpg");
    await scrollTo(page, "#plan-budget", 1800);
    await shot(page, "plan-budget.jpg");
    await page.close();
  },

  async when(browser) {
    const page = await openPage(browser, DESKTOP);
    await go(page, "/zh-Hans/when");
    await sleep(2000);
    await shot(page, "when.jpg");
    await page.close();
  },

  async routes(browser) {
    const page = await openPage(browser, DESKTOP);
    await go(page, "/zh-Hans/routes");
    await page.evaluate(() => window.scrollTo({ top: 260, behavior: "instant" }));
    await sleep(1500);
    await shot(page, "routes.jpg");
    await page.close();
  },

  async prices(browser) {
    const page = await openPage(browser, DESKTOP);
    await go(page, "/zh-Hans/prices");
    await scrollTo(page, "#gas");
    await shot(page, "prices.jpg");
    await page.close();
  },

  /** 手机上的三屏：首页、行程的一天、公园的景点列表，合成一张 */
  async mobile(browser) {
    const page = await openPage(browser, { ...PHONE, scale: 2, mobile: true });
    await go(page, "/zh-Hans");
    await page.waitForFunction(() => document.documentElement.dataset.heroReady === "1", { timeout: 30000 }).catch(() => {});
    await sleep(2600);
    const home = await page.screenshot({ type: "jpeg", quality: QUALITY });
    // 手机上行程要有内容：沿用 plan 截图时排好的行程；单独截手机版时现排一个
    const hasTrip = await page.evaluate(() => Boolean(localStorage.getItem("nps-guide:trip")));
    if (!hasTrip) await generateTrip(page);
    await go(page, "/zh-Hans/plan");
    await scrollTo(page, "#plan-day-1", 2000);
    const plan = await page.screenshot({ type: "jpeg", quality: QUALITY });
    await go(page, "/zh-Hans/parks/yell");
    await scrollTo(page, "#attractions", 2000, 560);
    await imagesLoaded(page);
    const park = await page.screenshot({ type: "jpeg", quality: QUALITY });
    await page.close();

    const frame = (image) => `<div class="phone"><img src="data:image/jpeg;base64,${Buffer.from(image).toString("base64")}"></div>`;
    const sheet = await openPage(browser, { width: 1440, height: 900, scale: 1 });
    await sheet.setContent(
      `<style>
        body{margin:0;height:900px;display:flex;align-items:center;justify-content:center;gap:56px;background:#ebe4d8}
        .phone{width:360px;height:779px;border:12px solid #1c1b18;border-radius:46px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(28,27,24,.45);background:#1c1b18}
        .phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
      </style>${frame(home)}${frame(plan)}${frame(park)}`,
    );
    await sleep(500);
    await shot(sheet, "mobile.jpg");
    await sheet.close();
  },

  /** GitHub 仓库的社交预览图（1280×640）：左边站名和一句话，右边露出手机版的行程和景点两屏 */
  async social(browser) {
    if (!existsSync(file("mobile.jpg"))) throw new Error("先截 mobile.jpg（ONLY=mobile）");
    const phones = readFileSync(file("mobile.jpg")).toString("base64");
    const page = await openPage(browser, { width: 1280, height: 640, scale: 1 });
    await go(page, "/zh-Hans/routes");
    // 借用网站自己加载好的字体（Cormorant Garamond、思源宋体、Jost）
    const fonts = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      const serif = getComputedStyle(document.querySelector("h1")).fontFamily;
      // 字体名里有双引号，放进 style 属性前换成单引号
      return { sans: style.fontFamily.replaceAll('"', "'"), serif: serif.replaceAll('"', "'") };
    });
    await page.evaluate(
      (phonesImage, fonts) => {
        document.body.innerHTML = `
          <div style="position:fixed;inset:0;z-index:9999;background:#f4efe7;color:#1c1b18;display:grid;grid-template-columns:520px 1fr;overflow:hidden">
            <div style="padding:64px 0 56px 72px;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <p style="margin:0;font-family:${fonts.serif};font-size:30px;letter-spacing:.42em;text-transform:uppercase">NPS Guide</p>
                <p style="margin:18px 0 0;font-family:${fonts.sans};font-size:13px;letter-spacing:.2em;color:#8a8175">US NATIONAL PARKS · TRIP PLANNER</p>
              </div>
              <div>
                <p style="margin:0;font-family:${fonts.serif};font-size:50px;line-height:1.25">美国国家公园<br>按日期规划行程</p>
                <p style="margin:26px 0 0;font-family:${fonts.sans};font-size:18px;line-height:1.8;color:#4b463f">什么开着、要不要预约、住哪、去哪加油充电、<br>大概花多少钱，一键生成攻略</p>
              </div>
              <p style="margin:0;font-family:${fonts.sans};font-size:15px;letter-spacing:.08em;color:#8a8175">16 座公园 · 279 个景点 · 中文 · 离线可用</p>
            </div>
            <div style="position:relative;overflow:hidden;background:#ebe4d8">
              <img src="data:image/jpeg;base64,${phonesImage}" style="position:absolute;left:-388px;top:-8px;width:1140px;max-width:none">
            </div>
          </div>`;
      },
      phones,
      fonts,
    );
    // 新出现的汉字要现加载对应的字体分片
    await page.evaluate(() => document.fonts.ready);
    await sleep(1200);
    await page.screenshot({ path: new URL("../social-preview.jpg", OUT), type: "jpeg", quality: 88 });
    console.log("  ✓ ../social-preview.jpg");
    await page.close();
  },
};

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  // 没有显卡时用软件渲染 WebGL，地图才画得出来
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--lang=zh-CN"],
});
try {
  for (const [name, run] of Object.entries(shots)) {
    if (ONLY && !ONLY.includes(name)) continue;
    console.log(name);
    await run(browser);
  }
} finally {
  await browser.close();
}
