import { fill } from "@/i18n/format";
import type { ParkAlert } from "@/lib/alert-match";
import type { PlannerText } from "./types";

const SERIOUS = new Set(["Park Closure", "Danger"]);

/** 行程总览里的公园实时公告：提到行程景点的放前面并写明影响哪些景点，其他的收起来 */
export function TripAlerts({
  alerts,
  affected,
  later = false,
  failed,
  loading,
  parkName,
  text,
}: {
  alerts: ParkAlert[];
  /** 公告 id → 受影响的行程景点名 */
  affected: Map<string, string[]>;
  /** 出发还早（30 天以后）：公告只在这里列，不对到每天的景点下面 */
  later?: boolean;
  failed: string[];
  loading: boolean;
  parkName: (code: string) => string;
  text: PlannerText;
}) {
  const t = text.plan.alerts;
  const related = alerts.filter((alert) => affected.has(alert.id));
  const others = alerts.filter((alert) => !affected.has(alert.id));

  const item = (alert: ParkAlert) => {
    const names = affected.get(alert.id);
    return (
      <li key={alert.id} className="border-b border-line py-3 last:border-b-0">
        <p className="text-sm leading-6">
          <span
            className={`mr-2 border px-1.5 py-0.5 text-[11px] ${
              SERIOUS.has(alert.category) ? "border-clay-600/40 text-clay-700" : "border-line text-ink-soft"
            }`}
          >
            {t.categories[alert.category] ?? alert.category}
          </span>
          <span className="mr-2 text-xs text-mute">{parkName(alert.park)}</span>
          {alert.url ? (
            <a href={alert.url} target="_blank" rel="noreferrer" className="link-line">
              {alert.titleZh ?? alert.title}
            </a>
          ) : (
            (alert.titleZh ?? alert.title)
          )}
        </p>
        {alert.titleZh && <p className="mt-0.5 text-[11px] text-mute">{alert.title}</p>}
        {names && (
          <p className="mt-1 text-xs text-clay-700">
            {t.related}：{names.join("、")}
          </p>
        )}
        {alert.descriptionZh && <p className="mt-1 line-clamp-3 text-xs leading-5 text-ink-soft">{alert.descriptionZh}</p>}
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-mute">
          {alert.descriptionZh && <span className="mr-1 text-ink-soft">{t.original}</span>}
          {alert.description}
        </p>
        <p className="mt-1 text-[11px] text-mute">{fill(t.updated, { date: alert.updated.slice(0, 10) })}</p>
      </li>
    );
  };

  return (
    <div className="mt-8 border-t border-line pt-5">
      <p className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs tracking-[0.1em] text-clay-700">
          {t.title}
          {alerts.length > 0 && <span className="ml-2 text-mute">{fill(t.count, { n: alerts.length })}</span>}
        </span>
        <span className="text-[11px] text-mute">{t.source}</span>
      </p>
      {later && <p className="mt-2 text-xs leading-5 text-ink-soft">{t.later}</p>}
      {loading ? (
        <p className="mt-3 text-sm text-mute">{t.loading}</p>
      ) : alerts.length === 0 && failed.length === 0 ? (
        <p className="mt-3 text-sm text-mute">{t.none}</p>
      ) : (
        <>
          {related.length > 0 && <ul className="mt-2">{related.map(item)}</ul>}
          {others.length > 0 &&
            (related.length > 0 ? (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-xs text-ink-soft hover:text-ink">
                  {fill(t.others, { n: others.length })}
                </summary>
                <ul className="mt-1">{others.map(item)}</ul>
              </details>
            ) : (
              <ul className="mt-2">{others.map(item)}</ul>
            ))}
        </>
      )}
      {failed.length > 0 && (
        <p className="mt-3 text-xs text-clay-700">{fill(t.failed, { parks: failed.map(parkName).join("、") })}</p>
      )}
    </div>
  );
}
