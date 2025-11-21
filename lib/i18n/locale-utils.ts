/**
 * Locale Formatting Utilities
 * ฟังก์ชันสำหรับจัดรูปแบบวันที่, เวลา, ตัวเลข, และสกุลเงินตามภาษา
 */

export type Locale = 'th' | 'en' | 'zh';

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, locale: Locale = 'th'): string {
  const formatters = {
    th: new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    zh: new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  return formatters[locale].format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale: Locale = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatters = {
    th: new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    en: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    zh: new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  return formatters[locale].format(dateObj);
}

/**
 * Format short date (dd/mm/yyyy) based on locale
 */
export function formatShortDate(date: Date | string, locale: Locale = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatters = {
    th: new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    en: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    zh: new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  };

  return formatters[locale].format(dateObj);
}

/**
 * Format time based on locale
 */
export function formatTime(date: Date | string, locale: Locale = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatters = {
    th: new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    en: new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    zh: new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };

  return formatters[locale].format(dateObj);
}

/**
 * Format date and time based on locale
 */
export function formatDateTime(date: Date | string, locale: Locale = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatters = {
    th: new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    en: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    zh: new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };

  return formatters[locale].format(dateObj);
}

/**
 * Format number based on locale
 */
export function formatNumber(num: number, locale: Locale = 'th'): string {
  const formatters = {
    th: new Intl.NumberFormat('th-TH'),
    en: new Intl.NumberFormat('en-US'),
    zh: new Intl.NumberFormat('zh-CN'),
  };

  return formatters[locale].format(num);
}

/**
 * Format percentage based on locale
 */
export function formatPercentage(value: number, locale: Locale = 'th', decimals: number = 1): string {
  const formatters = {
    th: new Intl.NumberFormat('th-TH', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    zh: new Intl.NumberFormat('zh-CN', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  };

  return formatters[locale].format(value / 100);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string, locale: Locale = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const relativeTimeFormatters = {
    th: new Intl.RelativeTimeFormat('th-TH', { numeric: 'auto' }),
    en: new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' }),
    zh: new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' }),
  };

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      const value = Math.floor(diffInSeconds / seconds);
      return relativeTimeFormatters[locale].format(-value, unit);
    }
  }

  return relativeTimeFormatters[locale].format(0, 'second');
}

/**
 * Get locale-specific date format pattern
 */
export function getDatePattern(locale: Locale = 'th'): string {
  const patterns = {
    th: 'dd/mm/yyyy',
    en: 'mm/dd/yyyy',
    zh: 'yyyy-mm-dd',
  };

  return patterns[locale];
}

/**
 * Parse date from locale-specific format
 */
export function parseDate(dateString: string, locale: Locale = 'th'): Date | null {
  try {
    const parts = dateString.split(/[-/]/);
    
    if (parts.length !== 3) return null;

    let year: number, month: number, day: number;

    switch (locale) {
      case 'th':
        // dd/mm/yyyy
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        break;
      case 'en':
        // mm/dd/yyyy
        month = parseInt(parts[0], 10);
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        break;
      case 'zh':
        // yyyy-mm-dd
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
        break;
      default:
        return null;
    }

    const date = new Date(year, month - 1, day);
    
    // Validate date
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Get browser locale with fallback
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'th';

  const browserLang = navigator.language.split('-')[0];
  
  if (browserLang === 'th') return 'th';
  if (browserLang === 'zh') return 'zh';
  
  return 'en'; // Default to English for other languages
}
