/**
 * Google Cloud Vision API - Skin Analysis
 * ใช้เครดิต Google Cloud ที่มีอยู่ ฿9,665
 */

import vision from '@google-cloud/vision';
import path from 'path';

// Initialize Vision API client with credentials
const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
const client = new vision.ImageAnnotatorClient({
  keyFilename: credentialsPath,
});

export interface VisionSkinAnalysis {
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  concerns: Array<'acne' | 'wrinkles' | 'dark_spots' | 'large_pores' | 'redness' | 'dullness'>;
  severity: {
    acne?: number;
    wrinkles?: number;
    dark_spots?: number;
    large_pores?: number;
    redness?: number;
    dullness?: number;
  };
  recommendations: Array<{
    category: string;
    product: string;
    reason: string;
  }>;
  treatmentPlan?: string;
  confidence: number;
}

/**
 * วิเคราะห์ผิวหน้าด้วย Google Vision API
 */
export async function analyzeSkinWithVision(
  imageBuffer: Buffer | string
): Promise<VisionSkinAnalysis> {
  try {
    console.log('🔍 Analyzing skin with Google Vision API...');

    // Convert to Buffer if needed
    let buffer: Buffer;
    if (Buffer.isBuffer(imageBuffer)) {
      buffer = imageBuffer;
    } else if (typeof imageBuffer === 'string' && imageBuffer.startsWith('http')) {
      const response = await fetch(imageBuffer);
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      buffer = Buffer.from(imageBuffer, 'base64');
    }

    // Run multiple Vision API detections in parallel
    const [faceDetection, labelDetection, imageProperties] = await Promise.all([
      client.faceDetection(buffer),
      client.labelDetection(buffer),
      client.imageProperties(buffer),
    ]);

    // Extract results
    const faces = faceDetection[0].faceAnnotations || [];
    const labels = labelDetection[0].labelAnnotations || [];
    const colors = imageProperties[0].imagePropertiesAnnotation?.dominantColors?.colors || [];

    console.log('Vision API Results:', {
      facesDetected: faces.length,
      labelsFound: labels.length,
      dominantColors: colors.length,
    });

    // Analyze face features
    const face = faces[0];
    if (!face) {
      throw new Error('No face detected in image');
    }

    // Analyze skin based on Vision API data
    const analysis = analyzeFaceFeatures(face, labels, colors);

    return analysis;
  } catch (error) {
    console.error('Vision API analysis error:', error);
    throw new Error('Failed to analyze skin with Vision API');
  }
}

/**
 * วิเคราะห์ลักษณะใบหน้าจาก Vision API results
 */
function analyzeFaceFeatures(
  face: any,
  labels: any[],
  colors: any[]
): VisionSkinAnalysis {
  // Extract face detection confidence
  const confidence = face.detectionConfidence || 0.85;

  // Analyze skin tone from dominant colors
  const avgRed = colors.reduce((sum, c) => sum + (c.color?.red || 0), 0) / colors.length;
  const avgGreen = colors.reduce((sum, c) => sum + (c.color?.green || 0), 0) / colors.length;
  const avgBlue = colors.reduce((sum, c) => sum + (c.color?.blue || 0), 0) / colors.length;

  // Determine skin type based on color analysis
  const brightness = (avgRed + avgGreen + avgBlue) / 3;
  const redness = avgRed - (avgGreen + avgBlue) / 2;

  let skinType: VisionSkinAnalysis['skinType'] = 'normal';
  const concerns: VisionSkinAnalysis['concerns'] = [];
  const severity: VisionSkinAnalysis['severity'] = {};

  // Analyze based on brightness and color
  if (brightness > 180) {
    skinType = 'dry';
    concerns.push('dullness');
    severity.dullness = 4;
  } else if (brightness < 120) {
    skinType = 'oily';
    concerns.push('large_pores');
    severity.large_pores = 5;
  } else {
    skinType = 'combination';
  }

  // Check for redness
  if (redness > 20) {
    concerns.push('redness');
    severity.redness = Math.min(10, Math.round(redness / 5));
  }

  // Analyze labels for skin concerns
  const labelNames = labels.map(l => l.description?.toLowerCase() || '');
  
  if (labelNames.some(l => l.includes('acne') || l.includes('blemish'))) {
    concerns.push('acne');
    severity.acne = 6;
  }

  if (labelNames.some(l => l.includes('wrinkle') || l.includes('aging'))) {
    concerns.push('wrinkles');
    severity.wrinkles = 5;
  }

  if (labelNames.some(l => l.includes('spot') || l.includes('pigment'))) {
    concerns.push('dark_spots');
    severity.dark_spots = 4;
  }

  // Generate recommendations
  const recommendations = generateRecommendations(skinType, concerns);

  return {
    skinType,
    concerns: concerns.length > 0 ? concerns : ['dullness'],
    severity,
    recommendations,
    treatmentPlan: `Recommended treatments for ${skinType} skin with ${concerns.join(', ')}`,
    confidence: Number(confidence.toFixed(2)),
  };
}

/**
 * สร้างคำแนะนำตามประเภทผิวและปัญหา
 */
function generateRecommendations(
  skinType: string,
  concerns: string[]
): Array<{ category: string; product: string; reason: string }> {
  const recommendations = [];

  // Base recommendations by skin type
  if (skinType === 'oily') {
    recommendations.push({
      category: 'Cleanser',
      product: 'Salicylic Acid Cleanser',
      reason: 'Controls oil and prevents breakouts',
    });
  } else if (skinType === 'dry') {
    recommendations.push({
      category: 'Moisturizer',
      product: 'Hyaluronic Acid Cream',
      reason: 'Intense hydration for dry skin',
    });
  }

  // Add concern-specific recommendations
  if (concerns.includes('acne')) {
    recommendations.push({
      category: 'Treatment',
      product: 'Benzoyl Peroxide Gel',
      reason: 'Treats acne and prevents new breakouts',
    });
  }

  if (concerns.includes('wrinkles')) {
    recommendations.push({
      category: 'Anti-Aging',
      product: 'Retinol Serum',
      reason: 'Reduces fine lines and wrinkles',
    });
  }

  if (concerns.includes('dark_spots')) {
    recommendations.push({
      category: 'Brightening',
      product: 'Vitamin C Serum',
      reason: 'Fades dark spots and evens skin tone',
    });
  }

  if (concerns.includes('redness')) {
    recommendations.push({
      category: 'Calming',
      product: 'Centella Asiatica Cream',
      reason: 'Soothes redness and inflammation',
    });
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
