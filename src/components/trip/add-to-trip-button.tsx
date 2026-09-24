"use client";

import { buttonAdded, buttonPrimary } from "@/components/ui";
import { addToTrip, removeFromTrip, tripIds, useTrip } from "@/lib/trip-store";

export function AddToTripButton({ id, text }: { id: string; text: { add: string; added: string } }) {
  const trip = useTrip();
  const added = tripIds(trip).includes(id);

  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={() => (added ? removeFromTrip(id) : addToTrip(id))}
      className={added ? buttonAdded : buttonPrimary}
    >
      {added ? text.added : text.add}
    </button>
  );
}
