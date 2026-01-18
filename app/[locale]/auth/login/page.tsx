'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { getDefaultLandingPage } from "@/lib/auth/role-config"
import { normalizeRole } from "@/lib/auth/role-normalize"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const showDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { signIn, user } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-redirect if already logged in (use canonical normalization + default landing)
  useEffect(() => {
    console.log('[LoginPage] useEffect trigger:', { hasUser: !!user, loading, userRole: user?.role })
    if (user && !loading) {
      console.log('[LoginPage] 🏃 User detected, initiating redirect...', user.role)
      try {
        const normalized = normalizeRole(user.role as any)
        const redirectPath = getDefaultLandingPage(normalized as any)
        const localizedPath = lp(redirectPath)
        
        console.log('[LoginPage] Target redirect path:', localizedPath)
        // Use router.replace to avoid back-button loop
        router.replace(localizedPath)
      } catch (e) {
        console.warn('[LoginPage] Failed to resolve landing page, fallback to /dashboard', e)
        router.replace(lp('/dashboard'))
      }
    }
  }, [user, loading, lp, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!email || !password) {
      setError(isThaiLocale ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please enter email and password')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError(isThaiLocale ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError(isThaiLocale ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      console.log(`[LoginPage] 🔐 handleLogin triggered for: ${email}`)
      
      const result = await signIn(email, password)
      
      console.log(`[LoginPage] Sign in call result:`, { hasError: !!result.error, role: result.role })
      
      if (result.error) {
        console.error('[LoginPage] ❌ Login error:', result.error)
        if (result.error instanceof Error && result.error.message.includes('Invalid login credentials')) {
          setError(isThaiLocale ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid email or password')
        } else if (result.error instanceof Error && result.error.message.includes('Email not confirmed')) {
          setError(isThaiLocale ? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' : 'Please confirm your email before logging in')
        } else {
          setError(result.error instanceof Error ? result.error.message : 'Unknown error')
        }
        setLoading(false)
        return
      }

      console.log('[LoginPage] ✅ Login successful! Role:', result.role)
      setLoading(false)
      
      // The useEffect will handle the redirect once the user state is updated in AuthContext
      // This prevents double-redirection issues.
    } catch (err) {
      setError(isThaiLocale ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.')
      console.error('[LoginPage] ❌ Unexpected error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200 selection:bg-pink-500/30 overflow-hidden relative" data-hydrated={mounted}>
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
                Advanced<br />Skin Synthesis
              </h1>
              <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-lg tracking-wide">
                Experience the next generation of aesthetic analysis driven by precision intelligence.
              </p>
            </div>
            
            {/* Aesthetic Features Nodes */}
            <div className="space-y-6 pt-10">
              {[
                { icon: Zap, text: "AI-Driven 8D Analysis", color: "text-blue-400" },
                { icon: Shield, text: "Enterprise-Grade PDPA Security", color: "text-emerald-400" },
                { icon: Sparkles, text: "Real-time Aesthetic AR", color: "text-pink-400" }
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

      {/* Right Side - Luxury Login Infrastructure */}
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
            
            <CardHeader className="space-y-8 p-12 pb-6">
              {/* Mobile Infrastructure Logo */}
              <div className="flex items-center justify-center lg:hidden">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    CenterIQ
                  </span>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <motion.div 
                  className="mx-auto flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-700"
                  whileHover={{ rotate: 5 }}
                >
                  <LogIn className="w-8 h-8 text-pink-400" />
                </motion.div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic">
                    {isThaiLocale ? 'ยินดีต้อนรับกลับ' : 'Aesthetic Access'}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {isThaiLocale ? 'เข้าสู่ระบบเพื่อใช้งานระบบจำลอง' : 'Authorize diagnostic credentials'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-8 p-12 pt-6">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400 rounded-2xl">
                      <AlertDescription className="text-xs font-bold uppercase tracking-widest">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                      {isThaiLocale ? 'อีเมล' : 'System ID / Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="aesthetic@access.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                      className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        {isThaiLocale ? 'รหัสผ่าน' : 'Access Key'}
                      </Label>
                      <Link 
                        href={lp("/auth/forgot-password")} 
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-500/60 hover:text-pink-400 transition-colors"
                        suppressHydrationWarning
                      >
                        {isThaiLocale ? 'ลืมรหัสผ่าน?' : 'Recover Key'}
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                        required
                        className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="premium"
                  size="xl"
                  className="w-full h-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3" id="login-loading-indicator">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isThaiLocale ? 'กำลังประมวลผล...' : 'Authenticating...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3" id="login-button-content">
                      <LogIn className="h-5 w-5" />
                      {isThaiLocale ? 'เข้าสู่ระบบ' : 'Initialize Session'}
                    </div>
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col space-y-10 p-12 pt-0 pb-16">
                <div className="text-[10px] text-center text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto">
                  {isThaiLocale ? 'ระบบปิดสำหรับผู้ได้รับเชิญเท่านั้น' : 'Aesthetic gateway restricted to authorized personnel'}
                  <div className="mt-3">
                    <a 
                      href="mailto:admin@centeriq.ai" 
                      className="text-pink-500/60 hover:text-pink-400 transition-colors border-b border-pink-500/20 pb-0.5"
                    >
                      {isThaiLocale ? 'ขอสิทธิ์เข้าใช้งาน' : 'Request Credentials'}
                    </a>
                  </div>
                </div>

                {/* Demo Interface Infrastructure */}
                {showDemo && (
                  <div className="w-full space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                      </div>
                      <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em]">
                        <span className="bg-[#020617] px-4 text-slate-700">Debug Terminals</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Admin', icon: '🔧', email: 'admin@ai367bar.com', color: 'text-orange-400' },
                        { label: 'Owner', icon: '🏥', email: 'clinic-owner@example.com', color: 'text-blue-400' },
                        { label: 'Sales', icon: '💼', email: 'sales@example.com', color: 'text-emerald-400' },
                        { label: 'Client', icon: '👤', email: 'customer@example.com', color: 'text-purple-400' }
                      ].map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            console.log(`[LoginPage] 🧪 Demo button clicked for: ${d.label}`)
                            setEmail(d.email)
                            setPassword('Admin123!')
                          }}
                          className="flex flex-col items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all group/demo text-left"
                        >
                          <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1", d.color)}>
                            {d.icon} {d.label}
                          </div>
                          <div className="text-[8px] text-slate-600 truncate w-full font-mono group-hover/demo:text-slate-400 transition-colors">
                            {d.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
