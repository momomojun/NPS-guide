"use client";

import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import type { ParkActivity } from "@/data/activities";
import { fill, formatDuration, formatMonths } from "@/i18n/format";
import type { GuideInfo, GuideSkipped } from "@/lib/generate-trip";
import type { LodgingRank } from "@/lib/planner";
import type { PlannerPark, PlannerText, ResolvedLodging } from "./types";

/** 自动生成的攻略说明：怎么进出、每晚住哪（附备选和民宿）、这个月的特别活动、哪些景点没排进去以及原因 */
export function GuideSummary({
  guide,
  parks,
  month,
  origin,
  destination,
  outboundMin,
  inboundMin,
  nights,
  tripIds,
  nameOf,
  permitOf,
  closedNoteOf,
  activities,
  attractionExists,
  text,
}: {
  guide: GuideInfo;
  /** 攻略涉及的公园，第一个是主要的 */
  parks: PlannerPark[];
  month: number | null;
  origin?: ResolvedLodging;
  destination?: ResolvedLodging;
  outboundMin?: number;
  inboundMin?: number;
  /** 第 1 晚到倒数第二晚：选好的住处、按车程排好的备选、Airbnb 链接 */
  nights: {
    night: number;
    lodging?: ResolvedLodging;
    ranked: LodgingRank<ResolvedLodging>[];
    airbnbHref: (lodging: ResolvedLodging) => string | undefined;
  }[];
  /** 现在行程里的景点：已经手动加进来的不再算“没排进去” */
  tripIds: string[];
  nameOf: (id: string) => string;
  permitOf: (id: string) => string | undefined;
  closedNoteOf: (id: string) => string | undefined;
  /** 这些公园的特别活动（全部月份），这里按行程月份筛 */
  activities: ParkActivity[];
  attractionExists: (id: string) => boolean;
  text: PlannerText;
}) {
  const g = text.plan.guide;
  const duration = (minutes: number) => formatDuration(minutes, text.units);
  const reasons: { key: keyof GuideSkipped; label: string }[] = [
    { key: "permit", label: g.permit },
    { key: "tooHard", label: g.tooHard },
    { key: "noTime", label: g.noTime },
  ];
  const inTrip = new Set(tripIds);
  const skippedOf = (key: keyof GuideSkipped) => guide.skipped[key].filter((id) => !inTrip.has(id));
  const skippedGroups = reasons.filter(({ key }) => skippedOf(key).length > 0);
  const closed = skippedOf("closed");
  const bookAhead = tripIds.filter((id) => permitOf(id));
  const monthActivities = activities.filter((activity) => !activity.months || (month !== null && activity.months.includes(month)));
  const multiPark = parks.length > 1;
  const surcharge = parks.some((park) => park.nonresidentSurcharge);

  const lodgingTag = (lodging: ResolvedLodging) => (
    <span
      className={`ml-2 border px-1.5 text-[10px] ${
        lodging.rental
          ? "border-clay-600/50 text-clay-700"
          : lodging.inPark
            ? "border-pine-600/50 text-pine-700"
            : "border-line text-mute"
      }`}
    >
      {lodging.rental ? g.rental : lodging.inPark ? g.inPark : g.outside}
    </span>
  );
  const airbnbLink = (href: string | undefined, label: string) =>
    href ? (
      <a href={href} target="_blank" rel="noreferrer" className="link-line text-xs text-clay-700" title={g.airbnbHint}>
        {label}
      </a>
    ) : null;

  return (
    <section className="border-t border-ink pt-6">
      <p className="eyebrow text-mute">{g.eyebrow}</p>
      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          {origin && destination && outboundMin !== undefined && inboundMin !== undefined && (
            <div>
              <h3 className="font-serif text-xl">{g.route}</h3>
              {multiPark && (
                <p className="mt-3 text-sm leading-7 text-ink">
                  {fill(g.parksLine, { parks: parks.map((park) => park.nameZh).join(" · ") })}
                </p>
              )}
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                {fill(g.routeLine, {
                  origin: origin.name,
                  destination: destination.name,
                  outbound: duration(outboundMin),
                  inbound: duration(inboundMin),
                })}
              </p>
            </div>
          )}
          {nights.length > 0 && (
            <div>
              <h3 className="font-serif text-xl">{g.lodging}</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {nights.map(({ night, lodging, ranked, airbnbHref }) => {
                  const alternatives = ranked
                    .filter((rank) => rank.lodging.id !== lodging?.id && !rank.lodging.rental)
                    .slice(0, 2)
                    .map((rank) => rank.lodging.name);
                  // 住的不是民宿时，另外给一个最顺路的民宿区
                  const rental = lodging?.rental ? undefined : ranked.find((rank) => rank.lodging.rental)?.lodging;
                  return (
                    <li key={night} className="grid gap-1 py-3 sm:grid-cols-[5rem_1fr]">
                      <span className="text-xs text-mute">{fill(g.night, { n: night })}</span>
                      <span>
                        <span className="font-serif text-base">{lodging?.name ?? "—"}</span>
                        {lodging && !lodging.custom && lodgingTag(lodging)}
                        {lodging && airbnbHref(lodging) && (
                          <span className="ml-3">{airbnbLink(airbnbHref(lodging), g.airbnb)}</span>
                        )}
                        {alternatives.length > 0 && (
                          <span className="mt-0.5 block text-xs text-mute">
                            {fill(g.alternatives, { names: alternatives.join("、") })}
                          </span>
                        )}
                        {rental && (
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-mute">
                            {fill(g.rentalOption, { name: rental.name })}
                            {airbnbLink(airbnbHref(rental), g.airbnb)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink-soft">
                {parks.map((park) => (
                  <p key={park.code}>
                    {multiPark && <span className="mr-2 text-ink">{park.nameZh}</span>}
                    {park.lodgingTip}
                  </p>
                ))}
              </div>
            </div>
          )}
          {monthActivities.length > 0 && (
            <div>
              <h3 className="font-serif text-xl">{month !== null ? fill(g.activitiesMonth, { month }) : g.activities}</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {monthActivities.map((activity) => (
                  <li key={`${activity.park}-${activity.nameEn}`} className="space-y-1 py-4">
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-serif text-base">{activity.nameZh}</span>
                      <span className="text-[11px] tracking-[0.12em] text-mute uppercase">{activity.nameEn}</span>
                      {multiPark && <span className="text-xs text-mute">{parks.find((p) => p.code === activity.park)?.nameZh}</span>}
                      <span className="text-xs text-mute">
                        {activity.months ? formatMonths(activity.months, text.units) : text.units.allYear}
                      </span>
                    </p>
                    {activity.status && <p className="text-xs text-clay-700">{activity.status}</p>}
                    <p className="text-sm leading-6 text-ink-soft">{activity.summary}</p>
                    {activity.booking && <p className="text-xs leading-6 text-mute">{activity.booking}</p>}
                    <p className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                      {activity.attraction && attractionExists(activity.attraction) && (
                        <AddToTripButton id={activity.attraction} text={text.trip} />
                      )}
                      {activity.url && (
                        <a href={activity.url} target="_blank" rel="noreferrer" className="link-line text-xs tracking-[0.1em]">
                          {g.officialPage}
                        </a>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-8 lg:col-span-5">
          {bookAhead.length > 0 && (
            <div>
              <h3 className="font-serif text-xl">{g.bookAhead}</h3>
              <ul className="mt-4 space-y-3">
                {bookAhead.map((id) => (
                  <li key={id} className="text-sm leading-6">
                    {nameOf(id)}
                    <span className="block text-xs text-mute">{permitOf(id)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <h3 className="font-serif text-xl">{fill(g.closed, { month: month ?? "" })}</h3>
              <ul className="mt-4 space-y-3">
                {closed.map((id) => (
                  <li key={id} className="text-sm leading-6">
                    {nameOf(id)}
                    {closedNoteOf(id) && <span className="block text-xs leading-6 text-mute">{closedNoteOf(id)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {skippedGroups.length > 0 && (
            <div>
              <h3 className="font-serif text-xl">{g.skipped}</h3>
              <dl className="mt-4 space-y-4">
                {skippedGroups.map(({ key, label }) => (
                  <div key={key}>
                    <dt className="text-xs text-mute">{label}</dt>
                    <dd className="mt-1 text-sm leading-6">{skippedOf(key).map(nameOf).join("、")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {surcharge && (
            <div className="border-l border-clay-600 pl-5">
              <p className="eyebrow text-clay-700">{g.fee}</p>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{g.feeTip}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
