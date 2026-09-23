import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

// 台湾、香港、澳门等繁体地区默认进繁体页面，其余进简体
function pickLocale(acceptLanguage: string | null): Locale {
  for (const part of acceptLanguage?.split(",") ?? []) {
    const tag = part.split(";")[0].trim().toLowerCase();
    if (/^zh-(hant|tw|hk|mo)/.test(tag)) return "zh-Hant";
    if (tag.startsWith("zh")) return "zh-Hans";
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasPrefix) return;

  const url = request.nextUrl.clone();
  const locale = pickLocale(request.headers.get("accept-language"));
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 跳过 Next 内部路径和带扩展名的静态文件
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
