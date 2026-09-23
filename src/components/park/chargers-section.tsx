import { Section } from "@/components/section";
import type { Park } from "@/data/parks";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import {
  getChargersNear,
  isDcFast,
  isTeslaSupercharger,
  stationFlags,
  type ChargingStation,
  type StationFlag,
} from "@/lib/nlr";
import { settle } from "@/lib/settle";
import { ApiUnavailable } from "./api-unavailable";

const RADIUS_MILES = 60;
const MAX_ROWS = 12;

type ChargerText = Dictionary["park"]["chargers"];

const flagStyles: Record<StationFlag, string> = {
  unavailable: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  stale: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  nonNetworked: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

export async function ChargersSection({ park, dict }: { park: Park; dict: Dictionary }) {
  const t = dict.park.chargers;
  const result = await settle(getChargersNear(park.gateway.lat, park.gateway.lon, RADIUS_MILES));

  return (
    <Section title={t.title} source={t.source}>
      {result.ok ? (
        <ChargerReport stations={result.data} t={t} />
      ) : (
        <ApiUnavailable error={result.error} dict={dict} />
      )}
    </Section>
  );
}

function ChargerReport({ stations, t }: { stations: ChargingStation[]; t: ChargerText }) {
  if (stations.length === 0) {
    return <p className="text-sm text-stone-500">{fill(t.empty, { radius: RADIUS_MILES })}</p>;
  }

  const dcFast = stations.filter(isDcFast);
  const nearestDcFast = dcFast.find((station) => station.status_code === "E");
  const stats: [string, number][] = [
    [t.stats.total, stations.length],
    [t.stats.dcFast, dcFast.length],
    [t.stats.tesla, stations.filter(isTeslaSupercharger).length],
    [t.stats.unavailable, stations.filter((station) => station.status_code === "T").length],
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">{fill(t.scope, { radius: RADIUS_MILES })}</p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
            <dt className="text-xs text-stone-500">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {nearestDcFast ? (
        <p className="text-sm">
          {fill(t.nearestDcFast, {
            name: nearestDcFast.station_name,
            distance: nearestDcFast.distance.toFixed(0),
          })}
        </p>
      ) : (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/60 dark:text-red-200">
          {fill(t.noDcFast, { radius: RADIUS_MILES })}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-stone-500">
            <tr>
              <th className="py-2 pr-3 font-normal">{t.columns.name}</th>
              <th className="py-2 pr-3 font-normal whitespace-nowrap">{t.columns.distance}</th>
              <th className="py-2 pr-3 font-normal">{t.columns.type}</th>
              <th className="py-2 font-normal">{t.columns.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {stations.slice(0, MAX_ROWS).map((station) => (
              <StationRow key={station.id} station={station} t={t} />
            ))}
          </tbody>
        </table>
      </div>

      {stations.length > MAX_ROWS && (
        <p className="text-xs text-stone-500">
          {fill(t.more, { shown: MAX_ROWS, total: stations.length })}
        </p>
      )}
    </div>
  );
}

function StationRow({ station, t }: { station: ChargingStation; t: ChargerText }) {
  const flags = stationFlags(station);
  const ports = [
    station.ev_dc_fast_num ? fill(t.dcFast, { n: station.ev_dc_fast_num }) : null,
    station.ev_level2_evse_num ? fill(t.level2, { n: station.ev_level2_evse_num }) : null,
  ].filter(Boolean);
  const network = station.ev_network
    ? (t.networks[station.ev_network] ?? station.ev_network.replace(/_/g, " "))
    : "—";

  return (
    <tr className="align-top">
      <td className="py-2 pr-3">
        <div className="font-medium">{station.station_name}</div>
        <div className="text-xs text-stone-500">
          {station.city}, {station.state}
        </div>
      </td>
      <td className="py-2 pr-3 tabular-nums whitespace-nowrap">{station.distance.toFixed(1)} mi</td>
      <td className="py-2 pr-3">
        <div>{network}</div>
        <div className="text-xs text-stone-500">{ports.join(" · ")}</div>
      </td>
      <td className="py-2">
        <div className="flex flex-wrap gap-1">
          {flags.length === 0 ? (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs whitespace-nowrap text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              {t.ok}
            </span>
          ) : (
            flags.map((flag) => (
              <span
                key={flag}
                className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${flagStyles[flag]}`}
              >
                {t.flags[flag]}
              </span>
            ))
          )}
        </div>
      </td>
    </tr>
  );
}
