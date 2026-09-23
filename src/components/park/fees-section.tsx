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
        <p className="text-sm text-stone-500">{t.empty}</p>
      ) : (
        <dl className="divide-y divide-stone-100 dark:divide-stone-800">
          {fees.map((fee, index) => (
            <div
              key={`${fee.entranceFeeType}-${index}`}
              className="flex items-baseline justify-between gap-4 py-2 text-sm"
            >
              <dt>{t.types[fee.entranceFeeType]}</dt>
              <dd className="font-semibold tabular-nums">{usd.format(Number(fee.cost))}</dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
