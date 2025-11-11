/**
 * Spot Detector - ตรวจจับจุดด่างดำ (Dark Spots)
 * ใช้ Blob Detection Algorithm
 */

import { Jimp } from 'jimp';

type JimpType = any; // Using any to bypass Jimp type conflicts

/**
 * Helper function to convert hex color to RGBA (Jimp v1.x compatibility)
 */
function intToRGBA(num: number) {
  return {
    r: (num >> 24) & 0xff,
    g: (num >> 16) & 0xff,
    b: (num >> 8) & 0xff,
    a: num & 0xff,
  };
}

export interface SpotDetectionResult {
  count: number;
  locations: Array<{ x: number; y: number; radius: number }>;
  severity: number; // 1-10
  totalArea: number;
}

/**
 * ตรวจจับจุดด่างดำบนผิวหน้า
 */
export async function detectSpots(
  imageBuffer: Buffer | string
): Promise<SpotDetectionResult> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // แปลงเป็น grayscale (Jimp v1.x)
    await (image.greyscale() as unknown as Promise<void>);

    const spots: Array<{ x: number; y: number; radius: number }> = [];
    // Threshold tuned based on real-world testing (2025-11-10)
    // Previous: 100 → caused 21-81% false positives (hair/background detected)
    // New: 70 → focus on actual dark spots on skin
    const threshold = 70; // Threshold สำหรับจุดมืด
    const minBlobSize = 5; // ขนาดต่ำสุดของ blob (pixels)
    const maxBlobSize = 100; // ขนาดสูงสุดของ blob (pixels)

    // สร้าง visited map
    const visited = Array(height)
      .fill(null)
      .map(() => Array(width).fill(false));

    // Flood fill เพื่อหา blobs
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (visited[y][x]) continue;

        const pixelColor = intToRGBA(image.getPixelColor(x, y));
        const brightness = pixelColor.r; // grayscale แล้วค่า r=g=b

        // ถ้าเป็นพิกเซลมืด
        if (brightness < threshold) {
          const blob = floodFill(image, x, y, visited, threshold);

          // ถ้า blob มีขนาดเหมาะสม
          if (blob.size >= minBlobSize && blob.size <= maxBlobSize) {
            const radius = Math.sqrt(blob.size / Math.PI);
            spots.push({
              x: blob.centerX,
              y: blob.centerY,
              radius,
            });
          }
        }
      }
    }

    // คำนวณ severity
    const totalArea = spots.reduce(
      (sum, spot) => sum + Math.PI * spot.radius * spot.radius,
      0
    );
    const imageArea = width * height;
    const spotPercentage = (totalArea / imageArea) * 100;

    // Severity scale: 0-1% = 1, 1-2% = 2, ... 9-10% = 10
    const severity = Math.min(10, Math.max(1, Math.ceil(spotPercentage)));

    return {
      count: spots.length,
      locations: spots,
      severity,
      totalArea,
    };
  } catch (error) {
    console.error('Spot detection error:', error);
    throw new Error('Failed to detect spots');
  }
}

/**
 * Flood Fill Algorithm เพื่อหา blob
 */
function floodFill(
  image: JimpType,
  startX: number,
  startY: number,
  visited: boolean[][],
  threshold: number
): { size: number; centerX: number; centerY: number } {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];

  let size = 0;
  let sumX = 0;
  let sumY = 0;

  while (stack.length > 0) {
    const pos = stack.pop();
    if (!pos) break;

    const { x, y } = pos;

    // Check bounds
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[y][x]) continue;

    const pixelColor = intToRGBA(image.getPixelColor(x, y));
    const brightness = pixelColor.r;

    if (brightness >= threshold) continue;

    visited[y][x] = true;
    size++;
    sumX += x;
    sumY += y;

    // Add neighbors
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  return {
    size,
    centerX: size > 0 ? Math.round(sumX / size) : startX,
    centerY: size > 0 ? Math.round(sumY / size) : startY,
  };
}

/**
 * สร้างรูปภาพที่มี annotation ของจุดด่างดำ
 */
export async function annotateSpots(
  imageBuffer: Buffer | string,
  spots: Array<{ x: number; y: number; radius: number }>
): Promise<Buffer> {
  const image = await Jimp.read(imageBuffer);

  // วงกลมสีแดงแสดงจุดด่างดำ
  for (const spot of spots) {
    const { x, y, radius } = spot;

    // วาดวงกลม
    for (let angle = 0; angle < 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      const px = Math.round(x + radius * Math.cos(rad));
      const py = Math.round(y + radius * Math.sin(rad));

      if (px >= 0 && px < image.bitmap.width && py >= 0 && py < image.bitmap.height) {
        image.setPixelColor(0xff0000ff, px, py); // สีแดง
      }
    }
  }

  return await image.getBuffer('image/jpeg');
}
