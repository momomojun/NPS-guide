// 内容统一用简体撰写，繁体由 OpenCC 自动转换（台湾用语）。以后加 "ja"、"ko"。
export const locales = ["zh-Hans", "zh-Hant"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-Hans";

export const localeLabels: Record<Locale, string> = {
  "zh-Hans": "简体",
  "zh-Hant": "繁體",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
