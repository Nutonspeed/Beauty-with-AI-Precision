/**
 * Language Switcher Component
 * แสดงปุ่มเปลี่ยนภาษา (ไทย, English, 中文)
 */

'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname
    const segments = pathname.split('/');
    const currentLocale = segments[1];
    
    // Check if first segment is a locale
    const isLocaleInPath = ['th', 'en', 'zh'].includes(currentLocale);
    
    let newPathname;
    if (isLocaleInPath) {
      // Replace current locale with new locale
      segments[1] = newLocale;
      newPathname = segments.join('/');
    } else {
      // Add new locale to path
      newPathname = `/${newLocale}${pathname}`;
    }

    router.push(newPathname);
    router.refresh();
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="gap-2 cursor-pointer"
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {locale === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
