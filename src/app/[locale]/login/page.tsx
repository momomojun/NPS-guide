import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buttonLarge } from "@/components/ui";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: getDictionary(locale).login.title, robots: { index: false, follow: false } };
}

/** 部署时设了访问密码（SITE_PASSWORD），没登录的页面都会跳到这里；表单交给 /api/login */
export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const { next, error } = await searchParams;
  const t = getDictionary(locale).login;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-28">
      <p className="eyebrow text-mute">{t.eyebrow}</p>
      <h1 className="mt-5 font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight">{t.title}</h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">{t.intro}</p>
      <form method="post" action="/api/login" className="mt-12 space-y-8">
        <input type="hidden" name="next" value={typeof next === "string" ? next : `/${locale}`} />
        <label className="eyebrow block text-mute">
          {t.password}
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-3 block w-full border-b border-ink/30 bg-transparent py-2 text-base tracking-normal normal-case text-ink outline-none focus:border-ink"
          />
        </label>
        {error && <p className="text-sm text-clay-700">{t.error}</p>}
        <button type="submit" className={`${buttonLarge} bg-ink text-paper hover:bg-clay-700`}>
          {t.submit}
        </button>
      </form>
    </div>
  );
}
