import { Section } from "@/components/section";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import type { Locale } from "@/i18n/config";
import { translateAlerts } from "@/lib/alert-translate";
import { getAlerts } from "@/lib/nps";
import { settle } from "@/lib/settle";
import { daysSince } from "@/lib/time";
import { ApiUnavailable } from "./api-unavailable";

// 超过半年没更新的公告，NPS 可能忘了撤
const STALE_AFTER_DAYS = 180;

// 公告类别只用文字颜色区分：关闭、危险用砂岩红，注意用赭石色，其余灰色
const categoryStyles: Record<string, string> = {
  "Park Closure": "text-clay-700",
  Danger: "text-clay-700",
  Caution: "text-[#9a6a1f]",
  Information: "text-mute",
};

const defaultCategoryStyle = "text-mute";

export async function AlertsSection({
  parkCode,
  officialUrl,
  dict,
  locale,
}: {
  /** 查 NPS 公告用的代码；null 表示不归 NPS 管（加拿大公园、部落公园等） */
  parkCode: string | null;
  officialUrl?: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.park.alerts;
  if (!parkCode) {
    return (
      <Section title={t.title}>
        <p className="text-sm leading-7 text-ink-soft">{t.notNps}</p>
        {officialUrl && (
          <a href={officialUrl} target="_blank" rel="noreferrer" className="link-line mt-3 inline-block text-xs text-ink">
            {t.officialSite}
          </a>
        )}
      </Section>
    );
  }
  const result = await settle(getAlerts(parkCode));
  const translated = result.ok ? await translateAlerts(result.data, locale) : [];

  return (
    <Section title={t.title} source={t.source}>
      {!result.ok ? (
        <ApiUnavailable error={result.error} dict={dict} />
      ) : result.data.length === 0 ? (
        <p className="text-sm text-mute">{t.empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {result.data.map((alert, i) => {
            const date = alert.lastIndexedDate.slice(0, 10);
            const zh = translated[i];
            return (
              <li key={alert.id} className="py-5 first:pt-0">
                <p className={`eyebrow ${categoryStyles[alert.category] ?? defaultCategoryStyle}`}>
                  {t.categories[alert.category] ?? alert.category}
                </p>
                <div className="mt-2">
                  <h4 className="font-serif text-lg leading-snug">
                    {alert.url ? (
                      <a href={alert.url} target="_blank" rel="noreferrer" className="hover:text-clay-700">
                        {zh.titleZh ?? zh.title}
                      </a>
                    ) : (
                      (zh.titleZh ?? zh.title)
                    )}
                  </h4>
                  {zh.titleZh && <p className="mt-1 text-xs tracking-[0.04em] text-mute">{zh.title}</p>}
                </div>
                {zh.descriptionZh && <p className="mt-2 text-sm leading-7 text-ink-soft">{zh.descriptionZh}</p>}
                <p className={zh.descriptionZh ? "mt-2 border-l border-line pl-3 text-xs leading-6 text-mute" : "mt-2 text-sm leading-7 text-ink-soft"}>
                  {zh.descriptionZh && <span className="mr-1.5 text-[11px] tracking-[0.1em] text-ink-soft">{t.original}</span>}
                  {zh.description}
                </p>
                <p className="mt-2 text-xs text-mute">
                  {zh.translator ? `${fill(t.translatedBy, { provider: zh.translator })} · ` : `${t.noTranslation} · `}
                  {fill(t.updated, { date })}
                  {daysSince(date) > STALE_AFTER_DAYS && (
                    <span className="ml-2 text-clay-700">· {t.stale}</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
