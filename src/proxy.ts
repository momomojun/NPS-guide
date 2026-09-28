import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { AUTH_COOKIE, authToken, sameSecret, sitePassword } from "@/lib/site-auth";

// 台湾、香港、澳门等繁体地区默认进繁体页面，其余进简体
function pickLocale(acceptLanguage: string | null): Locale {
  for (const part of acceptLanguage?.split(",") ?? []) {
    const tag = part.split(";")[0].trim().toLowerCase();
    if (/^zh-(hant|tw|hk|mo)/.test(tag)) return "zh-Hant";
    if (tag.startsWith("zh")) return "zh-Hans";
  }
  return defaultLocale;
}

const localeOf = (pathname: string): Locale | undefined =>
  locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

/** 设了访问密码时，不用登录也能打开的：登录页和提交密码的接口 */
const OPEN = /^\/(?:api\/login|zh-Han[st]\/login)$/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 访问密码（src/lib/site-auth.ts）：没登录的页面跳到登录页，接口直接返回 401
  const password = sitePassword();
  if (password && !OPEN.test(pathname) && !sameSecret(request.cookies.get(AUTH_COOKIE)?.value ?? "", authToken(password))) {
    if (pathname.startsWith("/api/")) return Response.json({ error: "unauthorized" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = `/${localeOf(pathname) ?? pickLocale(request.headers.get("accept-language"))}/login`;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api/") || localeOf(pathname)) return;
  const url = request.nextUrl.clone();
  const locale = pickLocale(request.headers.get("accept-language"));
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 跳过 Next 内部路径和带扩展名的静态文件（图标、manifest、service worker、MapLibre worker）
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
