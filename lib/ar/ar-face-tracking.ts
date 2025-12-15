import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export class ARFaceTracker {
  private model: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private isTracking: boolean = false;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private onFaceDetected: (landmarks: FaceLandmark[]) => void;
  private lastDetectionTime: number = 0;
  private detectionInterval: number = 100; // ms

  constructor(
    onFaceDetected: (landmarks: FaceLandmark[]) => void,
    options: { detectionInterval?: number } = {}
  ) {
    this.onFaceDetected = onFaceDetected;
    this.detectionInterval = options.detectionInterval || this.detectionInterval;
  }

  async initialize() {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      
      this.model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          maxFaces: 1,
          refineLandmarks: true
        }
      );
      
      console.log('AR Face Tracker initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AR Face Tracker:', error);
      return false;
    }
  }

  async start(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    if (!this.model) {
      console.error('AR Face Tracker not initialized');
      return false;
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.isTracking = true;

    const detectFace = async () => {
      if (!this.model || !this.videoElement || !this.canvasElement || !this.isTracking) {
        return;
      }

      const now = Date.now();
      if (now - this.lastDetectionTime >= this.detectionInterval) {
        try {
          // The estimateFaces method expects a PixelInput (HTMLVideoElement, HTMLImageElement, or HTMLCanvasElement)
          // and an optional configuration object
          const predictions = await this.model.estimateFaces(
            this.videoElement as HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
            {
              flipHorizontal: false
            }
          );

          if (predictions.length > 0) {
            const rawLandmarks =
              // tfjs MediaPipeFaceMesh (runtime: mediapipe) exposes keypoints
              // while some variants expose scaledMesh/mesh; try all in order.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((predictions[0] as any).keypoints ??
                (predictions[0] as any).scaledMesh ??
                (predictions[0] as any).mesh ??
                []);
            const formattedLandmarks = rawLandmarks.map((point: any) => ({
              x: point.x,
              y: point.y,
              z: point.z ?? 0
            }));
            
            this.onFaceDetected(formattedLandmarks);
            this.lastDetectionTime = now;
          }
        } catch (error) {
          console.error('Error during face detection:', error);
        }
      }

      this.animationFrameId = requestAnimationFrame(detectFace);
    };

    detectFace();
    return true;
  }

  stop() {
    this.isTracking = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  dispose() {
    this.stop();
    if (this.model) {
      // @ts-ignore
      if (this.model.dispose) this.model.dispose();
      this.model = null;
    }
    tf.disposeVariables();
  }

  // Utility methods for face analysis
  static calculateFaceOrientation(landmarks: FaceLandmark[]) {
    // Calculate face orientation based on landmarks
    // Returns pitch, yaw, roll in degrees
    if (landmarks.length < 10) return { pitch: 0, yaw: 0, roll: 0 };
    
    // Simple calculation - can be enhanced with more sophisticated algorithms
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const noseBase = landmarks[2];
    
    // Calculate yaw (rotation around Y-axis)
    const eyeDist = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    );
    
    const noseOffset = ((nose.x - leftEye.x) / eyeDist) - 0.5;
    const yaw = Math.atan2(noseOffset, 1) * (180 / Math.PI);
    
    // Calculate pitch (rotation around X-axis)
    const verticalDist = Math.sqrt(
      Math.pow(nose.x - noseBase.x, 2) + 
      Math.pow(nose.y - noseBase.y, 2)
    );
    const pitch = Math.atan2(nose.y - noseBase.y, verticalDist) * (180 / Math.PI);
    
    // Calculate roll (rotation around Z-axis)
    const roll = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x
    ) * (180 / Math.PI);
    
    return { pitch, yaw, roll };
  }
}

// Helper function to initialize camera
async function setupCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
        frameRate: { ideal: 30, max: 60 }
      },
      audio: false
    });
    
    videoElement.srcObject = stream;
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve(true);
      };
    });
    
    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
}

export { setupCamera };
