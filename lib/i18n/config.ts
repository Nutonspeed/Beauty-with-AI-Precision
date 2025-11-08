export const defaultLocale = "en"
export const locales = ["en", "th", "zh", "ja", "ko"] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
}
