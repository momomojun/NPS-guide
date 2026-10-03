import { Fragment } from "react";
import type { ParkActivity } from "@/data/activities";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMonths } from "@/i18n/format";

/** 开放月份和说明都一样的景点（比如同一条冬天不通车的观景路上的几个观景台）合成一条，说明只写一次 */
function groupByNote(list: AttractionWithPhoto[]): AttractionWithPhoto[][] {
  const groups = new Map<string, AttractionWithPhoto[]>();
  for (const attraction of list) {
    const key = `${(attraction.openMonths ?? []).join(",")}|${attraction.closedNote ?? attraction.id}`;
    groups.set(key, [...(groups.get(key) ?? []), attraction]);
  }
  return [...groups.values()];
}

/** 几个景点的名字，用顿号隔开，各自链到景点卡片 */
function Names({ group, className }: { group: AttractionWithPhoto[]; className: string }) {
  return (
    <span>
      {group.map((attraction, index) => (
        <Fragment key={attraction.id}>
          {index > 0 && <span className="text-mute">、</span>}
          <a href={`#attraction-${attraction.id}`} className={className}>
            {attraction.nameZh}
          </a>
        </Fragment>
      ))}
    </span>
  );
}

/** 公园页：值得专门安排的活动、节庆和季节现象，以及哪些景点目前关闭、哪些只在某些月份开放、为什么 */
export function ActivitiesSection({
  activities,
  attractions,
  dict,
}: {
  activities: ParkActivity[];
  attractions: AttractionWithPhoto[];
  dict: Dictionary;
}) {
  const t = dict.park.activities;
  const closedNow = attractions.filter((a) => a.openMonths?.length === 0);
  const seasonal = attractions.filter((a) => a.openMonths && a.openMonths.length > 0);
  if (activities.length === 0 && closedNow.length === 0 && seasonal.length === 0) return null;
  const hasAttraction = (id: string) => attractions.some((a) => a.id === id);

  return (
    <div className="grid items-start gap-16 lg:grid-cols-12">
      {activities.length > 0 && (
        <div className="lg:col-span-7">
          <h3 className="font-serif text-2xl">{t.title}</h3>
          <p className="mt-2 text-xs text-mute">{t.hint}</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {activities.map((activity) => (
              <li key={activity.nameEn} className="space-y-1.5 py-5">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-lg">{activity.nameZh}</span>
                  <span className="text-[11px] tracking-[0.12em] text-mute uppercase">{activity.nameEn}</span>
                  <span className="border border-line px-1.5 text-[11px] text-ink-soft">
                    {activity.months ? formatMonths(activity.months, dict.units) : dict.units.allYear}
                  </span>
                </p>
                {activity.status && <p className="text-xs leading-6 text-clay-700">{activity.status}</p>}
                <p className="text-sm leading-7 text-ink-soft">{activity.summary}</p>
                {activity.booking && <p className="text-xs leading-6 text-mute">{activity.booking}</p>}
                {(activity.url || (activity.attraction && hasAttraction(activity.attraction))) && (
                  <p className="flex flex-wrap gap-x-5 pt-1">
                    {activity.attraction && hasAttraction(activity.attraction) && (
                      <a href={`#attraction-${activity.attraction}`} className="link-line text-xs tracking-[0.1em]">
                        {t.seeAttraction}
                      </a>
                    )}
                    {activity.url && (
                      <a href={activity.url} target="_blank" rel="noreferrer" className="link-line text-xs tracking-[0.1em]">
                        {t.officialPage}
                      </a>
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(closedNow.length > 0 || seasonal.length > 0) && (
        <div className={activities.length > 0 ? "lg:col-span-5" : "lg:col-span-8"}>
          <h3 className="font-serif text-2xl">{t.openingTitle}</h3>
          <p className="mt-2 text-xs leading-6 text-mute">{t.openingChecked}</p>
          {closedNow.length > 0 && (
            <div className="mt-6 border-l-2 border-clay-600 bg-clay-50 px-5 py-4">
              <p className="text-xs tracking-[0.1em] text-clay-700">{t.closedNow}</p>
              <ul className="mt-3 space-y-3">
                {groupByNote(closedNow).map((group) => (
                  <li key={group[0].id} className="text-sm leading-6">
                    <Names group={group} className="font-serif text-base hover:text-clay-700" />
                    {group[0].closedNote && (
                      <span className="mt-0.5 block text-xs leading-6 text-clay-800">{group[0].closedNote}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {seasonal.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-[0.1em] text-mute">{t.seasonal}</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {groupByNote(seasonal).map((group) => (
                  <li key={group[0].id} className="py-3 text-sm leading-6">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <Names group={group} className="font-serif text-base hover:text-clay-700" />
                      <span className="text-xs text-ink-soft">{formatMonths(group[0].openMonths ?? [], dict.units)}</span>
                    </p>
                    {group[0].closedNote && <p className="mt-0.5 text-xs leading-6 text-mute">{group[0].closedNote}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
