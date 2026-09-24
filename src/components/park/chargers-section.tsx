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

// 状态用小圆点 + 文字，不用彩色底块
const flagStyles: Record<StationFlag, string> = {
  unavailable: "text-clay-700 before:bg-clay-600",
  stale: "text-[#9a6a1f] before:bg-[#c08a3e]",
  nonNetworked: "text-mute before:bg-mute",
};

const statusClass = "inline-flex items-center gap-1.5 text-xs whitespace-nowrap before:size-1.5 before:rounded-full before:content-['']";

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
    return <p className="text-sm text-mute">{fill(t.empty, { radius: RADIUS_MILES })}</p>;
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
    <div className="space-y-8">
      <p className="text-sm text-mute">{fill(t.scope, { radius: RADIUS_MILES })}</p>

      <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse border-l border-line pl-5">
            <dt className="mt-2 text-xs text-mute">{label}</dt>
            <dd className="font-serif text-5xl leading-none tabular-nums">{value}</dd>
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
        <p className="border-l border-clay-600 pl-5 text-sm text-clay-800">
          {fill(t.noDcFast, { radius: RADIUS_MILES })}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink text-left text-xs text-mute">
            <tr>
              <th className="pb-3 pr-3 font-normal">{t.columns.name}</th>
              <th className="pb-3 pr-3 font-normal whitespace-nowrap">{t.columns.distance}</th>
              <th className="pb-3 pr-3 font-normal">{t.columns.type}</th>
              <th className="pb-3 font-normal">{t.columns.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stations.slice(0, MAX_ROWS).map((station) => (
              <StationRow key={station.id} station={station} t={t} />
            ))}
          </tbody>
        </table>
      </div>

      {stations.length > MAX_ROWS && (
        <p className="text-xs text-mute">
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
      <td className="py-3.5 pr-3">
        <div className="font-medium">{station.station_name}</div>
        <div className="text-xs text-mute">
          {station.city}, {station.state}
        </div>
      </td>
      <td className="py-3.5 pr-3 tabular-nums whitespace-nowrap">{station.distance.toFixed(1)} mi</td>
      <td className="py-3.5 pr-3">
        <div>{network}</div>
        <div className="text-xs text-mute">{ports.join(" · ")}</div>
      </td>
      <td className="py-3.5">
        <div className="flex flex-wrap gap-1">
          {flags.length === 0 ? (
            <span className={`${statusClass} text-pine-700 before:bg-pine-500`}>
              {t.ok}
            </span>
          ) : (
            flags.map((flag) => (
              <span
                key={flag}
                className={`${statusClass} ${flagStyles[flag]}`}
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
