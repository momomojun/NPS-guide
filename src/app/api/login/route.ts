import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, AUTH_MAX_AGE, authToken, sameSecret, sitePassword } from "@/lib/site-auth";

/** 登录后回到哪：只接受站内的路径，免得被跳到别的网站 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

/** 登录页的表单提交到这里：密码对了存 cookie 回到原来的页面，不对回登录页 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const next = safeNext(form.get("next"));
  const password = sitePassword();
  const given = String(form.get("password") ?? "");

  if (password && !sameSecret(authToken(given), authToken(password))) {
    // 输错了稍等一下再回去，别让人一秒试几百次
    await new Promise((resolve) => setTimeout(resolve, 800));
    const locale = /^\/zh-Hant(\/|$)/.test(next) ? "zh-Hant" : "zh-Hans";
    const back = new URL(`/${locale}/login`, request.url);
    back.searchParams.set("next", next);
    back.searchParams.set("error", "1");
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  if (password) {
    response.cookies.set({
      name: AUTH_COOKIE,
      value: authToken(password),
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_MAX_AGE,
    });
  }
  return response;
}
