"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  Building2,
  Users,
  Sparkles
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ContactPage() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    centerName: "",
    message: "",
    interest: "premium"
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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

        <div className="container relative z-10 py-20 md:py-32 mx-auto px-6 max-w-7xl flex-1 space-y-24">
          {/* Header Section */}
          <div className="text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                {t('contact.hero.badge' as any) || 'Global Connection Node'}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
            >
              {t('contact.hero.title' as any) || 'Connect with'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">
                Intelligence
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
            >
              {t('contact.hero.description' as any) || 'Initialize a secure communication link with our specialized integration architects.'}
            </motion.p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Form interface */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50">
                    <div className="space-y-4">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        {t('contact.form.title' as any) || 'Ingest Query'}
                      </CardTitle>
                      <CardDescription className="text-pink-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        {t('contact.form.description' as any) || 'Author a manual communication sequence'}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 pt-12 bg-slate-50/30">
                    <AnimatePresence mode="wait">
                      {!submitted ? (
                        <motion.form 
                          key="form"
                          onSubmit={handleSubmit} 
                          className="space-y-10"
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <div className="grid gap-10 sm:grid-cols-2">
                            <div className="space-y-4">
                              <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                                {t('contact.form.fullName' as any) || 'Entity Name'} *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Enter full identity..."
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                              />
                            </div>
                            <div className="space-y-4">
                              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                                {t('contact.form.email' as any) || 'Communication Node'} *
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="node@access.ai"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="grid gap-10 sm:grid-cols-2">
                            <div className="space-y-4">
                              <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                                {t('contact.form.phone' as any) || 'Contact Frequency'}
                              </Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+66 XX XXX XXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                              />
                            </div>
                            <div className="space-y-4">
                              <Label htmlFor="centerName" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                                {t('contact.form.centerName' as any) || 'Organization Node'}
                              </Label>
                              <Input
                                id="centerName"
                                name="centerName"
                                placeholder="Center node identity..."
                                value={formData.centerName}
                                onChange={handleChange}
                                className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="interest" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                              {t('contact.form.packageInterest' as any) || 'Sequence Interest'}
                            </Label>
                            <div className="relative">
                              <select
                                id="interest"
                                name="interest"
                                value={formData.interest}
                                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                className="flex h-16 w-full rounded-2xl border border-slate-100 bg-white px-8 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all shadow-inner italic font-bold uppercase tracking-widest"
                              >
                                <option value="free">STARTER NODE</option>
                                <option value="premium">PROFESSIONAL SEQUENCE</option>
                                <option value="enterprise">ENTERPRISE PROTOCOL</option>
                                <option value="consultation">EXPERT CONSULTATION</option>
                              </select>
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-pink-500">
                                <Send className="h-5 w-5 rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="message" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">
                              {t('contact.form.message' as any) || 'Detailed Query Payload'} *
                            </Label>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Author query narrative..."
                              value={formData.message}
                              onChange={handleChange}
                              rows={6}
                              required
                              className="rounded-[2.5rem] border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all p-8 resize-none italic font-light text-lg shadow-inner leading-relaxed"
                            />
                          </div>

                          <Button 
                            type="submit" 
                            variant="premium" 
                            size="xl" 
                            className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" 
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex items-center gap-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Transmitting...
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <Send className="h-6 w-6" />
                                Authorize Transmission
                              </div>
                            )}
                          </Button>
                        </motion.form>
                      ) : (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-24 text-center space-y-10 bg-white rounded-[3rem] border border-slate-100 shadow-inner"
                        >
                          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-2xl shadow-emerald-500/10 animate-glow-pulse">
                            <CheckCircle2 className="h-14 w-14" />
                          </div>
                          <div className="space-y-6">
                            <h3 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                              Sequence Received
                            </h3>
                            <p className="text-2xl text-slate-500 font-light leading-relaxed max-w-md mx-auto italic">
                              Your query has been synchronized. A specialized architect will initialize contact shortly.
                            </p>
                          </div>
                          <Button 
                            onClick={() => setSubmitted(false)} 
                            variant="outline"
                            className="h-18 px-14 rounded-2xl border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all hover:scale-105 italic shadow-premium"
                          >
                            New Sequence
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar interface */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                      Direct Telemetry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
                    {[
                      { icon: Mail, label: 'Secure Email', val: "contact@aesthetic-ai.io", href: "mailto:contact@aesthetic-ai.io", color: "text-pink-600" },
                      { icon: Phone, label: 'Frequency Node', val: "+66 (0) 2-000-0000", href: "tel:+6620000000", color: "text-blue-600" },
                      { icon: MapPin, label: 'Deployment Hub', val: "123 Medical Plaza, Bangkok", color: "text-purple-600" },
                      { icon: Clock, label: 'Sync Windows', val: "MON-FRI 09:00 - 18:00", color: "text-emerald-600" }
                    ].map((info, i) => (
                      <div key={i} className="flex items-start gap-6 group/info cursor-default">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover/info:scale-110 transition-all duration-700 shadow-sm group-hover/info:border-pink-500/20">
                          <info.icon className={cn("h-6 w-6 transition-colors duration-500 shadow-inner rounded-lg p-1", info.color)} />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover/info:text-slate-900 transition-colors italic leading-none">{info.label}</div>
                          {info.href ? (
                            <a href={info.href} className="text-slate-900 hover:text-pink-600 transition-colors font-black tracking-tighter italic text-lg leading-tight uppercase block">
                              {info.val}
                            </a>
                          ) : (
                            <p className="text-slate-500 font-light leading-relaxed tracking-tight italic text-lg">
                              {info.val}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="border-pink-100 bg-pink-50/10 shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-fit">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                    <Building2 className="w-48 h-48 text-pink-600" />
                  </div>
                  <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-100/50">
                    <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-5 leading-none">
                      <div className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
                      Enterprise Deployment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 space-y-10 relative z-10 bg-white/50 backdrop-blur-sm">
                    <p className="text-lg text-slate-500 italic font-light leading-relaxed">
                      Scale your aesthetic infrastructure with enterprise-grade synchronization and dedicated support nodes.
                    </p>
                    <div className="space-y-6">
                      {[
                        { icon: Users, text: 'Tiered License Scaling' },
                        { icon: Sparkles, text: 'Custom AI Calibration' },
                        { icon: CheckCircle2, text: 'Priority Node Support' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-5 group/item">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-pink-500 group-hover/item:text-white transition-all duration-500">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <p className="text-[11px] font-black text-slate-400 group-hover:text-slate-950 transition-colors italic uppercase tracking-widest leading-none">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full h-18 rounded-2xl bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-500 shadow-2xl hover:shadow-pink-500/20 border-none" asChild>
                      <Link href={lp('/auth/login')}>Access Control Node</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
