import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Noto_Serif_SC, Noto_Serif_TC } from "next/font/google";
import { notFound } from "next/navigation";
import { BackToTop } from "@/components/site/back-to-top";
import { OfflineBanner, ServiceWorkerRegister } from "@/components/site/offline";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { parks, regionOrder } from "@/data/parks";
import { hasLocale, locales } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

// 标题：英文 Cormorant Garamond + 中文思源宋体；正文：Jost + 系统黑体
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant" });
// 中文字体按字符分片，浏览器只下载页面用到的分片，所以不预加载
const serifSc = Noto_Serif_SC({ variable: "--font-serif-sc", preload: false });
const serifTc = Noto_Serif_TC({ variable: "--font-serif-tc", preload: false });

// 页面绘制前执行：标记 JS 可用（滚动渐显的元素这时才先藏起来）；本次会话看过开场动画（或者系统减弱动态效果）就不再播，
// 还没播过而且打开的是首页，就先让首屏文字停在起点，等幕布拉开
const bootScript =
  'var h=document.documentElement;h.classList.add("js");try{if(sessionStorage.getItem("nps-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)h.classList.add("intro-seen");else if(location.pathname.split("/").filter(Boolean).length<=1)h.classList.add("intro-playing")}catch(e){}';

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
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const regions = regionOrder
    .map((region) => ({
      id: region,
      label: dict.regions[region],
      parks: parks
        .filter((park) => park.region === region)
        .map((park) => ({ code: park.code, nameZh: localize(park.nameZh, locale), nameEn: park.nameEn, bestMonths: park.bestMonths })),
    }))
    .filter((region) => region.parks.length > 0);

  return (
    <html
      lang={locale}
      // bootScript 会在水合前给 html 加 class
      suppressHydrationWarning
      // 页面内锚点平滑滚动，换页时直接跳到顶部（Next 16 默认不再在换页时关掉 smooth，长页面回首页会慢慢滚上去）
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${cormorant.variable} ${serifSc.variable} ${serifTc.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <SiteHeader
          locale={locale}
          wordmark={dict.site.wordmark}
          regions={regions}
          text={{
            parks: dict.nav.parks,
            plan: dict.nav.plan,
            when: dict.nav.when,
            routes: dict.nav.routes,
            prices: dict.nav.prices,
            start: dict.nav.start,
            allParks: dict.nav.allParks,
            inSeason: dict.nav.inSeason,
            menu: dict.nav.menu,
            close: dict.nav.close,
          }}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
        <BackToTop label={dict.nav.backToTop} />
        <OfflineBanner label={dict.common.offline} />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
