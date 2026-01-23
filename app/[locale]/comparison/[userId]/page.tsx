/**
 * Customer Progress Comparison Page
 * View program progress over multiple sessions
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Activity, Columns } from 'lucide-react';
import Link from 'next/link';
import { ComparisonPageClient } from './comparison-page-client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
// Using client version for server components if needed or just wrapping

interface PageProps {
  params: Promise<{
    locale: string;
    userId: string;
  }>;
  searchParams: Promise<{
    analysisIds?: string;
  }>;
}

async function getAnalyses(userId: string, analysisIds?: string[]) {
  const supabase = await createServerClient();

  // Get user authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  let query = supabase
    .from('skin_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // If specific analysis IDs provided, filter to those
  if (analysisIds && analysisIds.length > 0) {
    query = query.in('id', analysisIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data || [];
}

export default async function ComparisonPage({ params, searchParams }: PageProps) {
  const { locale, userId } = await params;
  const t = await getTranslations({ locale, namespace: 'comparison' });
  const { analysisIds: rawIds } = await searchParams;

  // Parse analysis IDs from awaited search params
  const analysisIds = rawIds
    ? rawIds.split(',').filter(Boolean)
    : undefined;

  const analyses = await getAnalyses(userId, analysisIds);

  if (!analyses || analyses.length < 2) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-slate-950">
        <Header />
        <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
          </div>

          <Card className="max-w-md w-full border-slate-100 bg-white shadow-premium rounded-[3rem] p-12 text-center space-y-8 relative z-10">
            <div className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
              <Columns className="h-12 w-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                {t('insufficientData')}
              </h2>
              <p className="text-lg text-slate-500 font-light italic leading-relaxed">
                {t('insufficientDataDesc')}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button size="xl" variant="premium" className="h-18 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl" asChild>
                <Link href={`/${locale}/analysis`}>
                  {t('startAnalysis')}
                </Link>
              </Button>
              <Button variant="ghost" className="h-14 rounded-xl text-slate-400 font-black uppercase tracking-widest text-[10px] italic" asChild>
                <Link href={`/${locale}/analysis/history`}>
                  <ArrowLeft className="mr-3 h-4 w-4" />
                  {t('back')}
                </Link>
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
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

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-7xl mx-auto flex-1 space-y-16">
          {/* Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" asChild>
                  <Link href={`/${locale}/analysis/history`}>
                    <ArrowLeft className="h-6 w-6" />
                  </Link>
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Activity className="mr-3 h-3.5 w-3.5" />
                  Temporal Delta Engine
                </Badge>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                  Progress<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Comparison</span>
                </h1>
                <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                  {t('comparingXAnalyses', { count: analyses.length })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <Button variant="outline" size="xl" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all">
                <Share2 className="mr-3 h-5 w-5 text-pink-600" />
                {t('share')}
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-600/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <ComparisonPageClient
              userId={userId}
              analysisIds={analysisIds || analyses.map(a => a.id)}
              locale={locale as 'en' | 'th'}
              initialAnalyses={analyses}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'comparison' });
  
  return {
    title: t('pageTitle'),
    description: t('pageDesc')
  };
}

// Added Card for insufficient data view
import { Card } from "@/components/ui/card"
