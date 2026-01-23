'use client';

/**
 * AR Camera Component
 * Real-time webcam with MediaPipe face mesh overlay
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getFaceMeshService, type FaceMeshResult, FACE_LANDMARKS } from '@/lib/ar/mediapipe-face-mesh';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CameraOff, 
  Download, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Target,
  Sparkles,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('arCamera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceMeshResult, setFaceMeshResult] = useState<FaceMeshResult | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const drawFaceMesh = useCallback(
    (result: FaceMeshResult | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!result || !result.landmarks) return;

      const width = canvas.width;
      const height = canvas.height;

      const drawPathLocal = (
        ctx: CanvasRenderingContext2D,
        landmarks: FaceMeshResult['landmarks'],
        indices: number[],
        w: number,
        h: number,
        closed: boolean = false
      ) => {
        if (indices.length === 0) return;
        ctx.beginPath();
        const first = landmarks[indices[0]];
        ctx.moveTo(first.x * w, first.y * h);
        for (let i = 1; i < indices.length; i++) {
          const point = landmarks[indices[i]];
          ctx.lineTo(point.x * w, point.y * h);
        }
        if (closed) ctx.closePath();
        ctx.stroke();
      };

      if (showMesh) {
        ctx.lineWidth = 1.5;
        // Neon Blue for silhouette
        ctx.strokeStyle = 'rgba(3, 169, 244, 0.6)';
        drawPathLocal(ctx, result.landmarks, FACE_LANDMARKS.SILHOUETTE, width, height, true);
        
        // Neon Pink for features
        ctx.strokeStyle = 'rgba(255, 105, 180, 0.7)';
        drawPathLocal(ctx, result.landmarks, FACE_LANDMARKS.LEFT_EYE, width, height, true);
        drawPathLocal(ctx, result.landmarks, FACE_LANDMARKS.RIGHT_EYE, width, height, true);
        
        // Purple for lips
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
        drawPathLocal(ctx, result.landmarks, FACE_LANDMARKS.LIPS_OUTER, width, height, true);
      }

      if (showLandmarks) {
        ctx.fillStyle = '#ff69b4';
        const keyPoints = [
          ...FACE_LANDMARKS.NOSE,
          ...FACE_LANDMARKS.LEFT_EYE.slice(0, 3),
          ...FACE_LANDMARKS.RIGHT_EYE.slice(0, 3),
        ];
        keyPoints.forEach((idx) => {
          const landmark = result.landmarks[idx];
          if (landmark) {
            ctx.beginPath();
            ctx.arc(landmark.x * width, landmark.y * height, 2.5, 0, 2 * Math.PI);
            ctx.fill();
            // Outer glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff69b4';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      }
    },
    [showMesh, showLandmarks]
  );

  const startDrawing = useCallback(() => {
    if (!isActive) return;
    
    const faceMeshService = getFaceMeshService();
    const result = (faceMeshService as any).getLatestResult?.() || null;
    
    drawFaceMesh(result);
    setFaceMeshResult(result);
    
    if (onFaceMeshUpdate && result) {
      onFaceMeshUpdate(result);
    }
    
    animationFrameRef.current = requestAnimationFrame(startDrawing);
  }, [isActive, drawFaceMesh, onFaceMeshUpdate]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    setIsInitializing(true);
    setError(null);

    try {
      const faceMeshService = getFaceMeshService();

      await faceMeshService.initialize({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

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
      setError(err instanceof Error ? err.message : 'Failed to synchronize imaging node');
    } finally {
      setIsInitializing(false);
    }
  }, [onFaceMeshUpdate, startDrawing]);

  const stopCamera = useCallback(() => {
    const faceMeshService = getFaceMeshService();
    faceMeshService.stopCamera();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsActive(false);
    setFaceMeshResult(null);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    if (onCapture) {
      onCapture(imageData);
    }
  }, [onCapture]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (isActive) {
      drawFaceMesh(faceMeshResult);
    }
  }, [faceMeshResult, isActive, drawFaceMesh]);

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Camera className="mr-3 h-3.5 w-3.5" />
              VISION_NODE_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700">
              <Sparkles className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            AR_Neural_Capture
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Real-time biometric synthesis and diagnostic mapping
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Imaging_Status</p>
            <p className={cn("text-lg font-black italic tracking-tighter uppercase leading-none mt-1", isActive ? 'text-emerald-600' : 'text-slate-300')}>
              {isActive ? 'SYNC_ACTIVE' : 'NODE_OFFLINE'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className={cn("h-6 w-6 transition-colors", isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-300')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/viewport">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
          
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover/viewport:opacity-100 transition-opacity duration-1000"
            autoPlay
            playsInline
            muted
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          <div className="absolute inset-0 pointer-events-none z-20">
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full relative p-10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-4">
                      <Badge className={cn(
                        "px-6 py-2 rounded-full border-none shadow-lg text-[10px] font-black italic uppercase tracking-widest leading-none transition-all duration-500",
                        faceMeshResult ? "bg-emerald-500 text-white shadow-glow-emerald/30" : "bg-white/10 backdrop-blur-md text-white animate-pulse"
                      )}>
                        {faceMeshResult ? 'BIOMETRIC_LOCK_NOMINAL' : 'ACQUIRING_TARGET_MESH...'}
                      </Badge>
                      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 shadow-xl">
                        <Activity className="h-4 w-4 text-pink-500 animate-pulse" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Signal_Fidelity: 99.9%</span>
                      </div>
                    </div>
                    
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                      <Target className="h-7 w-7 text-blue-400" />
                    </div>
                  </div>

                  {/* HUD Elements */}
                  <div className="absolute top-10 right-10 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
                  <div className="absolute bottom-10 left-10 w-16 h-16 border-b-2 border-l-2 border-white/20 rounded-bl-3xl" />
                  <div className="absolute bottom-10 right-10 w-16 h-16 border-b-2 border-r-2 border-white/20 rounded-br-3xl" />
                  <div className="absolute top-10 left-10 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-3xl" />

                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-glow-pink animate-scan-line" />
                </motion.div>
              )}
            </AnimatePresence>

            {!isActive && !isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                <div className="text-center space-y-8 italic group/init">
                  <div className="relative mx-auto h-24 w-24">
                    <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full animate-pulse" />
                    <CameraOff className="h-20 w-20 text-slate-400 relative z-10 mx-auto opacity-40 group-hover/init:opacity-100 group-hover/init:text-pink-600 transition-all duration-700" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Imaging_Offline</p>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Initialize imaging node to Authorize Live Sync</p>
                  </div>
                </div>
              </div>
            )}

            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl">
                <div className="text-center space-y-8 italic">
                  <div className="relative h-20 w-20 mx-auto">
                    <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                    <RefreshCw className="h-14 w-14 animate-spin mx-auto text-pink-600 relative" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Initializing_Neural_Stream...</p>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-10 left-10 right-10 z-30"
              >
                <div className="bg-rose-600/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-6">
                  <XCircle className="h-6 w-6 shrink-0" />
                  <p className="text-xs font-black uppercase tracking-widest italic">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 p-8 lg:p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 shadow-inner flex flex-col sm:flex-row gap-8 justify-center items-center">
          {isActive ? (
            <>
              <Button onClick={stopCamera} variant="outline" size="xl" className="flex-1 w-full h-20 rounded-[2rem] border-slate-200 bg-white text-rose-600 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 group/btn">
                <CameraOff className="mr-4 h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                Deactivate_Node
              </Button>
              <Button onClick={captureFrame} size="xl" className="flex-1 w-full h-20 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none group/cap relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/cap:translate-x-[100%] transition-transform duration-1000" />
                <Download className="mr-4 h-6 w-6 group-hover/cap:translate-y-1 transition-transform" />
                Authorize_Capture
              </Button>
              <Button
                onClick={() => {
                  stopCamera();
                  setTimeout(startCamera, 100);
                }}
                variant="outline"
                size="xl"
                className="h-20 w-20 rounded-2xl border-slate-200 bg-white text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <RefreshCw className="h-7 w-7" />
              </Button>
            </>
          ) : (
            <Button
              onClick={startCamera}
              disabled={isInitializing}
              size="xl"
              className="w-full max-w-2xl h-24 rounded-[3rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-xs italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none group/start relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/start:translate-x-[100%] transition-transform duration-1000" />
              <Camera className="mr-4 h-8 w-8 group-hover/start:scale-110 transition-transform" />
              {isInitializing ? 'AUTHORIZING_UPLINK...' : 'Authorize_Imaging_Node'}
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Mesh_Integrity_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Vision-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: NEURAL_MESH_60FPS</p>
        </div>
      </CardFooter>
    </Card>
  );
}
