"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { defaultLocale } from "@/i18n/request"

export default function RootRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to default locale version
    router.replace(`/${defaultLocale}`)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
