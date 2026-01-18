'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const HydrationContext = createContext<boolean>(false)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Also set a data attribute on body for Playwright to easily detect
    document.body.setAttribute('data-hydrated', 'true')
  }, [])

  return (
    <HydrationContext.Provider value={mounted}>
      {children}
    </HydrationContext.Provider>
  )
}

export const useHydrated = () => useContext(HydrationContext)
