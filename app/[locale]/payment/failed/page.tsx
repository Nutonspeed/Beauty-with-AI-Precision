'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import Link from 'next/link';
import { RefreshCw, Phone, XCircle, ShieldAlert, Activity } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PaymentFailedPage() {
  const t = useTranslations('paymentFailed');
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const lp = useLocalizePath();
  const reason = searchParams.get('reason') || 'unknown';

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'timeout':
        return t('errors.timeout');
      case 'cancelled':
        return t('errors.cancelled');
      case 'insufficient':
        return t('errors.insufficient');
      case 'technical':
        return t('errors.technical');
      default:
        return t('errors.default');
    }
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
          {/* Error Node Architecture */}
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
                    initial={{ scale: 0.5, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <XCircle className="w-12 h-12 text-rose-500" />
                  </motion.div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-rose-500/30 text-rose-600 bg-rose-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
                      Transaction_Sync_Error
                    </Badge>
                    <CardTitle className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      Payment<br />
                      <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent not-italic">Failed</span>
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-500 font-light max-w-md mx-auto italic leading-relaxed pt-4">
                      {getErrorMessage(reason)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12 lg:p-16 space-y-12">
                <Alert className="border-rose-100 bg-rose-50/50 rounded-2xl p-8 shadow-inner flex items-center gap-8">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-rose-100 shadow-sm shrink-0">
                    <ShieldAlert className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600/60 italic leading-none">{t('errorCode')}</p>
                    <p className="text-lg font-black italic text-rose-900 uppercase tracking-tight">PAY_FAILED_{reason.toUpperCase()}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-600/40 italic pt-1">
                      Recorded at: {new Date().toLocaleString()}
                    </p>
                  </div>
                </Alert>

                {/* Resolution Steps interface */}
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
                      <Activity className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black italic text-slate-950 uppercase tracking-tight leading-none">{t('whatToDo')}</h3>
                  </div>
                  <div className="grid gap-6">
                    {[
                      { step: "01", title: t('step1Title'), desc: t('step1Desc') },
                      { step: "02", title: t('step2Title'), desc: t('step2Desc') },
                      { step: "03", title: t('step3Title'), desc: t('step3Desc') }
                    ].map((s, i) => (
                      <div key={i} className="flex items-start gap-6 group/step p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-500/20 transition-all duration-500 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[13px] font-black text-slate-300 group-hover/step:text-blue-600 group-hover/step:border-blue-100 shadow-inner transition-all duration-500 italic shrink-0">
                          {s.step}
                        </div>
                        <div className="space-y-1 flex-1 pt-1">
                          <p className="text-base font-black italic text-slate-900 uppercase tracking-tight group-hover/step:text-blue-600 transition-colors leading-none">{s.title}</p>
                          <p className="text-sm text-slate-500 font-light italic leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Controls interface */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <Button
                    asChild
                    size="xl"
                    className="h-20 rounded-[2rem] bg-gradient-to-r from-rose-500 to-pink-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href={lp("/pricing")}>
                      <RefreshCw className="h-6 w-6 mr-4" />
                      {t('retryButton')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    asChild
                    className="h-20 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href={lp("/contact")}>
                      {t('contactButton')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Terminal info interface */}
          <Card className="border-slate-100 bg-slate-50/30 backdrop-blur-xl rounded-[3rem] p-10 shadow-inner">
            <CardHeader className="p-0 pb-8 border-b border-slate-100 flex flex-row items-center gap-6">
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                <Phone className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">{t('contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-8 grid sm:grid-cols-2 gap-10">
              <div className="space-y-2 group/info">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover/info:text-pink-600 transition-colors">Direct Frequency</p>
                <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">02-XXX-XXXX</p>
              </div>
              <div className="space-y-2 group/info">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover/info:text-blue-600 transition-colors">Secure Node Link</p>
                <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none break-all">support@beauty-with-ai.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
