"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Users, Plus, Box, ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export default function BranchesPage() {
  const t = useTranslations()
  const router = useRouter()
  const lp = useLocalizePath()

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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Branches Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => router.push(lp('/admin'))}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Box className="mr-3 h-3.5 w-3.5" />
                  Global Center Distribution
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Aesthetic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Infrastructure</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('branches.total')} {branches.length} {t('branches.totalBranches')} authorized in center network.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
                <Plus className="mr-4 h-6 w-6" />
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
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10 h-full flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                          <Building2 className="h-8 w-8 text-slate-300 group-hover:text-pink-600 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase group-hover:text-pink-600 transition-colors leading-none">{branch.name}</CardTitle>
                          <Badge className={cn(
                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic",
                            branch.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                          )}>
                            {branch.status === "active" ? 'NOMINAL' : t('branches.closed')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 flex-1 flex flex-col justify-between space-y-10 bg-slate-50/30">
                    <div className="space-y-8">
                      <div className="flex items-start gap-5 group/info">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover/info:scale-110 transition-transform duration-500">
                          <MapPin className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-500 font-light italic leading-relaxed group-hover/info:text-slate-950 transition-colors">{branch.address}</p>
                      </div>
                      <div className="flex items-start gap-5 group/info">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover/info:scale-110 transition-transform duration-500">
                          <Phone className="h-5 w-5 text-pink-600" />
                        </div>
                        <p className="text-lg font-black text-slate-950 tracking-widest italic group-hover/info:text-pink-600 transition-colors">{branch.phone}</p>
                      </div>
                      <div className="flex items-start gap-5 group/info">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover/info:scale-110 transition-transform duration-500">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/info:text-purple-600 transition-colors">
                          {branch.staff} {t('branches.staffMembers')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-8 flex gap-4 border-t border-slate-100 relative z-10">
                      <Button variant="outline" size="xl" className="flex-1 h-14 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50 transition-all">
                        {t('branches.edit')}
                      </Button>
                      <Button variant="outline" size="xl" className="flex-1 h-14 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50 transition-all">
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
