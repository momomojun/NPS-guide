// NPS 实时公告（/api/alerts）按名字对到行程里的景点：公告是英文，按景点英文名和片区名找

export interface ParkAlert {
  id: string;
  park: string;
  title: string;
  /** "Park Closure" | "Danger" | "Caution" | "Information" */
  category: string;
  url: string;
  description: string;
  /** 形如 "2026-09-22 00:00:00.0" */
  updated: string;
  /** 中文翻译（机器翻译），翻不了就没有 */
  titleZh?: string;
  descriptionZh?: string;
  translator?: string;
}

export interface AlertsResponse {
  alerts: ParkAlert[];
  /** 没查到的公园 */
  failed: string[];
}

/** 景点名里常见的通用词，单独出现不算提到了这个景点 */
const GENERIC = new Set(
  (
    "trail trails falls point points overlook overlooks valley canyon canyons lake lakes road roads river creek peak peaks " +
    "mountain mountains mount national park parks area areas loop visitor center grove meadow meadows basin geyser geysers " +
    "spring springs beach beaches view views vista drive scenic upper lower north south east west rim dome rock rocks arch " +
    "arches island islands glacier glaciers ridge pass campground lodge village junction bridge highway route trailhead " +
    "parking museum garden forest trees great grand little black white yellow golden crystal natural tunnel cove harbor " +
    "sand dunes flats hills butte mesa gorge crater cave caves pools terrace terraces observation station church ranch " +
    "historic district visitors entrance summit plateau shore wilderness"
  ).split(" "),
);

const normalize = (text: string) => ` ${text.toLowerCase().replace(/[^a-z]+/g, " ").trim()} `;

/** 景点英文名里够特别、能单独认出这个景点的词 */
function distinctiveWords(name: string): string[] {
  return normalize(name)
    .trim()
    .split(" ")
    .filter((word) => word.length >= 5 && !GENERIC.has(word));
}

/** 片区 key（比如 "glacier-point"、"tioga"）当成地名 */
const areaPhrase = (area: string) => area.replace(/-/g, " ");

export interface AlertTarget {
  id: string;
  park: string;
  nameEn: string;
  area: string;
}

/**
 * 和这个景点有关的公告：提到了景点全名或特别的词；关闭、危险类的公告提到所在片区也算
 * （比如 “Tioga Road closed” 影响 Tioga 片区的所有景点）。
 * 关闭类公告只看标题：正文里常写“可以改去 xx”（比如 Death Canyon 步道口关闭，建议从 LSR Preserve 出发），
 * 按正文对会把替代的地方也标成关闭
 */
export function alertsForStop(stop: AlertTarget, alerts: ParkAlert[]): ParkAlert[] {
  const name = normalize(stop.nameEn).trim().replace(/^the /, "");
  const words = distinctiveWords(stop.nameEn);
  const area = areaPhrase(stop.area);
  return alerts.filter((alert) => {
    if (alert.park !== stop.park) return false;
    const closure = alert.category === "Park Closure";
    const title = normalize(alert.title);
    const text = closure ? title : normalize(`${alert.title} ${alert.description}`);
    if (text.includes(` ${name} `)) return true;
    if (words.some((word) => text.includes(` ${word} `))) return true;
    const serious = closure || alert.category === "Danger";
    return serious && area.length >= 4 && !GENERIC.has(area) && title.includes(` ${area} `);
  });
}
