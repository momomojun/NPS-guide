import { createHash, timingSafeEqual } from "node:crypto";

// 部署后的访问密码：设了 SITE_PASSWORD，打开网站要先输密码（自用阶段只给自己和同行的人看）；
// 本机开发不设就不用输。登录后浏览器里存一个 cookie，值是密码的哈希，改了密码就要重新登录。

export const AUTH_COOKIE = "nps-auth";
/** 输一次密码，这台设备一年内不用再输 */
export const AUTH_MAX_AGE = 365 * 24 * 60 * 60;

export function sitePassword(): string | null {
  return process.env.SITE_PASSWORD || null;
}

export function authToken(password: string): string {
  return createHash("sha256").update(`nps-guide:${password}`).digest("hex");
}

/** 比较两个字符串，用时和内容无关（防止按响应时间一位一位猜） */
export function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
