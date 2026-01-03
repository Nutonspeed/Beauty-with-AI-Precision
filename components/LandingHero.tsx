"use client";
import React, { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic imports for heavy 3D libraries to reduce initial bundle
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false });
const Float = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Float })), { ssr: false });
const Environment = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })), { ssr: false });
const ProceduralHalo = dynamic(() => import('@/components/three/ProceduralHalo').then(mod => ({ default: mod.ProceduralHalo })), { ssr: false });
const VolumetricScanBeam = dynamic(() => import('@/components/three/VolumetricScanBeam').then(mod => ({ default: mod.VolumetricScanBeam })), { ssr: false });

// Import THREE and useFrame only when needed
import * as THREE from 'three';
let useFrame: any;
if (typeof window !== 'undefined') {
  import('@react-three/fiber').then(mod => { useFrame = mod.useFrame; });
}
import { MiniTrustBadges } from '@/components/MiniTrustBadges';
import { PersonaSettings } from '@/components/PersonalizationPanel';
import { analytics } from '@/lib/analytics';

// Toned-down sphere
function HeroSphere({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state: any) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Subtle breathing
    const s = 1 + Math.sin(t * 1.5) * 0.04;
    ref.current.scale.setScalar(s);
    // Slow rotation only when active
    ref.current.rotation.y += active ? 0.002 : 0.0005;
  });
  return (
    <Float floatIntensity={0.6} rotationIntensity={0.2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.25, 3]} />
        <meshStandardMaterial
          color="#ff6b9d"
          metalness={0.45}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

interface LandingHeroProps {
  _onPrimary?: () => void;
  _onSecondary?: () => void;
  _ctaVariant?: "A" | "B";
  ctaVariant?: "A" | "B";
}

export function LandingHero({ _onPrimary, _onSecondary, _ctaVariant, ctaVariant }: LandingHeroProps) {
  const selectedCtaVariant = _ctaVariant ?? ctaVariant ?? "A";
  const [stage, setStage] = useState<'intro'|'scanning'|'active'>('intro');
  const [perfLow, _setPerfLow] = useState(false);
  const [persona, _setPersona] = useState<PersonaSettings>({ tone:'Neutral', sensitivity:'Medium', goal:'Rejuvenate' });
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [snapshots, setSnapshots] = useState<Array<{
    id: string;
    stage: string;
    timestamp: number;
    dataUrl: string;
    perfLow: boolean;
    persona: PersonaSettings;
  }>>([]);
  const haloColors = (() => {
    switch(persona.tone){
      case 'Cool': return ['#b3d6ff','#c084fc'];
      case 'Warm': return ['#ff6b9d','#fbbf8b'];
      default: return ['#ff6b9d','#c084fc'];
    }
  })();
  const intensityMod = persona.goal==='Firming'?0.75: persona.goal==='Clarity'?0.55:0.65;
  const distortMod = persona.sensitivity==='High'?0.25: persona.sensitivity==='Low'?0.45:0.35;
  const lowPerfFactor = perfLow?0.5:1;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(()=>setStage('scanning'), 900));
    timers.push(setTimeout(()=>setStage('active'), 2400));
    return () => { timers.forEach(clearTimeout); };
  }, []);

  // Log stage changes (privacy-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('track' in analytics) (analytics as any).track('stage_change', { stage });
    }
  }, [stage]);

  // Detect WebGL support (runs client-side only)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
      if ('track' in analytics) (analytics as any).track('webgl_support', { supported: !!gl });
    } catch {
      setWebglSupported(false);
      if ('track' in analytics) (analytics as any).track('webgl_support', { supported: false });
    }
  }, []);

  // Capture snapshot helper
  const captureSnapshot = useCallback((labelStage: string) => {
    if (!webglSupported) return; // skip when fallback static mode
    try {
      const canvas = document.querySelector('.landing-hero-wrapper canvas') as HTMLCanvasElement | null;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      setSnapshots(prev => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          stage: labelStage,
          timestamp: Date.now(),
          dataUrl,
          perfLow,
          persona
        }
      ].slice(-24)); // keep last 24
    } catch {/* ignore */}
  }, [webglSupported, perfLow, persona]);

  // Capture at stage transitions with slight delay for rendering stabilization
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (stage==='scanning' || stage==='active') captureSnapshot(stage);
    }, 300);
    return () => clearTimeout(timeout);
  }, [stage, captureSnapshot]);

  // Log perf adaptation
  useEffect(() => {
    if ('track' in analytics) (analytics as any).track('performance_state', { low: perfLow });
  }, [perfLow]);

  // Log persona updates
  useEffect(() => {
    if ('track' in analytics) (analytics as any).track('persona_update', persona);
  }, [persona]);

  return (
    <div className="landing-hero-wrapper">
      {webglSupported ? (
        <div className="fixed inset-0 -z-10">
          <Canvas camera={{ position:[0,0,5], fov:62 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[6,7,6]} angle={0.4} penumbra={1} intensity={1.8} color="#ff87b0" />
            <spotLight position={[-6,-5,-6]} angle={0.5} penumbra={1} intensity={1.2} color="#c3a5ff" />
            <Suspense fallback={null}>
              <group position={[0,-0.2,0]}>
                <ProceduralHalo innerColor={haloColors[0]} outerColor={haloColors[1]} distortScale={distortMod} opacity={0.5 * lowPerfFactor} intensity={intensityMod * lowPerfFactor} />
                <HeroSphere active={stage==='active'} />
                <VolumetricScanBeam color={haloColors[0]} sweepSpeed={(stage==='scanning'?1.1:0.18) * lowPerfFactor} opacity={stage==='active'?0.25*lowPerfFactor:0.38*lowPerfFactor} />
              </group>
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="fixed inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
          {/* Graceful fallback illustration */}
          <div className="relative w-[320px] h-[320px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 opacity-20 blur-2xl" />
            <div className="absolute inset-[18%] rounded-full border border-pink-300/50 backdrop-blur-sm bg-white/30 shadow-inner" />
            <div className="absolute inset-[30%] rounded-full bg-gradient-to-b from-white/70 to-pink-100/40 border border-white/40" />
            <div className="absolute left-1/2 top-[12%] -translate-x-1/2 h-32 w-1 bg-gradient-to-b from-pink-400/60 via-purple-400/40 to-transparent" />
          </div>
        </div>
      )}
      <div className="relative h-screen flex flex-col items-center justify-center px-6">
        <motion.h1
          initial={{ opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.9, ease:'easeOut' }}
          className="text-center font-semibold tracking-[0.12em] leading-tight text-[clamp(2.4rem,6vw,4.4rem)]"
          aria-label="Clinical AI Aesthetic Engine"
        >
          <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">CLINICAL AI AESTHETIC ENGINE</span>
        </motion.h1>
        <motion.p
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.6, duration:0.8 }}
          className="mt-8 text-center text-gray-600 text-lg tracking-wider"
        >
          AI-powered skin analysis and treatment simulation platform
        </motion.p>
        <MiniTrustBadges />
      </div>
    </div>
  );
}
