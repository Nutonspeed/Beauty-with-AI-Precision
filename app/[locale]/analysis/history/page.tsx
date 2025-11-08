import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalysisHistoryGallery } from "@/components/analysis/history-gallery"

export default async function AnalysisHistoryPage() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/analysis/history")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Analysis History
                <br />
                <span className="text-primary">ประวัติการวิเคราะห์</span>
              </h1>
              <p className="text-balance text-muted-foreground leading-relaxed">
                View your past skin analyses and track your progress over time
                <br />
                ดูประวัติการวิเคราะห์ผิวหน้าและติดตามความก้าวหน้า
              </p>
            </div>

            <AnalysisHistoryGallery />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
