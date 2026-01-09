"use client"

/**
 * Sales Tools Hub - AI Sales Tools aggregator
 * Competitive features: AI Recommendations, Quote Calculator, Conversion Optimizer
 */

import { useState } from "react"
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Calculator, 
  Target, 
  Users,
  TrendingUp
} from "lucide-react";
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { useTranslations, useLocale } from 'next-intl';

// Import new AI components
import { AISmartRecommendations } from '@/components/sales/ai-smart-recommendations';
import { QuickQuoteCalculator } from '@/components/sales/quick-quote-calculator';
import { LeadConversionOptimizer } from '@/components/sales/lead-conversion-optimizer';

// Sample lead data for demo
const getSampleLead = (t: any) => ({
  id: 'lead_001',
  name: t('salesLeads.modal.namePlaceholder') || 'Customer',
  source: 'Facebook Ads',
  lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  engagementScore: 65,
  visitCount: 3,
  treatmentInterest: ['Botox', 'Filler'],
  budget: 'medium' as const,
  urgency: 'medium' as const,
  objections: ['price']
});

// Sample customer profile
const getSampleProfile = (t: any) => ({
  age: 35,
  gender: 'female' as const,
  skinType: 'combination' as const,
  concerns: ['wrinkles', 'pigmentation'],
  budget: 'medium' as const,
  previousTreatments: ['HydraFacial']
});

export default function SalesToolsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const [activeTab, setActiveTab] = useState('recommendations');
  const lp = useLocalizePath();
  
  const sampleLead = {
    id: 'lead_001',
    name: t('salesLeads.modal.namePlaceholder') || 'Customer',
    source: t('salesTools.sources.facebook'),
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    engagementScore: 65,
    visitCount: 3,
    treatmentInterest: [t('booking.treatments.botox'), t('booking.treatments.filler')],
    budget: 'medium' as const,
    urgency: 'medium' as const,
    objections: ['price']
  };

  const sampleProfile = {
    age: 35,
    gender: 'female' as const,
    skinType: 'combination' as const,
    concerns: ['wrinkles', 'pigmentation'],
    budget: 'medium' as const,
    previousTreatments: ['HydraFacial']
  };

  const leadQueue = [
    { name: `${t('roles.customer')} 1`, score: 78, interest: `${t('booking.treatments.botox')}, ${t('booking.treatments.filler')}`, status: 'hot' },
    { name: `${t('roles.customer')} 2`, score: 65, interest: t('booking.treatments.skin_tightening'), status: 'warm' },
    { name: `${t('roles.customer')} 3`, score: 52, interest: t('booking.treatments.laser'), status: 'warm' },
    { name: `${t('roles.customer')} 4`, score: 45, interest: t('booking.treatments.facial'), status: 'cold' },
  ];

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

        {/* Top Operational Sync Bar */}
        <div className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href={lp('/sales/dashboard')}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tighter italic">
                      Intelligence Hub
                    </h1>
                    <Badge variant="outline" className="px-3 py-0.5 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[8px] font-black shadow-2xl shadow-pink-500/10">
                      <Zap className="mr-2 h-3 w-3 animate-pulse" />
                      Protocol Active
                    </Badge>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Advanced Sales Acquisition Architecture</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metric Streaming */}
        <div className="border-b border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { label: t('salesTools.stats.conversion'), val: t('salesTools.stats.conversionValue'), color: 'text-white' },
                { label: t('salesTools.stats.revenue'), val: t('salesTools.stats.revenueValue'), color: 'text-emerald-400' },
                { label: t('salesTools.stats.leads'), val: t('salesTools.stats.leadsValue'), color: 'text-pink-400' },
                { label: t('salesTools.stats.rating'), val: t('salesTools.stats.ratingValue'), color: 'text-cyan-400' }
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-left space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</p>
                  <p className={cn("text-3xl font-black tracking-tighter italic", stat.color)}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 py-12 space-y-12 flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
            <div className="flex items-center justify-center">
              <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2">
                <TabsTrigger 
                  value="recommendations" 
                  className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  {t('salesTools.tabs.recommendations')}
                </TabsTrigger>
                <TabsTrigger 
                  value="quote"
                  className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full"
                >
                  <Calculator className="w-4 h-4 mr-3" />
                  {t('salesTools.tabs.quote')}
                </TabsTrigger>
                <TabsTrigger 
                  value="optimizer"
                  className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full"
                >
                  <Target className="w-4 h-4 mr-3" />
                  {t('salesTools.tabs.optimizer')}
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="recommendations" className="mt-0 outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Perspective Parameter Node */}
                    <div className="lg:col-span-4 space-y-8">
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                            <Users className="h-6 w-6 text-pink-500" />
                            {t('salesTools.profile.title')}
                          </CardTitle>
                          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Initialize diagnostic credential binding</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-8">
                          <div className="space-y-6">
                            {[
                              { label: t('salesTools.profile.age'), val: `${sampleProfile.age} ${t('salesTools.profile.years')}` },
                              { label: t('salesTools.profile.skinType'), val: sampleProfile.skinType },
                              { label: t('salesTools.profile.budget'), val: sampleProfile.budget, badge: true }
                            ].map((row, i) => (
                              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{row.label}</span>
                                {row.badge ? (
                                  <Badge className="bg-pink-600/20 text-pink-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic">{row.val}</Badge>
                                ) : (
                                  <span className="text-white font-bold italic">{row.val}</span>
                                )}
                              </div>
                            ))}
                            <div className="space-y-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic block">{t('salesTools.profile.concerns')}</span>
                              <div className="flex flex-wrap gap-2">
                                {sampleProfile.concerns.map((c, i) => (
                                  <Badge key={i} variant="outline" className="border-white/5 bg-white/[0.03] text-slate-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl italic">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <Button size="xl" variant="premium" className="w-full h-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 border">
                            <Sparkles className="w-4 h-4 mr-3" />
                            {t('salesTools.profile.update')}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Intelligence Engine Interface */}
                    <div className="lg:col-span-8">
                      <AISmartRecommendations 
                        customerProfile={sampleProfile}
                        onSelectTreatment={(treatment) => {
                          console.log('Selected:', treatment);
                          setActiveTab('quote');
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quote" className="mt-0 outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                      <QuickQuoteCalculator 
                        onSendQuote={(quote) => {
                          console.log('Quote sent:', quote);
                          alert(t('salesTools.messages.quoteSuccess', { amount: quote.total.toLocaleString() }));
                        }}
                      />
                    </div>
                    
                    {/* Tactical Optimization Nodes */}
                    <div className="lg:col-span-4 space-y-8">
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                            {t('salesTools.tips.title')}
                          </CardTitle>
                          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Conversion optimization strategies</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-6">
                          {[
                            { label: t('salesTools.tips.bundle'), desc: t('salesTools.tips.bundleDesc'), icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { label: t('salesTools.tips.urgency'), desc: t('salesTools.tips.urgencyDesc'), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { label: t('salesTools.tips.installment'), desc: t('salesTools.tips.installmentDesc'), icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                            { label: t('salesTools.tips.consult'), desc: t('salesTools.tips.consultDesc'), icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' }
                          ].map((tip, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="group/tip p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default"
                            >
                              <div className="flex items-center gap-4 mb-2">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner", tip.bg, tip.color)}>
                                  <tip.icon className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-bold text-white italic group-hover/tip:text-pink-400 transition-colors">{tip.label}</p>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-14 leading-relaxed">{tip.desc}</p>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="optimizer" className="mt-0 outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7">
                      <LeadConversionOptimizer 
                        lead={sampleLead}
                        onActionTaken={(action) => {
                          console.log('Action taken:', action);
                        }}
                      />
                    </div>
                    
                    {/* Acquisition Queue Node */}
                    <div className="lg:col-span-5 space-y-8">
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                              <Users className="h-6 w-6 text-cyan-500" />
                              {t('salesTools.queue.title')}
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live acquisition prioritization</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-6">
                          <div className="space-y-4">
                            {leadQueue.map((lead, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all cursor-pointer relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/5 group-hover:bg-pink-600 transition-colors" />
                                <div className="flex items-center gap-6">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner italic font-black text-xl",
                                    lead.status === 'hot' ? 'bg-rose-500/10 text-rose-400' :
                                    lead.status === 'warm' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                                  )}>
                                    {lead.score}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-bold text-white italic group-hover:text-pink-400 transition-colors">{lead.name}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{lead.interest}</p>
                                  </div>
                                </div>
                                <Badge className={cn(
                                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                                  lead.status === 'hot' ? 'bg-rose-500/20 text-rose-400' :
                                  lead.status === 'warm' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                                )}>
                                  {lead.status === 'hot' ? t('salesLeads.status.hot') : lead.status === 'warm' ? t('salesLeads.status.warm') : t('salesLeads.status.cold')}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                          
                          <Button variant="outline" className="w-full h-16 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-white/10 transition-all mt-6">
                            {t('salesTools.queue.viewAll')}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
