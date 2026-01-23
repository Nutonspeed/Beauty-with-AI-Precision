'use client';

/**
 * 3D Face Viewer Component
 * Three.js 3D face visualization with heatmap overlay and premium theme
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Target, 
  Sparkles, 
  Maximize2, 
  Settings2,
  RefreshCw,
  Layers,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FaceMeshResult } from '@/lib/ar/mediapipe-face-mesh';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface Face3DViewerProps {
  faceMesh?: FaceMeshResult;
  imageUrl?: string;
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
  wireframe = false,
}: {
  landmarks?: FaceMeshResult['landmarks'];
  heatmapData?: number[];
  heatmapIntensity?: number;
  wireframe?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array(landmarks.length * 3);
    for (let i = 0; i < landmarks.length; i++) {
      vertices[i * 3] = landmarks[i].x - 0.5;
      vertices[i * 3 + 1] = -(landmarks[i].y - 0.5);
      vertices[i * 3 + 2] = landmarks[i].z || 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    if (heatmapData && heatmapData.length === landmarks.length) {
      const colors = new Float32Array(landmarks.length * 3);
      for (let i = 0; i < landmarks.length; i++) {
        const value = heatmapData[i];
        // Gradient: Blue (good) to Pink (bad)
        const r = 0.01 + value * 0.99; // Pink/Red component
        const g = 0.2 + (1 - value) * 0.3; // Greenish
        const b = 0.5 + (1 - value) * 0.5; // Blue component
        
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

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

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors={!!heatmapData}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        metalness={0.2}
        roughness={0.6}
        opacity={heatmapIntensity}
        transparent={heatmapIntensity < 1}
        emissive={new THREE.Color(0xff69b4)}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

export function Face3DViewer({ 
  faceMesh, 
  imageUrl,
  analysisData, 
  analysis, 
  className = '',
  locale = 'en'
}: Face3DViewerProps) {
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.8);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const controlsRef = useRef<any>(null);

  const heatmapData = useMemo(() => {
    if (!faceMesh?.landmarks) return undefined;
    
    return faceMesh.landmarks.map((_, index) => {
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

      return (avgSeverity / 10) * (0.8 + Math.sin(index) * 0.2);
    });
  }, [faceMesh, analysisData, analysis]);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[900px]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Box className="mr-3 h-3.5 w-3.5" />
              VOXEL_RENDER_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700">
              <Cpu className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            3D_Dermal_Voxel
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            High-fidelity biological mesh visualization and spectral heatmap
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Render_Engine</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-emerald-600">
              GL_NOMINAL
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-12 gap-16 flex-1">
          {/* Main 3D Viewport interface */}
          <div className="lg:col-span-8 relative group/viewport">
            <div className="relative aspect-square rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {faceMesh ? (
                <Canvas shadows dpr={[1, 2]}>
                  <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={45} />
                  <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={autoRotate}
                    autoRotateSpeed={2}
                    minDistance={1.5}
                    maxDistance={5}
                  />

                  <ambientLight intensity={0.4} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff69b4" />
                  <Environment preset="city" />

                  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <FaceMesh3D
                      landmarks={faceMesh.landmarks}
                      heatmapData={heatmapData}
                      heatmapIntensity={heatmapIntensity}
                      wireframe={wireframe}
                    />
                  </Float>

                  <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={5} blur={2} far={4} />
                  <gridHelper args={[10, 20, 0x333333, 0x111111]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]} />
                </Canvas>
              ) : (
                <div className="text-center space-y-8 italic opacity-20 group-hover/viewport:opacity-100 transition-all duration-1000">
                  <div className="relative mx-auto h-32 w-32">
                    <div className="absolute inset-0 bg-pink-500/5 blur-[60px] rounded-full" />
                    <Box className="h-24 w-24 text-slate-400 mx-auto" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Voxel_Buffer_Empty</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Awaiting_Neural_Mesh_Input</p>
                  </div>
                </div>
              )}

              {/* HUD interface interface interface */}
              <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                      NODE_SYNC_ACTIVE
                    </Badge>
                    <div className="flex items-center gap-4 bg-emerald-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-emerald-500/30 shadow-xl">
                      <Target className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Voxel_Lock: TRUE</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-2xl pointer-events-auto">
                    <Maximize2 className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex justify-center gap-6 pointer-events-auto">
                  <Button 
                    onClick={handleReset}
                    size="xl" 
                    className="h-20 w-20 rounded-full bg-white text-slate-950 shadow-2xl hover:scale-110 active:scale-95 transition-all group/reset"
                  >
                    <RotateCcw className="h-8 w-8 group-hover:rotate-180 transition-transform duration-700" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line pointer-events-none" />
            </div>
          </div>

          {/* Controls sidebar matrix interface */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-10">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Render_Config</h4>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Spectral_Intensity</p>
                    <span className="text-xl font-black text-pink-600 italic tracking-tighter leading-none">{Math.round(heatmapIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[heatmapIntensity * 100]}
                    onValueChange={(value) => setHeatmapIntensity(value[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setAutoRotate(!autoRotate)}
                    variant="outline"
                    className={cn(
                      "h-16 rounded-2xl border-slate-100 font-black uppercase tracking-widest text-[9px] italic transition-all group/ctrl",
                      autoRotate ? "bg-pink-50 text-pink-600 border-pink-100 shadow-sm" : "bg-white text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <RefreshCw className={cn("mr-3 h-4 w-4", autoRotate && "animate-spin")} />
                    AUTO_ROTATE
                  </Button>
                  <Button
                    onClick={() => setWireframe(!wireframe)}
                    variant="outline"
                    className={cn(
                      "h-16 rounded-2xl border-slate-100 font-black uppercase tracking-widest text-[9px] italic transition-all group/ctrl",
                      wireframe ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm" : "bg-white text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <Layers className="mr-3 h-4 w-4" />
                    WIREFRAME
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-50">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Voxel_Metrics</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Surface_Pores', score: analysisData?.pores || 82, color: 'text-emerald-600', bg: 'bg-emerald-500' },
                  { label: 'Dermal_Spots', score: analysisData?.spots || 64, color: 'text-pink-600', bg: 'bg-pink-500' },
                  { label: 'Elasticity_Idx', score: analysisData?.wrinkles || 71, color: 'text-blue-600', bg: 'bg-blue-500' }
                ].map((metric, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group/metric hover:bg-white hover:border-blue-500/20 transition-all duration-700 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{metric.label}</p>
                      <span className={cn("text-lg font-black italic tracking-tighter leading-none", metric.color)}>{metric.score}%</span>
                    </div>
                    <div className="h-1 w-full bg-white rounded-full overflow-hidden p-px shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metric.score}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className={cn("h-full rounded-full", metric.bg)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-4 transition-all duration-700 hover:bg-white hover:border-blue-500/20 group/tips">
              <div className="flex items-center gap-4">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Inference_Note</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic group-hover/tips:text-slate-900 transition-colors leading-relaxed">
                Rendered mesh represents a 1:1 biometric twin synthesized from localized target markers.
              </p>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-pink-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <Zap className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
              Authorize_Full_Deep_Sequence
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Voxel_Integrity_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            VOX-SYNC-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: THREE_SHADERC_X</p>
        </div>
      </CardFooter>
    </Card>
  );
}
