"use client"

import type React from "react"
import { useState } from "react"

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LanguageProvider } from "@/lib/i18n/language-context"
import { AuthProvider as OldAuthProvider } from "@/lib/auth/context"
import { AuthProvider as NewAuthProvider } from "@/hooks/useAuth"

interface ProvidersProps {
  readonly children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance once per component lifecycle
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ai-beauty-theme">
        {/* TODO: Migrate from OldAuthProvider to NewAuthProvider */}
        <OldAuthProvider>
          <NewAuthProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </NewAuthProvider>
        </OldAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
