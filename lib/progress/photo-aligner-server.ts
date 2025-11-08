/**
 * Progress Photo Aligner
 * 
 * Aligns multiple progress photos using MediaPipe face landmarks
 * for accurate before/after comparison
 */

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

interface AlignmentResult {
  transformMatrix: number[][];
  alignmentScore: number;
  alignedImageUrl: string;
  confidence: number;
  landmarks: {
    source: number;
    target: number;
  };
  quality: {
    rotation: number; // degrees
    scale: number;
    translation: { x: number; y: number };
  };
}

let faceLandmarker: FaceLandmarker | null = null;

/**
 * Initialize MediaPipe Face Landmarker
 */
async function initFaceLandmarker(): Promise<void> {
  if (faceLandmarker) return;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
      delegate: 'GPU',
    },
    numFaces: 1,
    runningMode: 'IMAGE',
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

/**
 * Extract landmarks from image
 */
async function extractLandmarks(imageUrl: string): Promise<LandmarkPoint[]> {
  await initFaceLandmarker();
  if (!faceLandmarker) throw new Error('Face landmarker not initialized');

  // Load image
  const img = await loadImage(imageUrl);
  
  // Extract landmarks
  const result = faceLandmarker.detect(img);
  
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw new Error('No face detected in image');
  }

  return result.faceLandmarks[0].map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z || 0,
  }));
}

/**
 * Load image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Calculate alignment transformation matrix with enhanced metrics
 * 
 * Uses Procrustes analysis to find optimal alignment
 */
function calculateAlignment(
  sourceLandmarks: LandmarkPoint[],
  targetLandmarks: LandmarkPoint[]
): { 
  matrix: number[][];
  score: number;
  rotation: number;
  scale: number;
  translation: { x: number; y: number };
} {
  // Use key facial landmarks for alignment
  // (face oval, eyes, nose tip, mouth corners)
  const keyIndices = [
    10, 152, 234, 454, // Face oval
    33, 263, // Eye corners
    1, // Nose tip
    61, 291, // Mouth corners
  ];

  // Extract key points
  const sourcePoints = keyIndices.map((i) => sourceLandmarks[i]);
  const targetPoints = keyIndices.map((i) => targetLandmarks[i]);

  // Calculate centroids
  const sourceCentroid = calculateCentroid(sourcePoints);
  const targetCentroid = calculateCentroid(targetPoints);

  // Center points
  const sourceCentered = centerPoints(sourcePoints, sourceCentroid);
  const targetCentered = centerPoints(targetPoints, targetCentroid);

  // Calculate scale
  const sourceScale = calculateScale(sourceCentered);
  const targetScale = calculateScale(targetCentered);
  const scale = targetScale / sourceScale;

  // Calculate rotation (simplified 2D)
  const rotation = calculateRotation(sourceCentered, targetCentered);

  // Build transformation matrix
  // [scale*cos(θ), -scale*sin(θ), tx]
  // [scale*sin(θ),  scale*cos(θ), ty]
  // [0,             0,            1 ]
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const translation = {
    x: targetCentroid.x - scale * (cos * sourceCentroid.x - sin * sourceCentroid.y),
    y: targetCentroid.y - scale * (sin * sourceCentroid.x + cos * sourceCentroid.y)
  };
  
  const matrix = [
    [scale * cos, -scale * sin, translation.x],
    [scale * sin, scale * cos, translation.y],
    [0, 0, 1],
  ];

  // Calculate alignment score (0-1) with improved algorithm
  const score = calculateAlignmentScore(sourceCentered, targetCentered, scale, rotation);

  return { matrix, score, rotation, scale, translation };
}

function calculateCentroid(points: LandmarkPoint[]): { x: number; y: number } {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function centerPoints(
  points: LandmarkPoint[],
  centroid: { x: number; y: number }
): LandmarkPoint[] {
  return points.map((p) => ({
    x: p.x - centroid.x,
    y: p.y - centroid.y,
    z: p.z,
  }));
}

function calculateScale(points: LandmarkPoint[]): number {
  const distances = points.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  return distances.reduce((a, b) => a + b, 0) / distances.length;
}

function calculateRotation(
  sourcePoints: LandmarkPoint[],
  targetPoints: LandmarkPoint[]
): number {
  let num = 0;
  let den = 0;
  for (let i = 0; i < sourcePoints.length; i++) {
    num += sourcePoints[i].x * targetPoints[i].y - sourcePoints[i].y * targetPoints[i].x;
    den += sourcePoints[i].x * targetPoints[i].x + sourcePoints[i].y * targetPoints[i].y;
  }
  return Math.atan2(num, den);
}

/**
 * Calculate improved alignment score with multiple quality metrics
 */
function calculateAlignmentScore(
  sourcePoints: LandmarkPoint[],
  targetPoints: LandmarkPoint[],
  scale: number,
  rotation: number
): number {
  // Apply transformation to source points
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  
  const transformed = sourcePoints.map((p) => ({
    x: scale * (cos * p.x - sin * p.y),
    y: scale * (sin * p.x + cos * p.y),
  }));

  // Calculate average distance after alignment (primary metric)
  let totalDistance = 0;
  let maxDistance = 0;
  for (let i = 0; i < transformed.length; i++) {
    const dx = transformed[i].x - targetPoints[i].x;
    const dy = transformed[i].y - targetPoints[i].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;
    maxDistance = Math.max(maxDistance, distance);
  }
  const avgDistance = totalDistance / transformed.length;

  // Calculate variance (consistency metric)
  let variance = 0;
  for (let i = 0; i < transformed.length; i++) {
    const dx = transformed[i].x - targetPoints[i].x;
    const dy = transformed[i].y - targetPoints[i].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    variance += Math.pow(distance - avgDistance, 2);
  }
  variance /= transformed.length;
  const stdDev = Math.sqrt(variance);

  // Weighted scoring
  // - 70% from average distance (accuracy)
  // - 20% from max distance (outlier penalty)
  // - 10% from standard deviation (consistency)
  const distanceScore = Math.max(0, 1 - avgDistance / 0.15);
  const maxDistanceScore = Math.max(0, 1 - maxDistance / 0.3);
  const consistencyScore = Math.max(0, 1 - stdDev / 0.1);

  const finalScore = (
    distanceScore * 0.7 +
    maxDistanceScore * 0.2 +
    consistencyScore * 0.1
  );

  return Math.max(0, Math.min(1, finalScore));
}

/**
 * Apply transformation to image with quality control
 */
async function transformImage(
  imageUrl: string,
  matrix: number[][],
  width: number,
  height: number,
  quality: number = 0.95
): Promise<string> {
  const img = await loadImage(imageUrl);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
  });
  if (!ctx) throw new Error('Failed to get canvas context');

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Apply transformation matrix
  ctx.setTransform(
    matrix[0][0], // a (scale x)
    matrix[1][0], // b (skew y)
    matrix[0][1], // c (skew x)
    matrix[1][1], // d (scale y)
    matrix[0][2], // e (translate x)
    matrix[1][2]  // f (translate y)
  );

  // Draw image
  ctx.drawImage(img, 0, 0);

  // Convert to data URL with specified quality
  const format = quality >= 0.9 ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(format, quality);
}

/**
 * Align source image to match target image with enhanced quality options
 */
export async function alignPhotos(
  sourceImageUrl: string,
  targetImageUrl: string,
  quality: number = 0.95
): Promise<AlignmentResult> {
  // Extract landmarks from both images
  const [sourceLandmarks, targetLandmarks] = await Promise.all([
    extractLandmarks(sourceImageUrl),
    extractLandmarks(targetImageUrl),
  ]);

  console.log(`✅ Extracted ${sourceLandmarks.length} source landmarks and ${targetLandmarks.length} target landmarks`);

  // Calculate alignment transformation
  const { matrix, score, rotation, scale, translation } = calculateAlignment(
    sourceLandmarks,
    targetLandmarks
  );

  console.log(`📊 Alignment metrics:`, {
    score: (score * 100).toFixed(1) + '%',
    rotation: ((rotation * 180) / Math.PI).toFixed(2) + '°',
    scale: scale.toFixed(3),
    translation: `(${translation.x.toFixed(1)}, ${translation.y.toFixed(1)})`
  });

  // Load target image to get dimensions
  const targetImg = await loadImage(targetImageUrl);

  // Apply transformation with quality setting
  const alignedImageUrl = await transformImage(
    sourceImageUrl,
    matrix,
    targetImg.width,
    targetImg.height,
    quality
  );

  // Calculate confidence based on landmark count and score
  const minLandmarks = Math.min(sourceLandmarks.length, targetLandmarks.length);
  const landmarkConfidence = Math.min(1, minLandmarks / 468); // MediaPipe has 468 landmarks
  const confidence = (score * 0.7 + landmarkConfidence * 0.3);

  return {
    transformMatrix: matrix,
    alignmentScore: score,
    alignedImageUrl,
    confidence,
    landmarks: {
      source: sourceLandmarks.length,
      target: targetLandmarks.length,
    },
    quality: {
      rotation: (rotation * 180) / Math.PI, // Convert to degrees
      scale,
      translation,
    },
  };
}

/**
 * Batch align multiple photos to a baseline
 */
export async function batchAlign(
  baselineImageUrl: string,
  progressImageUrls: string[],
  quality: number = 0.95
): Promise<AlignmentResult[]> {
  const baselineLandmarks = await extractLandmarks(baselineImageUrl);
  const baselineImg = await loadImage(baselineImageUrl);

  const results = await Promise.all(
    progressImageUrls.map(async (url) => {
      const landmarks = await extractLandmarks(url);
      const { matrix, score, rotation, scale, translation } = calculateAlignment(
        landmarks,
        baselineLandmarks
      );
      const alignedImageUrl = await transformImage(
        url,
        matrix,
        baselineImg.width,
        baselineImg.height,
        quality
      );
      
      const minLandmarks = Math.min(landmarks.length, baselineLandmarks.length);
      const landmarkConfidence = Math.min(1, minLandmarks / 468);
      const confidence = (score * 0.7 + landmarkConfidence * 0.3);
      
      return {
        transformMatrix: matrix,
        alignmentScore: score,
        alignedImageUrl,
        confidence,
        landmarks: {
          source: landmarks.length,
          target: baselineLandmarks.length,
        },
        quality: {
          rotation: (rotation * 180) / Math.PI,
          scale,
          translation,
        },
      };
    })
  );

  return results;
}

/**
 * Check if two photos are well-aligned
 */
export function isWellAligned(alignmentScore: number): boolean {
  return alignmentScore >= 0.7; // 70% threshold
}
