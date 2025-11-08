/**
 * Real-time AR Treatment Effects
 * Canvas-based image filters for treatment simulation
 */

export type TreatmentType = 
  | 'botox'
  | 'filler'
  | 'laser'
  | 'peel'
  | 'microneedling'
  | 'thread_lift'
  | 'none'

export interface TreatmentEffect {
  name: string
  apply: (
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    intensity: number,
    landmarks?: Array<{ x: number; y: number; z: number }>
  ) => ImageData
}

/**
 * Botox Effect - Smooth wrinkles and fine lines
 */
export const botoxEffect: TreatmentEffect = {
  name: 'Botox',
  apply: (ctx, imageData, intensity, landmarks) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Apply selective blur to wrinkle-prone areas
    const blurRadius = Math.floor(intensity * 3) + 1
    const tempData = new Uint8ClampedArray(data)

    // Focus on forehead and eye areas (landmarks 10, 67, 297, 109, 338)
    const targetRegions = landmarks ? getWrinkleRegions(landmarks, width, height) : null

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        // Check if in target region
        const isTarget = !targetRegions || isInRegion(x, y, targetRegions)

        if (isTarget) {
          // Apply Gaussian blur
          let r = 0, g = 0, b = 0, count = 0

          for (let dy = -blurRadius; dy <= blurRadius; dy++) {
            for (let dx = -blurRadius; dx <= blurRadius; dx++) {
              const nx = x + dx
              const ny = y + dy

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = (ny * width + nx) * 4
                r += tempData[nIdx]
                g += tempData[nIdx + 1]
                b += tempData[nIdx + 2]
                count++
              }
            }
          }

          // Blend original with blurred
          const blendFactor = intensity * 0.7
          data[idx] = Math.round(tempData[idx] * (1 - blendFactor) + (r / count) * blendFactor)
          data[idx + 1] = Math.round(tempData[idx + 1] * (1 - blendFactor) + (g / count) * blendFactor)
          data[idx + 2] = Math.round(tempData[idx + 2] * (1 - blendFactor) + (b / count) * blendFactor)
        }
      }
    }

    return imageData
  }
}

/**
 * Filler Effect - Add volume and glow to cheeks/lips
 */
export const fillerEffect: TreatmentEffect = {
  name: 'Filler',
  apply: (ctx, imageData, intensity, landmarks) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Get filler regions (cheeks and lips)
    const fillerRegions = landmarks ? getFillerRegions(landmarks, width, height) : null

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        // Check if in filler region
        const inRegion = fillerRegions ? isInRegion(x, y, fillerRegions) : false

        if (inRegion) {
          // Add subtle glow and brightness
          const glowAmount = intensity * 20
          data[idx] = Math.min(255, data[idx] + glowAmount)
          data[idx + 1] = Math.min(255, data[idx + 1] + glowAmount * 0.8)
          data[idx + 2] = Math.min(255, data[idx + 2] + glowAmount * 0.6)

          // Slight saturation increase
          const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          const saturation = 1 + (intensity * 0.2)
          data[idx] = Math.min(255, avg + (data[idx] - avg) * saturation)
          data[idx + 1] = Math.min(255, avg + (data[idx + 1] - avg) * saturation)
          data[idx + 2] = Math.min(255, avg + (data[idx + 2] - avg) * saturation)
        }
      }
    }

    return imageData
  }
}

/**
 * Laser Effect - Brighten skin, reduce spots
 */
export const laserEffect: TreatmentEffect = {
  name: 'Laser',
  apply: (ctx, imageData, intensity) => {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate brightness
      const brightness = (r + g + b) / 3

      // Brighten dark spots
      if (brightness < 150) {
        const boost = intensity * 15
        data[i] = Math.min(255, r + boost)
        data[i + 1] = Math.min(255, g + boost)
        data[i + 2] = Math.min(255, b + boost)
      }

      // Even out skin tone
      const avg = (r + g + b) / 3
      const eveningFactor = intensity * 0.3
      data[i] = Math.round(r * (1 - eveningFactor) + avg * eveningFactor)
      data[i + 1] = Math.round(g * (1 - eveningFactor) + avg * eveningFactor)
      data[i + 2] = Math.round(b * (1 - eveningFactor) + avg * eveningFactor)
    }

    return imageData
  }
}

/**
 * Chemical Peel Effect - Smooth texture, brighten
 */
export const peelEffect: TreatmentEffect = {
  name: 'Chemical Peel',
  apply: (ctx, imageData, intensity) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Light blur for texture smoothing
    const blurRadius = 1
    const tempData = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        let r = 0, g = 0, b = 0, count = 0

        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const nx = x + dx
            const ny = y + dy

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4
              r += tempData[nIdx]
              g += tempData[nIdx + 1]
              b += tempData[nIdx + 2]
              count++
            }
          }
        }

        // Blend smoothing + brightening
        const smoothFactor = intensity * 0.5
        const brightenAmount = intensity * 10

        data[idx] = Math.min(255, tempData[idx] * (1 - smoothFactor) + (r / count) * smoothFactor + brightenAmount)
        data[idx + 1] = Math.min(255, tempData[idx + 1] * (1 - smoothFactor) + (g / count) * smoothFactor + brightenAmount)
        data[idx + 2] = Math.min(255, tempData[idx + 2] * (1 - smoothFactor) + (b / count) * smoothFactor + brightenAmount)
      }
    }

    return imageData
  }
}

/**
 * Microneedling Effect - Improve texture and glow
 */
export const microneedlingEffect: TreatmentEffect = {
  name: 'Microneedling',
  apply: (ctx, imageData, intensity) => {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      // Enhance natural glow
      const glowBoost = intensity * 8
      data[i] = Math.min(255, data[i] + glowBoost)
      data[i + 1] = Math.min(255, data[i + 1] + glowBoost)
      data[i + 2] = Math.min(255, data[i + 2] + glowBoost)

      // Slight saturation increase
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const saturation = 1 + (intensity * 0.15)
      data[i] = Math.min(255, avg + (data[i] - avg) * saturation)
      data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * saturation)
      data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * saturation)
    }

    return imageData
  }
}

/**
 * Thread Lift Effect - Subtle lifting appearance
 */
export const threadLiftEffect: TreatmentEffect = {
  name: 'Thread Lift',
  apply: (ctx, imageData, intensity, landmarks) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Apply vertical compression to simulate lift
    const liftAmount = intensity * 5
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')

    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0)

      // Transform: slight upward shift in lower face
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      
      // Apply transform
      const centerY = height * 0.6
      ctx.translate(0, -liftAmount)
      ctx.scale(1, 1 - (intensity * 0.02))
      ctx.translate(0, centerY)
      
      ctx.drawImage(tempCanvas, 0, 0)
      ctx.restore()

      return ctx.getImageData(0, 0, width, height)
    }

    return imageData
  }
}

/**
 * Get all treatment effects
 */
export const treatmentEffects: Record<TreatmentType, TreatmentEffect | null> = {
  botox: botoxEffect,
  filler: fillerEffect,
  laser: laserEffect,
  peel: peelEffect,
  microneedling: microneedlingEffect,
  thread_lift: threadLiftEffect,
  none: null
}

/**
 * Helper: Get wrinkle-prone regions from landmarks
 */
function getWrinkleRegions(
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
) {
  // Forehead: landmarks 10, 67, 109, 338, 297
  const foreheadPoints = [10, 67, 109, 338, 297].map(i => ({
    x: landmarks[i].x * width,
    y: landmarks[i].y * height
  }))

  // Eye corners: landmarks 33, 133, 362, 263
  const eyePoints = [33, 133, 362, 263].map(i => ({
    x: landmarks[i].x * width,
    y: landmarks[i].y * height
  }))

  return [...foreheadPoints, ...eyePoints]
}

/**
 * Helper: Get filler target regions (cheeks, lips)
 */
function getFillerRegions(
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
) {
  // Cheeks: landmarks 50, 280
  // Lips: landmarks 61-68, 291-298
  const regions = [50, 280, 61, 62, 63, 64, 65, 66, 67, 68, 291, 292, 293, 294, 295, 296, 297, 298]
    .map(i => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height
    }))

  return regions
}

/**
 * Helper: Check if point is in region (with radius)
 */
function isInRegion(
  x: number,
  y: number,
  regions: Array<{ x: number; y: number }>,
  radius: number = 30
): boolean {
  return regions.some(point => {
    const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
    return dist < radius
  })
}
