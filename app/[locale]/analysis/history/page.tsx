import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalysisHistoryGallery } from "@/components/analysis/history-gallery"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export default async function AnalysisHistoryPage() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/analysis/history")
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <section className="container relative z-10 py-12 md:py-20 px-6 max-w-7xl mx-auto flex-1">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100 mb-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Clock className="mr-3 h-3.5 w-3.5" />
                Evolutionary Chronology
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Analysis<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">History</span>
              </h1>
              <div className="space-y-2">
                <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                  View your past skin analyses and track your progress over time.
                </p>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest italic">ดูประวัติการวิเคราะห์ผิวหน้าและติดตามความก้าวหน้า</p>
              </div>
            </motion.div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-600/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <AnalysisHistoryGallery />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
