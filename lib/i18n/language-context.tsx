"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.en | typeof translations.th
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  readonly children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Default to English for Medical-grade SaaS feel
  const languageState = useState<Language>('en')
  const [language, setLanguageState] = languageState

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'th')) {
      setLanguageState(saved)
    }
  }, [setLanguageState])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }, [setLanguageState])

  const t = translations[language]

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t, setLanguage])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return default for prerender or when not in provider
    return { language: 'en' as Language, setLanguage: () => {}, t: translations.en }
  }
  return context
}
