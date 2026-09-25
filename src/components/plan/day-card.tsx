"use client";

import type { DragEvent, ReactNode } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
import {
  IconAlert,
  IconBed,
  IconCar,
  IconCheck,
  IconChevronRight,
  IconGrip,
  IconPause,
  IconSunrise,
  IconSunset,
} from "@/components/icons";
import type { AttractionWithPhoto } from "@/data/attractions";
import { fill, formatDuration, formatMonths } from "@/i18n/format";
import { monthOf } from "@/lib/dates";
import { formatClock } from "@/lib/sun";
import { moveItem, removeItem, setItemStatus } from "@/lib/trip-edit";
import type { Trip } from "@/lib/trip-store";
import { ActionMenu } from "./action-menu";
import type { DayView, DragSpot, PlannerText } from "./types";

export interface DragHandlers {
  source: DragSpot | null;
  target: DragSpot | null;
  start: (spot: DragSpot) => void;
  over: (spot: DragSpot) => void;
  drop: () => void;
  end: () => void;
}

type Tone = "warn" | "info";

/** 时间线三列：拖动把手、时间、内容；出发 / 开车 / 回住处的行也用同样的列宽，才能对齐 */
const gripCol = "w-4 shrink-0";
const timeCol = "w-[3.75rem] shrink-0 text-right tabular-nums";
/** 开始时间：大号等宽数字（衬线字体的数字高低不齐，不好认） */
const clock = "block text-[17px] leading-6 font-medium text-ink";

export function DayCard({
  view,
  color,
  dayCount,
  itemCount,
  dateLabel,
  parkNames,
  text,
  selectedId,
  openId,
  details,
  onSelect,
  onEdit,
  mapsUrl,
  drag,
  header,
  footer,
}: {
  view: DayView;
  /** 这天在整个行程地图上的颜色 */
  color: string;
  dayCount: number;
  /** trip.days[day].length，拖到末尾时用 */
  itemCount: number;
  dateLabel: string | null;
  parkNames: string[];
  text: PlannerText;
  selectedId: string | null;
  /** 展开详情的景点 */
  openId: string | null;
  /** 景点详情：照片、评分、简介、提示 */
  details: (stop: AttractionWithPhoto) => ReactNode;
  /** 点景点：展开 / 收起详情，并在地图上选中 */
  onSelect: (id: string) => void;
  onEdit: (change: (trip: Trip) => Trip) => void;
  /** 景点在 Google Maps 上的搜索链接 */
  mapsUrl: (stop: AttractionWithPhoto) => string;
  drag: DragHandlers;
  /** 卡片顶部的内容，比如第 1 天的出发地 */
  header?: ReactNode;
  /** 卡片底部的内容：今晚住哪 */
  footer: ReactNode;
}) {
  const t = text.plan;
  const { day, rows, sun, timeline, from } = view;
  const duration = (minutes: number) => formatDuration(minutes, text.units);
  const month = view.date ? monthOf(view.date) : null;
  const isTarget = (index: number) => drag.target?.day === day && drag.target.index === index;
  const isSource = (index: number) => drag.source?.day === day && drag.source.index === index;

  const notesFor = (stop: AttractionWithPhoto) => {
    const notes: { text: string; tone: Tone }[] = [];
    if (month !== null && stop.openMonths && !stop.openMonths.includes(month)) {
      notes.push({
        text:
          stop.openMonths.length === 0
            ? t.warnings.closedNow
            : fill(t.warnings.closed, { months: formatMonths(stop.openMonths, text.units) }),
        tone: "warn",
      });
    } else if (month !== null && stop.bestMonths && !stop.bestMonths.includes(month)) {
      notes.push({ text: fill(t.warnings.notBest, { months: formatMonths(stop.bestMonths, text.units) }), tone: "info" });
    }
    if (stop.permit) notes.push({ text: t.warnings.permit, tone: "warn" });
    return notes;
  };

  // 拖拽：放在某一行上 = 插到这一行前面；放在列表末尾的空白 = 加到最后
  const dropHere = (spot: DragSpot) => ({
    onDragOver: (event: DragEvent) => {
      if (!drag.source) return;
      event.preventDefault();
      event.stopPropagation();
      drag.over(spot);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      drag.drop();
    },
  });

  const dayWarnings = [
    timeline.overloaded ? t.warnings.overloaded : null,
    timeline.lateReturn ? t.warnings.lateReturn : null,
  ].filter((warning): warning is string => warning !== null);

  return (
    <section id={`plan-day-${day}`} className="scroll-mt-24 border-t border-ink">
      <header className="flex flex-wrap items-start justify-between gap-4 py-5">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-4xl leading-none text-clay-700 tabular-nums">
            {String(day + 1).padStart(2, "0")}
          </span>
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <span aria-hidden className="inline-block h-[3px] w-5" style={{ backgroundColor: color }} />
              {fill(t.day, { n: day + 1 })}{" "}
              {dateLabel && <span className="ml-1 font-sans text-sm text-mute">{dateLabel}</span>}
            </h2>
            {parkNames.length > 0 && <p className="eyebrow mt-1.5 text-mute">{parkNames.join(" · ")}</p>}
          </div>
        </div>
        <div className="space-y-1 text-right text-xs text-mute">
          {sun.kind === "normal" && (
            <p className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <IconSunrise className="text-sm" /> {fill(t.sunrise, { time: formatClock(sun.window.sunrise) })}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconSunset className="text-sm" /> {fill(t.sunset, { time: formatClock(sun.window.sunset) })}
              </span>
            </p>
          )}
          {sun.kind === "polar-day" && <p>{t.polarDay}</p>}
          {sun.kind === "polar-night" && <p>{t.polarNight}</p>}
          {rows.length > 0 && (
            <p>{fill(t.summary, { active: duration(timeline.activeMin), drive: duration(timeline.driveMin) })}</p>
          )}
        </div>
      </header>

      {dayWarnings.length > 0 && (
        <ul className="mb-4 space-y-1 border-l border-clay-600 pl-4 text-xs text-clay-800">
          {dayWarnings.map((warning) => (
            <li key={warning} className="flex items-center gap-1.5">
              <IconAlert /> {warning}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-4 pb-8">
        {header}
        {from && timeline.departAt !== undefined && (
          <div className="flex items-center gap-3 px-1.5">
            <span className={gripCol} aria-hidden />
            <span className={timeCol}>
              <span className={clock}>{formatClock(timeline.departAt)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-soft">
              <IconBed className="shrink-0 text-base text-mute" />
              {fill(t.lodging.departFrom, { name: from.name })}
            </span>
          </div>
        )}

        {rows.length === 0 ? (
          <div
            {...dropHere({ day, index: 0 })}
            className={`border border-dashed py-6 text-center text-sm text-mute ${
              isTarget(0) ? "border-clay-600 bg-clay-50" : "border-line"
            }`}
          >
            {t.empty_day}
          </div>
        ) : (
          <ol>
            {rows.map(({ item, index, stop }, k) => {
              const entry = timeline.entries[k];
              const finished = item.status !== "planned";
              const notes = finished
                ? []
                : [...notesFor(stop), ...entry.warnings.map((w) => ({ text: t.warnings[w], tone: "warn" as Tone }))];
              return (
                <li
                  key={item.id}
                  id={`plan-item-${item.id}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", item.id);
                    drag.start({ day, index });
                  }}
                  onDragEnd={drag.end}
                  {...dropHere({ day, index })}
                  className={`group scroll-mt-24 border-t-2 ${isTarget(index) ? "border-clay-600" : "border-transparent"} ${
                    isSource(index) ? "opacity-40" : ""
                  }`}
                >
                  {entry.driveMin > 0 && (
                    <p className="flex items-center gap-3 px-1.5 py-1 text-xs text-mute">
                      <span className={gripCol} aria-hidden />
                      <span className={timeCol} aria-hidden />
                      <span className="inline-flex items-center gap-1.5">
                        <IconCar className="text-sm" /> {fill(t.drive, { d: duration(entry.driveMin) })}
                      </span>
                    </p>
                  )}
                  {entry.waitMin >= 30 && (
                    <p className="flex items-center gap-3 px-1.5 py-1 text-xs text-mute">
                      <span className={gripCol} aria-hidden />
                      <span className={timeCol} aria-hidden />
                      <span className="inline-flex items-center gap-1.5">
                        <IconPause className="text-sm" /> {fill(t.free, { d: duration(entry.waitMin) })}
                      </span>
                    </p>
                  )}
                  <div
                    className={`flex items-start gap-3 px-1.5 py-2.5 transition-colors ${
                      stop.id === selectedId ? "bg-paper-deep" : "hover:bg-paper-deep/60"
                    }`}
                  >
                    <span
                      aria-hidden
                      title={t.dragHint}
                      className={`${gripCol} cursor-grab pt-1 text-line select-none group-hover:text-mute active:cursor-grabbing`}
                    >
                      <IconGrip />
                    </span>
                    <span className={timeCol}>
                      <span className={`${clock} ${finished ? "text-mute" : ""}`}>{formatClock(entry.start)}</span>
                      <span className="block text-[11px] leading-4 text-mute">{fill(t.until, { time: formatClock(entry.end) })}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelect(stop.id)}
                      aria-expanded={openId === stop.id}
                      className="group/stop min-w-0 flex-1 text-left"
                    >
                      <p className={`font-serif text-base ${finished ? "text-mute" : ""} ${item.status === "done" ? "line-through" : ""}`}>
                        <span
                          className="mr-2 inline-block size-1.5 rounded-full align-middle"
                          style={{ backgroundColor: KIND_COLORS[stop.kind] }}
                        />
                        {stop.nameZh} <span className="ml-1 font-sans text-[11px] tracking-[0.12em] text-mute uppercase">{stop.nameEn}</span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-mute">
                        {text.kinds[stop.kind]} · {duration(stop.durationMin)}
                        {stop.hotRank !== undefined && (
                          <span className="text-clay-700"> · {fill(text.attraction.hotRank, { n: stop.hotRank })}</span>
                        )}
                        {stop.google && <span> · ★{stop.google.rating.toFixed(1)}</span>}
                        {stop.mustSee && <span className="text-clay-700"> · {text.attraction.mustSee}</span>}
                        {finished && ` · ${t.status[item.status as "done" | "skipped"]}`}
                        <span className="ml-2 inline-flex items-center gap-0.5 text-ink-soft group-hover/stop:text-clay-700">
                          {openId === stop.id ? t.hideDetails : t.showDetails}
                          <IconChevronRight
                            className={`text-[11px] transition-transform ${openId === stop.id ? "-rotate-90" : "rotate-90"}`}
                          />
                        </span>
                      </p>
                      {notes.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {notes.map((note) => (
                            <span
                              key={note.text}
                              className={`border px-1.5 py-0.5 text-[11px] ${
                                note.tone === "warn" ? "border-clay-600/40 text-clay-700" : "border-line text-ink-soft"
                              }`}
                            >
                              {note.text}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.status === "done"}
                      aria-label={t.status.done}
                      title={item.status === "planned" ? t.status.done : t.status.undo}
                      onClick={() =>
                        onEdit((trip) => setItemStatus(trip, day, index, item.status === "planned" ? "done" : "planned"))
                      }
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center border text-sm transition-colors ${
                        item.status === "done"
                          ? "border-pine-600 bg-pine-600 text-paper"
                          : item.status === "skipped"
                            ? "border-line bg-paper-deep text-mute"
                            : "border-ink/25 hover:border-pine-600"
                      }`}
                    >
                      {item.status === "done" ? <IconCheck /> : item.status === "skipped" ? "–" : ""}
                    </button>
                    <ActionMenu
                      label={t.more}
                      actions={[
                        {
                          label: t.actions.up,
                          disabled: index === 0,
                          onSelect: () => onEdit((trip) => moveItem(trip, day, index, day, index - 1)),
                        },
                        {
                          label: t.actions.down,
                          disabled: index === itemCount - 1,
                          onSelect: () => onEdit((trip) => moveItem(trip, day, index, day, index + 2)),
                        },
                        ...Array.from({ length: dayCount }, (_, target) => target)
                          .filter((target) => target !== day)
                          .map((target) => ({
                            label: fill(t.moveTo, { n: target + 1 }),
                            onSelect: () => onEdit((trip) => moveItem(trip, day, index, target, trip.days[target].length)),
                          })),
                        {
                          label: item.status === "skipped" ? t.status.undo : t.status.skipped,
                          onSelect: () =>
                            onEdit((trip) =>
                              setItemStatus(trip, day, index, item.status === "skipped" ? "planned" : "skipped"),
                            ),
                        },
                        {
                          label: t.openGoogleMaps,
                          onSelect: () => window.open(mapsUrl(stop), "_blank", "noopener"),
                        },
                        {
                          label: t.actions.remove,
                          danger: true,
                          onSelect: () => onEdit((trip) => removeItem(trip, day, index)),
                        },
                      ]}
                    />
                  </div>
                  {openId === stop.id && (
                    <div
                      className="pt-1 pb-3 pl-0 sm:pl-[6.625rem]"
                      draggable
                      onDragStart={(event) => {
                        // 详情里选文字、点照片时不要拖动整行
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      {details(stop)}
                    </div>
                  )}
                </li>
              );
            })}
            <li
              aria-hidden
              {...dropHere({ day, index: itemCount })}
              className={`h-3 border-t-2 ${isTarget(itemCount) ? "border-clay-600" : "border-transparent"}`}
            />
          </ol>
        )}
        {view.to && timeline.returnAt !== undefined && rows.length > 0 && (
          <div>
            {timeline.returnDriveMin > 0 && (
              <p className="flex items-center gap-3 px-1.5 py-1 text-xs text-mute">
                <span className={gripCol} aria-hidden />
                <span className={timeCol} aria-hidden />
                <span className="inline-flex items-center gap-1.5">
                  <IconCar className="text-sm" /> {fill(t.drive, { d: duration(timeline.returnDriveMin) })}
                </span>
              </p>
            )}
            <div className="flex items-center gap-3 px-1.5 pt-1">
              <span className={gripCol} aria-hidden />
              <span className={timeCol}>
                <span className={`${clock} ${timeline.lateReturn ? "text-clay-700" : ""}`}>{formatClock(timeline.returnAt)}</span>
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-soft">
                <IconBed className="shrink-0 text-base text-mute" />
                {fill(t.lodging.arriveAt, { name: view.to.name })}
              </span>
            </div>
          </div>
        )}

        {footer}
      </div>
    </section>
  );
}
