'use client';

/**
 * Customer Progress Tracking Page
 * 
 * Shows comprehensive progress dashboard for logged-in customers
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CustomerProgressDashboard, {
  type AnalysisSnapshot,
} from '@/components/customer/progress-dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// ============================================================================
// Translation Constants
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'My Progress',
    loading: 'Loading your progress...',
    error: 'Failed to load progress data',
    backToDashboard: 'Back to Dashboard',
    noAnalyses: 'No analyses found',
    startJourney: 'Start your skin journey by taking your first analysis',
    takeAnalysis: 'Take Analysis',
  },
  th: {
    title: 'ความคืบหน้าของฉัน',
    loading: 'กำลังโหลดข้อมูล...',
    error: 'ไม่สามารถโหลดข้อมูลได้',
    backToDashboard: 'กลับไปแดชบอร์ด',
    noAnalyses: 'ไม่พบข้อมูลการวิเคราะห์',
    startJourney: 'เริ่มต้นเส้นทางผิวสวยด้วยการวิเคราะห์ครั้งแรก',
    takeAnalysis: 'ทำการวิเคราะห์',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build HybridSkinAnalysis from API data (reuse from detail page)
 */
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

export default function CustomerProgressPage({ params }: ProgressPageProps) {
  const [analyses, setAnalyses] = useState<AnalysisSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const urlParams = useParams();
  const locale = (urlParams.locale as string) || 'th';
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.th;

  const loadAnalyses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's analysis history
      const response = await fetch('/api/skin-analysis/history');

      if (!response.ok) {
        throw new Error('Failed to load analyses');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load analyses');
      }

      // Transform API data to AnalysisSnapshot format
      const snapshots: AnalysisSnapshot[] = (data.data || data.analyses || []).map(
        (item: any, index: number) => ({
          id: item.id,
          date: new Date(item.createdAt || item.created_at),
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
      setError(err instanceof Error ? err.message : t.error);
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
          title: t.title,
          text: 'Check out my skin analysis progress!',
          url: globalThis.location.href,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(globalThis.location.href);
        alert('Link copied to clipboard!');
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
          <span className="ml-3 text-muted-foreground">{t.loading}</span>
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
          {t.backToDashboard}
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
                <p className="font-semibold">{t.noAnalyses}</p>
                <p>{t.startJourney}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => router.push(`/${locale}/analysis`)}>
                    {t.takeAnalysis}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/${locale}/dashboard`)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.backToDashboard}
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Button
          onClick={() => router.push(`/${locale}/dashboard`)}
          variant="ghost"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToDashboard}
        </Button>
      </div>

      <CustomerProgressDashboard
        analyses={analyses}
        locale={locale as 'th' | 'en'}
        onExport={handleExport}
        onShare={handleShare}
        onBookFollowup={handleBookFollowup}
      />
    </div>
  );
}
