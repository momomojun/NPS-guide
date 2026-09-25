import Link from "next/link";
import { alaskaMap, westMap, type MapView } from "@/data/map.generated";

export interface MapPark {
  code: string;
  href: string;
  nameZh: string;
  nameEn: string;
}

type Side = "left" | "right" | "below";

/** 公园名放在圆点哪一侧，避开旁边的公园和城市 */
const LABEL_SIDE: Record<string, Side> = {
  olym: "left",
  noca: "right",
  mora: "right",
  crla: "right",
  redw: "left",
  lavo: "right",
  yose: "right",
  seki: "left",
  chis: "left",
  yell: "right",
  grte: "left",
  deva: "below",
  zion: "left",
  brca: "right",
  grca: "right",
  dena: "left",
};

/** 州名默认放在州的中心，挡住公园的挪开 */
const STATE_LABEL_AT: Record<string, [number, number]> = {
  CALIFORNIA: [255, 745],
  WASHINGTON: [410, 140],
};

const SIDE_CLASS: Record<Side, string> = {
  right: "left-6 top-1/2 -translate-y-1/2",
  left: "right-6 top-1/2 -translate-y-1/2 text-right",
  below: "top-6 left-1/2 -translate-x-1/2 text-center",
};

/**
 * textScale：小图缩得更厉害，文字和圆点要按比例放大才看得清。
 * 小图不画州名（框上已经写了阿拉斯加）
 */
function Shapes({
  view,
  cityNames,
  textScale = 1,
}: {
  view: MapView;
  cityNames: Record<string, string>;
  textScale?: number;
}) {
  const labels = textScale === 1 ? view.labels : [];
  return (
    <svg viewBox={`0 0 ${view.width} ${view.height}`} className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden>
      {view.states.map((state) => (
        <path
          key={state.name}
          d={state.d}
          fill={state.focus ? "var(--color-paper-deep)" : "none"}
          stroke={state.focus ? "#b8ac97" : "#dcd3c5"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ))}
      {labels.map((label) => {
        const [x, y] = STATE_LABEL_AT[label.text] ?? [label.x, label.y];
        return (
          <text
            key={label.text}
            x={x}
            y={y}
            textAnchor="middle"
            fill="#a89e8f"
            className="max-sm:hidden"
            fontSize={15 * textScale}
            letterSpacing={6 * textScale}
            style={{ fontFamily: "var(--font-jost)" }}
          >
            {label.text}
          </text>
        );
      })}
      {view.cities.map((city) => (
        <g key={city.id}>
          <circle cx={city.x} cy={city.y} r={3.5 * textScale} fill="var(--color-paper)" stroke="#857e72" strokeWidth={1.2 * textScale} />
          <text
            x={city.x + 10 * textScale}
            y={city.y + 5 * textScale}
            fill="#857e72"
            fontSize={15 * textScale}
            // 手机上缩得太小看不清，只留圆点
            className="max-sm:hidden"
          >
            {cityNames[city.id] ?? city.nameZh}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Marker({ park, view }: { park: MapPark; view: MapView }) {
  const point = view.parks[park.code];
  if (!point) return null;
  const [x, y] = point;
  const side = LABEL_SIDE[park.code] ?? "right";
  return (
    <Link
      href={park.href}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / view.width) * 100}%`, top: `${(y / view.height) * 100}%` }}
    >
      <span className="block size-3 rounded-full bg-ink ring-[5px] ring-ink/10 transition-all duration-500 group-hover:scale-125 group-hover:bg-clay-600 group-hover:ring-clay-600/20" />
      <span className={`absolute whitespace-nowrap ${SIDE_CLASS[side]}`}>
        <span className="block font-serif text-sm leading-tight transition-colors duration-500 group-hover:text-clay-700 sm:text-lg">
          {park.nameZh}
        </span>
        <span className="eyebrow hidden text-[10px] text-mute sm:block">{park.nameEn}</span>
      </span>
    </Link>
  );
}

/** 首页的线描地图：美国西部的公园 + 阿拉斯加小图（放在右上角蒙大拿一带的空白处） */
export function WestMap({
  parks,
  cityNames,
  alaskaLabel,
}: {
  parks: MapPark[];
  /** 城市 id → 当前语言的名字 */
  cityNames: Record<string, string>;
  alaskaLabel: string;
}) {
  const alaskaParks = parks.filter((park) => alaskaMap.parks[park.code]);
  return (
    <div className="relative">
      <div className="relative" style={{ aspectRatio: `${westMap.width} / ${westMap.height}` }}>
        <Shapes view={westMap} cityNames={cityNames} />
        {parks.map((park) => (
          <Marker key={park.code} park={park} view={westMap} />
        ))}
      </div>

      <div className="mt-6 w-2/3 border border-line bg-paper p-4 sm:absolute sm:top-0 sm:right-0 sm:mt-0 sm:w-[30%]">
        <p className="eyebrow text-mute">{alaskaLabel}</p>
        <div className="relative mt-2" style={{ aspectRatio: `${alaskaMap.width} / ${alaskaMap.height}` }}>
          <Shapes view={alaskaMap} cityNames={cityNames} textScale={3} />
          {alaskaParks.map((park) => (
            <Marker key={park.code} park={park} view={alaskaMap} />
          ))}
        </div>
      </div>
    </div>
  );
}
