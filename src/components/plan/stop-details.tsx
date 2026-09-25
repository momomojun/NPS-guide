"use client";

import type { ReactNode } from "react";
import {
  AttractionMeta,
  AttractionTags,
  attractionTips,
  ClosedNotice,
  linkButton,
  PopularityBadge,
} from "@/components/attractions/attraction-card";
import { PhotoGallery } from "@/components/attractions/photo-gallery";
import { IconTrail } from "@/components/icons";
import type { AttractionWithPhoto } from "@/data/attractions";
import { googleMapsUrl } from "@/data/attractions/google";
import type { Photo } from "@/data/attractions/types";
import { fill } from "@/i18n/format";
import type { PlannerText } from "./types";

/**
 * 行程里点开一个景点：照片、热度和评分、停留多久、徒步数据、开放情况、为什么值得去、实用提示。
 * 让人不用跳到公园页就能判断想不想去。
 */
export function StopDetails({
  stop,
  photos,
  month,
  parkNameEn,
  parkHref,
  text,
  actions,
  onClose,
}: {
  stop: AttractionWithPhoto;
  /** undefined 表示还在加载 */
  photos: Photo[] | undefined;
  /** 行程所在月份，用来提示那个月开不开放 */
  month: number | null;
  parkNameEn: string;
  /** 公园页上这个景点的链接 */
  parkHref: string;
  text: PlannerText;
  /** 放在链接前面的按钮，比如加入行程 */
  actions?: ReactNode;
  onClose: () => void;
}) {
  const t = text.attraction;
  const tips = attractionTips(stop, text);
  const destination = stop.start ?? stop;

  return (
    <div className="grid gap-6 border border-line bg-paper p-4 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:p-5">
      <div className="min-w-0">
        {photos === undefined ? (
          <div className="aspect-[3/2] animate-pulse bg-paper-deep" aria-label={t.loadingPhotos} />
        ) : photos.length > 0 ? (
          <PhotoGallery photos={photos} title={stop.nameZh} alt={`${stop.nameZh} ${stop.nameEn}`} text={t} />
        ) : (
          <div className="flex aspect-[3/2] items-center justify-center bg-paper-deep text-xs text-mute">{t.noPhotos}</div>
        )}
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <PopularityBadge attraction={stop} text={text} />
          <button type="button" className="shrink-0 text-xs text-mute hover:text-ink" onClick={onClose}>
            {t.collapse}
          </button>
        </div>
        <AttractionMeta attraction={stop} text={text} />
        <AttractionTags attraction={stop} text={text} />
        <ClosedNotice attraction={stop} month={month} text={text} />
        <p className="text-[15px] leading-7 text-ink-soft">{stop.summary}</p>
        {stop.trailLine && (
          <p className="inline-flex items-center gap-2 text-xs text-clay-700">
            <IconTrail className="text-base" />
            {fill(t.trailLength, { km: stop.trailLine.km.toFixed(1), type: stop.trailLine.loop ? t.loopTrail : t.oneWay })}
          </p>
        )}
        {tips.length > 0 && (
          <div className="border-t border-line pt-3">
            <p className="text-xs tracking-[0.1em] text-mute">{t.tips}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-soft marker:text-line">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
          {actions}
          <a className={linkButton} href={parkHref}>
            {t.parkPage}
          </a>
          <a className={linkButton} href={googleMapsUrl(stop, parkNameEn)} target="_blank" rel="noreferrer" title={t.googleMapsHint}>
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
    </div>
  );
}
