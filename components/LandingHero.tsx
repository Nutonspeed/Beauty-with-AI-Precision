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
import { PersonaSettings } from '@/components/PersonalizationPanel';
import { analytics } from '@/lib/analytics';
import { useTranslations } from "next-intl";
import { Dna, Scan, ShieldCheck, Target, Cpu, Activity as ActivityIcon } from 'lucide-react';

// --- HUD Components ---
function HudCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const styles = {
    'top-left': 'top-20 left-12 border-t-2 border-l-2',
    'top-right': 'top-20 right-12 border-t-2 border-r-2 text-right',
    'bottom-left': 'bottom-12 left-12 border-b-2 border-l-2',
    'bottom-right': 'bottom-12 right-12 border-b-2 border-r-2 text-right',
  };

  return (
    <div className={`fixed ${styles[position]} w-32 h-32 border-pink-500/10 pointer-events-none z-20 p-4 hidden lg:block backdrop-blur-[2px]`}>
      <div className="text-[7px] font-black uppercase tracking-[0.4em] text-pink-500/30 font-mono">
        {position.replace('-', ' ')}
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-[1px] w-full bg-pink-500/5" />
        <div className="h-[1px] w-2/3 bg-pink-500/5" />
      </div>
    </div>
  );
}

function ScanningLine() {
  return (
    <motion.div
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent z-10 pointer-events-none"
    />
  );
}

function DataStream({ side }: { side: 'left' | 'right' }) {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setData(prev => [
        `${timestamp} | SYNC_${hex} | OK`,
        ...prev.slice(0, 12)
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed ${side === 'left' ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 space-y-3 pointer-events-none z-20 hidden xl:block`}>
      <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-pink-500/20 to-transparent mx-auto mb-4" />
      {data.map((str, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
          animate={{ opacity: (15 - i) / 30, x: 0 }}
          className="font-mono text-[7px] text-pink-500/30 whitespace-nowrap bg-white/[0.02] px-2 py-1 rounded border border-white/5 shadow-2xl"
        >
          {side === 'left' ? `>> ${str}` : `${str} <<`}
        </motion.div>
      ))}
      <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent mx-auto mt-4" />
    </div>
  );
}

// High-fidelity Clinical Mesh
function MedicalScanningMesh({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state: any) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    
    // Smooth clinical rotation
    ref.current.rotation.y += active ? 0.002 : 0.0005;
    
    // Subtle breathing effect for the point cloud
    if (pointsRef.current) {
      const s = 1 + Math.sin(t * 0.8) * 0.01;
      pointsRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={ref}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        {/* Core Point Cloud - Sells the "AI Scanning" look */}
        <points ref={pointsRef}>
          <sphereGeometry args={[1.4, 64, 64]} />
          <pointsMaterial 
            size={0.012} 
            color="#ff6b9d" 
            transparent 
            opacity={0.25} 
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
            opacity={0.05} 
          />
        </mesh>

        {/* Dynamic Scanning Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.003, 16, 100]} />
          <meshBasicMaterial color="#ff6b9d" transparent opacity={0.15} />
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

function AtmosphericFog() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div 
        animate={{ 
          x: [-100, 100],
          opacity: [0.03, 0.07, 0.03]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#ff6b9d_0%,transparent_50%)] blur-[120px]"
      />
      <motion.div 
        animate={{ 
          x: [100, -100],
          opacity: [0.03, 0.07, 0.03]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#c084fc_0%,transparent_50%)] blur-[120px]"
      />
    </div>
  );
}

function GrainOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] mix-blend-overlay">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
    </div>
  );
}

export function LandingHero(props: LandingHeroProps) {
  const { _onPrimary, _onSecondary } = props;
  const t = useTranslations();
  const [stage, setStage] = useState<'intro'|'scanning'|'active'>('intro');
  const [perfLow, _setPerfLow] = useState(false);
  const [persona, _setPersona] = useState<PersonaSettings>({ tone:'Neutral', sensitivity:'Medium', goal:'Rejuvenate' });
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
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
  const captureSnapshot = useCallback((_labelStage: string) => {
    if (!webglSupported) return; // skip when fallback static mode
    try {
      const canvas = document.querySelector('.landing-hero-wrapper canvas') as HTMLCanvasElement | null;
      if (!canvas) return;
      // const dataUrl = canvas.toDataURL('image/png');
      // console.log('Hero snapshot captured for stage:', labelStage);
    } catch {/* ignore */}
  }, [webglSupported]);

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
    <div className="landing-hero-wrapper bg-[#020617]">
      <AtmosphericFog />
      <GrainOverlay />
      {webglSupported ? (
        <div className="fixed inset-0 -z-10 bg-[#020617]">
          <Canvas camera={{ position:[0,0,5], fov:62 }} gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ff87b0" />
            <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} color="#c3a5ff" />
            <Suspense fallback={null}>
              <group position={[0,-0.2,0]}>
                <ProceduralHalo innerColor={haloColors[0]} outerColor={haloColors[1]} distortScale={distortMod} opacity={0.3 * lowPerfFactor} intensity={intensityMod * 0.8 * lowPerfFactor} />
                <MedicalScanningMesh active={stage==='active'} />
                <VolumetricScanBeam color={haloColors[0]} sweepSpeed={(stage==='scanning'?1.1:0.18) * lowPerfFactor} opacity={stage==='active'?0.15*lowPerfFactor:0.25*lowPerfFactor} />
              </group>
              <Environment preset="night" />
            </Suspense>
          </Canvas>
          {/* Deep Vignette Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)] pointer-events-none" />
        </div>
      ) : (
        <div className="fixed inset-0 -z-10 flex items-center justify-center bg-[#020617]">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-[#020617] to-purple-900/20" />
          {/* Graceful fallback illustration */}
          <div className="relative w-[320px] h-[320px] opacity-50">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 opacity-10 blur-3xl" />
            <div className="absolute inset-[18%] rounded-full border border-pink-500/20 backdrop-blur-sm bg-white/5 shadow-inner" />
          </div>
        </div>
      )}
      <div className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* HUD Elements */}
        <HudCorner position="top-left" />
        <HudCorner position="top-right" />
        <HudCorner position="bottom-left" />
        <HudCorner position="bottom-right" />
        <ScanningLine />
        <DataStream side="left" />
        <DataStream side="right" />

        {/* Central HUD Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none hidden lg:block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-pink-500/5 shadow-[0_0_100px_rgba(236,72,153,0.05)]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-10 rounded-full border border-dashed border-cyan-500/10"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10 inline-flex items-center gap-4 rounded-full border border-pink-500/20 bg-pink-500/5 px-6 py-2 backdrop-blur-xl shadow-2xl shadow-pink-500/10"
        >
          <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
            <Cpu className="h-4 w-4 text-pink-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-pink-500/60 font-mono uppercase">V-3.5-O</span>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
          </span>
          <span className="text-[10px] font-black tracking-[0.4em] text-pink-500 uppercase italic">
            {t('home.hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:1, ease:[0.16, 1, 0.3, 1] }}
          className="max-w-5xl font-bold tracking-tight text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95] italic"
          aria-label={t('home.hero.title')}
        >
          <span className="block text-white mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{t('home.hero.title')}</span>
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent not-italic block pb-4 drop-shadow-[0_0_20px_rgba(192,132,252,0.2)]">
            {t('home.hero.subtitle')}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-12 mt-12 mb-12 max-w-3xl mx-auto hidden md:grid"
        >
          {[
            { icon: Dna, label: 'Genetic Precision', val: '99.8%' },
            { icon: Target, label: 'Target Analysis', val: 'Real-time' },
            { icon: ActivityIcon, label: 'Vital Sync', val: 'Active' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-pink-500/50 group-hover:bg-pink-500/5 transition-all shadow-2xl relative">
                <div className="absolute inset-0 bg-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                <item.icon className="h-6 w-6 text-pink-500/60 group-hover:text-pink-400 relative z-10" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 font-mono group-hover:text-pink-500/60 transition-colors">{item.label}</span>
              <span className="text-lg font-black text-white italic tracking-tighter group-hover:text-pink-400 transition-colors">{item.val}</span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.4, duration:0.8, ease:[0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-2xl text-xl text-slate-400 font-light tracking-widest leading-relaxed italic"
        >
          {t('home.hero.description')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 flex flex-col sm:flex-row items-center gap-10"
        >
          <button 
            onClick={_onPrimary}
            className="group relative h-20 px-16 rounded-[2rem] bg-white text-[#020617] font-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] border"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.4em] italic">
              {t('home.hero.cta')}
              <Scan className="h-5 w-5 animate-pulse" />
            </span>
          </button>

          <button 
            onClick={_onSecondary}
            className="group h-20 px-16 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl text-white/40 font-black hover:bg-white/[0.05] transition-all hover:text-white"
          >
            <span className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] italic">
              {t('home.hero.learnMore')}
              <ShieldCheck className="h-5 w-5 text-cyan-500/40 group-hover:text-cyan-400" />
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
