'use client';

/**
 * Client Progress Tracking Page
 * 
 * Shows comprehensive progress dashboard for logged-in clients
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ClientProgressDashboard, {
  type AnalysisSnapshot,
} from '@/components/client/progress-dashboard';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// ============================================================================
// Translation Constants
// ============================================================================

function buildHybridAnalysis(data: any, id: string): HybridSkinAnalysis {
  // Simplified version - adapt based on your actual API response structure
  return {
    id,
    userId: data.userId || data.user_id || '',
    createdAt: new Date(data.createdAt || data.created_at),
    timestamp: new Date(data.timestamp || data.createdAt || data.created_at),
    imageUrl: data.imageUrl || data.image_url || '',
    ai: {
      skinType: data.skinType || 'normal',
      concerns: data.concerns || [],
      severity: data.severity || {},
      recommendations: data.recommendations || [],
      confidence: data.confidence || 0.8,
    },
    aiProvider: data.aiProvider || 'huggingface',
    cv: {
      spots: data.cv?.spots || { count: 0, locations: [], severity: 0 },
      pores: data.cv?.pores || { averageSize: 0, enlargedCount: 0, severity: 0 },
      wrinkles: data.cv?.wrinkles || { count: 0, locations: [], severity: 0 },
      texture: data.cv?.texture || { smoothness: 0, roughness: 0, score: 0 },
      redness: data.cv?.redness || { percentage: 0, areas: [], severity: 0 },
    },
    overallScore: {
      spots: data.overallScore?.spots || 5,
      pores: data.overallScore?.pores || 5,
      wrinkles: data.overallScore?.wrinkles || 5,
      texture: data.overallScore?.texture || 5,
      redness: data.overallScore?.redness || 5,
      pigmentation: data.overallScore?.pigmentation || 5,
    },
    percentiles: {
      spots: data.percentiles?.spots || 50,
      pores: data.percentiles?.pores || 50,
      wrinkles: data.percentiles?.wrinkles || 50,
      texture: data.percentiles?.texture || 50,
      redness: data.percentiles?.redness || 50,
      overall: data.percentiles?.overall || 50,
    },
    confidence: data.confidence || 0.8,
    recommendations: data.recommendations || [],
    annotatedImages: data.annotatedImages || {},
  };
}

// ============================================================================
// Main Component
// ============================================================================

interface ProgressPageProps {
  params: Promise<{ locale: string }>;
}

export default function ClientProgressPage({ params }: ProgressPageProps) {
  const unwrappedParams = React.use(params)
  const locale = unwrappedParams.locale
  const t = useTranslations();
  const [analyses, setAnalyses] = useState<AnalysisSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadAnalyses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's analysis history
      const response = await fetch('/api/analysis/history?limit=50&offset=0');

      if (!response.ok) {
        throw new Error(t('progress.error'));
      }

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error || t('progress.error'));
      }

      const items = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.analyses)
          ? data.analyses
          : [];

      // Transform API data to AnalysisSnapshot format
      const snapshots: AnalysisSnapshot[] = items.map(
        (item: any, index: number) => ({
          id: item.id,
          date: new Date(item.createdAt || item.created_at || item.timestamp),
          analysis: buildHybridAnalysis(item, item.id),
          imageUrl: item.imageUrl || item.image_url,
          thumbnailUrl: item.thumbnailUrl || item.thumbnail_url,
          sessionNumber: index + 1,
          notes: item.notes,
        })
      );

      setAnalyses(snapshots);
    } catch (err) {
      console.error('Load analyses error:', err);
      setError(err instanceof Error ? err.message : t('progress.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleExport = async () => {
    try {
      // Generate PDF report (placeholder - implement in Task 4)
      const blob = new Blob(['Progress Report PDF'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleShare = async () => {
    try {
      // Share via Web Share API or copy link
      if (navigator.share) {
        await navigator.share({
          title: t('progress.title'),
          text: t('progress.shareText'),
          url: globalThis.location.href,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(globalThis.location.href);
        alert(t('progress.linkCopied'));
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleBookFollowup = () => {
    router.push(`/${locale}/booking`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">{t('progress.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push(`/${locale}/dashboard`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('progress.backToDashboard')}
        </Button>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold">{t('progress.noAnalyses')}</p>
                <p>{t('progress.startJourney')}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => router.push(`/${locale}/analysis`)}>
                    {t('progress.takeAnalysis')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/${locale}/dashboard`)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('progress.backToDashboard')}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <TrendingUp className="mr-3 h-3.5 w-3.5" />
                Evolutionary Transformation Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Aesthetic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Progress</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Monitor your aesthetic journey across temporal nodes and synchronize transformation metrics.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button
                onClick={() => router.push(`/${locale}/dashboard`)}
                variant="outline"
                className="group h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic shadow-premium"
              >
                <ArrowLeft className="w-4 h-4 mr-4 group-hover:-translate-x-1 transition-transform" />
                {t('progress.backToDashboard')}
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ClientProgressDashboard
              analyses={analyses}
              locale={locale as 'th' | 'en'}
              onExport={handleExport}
              onShare={handleShare}
              onBookFollowup={handleBookFollowup}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
