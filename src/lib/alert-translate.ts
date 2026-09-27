import "server-only";
import type { Locale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import type { NpsAlert } from "./nps";
import { stripHtml } from "./text";
import { translateToChinese } from "./translate";

export interface TranslatedAlert {
  title: string;
  description: string;
  /** 中文翻译，翻不了就是 undefined */
  titleZh?: string;
  descriptionZh?: string;
  /** 翻译服务：DeepL / MyMemory / Google */
  translator?: string;
}

/** 同时最多翻几条，别一下子把免费接口打满 */
const CONCURRENCY = 3;

async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await task(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** 公告的标题和正文翻成中文（繁体页面再用 OpenCC 转），原文也留着 */
export async function translateAlerts(alerts: NpsAlert[], locale: Locale, maxChars = 900): Promise<TranslatedAlert[]> {
  return mapLimit(alerts, CONCURRENCY, async (alert) => {
    const title = stripHtml(alert.title);
    const description = stripHtml(alert.description).slice(0, maxChars);
    const [titleZh, descriptionZh] = await Promise.all([translateToChinese(title), translateToChinese(description)]);
    const zh = (text: string | undefined) => (text && locale !== "zh-Hans" ? localize(text, locale) : text);
    return {
      title,
      description,
      titleZh: zh(titleZh?.text),
      descriptionZh: zh(descriptionZh?.text),
      translator: titleZh?.provider ?? descriptionZh?.provider,
    };
  });
}
