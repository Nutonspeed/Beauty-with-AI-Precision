"use client"

import { ErrorDashboard } from '@/components/admin/error-dashboard';
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations } from "next-intl"

export default function ErrorDashboardPage() {
  const t = useTranslations()
  const lp = useLocalizePath()

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto flex-1">
          {/* Errors Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Link href={lp('/admin')}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <Badge variant="outline" className="px-4 py-1 rounded-full border-rose-500/30 text-rose-400 bg-rose-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-rose-500/10">
                  <AlertCircle className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  System Exception Monitor
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Fault<br />
                <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-orange-500 bg-clip-text text-transparent not-italic">Diagnostic</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Monitor real-time system anomalies and track delta exceptions across clinical nodes.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ErrorDashboard />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
