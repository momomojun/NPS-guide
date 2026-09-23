import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

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
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href={`/${locale}`} className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">{dict.site.name}</span>
              <span className="hidden text-sm text-stone-500 sm:inline">{dict.site.tagline}</span>
            </Link>
            <LocaleSwitcher current={locale} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 dark:border-stone-800">
          <p className="mx-auto max-w-5xl px-4">{dict.footer.sources}</p>
        </footer>
      </body>
    </html>
  );
}
