"use client";
import { Suspense, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Chapter } from '@/components/Chapter';
import { AiMetricsPanel } from '@/components/ai-metrics-panel';
import { ProgramConfigurator, ProgramSettings } from '@/components/ProgramConfigurator';
import { CredibilityPanel } from '@/components/CredibilityPanel';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

// Dynamic imports for 3D libraries
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false });
const ProceduralHalo = dynamic(() => import('@/components/three/ProceduralHalo').then(mod => ({ default: mod.ProceduralHalo })), { ssr: false });
const VolumetricScanBeam = dynamic(() => import('@/components/three/VolumetricScanBeam').then(mod => ({ default: mod.VolumetricScanBeam })), { ssr: false });
const Environment = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false });

export default function CenterExperience(){
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ProgramSettings>({
    innerColor: '#ff69b4',
    outerColor: '#03a9f4',
    distort: 0.35,
    opacity: 0.85,
    beamColor: '#ff69b4',
    beamSpeed: 0.25,
    intensity: 1
  });

  return (
    <div ref={containerRef} className="relative bg-white min-h-screen flex flex-col text-slate-950 selection:bg-pink-500/10 selection:text-pink-600">
      <Header />
      
      <main className="flex-1 relative">
        {/* 3D Visual Layer - High-End Aesthetic */}
        <div className="fixed inset-0 -z-10 bg-white">
          <Canvas camera={{ position:[0,1.6,9], fov:60 }}>
            <color attach="background" args={["#ffffff"]} />
            <fog attach="fog" args={["#ffffff",12,28]} />
            <ambientLight intensity={1.2} />
            <spotLight position={[8,15,12]} intensity={3} angle={0.35} penumbra={1} castShadow />
            <Suspense fallback={null}>
              <ProceduralHalo position={[0,0,0]} innerColor={settings.innerColor} outerColor={settings.outerColor} distortScale={settings.distort} opacity={settings.opacity} intensity={settings.intensity} />
              <VolumetricScanBeam position={[0,-3,0]} color={settings.beamColor} sweepSpeed={settings.beamSpeed} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI/2.1} />
          </Canvas>
          
          {/* Infrastructure Glow Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01]" />
          </div>
        </div>

        {/* HUD Interface Nodes - Floating Precision Panels */}
        <div className="fixed top-32 right-10 z-40 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <AiMetricsPanel />
          </motion.div>
        </div>
        
        <div className="fixed bottom-10 right-10 z-40 w-[360px] hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <ProgramConfigurator value={settings} onChange={setSettings} />
          </motion.div>
        </div>
        
        <div className="fixed top-32 left-10 z-40 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <CredibilityPanel />
          </motion.div>
        </div>

        {/* Content Layers - Narrative Flow */}
        <div className="relative z-10">
          <Chapter 
            index={0} 
            eyebrow="SEQUENCE_01 // INITIALIZATION" 
            title={t('center.steps.0.title' as any) || 'Digital Twin Sync'} 
            accent="pink"
          >
            {t('center.steps.0.body' as any) || 'Synchronize your unique biological markers with our high-fidelity aesthetic database.'}
          </Chapter>
          
          <Chapter 
            index={1} 
            eyebrow="SEQUENCE_02 // ANALYSIS" 
            title={t('center.steps.1.title' as any) || 'Neural Diagnostics'} 
            accent="purple"
          >
            {t('center.steps.1.body' as any) || 'Leveraging multi-layered neural networks to decode 468-point facial depth data.'}
          </Chapter>
          
          <Chapter 
            index={2} 
            eyebrow="SEQUENCE_03 // SYNTHESIS" 
            title={t('center.steps.2.title' as any) || 'Transformation Roadmap'} 
            accent="yellow"
          >
            {t('center.steps.2.body' as any) || 'Orchestrate precision treatment protocols based on predictive outcome simulations.'}
          </Chapter>
          
          <Chapter 
            index={3} 
            eyebrow="SEQUENCE_04 // TRANSFORMATION" 
            title={t('center.steps.3.title' as any) || 'Aesthetic Evolution'} 
            accent="mint"
          >
            {t('center.steps.3.body' as any) || 'Monitor real-time progress across temporal nodes and realize your aesthetic potential.'}
          </Chapter>
        </div>

        {/* Floating Call to Action interface */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button size="xl" variant="premium" className="h-20 px-16 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] italic transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white">
              <Zap className="mr-4 h-6 w-6" />
              Initialize Personal Sequence
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
