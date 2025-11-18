"use client";
import React, { useState, useEffect } from 'react';
import { enableAnalytics, disableAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/lib/i18n/language-context';

export const PrivacyConsent: React.FC = () => {
  const { t } = useLanguage();
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('ciq-consent-analytics');
    if (stored === 'yes') { setGranted(true); enableAnalytics(); }
    else if (stored === 'no') { setGranted(false); disableAnalytics(); }
  }, []);

  const choose = (value: boolean) => {
    setGranted(value);
    window.localStorage.setItem('ciq-consent-analytics', value ? 'yes' : 'no');
    value ? enableAnalytics() : disableAnalytics();
  };

  if (granted !== null) return null; // already decided; simple for now

  return (
    <div className="fixed bottom-4 right-4 z-80 max-w-xs p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-pink-200 shadow-lg flex flex-col gap-3 text-[11px] leading-relaxed">
      <p className="font-semibold tracking-wider text-pink-600">{t.consent.title}</p>
      <p>{t.consent.description}</p>
      <div className="flex gap-2 mt-1">
        <button onClick={()=>choose(true)} className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow">{t.consent.allow}</button>
        <button onClick={()=>choose(false)} className="px-3 py-1 rounded-full text-xs bg-white border border-pink-200 text-pink-600">{t.consent.decline}</button>
      </div>
    </div>
  );
};
