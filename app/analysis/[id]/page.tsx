/**
 * Skin Analysis Detail Page
 * 
 * Displays comprehensive 8-mode analysis results:
 * - Overall score and skin health grade
 * - Individual mode results with visualizations
 * - Detection counts and severity levels
 * - Personalized recommendations
 * - Before/after comparison (if available)
 * - Progress tracking
 */

import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import AnalysisDetailClient from '@/components/analysis/AnalysisDetailClient';

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    compare?: string; // Optional: comparison analysis ID
  }>;
}

export async function generateMetadata(
  { params }: AnalysisDetailPageProps
): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Analysis #${id} - AI Beauty Platform`,
    description: 'View your comprehensive skin analysis results with AI-powered insights',
  };
}

export default async function AnalysisDetailPage({
  params,
  searchParams,
}: Readonly<AnalysisDetailPageProps>) {
  const supabase = await createServerClient();
  const { id } = await params
  const { compare } = await searchParams

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirectTo=/analysis/' + id);
  }

  // Fetch analysis data
  const { data: analysis, error: analysisError } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (analysisError || !analysis) {
    console.error('[AnalysisDetail] Error:', analysisError);
    notFound();
  }

  // Check ownership (user can only view their own analyses unless admin)
  if (analysis.user_id !== user.id) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'doctor') {
      notFound();
    }
  }

  // Fetch comparison analysis if requested
  let comparisonAnalysis = null;
  if (compare) {
    const { data: comparison } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', compare)
      .eq('user_id', user.id)
      .single();

    comparisonAnalysis = comparison;
  }

  // Fetch all user analyses for comparison selector
  const { data: userAnalyses } = await supabase
    .from('skin_analyses')
    .select('id, analyzed_at, overall_score, is_baseline')
    .eq('user_id', user.id)
    .neq('id', id)
    .order('analyzed_at', { ascending: false })
    .limit(10);

  // Fetch user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, skin_type, skin_concerns')
    .eq('id', user.id)
    .single();

  return (
    <AnalysisDetailClient
      analysis={analysis}
      comparisonAnalysis={comparisonAnalysis}
      availableAnalyses={userAnalyses || []}
      userProfile={profile ? {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        skin_type: profile.skin_type,
        skin_concerns: profile.skin_concerns,
      } : undefined}
      userId={user.id}
    />
  );
}
