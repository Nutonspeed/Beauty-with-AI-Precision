"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Simulate verification
    const timer = setTimeout(() => {
      setIsVerifying(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>

            <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
            <p className="mb-6 text-muted-foreground">
              Thank you for upgrading to Premium. Your account has been activated.
            </p>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push("/customer/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/analysis")}>
                Start AI Analysis
              </Button>
            </div>

            {sessionId && (
              <p className="mt-6 text-xs text-muted-foreground">Session ID: {sessionId.substring(0, 20)}...</p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
