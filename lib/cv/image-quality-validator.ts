/**
 * Image Quality Validator
 * Pre-analysis quality checks to ensure medical-grade input standards
 * 
 * Validates:
 * - Lighting (too dark/bright)
 * - Blur detection
 * - Face presence and size
 * - Resolution requirements
 * - Aspect ratio
 */

import { Jimp } from 'jimp';

type JimpType = any;

/**
 * Quality validation result
 */
export interface ImageQualityResult {
  isValid: boolean;
  score: number; // 0-100, overall quality score
  issues: string[];
  warnings: string[];
  metrics: {
    resolution: { width: number; height: number; megapixels: number };
    lighting: { brightness: number; contrast: number; isWellLit: boolean };
    sharpness: { laplacianVariance: number; isSharp: boolean };
    faceDetection?: { faceDetected: boolean; faceSize: number; isAdequate: boolean };
  };
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  minWidth?: number;
  minHeight?: number;
  minMegapixels?: number;
  maxAspectRatio?: number; // width/height max ratio
  minBrightness?: number;
  maxBrightness?: number;
  minContrast?: number;
  minSharpness?: number;
  requireFace?: boolean;
  minFaceSize?: number; // % of image area
}

const DEFAULT_CONFIG: Required<ValidationConfig> = {
  minWidth: 512,
  minHeight: 512,
  minMegapixels: 0.5, // 0.5MP minimum
  maxAspectRatio: 2.0, // max 2:1 ratio
  minBrightness: 40,
  maxBrightness: 220,
  minContrast: 30,
  minSharpness: 100, // Laplacian variance threshold
  requireFace: true,
  minFaceSize: 10, // face should occupy at least 10% of image
};

/**
 * Helper function to convert hex color to RGBA
 */
function intToRGBA(num: number) {
  return {
    r: (num >> 24) & 0xff,
    g: (num >> 16) & 0xff,
    b: (num >> 8) & 0xff,
    a: num & 0xff,
  };
}

/**
 * Validate image quality before analysis
 */
export async function validateImageQuality(
  imageBuffer: Buffer | string,
  config: ValidationConfig = {}
): Promise<ImageQualityResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const issues: string[] = [];
  const warnings: string[] = [];
  let qualityScore = 100;

  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const megapixels = (width * height) / 1_000_000;

    // 1. Resolution Check
    if (width < cfg.minWidth || height < cfg.minHeight) {
      issues.push(
        `Resolution too low: ${width}x${height} (minimum: ${cfg.minWidth}x${cfg.minHeight})`
      );
      qualityScore -= 30;
    } else if (megapixels < cfg.minMegapixels) {
      warnings.push(`Low resolution: ${megapixels.toFixed(2)}MP (recommended: ≥${cfg.minMegapixels}MP)`);
      qualityScore -= 10;
    }

    // 2. Aspect Ratio Check
    const aspectRatio = width > height ? width / height : height / width;
    if (aspectRatio > cfg.maxAspectRatio) {
      warnings.push(
        `Unusual aspect ratio: ${aspectRatio.toFixed(2)}:1 (recommended: ≤${cfg.maxAspectRatio}:1)`
      );
      qualityScore -= 5;
    }

    // 3. Lighting Analysis (Histogram)
    const lightingMetrics = await analyzeLighting(image);
    
    if (lightingMetrics.brightness < cfg.minBrightness) {
      issues.push(`Image too dark: brightness ${lightingMetrics.brightness.toFixed(0)} (minimum: ${cfg.minBrightness})`);
      qualityScore -= 25;
    } else if (lightingMetrics.brightness > cfg.maxBrightness) {
      issues.push(`Image too bright: brightness ${lightingMetrics.brightness.toFixed(0)} (maximum: ${cfg.maxBrightness})`);
      qualityScore -= 25;
    } else if (
      lightingMetrics.brightness < cfg.minBrightness + 20 ||
      lightingMetrics.brightness > cfg.maxBrightness - 20
    ) {
      warnings.push('Lighting could be improved for better results');
      qualityScore -= 5;
    }

    if (lightingMetrics.contrast < cfg.minContrast) {
      warnings.push(`Low contrast: ${lightingMetrics.contrast.toFixed(0)} (recommended: ≥${cfg.minContrast})`);
      qualityScore -= 10;
    }

    // 4. Blur Detection (Laplacian Variance)
    const sharpnessMetrics = await detectBlur(image, cfg.minSharpness);
    
    if (!sharpnessMetrics.isSharp) {
      issues.push(
        `Image is blurry: sharpness ${sharpnessMetrics.laplacianVariance.toFixed(0)} (minimum: ${cfg.minSharpness})`
      );
      qualityScore -= 30;
    } else if (sharpnessMetrics.laplacianVariance < cfg.minSharpness * 1.5) {
      warnings.push('Image sharpness is borderline, consider retaking with better focus');
      qualityScore -= 5;
    }

    // 5. Face Detection (Simplified - checks for skin-colored regions in center)
    let faceMetrics: { faceDetected: boolean; faceSize: number; isAdequate: boolean } | undefined;
    
    if (cfg.requireFace) {
      faceMetrics = await detectFaceRegion(image, cfg.minFaceSize);
      
      if (!faceMetrics.faceDetected) {
        issues.push('No face detected in image');
        qualityScore -= 35;
      } else if (!faceMetrics.isAdequate) {
        warnings.push(
          `Face too small: ${faceMetrics.faceSize.toFixed(1)}% of image (recommended: ≥${cfg.minFaceSize}%)`
        );
        qualityScore -= 15;
      }
    }

    // Ensure score doesn't go below 0
    qualityScore = Math.max(0, qualityScore);

    const isValid = issues.length === 0;

    return {
      isValid,
      score: qualityScore,
      issues,
      warnings,
      metrics: {
        resolution: { width, height, megapixels },
        lighting: {
          brightness: lightingMetrics.brightness,
          contrast: lightingMetrics.contrast,
          isWellLit: lightingMetrics.brightness >= cfg.minBrightness && 
                     lightingMetrics.brightness <= cfg.maxBrightness,
        },
        sharpness: {
          laplacianVariance: sharpnessMetrics.laplacianVariance,
          isSharp: sharpnessMetrics.isSharp,
        },
        faceDetection: faceMetrics,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      score: 0,
      issues: [`Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      metrics: {
        resolution: { width: 0, height: 0, megapixels: 0 },
        lighting: { brightness: 0, contrast: 0, isWellLit: false },
        sharpness: { laplacianVariance: 0, isSharp: false },
      },
    };
  }
}

/**
 * Analyze lighting using histogram
 */
async function analyzeLighting(
  image: JimpType
): Promise<{ brightness: number; contrast: number }> {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Convert to grayscale if not already
  const grayImage = image.clone();
  await (grayImage.greyscale() as unknown as Promise<void>);

  // Build histogram
  const histogram = new Array(256).fill(0);
  const totalPixels = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = intToRGBA(grayImage.getPixelColor(x, y));
      histogram[pixel.r]++;
    }
  }

  // Calculate mean brightness
  let sumIntensity = 0;
  for (let i = 0; i < 256; i++) {
    sumIntensity += i * histogram[i];
  }
  const brightness = sumIntensity / totalPixels;

  // Calculate standard deviation (contrast indicator)
  let sumSquaredDiff = 0;
  for (let i = 0; i < 256; i++) {
    const diff = i - brightness;
    sumSquaredDiff += diff * diff * histogram[i];
  }
  const contrast = Math.sqrt(sumSquaredDiff / totalPixels);

  return { brightness, contrast };
}

/**
 * Detect blur using Laplacian variance method
 */
async function detectBlur(
  image: JimpType,
  threshold: number
): Promise<{ laplacianVariance: number; isSharp: boolean }> {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Convert to grayscale
  const grayImage = image.clone();
  await (grayImage.greyscale() as unknown as Promise<void>);

  // Laplacian kernel
  const laplacian = [
    [0, 1, 0],
    [1, -4, 1],
    [0, 1, 0],
  ];

  const laplacianValues: number[] = [];

  // Apply Laplacian operator
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = intToRGBA(grayImage.getPixelColor(x + kx, y + ky));
          sum += pixel.r * laplacian[ky + 1][kx + 1];
        }
      }

      laplacianValues.push(Math.abs(sum));
    }
  }

  // Calculate variance of Laplacian
  const mean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
  const variance =
    laplacianValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    laplacianValues.length;

  return {
    laplacianVariance: variance,
    isSharp: variance >= threshold,
  };
}

/**
 * Detect face region (simplified - checks for skin-colored region in center)
 * Optimized for performance with sampling
 */
async function detectFaceRegion(
  image: JimpType,
  minFaceSizePercent: number
): Promise<{ faceDetected: boolean; faceSize: number; isAdequate: boolean }> {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Define skin color range in RGB (simplified)
  // Typical skin tones: R: 95-255, G: 40-185, B: 20-135
  const skinColorRanges = {
    rMin: 95,
    rMax: 255,
    gMin: 40,
    gMax: 185,
    bMin: 20,
    bMax: 135,
  };

  // Check center region (50% of image area) with sampling for speed
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const checkWidth = Math.floor(width * 0.5);
  const checkHeight = Math.floor(height * 0.5);
  const startX = Math.max(0, centerX - Math.floor(checkWidth / 2));
  const startY = Math.max(0, centerY - Math.floor(checkHeight / 2));
  const endX = Math.min(width, startX + checkWidth);
  const endY = Math.min(height, startY + checkHeight);

  // Sample every 5th pixel for speed (25x faster)
  const step = 5;
  let skinPixelCount = 0;
  let totalSampled = 0;

  for (let y = startY; y < endY; y += step) {
    for (let x = startX; x < endX; x += step) {
      totalSampled++;
      const pixel = intToRGBA(image.getPixelColor(x, y));

      // Check if pixel is within skin color range
      if (
        pixel.r >= skinColorRanges.rMin &&
        pixel.r <= skinColorRanges.rMax &&
        pixel.g >= skinColorRanges.gMin &&
        pixel.g <= skinColorRanges.gMax &&
        pixel.b >= skinColorRanges.bMin &&
        pixel.b <= skinColorRanges.bMax
      ) {
        skinPixelCount++;
      }
    }
  }

  const skinPercentageInSample = (skinPixelCount / totalSampled) * 100;
  const faceDetected = skinPercentageInSample > 20; // At least 20% skin color in center
  
  // Estimate face size based on sampled region
  const estimatedFacePixels = skinPixelCount * (step * step);
  const faceSizePercent = (estimatedFacePixels / (width * height)) * 100;
  const isAdequate = faceSizePercent >= minFaceSizePercent;

  return {
    faceDetected,
    faceSize: faceSizePercent,
    isAdequate,
  };
}

/**
 * Quick validation (fast checks only)
 */
export async function quickValidate(
  imageBuffer: Buffer | string
): Promise<{ isValid: boolean; reason?: string }> {
  try {
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Quick checks
    if (width < 512 || height < 512) {
      return { isValid: false, reason: 'Resolution too low' };
    }

    const aspectRatio = width > height ? width / height : height / width;
    if (aspectRatio > 3.0) {
      return { isValid: false, reason: 'Aspect ratio too extreme' };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Invalid image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
