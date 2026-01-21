'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/th')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium">Redirecting to Thai version...</p>
        <a href="/th" className="text-blue-600 underline text-sm">Click here if not redirected</a>
      </div>
    </div>
  )
}
