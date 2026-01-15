/**
 * AI Skin Analysis API - Multi-Mode Detection
 * 
 * POST /api/analysis/multi-mode
 * 
 * Processes uploaded face image through AI service (8-mode detection)
 * and saves results to Supabase database
 * 
 * Features:
 * - Upload image to Supabase Storage
 * - Call Python AI service for analysis
 * - Generate visualization overlays
 * - Save all results to skin_analyses table
 * - Return comprehensive analysis data
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { withPublicAccess } from '@/lib/auth/middleware';
 import { getAIServiceUrl } from '@/lib/config/ai';

interface AnalysisResult {
  spots: any;
  wrinkles: any;
  texture: any;
  pores: any;
  uv_spots: any;
  brown_spots: any;
  red_areas: any;
  porphyrins: any;
  processing_time: number;
  overall_score?: number;
}

export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    const AI_SERVICE_URL = getAIServiceUrl();
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const bookingId = formData.get('booking_id') as string | null;
    const isBaseline = formData.get('is_baseline') === 'true';
    const notes = formData.get('notes') as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    console.log(`[Analysis] Processing image for user ${user.id}: ${imageFile.name}`);

    // Step 1: Upload original image to Supabase Storage
    const timestamp = Date.now();
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}-original.${fileExt}`;
    
    const imageBuffer = await imageFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('skin-analysis-images')
      .upload(fileName, imageBuffer, {
        contentType: imageFile.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[Analysis] Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for uploaded image
    const { data: { publicUrl: imageUrl } } = supabase.storage
      .from('skin-analysis-images')
      .getPublicUrl(fileName);

    console.log(`[Analysis] Image uploaded: ${imageUrl}`);

    // Step 2: Call AI service for multi-mode analysis
    const aiFormData = new FormData();
    aiFormData.append('file', new Blob([imageBuffer], { type: imageFile.type }), imageFile.name);

    const analysisStartTime = Date.now();
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/analyze/multi-mode`, {
      method: 'POST',
      body: aiFormData,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Analysis] AI service error:', errorText);
      return NextResponse.json(
        { error: 'AI analysis failed', details: errorText },
        { status: 500 }
      );
    }

    const analysisResults: AnalysisResult = await aiResponse.json();
    const processingTime = Date.now() - analysisStartTime;

    console.log(`[Analysis] AI analysis completed in ${processingTime}ms`);

    // Step 3: Generate visualization (multi-mode overlay)
    const vizFormData = new FormData();
    vizFormData.append('file', new Blob([imageBuffer], { type: imageFile.type }), imageFile.name);

    const vizResponse = await fetch(
      `${AI_SERVICE_URL}/api/visualize/multi-mode?show_legend=true&show_stats=true&show_numbers=true&include_heatmap=true`,
      {
        method: 'POST',
        body: vizFormData,
      }
    );

    let visualizationUrl: string | null = null;

    if (vizResponse.ok) {
      // Upload visualization to storage
      const vizBuffer = await vizResponse.arrayBuffer();
      const vizFileName = `${user.id}/${timestamp}-visualization.png`;
      
      const { data: vizUploadData, error: vizUploadError } = await supabase.storage
        .from('skin-analysis-images')
        .upload(vizFileName, vizBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (!vizUploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('skin-analysis-images')
          .getPublicUrl(vizFileName);
        visualizationUrl = publicUrl;
        console.log(`[Analysis] Visualization uploaded: ${visualizationUrl}`);
      }
    }

    // Step 4: Calculate scores and severity levels
    const calculateScore = (detections: any, maxGood: number = 0): number => {
      if (!detections || !detections.detections) return 100;
      const count = detections.detections.length || 0;
      if (count <= maxGood) return 100;
      // Score decreases as count increases
      return Math.max(0, 100 - ((count - maxGood) * 2));
    };

    const getSeverity = (score: number): string => {
      if (score >= 90) return 'low';
      if (score >= 75) return 'moderate';
      if (score >= 50) return 'high';
      return 'severe';
    };

    const spotsScore = calculateScore(analysisResults.spots, 5);
    const wrinklesScore = calculateScore(analysisResults.wrinkles, 3);
    const textureScore = analysisResults.texture?.overall_score || 80;
    const poresScore = calculateScore(analysisResults.pores, 50);
    const uvSpotsScore = calculateScore(analysisResults.uv_spots, 3);
    const brownSpotsScore = calculateScore(analysisResults.brown_spots, 3);
    const redAreasScore = 100 - (analysisResults.red_areas?.coverage_percentage || 0);
    const porphyrinsScore = calculateScore(analysisResults.porphyrins, 2);

    // Step 5: Save analysis to database
    const { data: analysisData, error: dbError } = await supabase
      .from('skin_analyses')
      .insert({
        user_id: user.id,
        booking_id: bookingId,
        image_url: imageUrl,
        analyzed_at: new Date().toISOString(),
        
        // Scores (will auto-calculate overall_score via trigger)
        spots_score: spotsScore,
        wrinkles_score: wrinklesScore,
        texture_score: textureScore,
        pores_score: poresScore,
        uv_spots_score: uvSpotsScore,
        brown_spots_score: brownSpotsScore,
        red_areas_score: redAreasScore,
        porphyrins_score: porphyrinsScore,
        
        // Counts
        spots_count: analysisResults.spots?.detections?.length || 0,
        wrinkles_count: analysisResults.wrinkles?.detections?.length || 0,
        pores_count: analysisResults.pores?.detections?.length || 0,
        uv_spots_count: analysisResults.uv_spots?.detections?.length || 0,
        brown_spots_count: analysisResults.brown_spots?.detections?.length || 0,
        red_areas_percentage: analysisResults.red_areas?.coverage_percentage || 0,
        porphyrins_count: analysisResults.porphyrins?.detections?.length || 0,
        
        // Severity
        spots_severity: getSeverity(spotsScore),
        wrinkles_severity: getSeverity(wrinklesScore),
        texture_severity: getSeverity(textureScore),
        pores_severity: getSeverity(poresScore),
        uv_spots_severity: getSeverity(uvSpotsScore),
        brown_spots_severity: getSeverity(brownSpotsScore),
        red_areas_severity: getSeverity(redAreasScore),
        porphyrins_severity: getSeverity(porphyrinsScore),
        
        // Detailed results
        spots_detections: analysisResults.spots,
        wrinkles_detections: analysisResults.wrinkles,
        texture_analysis: analysisResults.texture,
        pores_detections: analysisResults.pores,
        uv_spots_detections: analysisResults.uv_spots,
        brown_spots_detections: analysisResults.brown_spots,
        red_areas_analysis: analysisResults.red_areas,
        porphyrins_detections: analysisResults.porphyrins,
        
        // Visualization
        visualization_url: visualizationUrl,
        
        // Metadata
        processing_time_ms: processingTime,
        original_filename: imageFile.name,
        status: 'completed',
        is_baseline: isBaseline,
        notes: notes,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Analysis] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save analysis', details: dbError.message },
        { status: 500 }
      );
    }

    console.log(`[Analysis] Saved to database: ${analysisData.id}`);

    // Step 6: Generate recommendations based on analysis
    const locale = formData.get('locale') as 'th' | 'en' || 'th';
    const recommendations = generateRecommendations(analysisData, locale);

    // Update with recommendations
    await supabase
      .from('skin_analyses')
      .update({ recommendations })
      .eq('id', analysisData.id);

    // Return comprehensive results
    return NextResponse.json({
      success: true,
      rawResults: analysisResults,
      analysis: {
        id: analysisData.id,
        overall_score: analysisData.overall_score,
        skin_health_grade: analysisData.skin_health_grade,
        image_url: imageUrl,
        visualization_url: visualizationUrl,
        scores: {
          spots: spotsScore,
          wrinkles: wrinklesScore,
          texture: textureScore,
          pores: poresScore,
          uv_spots: uvSpotsScore,
          brown_spots: brownSpotsScore,
          red_areas: redAreasScore,
          porphyrins: porphyrinsScore,
        },
        counts: {
          spots: analysisData.spots_count,
          wrinkles: analysisData.wrinkles_count,
          pores: analysisData.pores_count,
          uv_spots: analysisData.uv_spots_count,
          brown_spots: analysisData.brown_spots_count,
          red_areas_percentage: analysisData.red_areas_percentage,
          porphyrins: analysisData.porphyrins_count,
        },
        severity: {
          spots: analysisData.spots_severity,
          wrinkles: analysisData.wrinkles_severity,
          texture: analysisData.texture_severity,
          pores: analysisData.pores_severity,
          uv_spots: analysisData.uv_spots_severity,
          brown_spots: analysisData.brown_spots_severity,
          red_areas: analysisData.red_areas_severity,
          porphyrins: analysisData.porphyrins_severity,
        },
        recommendations,
        processing_time_ms: processingTime,
        analyzed_at: analysisData.analyzed_at,
      },
    });

  } catch (error: any) {
    console.error('[Analysis] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}, { rateLimitCategory: 'ai' })

/**
 * Generate personalized recommendations based on analysis results
 */
function generateRecommendations(analysis: any, locale: 'th' | 'en' = 'th') {
  const isThai = locale === 'th';
  const recommendations: any = {
    programs: [],
    products: [],
    lifestyle: [],
  };

  // Spots recommendations
  if (analysis.spots_severity === 'high' || analysis.spots_severity === 'severe') {
    recommendations.programs.push({
      name: isThai ? 'โปรแกรมเลเซอร์' : 'Laser Program',
      description: isThai ? 'เลเซอร์ IPL หรือ Q-switched เพื่อลดจุดด่างดำ' : 'IPL or Q-switched laser for spot reduction',
      priority: 'high',
    });
    recommendations.products.push({
      category: 'brightening',
      name: isThai ? 'เซรั่มวิตามินซี' : 'Vitamin C Serum',
      description: isThai ? 'ช่วยลดจุดด่างดำและปรับสีผิวให้สม่ำเสมอ' : 'Helps reduce dark spots and even skin tone',
    });
  }

  // Wrinkles recommendations
  if (analysis.wrinkles_severity === 'high' || analysis.wrinkles_severity === 'severe') {
    recommendations.programs.push({
      name: isThai ? 'โบท็อกซ์ หรือ ฟิลเลอร์' : 'Botox or Fillers',
      description: isThai ? 'ลดริ้วรอยจากการแสดงอารมณ์และเติมเต็มร่องลึก' : 'Reduce expression lines and restore volume',
      priority: 'high',
    });
    recommendations.products.push({
      category: 'anti-aging',
      name: isThai ? 'ครีมเรตินอล' : 'Retinol Cream',
      description: isThai ? 'กระตุ้นการสร้างคอลลาเจนและลดเลือนริ้วรอย' : 'Boosts collagen production and reduces fine lines',
    });
  }

  // Texture recommendations
  if (analysis.texture_severity === 'high' || analysis.texture_severity === 'severe') {
    recommendations.programs.push({
      name: isThai ? 'การผลัดเซลล์ผิวด้วยเคมี' : 'Chemical Peel',
      description: isThai ? 'ปรับปรุงเนื้อผิวและส่งเสริมการผลัดเซลล์ผิวใหม่' : 'Improves skin texture and promotes cell renewal',
      priority: 'medium',
    });
    recommendations.products.push({
      category: 'exfoliation',
      name: isThai ? 'ผลิตภัณฑ์ผลัดเซลล์ผิว AHA/BHA' : 'AHA/BHA Exfoliant',
      description: isThai ? 'ขจัดเซลล์ผิวที่ตายแล้วอย่างอ่อนโยนเพื่อผิวที่เรียบเนียนขึ้น' : 'Gently removes dead skin cells for smoother texture',
    });
  }

  // Pores recommendations
  if (analysis.pores_severity === 'high' || analysis.pores_severity === 'severe') {
    recommendations.programs.push({
      name: 'HydraFacial',
      description: isThai ? 'ทำความสะอาดล้ำลึกเพื่อลดการปรากฏของรูขุมขน' : 'Deep cleansing to minimize pore appearance',
      priority: 'medium',
    });
    recommendations.products.push({
      category: 'pore care',
      name: isThai ? 'เซรั่มไนอะซินาไมด์' : 'Niacinamide Serum',
      description: isThai ? 'ช่วยกระชับรูขุมขนและควบคุมการผลิตน้ำมัน' : 'Helps tighten pores and regulate oil production',
    });
  }

  // UV/Brown spots recommendations
  if (analysis.uv_spots_severity === 'high' || analysis.brown_spots_severity === 'high') {
    recommendations.lifestyle.push({
      category: 'sun protection',
      description: isThai ? 'ใช้ครีมกันแดด SPF 50+ ทุกวันและทาซ้ำทุก 2 ชั่วโมง' : 'Use SPF 50+ sunscreen daily and reapply every 2 hours',
      priority: 'critical',
    });
    recommendations.products.push({
      category: 'sun protection',
      name: isThai ? 'ครีมกันแดด Broad Spectrum SPF 50+' : 'Broad Spectrum SPF 50+',
      description: isThai ? 'ป้องกันการเกิดเม็ดสีเพิ่มเติมและปกป้องจากรังสี UV' : 'Prevents further pigmentation and protects from UV damage',
    });
  }

  // Red areas/inflammation recommendations
  if (analysis.red_areas_severity === 'high' || analysis.red_areas_severity === 'severe') {
    recommendations.programs.push({
      name: isThai ? 'การบำบัดด้วยแสง LED' : 'LED Light Therapy',
      description: isThai ? 'ลดการอักเสบและส่งเสริมการสมานแผล' : 'Reduces inflammation and promotes healing',
      priority: 'medium',
    });
    recommendations.products.push({
      category: 'soothing',
      name: isThai ? 'เซรั่มใบบัวบก (Centella Asiatica)' : 'Centella Asiatica Serum',
      description: isThai ? 'ปลอบประโลมการระคายเคืองและลดรอยแดง' : 'Calms irritation and reduces redness',
    });
    recommendations.lifestyle.push({
      category: 'diet',
      description: isThai ? 'หลีกเลี่ยงอาหารรสจัดและแอลกอฮอล์ซึ่งอาจกระตุ้นให้เกิดรอยแดง' : 'Avoid spicy foods and alcohol which can trigger redness',
      priority: 'medium',
    });
  }

  // Porphyrins (bacterial) recommendations
  if (analysis.porphyrins_severity === 'high' || analysis.porphyrins_severity === 'severe') {
    recommendations.programs.push({
      name: isThai ? 'การบำบัดด้วยแสงสีฟ้า' : 'Blue Light Therapy',
      description: isThai ? 'กำจัดแบคทีเรียที่ทำให้เกิดสิว' : 'Kills acne-causing bacteria',
      priority: 'high',
    });
    recommendations.products.push({
      category: 'acne care',
      name: isThai ? 'เบนโซอิลเปอร์ออกไซด์ หรือ กรดซาลิไซลิก' : 'Benzoyl Peroxide or Salicylic Acid',
      description: isThai ? 'โปรแกรมต้านเชื้อแบคทีเรียสำหรับผิวที่เป็นสิวง่าย' : 'Antibacterial program for acne-prone skin',
    });
    recommendations.lifestyle.push({
      category: 'hygiene',
      description: isThai ? 'เปลี่ยนปลอกหมอนเป็นประจำและหลีกเลี่ยงการสัมผัสใบหน้า' : 'Change pillowcases regularly and avoid touching face',
      priority: 'high',
    });
  }

  // General recommendations
  recommendations.lifestyle.push({
    category: 'hydration',
    description: isThai ? 'ดื่มน้ำอย่างน้อย 8 แก้วต่อวัน' : 'Drink at least 8 glasses of water daily',
    priority: 'medium',
  });

  recommendations.lifestyle.push({
    category: 'sleep',
    description: isThai ? 'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงเพื่อการฟื้นฟูผิว' : 'Get 7-8 hours of quality sleep for skin regeneration',
    priority: 'medium',
  });

  return recommendations;
}

// GET method to retrieve analysis by ID
export const GET = withPublicAccess(async (request: NextRequest) => {
  try {
    const AI_SERVICE_URL = getAIServiceUrl();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!analysisId && !userId) {
      return NextResponse.json(
        { error: 'Missing analysis ID or user ID' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('skin_analyses')
      .select('*');

    if (analysisId) {
      query = query.eq('id', analysisId);
    }

    if (user) {
      query = query.eq('user_id', user.id);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    if (!analysisId) {
      query = query.order('analyzed_at', { ascending: false });
    }

    const { data, error } = analysisId ? await query.single() : await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch analysis', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Protect user data when accessing without authentication
    if (!user && userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error('[Analysis GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}, { rateLimitCategory: 'api' });
