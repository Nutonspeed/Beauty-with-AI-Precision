'use client';

import { useEffect, useRef, useState } from 'react';
import { ARFaceTracker, setupCamera } from '@/lib/ar/ar-face-tracking';

export default function ARFaceTrackingTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('กำลังโหลด...');
  const [isTracking, setIsTracking] = useState(false);
  const [landmarks, setLandmarks] = useState<Array<{x: number, y: number, z: number}>>([]);

  useEffect(() => {
    let faceTracker: ARFaceTracker | null = null;
    let stream: MediaStream | null = null;

    const init = async () => {
      try {
        setStatus('กำลังเริ่มต้นกล้อง...');
        
        // เริ่มต้นกล้อง
        if (videoRef.current) {
          stream = await setupCamera(videoRef.current);
          setStatus('กำลังโหลดโมเดล...');
          
          // สร้าง AR face tracker
          faceTracker = new ARFaceTracker((landmarks) => {
            setLandmarks(landmarks);
            setStatus(`กำลังติดตามใบหน้า (พบจุดสำคัญ: ${landmarks.length} จุด)`);
          });
          
          await faceTracker.initialize();
          
          if (videoRef.current && canvasRef.current) {
            setStatus('กำลังเริ่มติดตามใบหน้า...');
            await faceTracker.start(videoRef.current, canvasRef.current);
            setIsTracking(true);
          }
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        setStatus(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    init();

    return () => {
      if (faceTracker) {
        faceTracker.stop();
        faceTracker.dispose();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">ทดสอบการติดตามใบหน้า (AR Face Tracking)</h1>
      
      <div className="relative mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl border-2 border-gray-300 rounded-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">สถานะ:</h2>
        <p className="mb-4">{status}</p>
        
        <h2 className="text-lg font-semibold mb-2">ข้อมูลจุดสำคัญบนใบหน้า:</h2>
        <div className="bg-gray-50 p-3 rounded overflow-auto max-h-40">
          {landmarks.length > 0 ? (
            <pre className="text-xs">
              {JSON.stringify(landmarks.slice(0, 5), null, 2)}
              {landmarks.length > 5 && `
                ...และจุดสำคัญอีก ${landmarks.length - 5} จุด`
              }
            </pre>
          ) : (
            <p className="text-gray-500">ยังไม่พบจุดสำคัญบนใบหน้า</p>
          )}
        </div>
      </div>
    </div>
  );
}
