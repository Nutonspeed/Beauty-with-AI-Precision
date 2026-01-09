"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  UserPlus, 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  UserCheck, 
  Lock 
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const router = useRouter()
  const lp = useLocalizePath()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const name = formData.get('name') as string

      // TODO: Implement registration logic
      console.log('Registration attempt:', { email, name })
      
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push('/auth/login?message=Registration successful')
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200 selection:bg-pink-500/30 overflow-hidden relative">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      </div>

      {/* Left Side - Cinematic Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-purple-600/10 to-transparent" />
        
        {/* Animated Clinical Nodes */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[120px]" 
          />
        </div>
        
        {/* Content Infrastructure */}
        <div className="relative z-10 flex flex-col justify-center p-24 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl shadow-pink-500/10">
                <Sparkles className="w-10 h-10 text-pink-400" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white">ClinicIQ <span className="text-pink-500 italic">AI</span></span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[0.9] italic">
                Clinical<br />Registration
              </h1>
              <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-lg tracking-wide">
                Initialize your professional profile and access high-precision diagnostic tools.
              </p>
            </div>
            
            {/* Clinical Security Nodes */}
            <div className="space-y-6 pt-10">
              {[
                { icon: Shield, text: "End-to-End Clinical Encryption", color: "text-blue-400" },
                { icon: UserCheck, text: "Professional Credential Verification", color: "text-emerald-400" },
                { icon: Lock, text: "PDPA Compliant Data Node", color: "text-pink-400" }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-6 group"
                >
                  <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl shadow-inner group-hover:scale-110 group-hover:border-pink-500/30 transition-all">
                    <f.icon className={cn("w-5 h-5", f.color)} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Luxury Registration Infrastructure */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 relative z-10">
        {/* Clinical Back Navigation */}
        <Link 
          href={lp("/")}
          className="fixed top-10 left-8 z-50 inline-flex items-center gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-pink-400 transition-all rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl group"
          suppressHydrationWarning
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to System</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <CardHeader className="space-y-8 p-12 pb-6">
              {/* Mobile Infrastructure Logo */}
              <div className="flex items-center justify-center lg:hidden">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    ClinicIQ
                  </span>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <motion.div 
                  className="mx-auto flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-700"
                  whileHover={{ rotate: -5 }}
                >
                  <UserPlus className="w-8 h-8 text-pink-400" />
                </motion.div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic">
                    {isThaiLocale ? 'สร้างบัญชีใหม่' : 'Initialize Profile'}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {isThaiLocale ? 'กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ' : 'Establish unique diagnostic node'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={onSubmit}>
              <CardContent className="space-y-6 p-12 pt-6">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400 rounded-2xl">
                      <AlertDescription className="text-xs font-bold uppercase tracking-widest">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                      {isThaiLocale ? 'ชื่อ-นามสกุล' : 'Full Name'}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Dr. Clinical Precise"
                      required
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                      {isThaiLocale ? 'อีเมล' : 'System ID / Email'}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="node@clinical.ai"
                      required
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                      {isThaiLocale ? 'รหัสผ่าน' : 'Access Key'}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="premium"
                  size="xl"
                  className="w-full h-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isThaiLocale ? 'กำลังประมวลผล...' : 'Synchronizing...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5" />
                      {isThaiLocale ? 'สร้างบัญชี' : 'Initialize Account'}
                    </div>
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col space-y-10 p-12 pt-0 pb-16">
                <div className="text-[10px] text-center text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto">
                  {isThaiLocale ? 'มีบัญชีอยู่แล้ว?' : 'Existing node credentials?'}
                  <div className="mt-3">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-pink-500/60 hover:text-pink-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em]" 
                      onClick={() => router.push(lp('/auth/login'))}
                    >
                      {isThaiLocale ? 'เข้าสู่ระบบที่นี่' : 'Access Gateway'}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
