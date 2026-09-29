import type { BookingRule, BookingWindow, MonthDay } from "@/data/bookings";
import type { ShuttleSystem } from "@/data/shuttles";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

/** 公园页：这个公园要提前订的（各自从什么时候开始能订）和班车季只能坐班车的路 */
export function BookingsSection({
  rules,
  shuttles,
  planHref,
  dict,
}: {
  rules: BookingRule[];
  shuttles: ShuttleSystem[];
  planHref: string;
  dict: Dictionary;
}) {
  const t = dict.park.bookings;
  const kinds = dict.plan.bookings.kinds;
  const tzNames = dict.plan.bookings.tz;
  if (rules.length === 0 && shuttles.length === 0) return null;

  const monthDay = (value: MonthDay) => {
    const [m, d] = value.split("-").map(Number);
    return fill(t.monthDay, { m, d });
  };
  const range = (from: MonthDay, to: MonthDay) => fill(t.range, { from: monthDay(from), to: monthDay(to) });
  const clock = (time: string) => time.replace(/^0/, "");
  const at = (time?: string, tz?: string) =>
    time ? fill(t.at, { time: clock(time), tz: (tz && tzNames[tz as keyof typeof tzNames]) || tz || "" }) : "";

  const describe = (window: BookingWindow, lottery: boolean): string[] => {
    switch (window.type) {
      case "rolling":
        return [
          fill(t.window.rolling, {
            ahead: window.months ? fill(dict.plan.bookings.months, { n: window.months }) : fill(dict.plan.bookings.daysAhead, { n: window.days ?? 0 }),
            time: at(window.time, window.tz),
          }),
        ];
      case "block":
        return [
          fill((window.visitDay ?? window.day) === 1 ? t.window.blockMonth : t.window.block, {
            day: window.day,
            k: window.monthsAhead,
            time: at(window.time, window.tz),
          }),
        ];
      case "seasonal-lottery":
        return window.seasons.map((season) =>
          fill(t.window.season, {
            visit: range(season.visit[0], season.visit[1]),
            apply: range(season.apply[0], season.apply[1]),
            results: season.results ? fill(t.window.results, { date: monthDay(season.results) }) : "",
          }),
        );
      case "seasonal-release":
        return window.seasons.map((season) =>
          fill(t.window.release, {
            visit: range(season.visit[0], season.visit[1]),
            opens: monthDay(season.opens),
            time: at(window.time, window.tz),
          }),
        );
      case "monthly-lottery":
        return [
          fill(t.window.monthly, {
            k: window.monthsAhead,
            days: window.applyDays ? fill(t.window.monthlyDays, { from: window.applyDays[0], to: window.applyDays[1] }) : t.window.wholeMonth,
            results: window.resultsDay ? fill(t.window.monthlyResults, { d: window.resultsDay }) : "",
          }),
        ];
      case "days-before":
        return [
          fill(lottery ? t.window.daysBefore : t.window.daysBeforeOpen, {
            n: window.days,
            time: at(window.time, window.tz),
            until: window.until ? fill(dict.plan.bookings.window.until, { time: clock(window.until) }) : "",
            results: window.results ? fill(dict.plan.bookings.window.resultsAt, { time: clock(window.results) }) : "",
          }),
        ];
      case "fixed-date":
        return [fill(t.window.fixed, { date: window.opens, time: at(window.time, window.tz) })];
      case "anytime":
        return [dict.plan.bookings.window.anytime];
      case "first-come":
        return [t.window.firstCome];
    }
  };

  return (
    <div className="grid items-start gap-16 lg:grid-cols-12">
      {rules.length > 0 && (
        <div className="lg:col-span-7">
          <h3 className="font-serif text-2xl">{t.title}</h3>
          <p className="mt-2 max-w-xl text-xs leading-6 text-mute">
            {t.intro}{" "}
            <a href={planHref} className="link-line">
              {t.planLink}
            </a>
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {rules.map((rule) => (
              <li key={rule.id} className="space-y-1.5 py-5">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-lg">{rule.titleZh}</span>
                  <span className="border border-line px-1.5 text-[11px] text-ink-soft">{kinds[rule.kind]}</span>
                </p>
                {rule.places && rule.places.length > 0 && (
                  <p className="text-xs leading-6 text-mute">{fill(t.places, { names: rule.places.join(" · ") })}</p>
                )}
                {rule.applies && (
                  <p className="text-xs leading-6 text-clay-700">
                    {fill(t.applies, { ranges: rule.applies.map((r) => range(r.from, r.to)).join("、") })}
                  </p>
                )}
                <ul className="text-sm leading-7 text-ink-soft">
                  {describe(rule.window, rule.kind === "lottery").map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {rule.also?.flatMap((window) => describe(window, rule.kind === "lottery")).map((line) => (
                    <li key={line}>
                      <span className="text-mute">{t.also}</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="text-xs leading-6 text-mute">{rule.noteZh}</p>
                <p className="flex flex-wrap gap-x-5 pt-1 text-xs tracking-[0.1em]">
                  <a href={rule.url} target="_blank" rel="noreferrer" className="link-line">
                    {rule.window.type === "first-come" ? dict.plan.bookings.source : dict.plan.bookings.book}
                  </a>
                  {rule.source !== rule.url && rule.window.type !== "first-come" && (
                    <a href={rule.source} target="_blank" rel="noreferrer" className="link-line">
                      {dict.plan.bookings.source}
                    </a>
                  )}
                  <span className="tracking-normal text-mute">{fill(dict.plan.bookings.verified, { date: rule.verified })}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shuttles.length > 0 && (
        <div className={rules.length > 0 ? "lg:col-span-5" : "lg:col-span-7"}>
          <h3 className="font-serif text-2xl">{t.shuttleTitle}</h3>
          <p className="mt-2 text-xs leading-6 text-mute">{t.shuttleIntro}</p>
          <ul className="mt-6 space-y-8">
            {shuttles.map((system) => (
              <li key={system.id} className="border-t border-ink pt-4">
                <p className="font-serif text-lg">{system.nameZh}</p>
                <p className="mt-1 text-xs text-mute">{fill(t.shuttleHub, { name: system.hub.nameZh })}</p>
                <ul className="mt-3 space-y-1 text-sm leading-6 text-ink-soft">
                  {system.seasons.map((season) => {
                    const lastFrom = system.stops.find((stop) => stop.id === season.lastBusFrom);
                    return (
                      <li key={season.from}>
                        <span className="text-ink">{range(season.from, season.to)}</span>
                        {"　"}
                        {[
                          season.firstBus ? fill(t.firstBus, { time: clock(season.firstBus) }) : null,
                          season.lastBusFromHub
                            ? fill(t.lastIn, { time: clock(season.lastBusFromHub) })
                            : season.lastInAtSunset
                              ? t.lastInSunset
                              : null,
                          season.lastBus
                            ? fill(t.lastBack, { time: clock(season.lastBus), stop: lastFrom?.nameEn ?? system.hub.nameZh })
                            : season.lastBusAfterSunsetMin !== undefined
                              ? fill(t.lastBackSunset, { n: season.lastBusAfterSunsetMin })
                              : null,
                          fill(t.headway, { n: season.headwayMin }),
                          season.days ? t.weekendsOnly : null,
                        ]
                          .filter(Boolean)
                          .join("，")}
                      </li>
                    );
                  })}
                </ul>
                {system.scheduleYear && <p className="mt-2 text-xs leading-6 text-mute">{fill(t.scheduleYear, { year: system.scheduleYear })}</p>}
                {system.hub.parkingZh && <p className="mt-2 text-xs leading-6 text-mute">{system.hub.parkingZh}</p>}
                {system.offSeasonZh && (
                  <p className="mt-2 text-xs leading-6 text-mute">
                    <span className="text-ink-soft">{t.offSeason}</span>
                    {system.offSeasonZh}
                  </p>
                )}
                {system.noteZh && <p className="mt-2 text-xs leading-6 text-mute">{system.noteZh}</p>}
                <p className="mt-2 flex flex-wrap gap-x-5 text-xs tracking-[0.1em]">
                  <a href={system.source} target="_blank" rel="noreferrer" className="link-line">
                    {dict.plan.bookings.source}
                  </a>
                  <span className="tracking-normal text-mute">{fill(dict.plan.bookings.verified, { date: system.checked })}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
