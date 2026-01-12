"use client";

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

function ParticleFace() {
  const points = useRef<THREE.Points>(null);
  
  // Create a spherical particle cloud that morphs
  const particleCount = 2500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      points.current.rotation.z = state.clock.getElapsedTime() * 0.1;
      
      // Morphing effect
      const positionAttribute = points.current.geometry.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        const noise = Math.sin(state.clock.getElapsedTime() + i) * 0.002;
        positionAttribute.setXYZ(i, x + noise, y + noise, z + noise);
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#0ea5e9"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function DigitalTwinModule() {
  return (
    <div className="relative group overflow-hidden rounded-[4rem] border border-white/5 bg-white/[0.01] p-12 lg:p-24 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(14,165,233,0.1)]">
      {/* Decorative Scanner Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20 pointer-events-none"
      />
      
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="space-y-10">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 uppercase tracking-[0.3em] text-[10px] font-black shadow-2xl shadow-cyan-500/10">
            Neural Infrastructure v2.0
          </Badge>
          <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.9] italic">
            Digital Twin<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent not-italic uppercase">Reconstruction</span>
          </h3>
          <p className="text-2xl text-slate-400 font-light leading-relaxed italic tracking-wide">
            Deploying high-fidelity volumetric rendering to synthesize aesthetic outcomes. Our <span className="text-cyan-400 font-bold">Molecular Engine</span> calculates 12.4 million geometric vectors to ensure structural precision.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Accuracy', val: '99.8%' },
              { label: 'Latency', val: '42ms' },
              { label: 'Vectors', val: '12.4M' },
              { label: 'Sync', val: 'Active' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-cyan-500/20 transition-all">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">{stat.label}</div>
                <div className="text-xl font-black text-white italic tracking-tighter">{stat.val}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {['Quantum_Map', 'Neural_Mesh', 'Vertex_Sync'].map((tag) => (
              <div key={tag} className="px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500/60">
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square lg:h-[500px] flex items-center justify-center">
          {/* Background Glows */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
          
          {/* 3D Canvas */}
          <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-white/5 bg-black/20 backdrop-blur-sm">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
              <Suspense fallback={null}>
                <ParticleFace />
              </Suspense>
            </Canvas>

            {/* HUD Overlays on Canvas */}
            <div className="absolute top-8 left-8 border-l border-t border-cyan-500/30 w-12 h-12" />
            <div className="absolute bottom-8 right-8 border-r border-b border-cyan-500/30 w-12 h-12" />
            
            <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-cyan-500/20 rounded-full" />
              ))}
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black text-white font-mono tracking-widest uppercase">Analyzing_Facial_Structure...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
