"use client";

import { IconTrail } from "@/components/icons";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import type { AttractionWithPhoto } from "@/data/attractions";
import { googleMapsUrl, googleSnapshotDate } from "@/data/attractions/google";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatCount, formatDuration, formatKm, formatMeters, formatMonths } from "@/i18n/format";
import { KIND_COLORS } from "./kinds";
import { PhotoGallery } from "./photo-gallery";

export type AttractionText = Pick<
  Dictionary,
  "attraction" | "kinds" | "difficulty" | "timeOfDay" | "units" | "trip" | "map"
>;

/** 热度名次（按 Google 评论数）+ Google 评分和评论数；没有 Google 数据时不显示 */
export function PopularityBadge({ attraction, text }: { attraction: AttractionWithPhoto; text: AttractionText }) {
  const { google, hotRank } = attraction;
  if (!google) return null;
  const t = text.attraction;
  return (
    <span
      className="inline-flex flex-wrap items-baseline gap-x-3 text-xs"
      title={fill(t.googleSource, { name: google.name, date: googleSnapshotDate })}
    >
      {hotRank !== undefined && <span className="text-clay-700">{fill(t.hotRank, { n: hotRank })}</span>}
      <span className="text-mute">
        {fill(t.googleRating, { rating: google.rating.toFixed(1), reviews: formatCount(google.reviews) })}
      </span>
    </span>
  );
}

/** 细线框的小标签：必去、开放月份、许可证 */
const tag = "border px-2 py-0.5 text-[11px] leading-5";

export const linkButton = "link-line text-xs tracking-[0.1em] text-ink";

/** 停留时间、徒步距离 / 爬升 / 难度、最佳时间 */
export function attractionMeta(a: AttractionWithPhoto, text: AttractionText): string[] {
  const t = text.attraction;
  return [
    fill(t.duration, { d: formatDuration(a.durationMin, text.units) }),
    a.hike?.distanceMi ? `${formatKm(a.hike.distanceMi, text.units)}${a.hike.loop ? ` · ${t.loop}` : ""}` : null,
    a.hike?.gainFt ? formatMeters(a.hike.gainFt, text.units) : null,
    a.hike ? text.difficulty[a.hike.difficulty] : null,
    a.bestTime ? a.bestTime.map((time) => text.timeOfDay[time]).join(" / ") : null,
  ].filter((item): item is string => item !== null);
}

/** 类型 + 停留时间、徒步数据，一行小字 */
export function AttractionMeta({ attraction: a, text }: { attraction: AttractionWithPhoto; text: AttractionText }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full" style={{ backgroundColor: KIND_COLORS[a.kind] }} />
        {text.kinds[a.kind]}
      </span>
      {attractionMeta(a, text).map((item) => (
        <span key={item} className="before:mr-3 before:text-line before:content-['/']">
          {item}
        </span>
      ))}
    </p>
  );
}

/** 必去、园外、开放月份、最佳月份、许可证 */
export function AttractionTags({ attraction: a, text }: { attraction: AttractionWithPhoto; text: AttractionText }) {
  const t = text.attraction;
  if (!a.mustSee && !a.outsidePark && !a.openMonths && !a.bestMonths && !a.permit) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {a.mustSee && <li className={`${tag} border-ink bg-ink text-paper`}>{t.mustSee}</li>}
      {a.outsidePark && <li className={`${tag} border-line text-mute`}>{t.outsidePark}</li>}
      {a.openMonths && (
        <li className={`${tag} border-clay-600/40 text-clay-700`}>
          {a.openMonths.length === 0 ? t.closedNow : fill(t.openMonths, { months: formatMonths(a.openMonths, text.units) })}
        </li>
      )}
      {a.bestMonths && (
        <li className={`${tag} border-line text-ink-soft`}>
          {fill(t.bestMonths, { months: formatMonths(a.bestMonths, text.units) })}
        </li>
      )}
      {a.permit && <li className={`${tag} border-clay-600/40 text-clay-700`}>{t.permit}</li>}
    </ul>
  );
}

/** 这个景点在 month 月（或者整年）不开放吗 */
export function closedIn(a: { openMonths?: number[] }, month: number | null): "all" | "month" | null {
  if (a.openMonths?.length === 0) return "all";
  if (month !== null && a.openMonths && !a.openMonths.includes(month)) return "month";
  return null;
}

/** 目前整年关闭，或者所选月份不开放时，醒目地说明原因 */
export function ClosedNotice({
  attraction: a,
  month,
  text,
}: {
  attraction: AttractionWithPhoto;
  month: number | null;
  text: AttractionText;
}) {
  const closed = closedIn(a, month);
  if (!closed) return null;
  const t = text.attraction;
  return (
    <div className="border-l-2 border-clay-600 bg-clay-50 px-4 py-3">
      <p className="text-xs tracking-[0.1em] text-clay-700">
        {closed === "all"
          ? t.closedNow
          : fill(t.closedInMonth, { month: month ?? "", months: formatMonths(a.openMonths ?? [], text.units) })}
      </p>
      {a.closedNote && <p className="mt-1.5 text-sm leading-7 text-clay-800">{a.closedNote}</p>}
    </div>
  );
}

/** 实用提示：许可证、季节性关闭的原因、各条提示、出发点 */
export function attractionTips(a: AttractionWithPhoto, text: AttractionText): string[] {
  const t = text.attraction;
  return [
    a.permit,
    a.closedNote && a.openMonths?.length ? fill(t.seasonalNote, { note: a.closedNote }) : undefined,
    ...(a.tips ?? []),
    a.start ? fill(t.start, { name: a.start.nameZh }) : undefined,
  ].filter((tip): tip is string => Boolean(tip));
}

export function AttractionCard({
  attraction: a,
  parkNameEn,
  text,
  selected,
  onShowOnMap,
}: {
  attraction: AttractionWithPhoto;
  parkNameEn: string;
  text: AttractionText;
  selected: boolean;
  onShowOnMap: () => void;
}) {
  const t = text.attraction;
  const destination = a.start ?? a;
  const tips = attractionTips(a, text);

  return (
    <article id={`attraction-${a.id}`} className="group scroll-mt-24 border-b border-line pb-12">
      {a.gallery.length > 0 && <PhotoGallery photos={a.gallery} title={a.nameZh} alt={`${a.nameZh} ${a.nameEn}`} text={t} />}

      <div className="space-y-5 pt-6">
        <header>
          <PopularityBadge attraction={a} text={text} />
          <h3
            className={`mt-3 font-serif text-[1.7rem] leading-tight transition-colors duration-500 ${selected ? "text-clay-700" : ""}`}
          >
            {a.nameZh}
          </h3>
          <p className="eyebrow mt-2 text-mute">{a.nameEn}</p>
        </header>

        <AttractionMeta attraction={a} text={text} />
        <AttractionTags attraction={a} text={text} />
        <ClosedNotice attraction={a} month={null} text={text} />

        <p className="text-[15px] leading-7 text-ink-soft">{a.summary}</p>

        {a.trailLine && (
          <p className="inline-flex items-center gap-2 text-xs text-clay-700">
            <IconTrail className="text-base" />
            {fill(t.trailLength, { km: a.trailLine.km.toFixed(1), type: a.trailLine.loop ? t.loopTrail : t.oneWay })}
          </p>
        )}

        {tips.length > 0 && (
          <details className="group/tips border-t border-line pt-4 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-[0.1em] text-ink [&::-webkit-details-marker]:hidden">
              {t.tips}
              <span className="text-base leading-none text-mute transition-transform duration-300 group-open/tips:rotate-45">+</span>
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-ink-soft">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
          <AddToTripButton id={a.id} text={text.trip} />
          <button type="button" className={linkButton} onClick={onShowOnMap}>
            {t.showOnMap}
          </button>
          <a className={linkButton} href={googleMapsUrl(a, parkNameEn)} target="_blank" rel="noreferrer" title={t.googleMapsHint}>
            {t.googleMaps}
          </a>
          <a
            className={linkButton}
            href={`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lon}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.navigate}
          </a>
        </div>
      </div>
    </article>
  );
}
