'use client';

/**
 * 3D Face Viewer Component
 * Three.js 3D face visualization with heatmap overlay
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Box, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { FaceMeshResult } from '@/lib/ar/mediapipe-face-mesh';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

const VIEWER_TRANSLATIONS = {
  en: {
    title: '3D Face Visualization',
    heatmapIntensity: 'Heatmap Intensity',
    stopRotation: 'Stop Rotation',
    autoRotate: 'Auto Rotate',
    resetView: 'Reset View',
    analysisOverview: 'Analysis Overview',
    good: 'Good',
    concern: 'Concern',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    pigmentation: 'Pigmentation',
    noDataAvailable: 'Capture or analyze an image to view 3D model'
  },
  th: {
    title: 'มุมมอง 3 มิติใบหน้า',
    heatmapIntensity: 'ความเข้มของฮีตแมป',
    stopRotation: 'หยุดหมุน',
    autoRotate: 'หมุนอัตโนมัติ',
    resetView: 'รีเซ็ตมุมมอง',
    analysisOverview: 'ภาพรวมการวิเคราะห์',
    good: 'ดี',
    concern: 'ต้องดูแล',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    pigmentation: 'รอยดำ',
    noDataAvailable: 'ถ่ายภาพหรือวิเคราะห์เพื่อดูโมเดล 3D'
  }
};

export interface Face3DViewerProps {
  faceMesh?: FaceMeshResult;
  imageUrl?: string; // Added for fallback 2D view
  analysisData?: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    overall: number;
  };
  analysis?: HybridSkinAnalysis;
  className?: string;
  locale?: string;
}

/**
 * 3D Face Mesh Component
 */
function FaceMesh3D({
  landmarks,
  heatmapData,
  heatmapIntensity = 0.5,
}: {
  landmarks?: FaceMeshResult['landmarks'];
  heatmapData?: number[];
  heatmapIntensity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    // Create geometry from landmarks
    const geo = new THREE.BufferGeometry();

    // Vertices
    const vertices = new Float32Array(landmarks.length * 3);
    for (let i = 0; i < landmarks.length; i++) {
      vertices[i * 3] = landmarks[i].x - 0.5; // Center around origin
      vertices[i * 3 + 1] = -(landmarks[i].y - 0.5); // Flip Y and center
      vertices[i * 3 + 2] = landmarks[i].z || 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Colors for heatmap
    if (heatmapData && heatmapData.length === landmarks.length) {
      const colors = new Float32Array(landmarks.length * 3);
      for (let i = 0; i < landmarks.length; i++) {
        const value = heatmapData[i];
        const color = getHeatmapColor(value);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // Simple face triangulation (basic, can be improved)
    const indices: number[] = [];
    for (let i = 0; i < landmarks.length - 2; i++) {
      indices.push(i, i + 1, i + 2);
    }
    geo.setIndex(indices);

    geo.computeVertexNormals();
    setGeometry(geo);

    return () => {
      geo.dispose();
    };
  }, [landmarks, heatmapData]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Slow auto-rotation
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors={heatmapData ? true : false}
        wireframe={false}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
        opacity={heatmapIntensity}
        transparent={heatmapIntensity < 1}
      />
    </mesh>
  );
}

/**
 * Helper: Get heatmap color
 */
function getHeatmapColor(value: number): { r: number; g: number; b: number } {
  // Value 0-1 (0 = green/good, 1 = red/bad)
  const clamped = Math.max(0, Math.min(1, value));

  // Green to Yellow to Red gradient
  if (clamped < 0.5) {
    // Green to Yellow
    const t = clamped * 2;
    return {
      r: t,
      g: 1,
      b: 0,
    };
  } else {
    // Yellow to Red
    const t = (clamped - 0.5) * 2;
    return {
      r: 1,
      g: 1 - t,
      b: 0,
    };
  }
}

/**
 * Main Component
 */
export function Face3DViewer({ 
  faceMesh, 
  imageUrl,
  analysisData, 
  analysis, 
  className = '',
  locale = 'en'
}: Face3DViewerProps) {
  const t = VIEWER_TRANSLATIONS[locale as keyof typeof VIEWER_TRANSLATIONS] || VIEWER_TRANSLATIONS.en;
  
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.7);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const controlsRef = useRef<any>(null);

  // Generate heatmap data from analysis
  const heatmapData = faceMesh?.landmarks
    ? faceMesh.landmarks.map((_, index) => {
        // Mock heatmap based on analysis severity
        // In real implementation, map actual severity to specific face regions
        const data = analysisData || analysis?.cv;
        if (!data) return 0;

        const avgSeverity = analysis
          ? (analysis.cv.spots.severity +
             analysis.cv.pores.severity +
             analysis.cv.wrinkles.severity +
             analysis.cv.texture.score +
             analysis.cv.redness.severity) / 5
          : (analysisData!.spots +
             analysisData!.pores +
             analysisData!.wrinkles +
             analysisData!.texture +
             analysisData!.redness) / 5;

        // Add some variation
        return (avgSeverity / 10) * (0.8 + Math.random() * 0.4);
      })
    : undefined;

  // Auto-rotate effect for 2D mode
  useEffect(() => {
    if (!faceMesh && imageUrl && autoRotate) {
      const interval = setInterval(() => {
        setRotation((prev) => ({
          ...prev,
          y: (prev.y + 1) % 360,
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [faceMesh, imageUrl, autoRotate]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          {t.title}
        </h3>

        {/* 3D Canvas */}
        <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden mb-4 relative">
          {faceMesh ? (
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 2]} />
              <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
              />

              {/* Lights */}
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <directionalLight position={[-5, -5, -5]} intensity={0.4} />

              {/* 3D Face Mesh */}
              <FaceMesh3D
                landmarks={faceMesh.landmarks}
                heatmapData={heatmapData}
                heatmapIntensity={heatmapIntensity}
              />

              {/* Grid helper */}
              <gridHelper args={[2, 10]} />
            </Canvas>
          ) : imageUrl ? (
            /* Fallback: 2D image with CSS 3D transform */
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                setRotation({
                  x: Math.max(-45, Math.min(45, rotation.x + deltaY * 0.5)),
                  y: (rotation.y + deltaX * 0.5) % 360,
                });
                setDragStart({ x: e.clientX, y: e.clientY });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div
                style={{
                  transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
                className="relative"
              >
                <img
                  src={imageUrl}
                  alt="Face analysis"
                  className="max-w-full max-h-[500px] rounded-lg shadow-2xl"
                  style={{
                    filter: `brightness(${1 + heatmapIntensity * 0.2})`,
                  }}
                />
                {/* Heatmap overlay indication */}
                {analysisData && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                    Score: {analysisData.overall}/100
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-white/80">
                Drag to rotate • 3D mesh available with face detection
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No face mesh data available</p>
                <p className="text-sm mt-2">{t.noDataAvailable}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {(faceMesh || imageUrl) && (
          <div className="space-y-4">
            {/* Heatmap Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.heatmapIntensity}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(heatmapIntensity * 100)}%
                </span>
              </div>
              <Slider
                value={[heatmapIntensity * 100]}
                onValueChange={(value) => setHeatmapIntensity(value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {faceMesh ? (
                <>
                  <Button
                    onClick={() => setAutoRotate(!autoRotate)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {autoRotate ? t.stopRotation : t.autoRotate}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (controlsRef.current) {
                        controlsRef.current.reset();
                      }
                    }} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t.resetView}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setAutoRotate(!autoRotate);
                      if (autoRotate) {
                        setRotation({ x: 0, y: 0 });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {autoRotate ? t.stopRotation : t.autoRotate}
                  </Button>
                  <Button 
                    onClick={() => setRotation({ x: 0, y: 0 })} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t.resetView}
                  </Button>
                </>
              )}
            </div>

            {/* Heatmap Legend */}
            {(analysis || analysisData) && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium mb-2 block">{t.analysisOverview}</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                  <div className="text-xs text-muted-foreground flex justify-between w-full">
                    <span>{t.good}</span>
                    <span>{t.concern}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {analysis ? (
                    <>
                      <div>
                        <span className="text-muted-foreground">{t.spots}:</span>{' '}
                        <span className="font-medium">{analysis.cv.spots.severity}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.pores}:</span>{' '}
                        <span className="font-medium">{analysis.cv.pores.severity}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.wrinkles}:</span>{' '}
                        <span className="font-medium">{analysis.cv.wrinkles.severity}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.texture}:</span>{' '}
                        <span className="font-medium">{analysis.cv.texture.score}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.redness}:</span>{' '}
                        <span className="font-medium">{analysis.cv.redness.severity}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Overall:</span>{' '}
                        <span className="font-medium">{Math.round((analysis.overallScore.spots + analysis.overallScore.pores + analysis.overallScore.wrinkles + analysis.overallScore.texture + analysis.overallScore.redness) / 5)}/100</span>
                      </div>
                    </>
                  ) : analysisData ? (
                    <>
                      <div>
                        <span className="text-muted-foreground">{t.spots}:</span>{' '}
                        <span className="font-medium">{analysisData.spots}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.pores}:</span>{' '}
                        <span className="font-medium">{analysisData.pores}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.wrinkles}:</span>{' '}
                        <span className="font-medium">{analysisData.wrinkles}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.texture}:</span>{' '}
                        <span className="font-medium">{analysisData.texture}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.redness}:</span>{' '}
                        <span className="font-medium">{analysisData.redness}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Overall:</span>{' '}
                        <span className="font-medium">{analysisData.overall}/100</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
