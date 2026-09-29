"use client";

import { fill } from "@/i18n/format";
import { fuelPricesDate, MILES_PER_GALLON, MILES_PER_KWH } from "@/lib/prices/fuel";
import { updatePrefs, type TripPrefs } from "@/lib/trip-prefs";
import { KM_PER_MILE, type Budget } from "./budget";
import type { PlannerText } from "./types";

const money = (amount: number) => `$${Math.round(amount).toLocaleString("en-US")}`;

export function TripBudget({
  budget,
  prefs,
  parkName,
  stateName,
  pickup,
  rentalDays,
  flightRoute,
  distanceEstimated,
  dayCount,
  fuelDate,
  text,
}: {
  budget: Budget;
  prefs: TripPrefs;
  parkName: (code: string) => string;
  stateName: (code: string) => string;
  pickup?: string;
  rentalDays: number;
  /** 比如 "BOS → SLC · BZN → BOS" */
  flightRoute?: string;
  /** 有的路段还没查到真实路线，公里数按车程估 */
  distanceEstimated: boolean;
  dayCount: number;
  /** 油价日期（实时的）；没有就是快照日期 */
  fuelDate?: string;
  text: PlannerText;
}) {
  const t = text.plan.budget;
  const { fees, lodging, meals, fuel, car } = budget;
  const km = Math.round(fuel.km);
  const mi = Math.round(fuel.km / KM_PER_MILE);

  const rows: { label: string; amount?: number; lines: string[] }[] = [
    {
      label: t.items.fees,
      amount: fees.total,
      lines: [
        // 美国国家公园的门票和年卡比较（行程里只有加拿大公园、园外名胜时不用比）
        ...(fees.pay > 0
          ? [
              fees.usePass ? (fees.passKind === "resident" ? t.passResident : t.passNonresident) : fill(t.feesPay, { amount: money(fees.pay) }),
              fees.usePass
                ? `${fill(t.feesPay, { amount: money(fees.pay) })}，${fill(t.passBetter, { save: money(fees.pay - fees.pass) })}`
                : `${fill(t.feesPass, { amount: money(fees.pass) })}，${t.payBetter}`,
            ]
          : []),
        ...(fees.surchargeParks > 0 && !fees.usePass
          ? [fill(t.surcharge, { n: Math.min(prefs.nonresidents, prefs.travelers), parks: fees.surchargeParks })]
          : []),
        ...(fees.freeParks.length > 0 ? [fill(t.free, { parks: fees.freeParks.map(parkName).join("、") })] : []),
        ...(fees.canada > 0 ? [fill(fees.canadaPass ? t.canadaPass : t.canadaDaily, { amount: money(fees.canada) })] : []),
        ...(fees.sites > 0 ? [fill(t.sites, { amount: money(fees.sites) })] : []),
      ],
    },
    {
      label: t.items.lodging,
      amount: lodging.total,
      lines: [
        fill(t.lodgingLine, { nights: lodging.nights, rooms: Math.max(prefs.rooms, 1), year: lodging.year }),
        ...(lodging.guessed > 0 ? [fill(t.lodgingGuess, { n: lodging.guessed })] : []),
      ],
    },
    {
      label: t.items.meals,
      amount: meals.total,
      lines: [fill(t.mealsLine, { people: prefs.travelers, days: dayCount, rate: money(meals.rate) })],
    },
    {
      label: prefs.vehicle === "ev" ? t.items.charging : t.items.fuel,
      amount: fuel.total,
      lines: [
        (prefs.vehicle === "ev"
          ? fill(t.chargingLine, { km: km.toLocaleString("en-US"), mi: mi.toLocaleString("en-US"), eff: MILES_PER_KWH, price: `$${fuel.price.toFixed(2)}` })
          : fill(t.fuelLine, {
              km: km.toLocaleString("en-US"),
              mi: mi.toLocaleString("en-US"),
              mpg: MILES_PER_GALLON,
              price: `$${fuel.price.toFixed(2)}`,
              states: fuel.states.map(stateName).join("、"),
            })) + (distanceEstimated ? t.distanceEstimated : ""),
      ],
    },
    ...(car
      ? [
          {
            label: t.items.car,
            amount: car.total,
            lines: [
              car.guessed
                ? fill(t.carGuess, { days: rentalDays, rate: money(car.rate) })
                : fill(t.carLine, { days: rentalDays, rate: money(car.rate), airport: pickup ?? "" }),
            ],
          },
        ]
      : []),
    ...(prefs.flyAndRent
      ? [
          {
            label: t.items.flights,
            amount: budget.flights,
            lines: [budget.flights !== undefined && flightRoute ? fill(t.flightsLine, { route: flightRoute }) : t.flightsUnchecked],
          },
        ]
      : []),
  ];

  const field =
    "mt-2 block border-b border-ink/30 bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none";
  const numberSelect = (value: number, min: number, max: number, onChange: (n: number) => void) => (
    <select value={value} onChange={(event) => onChange(Number(event.target.value))} className={field}>
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );

  return (
    <section id="plan-budget" className="scroll-mt-32 border-t border-ink pt-5">
      <p className="eyebrow text-mute">{t.eyebrow}</p>
      <h2 className="mt-3 font-serif text-xl">{t.title}</h2>
      <p className="mt-2 text-xs leading-6 text-mute">{t.intro}</p>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <label className="eyebrow text-mute">
          {t.travelers}
          {numberSelect(prefs.travelers, 1, 8, (n) => updatePrefs({ travelers: n }))}
        </label>
        <label className="eyebrow text-mute">
          {t.nonresidents}
          {numberSelect(prefs.nonresidents, 0, prefs.travelers, (n) => updatePrefs({ nonresidents: n }))}
        </label>
        <label className="eyebrow text-mute">
          {t.rooms}
          {numberSelect(prefs.rooms, 1, 4, (n) => updatePrefs({ rooms: n }))}
        </label>
        <label className="eyebrow text-mute">
          {t.vehicle}
          <select
            value={prefs.vehicle}
            onChange={(event) => updatePrefs({ vehicle: event.target.value as TripPrefs["vehicle"] })}
            className={field}
          >
            <option value="gas">{t.vehicles.gas}</option>
            <option value="ev">{t.vehicles.ev}</option>
          </select>
        </label>
      </div>

      <dl className="mt-6 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[4.5rem_6rem_1fr] gap-3 py-3 text-sm">
            <dt className="text-ink-soft">{row.label}</dt>
            <dd className="text-right font-medium tabular-nums">{row.amount !== undefined ? money(row.amount) : "—"}</dd>
            <dd className="space-y-0.5 text-xs leading-5 text-mute">
              {row.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm text-ink-soft">{t.total}</span>
        <span className="font-serif text-3xl tabular-nums">{money(budget.total)}</span>
        <span className="text-sm text-ink-soft">{fill(t.perPerson, { amount: money(budget.perPerson) })}</span>
        {budget.missingFlights && <span className="text-xs text-clay-700">{t.partial}</span>}
      </p>
      <p className="mt-3 text-[11px] leading-5 text-mute">{t.notIncluded}</p>
      <p className="mt-1 text-[11px] leading-5 text-mute">{fill(t.source, { date: fuelDate ?? fuelPricesDate })}</p>
    </section>
  );
}
