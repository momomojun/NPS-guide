import { parks } from "@/data/parks";
import { hasLocale } from "@/i18n/config";
import type { AlertsResponse, ParkAlert } from "@/lib/alert-match";
import { translateAlerts } from "@/lib/alert-translate";
import { getAlerts } from "@/lib/nps";

const known = new Set(parks.map((park) => park.code));

/** 行程里几个公园的 NPS 实时公告，带中文翻译：GET ?parks=yell,grte&locale=zh-Hans（公告每个公园缓存 30 分钟，翻译按原文缓存） */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale") ?? "zh-Hans";
  const codes = [...new Set((params.get("parks") ?? "").split(",").filter((code) => known.has(code)))].slice(0, 8);
  const results = await Promise.allSettled(codes.map((code) => getAlerts(code)));
  const alerts: ParkAlert[] = [];
  for (const [i, result] of results.entries()) {
    if (result.status !== "fulfilled") continue;
    const translated = await translateAlerts(result.value, hasLocale(locale) ? locale : "zh-Hans", 600);
    result.value.forEach((alert, k) =>
      alerts.push({
        id: alert.id,
        park: codes[i],
        title: translated[k].title,
        category: alert.category,
        url: alert.url,
        description: translated[k].description,
        updated: alert.lastIndexedDate,
        titleZh: translated[k].titleZh,
        descriptionZh: translated[k].descriptionZh,
        translator: translated[k].translator,
      }),
    );
  }
  const body: AlertsResponse = { alerts, failed: codes.filter((_, i) => results[i].status === "rejected") };
  return Response.json(body);
}
