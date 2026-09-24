"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { localeLabels, locales, type Locale } from "@/i18n/config";

/** 简体 / 繁體，颜色跟随页头 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  // 去掉开头的 /zh-Hans 或 /zh-Hant，换成目标语言，停留在同一页
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <nav className="flex items-center gap-2 text-[13px] tracking-[0.08em]">
      {locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 && <span className="opacity-30">/</span>}
          <Link
            href={`/${locale}${rest}`}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={locale === current ? "" : "opacity-45 transition-opacity hover:opacity-100"}
          >
            {localeLabels[locale]}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
