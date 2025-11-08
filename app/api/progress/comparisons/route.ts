import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  calculateImprovementMetrics,
  createComparison,
  generateImprovementSummary,
  generateRecommendations,
  calculateTimeElapsed,
} from '@/lib/progress/metric-calculator';
import { alignPhotos } from '@/lib/progress/photo-aligner';

/**
 * POST /api/progress/comparisons
 * Create a new comparison between two photos
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { before_photo_id, after_photo_id, comparison_type = 'manual' } = body;

    if (!before_photo_id || !after_photo_id) {
      return NextResponse.json(
        { error: 'before_photo_id and after_photo_id are required' },
        { status: 400 }
      );
    }

    // Fetch both photos
    const { data: photos, error: photosError } = await supabase
      .from('progress_photos')
      .select('*')
      .in('id', [before_photo_id, after_photo_id]);

    if (photosError || !photos || photos.length !== 2) {
      return NextResponse.json({ error: 'Photos not found' }, { status: 404 });
    }

    const beforePhoto = photos.find((p) => p.id === before_photo_id);
    const afterPhoto = photos.find((p) => p.id === after_photo_id);

    if (!beforePhoto || !afterPhoto) {
      return NextResponse.json({ error: 'Photos not found' }, { status: 404 });
    }

    // Ensure user owns both photos
    if (beforePhoto.user_id !== user.id || afterPhoto.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Perform alignment
    let alignmentScore: number | undefined;
    try {
      const alignmentResult = await alignPhotos(afterPhoto.image_url, beforePhoto.image_url);
      alignmentScore = alignmentResult.alignmentScore;
    } catch (error) {
      console.error('Alignment failed:', error);
      // Continue without alignment
    }

    // Create comparison object
    const comparisonData = createComparison(
      beforePhoto,
      afterPhoto,
      user.id,
      comparison_type,
      alignmentScore
    );

    // Save to database
    const { data: comparison, error: comparisonError } = await supabase
      .from('progress_comparisons')
      .insert(comparisonData)
      .select()
      .single();

    if (comparisonError) {
      console.error('Database error:', comparisonError);
      return NextResponse.json({ error: 'Failed to create comparison' }, { status: 500 });
    }

    // Calculate metrics
    const metrics = calculateImprovementMetrics(beforePhoto, afterPhoto);
    const timeElapsed = calculateTimeElapsed(beforePhoto, afterPhoto);
    const improvementSummary = generateImprovementSummary(metrics);
    const recommendations = generateRecommendations(metrics, timeElapsed.days);

    return NextResponse.json({
      comparison,
      metrics,
      time_elapsed_days: timeElapsed.days,
      improvement_summary: improvementSummary,
      recommendations,
    });
  } catch (error) {
    console.error('Error creating comparison:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/progress/comparisons
 * Get all comparisons for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch comparisons with photo details
    const { data: comparisons, error } = await supabase
      .from('progress_comparisons')
      .select(
        `
        *,
        before_photo:progress_photos!before_photo_id(*),
        after_photo:progress_photos!after_photo_id(*)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 });
    }

    return NextResponse.json({ comparisons });
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
