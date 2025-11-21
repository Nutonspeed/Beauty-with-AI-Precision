/**
 * RBX Color Separation Algorithm - Task 5
 * แยกสีแบบ VISIA RBX® ใช้ HSV + LAB color space
 * แยก Red Areas (รอยแดง/เส้นเลือดฝอย) กับ Brown Spots (จุดด่างดำ/ฝ้า/กระ)
 */

// ===================== Types =====================

export type Distribution = 'none' | 'localized' | 'scattered' | 'widespread';

export interface RBXColorResult {
  redAreas: {
    score: number; // 0-100: 0 = ไม่มี, 100 = มากที่สุด
    coverage: number; // % พื้นที่ผิวที่เป็นรอยแดง
    intensity: number; // 0-100: ความเข้มของสีแดง
    distribution: Distribution;
    confidence: number; // 0-1
  };
  brownSpots: {
    score: number; // 0-100: 0 = ไม่มี, 100 = มากที่สุด
    coverage: number; // % พื้นที่ผิวที่มีจุดด่างดำ
    intensity: number; // 0-100: ความเข้มของสีน้ำตาล
    distribution: Distribution;
    confidence: number; // 0-1
  };
  uvSpots: {
    score: number; // 0-100: UV damage prediction
    coverage: number; // % พื้นที่ที่อาจมี UV damage
    confidence: number; // 0-1
  };
  processingTime: number; // milliseconds
}

interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface LABColor {
  l: number; // 0-100 (Lightness)
  a: number; // -128 to 127 (Green to Red)
  b: number; // -128 to 127 (Blue to Yellow)
}



interface ColorClassification {
  isRed: boolean;
  isBrown: boolean;
  isUV: boolean;
  redIntensity: number;
  brownIntensity: number;
  uvIntensity: number;
}

// ===================== Color Space Conversions =====================

/**
 * แปลง RGB → HSV
 * H (Hue): 0-360°, S (Saturation): 0-100%, V (Value): 0-100%
 */
export function rgbToHSV(r: number, g: number, b: number): HSVColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    if (h < 0) h += 360;
  }

  return { h, s, v };
}

/**
 * แปลง RGB → LAB (D65 illuminant)
 * L: 0-100 (ความสว่าง), a: -128 to 127 (เขียว-แดง), b: -128 to 127 (น้ำเงิน-เหลือง)
 */
export function rgbToLAB(r: number, g: number, b: number): LABColor {
  // RGB → XYZ
  r /= 255;
  g /= 255;
  b /= 255;

  // Gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  // Observer = 2°, Illuminant = D65
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  // XYZ → LAB
  x /= 95.047; // D65 white point
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const bValue = 200 * (y - z);

  return { l, a, b: bValue };
}

// ===================== VISIA RBX® Color Classification =====================

/**
 * แยกสีตามมาตรฐาน VISIA RBX®
 * Red Areas: รอยแดง/เส้นเลือดฝอย (H: 0-20° + 340-360°, S: 20-100%, V: 30-90%)
 * Brown Spots: จุดด่างดำ/ฝ้า/กระ (H: 20-40°, S: 15-80%, V: 20-70%, LAB a*: 10-30, b*: 15-40)
 * UV Spots: UV damage (LAB L*: 40-80, a*: -5 to 15, b*: 10-35)
 */
export function classifyPixelColor(r: number, g: number, b: number): ColorClassification {
  const hsv = rgbToHSV(r, g, b);
  const lab = rgbToLAB(r, g, b);

  // Red Areas Detection (VISIA RBX®)
  const isRedHue = (hsv.h >= 0 && hsv.h <= 20) || (hsv.h >= 340 && hsv.h <= 360);
  const isRedSaturation = hsv.s >= 20 && hsv.s <= 100;
  const isRedValue = hsv.v >= 30 && hsv.v <= 90;
  const isRedLAB = lab.a > 10; // Positive a* indicates redness

  const isRed = isRedHue && isRedSaturation && isRedValue && isRedLAB;
  const redIntensity = isRed ? (hsv.s * 0.6 + lab.a * 2.5) / 100 : 0; // 0-1

  // Brown Spots Detection (VISIA RBX®)
  const isBrownHue = hsv.h >= 20 && hsv.h <= 40;
  const isBrownSaturation = hsv.s >= 15 && hsv.s <= 80;
  const isBrownValue = hsv.v >= 20 && hsv.v <= 70;
  const isBrownLAB = lab.a >= 10 && lab.a <= 30 && lab.b >= 15 && lab.b <= 40;

  const isBrown = isBrownHue && isBrownSaturation && isBrownValue && isBrownLAB;
  const brownIntensity = isBrown ? ((hsv.s + lab.a + lab.b) / 3) / 100 : 0; // 0-1

  // UV Spots Detection (subtle damage)
  const isUVLightness = lab.l >= 40 && lab.l <= 80;
  const isUVChroma = lab.a >= -5 && lab.a <= 15 && lab.b >= 10 && lab.b <= 35;
  const isUVLowSaturation = hsv.s < 30; // UV spots มักไม่เข้มมาก

  const isUV = isUVLightness && isUVChroma && isUVLowSaturation && !isRed && !isBrown;
  const uvIntensity = isUV ? ((lab.b + 128) / 255) * 0.5 : 0; // 0-0.5

  return {
    isRed,
    isBrown,
    isUV,
    redIntensity: Math.max(0, Math.min(1, redIntensity)),
    brownIntensity: Math.max(0, Math.min(1, brownIntensity)),
    uvIntensity: Math.max(0, Math.min(1, uvIntensity)),
  };
}

// ===================== Image Analysis =====================

/**
 * วิเคราะห์ภาพด้วย RBX Color Separation
 */
export async function analyzeRBXColors(imageData: ImageData): Promise<RBXColorResult> {
  const startTime = performance.now();

  const pixels = imageData.data;
  const totalPixels = imageData.width * imageData.height;

  let redPixelCount = 0;
  let brownPixelCount = 0;
  let uvPixelCount = 0;

  let totalRedIntensity = 0;
  let totalBrownIntensity = 0;
  let totalUVIntensity = 0;

  // Scan all pixels
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    const classification = classifyPixelColor(r, g, b);

    if (classification.isRed) {
      redPixelCount++;
      totalRedIntensity += classification.redIntensity;
    }

    if (classification.isBrown) {
      brownPixelCount++;
      totalBrownIntensity += classification.brownIntensity;
    }

    if (classification.isUV) {
      uvPixelCount++;
      totalUVIntensity += classification.uvIntensity;
    }
  }

  // Calculate coverage
  const redCoverage = (redPixelCount / totalPixels) * 100;
  const brownCoverage = (brownPixelCount / totalPixels) * 100;
  const uvCoverage = (uvPixelCount / totalPixels) * 100;

  // Calculate average intensity
  const redIntensity = redPixelCount > 0 ? (totalRedIntensity / redPixelCount) * 100 : 0;
  const brownIntensity = brownPixelCount > 0 ? (totalBrownIntensity / brownPixelCount) * 100 : 0;
  const uvIntensity = uvPixelCount > 0 ? (totalUVIntensity / uvPixelCount) * 100 : 0;

  // Calculate scores (VISIA-like: coverage × intensity)
  const redScore = Math.min(100, redCoverage * 0.5 + redIntensity * 0.5);
  const brownScore = Math.min(100, brownCoverage * 0.5 + brownIntensity * 0.5);
  const uvScore = Math.min(100, uvCoverage * 0.7 + uvIntensity * 0.3);

  // Distribution classification
  const getDistribution = (coverage: number): Distribution => {
    if (coverage < 1) return 'none';
    if (coverage < 5) return 'localized';
    if (coverage < 15) return 'scattered';
    return 'widespread';
  };

  // Confidence based on sample size
  const getConfidence = (pixelCount: number): number => {
    if (pixelCount === 0) return 0;
    if (pixelCount < 100) return 0.6;
    if (pixelCount < 500) return 0.8;
    return 0.95;
  };

  const processingTime = performance.now() - startTime;

  return {
    redAreas: {
      score: Math.round(redScore * 10) / 10,
      coverage: Math.round(redCoverage * 100) / 100,
      intensity: Math.round(redIntensity * 10) / 10,
      distribution: getDistribution(redCoverage),
      confidence: getConfidence(redPixelCount),
    },
    brownSpots: {
      score: Math.round(brownScore * 10) / 10,
      coverage: Math.round(brownCoverage * 100) / 100,
      intensity: Math.round(brownIntensity * 10) / 10,
      distribution: getDistribution(brownCoverage),
      confidence: getConfidence(brownPixelCount),
    },
    uvSpots: {
      score: Math.round(uvScore * 10) / 10,
      coverage: Math.round(uvCoverage * 100) / 100,
      confidence: getConfidence(uvPixelCount),
    },
    processingTime: Math.round(processingTime * 10) / 10,
  };
}

// ===================== Utility Functions =====================

/**
 * สร้าง visualization canvas สำหรับ Red/Brown/UV separation
 */
export function createRBXVisualization(
  imageData: ImageData,
  mode: 'red' | 'brown' | 'uv' | 'all'
): ImageData {
  const result = new ImageData(imageData.width, imageData.height);
  const pixels = imageData.data;
  const resultPixels = result.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128) {
      resultPixels[i + 3] = 0;
      continue;
    }

    const classification = classifyPixelColor(r, g, b);

    switch (mode) {
      case 'red':
        if (classification.isRed) {
          resultPixels[i] = 255; // R
          resultPixels[i + 1] = 0; // G
          resultPixels[i + 2] = 0; // B
          resultPixels[i + 3] = 255; // A
        } else {
          resultPixels[i + 3] = 0;
        }
        break;

      case 'brown':
        if (classification.isBrown) {
          resultPixels[i] = 139; // R
          resultPixels[i + 1] = 69; // G
          resultPixels[i + 2] = 19; // B
          resultPixels[i + 3] = 255; // A
        } else {
          resultPixels[i + 3] = 0;
        }
        break;

      case 'uv':
        if (classification.isUV) {
          resultPixels[i] = 255; // R
          resultPixels[i + 1] = 255; // G
          resultPixels[i + 2] = 0; // B
          resultPixels[i + 3] = 255; // A
        } else {
          resultPixels[i + 3] = 0;
        }
        break;

      case 'all':
        if (classification.isRed) {
          resultPixels[i] = 255;
          resultPixels[i + 1] = 0;
          resultPixels[i + 2] = 0;
          resultPixels[i + 3] = 255;
        } else if (classification.isBrown) {
          resultPixels[i] = 139;
          resultPixels[i + 1] = 69;
          resultPixels[i + 2] = 19;
          resultPixels[i + 3] = 255;
        } else if (classification.isUV) {
          resultPixels[i] = 255;
          resultPixels[i + 1] = 255;
          resultPixels[i + 2] = 0;
          resultPixels[i + 3] = 255;
        } else {
          resultPixels[i + 3] = 0;
        }
        break;
    }
  }

  return result;
}

/**
 * แปลง score เป็นคำอธิบายภาษาไทย
 */
export function getRBXScoreDescription(score: number, type: 'red' | 'brown' | 'uv'): string {
  const descriptions: Record<string, Record<string, string>> = {
    red: {
      none: 'ไม่พบรอยแดงหรือเส้นเลือดฝอย',
      low: 'พบรอยแดงเล็กน้อย อาจเป็นจากการระคายเคือง',
      moderate: 'มีรอยแดงปานกลาง อาจต้องดูแลเรื่องการอักเสบ',
      high: 'มีรอยแดงมาก ควรปรึกษาผู้เชี่ยวชาญ',
      severe: 'มีรอยแดงรุนแรง แนะนำให้พบแพทย์',
    },
    brown: {
      none: 'ไม่พบจุดด่างดำหรือฝ้ากระ',
      low: 'พบจุดด่างดำเล็กน้อย ยังอยู่ในเกณฑ์ปกติ',
      moderate: 'มีจุดด่างดำปานกลาง อาจต้องใช้ครีมบำรุง',
      high: 'มีจุดด่างดำมาก ควรใช้ผลิตภัณฑ์เฉพาะ',
      severe: 'มีจุดด่างดำรุนแรง แนะนำให้ปรึกษาผู้เชี่ยวชาญ',
    },
    uv: {
      none: 'ไม่พบความเสียหายจาก UV',
      low: 'พบความเสียหายจาก UV เล็กน้อย',
      moderate: 'มีความเสียหายจาก UV ปานกลาง ควรทากันแดด',
      high: 'มีความเสียหายจาก UV มาก ควรป้องกันแสงแดด',
      severe: 'มีความเสียหายจาก UV รุนแรง ควรพบแพทย์',
    },
  };

  let severity: string;
  if (score < 10) severity = 'none';
  else if (score < 30) severity = 'low';
  else if (score < 50) severity = 'moderate';
  else if (score < 70) severity = 'high';
  else severity = 'severe';

  return descriptions[type][severity];
}
