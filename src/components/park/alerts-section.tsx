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

const categoryStyles: Record<string, string> = {
  "Park Closure": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  Danger: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  Caution: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  Information: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
};

const defaultCategoryStyle = "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

export async function AlertsSection({ parkCode, dict }: { parkCode: string; dict: Dictionary }) {
  const t = dict.park.alerts;
  const result = await settle(getAlerts(parkCode));

  return (
    <Section title={t.title} source={t.source}>
      {!result.ok ? (
        <ApiUnavailable error={result.error} dict={dict} />
      ) : result.data.length === 0 ? (
        <p className="text-sm text-stone-500">{t.empty}</p>
      ) : (
        <ul className="space-y-4">
          {result.data.map((alert) => {
            const date = alert.lastIndexedDate.slice(0, 10);
            return (
              <li key={alert.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${categoryStyles[alert.category] ?? defaultCategoryStyle}`}
                  >
                    {t.categories[alert.category] ?? alert.category}
                  </span>
                  <h3 className="font-medium">
                    {alert.url ? (
                      <a href={alert.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {alert.title}
                      </a>
                    ) : (
                      alert.title
                    )}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                  {stripHtml(alert.description)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {fill(t.updated, { date })}
                  {daysSince(date) > STALE_AFTER_DAYS && (
                    <span className="ml-2 text-amber-700 dark:text-amber-400">· {t.stale}</span>
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
