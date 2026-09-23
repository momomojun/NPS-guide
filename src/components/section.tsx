import type { ReactNode } from "react";

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
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {source && <p className="text-xs text-stone-500 dark:text-stone-400">{source}</p>}
      </header>
      {children}
    </section>
  );
}

export function SectionSkeleton({ title }: { title: string }) {
  return (
    <Section title={title}>
      <div className="space-y-2" aria-busy="true">
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      </div>
    </Section>
  );
}
