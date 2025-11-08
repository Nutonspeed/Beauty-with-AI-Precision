/**
 * MediaPipe Face Mesh Service
 * ใช้ MediaPipe สำหรับ real-time facial landmark detection
 * 468 landmarks สำหรับ AR overlay
 */

import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export interface FaceMeshPoint {
  x: number;
  y: number;
  z: number;
}

export interface FaceMeshResult {
  landmarks: FaceMeshPoint[];
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
  };
  timestamp: number;
}

export interface FaceMeshConfig {
  maxNumFaces: number;
  refineLandmarks: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

const DEFAULT_CONFIG: FaceMeshConfig = {
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

/**
 * MediaPipe Face Mesh Service Class
 */
export class MediaPipeFaceMeshService {
  private faceMesh: FaceMesh | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isInitialized = false;
  private onResultsCallback: ((result: FaceMeshResult | null) => void) | null = null;

  /**
   * Initialize MediaPipe Face Mesh
   */
  async initialize(config: Partial<FaceMeshConfig> = {}): Promise<void> {
    if (this.isInitialized) {
      console.warn('Face Mesh already initialized');
      return;
    }

    try {
      console.log('🎯 Initializing MediaPipe Face Mesh...');

      const finalConfig = { ...DEFAULT_CONFIG, ...config };

      // Create Face Mesh instance
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      // Configure Face Mesh
      this.faceMesh.setOptions({
        maxNumFaces: finalConfig.maxNumFaces,
        refineLandmarks: finalConfig.refineLandmarks,
        minDetectionConfidence: finalConfig.minDetectionConfidence,
        minTrackingConfidence: finalConfig.minTrackingConfidence,
      });

      // Set up results handler
      this.faceMesh.onResults((results: Results) => {
        this.handleResults(results);
      });

      this.isInitialized = true;
      console.log('✅ Face Mesh initialized');
    } catch (error) {
      console.error('❌ Face Mesh initialization error:', error);
      throw new Error('Failed to initialize Face Mesh');
    }
  }

  /**
   * Start camera and face tracking
   */
  async startCamera(
    videoElement: HTMLVideoElement,
    onResults: (result: FaceMeshResult | null) => void
  ): Promise<void> {
    if (!this.isInitialized || !this.faceMesh) {
      throw new Error('Face Mesh not initialized');
    }

    try {
      console.log('📹 Starting camera...');

      this.videoElement = videoElement;
      this.onResultsCallback = onResults;

      // Create camera instance
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.faceMesh && videoElement) {
            await this.faceMesh.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720,
      });

      await this.camera.start();
      console.log('✅ Camera started');
    } catch (error) {
      console.error('❌ Camera start error:', error);
      throw new Error('Failed to start camera');
    }
  }

  /**
   * Stop camera and tracking
   */
  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
      console.log('🛑 Camera stopped');
    }

    if (this.videoElement) {
      const stream = this.videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Process single image (non-real-time)
   */
  async processImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FaceMeshResult | null> {
    if (!this.isInitialized || !this.faceMesh) {
      throw new Error('Face Mesh not initialized');
    }

    return new Promise((resolve) => {
      const tempCallback = this.onResultsCallback;

      this.onResultsCallback = (result) => {
        this.onResultsCallback = tempCallback;
        resolve(result);
      };

      this.faceMesh!.send({ image: imageElement });
    });
  }

  /**
   * Handle MediaPipe results
   */
  private handleResults(results: Results): void {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected
      if (this.onResultsCallback) {
        this.onResultsCallback(null);
      }
      return;
    }

    // Get first face (we use maxNumFaces: 1)
    const landmarks = results.multiFaceLandmarks[0];

    // Convert landmarks to our format
    const faceMeshPoints: FaceMeshPoint[] = landmarks.map((landmark) => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z || 0,
    }));

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(faceMeshPoints);

    const result: FaceMeshResult = {
      landmarks: faceMeshPoints,
      boundingBox,
      timestamp: Date.now(),
    };

    if (this.onResultsCallback) {
      this.onResultsCallback(result);
    }
  }

  /**
   * Calculate bounding box from landmarks
   */
  private calculateBoundingBox(landmarks: FaceMeshPoint[]): FaceMeshResult['boundingBox'] {
    let xMin = Infinity;
    let yMin = Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;

    for (const point of landmarks) {
      xMin = Math.min(xMin, point.x);
      yMin = Math.min(yMin, point.y);
      xMax = Math.max(xMax, point.x);
      yMax = Math.max(yMax, point.y);
    }

    return {
      xMin,
      yMin,
      xMax,
      yMax,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopCamera();

    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }

    this.isInitialized = false;
    this.onResultsCallback = null;
    console.log('🗑️ Face Mesh disposed');
  }
}

/**
 * Singleton instance
 */
let faceMeshService: MediaPipeFaceMeshService | null = null;

/**
 * Get Face Mesh service instance
 */
export function getFaceMeshService(): MediaPipeFaceMeshService {
  if (!faceMeshService) {
    faceMeshService = new MediaPipeFaceMeshService();
  }
  return faceMeshService;
}

/**
 * Face Mesh landmark indices (key points)
 */
export const FACE_LANDMARKS = {
  // Silhouette (face outline)
  SILHOUETTE: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
    148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
  ],

  // Left eye
  LEFT_EYE: [
    263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466,
  ],

  // Right eye
  RIGHT_EYE: [
    33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
  ],

  // Lips
  LIPS_OUTER: [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88,
    95,
  ],
  LIPS_INNER: [
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
  ],

  // Nose
  NOSE: [1, 2, 98, 327, 168, 6, 195, 5],

  // Face regions for analysis
  FOREHEAD: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323],
  LEFT_CHEEK: [234, 93, 132, 58, 172, 136, 150, 149],
  RIGHT_CHEEK: [454, 323, 361, 288, 397, 365, 379, 378],
  CHIN: [152, 148, 176, 149, 150, 136, 172, 58],
  NOSE_BRIDGE: [6, 168, 195, 5],
};

/**
 * Helper: แปลง normalized coordinates เป็น pixel coordinates
 */
export function landmarksToPixels(
  landmarks: FaceMeshPoint[],
  width: number,
  height: number
): Array<{ x: number; y: number; z: number }> {
  return landmarks.map((point) => ({
    x: point.x * width,
    y: point.y * height,
    z: point.z,
  }));
}

/**
 * Helper: ดึง landmarks ของ region เฉพาะ
 */
export function getRegionLandmarks(
  landmarks: FaceMeshPoint[],
  region: keyof typeof FACE_LANDMARKS
): FaceMeshPoint[] {
  const indices = FACE_LANDMARKS[region];
  return indices.map((index) => landmarks[index]);
}
