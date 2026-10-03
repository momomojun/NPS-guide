import Link from "next/link";
import { darkSky, mediaPicks, usNewsBest, worldHeritage } from "@/data/honors";
import { canadianParks, nationalParks, nationalParksOf } from "@/data/national-parks";
import type { Locale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatBig, formatCount } from "@/i18n/format";
import type { ParkVisits } from "@/lib/visits";

/** 公园页概览右边的“档案”：哪年设立、美国第几座国家公园、面积、最近一年的游客人次和排名 */
export function ParkProfile({
  code,
  visits,
  locale,
  dict,
}: {
  code: string;
  visits: ParkVisits | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.park.profile;
  const units = nationalParksOf(code);
  const canadian = canadianParks.find((park) => park.code === code);
  if (units.length === 0 && !canadian) return null;
  const dateOf = (iso: string) =>
    fill(t.date, { y: iso.slice(0, 4), m: Number(iso.slice(5, 7)), d: Number(iso.slice(8, 10)) });
  const ordinalOf = (unitCode: string) => nationalParks.findIndex((park) => park.code === unitCode) + 1;

  const rows: [string, string, string?][] = [];
  if (canadian) {
    rows.push([
      t.established,
      fill(t.establishedCanada, { year: canadian.established.slice(0, 4) }),
      canadianParks[0].code === code ? t.firstInCanada : undefined,
    ]);
    rows.push([t.area, fill(dict.units.km2, { n: formatCount(canadian.areaKm2) })]);
  } else if (units.length === 1) {
    rows.push([t.established, fill(t.establishedValue, { date: dateOf(units[0].established), n: ordinalOf(units[0].code) })]);
    rows.push([t.area, fill(dict.units.km2, { n: formatCount(units[0].areaKm2) })]);
  } else {
    const parts = units.map((unit) =>
      fill(t.establishedParts, {
        name: localize(unit.nameZh, locale),
        year: unit.established.slice(0, 4),
        n: ordinalOf(unit.code),
      }),
    );
    rows.push([t.established, parts.join("、")]);
    const area = units.reduce((sum, unit) => sum + unit.areaKm2, 0);
    rows.push([t.area, fill(dict.units.km2, { n: formatCount(area) })]);
  }
  if (visits) {
    const label =
      visits.source === "canada"
        ? fill(t.visitsCanada, { year: visits.lastYear, next: String(visits.lastYear + 1).slice(2) })
        : fill(t.visits, { year: visits.lastYear });
    const rank =
      visits.rank !== undefined
        ? fill(t.rank, { total: nationalParks.length, n: visits.rank })
        : visits.parts.length > 0
          ? fill(t.rankList, {
              total: nationalParks.length,
              list: visits.parts.map((part) => fill(t.rankParts, { name: localize(part.nameZh, locale), n: part.rank })).join("、"),
            })
          : undefined;
    rows.push([label, fill(t.visitsValue, { n: formatBig(visits.latest, dict.units) }), rank]);
  }

  // 荣誉和推荐：世界遗产、暗夜公园、媒体推荐（红杉、国王峡谷任何一座有就算）
  const codes = canadian ? [code] : units.map((unit) => unit.code);
  const honors: { label: string; url: string }[] = [];
  const heritage = codes.map((c) => worldHeritage[c]).find(Boolean);
  if (heritage) honors.push({ label: fill(t.heritage, { year: heritage.year }), url: heritage.url });
  const sky = codes.map((c) => darkSky[c]).find(Boolean);
  if (sky) honors.push({ label: fill(sky.program === "rasc" ? t.darkSkyRasc : t.darkSky, { year: sky.year }), url: sky.url });
  for (const pick of mediaPicks.filter((p) => p.parks.some((c) => codes.includes(c))).sort((a, b) => b.edition - a.edition)) {
    const outlet = `${dict.rankings.picks.outlets[pick.outlet]} ${dict.rankings.picks.lists[pick.outlet]}`;
    honors.push({ label: fill(t.pick, { outlet, year: pick.edition, kind: dict.rankings.picks.kinds[pick.kind] }), url: pick.url });
  }
  if (usNewsBest?.parks.some((c) => codes.includes(c))) {
    honors.push({ label: fill(t.usNews, { year: usNewsBest.edition }), url: usNewsBest.url });
  }

  return (
    <div>
      <p className="eyebrow text-mute">{t.title}</p>
      <dl className="mt-4 border-t border-line text-sm">
        {rows.map(([label, value, note]) => (
          <div key={label} className="border-b border-line py-2.5">
            <dt className="text-xs text-mute">{label}</dt>
            <dd className="mt-1 leading-6">
              {value}
              {note && <span className="block text-xs text-ink-soft">{note}</span>}
            </dd>
          </div>
        ))}
        {honors.length > 0 && (
          <div className="border-b border-line py-2.5">
            <dt className="text-xs text-mute">{t.honors}</dt>
            <dd className="mt-1 space-y-0.5 leading-6">
              {honors.map((honor, i) => (
                <a key={i} href={honor.url} target="_blank" rel="noreferrer" className="block hover:text-clay-700">
                  {honor.label}
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <Link href={`/${locale}/rankings`} className="link-line mt-4 inline-block text-xs text-mute">
        {t.rankings}
      </Link>
    </div>
  );
}
