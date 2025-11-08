/**
 * Redness Detector - ตรวจจับความแดงและการอักเสบ
 * ใช้ Red Channel Analysis และ Color Threshold
 */

import { Jimp } from 'jimp';

export interface RednessDetectionResult {
  count: number; // จำนวนพื้นที่ที่แดง
  locations: Array<{ x: number; y: number; size: number; intensity: number }>;
  totalArea: number; // pixel count
  coverage: number; // percentage
  severity: number; // 1-10
  types: {
    inflammation: number; // แดงเข้ม
    irritation: number; // แดงอ่อน
    vascular: number; // เส้นเลือดฝอย
  };
}

/**
 * ตรวจจับความแดงและการอักเสบบนใบหน้า
 */
export async function detectRedness(
  imageBuffer: Buffer | string
): Promise<RednessDetectionResult> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // หาพื้นที่ที่มีสีแดง
    const rednessMap = createRednessMap(image);

    // ค้นหา connected components (red regions)
    const redRegions = findRedRegions(rednessMap);

    // จำแนกประเภท
    const types = classifyRednessTypes(redRegions);

    // คำนวณ total area และ coverage
    const totalArea = redRegions.reduce((sum, region) => sum + region.size, 0);
    const totalPixels = width * height;
    const coverage = (totalArea / totalPixels) * 100;

    // คำนวณ severity
    let severity = 1;
    if (coverage > 5) severity = Math.min(10, Math.floor(coverage));
    if (types.inflammation > 3) severity = Math.min(10, severity + 2);

    return {
      count: redRegions.length,
      locations: redRegions,
      totalArea,
      coverage: Math.round(coverage * 100) / 100,
      severity,
      types,
    };
  } catch (error) {
    console.error('Redness detection error:', error);
    throw new Error('Failed to detect redness');
  }
}

/**
 * สร้าง redness map (binary map ของพื้นที่ที่แดง)
 */
function createRednessMap(image: any): boolean[][] {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const rednessMap: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    rednessMap[y] = [];
    for (let x = 0; x < width; x++) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;

      // ตรวจสอบว่าเป็นสีแดงหรือไม่
      // Red channel ต้องสูงกว่า Green และ Blue อย่างชัดเจน
      const isRed =
        r > 120 && // Red ต้องมีค่าพอสมควร
        r > g + 20 && // Red มากกว่า Green อย่างน้อย 20
        r > b + 20; // Red มากกว่า Blue อย่างน้อย 20

      rednessMap[y][x] = isRed;
    }
  }

  return rednessMap;
}

/**
 * ค้นหา red regions ด้วย flood fill
 */
function findRedRegions(
  rednessMap: boolean[][]
): Array<{ x: number; y: number; size: number; intensity: number }> {
  const height = rednessMap.length;
  const width = rednessMap[0]?.length || 0;
  const visited = new Array(height)
    .fill(null)
    .map(() => new Array(width).fill(false));
  const regions: Array<{ x: number; y: number; size: number; intensity: number }> = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rednessMap[y][x] && !visited[y][x]) {
        const region = floodFillRegion(rednessMap, visited, x, y);
        if (region.size > 5) {
          // ขั้นต่ำ 5 pixels
          regions.push(region);
        }
      }
    }
  }

  return regions;
}

/**
 * Flood fill เพื่อหา connected region
 */
function floodFillRegion(
  rednessMap: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number
): { x: number; y: number; size: number; intensity: number } {
  const height = rednessMap.length;
  const width = rednessMap[0]?.length || 0;
  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
  let size = 0;
  let sumX = 0;
  let sumY = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const { x, y } = current;

    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      visited[y][x] ||
      !rednessMap[y][x]
    ) {
      continue;
    }

    visited[y][x] = true;
    size++;
    sumX += x;
    sumY += y;

    // เพิ่ม neighbors (4-connectivity)
    stack.push(
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    );
  }

  // คำนวณจุดกึ่งกลาง
  const centerX = Math.round(sumX / size);
  const centerY = Math.round(sumY / size);

  // Intensity คำนวณจากขนาด (ยิ่งใหญ่ = ยิ่งรุนแรง)
  const intensity = Math.min(10, Math.floor(size / 10));

  return {
    x: centerX,
    y: centerY,
    size,
    intensity,
  };
}

/**
 * จำแนกประเภทของความแดง
 */
function classifyRednessTypes(
  regions: Array<{ x: number; y: number; size: number; intensity: number }>
): {
  inflammation: number;
  irritation: number;
  vascular: number;
} {
  let inflammation = 0;
  let irritation = 0;
  let vascular = 0;

  for (const region of regions) {
    if (region.intensity >= 7) {
      inflammation++; // แดงเข้ม = อักเสบ
    } else if (region.size < 20) {
      vascular++; // จุดเล็ก = เส้นเลือดฝอย
    } else {
      irritation++; // แดงอ่อน = ระคายเคือง
    }
  }

  return {
    inflammation,
    irritation,
    vascular,
  };
}
