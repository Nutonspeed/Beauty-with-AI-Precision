"use client";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { locales, type Locale, defaultLocale } from "@/i18n/request";

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function isLocalized(path: string): boolean {
  const seg = normalizePath(path).split("/")[1];
  return (locales as readonly string[]).includes(seg);
}

export function localizePath(path: string, locale: Locale = defaultLocale): string {
  const normalized = normalizePath(path);
  if (isLocalized(normalized)) return normalized;
  return `/${locale}${normalized}`;
}

export function useLocalizePath() {
  let locale: Locale;
  try {
    locale = useLocale() as Locale;
  } catch {
    locale = defaultLocale;
  }
  // Memoize a small wrapper to avoid recreating on every render
  return useMemo(() => {
    return (path: string) => localizePath(path, locale);
  }, [locale]);
}
