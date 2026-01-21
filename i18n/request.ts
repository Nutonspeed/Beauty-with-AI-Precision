import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, Locale } from './locales';

// Import messages statically to avoid dynamic import hangs on Vercel
import en from './messages/en.json';
import th from './messages/th.json';
import zh from './messages/zh.json';

const messagesMap: Record<Locale, any> = {
  en,
  th,
  zh
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const locale = (await requestLocale) || defaultLocale;

  console.log(`[i18n] Setting up config for locale: ${locale}`);

  // Ensure that a valid locale is used
  const finalLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  try {
    const messages = messagesMap[finalLocale] || messagesMap[defaultLocale];
    console.log(`[i18n] Successfully resolved messages for ${finalLocale}`);
    
    return {
      locale: finalLocale,
      messages,
      onError: (error) => {
        if (error.code === 'MISSING_MESSAGE') {
          console.warn(`[i18n] Missing message key: ${error.message}`);
          return;
        }
        console.error(`[i18n] Error during message retrieval:`, error);
      },
      getMessageFallback: ({ key, namespace }) => {
        return namespace ? `${namespace}.${key}` : key;
      },
    };
  } catch (error) {
    console.error(`[i18n] FAILED to resolve messages for ${finalLocale}:`, error);
    // Fallback to empty messages to prevent entire app crash
    return {
      locale: defaultLocale,
      messages: {},
      getMessageFallback: ({ key, namespace }) => namespace ? `${namespace}.${key}` : key,
    };
  }
});
