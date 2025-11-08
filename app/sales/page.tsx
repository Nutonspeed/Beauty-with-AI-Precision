'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Loader2 } from 'lucide-react'

export default function SalesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Redirect to sales dashboard
    router.push('/sales/dashboard')
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">กำลังเข้าสู่ Sales Dashboard...</p>
      </div>
    </div>
  )
}
