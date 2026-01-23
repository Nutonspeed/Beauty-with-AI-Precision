'use client';

/**
 * Product 3D Viewer Component
 * Three.js visualization for 3D products with premium theme and interactive hotspots
 */

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Maximize2,
  Layers,
  Info,
  ChevronRight,
  ShoppingBag,
  Droplets,
  FlaskConical,
  Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Product3DViewerProps {
  productData?: {
    id: string;
    name: string;
    ingredients: string[];
    benefits: string[];
  };
  className?: string;
}

function Hotspot({ position, label, content }: { position: [number, number, number], label: string, content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Html position={position}>
      <div className="relative group">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-8 w-8 rounded-full border-4 border-white shadow-glow-blue transition-all duration-500 flex items-center justify-center relative z-20",
            isOpen ? "bg-blue-600 scale-125 rotate-45" : "bg-blue-600/40 hover:bg-blue-600"
          )}
        >
          <Zap className="h-3 w-3 text-white fill-current" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 pointer-events-none"
            >
              <div className="bg-slate-950/90 backdrop-blur-xl text-white p-6 rounded-[2rem] border border-white/10 shadow-2xl w-64">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic mb-2">{label}</p>
                <p className="text-xs font-medium text-slate-300 italic leading-relaxed">{content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
}

function ProductModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.9} 
            roughness={0.05}
          />
          
          {/* Label Area */}
          <mesh position={[0, 0, 0.01]}>
            <cylinderGeometry args={[0.51, 0.51, 1.2, 32]} />
            <meshStandardMaterial 
              color="#0f172a" 
              metalness={0.1} 
              roughness={0.8}
            />
          </mesh>

          <Hotspot position={[0.6, 0.5, 0]} label="Active_Molecule" content="High-concentration hyaluronic acid for deep-layer cellular hydration sync." />
          <Hotspot position={[-0.6, -0.3, 0.2]} label="Delivery_Vector" content="Nano-emulsion technology for precise biological penetration." />
        </mesh>
      </Float>
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={1} />
    </group>
  );
}

export function Product3DViewer({ 
  productData, 
  className = '' 
}: Product3DViewerProps) {
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
              <ShoppingBag className="mr-3 h-3.5 w-3.5" />
              PRODUCT_VOXEL_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <FlaskConical className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            Spectral_Product_Sim
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Recursive 360-degree interactive product exploration and ingredient mapping
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Voxel_Status</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-emerald-600">
              UPLINK_STABLE
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
              
              <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
                <OrbitControls 
                  ref={controlsRef}
                  enablePan={false}
                  enableZoom={true}
                  autoRotate={autoRotate}
                  autoRotateSpeed={1}
                />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} color="#03a9f4" intensity={0.5} />
                <Environment preset="studio" />
                
                <ProductModel />
              </Canvas>

              {/* HUD interface interface interface */}
              <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                      INTERACTIVE_MODE_ACTIVE
                    </Badge>
                    <div className="flex items-center gap-4 bg-blue-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-blue-500/30 shadow-xl">
                      <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Voxel_Hotspots: LOADED</span>
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
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-glow-blue animate-scan-line pointer-events-none" />
            </div>
          </div>

          {/* Product sidebar matrix interface */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-10">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Formula_Registry</h4>
              </div>
              
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-8 group/info hover:bg-white hover:border-blue-500/20 transition-all duration-700">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Droplets className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Core_Concentration</p>
                      <p className="text-xl font-black italic text-slate-950 tracking-tighter uppercase leading-none">Hyaluronic_v4</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none ml-2">Molecular_Efficacy</p>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden p-px shadow-inner">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-500 rounded-full shadow-glow-blue/30" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {(productData?.ingredients || ['Matrixyl_3000', 'Ceramide_NP', 'Niacinamide_B3']).map((ing, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-50 shadow-sm hover:border-blue-500/20 transition-all group/ing">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/ing:bg-blue-50 transition-colors">
                        <Beaker className="h-5 w-5 text-slate-300 group-hover/ing:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-600 group-hover/ing:text-slate-950 transition-colors">{ing}</span>
                      <ShieldCheck className="h-4 w-4 ml-auto text-emerald-500 opacity-40 group-hover/ing:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-4 transition-all duration-700 hover:bg-white hover:border-blue-500/20 group/tips">
              <div className="flex items-center gap-4">
                <Info className="h-5 w-5 text-blue-600 animate-pulse" />
                <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Simulation_Context</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic group-hover/tips:text-slate-900 transition-colors leading-relaxed">
                Interact with the voxel model to visualize delivery vectors and molecular anchoring points within the dermal matrix.
              </p>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-blue-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              Authorize_Order_Protocol
              <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
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
            PROD-3D-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: PBR_REALTIME_X</p>
        </div>
      </CardFooter>
    </Card>
  );
}
