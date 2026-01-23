'use client';

/**
 * Interactive 3D Viewer Component
 * Three.js visualization for interactive 3D models with premium theme
 */

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  Target, 
  Sparkles, 
  Maximize2,
  Layers,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Interactive3DViewerProps {
  modelUrl?: string;
  className?: string;
}

function InteractionNode({ position, label }: { position: [number, number, number], label: string }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Html position={position}>
      <div 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        className="relative group cursor-pointer"
      >
        <div className={cn(
          "h-6 w-6 rounded-full border-2 border-white shadow-glow-pink transition-all duration-500 flex items-center justify-center",
          hovered ? "bg-pink-500 scale-125" : "bg-pink-500/40"
        )}>
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </div>
        
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 30, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute top-1/2 -translate-y-1/2 left-0 z-50 pointer-events-none"
            >
              <div className="bg-slate-950 text-white px-4 py-2 rounded-xl border border-white/10 shadow-2xl whitespace-nowrap">
                <p className="text-[10px] font-black uppercase tracking-widest italic">{label}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
}

function Scene({ modelUrl }: { modelUrl?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#ff69b4" 
            metalness={0.8} 
            roughness={0.1}
            emissive="#ff69b4"
            emissiveIntensity={0.2}
          />
          
          <InteractionNode position={[0.8, 0.5, 0.2]} label="Dermal_Matrix" />
          <InteractionNode position={[-0.8, -0.3, 0.5]} label="Neural_Node" />
          <InteractionNode position={[0, 1.2, -0.3]} label="Apex_Registry" />
        </mesh>
      </Float>
      
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={1} />
    </>
  );
}

export function Interactive3DViewer({ 
  modelUrl, 
  className = '' 
}: Interactive3DViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[850px]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Move className="mr-3 h-3.5 w-3.5" />
              VOXEL_ORBIT_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700">
              <Box className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Interactive_Dossier
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Recursive 3D object manipulation and heuristic data anchoring
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Matrix_Sync</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-emerald-600">
              STABLE_UPLINK
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="relative aspect-square rounded-[4rem] bg-slate-950 overflow-hidden border-4 border-white shadow-premium group/viewport">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
          
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
            <OrbitControls 
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
            />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} color="#03a9f4" intensity={0.5} />
            <Environment preset="city" />
            
            <Scene modelUrl={modelUrl} />
          </Canvas>

          {/* HUD interface interface interface */}
          <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-4">
                <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                  INTERACTIVE_NODE_STABLE
                </Badge>
                <div className="flex items-center gap-4 bg-blue-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-blue-500/30 shadow-xl">
                  <Target className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Temporal_Voxel_Lock</span>
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
                <RotateCcw className={cn("h-8 w-8 transition-transform duration-700", isSyncing && "rotate-180")} />
              </Button>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line pointer-events-none" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { label: 'Heuristic_Sync', val: '99.4%', icon: ShieldCheck, color: 'text-emerald-600' },
            { label: 'Anchor_Nodes', val: '12_ACTV', icon: Layers, color: 'text-blue-600' },
            { label: 'Render_Epoch', val: '2026.4', icon: Sparkles, color: 'text-pink-600' }
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/stat hover:bg-white hover:border-pink-500/20 transition-all duration-700">
              <div className="flex items-center gap-4 mb-4">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{stat.label}</span>
              </div>
              <p className="text-3xl font-black italic tracking-tighter text-slate-950 uppercase leading-none">{stat.val}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-8 text-slate-400 group/status cursor-default">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/status:bg-emerald-50 transition-all duration-700">
            <ShieldCheck className="h-8 w-8 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic leading-none">Simulation_Integrity_Verified</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] italic text-slate-400 group-hover/status:text-slate-600 transition-colors">Node_Fidelity: NOMINAL</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            3D-INT-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: QUANTUM_GL_RECURSIVE</p>
        </div>
      </CardFooter>
    </Card>
  );
}
