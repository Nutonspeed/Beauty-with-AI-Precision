import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProgressDashboard } from "@/components/analysis/progress-dashboard"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Progress Tracking | AI Beauty Platform",
  description: "Track your skin health progress over time with advanced analytics",
}

async function getAnalysisHistory(userId: string) {
  const supabase = await createServerClient()

  const { data: analyses, error } = await supabase
    .from("skin_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to fetch analysis history:", error)
    return []
  }

  return analyses || []
}

export default async function ProgressPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const analyses = await getAnalysisHistory(user.id)

  // Default goals
  const goals = [
    { parameter: "spots", targetValue: 8, label: "Reduce Spots" },
    { parameter: "wrinkles", targetValue: 7, label: "Reduce Wrinkles" },
    { parameter: "texture", targetValue: 8, label: "Improve Texture" },
  ]

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-muted-foreground">
          Monitor your skin health journey with comprehensive analytics and insights
        </p>
      </div>

      <Suspense fallback={<ProgressDashboardSkeleton />}>
        <ProgressDashboard
          analyses={analyses.map((a) => ({
            ...a,
            timestamp: new Date(a.created_at),
            createdAt: new Date(a.created_at),
          }))}
          goals={goals}
        />
      </Suspense>
    </div>
  )
}

function ProgressDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  )
}
