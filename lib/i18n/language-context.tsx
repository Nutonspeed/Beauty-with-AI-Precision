"use client"

import { createContext, useContext, type ReactNode } from 'react'

interface LanguageContextType {
  language: 'en' | 'th' | 'zh'
  setLanguage: (lang: 'en' | 'th' | 'zh') => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  readonly children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Placeholder values - actual language handling is done by next-intl
  const value = { 
    language: 'th' as const, 
    setLanguage: () => {}, 
    t: (key: string) => key 
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return default values
    return { 
      language: 'th' as const, 
      setLanguage: () => {}, 
      t: (key: string) => key
    }
  }
  return context
}
