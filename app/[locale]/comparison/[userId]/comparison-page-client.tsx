/**
 * Comparison Page Client Component
 * Handles client-side rendering of comparison features
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTrackingChart } from '@/components/comparison/progress-tracking-chart';
import { MultiAnalysisComparison } from '@/components/comparison/multi-analysis-comparison';
import { PhotoGallery } from '@/components/comparison/photo-gallery';
import { BarChart3, Grid3x3, Image as ImageIcon } from 'lucide-react';

interface Analysis {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string | null;
  created_at: string;
  session_number: number | null;
  metrics: {
    overall_score: number;
    spots?: number;
    pores?: number;
    wrinkles?: number;
    texture?: number;
    redness?: number;
    pigmentation?: number;
  };
  milestone_type?: 'baseline' | 'progress' | 'final' | 'follow_up';
  notes?: string;
}

interface ComparisonPageClientProps {
  userId: string;
  analysisIds: string[];
  locale: 'en' | 'th';
  initialAnalyses: Analysis[];
}

const TRANSLATIONS = {
  en: {
    tabs: {
      chart: 'Progress Chart',
      comparison: 'Comparison',
      gallery: 'Photo Gallery'
    }
  },
  th: {
    tabs: {
      chart: 'กราฟความคืบหน้า',
      comparison: 'เปรียบเทียบ',
      gallery: 'แกลเลอรี่รูปภาพ'
    }
  }
};

export function ComparisonPageClient({
  userId,
  analysisIds,
  locale,
  initialAnalyses
}: ComparisonPageClientProps) {
  const t = TRANSLATIONS[locale];
  const [activeTab, setActiveTab] = useState('chart');

  // Transform analyses to chart data format
  const chartData = initialAnalyses.map((analysis, index) => ({
    id: analysis.id,
    date: analysis.created_at,
    sessionNumber: analysis.session_number || index + 1,
    scores: {
      spots: analysis.metrics?.spots || 0,
      pores: analysis.metrics?.pores || 0,
      wrinkles: analysis.metrics?.wrinkles || 0,
      texture: analysis.metrics?.texture || 0,
      redness: analysis.metrics?.redness || 0,
      overall: analysis.metrics?.overall_score || 0
    },
    imageUrl: analysis.image_url,
    thumbnailUrl: analysis.thumbnail_url
  }));

  // Transform analyses to gallery format
  const galleryPhotos = initialAnalyses.map((analysis, index) => ({
    id: analysis.id,
    imageUrl: analysis.image_url,
    thumbnailUrl: analysis.thumbnail_url,
    date: analysis.created_at,
    sessionNumber: analysis.session_number || index + 1,
    milestoneType: analysis.milestone_type,
    notes: analysis.notes,
    metrics: {
      overall_score: analysis.metrics?.overall_score || 0,
      ...analysis.metrics
    }
  }));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="chart" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {t.tabs.chart}
        </TabsTrigger>
        <TabsTrigger value="comparison" className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          {t.tabs.comparison}
        </TabsTrigger>
        <TabsTrigger value="gallery" className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {t.tabs.gallery}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chart" className="mt-0">
        <ProgressTrackingChart
          data={chartData}
          locale={locale}
          onAnalysisClick={(id) => {
            // Navigate to analysis detail page
            window.location.href = `/${locale}/analysis/detail/${id}`;
          }}
        />
      </TabsContent>

      <TabsContent value="comparison" className="mt-0">
        <MultiAnalysisComparison
          userId={userId}
          analysisIds={analysisIds}
          locale={locale}
          onClose={() => {
            window.history.back();
          }}
        />
      </TabsContent>

      <TabsContent value="gallery" className="mt-0">
        <PhotoGallery photos={galleryPhotos} locale={locale} />
      </TabsContent>
    </Tabs>
  );
}
