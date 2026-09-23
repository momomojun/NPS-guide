"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/config";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  // 去掉开头的 /zh-Hans 或 /zh-Hant，换成目标语言，停留在同一页
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <nav className="flex rounded-lg border border-stone-200 p-0.5 text-sm dark:border-stone-700">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest}`}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={
            locale === current
              ? "rounded-md bg-stone-900 px-2 py-0.5 text-white dark:bg-stone-100 dark:text-stone-900"
              : "rounded-md px-2 py-0.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          }
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </nav>
  );
}
