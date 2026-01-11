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
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log("Contact form submitted:", formData)
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          {/* Precision Header Section */}
          <div className="text-center mb-24 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Sparkles className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {t('contact.hero.badge')}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight"
            >
              {t('contact.hero.title')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
            >
              {t('contact.hero.description')}
            </motion.p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* Contact Form - High-End Diagnostic Interface */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                  <CardHeader className="p-12 pb-4">
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">
                      {t('contact.form.title')}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm font-black uppercase tracking-[0.2em] mt-2">
                      {t('contact.form.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-12 pt-8">
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-8 sm:grid-cols-2">
                          <div className="space-y-3">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                              {t('contact.form.fullName')} *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder={t('contact.form.namePlaceholder')}
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                              {t('contact.form.email')} *
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder={t('contact.form.emailPlaceholder')}
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            />
                          </div>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">
                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                              {t('contact.form.phone')}
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder={t('contact.form.phonePlaceholder')}
                              value={formData.phone}
                              onChange={handleChange}
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="centerName" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                              {t('contact.form.centerName')}
                            </Label>
                            <Input
                              id="centerName"
                              name="centerName"
                              placeholder={t('contact.form.centerPlaceholder')}
                              value={formData.centerName}
                              onChange={handleChange}
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="interest" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                            {t('contact.form.packageInterest')}
                          </Label>
                          <div className="relative">
                            <select
                              id="interest"
                              name="interest"
                              aria-label="Package Interest"
                              value={formData.interest}
                              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                              className="flex h-14 w-full rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all"
                            >
                              <option value="free" className="bg-[#020617]">{t('contact.form.packages.free')}</option>
                              <option value="premium" className="bg-[#020617]">{t('contact.form.packages.premium')}</option>
                              <option value="enterprise" className="bg-[#020617]">{t('contact.form.packages.enterprise')}</option>
                              <option value="consultation" className="bg-[#020617]">{t('contact.form.packages.consultation')}</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                              <Send className="h-4 w-4 rotate-90" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                            {t('contact.form.message')} *
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder={t('contact.form.messagePlaceholder')}
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            required
                            className="rounded-[2rem] border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 py-4 resize-none"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          variant="premium" 
                          size="xl" 
                          className="w-full h-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              {t('contact.form.sending')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Send className="h-5 w-5" />
                              {t('contact.form.sendMessage')}
                            </div>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-20 text-center space-y-8"
                      >
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-2xl shadow-emerald-500/10">
                          <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-bold text-white tracking-tight">
                            {t('contact.form.success.title')}
                          </h3>
                          <p className="text-xl text-slate-400 font-light leading-relaxed max-w-md mx-auto">
                            {t('contact.form.success.description')}
                          </p>
                        </div>
                        <Button 
                          onClick={() => setSubmitted(false)} 
                          variant="outline"
                          className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105"
                        >
                          {t('contact.form.success.sendAnother')}
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Info Sidebar - Precision Nodes */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                      {t('contact.info.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-4 space-y-10">
                    {[
                      { icon: Mail, label: t('contact.info.email'), val: "contact@aesthetic-ai.io", href: "mailto:contact@aesthetic-ai.io", color: "text-pink-400" },
                      { icon: Phone, label: t('contact.info.phone'), val: "+66 (0) 2-000-0000", href: "tel:+6620000000", color: "text-cyan-400" },
                      { icon: MapPin, label: t('contact.info.address'), val: t('contact.info.addressText'), color: "text-purple-400" },
                      { icon: Clock, label: t('contact.info.businessHours'), val: t('contact.info.hoursText'), color: "text-emerald-400" }
                    ].map((info, i) => (
                      <div key={i} className="flex items-start gap-6 group cursor-default">
                        <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500 shadow-inner">
                          <info.icon className={cn("h-5 w-5", info.color)} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{info.label}</div>
                          {info.href ? (
                            <a href={info.href} className="text-white hover:text-pink-400 transition-colors font-medium tracking-tight break-all">
                              {info.val}
                            </a>
                          ) : (
                            <p className="text-slate-300 font-light leading-relaxed tracking-tight">
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
                <Card className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                    <Building2 className="w-32 h-32 text-pink-500" />
                  </div>
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                      {t('contact.enterprise.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-4 space-y-6">
                    {[
                      { icon: Users, text: t('contact.enterprise.discount') },
                      { icon: CheckCircle2, text: t('contact.enterprise.customization') },
                      { icon: Sparkles, text: t('contact.enterprise.support') }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20 group-hover/item:bg-pink-600 group-hover/item:text-white transition-all">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 group-hover/item:text-slate-200 transition-colors">
                          {item.text}
                        </p>
                      </div>
                    ))}
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
