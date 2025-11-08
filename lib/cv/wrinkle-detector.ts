/**
 * Wrinkle Detector - ตรวจจับริ้วรอย
 * ใช้ Shadow Analysis และ Line Detection
 */

import { Jimp } from 'jimp';

export interface WrinkleDetectionResult {
  count: number;
  locations: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  severity: number; // 1-10
  types: {
    fineLines: number;
    deepWrinkles: number;
  };
}

/**
 * ตรวจจับริ้วรอยบนใบหน้า
 */
export async function detectWrinkles(
  imageBuffer: Buffer | string
): Promise<WrinkleDetectionResult> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // แปลงเป็น grayscale (Jimp v1.x)
    await (image.greyscale() as unknown as Promise<void>);

    // เพิ่ม contrast เพื่อเน้นริ้วรอย
    await (image.contrast(0.3) as unknown as Promise<void>);

    // ใช้ edge detection
    const edges = await detectEdges(image);

    // หาเส้นจาก edges (Hough Line Transform - simplified)
    const lines = detectLines(edges);

    // แยกประเภทของริ้วรอย
    const fineLines = lines.filter((line) => line.length < 20);
    const deepWrinkles = lines.filter((line) => line.length >= 20);

    // คำนวณ severity
    const totalLength = lines.reduce((sum, line) => sum + line.length, 0);
    const imageDimension = Math.sqrt(width * height);
    const wrinkleRatio = totalLength / imageDimension;

    let severity = 1;
    if (wrinkleRatio > 5) severity = Math.min(10, Math.floor(wrinkleRatio / 2));
    if (deepWrinkles.length > 5) severity = Math.min(10, severity + 2);

    return {
      count: lines.length,
      locations: lines.map((line) => ({
        x1: line.x1,
        y1: line.y1,
        x2: line.x2,
        y2: line.y2,
      })),
      severity,
      types: {
        fineLines: fineLines.length,
        deepWrinkles: deepWrinkles.length,
      },
    };
  } catch (error) {
    console.error('Wrinkle detection error:', error);
    throw new Error('Failed to detect wrinkles');
  }
}

/**
 * Detect edges ด้วย Sobel operator
 */
async function detectEdges(image: any): Promise<any> {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const edgeImage = image.clone();

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

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const color = image.getPixelColor(x + kx, y + ky);
          const intensity = (color >> 16) & 0xff; // Extract red channel as intensity

          gx += intensity * sobelX[ky + 1][kx + 1];
          gy += intensity * sobelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const normalized = Math.min(255, magnitude);

      const newColor = 
        ((normalized << 24) | (normalized << 16) | (normalized << 8) | 0xff) >>> 0;
      edgeImage.setPixelColor(newColor, x, y);
    }
  }

  return edgeImage;
}

/**
 * ตรวจจับเส้น (Hough Line Transform - simplified)
 */
function detectLines(
  edgeImage: any
): Array<{ x1: number; y1: number; x2: number; y2: number; length: number }> {
  const width = edgeImage.bitmap.width;
  const height = edgeImage.bitmap.height;
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; length: number }> = [];
  const threshold = 150;

  // ใช้ simple line detection (horizontal & vertical emphasis)
  const visited = new Array(height)
    .fill(null)
    .map(() => new Array(width).fill(false));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y][x]) continue;

      const color = edgeImage.getPixelColor(x, y);
      const intensity = (color >> 16) & 0xff;
      if (intensity < threshold) continue;

      // ลองหาเส้นในทิศทางต่างๆ
      const directions = [
        { dx: 1, dy: 0 }, // Horizontal
        { dx: 0, dy: 1 }, // Vertical
        { dx: 1, dy: 1 }, // Diagonal /
        { dx: 1, dy: -1 }, // Diagonal \
      ];

      for (const dir of directions) {
        const line = traceLine(edgeImage, x, y, dir.dx, dir.dy, visited, threshold);
        if (line.length > 10) {
          // เส้นยาวกว่า 10 pixels
          lines.push(line);
          break;
        }
      }
    }
  }

  return lines;
}

/**
 * ติดตามเส้นในทิศทางที่กำหนด
 */
function traceLine(
  image: any,
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  visited: boolean[][],
  threshold: number
): { x1: number; y1: number; x2: number; y2: number; length: number } {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let x = startX;
  let y = startY;
  let length = 0;

  while (
    x >= 0 &&
    x < width &&
    y >= 0 &&
    y < height &&
    !visited[y][x]
  ) {
    const color = image.getPixelColor(x, y);
    const intensity = (color >> 16) & 0xff;
    if (intensity < threshold) break;

    visited[y][x] = true;
    length++;

    x += dx;
    y += dy;
  }

  return {
    x1: startX,
    y1: startY,
    x2: x - dx,
    y2: y - dy,
    length,
  };
}
