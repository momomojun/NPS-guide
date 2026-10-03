import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

export interface TimelinePark {
  code: string;
  nameZh: string;
  nameEn: string;
  statesZh: string;
  established: string;
  page?: string;
}

type Text = Dictionary["rankings"]["timeline"];

/** 横轴从 1868 年画到 2028 年，两头留一点空 */
const FROM = 1868;
const TO = 2028;

/** "1916-08-25" → 1916.65 */
function yearOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const start = Date.UTC(y, 0, 1);
  return y + (Date.UTC(y, m - 1, d) - start) / (Date.UTC(y + 1, 0, 1) - start);
}
const xOf = (iso: string) => ((yearOf(iso) - FROM) / (TO - FROM)) * 100;

/** 鼠标移到点上的提示：靠两边的往里对齐 */
function tipPosition(x: number) {
  return x < 15 ? "left-0" : x > 85 ? "right-0" : "left-1/2 -translate-x-1/2";
}

/** 榜单页的设立时间线：现有国家公园按设立时间累计的阶梯图，下面按年代列出每一座 */
export function ParkTimeline({
  parks,
  locale,
  text,
}: {
  parks: TimelinePark[];
  locale: string;
  text: Text;
}) {
  const total = parks.length;
  const dateOf = (iso: string) =>
    fill(text.date, { y: iso.slice(0, 4), m: Number(iso.slice(5, 7)), d: Number(iso.slice(8, 10)) });
  const yOf = (count: number) => (count / total) * 100;
  // 阶梯：每座公园设立那天往上跳一格；SVG 坐标 0–1000，纵向朝下
  const path = parks.reduce(
    (d, park, i) => `${d} H ${(xOf(park.established) * 10).toFixed(1)} V ${(1000 - yOf(i + 1) * 10).toFixed(1)}`,
    "M 0 1000",
  );
  const line = `${path} H 1000`;
  const area = `${line} V 1000 Z`;
  const latest = parks.at(-1)!;
  // 记下几个节点：第一座、管理局成立、1980 年阿拉斯加、1994 年加州沙漠保护法、最新一座
  const countBy = (iso: string) => parks.filter((park) => park.established <= iso).length;
  const milestones = [
    { iso: parks[0].established, label: text.annotations.first, count: 1 },
    { iso: "1916-08-25", label: text.annotations.nps, count: countBy("1916-08-25") },
    { iso: "1980-12-02", label: text.annotations.alaska, count: countBy("1980-12-02") },
    { iso: "1994-10-31", label: text.annotations.desert, count: countBy("1994-10-31") },
    {
      iso: latest.established,
      label: fill(text.annotations.latest, { year: latest.established.slice(0, 4), name: latest.nameZh }),
      count: total,
    },
  ];
  const decades = Array.from({ length: 8 }, (_, i) => 1880 + i * 20);

  return (
    <div>
      <figure>
        <figcaption className="text-xs text-mute">{fill(text.chart, { n: total })}</figcaption>
        <p className="mt-3 flex gap-5 text-[11px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-clay-600" />
            {text.onSite}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-ink-soft" />
            {text.notOnSite}
          </span>
        </p>
        <div
          role="img"
          aria-label={milestones.map((m) => `${m.label}（${fill(text.count, { n: m.count })}）`).join("；")}
          className="relative mt-8 ml-10 h-56 border-b border-l border-line sm:h-72"
        >
          {/* 横向网格线：20、40、60 座 */}
          {[20, 40, 60].map((n) => (
            <span key={n} aria-hidden className="absolute inset-x-0 border-t border-line/70" style={{ bottom: `${yOf(n)}%` }}>
              <span className="absolute right-full mr-2 -translate-y-1/2 text-[10px] whitespace-nowrap text-mute tabular-nums">
                {fill(text.count, { n })}
              </span>
            </span>
          ))}
          <svg aria-hidden viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={area} className="fill-ink/[0.06]" />
            <path d={line} fill="none" className="stroke-ink" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
          {parks.map((park, i) => {
            const x = xOf(park.established);
            return (
              <span
                key={park.code}
                aria-hidden
                className="group absolute flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center"
                style={{ left: `${x}%`, bottom: `${yOf(i + 1)}%` }}
              >
                <span
                  className={`h-2 w-2 rounded-full ring-2 ring-paper transition-transform group-hover:scale-150 ${
                    park.page ? "bg-clay-600" : "bg-ink-soft"
                  }`}
                />
                <span
                  className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap bg-ink px-2 py-1 text-[11px] text-paper group-hover:block ${tipPosition(x)}`}
                >
                  {fill(text.pointLabel, { date: dateOf(park.established), name: park.nameZh, n: i + 1 })}
                </span>
              </span>
            );
          })}
        </div>
        <div aria-hidden className="relative mt-1.5 ml-10 h-4 text-[10px] text-mute tabular-nums">
          {decades.map((year) => (
            <span key={year} className="absolute -translate-x-1/2" style={{ left: `${xOf(`${year}-01-01`)}%` }}>
              {year}
            </span>
          ))}
        </div>
        <ol className="mt-6 grid gap-x-8 gap-y-2 text-xs leading-5 sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((m) => (
            <li key={m.label} className="border-t border-line pt-2">
              <span className="text-ink">{m.label}</span>
              <span className="block text-mute">{fill(text.count, { n: m.count })}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[11px] leading-5 text-mute">{fill(text.chartNote, { n: total })}</p>
      </figure>

      <div className="mt-16 space-y-14">
        {text.eras.map((era) => {
          const items = parks
            .map((park, i) => ({ park, n: i + 1 }))
            .filter(({ park }) => {
              const year = Number(park.established.slice(0, 4));
              return year >= era.from && year <= era.to;
            });
          if (items.length === 0) return null;
          return (
            <section key={era.title} className="grid gap-x-16 gap-y-5 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="font-serif text-2xl tabular-nums">{era.title}</p>
                <p className="mt-2 text-xs leading-6 text-ink-soft">{era.note}</p>
                <p className="mt-1 text-xs text-mute">{fill(text.count, { n: items.length })}</p>
              </div>
              <ol className="grid content-start gap-x-10 border-t border-line sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
                {items.map(({ park, n }) => (
                  <li key={park.code} className="flex items-baseline gap-3 border-b border-line py-2.5">
                    <span className="w-12 shrink-0 text-[11px] text-mute tabular-nums">{fill(text.ordinal, { n })}</span>
                    <div className="min-w-0">
                      {park.page ? (
                        <Link href={`/${locale}/parks/${park.page}`} className="font-serif text-base hover:text-clay-700">
                          {park.nameZh}
                        </Link>
                      ) : (
                        <span className="font-serif text-base text-ink-soft">{park.nameZh}</span>
                      )}
                      <span className="ml-2 text-[10px] tracking-[0.12em] text-mute uppercase">{park.nameEn}</span>
                      <span className="block text-[11px] text-mute">
                        {dateOf(park.established)} · {park.statesZh}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
