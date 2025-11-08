"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
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
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = translations[language]

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
