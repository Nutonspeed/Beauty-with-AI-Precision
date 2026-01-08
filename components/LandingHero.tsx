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
import { useTranslations } from "next-intl";

// High-fidelity Clinical Mesh
function MedicalScanningMesh({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state: any) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    
    // Smooth clinical rotation
    ref.current.rotation.y += active ? 0.003 : 0.001;
    
    // Subtle breathing effect for the point cloud
    if (pointsRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.02;
      pointsRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Core Point Cloud - Sells the "AI Scanning" look */}
        <points ref={pointsRef}>
          <sphereGeometry args={[1.4, 64, 64]} />
          <pointsMaterial 
            size={0.015} 
            color="#ff6b9d" 
            transparent 
            opacity={0.4} 
            sizeAttenuation 
          />
        </points>

        {/* Wireframe Shell - Clinical structure */}
        <mesh>
          <sphereGeometry args={[1.39, 32, 32]} />
          <meshStandardMaterial 
            wireframe 
            color="#c084fc" 
            transparent 
            opacity={0.1} 
          />
        </mesh>

        {/* Dynamic Scanning Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.005, 16, 100]} />
          <meshBasicMaterial color="#ff6b9d" transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

interface LandingHeroProps {
  _onPrimary?: () => void;
  _onSecondary?: () => void;
  _ctaVariant?: "A" | "B";
  ctaVariant?: "A" | "B";
}

export function LandingHero({ _onPrimary, _onSecondary, _ctaVariant, ctaVariant }: LandingHeroProps) {
  const t = useTranslations();
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
                <MedicalScanningMesh active={stage==='active'} />
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
      <div className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/5 px-4 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-pink-500 uppercase">
            {t('home.hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:1, ease:[0.16, 1, 0.3, 1] }}
          className="max-w-4xl font-bold tracking-tight text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.1]"
          aria-label={t('home.hero.title')}
        >
          <span className="block text-white mb-2">{t('home.hero.title')}</span>
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            {t('home.hero.subtitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.4, duration:0.8, ease:[0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl text-lg text-gray-400 font-light tracking-wide leading-relaxed"
        >
          {t('home.hero.description')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-6"
        >
          <button 
            onClick={_onPrimary}
            className="group relative h-14 px-10 rounded-full bg-pink-600 text-white font-semibold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-pink-600/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2 tracking-wide">
              {t('home.hero.cta')}
            </span>
          </button>

          <button 
            onClick={_onSecondary}
            className="group h-14 px-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/80 font-medium hover:bg-white/10 transition-all hover:text-white"
          >
            <span className="flex items-center gap-2 tracking-wide">
              {t('home.hero.learnMore')}
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-16 flex items-center gap-8 text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase"
        >
          <span className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-pink-500" />
            {t('home.hero.noCreditCard')}
          </span>
          <span className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-pink-500" />
            {t('home.hero.freeTierAvailable')}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
