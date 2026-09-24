"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tripIds, useTrip } from "@/lib/trip-store";

/** 页头的“行程”，后面带景点数；颜色跟随页头（透明时白字，滚动后墨色） */
export function TripNavLink({ href, label }: { href: string; label: string }) {
  const trip = useTrip();
  const count = tripIds(trip).length;
  const active = usePathname() === href;

  return (
    <Link href={href} className={`inline-flex items-baseline gap-1.5 hover:opacity-60 ${active ? "link-line" : ""}`}>
      {label}
      {count > 0 && <span className="text-[11px] tabular-nums opacity-60">{count}</span>}
    </Link>
  );
}
