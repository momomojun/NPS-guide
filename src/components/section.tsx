import type { ReactNode } from "react";

/** 公园页的信息区块：墨色细线下是衬线标题，右边小字写数据来源 */
export function Section({
  title,
  source,
  children,
}: {
  title: string;
  source?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-ink pt-5">
        <h3 className="font-serif text-2xl">{title}</h3>
        {source && <p className="text-xs text-mute">{source}</p>}
      </header>
      <div className="pt-7">{children}</div>
    </section>
  );
}

export function SectionSkeleton({ title }: { title: string }) {
  return (
    <Section title={title}>
      <div className="space-y-3" aria-busy="true">
        <div className="h-3 w-2/3 animate-pulse bg-ink/10" />
        <div className="h-3 w-1/2 animate-pulse bg-ink/10" />
        <div className="h-3 w-3/5 animate-pulse bg-ink/10" />
      </div>
    </Section>
  );
}
