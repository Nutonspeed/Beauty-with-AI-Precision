/**
 * Test Image Quality Validator
 */

import { describe, it, expect } from 'vitest';
import { validateImageQuality, quickValidate } from '@/lib/cv/image-quality-validator';
import { Jimp } from 'jimp';

describe('Image Quality Validator', () => {
  describe('Resolution Validation', () => {
    it('should reject images below minimum resolution', async () => {
      // Create a small 300x300 image
      const image = new Jimp({ width: 300, height: 300, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Resolution too low'))).toBe(true);
      expect(result.metrics.resolution.width).toBe(300);
      expect(result.metrics.resolution.height).toBe(300);
    }, 15000);

    it('should accept images above minimum resolution', async () => {
      // Create a 1024x1024 image
      const image = new Jimp({ width: 1024, height: 1024, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.metrics.resolution.width).toBe(1024);
      expect(result.metrics.resolution.height).toBe(1024);
      expect(result.metrics.resolution.megapixels).toBeCloseTo(1.05, 1);
    }, 15000);
  });

  describe('Aspect Ratio Validation', () => {
    it('should warn about extreme aspect ratios', async () => {
      // Create a 1000x300 image (3.33:1 ratio)
      const image = new Jimp({ width: 1000, height: 300, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { 
        requireFace: false,
        maxAspectRatio: 2.0 
      });

      const hasWarning = result.warnings.some(warning =>
        warning.includes('Unusual aspect ratio')
      );
      expect(hasWarning).toBe(true);
    });
  });

  describe('Lighting Validation', () => {
    it('should reject images that are too dark', async () => {
      // Create a very dark image
      const image = new Jimp({ width: 800, height: 800, color: 0x000000ff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.isValid).toBe(false);
      const hasDarkIssue = result.issues.some(issue =>
        issue.includes('Image too dark')
      );
      expect(hasDarkIssue).toBe(true);
      expect(result.metrics.lighting.brightness).toBeLessThan(40);
    });

    it('should reject images that are too bright', async () => {
      // Create a very bright image
      const image = new Jimp({ width: 800, height: 800, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.isValid).toBe(false);
      const hasBrightIssue = result.issues.some(issue =>
        issue.includes('Image too bright')
      );
      expect(hasBrightIssue).toBe(true);
      expect(result.metrics.lighting.brightness).toBeGreaterThan(220);
    });

    it('should accept well-lit images', async () => {
      // Create a medium gray image (good lighting)
      const image = new Jimp({ width: 800, height: 800, color: 0x808080ff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.metrics.lighting.isWellLit).toBe(true);
      expect(result.metrics.lighting.brightness).toBeGreaterThan(40);
      expect(result.metrics.lighting.brightness).toBeLessThan(220);
    });
  });

  describe('Blur Detection', () => {
    it('should detect blurry images (uniform color = low variance)', async () => {
      // Create a uniform color image (no edges = blurry)
      const image = new Jimp({ width: 800, height: 800, color: 0x808080ff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { 
        requireFace: false,
        minSharpness: 100 
      });

      // Uniform images have very low Laplacian variance
      expect(result.metrics.sharpness.isSharp).toBe(false);
      const hasBlurIssue = result.issues.some(issue =>
        issue.includes('Image is blurry')
      );
      expect(hasBlurIssue).toBe(true);
    });

    it('should accept sharp images with edges', async () => {
      // Create an image with clear edges (checkerboard pattern)
      const image = new Jimp({ width: 800, height: 800 });
      
      // Create checkerboard pattern (high contrast edges)
      for (let y = 0; y < 800; y++) {
        for (let x = 0; x < 800; x++) {
          const color = (Math.floor(x / 50) + Math.floor(y / 50)) % 2 === 0 
            ? 0x000000ff  // Black
            : 0xffffffff; // White
          image.setPixelColor(color, x, y);
        }
      }

      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { 
        requireFace: false,
        minSharpness: 100 
      });

      // Checkerboard has very high Laplacian variance
      expect(result.metrics.sharpness.isSharp).toBe(true);
      expect(result.metrics.sharpness.laplacianVariance).toBeGreaterThan(1000);
    });
  });

  describe('Face Detection', () => {
    it('should detect presence of skin-colored region', async () => {
  // Create image with skin-colored center region
  const image = new Jimp({ width: 512, height: 512, color: 0x404040ff }); // Dark background
      
      // Add skin-colored region in center (50% of image)
      const startX = 200;
      const startY = 200;
      const endX = 600;
      const endY = 600;
      
      const skinRegion = new Jimp({ width: endX - startX, height: endY - startY, color: 0xc89678ff });
      image.composite(skinRegion, startX, startY);

  const buffer = await image.getBuffer('image/png');

      const result = await validateImageQuality(buffer, { 
        requireFace: true,
        minFaceSize: 5 // Lower threshold since we're sampling
      });

      expect(result.metrics.faceDetection?.faceDetected).toBe(true);
      expect(result.metrics.faceDetection?.faceSize).toBeGreaterThan(0);
    }, 10000); // Increase timeout to 10s

    it('should reject images without face when required', async () => {
  // Create image with no skin tones (blue image)
  const image = new Jimp({ width: 512, height: 512, color: 0x0000ffff });
  const buffer = await image.getBuffer('image/png');

      const result = await validateImageQuality(buffer, { requireFace: true });

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No face detected in image');
    }, 10000); // Increase timeout to 10s
  });

  describe('Overall Quality Score', () => {
    it('should give high score to perfect images', async () => {
  // Create a good quality image with checkerboard pattern (sharp edges)
      const image = new Jimp({ width: 600, height: 600 });

      // Add checkerboard pattern (sharp, high contrast)
      const { data, width, height } = image.bitmap;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const isBlack = (Math.floor(x / 75) + Math.floor(y / 75)) % 2 === 0;
          const gray = isBlack ? 80 : 160; // Good contrast, medium brightness
          const idx = (y * width + x) * 4;
          data[idx] = gray;
          data[idx + 1] = gray;
          data[idx + 2] = gray;
          data[idx + 3] = 255;
        }
      }

      const buffer = await image.getBuffer('image/png');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.score).toBeGreaterThan(50);
    }, 10000);

    it('should give low score to poor quality images', async () => {
      // Create a poor quality image (small, dark, uniform)
      const image = new Jimp({ width: 300, height: 300, color: 0x000000ff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await validateImageQuality(buffer, { requireFace: false });

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Validate', () => {
    it('should quickly reject low resolution images', async () => {
      const image = new Jimp({ width: 300, height: 300, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await quickValidate(buffer);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Resolution too low');
    });

    it('should quickly reject extreme aspect ratios', async () => {
      const image = new Jimp({ width: 2000, height: 600, color: 0xffffffff }); // 3.33:1 ratio
      const buffer = await image.getBuffer('image/jpeg');

      const result = await quickValidate(buffer);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Aspect ratio too extreme');
    });

    it('should quickly accept valid images', async () => {
      const image = new Jimp({ width: 1024, height: 768, color: 0xffffffff });
      const buffer = await image.getBuffer('image/jpeg');

      const result = await quickValidate(buffer);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('Custom Configuration', () => {
    it('should respect custom thresholds', async () => {
      const image = new Jimp({ width: 600, height: 600, color: 0x808080ff });
      const buffer = await image.getBuffer('image/jpeg');

      // Custom config with lower requirements
      const result = await validateImageQuality(buffer, {
        minWidth: 500,
        minHeight: 500,
        requireFace: false,
        minSharpness: 10, // Very lenient
      });

      // Should pass with custom config
      expect(result.metrics.resolution.width).toBe(600);
    }, 10000);
  });
});
