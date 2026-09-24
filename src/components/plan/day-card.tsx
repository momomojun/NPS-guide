"use client";

import type { DragEvent, ReactNode } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
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

export function DayCard({
  view,
  dayCount,
  itemCount,
  dateLabel,
  parkNames,
  text,
  selectedId,
  onSelect,
  onEdit,
  drag,
  header,
  footer,
}: {
  view: DayView;
  dayCount: number;
  /** trip.days[day].length，拖到末尾时用 */
  itemCount: number;
  dateLabel: string | null;
  parkNames: string[];
  text: PlannerText;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (change: (trip: Trip) => Trip) => void;
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
      notes.push({ text: fill(t.warnings.closed, { months: formatMonths(stop.openMonths, text.units) }), tone: "warn" });
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
    <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {day + 1}
          </span>
          <div>
            <h2 className="font-semibold">
              {fill(t.day, { n: day + 1 })}{" "}
              {dateLabel && <span className="text-sm font-normal text-stone-500">{dateLabel}</span>}
            </h2>
            {parkNames.length > 0 && <p className="text-xs text-stone-500">{parkNames.join(" → ")}</p>}
          </div>
        </div>
        <div className="text-right text-xs text-stone-500">
          {sun.kind === "normal" && (
            <p>
              🌅 {fill(t.sunrise, { time: formatClock(sun.window.sunrise) })} · 🌇{" "}
              {fill(t.sunset, { time: formatClock(sun.window.sunset) })}
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
        <ul className="space-y-0.5 bg-red-50 px-4 py-2 text-xs text-red-800 dark:bg-red-950/60 dark:text-red-200">
          {dayWarnings.map((warning) => (
            <li key={warning}>⚠ {warning}</li>
          ))}
        </ul>
      )}

      <div className="space-y-3 p-4">
        {header}
        {from && timeline.departAt !== undefined && (
          <p className="pl-1 text-xs text-stone-500">
            🏨 {fill(t.lodging.depart, { time: formatClock(timeline.departAt), name: from.name })}
          </p>
        )}

        {rows.length === 0 ? (
          <div
            {...dropHere({ day, index: 0 })}
            className={`rounded-lg border-2 border-dashed py-5 text-center text-sm text-stone-400 ${
              isTarget(0) ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-stone-200 dark:border-stone-700"
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
                  className={`group scroll-mt-24 border-t-2 ${isTarget(index) ? "border-emerald-500" : "border-transparent"} ${
                    isSource(index) ? "opacity-40" : ""
                  }`}
                >
                  {entry.driveMin > 0 && (
                    <p className="py-0.5 pl-8 text-xs text-stone-400">🚗 {fill(t.drive, { d: duration(entry.driveMin) })}</p>
                  )}
                  {entry.waitMin >= 30 && (
                    <p className="py-0.5 pl-8 text-xs text-stone-400">☕ {fill(t.free, { d: duration(entry.waitMin) })}</p>
                  )}
                  <div
                    className={`flex items-start gap-2 rounded-lg px-1.5 py-2 ${
                      stop.id === selectedId ? "bg-emerald-50 dark:bg-emerald-950/40" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <span
                      aria-hidden
                      title={t.dragHint}
                      className="cursor-grab pt-0.5 text-stone-300 select-none group-hover:text-stone-500 active:cursor-grabbing"
                    >
                      ⠿
                    </span>
                    <span className="w-[5.5rem] shrink-0 pt-0.5 text-xs text-stone-500 tabular-nums">
                      {formatClock(entry.start)}–{formatClock(entry.end)}
                    </span>
                    <button type="button" onClick={() => onSelect(stop.id)} className="min-w-0 flex-1 text-left">
                      <p className={`text-sm font-medium ${finished ? "text-stone-400" : ""} ${item.status === "done" ? "line-through" : ""}`}>
                        <span
                          className="mr-1.5 inline-block size-2 rounded-full align-middle"
                          style={{ backgroundColor: KIND_COLORS[stop.kind] }}
                        />
                        {stop.nameZh} <span className="text-xs font-normal text-stone-400">{stop.nameEn}</span>
                      </p>
                      <p className="text-xs text-stone-500">
                        {text.kinds[stop.kind]} · {duration(stop.durationMin)}
                        {finished && ` · ${t.status[item.status as "done" | "skipped"]}`}
                      </p>
                      {notes.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {notes.map((note) => (
                            <span
                              key={note.text}
                              className={`rounded px-1.5 py-0.5 text-[11px] ${
                                note.tone === "warn"
                                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                  : "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200"
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
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs ${
                        item.status === "done"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : item.status === "skipped"
                            ? "border-stone-300 bg-stone-100 text-stone-400 dark:border-stone-600 dark:bg-stone-800"
                            : "border-stone-300 hover:border-emerald-500 dark:border-stone-600"
                      }`}
                    >
                      {item.status === "done" ? "✓" : item.status === "skipped" ? "–" : ""}
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
                          label: t.actions.remove,
                          danger: true,
                          onSelect: () => onEdit((trip) => removeItem(trip, day, index)),
                        },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
            <li
              aria-hidden
              {...dropHere({ day, index: itemCount })}
              className={`h-3 border-t-2 ${isTarget(itemCount) ? "border-emerald-500" : "border-transparent"}`}
            />
          </ol>
        )}

        {footer}
      </div>
    </section>
  );
}
