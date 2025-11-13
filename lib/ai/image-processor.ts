/**
 * Image Processing Pipeline
 * 
 * Preprocessing and quality assessment for AI analysis
 * Phase 8.3: Processing Optimization
 */

// Use dynamic imports to reduce initial bundle size
let tf: any = null
import type * as tfTypes from '@tensorflow/tfjs'

export interface ImageQualityReport {
  isGoodQuality: boolean
  score: number // 0-100
  issues: string[]
  metrics: {
    blur: number // 0-100 (0 = very blurry)
    brightness: number // 0-100 (50 = ideal)
    contrast: number // 0-100
    sharpness: number // 0-100
  }
}

export class ImageProcessor {
  /**
   * Initialize TensorFlow.js if needed
   */
  private async ensureTF(): Promise<void> {
    if (!tf) {
      tf = await import('@tensorflow/tfjs')
      await tf.ready()
    }
  }

  /**
   * Check image quality before analysis
   */
  async assessQuality(imageElement: HTMLImageElement): Promise<ImageQualityReport> {
    await this.ensureTF()
    
    const tensor = tf.browser.fromPixels(imageElement)
    
    try {
      const [blur, brightness, contrast, sharpness] = await Promise.all([
        this.calculateBlur(tensor),
        this.calculateBrightness(tensor),
        this.calculateContrast(tensor),
        this.calculateSharpness(tensor),
      ])

      const issues: string[] = []
      
      if (blur < 40) issues.push('Image is too blurry - hold camera steady')
      if (brightness < 30) issues.push('Too dark - improve lighting')
      if (brightness > 70) issues.push('Too bright - reduce lighting')
      if (contrast < 30) issues.push('Low contrast - adjust lighting')
      if (sharpness < 40) issues.push('Image not sharp - focus camera')

      const score = (blur + contrast + sharpness) / 3 - Math.abs(brightness - 50)
      
      return {
        isGoodQuality: issues.length === 0 && score > 60,
        score: Math.max(0, Math.min(100, score)),
        issues,
        metrics: {
          blur,
          brightness,
          contrast,
          sharpness,
        },
      }
    } finally {
      tensor.dispose()
    }
  }

  /**
   * Calculate blur score using Laplacian variance
   */
  private async calculateBlur(imageTensor: tfTypes.Tensor3D): Promise<number> {
    return tf.tidy(() => {
      // Convert to grayscale
      const grayscale = imageTensor.mean(2)
      
      // Laplacian kernel for edge detection
      const kernel = tf.tensor2d([
        [0, 1, 0],
        [1, -4, 1],
        [0, 1, 0],
      ])
      
      const reshaped = grayscale.expandDims(0).expandDims(3)
      const kernelReshaped = kernel.expandDims(2).expandDims(3)
      
      // Apply Laplacian
      const edges = tf.conv2d(reshaped as tfTypes.Tensor4D, kernelReshaped as tfTypes.Tensor4D, 1, 'same')
      
      // Calculate variance
      const variance = tf.moments(edges).variance.arraySync() as number
      
      // Higher variance = sharper image
      // Normalize to 0-100 scale
      return Math.min(100, variance * 1000)
    })
  }

  /**
   * Calculate average brightness
   */
  private async calculateBrightness(imageTensor: tfTypes.Tensor3D): Promise<number> {
    return tf.tidy(() => {
      const mean = imageTensor.mean().arraySync() as number
      return (mean / 255) * 100
    })
  }

  /**
   * Calculate contrast score
   */
  private async calculateContrast(imageTensor: tfTypes.Tensor3D): Promise<number> {
    return tf.tidy(() => {
      const { variance } = tf.moments(imageTensor)
      const std = tf.sqrt(variance).arraySync() as number
      
      // Higher std = higher contrast
      return Math.min(100, (std / 255) * 200)
    })
  }

  /**
   * Calculate sharpness score
   */
  private async calculateSharpness(imageTensor: tfTypes.Tensor3D): Promise<number> {
    return tf.tidy(() => {
      // Similar to blur but different thresholds
      const grayscale = imageTensor.mean(2)
      
      const kernel = tf.tensor2d([
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
      ])
      
      const reshaped = grayscale.expandDims(0).expandDims(3)
      const kernelReshaped = kernel.expandDims(2).expandDims(3)
      
      const edges = tf.conv2d(reshaped as tfTypes.Tensor4D, kernelReshaped as tfTypes.Tensor4D, 1, 'same')
      const edgeStrength = edges.abs().mean().arraySync() as number
      
      return Math.min(100, edgeStrength * 500)
    })
  }

  /**
   * Resize image to standard size while maintaining aspect ratio
   */
  async resizeImage(
    imageElement: HTMLImageElement,
    targetSize: number = 512
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    const { width, height } = imageElement
    const aspectRatio = width / height
    
    let newWidth = targetSize
    let newHeight = targetSize
    
    if (aspectRatio > 1) {
      newHeight = targetSize / aspectRatio
    } else {
      newWidth = targetSize * aspectRatio
    }
    
    canvas.width = newWidth
    canvas.height = newHeight
    
    ctx.drawImage(imageElement, 0, 0, newWidth, newHeight)
    
    return canvas
  }

  /**
   * Enhance image quality
   */
  async enhanceImage(imageElement: HTMLImageElement): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    
    // Draw original image
    ctx.drawImage(imageElement, 0, 0)
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Simple contrast enhancement
    const factor = 1.2
    const intercept = 128 * (1 - factor)
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept)) // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept)) // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept)) // B
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    return canvas
  }

  /**
   * Convert File to HTMLImageElement
   */
  async fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
      
      img.src = url
    })
  }

  /**
   * Batch process multiple images
   */
  async batchProcess(
    files: File[],
    processor: (img: HTMLImageElement) => Promise<any>
  ): Promise<any[]> {
    const images = await Promise.all(files.map(f => this.fileToImage(f)))
    return Promise.all(images.map(img => processor(img)))
  }
}

// Singleton instance
let processorInstance: ImageProcessor | null = null

/**
 * Get image processor instance (singleton)
 */
export function getImageProcessor(): ImageProcessor {
  if (!processorInstance) {
    processorInstance = new ImageProcessor()
  }
  return processorInstance
}
