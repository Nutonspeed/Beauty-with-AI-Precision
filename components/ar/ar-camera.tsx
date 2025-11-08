'use client';

/**
 * AR Camera Component
 * Real-time webcam with MediaPipe face mesh overlay
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getFaceMeshService, type FaceMeshResult, FACE_LANDMARKS } from '@/lib/ar/mediapipe-face-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff, Download, RefreshCw } from 'lucide-react';

export interface ARCameraProps {
  onCapture?: (imageData: string) => void;
  onFaceMeshUpdate?: (result: FaceMeshResult | null) => void;
  showMesh?: boolean;
  showLandmarks?: boolean;
  className?: string;
}

export function ARCamera({
  onCapture,
  onFaceMeshUpdate,
  showMesh = true,
  showLandmarks = true,
  className = '',
}: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceMeshResult, setFaceMeshResult] = useState<FaceMeshResult | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Initialize and start camera
   */
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    setIsInitializing(true);
    setError(null);

    try {
      const faceMeshService = getFaceMeshService();

      // Initialize MediaPipe
      await faceMeshService.initialize({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Start camera
      await faceMeshService.startCamera(videoRef.current, (result) => {
        setFaceMeshResult(result);
        if (onFaceMeshUpdate) {
          onFaceMeshUpdate(result);
        }
      });

      setIsActive(true);
      startDrawing();
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
    } finally {
      setIsInitializing(false);
    }
  }, [onFaceMeshUpdate]);

  /**
   * Stop camera
   */
  const stopCamera = useCallback(() => {
    const faceMeshService = getFaceMeshService();
    faceMeshService.stopCamera();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsActive(false);
    setFaceMeshResult(null);
  }, []);

  /**
   * Draw face mesh overlay
   */
  const drawFaceMesh = useCallback(
    (result: FaceMeshResult | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!result || !result.landmarks) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw face mesh
      if (showMesh) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;

        // Draw silhouette
        drawPath(ctx, result.landmarks, FACE_LANDMARKS.SILHOUETTE, width, height, true);

        // Draw eyes
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
        drawPath(ctx, result.landmarks, FACE_LANDMARKS.LEFT_EYE, width, height, true);
        drawPath(ctx, result.landmarks, FACE_LANDMARKS.RIGHT_EYE, width, height, true);

        // Draw lips
        ctx.strokeStyle = 'rgba(255, 0, 150, 0.6)';
        drawPath(ctx, result.landmarks, FACE_LANDMARKS.LIPS_OUTER, width, height, true);
      }

      // Draw key landmarks
      if (showLandmarks) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        const keyPoints = [
          ...FACE_LANDMARKS.NOSE,
          result.landmarks[33].x, // Right eye center
          result.landmarks[263].x, // Left eye center
        ];

        for (const index of keyPoints) {
          if (typeof index === 'number' && result.landmarks[index]) {
            const point = result.landmarks[index];
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }

      // Draw bounding box
      if (result.boundingBox) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          result.boundingBox.xMin * width,
          result.boundingBox.yMin * height,
          result.boundingBox.width * width,
          result.boundingBox.height * height
        );
      }
    },
    [showMesh, showLandmarks]
  );

  /**
   * Helper: Draw path from landmark indices
   */
  const drawPath = (
    ctx: CanvasRenderingContext2D,
    landmarks: FaceMeshResult['landmarks'],
    indices: number[],
    width: number,
    height: number,
    closed: boolean = false
  ) => {
    if (indices.length === 0) return;

    ctx.beginPath();
    const first = landmarks[indices[0]];
    ctx.moveTo(first.x * width, first.y * height);

    for (let i = 1; i < indices.length; i++) {
      const point = landmarks[indices[i]];
      ctx.lineTo(point.x * width, point.y * height);
    }

    if (closed) {
      ctx.closePath();
    }
    ctx.stroke();
  };

  /**
   * Animation loop for drawing
   */
  const startDrawing = useCallback(() => {
    const draw = () => {
      drawFaceMesh(faceMeshResult);
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, [faceMeshResult, drawFaceMesh]);

  /**
   * Capture current frame
   */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Get data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    if (onCapture) {
      onCapture(imageData);
    }
  }, [onCapture]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /**
   * Update drawing when face mesh result changes
   */
  useEffect(() => {
    if (isActive) {
      drawFaceMesh(faceMeshResult);
    }
  }, [faceMeshResult, isActive, drawFaceMesh]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        {/* Video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Canvas overlay for face mesh */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Status overlay */}
        {!isActive && !isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Camera Off</p>
            </div>
          </div>
        )}

        {/* Face detection status */}
        {isActive && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {faceMeshResult ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {' '}Face Detected
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                {' '}Looking for face...
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex gap-2 justify-center bg-muted">
        {isActive ? (
          <>
            <Button onClick={stopCamera} variant="destructive" className="gap-2">
              <CameraOff className="w-4 h-4" />
              Stop
            </Button>
            <Button onClick={captureFrame} variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              Capture
            </Button>
            <Button
              onClick={() => {
                stopCamera();
                setTimeout(startCamera, 100);
              }}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restart
            </Button>
          </>
        ) : (
          <Button
            onClick={startCamera}
            disabled={isInitializing}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            {isInitializing ? 'Starting...' : 'Start Camera'}
          </Button>
        )}
      </div>
    </Card>
  );
}
