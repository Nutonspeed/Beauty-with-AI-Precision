"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Edit, ShieldCheck, Zap, ArrowRight, Save, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  user: {
    id: string
    email?: string
    created_at: string
  }
  profile: {
    full_name?: string
    phone?: string
    role?: string
  } | null
}

export function ProfileCard({ user, profile }: ProfileCardProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [isEditing, setIsEditing] = useState(false)

  // Use getInitials in the UI or remove it. Let's add it to the profile avatar section if applicable.
  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email?.slice(0, 2).toUpperCase() || 'ID';

  return (
    <div className="grid gap-10 md:grid-cols-2 animate-in fade-in duration-700">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700 flex items-center justify-center">
                  <span className="text-xl font-black italic text-pink-600 group-hover:text-white">{initials}</span>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('customerProfile.personalInfo' as any) || 'Identity_Node'}</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Core biometric credentials</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all shrink-0"
              >
                {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {isEditing ? (t('common.cancel' as any) || 'ABORT') : (t('common.edit' as any) || 'REFINE')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10 lg:p-12 space-y-10 bg-white">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('customerProfile.fullName' as any) || 'ENTITY_NAME'}</Label>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner group/field">
                  <User className={cn("h-6 w-6 transition-colors", isEditing ? "text-pink-600" : "text-slate-300")} />
                  {isEditing ? (
                    <Input id="name" defaultValue={profile?.full_name || ""} placeholder={t('customerProfile.enterName' as any) || "NODE_NAME"} className="h-12 border-none bg-transparent focus-visible:ring-0 font-bold italic text-slate-950 p-0" />
                  ) : (
                    <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight">{profile?.full_name || t('customerProfile.notSet' as any) || 'UNDEFINED'}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('common.email' as any) || 'AUTHORIZED_UPLINK'}</Label>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner opacity-60">
                  <Mail className="h-6 w-6 text-slate-300" />
                  <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight">{user.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('common.phone' as any) || 'FREQUENCY_SYNC'}</Label>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner group/field">
                  <Phone className={cn("h-6 w-6 transition-colors", isEditing ? "text-pink-600" : "text-slate-300")} />
                  {isEditing ? (
                    <Input id="phone" defaultValue={profile?.phone || ""} placeholder="08x-xxx-xxxx" className="h-12 border-none bg-transparent focus-visible:ring-0 font-bold italic text-slate-950 p-0" />
                  ) : (
                    <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight">{profile?.phone || t('customerProfile.notSet' as any) || 'UNLINKED'}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('customerProfile.memberSince' as any) || 'REGISTRY_INIT'}</p>
                <div className="flex items-center gap-6 px-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                    <Calendar className="h-5 w-5 text-slate-300" />
                  </div>
                  <span className="text-lg font-black text-slate-950 italic uppercase tracking-tight">
                    {new Date(user.created_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-6"
                >
                  <Button size="xl" variant="premium" className="w-full h-18 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none">
                    <Save className="mr-4 h-5 w-5" />
                    {t('customerProfile.saveChanges' as any) || 'COMMIT_PARAMETERS'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-10"
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                <ShieldCheck className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('customerProfile.accountStatus' as any) || 'Authorization_Level'}</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Security clearance registry</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 lg:p-16 space-y-12 bg-white">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('customerProfile.accountType' as any) || 'ENTITY_CLASS'}</Label>
                <div className="flex items-center justify-between p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/tier relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-blue-500/20">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/tier:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="w-32 h-32 text-blue-600" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <Badge className={cn(
                      "px-6 py-2 rounded-full border-none shadow-2xl uppercase tracking-[0.3em] text-[10px] font-black italic",
                      profile?.role === "customer_premium" ? "bg-pink-600 text-white shadow-pink-600/30 animate-pulse" : "bg-white text-slate-400"
                    )}>
                      {profile?.role === "customer_premium" ? (t('customerProfile.premiumCustomer' as any) || 'EXECUTIVE_NODE') : (t('customerProfile.freeCustomer' as any) || 'BASELINE_NODE')}
                    </Badge>
                    <p className="text-lg text-slate-500 font-medium italic mt-2">
                      {profile?.role === "customer_premium" ? (t('customerProfile.activePremium' as any) || 'Full protocol synchronization active.') : (t('customerProfile.freePlan' as any) || 'Limited diagnostic node access.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {profile?.role !== "customer_premium" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group/unlock shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10 opacity-50" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover/unlock:rotate-12 transition-transform duration-1000">
                  <Zap className="w-48 h-48 text-white" />
                </div>
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-500 shadow-lg">
                      <Zap className="h-8 w-8 animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{t('customerProfile.upgradeToPremium' as any) || 'Authorize_Executive_Sync'}</h4>
                  </div>
                  <p className="text-lg text-slate-400 font-light italic leading-relaxed tracking-tight">
                    {t('customerProfile.upgradeDesc' as any) || 'Scale your aesthetic transformation with longitudinal evolution mapping and predictive outcome synthesis.'}
                  </p>
                  <Button size="xl" variant="premium" className="w-full h-20 rounded-[2rem] shadow-2xl shadow-pink-500/30 text-[11px] font-black uppercase tracking-[0.4em] italic border-none bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white hover:scale-105 active:scale-95 transition-all group/btn">
                    {t('customerProfile.upgradeNow' as any) || 'Initialize_Upgrade'}
                    <ArrowRight className="ml-4 h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Technical Registry interface */}
        <div className="p-10 lg:p-12 py-8 bg-slate-50 border border-slate-100 rounded-[3rem] flex items-center justify-between shadow-inner opacity-60 hover:opacity-100 transition-opacity duration-700">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">Security_Node_Verified: <span className="text-slate-950">NOMINAL</span></p>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">UUID: {user.id.slice(0, 16).toUpperCase()}...</p>
        </div>
      </motion.div>
    </div>
  )
}
