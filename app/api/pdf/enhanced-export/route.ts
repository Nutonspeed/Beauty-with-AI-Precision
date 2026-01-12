/**
 * Enhanced PDF Export API
 * Generate professional PDF reports with before/after comparison and progress charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Type for historical analysis data
interface HistoricalAnalysisData {
  date: string;
  overall: number;
  spots: number;
  pores: number;
  wrinkles: number;
  texture: number;
  redness: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      analysisId,
      previousAnalysisId,
      includeComparison = false,
      includeProgressCharts = false,
      locale = 'en',
      clientInfo,
    } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Fetch current analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Fetch previous analysis if comparison is requested
    let previousAnalysis = null;
    if (includeComparison && previousAnalysisId) {
      const { data: prevAnalysis } = await supabase
        .from('skin_analyses')
        .select('*')
        .eq('id', previousAnalysisId)
        .eq('user_id', user.id)
        .single();

      previousAnalysis = prevAnalysis;
    }

    // Fetch historical analyses for progress charts
    let historicalAnalyses: HistoricalAnalysisData[] = [];
    if (includeProgressCharts) {
      const { data: historical } = await supabase
        .from('skin_analyses')
        .select('created_at, percentiles, overall_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(10);

      if (historical) {
        historicalAnalyses = historical.map((h: any) => ({
          date: h.created_at,
          overall: h.percentiles?.overall || 0,
          spots: h.percentiles?.spots || 0,
          pores: h.percentiles?.pores || 0,
          wrinkles: h.percentiles?.wrinkles || 0,
          texture: h.percentiles?.texture || 0,
          redness: h.percentiles?.redness || 0,
        }));
      }
    }

    // Fetch user profile for client info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, date_of_birth, gender, skin_type')
      .eq('id', user.id)
      .single();

    // Fetch center info from centers table or use defaults
    const { data: centerSettings } = await supabase
      .from('centers')
      .select('*')
      .single();

    const centerInfo = {
      name: centerSettings?.name || centerSettings?.center_name || 'Beauty with AI Precision',
      nameTh: centerSettings?.center_name_th || 'ความงามด้วยความแม่นยำของ AI',
      logo: centerSettings?.logo_url || null,
      brandColor: centerSettings?.primary_color || '#8b5cf6',
      address: centerSettings?.address || '',
      addressTh: centerSettings?.address_th || '',
      phone: centerSettings?.phone || '',
      email: centerSettings?.email || '',
      website: centerSettings?.website || '',
      license: centerSettings?.license_number || '',
    };

    const pdfOptions = {
      locale,
      clientInfo: {
        name: clientInfo?.name || profile?.full_name || user.email,
        age: profile?.date_of_birth
          ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
          : undefined,
        gender: clientInfo?.gender || profile?.gender,
        skinType: clientInfo?.skinType || profile?.skin_type,
        customerId: user.id.substring(0, 8).toUpperCase(),
      },
      centerInfo,
      previousAnalysis: previousAnalysis || undefined,
      comparisonMode: includeComparison && !!previousAnalysis,
      highlightImprovements: true,
      historicalAnalyses: historicalAnalyses.length > 0 ? historicalAnalyses : undefined,
      includeProgressCharts: includeProgressCharts && historicalAnalyses.length > 0,
      theme: 'professional' as const,
      colorScheme: 'purple' as const,
    };

    // Return PDF options for client-side generation
    // (Because jsPDF works better on client-side for image handling)
    return NextResponse.json({
      success: true,
      analysis,
      previousAnalysis,
      historicalAnalyses,
      pdfOptions,
      message: 'PDF data prepared successfully',
    });

  } catch (error) {
    console.error('[API] Error preparing PDF data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
