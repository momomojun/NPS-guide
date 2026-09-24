"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TripNavLink } from "@/components/trip/trip-nav-link";
import type { Locale } from "@/i18n/config";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

const isScrolled = () => window.scrollY > 24;

export function SiteHeader({
  locale,
  wordmark,
  text,
}: {
  locale: Locale;
  wordmark: string;
  text: { parks: string; plan: string; start: string };
}) {
  const pathname = usePathname();
  // 首页和公园页顶部是全屏大图：页头先透明压在图上，往下滚再变成纸色
  const overHero = pathname === `/${locale}` || pathname.startsWith(`/${locale}/parks/`);
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  const solid = !overHero || scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500 ${
          solid
            ? "border-b border-line bg-paper/92 text-ink backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-black/35 to-transparent text-white"
        }`}
      >
        {/* 手机上：左边标志，右边行程和简繁；宽屏：左导航、中间标志、右边简繁和按钮 */}
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 whitespace-nowrap sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-10">
          <nav className="hidden items-center gap-8 text-[13px] tracking-[0.12em] sm:flex">
            <Link href={`/${locale}#parks`} className="hover:opacity-60">
              {text.parks}
            </Link>
            <TripNavLink href={`/${locale}/plan`} label={text.plan} />
          </nav>

          <Link
            href={`/${locale}`}
            className="font-serif text-base tracking-[0.3em] uppercase sm:text-xl sm:tracking-[0.42em]"
          >
            {wordmark}
          </Link>

          <div className="flex items-center justify-end gap-5 sm:gap-6">
            <span className="text-[13px] tracking-[0.12em] sm:hidden">
              <TripNavLink href={`/${locale}/plan`} label={text.plan} />
            </span>
            <LocaleSwitcher current={locale} />
            <Link
              href={`/${locale}/plan`}
              className={`hidden px-4 py-2 text-xs tracking-[0.14em] transition-colors duration-300 md:inline-block ${
                solid ? "bg-ink text-paper hover:bg-clay-700" : "border border-white/60 hover:bg-white hover:text-ink"
              }`}
            >
              {text.start}
            </Link>
          </div>
        </div>
      </header>
      {/* 没有大图的页面，内容从页头下方开始 */}
      {!overHero && <div aria-hidden className="h-16" />}
    </>
  );
}
