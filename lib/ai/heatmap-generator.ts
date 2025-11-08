/**
 * Real Heatmap Generation using Canvas API
 * Phase 12: Replace CSS gradients with pixel-perfect heatmaps from ML model data
 */

import type { SkinConcernArea } from './face-detection'

export interface HeatmapConfig {
  width: number
  height: number
  concernType?: 'wrinkle' | 'pigmentation' | 'pore' | 'redness' | 'acne' | 'all'
  opacity?: number
  blurRadius?: number
  colorScheme?: 'default' | 'thermal' | 'grayscale'
}

export interface HeatmapPoint {
  x: number
  y: number
  intensity: number // 0-1
  radius: number
}

/**
 * Generate real heatmap from skin concern detections
 */
export function generateRealHeatmap(
  concerns: SkinConcernArea[],
  config: HeatmapConfig
): ImageData {
  const { width, height, concernType, opacity = 0.7, blurRadius = 30, colorScheme = 'default' } = config

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Filter concerns by type if specified
  const filteredConcerns = concernType && concernType !== 'all'
    ? concerns.filter((c) => c.type === concernType)
    : concerns

  // Convert concerns to heatmap points
  const heatmapPoints = concernsToHeatmapPoints(filteredConcerns, width, height)

  // Draw heatmap using advanced rendering
  if (heatmapPoints.length > 0) {
    drawHeatmapPoints(ctx, heatmapPoints, { opacity, blurRadius, colorScheme })
  }

  // Apply blur for smooth gradient
  if (blurRadius > 0) {
    applyGaussianBlur(ctx, width, height, blurRadius)
  }

  return ctx.getImageData(0, 0, width, height)
}

/**
 * Convert skin concerns to heatmap points
 */
function concernsToHeatmapPoints(
  concerns: SkinConcernArea[],
  imageWidth: number,
  imageHeight: number
): HeatmapPoint[] {
  const points: HeatmapPoint[] = []

  for (const concern of concerns) {
    const { boundingBox, severity, confidence, heatmapData } = concern

    // If we have raw heatmap data from ML model, use it for precise rendering
    if (heatmapData && heatmapData.length > 0) {
      const gridH = heatmapData.length
      const gridW = heatmapData[0].length
      const cellW = boundingBox.width / gridW
      const cellH = boundingBox.height / gridH

      for (let i = 0; i < gridH; i++) {
        for (let j = 0; j < gridW; j++) {
          const intensity = heatmapData[i][j]
          if (intensity > 0.3) {
            // Only show significant detections
            points.push({
              x: boundingBox.x + j * cellW + cellW / 2,
              y: boundingBox.y + i * cellH + cellH / 2,
              intensity: intensity * confidence,
              radius: Math.max(cellW, cellH) * 1.5,
            })
          }
        }
      }
    } else {
      // Fallback: Create points based on bounding box
      const severityIntensity = {
        low: 0.4,
        medium: 0.65,
        high: 0.9,
      }

      const centerX = boundingBox.x + boundingBox.width / 2
      const centerY = boundingBox.y + boundingBox.height / 2
      const radius = Math.max(boundingBox.width, boundingBox.height) / 2

      // Create primary point at center
      points.push({
        x: centerX,
        y: centerY,
        intensity: severityIntensity[severity] * confidence,
        radius: radius * 1.2,
      })

      // Add secondary points for larger areas
      if (boundingBox.width > 50 || boundingBox.height > 50) {
        const numSecondaryPoints = 4
        for (let i = 0; i < numSecondaryPoints; i++) {
          const angle = (Math.PI * 2 * i) / numSecondaryPoints
          const distance = radius * 0.6
          points.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            intensity: severityIntensity[severity] * confidence * 0.7,
            radius: radius * 0.6,
          })
        }
      }
    }
  }

  return points
}

/**
 * Draw heatmap points on canvas
 */
function drawHeatmapPoints(
  ctx: CanvasRenderingContext2D,
  points: HeatmapPoint[],
  options: {
    opacity: number
    blurRadius: number
    colorScheme: 'default' | 'thermal' | 'grayscale'
  }
): void {
  const { opacity, colorScheme } = options

  // Set composite mode for additive blending
  ctx.globalCompositeOperation = 'screen'

  for (const point of points) {
    const { x, y, intensity, radius } = point

    // Create radial gradient for each point
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)

    // Get color based on intensity and color scheme
    const color = getHeatmapColor(intensity, colorScheme)

    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * opacity})`)
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * opacity * 0.5})`)
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  // Reset composite mode
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Get color for heatmap based on intensity
 */
function getHeatmapColor(
  intensity: number,
  scheme: 'default' | 'thermal' | 'grayscale'
): { r: number; g: number; b: number } {
  if (scheme === 'grayscale') {
    const value = Math.floor(intensity * 255)
    return { r: value, g: value, b: value }
  }

  if (scheme === 'thermal') {
    // Thermal color map: blue (cold) -> green -> yellow -> red (hot)
    if (intensity < 0.25) {
      // Blue to Cyan
      const t = intensity / 0.25
      return {
        r: 0,
        g: Math.floor(t * 255),
        b: 255,
      }
    } else if (intensity < 0.5) {
      // Cyan to Green
      const t = (intensity - 0.25) / 0.25
      return {
        r: 0,
        g: 255,
        b: Math.floor((1 - t) * 255),
      }
    } else if (intensity < 0.75) {
      // Green to Yellow
      const t = (intensity - 0.5) / 0.25
      return {
        r: Math.floor(t * 255),
        g: 255,
        b: 0,
      }
    } else {
      // Yellow to Red
      const t = (intensity - 0.75) / 0.25
      return {
        r: 255,
        g: Math.floor((1 - t) * 255),
        b: 0,
      }
    }
  }

  // Default: intensity-based warm colors (yellow -> orange -> red)
  if (intensity < 0.33) {
    // Low: Yellow
    return { r: 234, g: 179, b: 8 }
  } else if (intensity < 0.66) {
    // Medium: Orange
    return { r: 249, g: 115, b: 22 }
  } else {
    // High: Red
    return { r: 239, g: 68, b: 68 }
  }
}

/**
 * Apply Gaussian blur to canvas (simplified box blur approximation)
 */
function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
): void {
  if (radius <= 0) return

  // Use CSS filter blur (fastest option in browser)
  // Note: This is applied to the canvas context, not individual operations
  const imageData = ctx.getImageData(0, 0, width, height)
  
  // For proper Gaussian blur, we'd implement a convolution kernel
  // For now, using browser's built-in filter is fastest
  ctx.filter = `blur(${Math.min(radius / 2, 20)}px)`
  ctx.drawImage(ctx.canvas, 0, 0)
  ctx.filter = 'none'
}

/**
 * Overlay heatmap on original image
 */
export function overlayHeatmapOnImage(
  originalImage: ImageData,
  heatmapImage: ImageData,
  blendMode: 'multiply' | 'screen' | 'overlay' | 'lighter' = 'multiply',
  opacity: number = 0.6
): ImageData {
  const width = originalImage.width
  const height = originalImage.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Draw original image
  ctx.putImageData(originalImage, 0, 0)

  // Create temporary canvas for heatmap
  const heatmapCanvas = document.createElement('canvas')
  heatmapCanvas.width = width
  heatmapCanvas.height = height
  const heatmapCtx = heatmapCanvas.getContext('2d')
  
  if (!heatmapCtx) {
    throw new Error('Failed to get heatmap canvas context')
  }
  
  heatmapCtx.putImageData(heatmapImage, 0, 0)

  // Apply blend mode and opacity
  ctx.globalAlpha = opacity
  ctx.globalCompositeOperation = blendMode
  ctx.drawImage(heatmapCanvas, 0, 0)

  // Reset
  ctx.globalAlpha = 1.0
  ctx.globalCompositeOperation = 'source-over'

  return ctx.getImageData(0, 0, width, height)
}

/**
 * Generate multi-layer heatmap (different concern types in different colors)
 */
export function generateMultiLayerHeatmap(
  concerns: SkinConcernArea[],
  width: number,
  height: number,
  opacity: number = 0.6
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Concern type colors
  const concernColors: Record<string, { r: number; g: number; b: number }> = {
    wrinkle: { r: 59, g: 130, b: 246 }, // blue
    pigmentation: { r: 234, g: 179, b: 8 }, // yellow
    pore: { r: 168, g: 85, b: 247 }, // purple
    redness: { r: 239, g: 68, b: 68 }, // red
    acne: { r: 249, g: 115, b: 22 }, // orange
  }

  // Group concerns by type
  const concernsByType = concerns.reduce((acc, concern) => {
    if (!acc[concern.type]) {
      acc[concern.type] = []
    }
    acc[concern.type].push(concern)
    return acc
  }, {} as Record<string, SkinConcernArea[]>)

  // Draw each concern type with its color
  for (const [type, typeConcerns] of Object.entries(concernsByType)) {
    const points = concernsToHeatmapPoints(typeConcerns, width, height)
    const color = concernColors[type] || { r: 128, g: 128, b: 128 }

    for (const point of points) {
      const { x, y, intensity, radius } = point

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      const alpha = intensity * opacity

      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`)
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      ctx.fillStyle = gradient
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
  }

  return ctx.getImageData(0, 0, width, height)
}

/**
 * Export heatmap as data URL for download
 */
export function heatmapToDataURL(
  heatmap: ImageData,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): string {
  const canvas = document.createElement('canvas')
  canvas.width = heatmap.width
  canvas.height = heatmap.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  ctx.putImageData(heatmap, 0, 0)
  
  return canvas.toDataURL(`image/${format}`, quality)
}
