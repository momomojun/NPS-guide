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

/** 实时公告管多少天内出发的行程：公告说的是现在的情况，再远的不知道那时候开没开 */
export const LIVE_ALERT_DAYS = 14;

/** 只封一部分、只封夜间、只是延误或者限制的公告不算关闭 */
const PARTIAL = /\b(overnight|parts?|partial|partially|delays?|restrictions?|limited|nightly|lane)\b/i;

/**
 * 公告里明确说关了的景点：关闭类（Park Closure）公告、标题里写着 closed / closure，
 * 不是夜间封路、部分关闭、延误这类。要拿来直接不排景点，所以比 alertsForStop 严：
 * 标题里要有景点的全名，或者景点所在的片区（“Trail Ridge Road closed” 关的是 Trail Ridge 片区的所有景点）；
 * 只撞上一个词的不算（“Kīlauea 一侧关闭” 不等于 Kīlauea 观景台关闭）。景点 id → 那条公告
 */
export function closedByAlerts(stops: AlertTarget[], alerts: ParkAlert[]): Map<string, ParkAlert> {
  const closing = alerts.filter(
    (alert) => alert.category === "Park Closure" && /\bclos(ed|ure|ures|ing)\b/i.test(alert.title) && !PARTIAL.test(alert.title),
  );
  const result = new Map<string, ParkAlert>();
  for (const stop of stops) {
    const name = normalize(stop.nameEn).trim().replace(/^the /, "");
    const area = areaPhrase(stop.area);
    const alert = closing.find((candidate) => {
      if (candidate.park !== stop.park) return false;
      const title = normalize(candidate.title);
      return title.includes(` ${name} `) || (area.length >= 4 && !GENERIC.has(area) && title.includes(` ${area} `));
    });
    if (alert) result.set(stop.id, alert);
  }
  return result;
}
