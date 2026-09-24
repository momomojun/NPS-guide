"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tripIds, useTrip } from "@/lib/trip-store";

export function TripNavLink({ href, label }: { href: string; label: string }) {
  const trip = useTrip();
  const count = tripIds(trip).length;
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm ${
        active
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      }`}
    >
      {label}
      {count > 0 && (
        <span className="rounded-full bg-emerald-600 px-1.5 text-[11px] leading-4 font-medium text-white">{count}</span>
      )}
    </Link>
  );
}
