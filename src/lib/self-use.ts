import "server-only";

/**
 * 自用阶段的“低频抓取”（机票结果页、Google 翻译网页接口、AAA 油价）开不开：
 * 开发时默认开；部署后要设 SELF_USE_SCRAPE=1（旧名 PRICE_SCRAPE=1 也认）才开，公开上线别开，换正式接口
 */
export function selfUseScrape(): boolean {
  const flag = process.env.SELF_USE_SCRAPE || process.env.PRICE_SCRAPE;
  return flag ? flag === "1" : process.env.NODE_ENV !== "production";
}
