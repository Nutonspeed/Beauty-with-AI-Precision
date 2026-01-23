'use client';

import { CheckCircle2, Download, ArrowRight, Sparkles, Receipt, Award, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PaymentConfirmationPage() {
  const t = useTranslations('paymentConfirmation');
  const locale = useLocale();
  const lp = useLocalizePath();

  // Mock payment data
  const payment = {
    id: 'PAY-2024-001',
    amount: 2900,
    method: 'พร้อมเพย์',
    status: 'success',
    timestamp: new Date().toISOString(),
    plan: 'Professional',
    features: [
      'unlimited_ai',
      'unlimited_history',
      'detailed_report',
      'special_features',
      'priority_support'
    ]
  };

  const handleDownloadReceipt = () => {
    const link = document.createElement('a');
    link.href = '/receipts/sample-receipt.pdf';
    link.download = `receipt-${payment.id}.pdf`;
    link.click();
  };

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

        <div className="w-full max-w-3xl relative z-10 space-y-12">
          {/* Success Node Architecture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <CardHeader className="text-center p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                <div className="space-y-8">
                  <motion.div 
                    className="mx-auto flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-700"
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-emerald-500/30 text-emerald-600 bg-emerald-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm italic">
                      Transaction_Synchronized
                    </Badge>
                    <CardTitle className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      Payment<br />
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent not-italic">Confirmed</span>
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-500 font-light max-w-md mx-auto italic leading-relaxed pt-4">
                      Your subscription node has been authorized and synchronized with our global infrastructure.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12 lg:p-16 space-y-12">
                {/* Transaction Telemetry */}
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-6">
                    {[
                      { label: t('paymentId'), val: payment.id, icon: Receipt, color: 'text-slate-400' },
                      { label: t('package'), val: payment.plan, icon: Award, color: 'text-pink-600' },
                      { label: t('method'), val: payment.method, icon: Globe, color: 'text-blue-600' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 group/item">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-white group-hover/item:border-slate-200 transition-all">
                          <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{item.label}</p>
                          <p className="text-base font-black italic text-slate-950 uppercase tracking-tight">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 shadow-inner flex flex-col items-center justify-center text-center space-y-4 group/amount">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/60 italic leading-none">{t('amount')}</p>
                    <div className="text-5xl font-black text-emerald-600 tracking-tighter italic uppercase leading-none group-hover/amount:scale-110 transition-transform duration-700">
                      ฿{payment.amount.toLocaleString()}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/40 italic">
                      {new Date(payment.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Authorized Protocols interface */}
                <div className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group/dark shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                    <Zap className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500 mb-8 italic flex items-center gap-4 relative z-10">
                    <Sparkles className="h-4 w-4" />
                    Authorized_Provision_Stack
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                    {payment.features.map((featureKey, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/30 group-hover/item:bg-emerald-500 group-hover/item:scale-150 transition-all duration-500" />
                        <span className="text-[11px] font-black text-slate-400 group-hover:text-white transition-colors italic uppercase tracking-widest leading-none">
                          {t(`features.${featureKey}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Controls interface */}
                <div className="flex flex-col sm:flex-row gap-8 pt-4">
                  <Button
                    onClick={handleDownloadReceipt}
                    size="xl"
                    variant="outline"
                    className="flex-1 h-20 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="h-6 w-6 mr-4" />
                    {t('downloadReceipt')}
                  </Button>
                  <Button
                    asChild
                    size="xl"
                    className="flex-1 h-20 rounded-[2rem] bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href={lp("/analysis")}>
                      {t('goToDashboard')}
                      <ArrowRight className="h-6 w-6 ml-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Terminal link interface */}
          <div className="text-center space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic leading-none">
              {t('stillHaveQuestions')}
            </p>
            <Link 
              href={lp("/contact")} 
              className="text-pink-600 font-black uppercase tracking-[0.3em] text-[10px] italic border-b-2 border-pink-500/20 pb-1 hover:border-pink-500 transition-all inline-block"
            >
              {t('contactSupport')}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
