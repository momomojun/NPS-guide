"use client";

import Link from "next/link";
import { fill } from "@/i18n/format";
import { tripIds, useTrip } from "@/lib/trip-store";

/** 已经有行程时，在首页显示一张“继续规划”的卡片 */
export function ContinueTrip({
  href,
  parkNames,
  locale,
  text,
}: {
  href: string;
  /** 公园代码 → 名称 */
  parkNames: Record<string, string>;
  locale: string;
  text: { continueTitle: string; continueSummary: string; continueStart: string; continueCta: string };
}) {
  const trip = useTrip();
  const ids = tripIds(trip);
  if (ids.length === 0) return null;

  // 景点 id 统一以公园代码开头
  const parks = [...new Set(ids.map((id) => id.split("-")[0]))].map((code) => parkNames[code] ?? code);
  const start = trip.startDate
    ? new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-TW" : "zh-CN", {
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${trip.startDate}T00:00:00Z`))
    : null;

  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white/95 p-4 text-stone-900 shadow-lg backdrop-blur transition hover:bg-white sm:max-w-sm"
    >
      <p className="text-xs font-medium text-emerald-700">{text.continueTitle}</p>
      <p className="mt-1 font-semibold">{parks.join(" · ")}</p>
      <p className="mt-0.5 text-sm text-stone-600">
        {fill(text.continueSummary, { n: ids.length, days: trip.dayCount })}
        {start && ` · ${fill(text.continueStart, { date: start })}`}
      </p>
      <p className="mt-2 text-sm font-medium text-emerald-700">{text.continueCta}</p>
    </Link>
  );
}
