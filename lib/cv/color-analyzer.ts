/**
 * Color Analyzer - วิเคราะห์สีผิวและความไม่สม่ำเสมอ
 * ใช้ HSV Color Space และ Histogram Analysis
 */

import { Jimp } from 'jimp';

type JimpInstance = any; // Using any to bypass Jimp type conflicts

export interface ColorAnalysisResult {
  dominantTone: 'fair' | 'medium' | 'olive' | 'tan' | 'dark';
  pigmentation: {
    darkSpots: number; // count
    hyperpigmentation: number; // count
    hypopigmentation: number; // count
  };
  evenness: number; // 0-10 (0 = uneven, 10 = very even)
  severity: number; // 1-10
}

/**
 * วิเคราะห์สีผิวและความไม่สม่ำเสมอ
 */
export async function analyzeColor(
  imageBuffer: Buffer | string
): Promise<ColorAnalysisResult> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // แยกเฉดสีผิว
    const dominantTone = determineDominantTone(image);

    // หา pigmentation issues
    const pigmentation = analyzePigmentation(image);

    // คำนวณความสม่ำเสมอของสีผิว
    const evenness = calculateColorEvenness(image);

    // คำนวณ severity
    const totalIssues =
      pigmentation.darkSpots +
      pigmentation.hyperpigmentation +
      pigmentation.hypopigmentation;

    let severity = 1;
    if (totalIssues > 5) severity = Math.min(10, Math.floor(totalIssues / 2));
    if (evenness < 5) severity = Math.min(10, severity + 2);

    return {
      dominantTone,
      pigmentation,
      evenness: Math.round(evenness * 10) / 10,
      severity,
    };
  } catch (error) {
    console.error('Color analysis error:', error);
    throw new Error('Failed to analyze color');
  }
}

/**
 * กำหนดเฉดสีผิวหลัก
 */
function determineDominantTone(
  image: JimpInstance
): 'fair' | 'medium' | 'olive' | 'tan' | 'dark' {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  let totalLightness = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;

      // แปลงเป็น HSV
      const hsv = rgbToHsv(r, g, b);
      totalLightness += hsv.v;
      count++;
    }
  }

  const avgLightness = totalLightness / count;

  // แบ่งเฉดสีตาม value (brightness)
  if (avgLightness > 0.8) return 'fair';
  if (avgLightness > 0.6) return 'medium';
  if (avgLightness > 0.4) return 'olive';
  if (avgLightness > 0.2) return 'tan';
  return 'dark';
}

/**
 * วิเคราะห์ pigmentation issues
 */
function analyzePigmentation(image: JimpInstance): {
  darkSpots: number;
  hyperpigmentation: number;
  hypopigmentation: number;
} {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // คำนวณ average brightness
  let totalBrightness = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      count++;
    }
  }

  const avgBrightness = totalBrightness / count;

  // หาจุดที่มี pigmentation ผิดปกติ
  let darkSpots = 0;
  let hyperpigmentation = 0;
  let hypopigmentation = 0;

  const windowSize = 10;

  for (let y = 0; y < height - windowSize; y += windowSize / 2) {
    for (let x = 0; x < width - windowSize; x += windowSize / 2) {
      let windowBrightness = 0;
      let windowCount = 0;

      for (let wy = 0; wy < windowSize; wy++) {
        for (let wx = 0; wx < windowSize; wx++) {
          const color = image.getPixelColor(x + wx, y + wy);
          const r = (color >> 24) & 0xff;
          const g = (color >> 16) & 0xff;
          const b = (color >> 8) & 0xff;
          const brightness = (r + g + b) / 3;
          windowBrightness += brightness;
          windowCount++;
        }
      }

      const avgWindowBrightness = windowBrightness / windowCount;
      const diff = Math.abs(avgWindowBrightness - avgBrightness);

      // จุดมืดกว่าปกติมาก
      if (avgWindowBrightness < avgBrightness - 30) {
        darkSpots++;
      }
      // Hyperpigmentation (มืดกว่าเล็กน้อย)
      else if (avgWindowBrightness < avgBrightness - 15) {
        hyperpigmentation++;
      }
      // Hypopigmentation (สว่างกว่า)
      else if (avgWindowBrightness > avgBrightness + 15) {
        hypopigmentation++;
      }
    }
  }

  return {
    darkSpots,
    hyperpigmentation,
    hypopigmentation,
  };
}

/**
 * คำนวณความสม่ำเสมอของสีผิว
 */
function calculateColorEvenness(image: JimpInstance): number {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const values: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;
      const brightness = (r + g + b) / 3;
      values.push(brightness);
    }
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // แปลง stdDev เป็น evenness score (0-10)
  // stdDev ต่ำ = สม่ำเสมอ, stdDev สูง = ไม่สม่ำเสมอ
  const evenness = Math.max(0, 10 - stdDev / 10);
  return evenness;
}

/**
 * แปลง RGB เป็น HSV
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, v };
}
