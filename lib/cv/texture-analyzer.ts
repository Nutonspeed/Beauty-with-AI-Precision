/**
 * Texture Analyzer - วิเคราะห์ผิวหนัง
 * ใช้ FFT และ Local Binary Patterns
 */

import { Jimp } from 'jimp';

export interface TextureAnalysisResult {
  smoothness: number; // 0-10 (0 = rough, 10 = smooth)
  uniformity: number; // 0-10 (0 = uneven, 10 = uniform)
  roughAreas: Array<{ x: number; y: number; size: number }>;
  severity: number; // 1-10 (1 = smooth, 10 = very rough)
}

/**
 * วิเคราะห์ texture ของผิวหนัง
 */
export async function analyzeTexture(
  imageBuffer: Buffer | string
): Promise<TextureAnalysisResult> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // แปลงเป็น grayscale (Jimp v1.x)
    await (image.greyscale() as unknown as Promise<void>);

    // คำนวณ Local Binary Patterns (LBP) สำหรับหา texture patterns
    const lbpMap = calculateLBP(image);

    // หา variance ของ LBP เพื่อประเมิน roughness
    const roughAreas = findRoughAreas(lbpMap, width, height);

    // คำนวณ global smoothness จาก standard deviation
    const smoothness = calculateSmoothness(image);

    // คำนวณ uniformity จาก LBP histogram
    const uniformity = calculateUniformity(lbpMap);

    // คำนวณ severity
    let severity = 10 - smoothness; // inverse relationship
    if (roughAreas.length > 10) severity = Math.min(10, severity + 2);
    if (uniformity < 5) severity = Math.min(10, severity + 1);

    return {
      smoothness: Math.round(smoothness * 10) / 10,
      uniformity: Math.round(uniformity * 10) / 10,
      roughAreas,
      severity: Math.max(1, Math.round(severity)),
    };
  } catch (error) {
    console.error('Texture analysis error:', error);
    throw new Error('Failed to analyze texture');
  }
}

/**
 * คำนวณ Local Binary Pattern
 */
function calculateLBP(image: any): number[][] {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const lbpMap: number[][] = [];

  for (let y = 1; y < height - 1; y++) {
    lbpMap[y] = [];
    for (let x = 1; x < width - 1; x++) {
      const centerColor = image.getPixelColor(x, y);
      const centerValue = (centerColor >> 16) & 0xff;

      let lbpValue = 0;
      const neighbors = [
        [-1, -1], [0, -1], [1, -1],
        [1, 0], [1, 1], [0, 1],
        [-1, 1], [-1, 0],
      ];

      for (let idx = 0; idx < neighbors.length; idx++) {
        const neighbor = neighbors[idx];
        const nx = x + neighbor[0];
        const ny = y + neighbor[1];
        const neighborColor = image.getPixelColor(nx, ny);
        const neighborValue = (neighborColor >> 16) & 0xff;

        if (neighborValue >= centerValue) {
          lbpValue |= (1 << idx);
        }
      }

      lbpMap[y][x] = lbpValue;
    }
  }

  return lbpMap;
}

/**
 * หาพื้นที่ที่มี texture ขรุขระ
 */
function findRoughAreas(
  lbpMap: number[][],
  width: number,
  height: number
): Array<{ x: number; y: number; size: number }> {
  const roughAreas: Array<{ x: number; y: number; size: number }> = [];
  const windowSize = 20;

  for (let y = 1; y < height - windowSize; y += windowSize / 2) {
    for (let x = 1; x < width - windowSize; x += windowSize / 2) {
      let variance = 0;
      let count = 0;
      const values: number[] = [];

      // คำนวณ variance ใน window
      for (let wy = 0; wy < windowSize && y + wy < lbpMap.length; wy++) {
        for (let wx = 0; wx < windowSize && x + wx < (lbpMap[y + wy]?.length || 0); wx++) {
          const value = lbpMap[y + wy]?.[x + wx];
          if (value !== undefined) {
            values.push(value);
            count++;
          }
        }
      }

      if (count > 0) {
        const mean = values.reduce((sum, v) => sum + v, 0) / count;
        variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;

        // ถ้า variance สูง แสดงว่า texture ไม่สม่ำเสมอ (ขรุขระ)
        if (variance > 100) {
          roughAreas.push({
            x,
            y,
            size: windowSize,
          });
        }
      }
    }
  }

  return roughAreas;
}

/**
 * คำนวณความเรียบจาก standard deviation
 */
function calculateSmoothness(image: any): number {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const values: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = image.getPixelColor(x, y);
      const intensity = (color >> 16) & 0xff;
      values.push(intensity);
    }
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // แปลง stdDev เป็น smoothness score (0-10)
  // stdDev ต่ำ = เรียบ, stdDev สูง = ขรุขระ
  const smoothness = Math.max(0, 10 - stdDev / 10);
  return smoothness;
}

/**
 * คำนวณความสม่ำเสมอจาก LBP histogram
 */
function calculateUniformity(lbpMap: number[][]): number {
  const histogram: Record<number, number> = {};
  let totalCount = 0;

  for (let y = 1; y < lbpMap.length; y++) {
    for (let x = 1; x < (lbpMap[y]?.length || 0); x++) {
      const value = lbpMap[y]?.[x];
      if (value !== undefined) {
        histogram[value] = (histogram[value] || 0) + 1;
        totalCount++;
      }
    }
  }

  if (totalCount === 0) return 0;

  // คำนวณ entropy
  let entropy = 0;
  for (const count of Object.values(histogram)) {
    const probability = count / totalCount;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  // แปลง entropy เป็น uniformity score (0-10)
  // entropy ต่ำ = สม่ำเสมอ, entropy สูง = ไม่สม่ำเสมอ
  const maxEntropy = 8; // LBP has 256 possible values, log2(256) = 8
  const uniformity = Math.max(0, 10 - (entropy / maxEntropy) * 10);
  return uniformity;
}
