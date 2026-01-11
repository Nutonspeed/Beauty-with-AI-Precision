"use client";
import { Suspense, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for 3D libraries to improve initial load performance
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false });
const ProceduralHalo = dynamic(() => import('@/components/three/ProceduralHalo').then(mod => ({ default: mod.ProceduralHalo })), { ssr: false });
const VolumetricScanBeam = dynamic(() => import('@/components/three/VolumetricScanBeam').then(mod => ({ default: mod.VolumetricScanBeam })), { ssr: false });
const Environment = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false });
import { Chapter } from '@/components/Chapter';
import { AiMetricsPanel } from '@/components/ai-metrics-panel';
import { ProgramConfigurator, ProgramSettings } from '@/components/ProgramConfigurator';
import { useTranslations } from 'next-intl';
import { CredibilityPanel } from '@/components/CredibilityPanel';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function CenterExperience(){
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ProgramSettings>({
    innerColor: '#2563eb',
    outerColor: '#4f46e5',
    distort: 0.35,
    opacity: 0.85,
    beamColor: '#2563eb',
    beamSpeed: 0.25,
    intensity: 1
  });
  return (
    <div ref={containerRef} className="relative bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative">
        <div className="fixed inset-0 -z-10">
          <Canvas camera={{ position:[0,1.6,9], fov:60 }}>
            <color attach="background" args={["#f8fafc"]} />
            <fog attach="fog" args={["#f8fafc",12,28]} />
            <ambientLight intensity={0.8} />
            <spotLight position={[8,15,12]} intensity={2.5} angle={0.35} penumbra={1} castShadow />
            <Suspense fallback={null}>
              <ProceduralHalo position={[0,0,0]} innerColor={settings.innerColor} outerColor={settings.outerColor} distortScale={settings.distort} opacity={settings.opacity} intensity={settings.intensity} />
              <VolumetricScanBeam position={[0,-3,0]} color={settings.beamColor} sweepSpeed={settings.beamSpeed} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI/2.1} />
          </Canvas>
        </div>

        {/* HUD Interface Nodes */}
        <div className="fixed top-28 right-8 z-40 hidden lg:block">
          <AiMetricsPanel />
        </div>
        
        <div className="fixed bottom-8 right-8 z-40 w-[340px] hidden lg:block">
          <ProgramConfigurator value={settings} onChange={setSettings} />
        </div>
        
        <div className="fixed top-28 left-8 z-40 hidden lg:block">
          <CredibilityPanel />
        </div>

        {/* Content Layers */}
        <div className="relative z-10">
          <Chapter index={0} eyebrow="SEQUENCE_01 // INITIALIZATION" title={t('center.steps.0.title')} accent="pink">
            {t('center.steps.0.body')}
          </Chapter>
          <Chapter index={1} eyebrow="SEQUENCE_02 // ANALYSIS" title={t('center.steps.1.title')} accent="purple">
            {t('center.steps.1.body')}
          </Chapter>
          <Chapter index={2} eyebrow="SEQUENCE_03 // SYNTHESIS" title={t('center.steps.2.title')} accent="yellow">
            {t('center.steps.2.body')}
          </Chapter>
          <Chapter index={3} eyebrow="SEQUENCE_04 // TRANSFORMATION" title={t('center.steps.3.title')} accent="mint">
            {t('center.steps.3.body')}
          </Chapter>
        </div>
      </main>

      <Footer />
    </div>
  );
}
