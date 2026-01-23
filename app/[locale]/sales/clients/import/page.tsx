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
    const csv = `email,name,phone\nclient1@example.com,${t('socialProof.reviews.names.somsri' as any) || 'Somsri'},0812345678\nclient2@example.com,${t('socialProof.reviews.names.wipa' as any) || 'Wipa'},0898765432\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = globalThis.document.createElement('a');
    a.href = url;
    a.download = 'clients-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Synchronizing Data Nodes...</p>
        </div>
      </div>
    );
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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Import Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Link href={lp('/sales/dashboard')}>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Database className="mr-3 h-3.5 w-3.5" />
                  Data Ingestion Protocol
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Registry<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Synchronizer</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Initialize bulk unit synchronization and authorize aesthetic record insertion.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-12 lg:grid-cols-12">
            {/* Operational Instructions Node */}
            <div className="lg:col-span-7 space-y-12">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50">
                  <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                    <div className="p-4 bg-pink-50 rounded-2xl shadow-sm">
                      <ShieldCheck className="h-10 w-10 text-pink-600" />
                    </div>
                    {t('salesImport.instructions.title' as any) || 'Instructions'}
                  </CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6 italic">{t('salesImport.instructions.description' as any) || 'Follow these steps to synchronize client data'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 space-y-12 bg-slate-50/30">
                  <div className="space-y-8">
                    {[
                      t('salesImport.instructions.step1' as any) || 'Step 1: Download Template',
                      t('salesImport.instructions.step2' as any) || 'Step 2: Format Data',
                      t('salesImport.instructions.step3' as any) || 'Step 3: Upload CSV',
                      t('salesImport.instructions.step4' as any) || 'Step 4: Verify Mapping',
                      t('salesImport.instructions.step5' as any) || 'Step 5: Finalize Import'
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-8 group/step">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/step:border-pink-500/30 transition-all font-black text-sm text-slate-400 group-hover/step:text-pink-600 italic">
                          0{i + 1}
                        </div>
                        <p className="text-xl text-slate-500 font-light italic leading-relaxed group-hover/step:text-slate-950 transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-inner relative overflow-hidden group/code">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/code:scale-110 transition-transform duration-700">
                      <Database className="w-24 h-24 text-slate-950" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">{t('salesImport.instructions.formatLabel' as any) || 'Required Format'}</p>
                    <code className="text-pink-600 font-mono text-base block leading-relaxed relative z-10 font-bold">
                      email,name,phone<br />
                      customer@example.com,{t('customer.name' as any) || 'Somsri'},0812345678
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Tactical Optimization Node */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                    <div className="p-3 bg-pink-50 rounded-xl shadow-sm">
                      <Zap className="h-6 w-6 text-pink-600" />
                    </div>
                    {t('salesImport.tips.title' as any) || 'Tactical Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      t('salesImport.tips.item1' as any) || 'Ensure valid email addresses',
                      t('salesImport.tips.item2' as any) || 'Clean phone number formatting',
                      t('salesImport.tips.item3' as any) || 'Avoid duplicate entries',
                      t('salesImport.tips.item4' as any) || 'Verify name spelling',
                      t('salesImport.tips.item5' as any) || 'Check for special characters',
                      t('salesImport.tips.item6' as any) || 'Validate CSV encoding'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center gap-5 group/tip">
                        <div className="w-2 h-2 rounded-full bg-pink-500/30 group-hover/tip:scale-150 group-hover/tip:bg-pink-500 transition-all duration-500" />
                        <p className="text-sm text-slate-500 font-bold italic group-hover/tip:text-slate-950 transition-colors uppercase tracking-tight">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ingestion Vectors Column */}
            <div className="lg:col-span-5 space-y-12">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group h-full transition-all duration-700 hover:border-blue-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                    <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                      <div className="p-3 bg-blue-50 rounded-xl shadow-sm">
                        <Download className="h-6 w-6 text-blue-600" />
                      </div>
                      {t('salesImport.download.title' as any) || 'Schema Template'}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('salesImport.download.description' as any) || 'Download the standard data ingestion schema'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12">
                    <Button size="xl" variant="outline" className="w-full h-24 rounded-[2.5rem] border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-blue-600 italic shadow-inner hover:shadow-premium" onClick={downloadTemplate}>
                      <Download className="mr-4 h-8 w-8 text-blue-600" />
                      {t('salesImport.download.button' as any) || 'Download CSV Template'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <Card className="border-pink-500/20 bg-pink-50/30 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-premium relative group h-full transition-all duration-700 hover:border-pink-500/30">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                  <CardHeader className="p-10 lg:p-16 pb-8 border-b border-pink-500/10 text-center">
                    <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-pink-100 flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform duration-1000 mb-8">
                      <Upload className="h-12 w-12 text-pink-600 animate-bounce" />
                    </div>
                    <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      {t('salesImport.upload.title' as any) || 'Data Uplink'}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-600/60 mt-6 italic">{t('salesImport.upload.description' as any) || 'Initialize bulk unit synchronization'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16">
                    <Button size="xl" variant="premium" className="w-full h-28 rounded-[3rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => setImportOpen(true)}>
                      <Upload className="mr-6 h-10 w-10" />
                      {t('salesImport.upload.button' as any) || 'Upload Client CSV'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

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
