"use client"

import { useAuth } from "@/lib/auth/context"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Home, ArrowLeft, Crown, Lock, Zap, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function UnauthorizedPage() {
  const t = useTranslations()
  const router = useRouter()
  const lp = useLocalizePath()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-950">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <div className="h-12 w-12 border-4 border-pink-500/20 border-t-pink-600 rounded-full animate-spin mx-auto relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Validating Authorization Node...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="w-full max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-rose-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
              
              <CardHeader className="text-center p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                <div className="space-y-8">
                  <motion.div 
                    className="mx-auto flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-700"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Lock className="w-10 h-10 text-rose-500" />
                  </motion.div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-rose-500/30 text-rose-600 bg-rose-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm italic">
                      Access_Protocol_Violation
                    </Badge>
                    <CardTitle className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      Unauthorized<br />
                      <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent not-italic">Restriction_Locked</span>
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-500 font-light max-w-md mx-auto italic leading-relaxed pt-4">
                      {t('unauthorized.description' as any) || 'Your security credentials do not authorize access to this infrastructure node.'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-12 lg:p-16 space-y-10">
                {user ? (
                  <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 space-y-6 shadow-inner">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Entity Identification</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Authorized Email</p>
                        <p className="text-lg font-black italic text-slate-950 truncate">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Security Role</p>
                        <Badge className="bg-slate-950 text-white border-none font-mono text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest italic">{user.role}</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive" className="bg-rose-50 border-rose-100 text-rose-600 rounded-[2rem] p-8 shadow-sm flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <ShieldAlert className="h-6 w-6 text-rose-600" />
                    </div>
                    <AlertDescription className="text-lg font-light italic leading-relaxed">
                      {t('unauthorized.notLoggedIn' as any) || 'No session node detected. Please authorize your credentials to proceed.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Technical Reasons interface */}
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 group/reasons">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-950 italic flex items-center gap-4">
                    <Zap className="h-4 w-4 text-pink-600" />
                    Protocol_Conflict_Diagnostics
                  </h3>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {[
                      t('unauthorized.reasons.item1'),
                      t('unauthorized.reasons.item2'),
                      t('unauthorized.reasons.item3'),
                      t('unauthorized.reasons.item4')
                    ].map((reason, i) => (
                      <li key={i} className="flex items-center gap-4 group/item">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover/item:bg-pink-500 group-hover/item:scale-150 transition-all duration-500 shadow-glow-pink/20" />
                        <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-950 transition-colors italic uppercase tracking-tight leading-tight">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Controls interface */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => router.back()}
                    className="h-18 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5 mr-4" />
                    {t('common.back')}
                  </Button>
                  <Button
                    asChild
                    size="xl"
                    className="h-18 px-10 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href={lp("/")}>
                      <Home className="h-5 w-5 mr-4" />
                      {t('nav.home')}
                    </Link>
                  </Button>
                </div>

                {/* Specialized CTAs interface */}
                <div className="space-y-6 pt-6">
                  {user && (user.role?.startsWith("customer") || user.tier === "free") && (
                    <Button
                      asChild
                      variant="premium"
                      className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105"
                    >
                      <Link href={lp("/pricing")}>
                        <Crown className="mr-4 h-6 w-6" />
                        {t('unauthorized.upgradeToUnlock' as any) || 'Authorize Infrastructure Upgrade'}
                      </Link>
                    </Button>
                  )}

                  {!user && (
                    <Button
                      asChild
                      variant="premium"
                      className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105"
                    >
                      <Link href={lp("/auth/login")}>
                        <Zap className="mr-4 h-6 w-6" />
                        {t('common.login' as any) || 'Initialize Security Sync'}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col p-12 pt-0 pb-16 text-center space-y-6">
                <div className="h-px w-24 bg-slate-100 mx-auto" />
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">{t('unauthorized.help.title' as any) || 'Require Access Synchronization?'}</p>
                  <p className="text-sm text-slate-400 font-light italic leading-relaxed">
                    {t('unauthorized.help.description' as any) || 'Contact your center administrator or our core technical node.'}
                  </p>
                  <Link 
                    href={lp("/contact")} 
                    className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] italic border-b border-pink-500/20 pb-1 hover:border-pink-500 transition-all inline-block mt-4"
                  >
                    Contact Integration Architects
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
