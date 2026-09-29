import { Section } from "@/components/section";
import { manualFees } from "@/data/fees-manual";
import type { Dictionary } from "@/i18n/dictionaries";
import { getFees } from "@/lib/nps";
import { settle } from "@/lib/settle";
import { fill } from "@/i18n/format";
import { ApiUnavailable } from "./api-unavailable";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 整数不带小数（$30），有零头的带两位（$80.50） */
const money = (currency: "USD" | "CAD", value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

export async function FeesSection({ parkCode, npsCode, dict }: { parkCode: string; npsCode: string | null; dict: Dictionary }) {
  const t = dict.park.fees;
  const manual = manualFees[parkCode];
  // 加拿大公园、园外名胜：手动整理的门票
  if (manual || !npsCode) {
    return (
      <Section title={t.title} source={manual ? fill(t.manualSource, { date: manual.checked }) : undefined}>
        {!manual ? (
          <p className="text-sm text-mute">{t.empty}</p>
        ) : (
          <>
            <dl className="divide-y divide-line">
              {manual.vehicle !== undefined && (
                <div className="flex items-baseline justify-between gap-4 py-3.5 text-sm first:pt-0">
                  <dt>{manual.perDay ? t.vehiclePerDay : t.types["Entrance - Private Vehicle"]}</dt>
                  <dd className="font-serif text-2xl tabular-nums">{money(manual.currency, manual.vehicle)}</dd>
                </div>
              )}
              {manual.perPerson !== undefined && (
                <div className="flex items-baseline justify-between gap-4 py-3.5 text-sm first:pt-0">
                  <dt>{manual.perDay ? t.personPerDay : t.perPersonManual}</dt>
                  <dd className="font-serif text-2xl tabular-nums">{money(manual.currency, manual.perPerson)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{manual.note}</p>
            <a href={manual.source} target="_blank" rel="noreferrer" className="link-line mt-3 inline-block text-xs text-mute">
              {t.officialFees}
            </a>
          </>
        )}
      </Section>
    );
  }
  const result = await settle(getFees(npsCode));
  // 只列个人游客用得上的票种，团体和商业票价先不管
  const fees = result.ok ? result.data.filter((fee) => fee.entranceFeeType in t.types) : [];

  return (
    <Section title={t.title} source={t.source}>
      {!result.ok ? (
        <ApiUnavailable error={result.error} dict={dict} />
      ) : fees.length === 0 ? (
        <p className="text-sm text-mute">{t.empty}</p>
      ) : (
        <dl className="divide-y divide-line">
          {fees.map((fee, index) => (
            <div
              key={`${fee.entranceFeeType}-${index}`}
              className="flex items-baseline justify-between gap-4 py-3.5 text-sm first:pt-0"
            >
              <dt>{t.types[fee.entranceFeeType]}</dt>
              <dd className="font-serif text-2xl tabular-nums">{usd.format(Number(fee.cost))}</dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
