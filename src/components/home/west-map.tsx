import Link from "next/link";
import { alaskaMap, eastMap, hawaiiMap, westMap, type MapView } from "@/data/map.generated";
import { MapDeclutter } from "./map-declutter";
import { LABEL_CLASS, type Side } from "./map-sides";

export interface MapPark {
  code: string;
  href: string;
  nameZh: string;
  nameEn: string;
  /** 热门程度（各景点的 Google 评论数加起来）：名字挤在一起时，冷门得多的公园先让 */
  weight?: number;
}

/** 公园名放在圆点哪一侧，避开旁边的公园和城市（大屏上按这个摆；挤的时候 MapDeclutter 会换边） */
const LABEL_SIDE: Record<string, Side> = {
  olym: "left",
  noca: "right",
  mora: "right",
  crla: "right",
  redw: "left",
  lavo: "right",
  // 优胜美地、死亡谷都标在上面，红杉（左右两边是尖峰石阵、死亡谷的圆点）、海峡群岛标在下面，四个名字错开
  yose: "above",
  seki: "below",
  // 海峡群岛右边是洛杉矶，尖峰石阵右边紧挨着优胜美地、红杉：都标在别处
  chis: "below",
  pinn: "left",
  yell: "right",
  grte: "left",
  deva: "above",
  zion: "left",
  brca: "right",
  grca: "right",
  dena: "left",
  // 拱门和峡谷地的圆点几乎挨着：一个标在上面，一个标在右边
  arch: "above",
  cany: "right",
  care: "left",
  // 右边紧挨着卡尔加里
  banf: "below",
  jasp: "right",
  yoho: "left",
  jotr: "right",
  // 右边是丹佛
  romo: "left",
  glac: "right",
  // 左边就是小图边框
  kefj: "below",
  // 阿拉斯加小图：科伯克谷右边紧挨着北极之门，卡特迈、克拉克湖右边是基奈峡湾
  kova: "left",
  katm: "left",
  lacl: "left",
  // 夏威夷小图：夏威夷火山在大岛东南角，右边就是小图边框
  havo: "left",
  hale: "left",
  // 风洞右边紧挨着恶地
  wica: "left",
  // 白沙、卡尔斯巴德洞窟挨着地图右下角，石化林右边是新墨西哥的州名
  whsa: "left",
  cave: "above",
  meve: "right",
  pefo: "left",
  // 大沙丘下面是梅萨维德的名字；甘尼森黑峡谷的英文名太长，挤的时候让给大沙丘
  grsa: "right",
  blca: "right",
  // 东部小图：大沼泽地、比斯坎的圆点几乎挨着，一个标上面一个标右边，干龟（左下）标左边；新河峡谷右边紧挨着仙纳度
  ever: "above",
  bisc: "right",
  drto: "left",
  neri: "left",
  // 阿卡迪亚在小图右上角，右边放不下
  acad: "left",
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
        return (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
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

/** compact：阿拉斯加小图很窄，字小一号、大屏才显示英文名，长名字在连字符后换行（兰格尔–圣伊莱亚斯） */
function Marker({ park, view, compact = false }: { park: MapPark; view: MapView; compact?: boolean }) {
  const point = view.parks[park.code];
  if (!point) return null;
  const [x, y] = point;
  const side = LABEL_SIDE[park.code] ?? "right";
  const lines = (text: string) =>
    (compact ? text.split(/(?<=–)/) : [text]).map((line) => (
      <span key={line} className="block">
        {line}
      </span>
    ));
  return (
    <Link
      href={park.href}
      data-marker
      data-weight={park.weight ?? 0}
      // 名字挤不下时会藏起来，链接本身也要有名字
      aria-label={`${park.nameZh} ${park.nameEn}`}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / view.width) * 100}%`, top: `${(y / view.height) * 100}%` }}
    >
      <span data-dot className="block size-3 rounded-full bg-ink ring-[5px] ring-ink/10 transition-all duration-500 group-hover:scale-125 group-hover:bg-clay-600 group-hover:ring-clay-600/20" />
      <span data-label data-side={side} className={LABEL_CLASS[side]}>
        <span
          data-zh
          className={`block font-serif leading-tight transition-colors duration-500 group-hover:text-clay-700 ${
            compact ? "text-xs sm:text-sm xl:text-lg" : "text-sm sm:text-lg"
          }`}
        >
          {lines(park.nameZh)}
        </span>
        <span data-en className={`eyebrow hidden text-[10px] text-mute ${compact ? "xl:block" : "sm:block"}`}>{lines(park.nameEn)}</span>
      </span>
    </Link>
  );
}

/**
 * 首页的线描地图：美国西部的公园（公园最密，单独一张大图）；下面一排是美国东部（左），阿拉斯加、夏威夷（右边上下叠着）。
 * 手机上东部、阿拉斯加、夏威夷依次排在大图下面
 */
export function WestMap({
  parks,
  cityNames,
  eastLabel,
  alaskaLabel,
  hawaiiLabel,
}: {
  /** 按热门程度排好：名字挤在一起时排在前面的先摆 */
  parks: MapPark[];
  /** 城市 id → 当前语言的名字 */
  cityNames: Record<string, string>;
  eastLabel: string;
  alaskaLabel: string;
  hawaiiLabel: string;
}) {
  const eastParks = parks.filter((park) => eastMap.parks[park.code]);
  const alaskaParks = parks.filter((park) => alaskaMap.parks[park.code]);
  const hawaiiParks = parks.filter((park) => hawaiiMap.parks[park.code]);
  return (
    <div className="relative">
      <MapDeclutter className="relative" style={{ aspectRatio: `${westMap.width} / ${westMap.height}` }}>
        <Shapes view={westMap} cityNames={cityNames} />
        {parks.map((park) => (
          <Marker key={park.code} park={park} view={westMap} />
        ))}
      </MapDeclutter>

      {/* 东部、阿拉斯加、夏威夷三张小图放在主图下面：东部在左，阿拉斯加、夏威夷在右边上下叠着，两边差不多高 */}
      <div className="mt-6 grid items-start gap-4 sm:grid-cols-[3fr_2fr]">
        <div className="w-full border border-line bg-paper p-4">
          <p className="eyebrow break-keep text-mute">{eastLabel}</p>
          <MapDeclutter className="relative mt-2" style={{ aspectRatio: `${eastMap.width} / ${eastMap.height}` }}>
            <Shapes view={eastMap} cityNames={cityNames} textScale={1.8} />
            {eastParks.map((park) => (
              <Marker key={park.code} park={park} view={eastMap} compact />
            ))}
          </MapDeclutter>
        </div>

        <div className="grid grid-cols-[3fr_2fr] items-start gap-4 sm:grid-cols-1">
          <div className="w-full border border-line bg-paper p-3 sm:p-4">
            <p className="eyebrow break-keep text-mute">{alaskaLabel}</p>
            <MapDeclutter className="relative mt-2" style={{ aspectRatio: `${alaskaMap.width} / ${alaskaMap.height}` }}>
              <Shapes view={alaskaMap} cityNames={cityNames} textScale={2} />
              {alaskaParks.map((park) => (
                <Marker key={park.code} park={park} view={alaskaMap} compact />
              ))}
            </MapDeclutter>
          </div>

          <div className="w-full border border-line bg-paper p-3">
            <p className="eyebrow break-keep text-mute">{hawaiiLabel}</p>
            <MapDeclutter className="relative mt-2" style={{ aspectRatio: `${hawaiiMap.width} / ${hawaiiMap.height}` }}>
              <Shapes view={hawaiiMap} cityNames={cityNames} textScale={2.5} />
              {hawaiiParks.map((park) => (
                <Marker key={park.code} park={park} view={hawaiiMap} compact />
              ))}
            </MapDeclutter>
          </div>
        </div>
      </div>
    </div>
  );
}
