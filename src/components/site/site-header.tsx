"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileMenu, ParksMenu, type MenuRegion, type MenuText } from "@/components/site/park-menu";
import { TripNavLink } from "@/components/trip/trip-nav-link";
import type { Locale } from "@/i18n/config";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

const isScrolled = () => window.scrollY > 24;

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`hover:opacity-60 ${active ? "link-line" : ""}`}>
      {label}
    </Link>
  );
}

export function SiteHeader({
  locale,
  wordmark,
  regions,
  text,
}: {
  locale: Locale;
  wordmark: string;
  /** 页头菜单里按片区列出的公园 */
  regions: MenuRegion[];
  text: MenuText;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // 首页和公园页顶部是全屏大图：页头先透明压在图上，往下滚再变成纸色
  const overHero = pathname === `/${locale}` || pathname.startsWith(`/${locale}/parks/`);
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  const solid = !overHero || scrolled || menuOpen;

  return (
    <>
      <header
        // 换页过渡时页头固定不动（globals.css 的 site-header）
        style={{ viewTransitionName: "site-header" }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500 print:hidden ${
          solid
            ? "border-b border-line bg-paper/92 text-ink backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-black/35 to-transparent text-white"
        }`}
      >
        {/* 手机和平板上：左边标志，右边行程、简繁和菜单；宽屏（导航放得下 6 项）：左导航、中间标志、右边简繁和按钮 */}
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 whitespace-nowrap sm:px-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-6">
          <nav className="hidden items-center gap-6 text-[13px] tracking-[0.12em] lg:flex xl:gap-8">
            <ParksMenu locale={locale} regions={regions} text={text} onOpenChange={setMenuOpen} />
            <TripNavLink href={`/${locale}/plan`} label={text.plan} />
            <NavLink href={`/${locale}/when`} label={text.when} active={pathname === `/${locale}/when`} />
            <NavLink href={`/${locale}/routes`} label={text.routes} active={pathname === `/${locale}/routes`} />
            <NavLink href={`/${locale}/prices`} label={text.prices} active={pathname === `/${locale}/prices`} />
            <NavLink href={`/${locale}/rankings`} label={text.rankings} active={pathname === `/${locale}/rankings`} />
          </nav>

          <Link
            href={`/${locale}`}
            className="font-serif text-base tracking-[0.3em] uppercase sm:text-xl sm:tracking-[0.42em] lg:text-lg lg:tracking-[0.34em] xl:text-xl xl:tracking-[0.42em]"
          >
            {wordmark}
          </Link>

          <div className="flex items-center justify-end gap-5 sm:gap-6">
            <span className="text-[13px] tracking-[0.12em] lg:hidden">
              <TripNavLink href={`/${locale}/plan`} label={text.plan} />
            </span>
            <LocaleSwitcher current={locale} />
            <MobileMenu locale={locale} wordmark={wordmark} regions={regions} text={text} />
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
