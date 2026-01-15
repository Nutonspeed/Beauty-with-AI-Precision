"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { 
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
        
        {/* Animated Aesthetic Nodes */}
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
              <span className="text-4xl font-black tracking-tighter text-white">CenterIQ <span className="text-pink-500 italic">AI</span></span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[0.9] italic">
                Aesthetic<br />Registration
              </h1>
              <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-lg tracking-wide">
                Initialize your professional profile and access high-precision diagnostic tools.
              </p>
            </div>
            
            {/* Aesthetic Security Nodes */}
            <div className="space-y-6 pt-10">
              {[
                { icon: Shield, text: "End-to-End Aesthetic Encryption", color: "text-blue-400" },
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
        {/* Aesthetic Back Navigation */}
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
            
            <div className="text-center space-y-8 p-12">
              <motion.div 
                className="mx-auto flex items-center justify-center w-20 h-20 rounded-[2rem] bg-pink-500/10 border border-pink-500/20 shadow-inner"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Shield className="w-8 h-8 text-pink-400" />
              </motion.div>
              
              <div className="space-y-4">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic">
                  {isThaiLocale ? 'ระบบจำกัดการเข้าถึง' : 'Access Restricted'}
                </CardTitle>
                <CardDescription className="text-sm text-slate-400 leading-relaxed">
                  {isThaiLocale 
                    ? 'CenterIQ เป็นระบบปิดที่เน้นความปลอดภัยสูงสุด ไม่มีการเปิดให้บุคคลทั่วไปสมัครสมาชิกเองได้' 
                    : 'CenterIQ is a secure professional platform. Public self-registration is disabled.'}
                </CardDescription>
              </div>

              <div className="space-y-6 text-left">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <UserCheck className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm italic">{isThaiLocale ? 'สำหรับลูกค้า' : 'For Customers'}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {isThaiLocale 
                          ? 'กรุณาติดต่อเจ้าหน้าที่คลินิกเพื่อรับบัญชีเข้าใช้งาน' 
                          : 'Please contact clinic staff to receive your secure credentials.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/5 w-full" />

                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm italic">{isThaiLocale ? 'สำหรับพนักงาน' : 'For Staff'}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {isThaiLocale 
                          ? 'ผู้จัดการสาขาหรือเจ้าของคลินิกจะเป็นผู้เพิ่มรายชื่อคุณเข้าระบบ' 
                          : 'Clinic owners or managers will authorize your node access.'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild
                  variant="premium"
                  size="xl"
                  className="w-full h-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.3em]" 
                >
                  <Link href={lp('/auth/login')}>
                    <ArrowLeft className="mr-3 h-4 w-4" />
                    {isThaiLocale ? 'กลับไปหน้าเข้าสู่ระบบ' : 'Back to Gateway'}
                  </Link>
                </Button>

                <div className="text-center">
                  <Link 
                    href={lp('/contact')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-pink-400 transition-colors"
                  >
                    {isThaiLocale ? 'ติดต่อฝ่ายเทคนิค' : 'Contact Core Infrastructure'}
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
