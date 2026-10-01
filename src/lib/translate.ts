import "server-only";
import { tidyChinese } from "../i18n/format";
import { selfUseScrape } from "./self-use";

// 英文翻成简体中文（NPS 公告用）：配了 DEEPL_API_KEY 用 DeepL（免费账号每月 50 万字符）；
// 没配就用 MyMemory（免费、不要 key，匿名每天约 5,000 字符，单次最多约 500 字节，会在括号里保留英文地名）；
// MyMemory 额度用完时，自用阶段再退到 Google 翻译的网页接口。同一段原文只翻一次，结果缓存 30 天。
const CACHE_SECONDS = 30 * 24 * 60 * 60;
const MYMEMORY_BYTES = 450;
const GOOGLE_CHARS = 1800;

export interface Translation {
  text: string;
  provider: "DeepL" | "MyMemory" | "Google";
}

const memo = new Map<string, Promise<Translation | null>>();
/** MyMemory 今天的额度用完了：到这个时间之前不再请求 */
let myMemoryPausedUntil = 0;

const byteLength = (text: string) => new TextEncoder().encode(text).length;

/** 按句子切成不超过 limit 的几段（MyMemory 按字节，Google 按字符） */
function chunks(text: string, limit: number, measure: (s: string) => number): string[] {
  const sentences = text.split(/(?<=[.!?;])\s+/);
  const out: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (measure(next) <= limit) {
      current = next;
      continue;
    }
    if (current) out.push(current);
    // 单句本身太长就硬切
    let rest = sentence;
    while (measure(rest) > limit) {
      let cut = Math.floor(rest.length * (limit / measure(rest)));
      const space = rest.lastIndexOf(" ", cut);
      if (space > cut / 2) cut = space;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut).trim();
    }
    current = rest;
  }
  if (current) out.push(current);
  return out;
}

async function deepl(text: string, key: string): Promise<string | null> {
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [text], source_lang: "EN", target_lang: "ZH" }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { translations?: { text: string }[] };
  return data.translations?.[0]?.text ?? null;
}

async function myMemory(text: string): Promise<string | null> {
  if (Date.now() < myMemoryPausedUntil) return null;
  const parts: string[] = [];
  for (const part of chunks(text, MYMEMORY_BYTES, byteLength)) {
    const url = `https://api.mymemory.translated.net/get?langpair=en|zh-CN&q=${encodeURIComponent(part)}`;
    const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      responseStatus: number | string;
      quotaFinished?: boolean;
      responseData?: { translatedText?: string };
    };
    if (data.quotaFinished || Number(data.responseStatus) === 429) {
      myMemoryPausedUntil = Date.now() + 6 * 60 * 60 * 1000;
      return null;
    }
    const translated = data.responseData?.translatedText;
    if (Number(data.responseStatus) !== 200 || !translated || /MYMEMORY WARNING/i.test(translated)) return null;
    parts.push(translated);
  }
  return parts.join(" ");
}

async function google(text: string): Promise<string | null> {
  const parts: string[] = [];
  for (const part of chunks(text, GOOGLE_CHARS, (s) => s.length)) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(part)}`;
    const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
    if (!res.ok) return null;
    const data = (await res.json()) as [[string, string][]];
    parts.push(data[0].map((segment) => segment[0]).join(""));
  }
  return parts.join("");
}

async function translateUncached(text: string): Promise<Translation | null> {
  const key = process.env.DEEPL_API_KEY;
  if (key) {
    const result = await deepl(text, key).catch(() => null);
    if (result) return { text: tidyChinese(result), provider: "DeepL" };
  }
  const memory = await myMemory(text).catch(() => null);
  if (memory) return { text: tidyChinese(memory), provider: "MyMemory" };
  if (selfUseScrape()) {
    const result = await google(text).catch(() => null);
    if (result) return { text: tidyChinese(result), provider: "Google" };
  }
  return null;
}

/** 翻不了（没有可用的翻译服务、额度用完）时返回 null，页面只显示原文 */
export function translateToChinese(text: string): Promise<Translation | null> {
  const source = text.trim();
  if (!source) return Promise.resolve(null);
  const hit = memo.get(source);
  if (hit) return hit;
  const value = translateUncached(source);
  memo.set(source, value);
  value.then((result) => {
    if (!result && memo.get(source) === value) memo.delete(source);
  });
  return value;
}
