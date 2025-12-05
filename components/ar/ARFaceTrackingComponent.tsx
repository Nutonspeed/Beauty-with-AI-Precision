'use client';

import { useEffect, useRef, useState } from 'react';
import { ARFaceTracker, setupCamera } from '@/lib/ar/ar-face-tracking';

export default function ARFaceTrackingComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracker, setTracker] = useState<ARFaceTracker | null>(null);
  const [faceData, setFaceData] = useState<{
    landmarks: any[];
    orientation: { pitch: number; yaw: number; roll: number };
  } | null>(null);

  // Initialize AR Face Tracker
  useEffect(() => {
    const init = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;

        // Set up camera
        const cameraReady = await setupCamera(videoRef.current);
        if (!cameraReady) {
          throw new Error('Failed to access camera');
        }

        // Initialize face tracker
        const faceTracker = new ARFaceTracker((landmarks) => {
          const orientation = ARFaceTracker.calculateFaceOrientation(landmarks);
          setFaceData({ landmarks, orientation });
        });

        const initialized = await faceTracker.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize face tracker');
        }

        // Start tracking
        await faceTracker.start(videoRef.current, canvasRef.current);
        setTracker(faceTracker);
        setIsInitialized(true);
      } catch (err) {
        console.error('AR Face Tracking initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize AR Face Tracking');
      }
    };

    init();

    // Cleanup
    return () => {
      if (tracker) {
        tracker.stop();
        tracker.dispose();
      }
    };
  }, []);

  // Draw face landmarks on canvas
  useEffect(() => {
    if (!isInitialized || !faceData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw face landmarks
    if (faceData.landmarks.length > 0) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      
      // Draw face contours
      const contours = [
        // Face oval
        [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
        // Left eyebrow
        [70, 63, 105, 66, 107, 46, 53, 52, 65],
        // Right eyebrow
        [334, 296, 336, 296, 283, 282, 295, 285, 295],
        // Nose
        [168, 6, 197, 195, 5, 4, 1, 19, 354, 10],
        // Left eye
        [33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 249, 390, 373, 33],
        // Right eye
        [362, 398, 384, 381, 385, 380, 374, 386, 387, 388, 466, 263, 249, 390, 373, 362],
        // Mouth outer
        [61, 291, 39, 181, 0, 17, 269, 405, 314, 308, 324, 318, 61],
        // Mouth inner
        [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 78]
      ];

      contours.forEach(contour => {
        ctx.beginPath();
        contour.forEach((pointIdx, i) => {
          if (i >= faceData.landmarks.length) return;
          const point = faceData.landmarks[pointIdx] || { x: 0, y: 0 };
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      });

      // Draw orientation indicators
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw pitch indicator
      ctx.strokeStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(centerX - 50, centerY);
      ctx.lineTo(centerX + 50, centerY);
      ctx.stroke();
      
      // Draw yaw indicator
      ctx.strokeStyle = '#00FF00';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 50);
      ctx.lineTo(centerX, centerY + 50);
      ctx.stroke();
      
      // Draw roll indicator (circle)
      ctx.strokeStyle = '#0000FF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [faceData, isInitialized]);

  if (error) {
    return (
      <div className="ar-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Please ensure you've granted camera permissions and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-container relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-lg shadow-lg"
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
        />
        
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
              <p>Initializing AR Face Tracking...</p>
              <p className="text-sm opacity-75">Please allow camera access when prompted</p>
            </div>
          </div>
        )}
      </div>
      
      {faceData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Face Tracking Data</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Pitch</p>
              <p className="text-lg font-mono">{faceData.orientation.pitch.toFixed(1)}°</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Yaw</p>
              <p className="text-lg font-mono">{faceData.orientation.yaw.toFixed(1)}°</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Roll</p>
              <p className="text-lg font-mono">{faceData.orientation.roll.toFixed(1)}°</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Landmarks Detected</p>
            <p className="text-lg font-mono">{faceData.landmarks.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Type definitions for @tensorflow-models/face-landmarks-detection
// These types are automatically included from the @tensorflow-models/face-landmarks-detection package
// No need to redeclare them here as they cause conflicts with the actual package types
