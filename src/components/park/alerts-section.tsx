import { Section } from "@/components/section";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { getAlerts } from "@/lib/nps";
import { settle } from "@/lib/settle";
import { stripHtml } from "@/lib/text";
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

export async function AlertsSection({ parkCode, dict }: { parkCode: string; dict: Dictionary }) {
  const t = dict.park.alerts;
  const result = await settle(getAlerts(parkCode));

  return (
    <Section title={t.title} source={t.source}>
      {!result.ok ? (
        <ApiUnavailable error={result.error} dict={dict} />
      ) : result.data.length === 0 ? (
        <p className="text-sm text-mute">{t.empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {result.data.map((alert) => {
            const date = alert.lastIndexedDate.slice(0, 10);
            return (
              <li key={alert.id} className="py-5 first:pt-0">
                <p className={`eyebrow ${categoryStyles[alert.category] ?? defaultCategoryStyle}`}>
                  {t.categories[alert.category] ?? alert.category}
                </p>
                <div className="mt-2">
                  <h4 className="font-serif text-lg leading-snug">
                    {alert.url ? (
                      <a href={alert.url} target="_blank" rel="noreferrer" className="hover:text-clay-700">
                        {alert.title}
                      </a>
                    ) : (
                      alert.title
                    )}
                  </h4>
                </div>
                <p className="mt-2 text-sm leading-7 text-ink-soft">
                  {stripHtml(alert.description)}
                </p>
                <p className="mt-2 text-xs text-mute">
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
