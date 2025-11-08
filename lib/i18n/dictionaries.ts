import type { Locale } from "./config"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  th: () => import("./dictionaries/th.json").then((module) => module.default),
  zh: () => import("./dictionaries/zh.json").then((module) => module.default),
  ja: () => import("./dictionaries/ja.json").then((module) => module.default),
  ko: () => import("./dictionaries/ko.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
