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
      const name = formData.get('name') as string

      // Registration is restricted in this demo version
      console.log('Registration attempt:', { email, name })
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push(lp('/auth/login?message=Registration restricted'))
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white text-slate-950 selection:bg-pink-500/10 overflow-hidden relative">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      {/* Left Side - Cinematic Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-slate-100 bg-slate-50/30">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-600/5 to-transparent" />
        
        <div className="absolute inset-0">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px]" 
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-24 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white border border-slate-100 rounded-[2rem] shadow-premium">
                <Sparkles className="w-10 h-10 text-pink-600" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-slate-950">CenterIQ <span className="text-pink-600 italic">AI</span></span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                Aesthetic<br />Registration
              </h1>
              <p className="text-2xl text-slate-500 font-light leading-relaxed max-w-lg tracking-tight italic">
                Initialize your professional profile and access high-precision diagnostic tools.
              </p>
            </div>
            
            <div className="space-y-6 pt-10">
              {[
                { icon: Shield, text: "End-to-End Aesthetic Encryption", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: UserCheck, text: "Professional Credential Verification", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Lock, text: "PDPA Compliant Data Node", color: "text-pink-600", bg: "bg-pink-50" }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-6 group"
                >
                  <div className={cn("p-3 rounded-xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-700", f.bg)}>
                    <f.icon className={cn("w-5 h-5", f.color)} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Luxury Registration Infrastructure */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 relative z-10">
        <Link 
          href={lp("/auth/login")}
          className="fixed top-10 left-8 lg:left-auto lg:right-10 z-50 inline-flex items-center gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-pink-600 transition-all rounded-2xl bg-white/80 border border-slate-100 backdrop-blur-xl group shadow-sm italic"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Gateway</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            
            <div className="text-center space-y-10 p-12">
              <motion.div 
                className="mx-auto flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-pink-50 border border-pink-100 shadow-inner group-hover:scale-110 transition-all duration-700"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Shield className="w-10 h-10 text-pink-600" />
              </motion.div>
              
              <div className="space-y-4">
                <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                  {isThaiLocale ? 'ระบบจำกัดการเข้าถึง' : 'Access Restricted'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-relaxed">
                  {isThaiLocale 
                    ? 'CenterIQ เป็นระบบปิดที่เน้นความปลอดภัยสูงสุด ไม่มีการเปิดให้บุคคลทั่วไปสมัครสมาชิกเองได้' 
                    : 'CenterIQ is a secure professional platform. Public self-registration is disabled.'}
                </CardDescription>
              </div>

              <div className="space-y-8 text-left bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <div className="flex gap-6 group/item">
                  <div className="h-12 w-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-500">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-950 text-base italic uppercase tracking-tight">{isThaiLocale ? 'สำหรับลูกค้า' : 'For Customers'}</p>
                    <p className="text-xs text-slate-500 font-light italic leading-relaxed">
                      {isThaiLocale 
                        ? 'กรุณาติดต่อเจ้าหน้าที่คลินิกเพื่อรับบัญชีเข้าใช้งาน' 
                        : 'Please contact clinic staff to receive your secure credentials.'}
                    </p>
                  </div>
                </div>
                
                <div className="h-px bg-slate-200 w-full opacity-50" />

                <div className="flex gap-6 group/item">
                  <div className="h-12 w-12 rounded-xl bg-white border border-purple-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-500">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-950 text-base italic uppercase tracking-tight">{isThaiLocale ? 'สำหรับพนักงาน' : 'For Staff'}</p>
                    <p className="text-xs text-slate-500 font-light italic leading-relaxed">
                      {isThaiLocale 
                        ? 'ผู้จัดการสาขาหรือเจ้าของคลินิกจะเป็นผู้เพิ่มรายชื่อคุณเข้าระบบ' 
                        : 'Clinic owners or managers will authorize your node access.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Button 
                  asChild
                  variant="premium"
                  size="xl"
                  className="w-full h-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" 
                >
                  <Link href={lp('/auth/login')}>
                    <ArrowLeft className="mr-3 h-5 w-5" />
                    {isThaiLocale ? 'กลับไปหน้าเข้าสู่ระบบ' : 'Back to Gateway'}
                  </Link>
                </Button>

                <div className="text-center">
                  <Link 
                    href={lp('/contact')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-600 transition-colors italic border-b border-transparent hover:border-pink-500/20 pb-1"
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
