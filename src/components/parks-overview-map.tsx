"use client";

import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { ParkMap, type MapPoint, type MapText } from "@/components/map/park-map";

export function ParksOverviewMap({
  parks,
  locale,
  text,
  className,
  children,
}: {
  parks: { code: string; name: string; lat: number; lon: number }[];
  locale: string;
  text: MapText;
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const points = useMemo<MapPoint[]>(
    () =>
      parks.map((park) => ({
        id: park.code,
        lat: park.lat,
        lon: park.lon,
        label: park.name,
        color: "#047857",
        emphasis: true,
      })),
    [parks],
  );

  return (
    <ParkMap
      points={points}
      onSelect={(code) => router.push(`/${locale}/parks/${code}`)}
      text={text}
      className={className}
    >
      {children}
    </ParkMap>
  );
}
