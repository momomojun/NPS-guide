"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { fill } from "@/i18n/format";
import { tripIds, useTrip } from "@/lib/trip-store";

/** 已经有行程时，首屏右下角显示“继续你的行程” */
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
  text: { continueTitle: string; continueSummary: string; continueStart: string; continueMonth: string; continueCta: string };
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
  // 只定了月份（自动生成攻略时常见）
  const when = start ? fill(text.continueStart, { date: start }) : trip.month ? fill(text.continueMonth, { m: trip.month }) : null;

  return (
    <Link href={href} className="group block w-72 border-t border-white/40 pt-4 text-white">
      <p className="eyebrow text-white/60">{text.continueTitle}</p>
      <p className="mt-3 font-serif text-xl leading-snug">{parks.join(" · ")}</p>
      <p className="mt-1.5 text-sm text-white/70">
        {fill(text.continueSummary, { n: ids.length, days: trip.dayCount })}
        {when && ` · ${when}`}
      </p>
      <p className="eyebrow mt-4 inline-flex items-center gap-2">
        {text.continueCta}
        <IconArrowRight className="transition-transform duration-500 group-hover:translate-x-1" />
      </p>
    </Link>
  );
}
