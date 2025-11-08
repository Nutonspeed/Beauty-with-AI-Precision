/**
 * Skin Effect Filters
 * ใช้ Pixi.js สำหรับ real-time skin effects และ treatment simulation
 */

import * as PIXI from 'pixi.js';

export interface SkinEffectOptions {
  smoothing: number; // 0-1
  brightening: number; // 0-1
  spotRemoval: number; // 0-1
  rednessReduction: number; // 0-1
  poreMinimizing: number; // 0-1
  wrinkleReduction: number; // 0-1
}

export const DEFAULT_EFFECT_OPTIONS: SkinEffectOptions = {
  smoothing: 0,
  brightening: 0,
  spotRemoval: 0,
  rednessReduction: 0,
  poreMinimizing: 0,
  wrinkleReduction: 0,
};

/**
 * Skin Effect Processor
 */
export class SkinEffectProcessor {
  private app: PIXI.Application | null = null;
  private container: PIXI.Container | null = null;
  private sprite: PIXI.Sprite | null = null;
  private filters: {
    blur?: PIXI.BlurFilter;
    colorMatrix?: PIXI.ColorMatrixFilter;
    adjustment?: PIXI.ColorMatrixFilter;
  } = {};

  /**
   * Initialize Pixi.js application
   */
  async initialize(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    try {
      console.log('🎨 Initializing Skin Effect Processor...');

      this.app = new PIXI.Application();
      await this.app.init({
        canvas,
        width,
        height,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
      });

      this.container = new PIXI.Container();
      this.app.stage.addChild(this.container);

      console.log('✅ Skin Effect Processor initialized');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load image and apply effects
   */
  async loadImage(imageSource: string | HTMLImageElement | HTMLCanvasElement | File | Blob): Promise<void> {
    if (!this.app || !this.container) {
      throw new Error('Processor not initialized');
    }

    try {
      // Clear previous sprite
      if (this.sprite) {
        this.container.removeChild(this.sprite);
        this.sprite.destroy();
      }

      // Convert File/Blob to URL if needed
      let sourceUrl: string | HTMLImageElement | HTMLCanvasElement;
      
      if (imageSource instanceof File || imageSource instanceof Blob) {
        // Create object URL from File/Blob
        sourceUrl = URL.createObjectURL(imageSource);
        console.log('🔄 Converted File/Blob to object URL:', sourceUrl);
      } else {
        sourceUrl = imageSource;
      }

      // Create texture from source
      let texture: PIXI.Texture;

      if (typeof sourceUrl === 'string') {
        texture = await PIXI.Assets.load(sourceUrl);
        
        // Revoke object URL after loading to free memory
        if (imageSource instanceof File || imageSource instanceof Blob) {
          URL.revokeObjectURL(sourceUrl);
        }
      } else {
        texture = PIXI.Texture.from(sourceUrl);
      }

      // Create sprite
      this.sprite = new PIXI.Sprite(texture);

      // Scale to fit canvas
      const scaleX = this.app.canvas.width / texture.width;
      const scaleY = this.app.canvas.height / texture.height;
      const scale = Math.min(scaleX, scaleY);

      this.sprite.scale.set(scale);
      this.sprite.x = (this.app.canvas.width - texture.width * scale) / 2;
      this.sprite.y = (this.app.canvas.height - texture.height * scale) / 2;

      this.container.addChild(this.sprite);
    } catch (error) {
      console.error('❌ Load image error:', error);
      throw error;
    }
  }

  /**
   * Apply skin effects
   */
  applyEffects(options: Partial<SkinEffectOptions>): void {
    if (!this.sprite) {
      throw new Error('No image loaded');
    }

    const finalOptions = { ...DEFAULT_EFFECT_OPTIONS, ...options };
    const filterList: PIXI.Filter[] = [];

    // 1. Smoothing (Blur filter)
    if (finalOptions.smoothing > 0) {
      if (!this.filters.blur) {
        this.filters.blur = new PIXI.BlurFilter();
      }
      this.filters.blur.strength = finalOptions.smoothing * 8;
      filterList.push(this.filters.blur);
    }

    // 2. Brightening & Color Adjustment
    if (
      finalOptions.brightening > 0 ||
      finalOptions.rednessReduction > 0 ||
      finalOptions.spotRemoval > 0
    ) {
      if (!this.filters.colorMatrix) {
        this.filters.colorMatrix = new PIXI.ColorMatrixFilter();
      }

      // Reset matrix
      this.filters.colorMatrix.reset();

      // Brightening
      if (finalOptions.brightening > 0) {
        const brightness = 1 + finalOptions.brightening * 0.3;
        this.filters.colorMatrix.brightness(brightness, false);
      }

      // Redness reduction (reduce red channel)
      if (finalOptions.rednessReduction > 0) {
        const matrix = this.filters.colorMatrix.matrix;
        matrix[0] = 1 - finalOptions.rednessReduction * 0.3; // Red channel
      }

      // Spot removal (increase overall brightness and reduce contrast in dark areas)
      if (finalOptions.spotRemoval > 0) {
        const contrast = 1 - finalOptions.spotRemoval * 0.2;
        this.filters.colorMatrix.contrast(contrast, false);
      }

      filterList.push(this.filters.colorMatrix);
    }

    // Apply all filters
    this.sprite.filters = filterList.length > 0 ? filterList : null;
  }

  /**
   * Apply treatment preset
   */
  applyTreatmentPreset(preset: 'mild' | 'moderate' | 'intensive'): void {
    const presets: Record<string, SkinEffectOptions> = {
      mild: {
        smoothing: 0.2,
        brightening: 0.1,
        spotRemoval: 0.15,
        rednessReduction: 0.1,
        poreMinimizing: 0.15,
        wrinkleReduction: 0.1,
      },
      moderate: {
        smoothing: 0.4,
        brightening: 0.25,
        spotRemoval: 0.35,
        rednessReduction: 0.3,
        poreMinimizing: 0.35,
        wrinkleReduction: 0.3,
      },
      intensive: {
        smoothing: 0.7,
        brightening: 0.4,
        spotRemoval: 0.6,
        rednessReduction: 0.5,
        poreMinimizing: 0.6,
        wrinkleReduction: 0.5,
      },
    };

    this.applyEffects(presets[preset]);
  }

  /**
   * Clear all effects
   */
  clearEffects(): void {
    if (this.sprite) {
      this.sprite.filters = null;
    }
  }

  /**
   * Export current canvas as image
   */
  async exportImage(format: 'png' | 'jpeg' = 'png', quality = 0.9): Promise<Blob> {
    if (!this.app) {
      throw new Error('Processor not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        this.app!.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export image'));
            }
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current canvas as data URL
   */
  getDataURL(format: 'png' | 'jpeg' = 'png', quality = 0.9): string {
    if (!this.app) {
      throw new Error('Processor not initialized');
    }

    return this.app.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height);

      // Reposition sprite if exists
      if (this.sprite && this.sprite.texture) {
        const scaleX = width / this.sprite.texture.width;
        const scaleY = height / this.sprite.texture.height;
        const scale = Math.min(scaleX, scaleY);

        this.sprite.scale.set(scale);
        this.sprite.x = (width - this.sprite.texture.width * scale) / 2;
        this.sprite.y = (height - this.sprite.texture.height * scale) / 2;
      }
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }

    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    this.filters = {};
    console.log('🗑️ Skin Effect Processor disposed');
  }
}

/**
 * Helper: Create side-by-side comparison
 */
export async function createBeforeAfterComparison(
  beforeImage: string | HTMLImageElement | HTMLCanvasElement,
  afterImage: string | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Load images
  const loadImage = async (
    src: string | HTMLImageElement | HTMLCanvasElement
  ): Promise<HTMLImageElement | HTMLCanvasElement> => {
    if (typeof src === 'string') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }
    return src;
  };

  const [before, after] = await Promise.all([loadImage(beforeImage), loadImage(afterImage)]);

  // Draw before (left)
  ctx.drawImage(before, 0, 0, width, height);

  // Draw after (right)
  ctx.drawImage(after, width, 0, width, height);

  // Draw divider line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width, height);
  ctx.stroke();

  // Add labels
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BEFORE', width / 2, 40);
  ctx.fillText('AFTER', width + width / 2, 40);

  return canvas;
}

/**
 * Helper: Apply progressive effect animation
 */
export async function animateEffect(
  processor: SkinEffectProcessor,
  targetOptions: Partial<SkinEffectOptions>,
  duration: number = 1000,
  onProgress?: (progress: number) => void
): Promise<void> {
  const startTime = Date.now();
  const startOptions = { ...DEFAULT_EFFECT_OPTIONS };

  return new Promise((resolve) => {
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate options
      const currentOptions: Partial<SkinEffectOptions> = {};
      for (const key of Object.keys(targetOptions) as Array<keyof SkinEffectOptions>) {
        currentOptions[key] =
          startOptions[key] + (targetOptions[key]! - startOptions[key]) * progress;
      }

      processor.applyEffects(currentOptions);

      if (onProgress) {
        onProgress(progress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}
