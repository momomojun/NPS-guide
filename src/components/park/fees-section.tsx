import { Section } from "@/components/section";
import type { Dictionary } from "@/i18n/dictionaries";
import { getFees } from "@/lib/nps";
import { settle } from "@/lib/settle";
import { ApiUnavailable } from "./api-unavailable";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export async function FeesSection({ parkCode, dict }: { parkCode: string; dict: Dictionary }) {
  const t = dict.park.fees;
  const result = await settle(getFees(parkCode));
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
