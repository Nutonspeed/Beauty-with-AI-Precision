"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Users, Plus, Box } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function BranchesPage() {
  const t = useTranslations()

  // Mock branches data
  const branches = [
    { 
      id: 1, 
      name: "สาขาสยาม", 
      address: "991 สยามพารากอน ชั้น 4",
      phone: "02-123-4567",
      staff: 8,
      status: "active"
    },
    { 
      id: 2, 
      name: "สาขาทองหล่อ", 
      address: "55 ซอยทองหล่อ 13",
      phone: "02-234-5678",
      staff: 5,
      status: "active"
    },
    { 
      id: 3, 
      name: "สาขาเซ็นทรัลเวิลด์", 
      address: "เซ็นทรัลเวิลด์ ชั้น 3",
      phone: "02-345-6789",
      staff: 6,
      status: "active"
    },
  ]

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Branches Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Box className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Global Node Distribution
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Clinical<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Network</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                {t('branches.total')} {branches.length} {t('branches.totalBranches')} authorized in system.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border">
                <Plus className="mr-3 h-5 w-5" />
                {t('branches.addBranch')}
              </Button>
            </div>
          </div>

          {/* Branches Architecture Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group hover:bg-white/[0.03] transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 pb-6 border-b border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-pink-500/30 transition-all">
                          <Building2 className="h-8 w-8 text-slate-500 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{branch.name}</CardTitle>
                          <Badge className={cn(
                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                            branch.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.03] text-slate-600"
                          )}>
                            {branch.status === "active" ? t('branches.active') : t('branches.closed')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 group/info">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover/info:border-cyan-500/30 transition-all">
                          <MapPin className="h-4 w-4 text-slate-600 group-hover/info:text-cyan-400" />
                        </div>
                        <p className="text-sm text-slate-400 font-light italic leading-relaxed group-hover/info:text-white transition-colors">{branch.address}</p>
                      </div>
                      <div className="flex items-start gap-4 group/info">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover/info:border-pink-500/30 transition-all">
                          <Phone className="h-4 w-4 text-slate-600 group-hover/info:text-pink-400" />
                        </div>
                        <p className="text-sm font-bold text-white tracking-widest italic group-hover/info:text-pink-400 transition-colors">{branch.phone}</p>
                      </div>
                      <div className="flex items-start gap-4 group/info">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover/info:border-blue-500/30 transition-all">
                          <Users className="h-4 w-4 text-slate-600 group-hover/info:text-blue-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic group-hover/info:text-blue-400 transition-colors">
                          {branch.staff} {t('branches.staffMembers')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-6 flex gap-4 border-t border-white/5">
                      <Button variant="outline" size="xl" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 italic">
                        {t('branches.edit')}
                      </Button>
                      <Button variant="outline" size="xl" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 italic">
                        {t('branches.details')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
