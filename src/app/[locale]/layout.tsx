import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Noto_Serif_SC, Noto_Serif_TC } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

// 标题：英文 Cormorant Garamond + 中文思源宋体；正文：Jost + 系统黑体
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant" });
// 中文字体按字符分片，浏览器只下载页面用到的分片，所以不预加载
const serifSc = Noto_Serif_SC({ variable: "--font-serif-sc", preload: false });
const serifTc = Noto_Serif_TC({ variable: "--font-serif-tc", preload: false });

// 页面绘制前执行：标记 JS 可用（滚动渐显的元素这时才先藏起来）；本次会话看过开场动画就不再播
const bootScript =
  'document.documentElement.classList.add("js");try{if(sessionStorage.getItem("nps-intro"))document.documentElement.classList.add("intro-seen")}catch(e){}';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const { site } = getDictionary(locale);
  return {
    title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
    description: site.description,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      // bootScript 会在水合前给 html 加 class
      suppressHydrationWarning
      className={`${jost.variable} ${cormorant.variable} ${serifSc.variable} ${serifTc.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <SiteHeader
          locale={locale}
          wordmark={dict.site.wordmark}
          text={{ parks: dict.nav.parks, plan: dict.nav.plan, start: dict.nav.start }}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  );
}
