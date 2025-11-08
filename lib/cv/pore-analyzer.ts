/**
 * Pore Analyzer - วิเคราะห์รูขุมขน
 * ใช้ Edge Detection และ Circular Pattern Detection
 */

import { Jimp } from 'jimp';

type JimpType = any; // Using any to bypass Jimp type conflicts

/**
 * Helper functions for Jimp v1.x color conversion
 */
function intToRGBA(num: number) {
  return {
    r: (num >> 24) & 0xff,
    g: (num >> 16) & 0xff,
    b: (num >> 8) & 0xff,
    a: num & 0xff,
  };
}

function rgbaToInt(r: number, g: number, b: number, a: number) {
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
}

export interface PoreAnalysisResult {
  averageSize: number;
  enlargedCount: number;
  severity: number; // 1-10
  distribution: {
    tZone: number; // จำนวนรูขุมขนในโซน T (หน้าผาก, จมูก, คาง)
    cheeks: number; // จำนวนรูขุมขนบริเวณแก้ม
  };
}

/**
 * วิเคราะห์รูขุมขน
 */
export async function analyzePores(
  imageBuffer: Buffer | string,
  faceRegions?: {
    tZone: { x: number; y: number; width: number; height: number };
    leftCheek: { x: number; y: number; width: number; height: number };
    rightCheek: { x: number; y: number; width: number; height: number };
  }
): Promise<PoreAnalysisResult> {
  try {
    const image = await Jimp.read(imageBuffer);

    // แปลงเป็น grayscale (Jimp v1.x)
    await (image.greyscale() as unknown as Promise<void>);

    // ใช้ edge detection (Sobel filter)
    const edges = await detectEdges(image);

    // หา circular patterns (รูขุมขน)
    const pores = detectCircularPatterns(edges);

    // คำนวณขนาดเฉลี่ย
    const totalSize = pores.reduce((sum, pore) => sum + pore.radius, 0);
    const averageSize = pores.length > 0 ? totalSize / pores.length : 0;

    // นับรูขุมขนที่ใหญ่กว่าปกติ (> ค่าเฉลี่ย * 1.5)
    const enlargedThreshold = averageSize * 1.5;
    const enlargedCount = pores.filter((p) => p.radius > enlargedThreshold).length;

    // คำนวณ distribution ถ้ามี face regions
    let distribution = { tZone: 0, cheeks: 0 };
    if (faceRegions) {
      distribution = calculateDistribution(pores, faceRegions);
    }

    // คำนวณ severity
    // ปัจจัย: จำนวนรูขุมขน, ขนาดเฉลี่ย, จำนวนรูขุมขนกว้าง
    const poreCount = pores.length;
    const imageDimension = Math.sqrt(image.bitmap.width * image.bitmap.height);
    const poreDensity = poreCount / (imageDimension / 100); // รูขุมขนต่อ 100x100 pixels

    const enlargedRatio = pores.length > 0 ? enlargedCount / pores.length : 0;

    // Severity scoring
    let severity = 1;
    if (poreDensity > 10) severity = Math.min(10, Math.floor(poreDensity / 2));
    if (enlargedRatio > 0.3) severity = Math.min(10, severity + 2);
    if (averageSize > 5) severity = Math.min(10, severity + 2);

    return {
      averageSize,
      enlargedCount,
      severity,
      distribution,
    };
  } catch (error) {
    console.error('Pore analysis error:', error);
    throw new Error('Failed to analyze pores');
  }
}

/**
 * Detect edges ด้วย Sobel operator
 */
async function detectEdges(image: JimpType): Promise<JimpType> {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const edgeImage = image.clone();

  // Sobel kernels
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      // Apply Sobel kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = intToRGBA(image.getPixelColor(x + kx, y + ky));
          const intensity = pixel.r; // grayscale

          gx += intensity * sobelX[ky + 1][kx + 1];
          gy += intensity * sobelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const normalized = Math.min(255, magnitude);

      const color = rgbaToInt(normalized, normalized, normalized, 255);
      edgeImage.setPixelColor(color, x, y);
    }
  }

  return edgeImage;
}

/**
 * ตรวจจับ circular patterns (รูขุมขน)
 */
function detectCircularPatterns(
  edgeImage: JimpType
): Array<{ x: number; y: number; radius: number }> {
  const width = edgeImage.bitmap.width;
  const height = edgeImage.bitmap.height;
  const pores: Array<{ x: number; y: number; radius: number }> = [];

  const minRadius = 2;
  const maxRadius = 10;
  const threshold = 150;

  // Hough Circle Transform (simplified)
  for (let y = maxRadius; y < height - maxRadius; y += 3) {
    for (let x = maxRadius; x < width - maxRadius; x += 3) {
      const pixel = intToRGBA(edgeImage.getPixelColor(x, y));
      if (pixel.r < threshold) continue;

      // ลองหาวงกลมที่เป็นไปได้
      for (let r = minRadius; r <= maxRadius; r++) {
        let circleScore = 0;
        const samples = 8;

        for (let i = 0; i < samples; i++) {
          const angle = (i * 2 * Math.PI) / samples;
          const px = Math.round(x + r * Math.cos(angle));
          const py = Math.round(y + r * Math.sin(angle));

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const edgePixel = intToRGBA(edgeImage.getPixelColor(px, py));
            if (edgePixel.r > threshold) {
              circleScore++;
            }
          }
        }

        // ถ้าเจอ edge ครบตามวงกลม (> 60%)
        if (circleScore > samples * 0.6) {
          pores.push({ x, y, radius: r });
          break;
        }
      }
    }
  }

  return pores;
}

/**
 * คำนวณการกระจายของรูขุมขน
 */
function calculateDistribution(
  pores: Array<{ x: number; y: number; radius: number }>,
  regions: {
    tZone: { x: number; y: number; width: number; height: number };
    leftCheek: { x: number; y: number; width: number; height: number };
    rightCheek: { x: number; y: number; width: number; height: number };
  }
): { tZone: number; cheeks: number } {
  let tZoneCount = 0;
  let cheeksCount = 0;

  for (const pore of pores) {
    // Check if in T-zone
    if (
      pore.x >= regions.tZone.x &&
      pore.x <= regions.tZone.x + regions.tZone.width &&
      pore.y >= regions.tZone.y &&
      pore.y <= regions.tZone.y + regions.tZone.height
    ) {
      tZoneCount++;
      continue;
    }

    // Check if in cheeks
    if (
      (pore.x >= regions.leftCheek.x &&
        pore.x <= regions.leftCheek.x + regions.leftCheek.width &&
        pore.y >= regions.leftCheek.y &&
        pore.y <= regions.leftCheek.y + regions.leftCheek.height) ||
      (pore.x >= regions.rightCheek.x &&
        pore.x <= regions.rightCheek.x + regions.rightCheek.width &&
        pore.y >= regions.rightCheek.y &&
        pore.y <= regions.rightCheek.y + regions.rightCheek.height)
    ) {
      cheeksCount++;
    }
  }

  return {
    tZone: tZoneCount,
    cheeks: cheeksCount,
  };
}
