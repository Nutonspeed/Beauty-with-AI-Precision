export const locales = ['en', 'th', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'th';
