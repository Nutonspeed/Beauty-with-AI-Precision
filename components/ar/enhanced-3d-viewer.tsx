'use client';

/**
 * Enhanced 3D Viewer Component
 * Advanced Three.js visualization for 3D face models with spectral overlays
 */

import { useEffect, useRef, useState } from 'react';
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
  Target, 
  Maximize2, 
  Settings2,
  Layers,
  Cpu,
  Eye,
  Scan
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Enhanced3DViewerProps {
  faceMesh?: any;
  analysisData?: any;
  className?: string;
}

function SpectralMesh({
  landmarks,
  intensity = 0.8,
  mode = 'normal'
}: {
  landmarks?: any[];
  intensity?: number;
  mode?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array(landmarks.length * 3);
    const colors = new Float32Array(landmarks.length * 3);

    for (let i = 0; i < landmarks.length; i++) {
      vertices[i * 3] = landmarks[i].x - 0.5;
      vertices[i * 3 + 1] = -(landmarks[i].y - 0.5);
      vertices[i * 3 + 2] = landmarks[i].z || 0;

      // Generate spectral colors based on Z-depth and mode
      if (mode === 'spectral') {
        const val = (landmarks[i].z || 0) * 10 + 0.5;
        colors[i * 3] = 0.1 + val * 0.9; // Pink
        colors[i * 3 + 1] = 0.2 + (1 - val) * 0.3; // Blue-green
        colors[i * 3 + 2] = 0.6 + (1 - val) * 0.4; // Blue
      } else {
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const indices: number[] = [];
    for (let i = 0; i < landmarks.length - 2; i++) {
      indices.push(i, i + 1, i + 2);
    }
    geo.setIndex(indices);
    geo.computeVertexNormals();
    setGeometry(geo);

    return () => geo.dispose();
  }, [landmarks, mode]);

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors={mode === 'spectral'}
        metalness={0.4}
        roughness={0.3}
        transparent
        opacity={intensity}
        emissive={mode === 'spectral' ? new THREE.Color(0x00f2ff) : new THREE.Color(0x000000)}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function Enhanced3DViewer({ 
  faceMesh, 
  analysisData, 
  className = '' 
}: Enhanced3DViewerProps) {
  const [viewMode, setViewMode] = useState<'normal' | 'spectral' | 'wireframe'>('spectral');
  const [intensity, setIntensity] = useState(0.8);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/20 flex flex-col min-h-[900px]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Scan className="mr-3 h-3.5 w-3.5" />
              ADVANCED_VOXEL_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Maximize2 className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            Enhanced_3D_Sim
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Ultra-high fidelity volumetric mesh synthesis and spectral mapping
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Volumetric_Status</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-blue-600">
              BUFFER_OPTIMAL
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Cpu className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-12 gap-16 flex-1">
          {/* Main 3D Viewport interface */}
          <div className="lg:col-span-8 relative group/viewport">
            <div className="relative aspect-square rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {faceMesh?.landmarks ? (
                <Canvas shadows dpr={[1, 2]}>
                  <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={45} />
                  <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1}
                  />

                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                  <Environment preset="night" />

                  <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <SpectralMesh
                      landmarks={faceMesh.landmarks}
                      intensity={intensity}
                      mode={viewMode}
                    />
                  </Float>

                  <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={5} blur={2.4} far={1} />
                </Canvas>
              ) : (
                <div className="text-center space-y-8 italic opacity-20 group-hover/viewport:opacity-100 transition-all duration-1000">
                  <div className="relative mx-auto h-32 w-32">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full" />
                    <Box className="h-24 w-24 text-slate-400 mx-auto" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Voxel_Registry_Empty</p>
                </div>
              )}

              {/* HUD interface interface interface */}
              <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                      STREAM_COMMIT_OK
                    </Badge>
                    <div className="flex items-center gap-4 bg-blue-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-blue-500/30 shadow-xl">
                      <Target className="h-4 w-4 text-blue-400 animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Temporal_Voxel_Lock</span>
                    </div>
                  </div>
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
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-glow-blue animate-scan-line pointer-events-none" />
            </div>
          </div>

          {/* Controls sidebar matrix interface */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-10">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Synthesis_Control</h4>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Alpha_Flux</p>
                    <span className="text-xl font-black text-blue-600 italic tracking-tighter leading-none">{Math.round(intensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[intensity * 100]}
                    onValueChange={(v) => setIntensity(v[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="grid gap-4">
                  {[
                    { id: 'spectral', label: 'SPECTRAL_SCAN', icon: Zap },
                    { id: 'normal', label: 'NATURAL_MESH', icon: Eye },
                    { id: 'wireframe', label: 'VOXEL_GRID', icon: Layers }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as any)}
                      className={cn(
                        "w-full p-6 rounded-[2rem] border transition-all duration-700 flex items-center gap-6 relative overflow-hidden group/mode",
                        viewMode === mode.id 
                          ? "bg-white border-blue-200 shadow-premium scale-105 z-10" 
                          : "bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-500/20 shadow-inner"
                      )}
                    >
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover/mode:scale-110",
                        viewMode === mode.id ? "bg-blue-50 border border-blue-100" : "bg-white border border-slate-50"
                      )}>
                        <mode.icon className={cn("h-7 w-7", viewMode === mode.id ? "text-blue-600" : "text-slate-300")} />
                      </div>
                      <div className="text-left">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest italic transition-colors", viewMode === mode.id ? "text-blue-600" : "text-slate-400")}>{mode.label}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">HEURISTIC_SYNC_v4.8</p>
                      </div>
                      {viewMode === mode.id && (
                        <motion.div layoutId="active-mode" className="ml-auto h-2 w-2 rounded-full bg-blue-500 shadow-glow-blue" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-4 transition-all duration-700 hover:bg-white hover:border-blue-500/20 group/tips">
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-5 w-5 text-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Simulation_Integrity</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic group-hover/tips:text-slate-900 transition-colors leading-relaxed">
                Spectral mode visualizes sub-dermal depth variance via localized voxel displacement monitoring.
              </p>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-blue-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <Zap className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
              Authorize_Volumetric_Sync
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Voxel_Buffer_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            ENH-3D-v2.4
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: QUANTUM_GL_X</p>
        </div>
      </CardFooter>
    </Card>
  );
}
