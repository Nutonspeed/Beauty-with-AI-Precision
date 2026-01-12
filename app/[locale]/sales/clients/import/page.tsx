'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, ArrowLeft, Loader2, Database, ShieldCheck, Zap } from 'lucide-react';
import BulkClientImport from '@/components/sales/bulk-client-import';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ClientImportPage() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !['sales_staff', 'center_admin', 'center_owner', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }
  }, [user, authLoading, router, lp]);

  const downloadTemplate = () => {
    const csv = `email,name,phone\nclient1@example.com,${t('socialProof.reviews.names.somsri')},0812345678\nclient2@example.com,${t('socialProof.reviews.names.wipa')},0898765432\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Import Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Link href={lp('/sales/dashboard')}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                  <Database className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Data Ingestion Protocol
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Registry<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Synchronizer</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Initialize bulk unit synchronization and authorize aesthetic record insertion.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Operational Instructions Node */}
            <div className="lg:col-span-7 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-pink-500" />
                    {t('salesImport.instructions.title')}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('salesImport.instructions.description')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="space-y-6">
                    {[
                      t('salesImport.instructions.step1'),
                      t('salesImport.instructions.step2'),
                      t('salesImport.instructions.step3'),
                      t('salesImport.instructions.step4'),
                      t('salesImport.instructions.step5')
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-6 group/step">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover/step:border-pink-500/30 transition-all font-black text-xs text-slate-500 group-hover/step:text-pink-400">
                          0{i + 1}
                        </div>
                        <p className="text-lg text-slate-400 font-light italic leading-relaxed group-hover/step:text-white transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner relative overflow-hidden group/code">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/code:scale-110 transition-transform">
                      <Database className="w-20 h-20 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 italic">{t('salesImport.instructions.formatLabel')}</p>
                    <code className="text-pink-400 font-mono text-sm block leading-relaxed relative z-10">
                      email,name,phone<br />
                      customer@example.com,{t('customer.name')},0812345678
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Tactical Optimization Node */}
              <Card className="border-pink-500/20 bg-pink-500/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <Zap className="h-5 w-5 text-pink-400" />
                    {t('salesImport.tips.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      t('salesImport.tips.item1'),
                      t('salesImport.tips.item2'),
                      t('salesImport.tips.item3'),
                      t('salesImport.tips.item4'),
                      t('salesImport.tips.item5'),
                      t('salesImport.tips.item6')
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center gap-4 group/tip">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500/40 group-hover/tip:scale-150 transition-transform" />
                        <p className="text-xs text-slate-500 font-medium italic group-hover/tip:text-slate-300 transition-colors">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ingestion Vectors Column */}
            <div className="lg:col-span-5 space-y-10">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                      <Download className="h-6 w-6 text-cyan-400" />
                      {t('salesImport.download.title')}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('salesImport.download.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12">
                    <Button size="xl" variant="outline" className="w-full h-20 rounded-[2rem] border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic shadow-inner" onClick={downloadTemplate}>
                      <Download className="mr-4 h-6 w-6 text-cyan-400" />
                      {t('salesImport.download.button')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <Card className="border-pink-500/30 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative group h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 text-center">
                    <div className="mx-auto h-20 w-20 rounded-[2rem] bg-pink-600/10 border border-pink-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700 mb-6">
                      <Upload className="h-10 w-10 text-pink-400 animate-bounce" />
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tight italic">
                      {t('salesImport.upload.title')}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('salesImport.upload.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12">
                    <Button size="xl" variant="premium" className="w-full h-24 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 border" onClick={() => setImportOpen(true)}>
                      <Upload className="mr-4 h-8 w-8" />
                      {t('salesImport.upload.button')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Bulk Import Sync Interface */}
      <BulkClientImport 
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => {
          setImportOpen(false);
          router.push(lp('/sales/dashboard'));
        }}
      />
    </div>
  );
}
