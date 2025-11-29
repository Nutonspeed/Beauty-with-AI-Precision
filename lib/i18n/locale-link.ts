"use client";
import { useMemo, useState, useEffect } from "react";
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
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  
  useEffect(() => {
    // Get locale from URL path on client side
    if (typeof window !== 'undefined') {
      const pathLocale = window.location.pathname.split('/')[1] as Locale;
      if ((locales as readonly string[]).includes(pathLocale)) {
        setLocale(pathLocale);
      }
    }
  }, []);
  
  // Memoize a small wrapper to avoid recreating on every render
  return useMemo(() => {
    return (path: string) => localizePath(path, locale);
  }, [locale]);
}
