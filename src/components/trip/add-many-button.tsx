"use client";

import { buttonAdded, buttonPrimary } from "@/components/ui";
import { addToTrip, tripIds, useTrip } from "@/lib/trip-store";

/** 一次加入多个景点（比如一个公园的全部必去），全部已加入时变成已完成状态 */
export function AddManyButton({
  ids,
  label,
  doneLabel,
  className = "",
}: {
  ids: string[];
  label: string;
  doneLabel: string;
  className?: string;
}) {
  const trip = useTrip();
  const existing = new Set(tripIds(trip));
  const allAdded = ids.every((id) => existing.has(id));

  return (
    <button
      type="button"
      disabled={allAdded}
      onClick={() => addToTrip(ids)}
      className={`${allAdded ? buttonAdded : buttonPrimary} ${className}`}
    >
      {allAdded ? doneLabel : label}
    </button>
  );
}
