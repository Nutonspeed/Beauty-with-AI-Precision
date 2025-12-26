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
import { TreatmentConfigurator, TreatmentSettings } from '@/components/TreatmentConfigurator';
import { useLanguage } from '@/lib/i18n/language-context';
import { useTranslations } from 'next-intl';
import { CredibilityPanel } from '@/components/CredibilityPanel';

export default function ClinicExperience(){
  const { t } = useLanguage();
  const t2 = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<TreatmentSettings>({
    innerColor: '#FF6B9D',
    outerColor: '#C084FC',
    distort: 0.35,
    opacity: 0.85,
    beamColor: '#FF6B9D',
    beamSpeed: 0.25,
    intensity: 1
  });
  return (
    <div ref={containerRef} className="relative bg-bc-bg">
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position:[0,1.6,9], fov:60 }}>
          <color attach="background" args={["#FCFCFC"]} />
          <fog attach="fog" args={["#FCFCFC",12,28]} />
          <ambientLight intensity={0.55} />
          <spotLight position={[8,15,12]} intensity={2} angle={0.35} penumbra={1} />
          <Suspense fallback={null}>
            <ProceduralHalo position={[0,0,0]} innerColor={settings.innerColor} outerColor={settings.outerColor} distortScale={settings.distort} opacity={settings.opacity} intensity={settings.intensity} />
            <VolumetricScanBeam position={[0,-3,0]} color={settings.beamColor} sweepSpeed={settings.beamSpeed} />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI/2.1} />
        </Canvas>
      </div>

      {/* Metrics */}
      <div className="fixed top-6 right-6 z-40">
        <AiMetricsPanel />
      </div>
      <div className="fixed bottom-6 right-6 z-40 w-[320px]">
        <TreatmentConfigurator value={settings} onChange={setSettings} />
      </div>
      <div className="fixed top-6 left-6 z-40">
        <CredibilityPanel />
      </div>

      <Chapter index={0} eyebrow={t2('clinic.steps.0.eyebrow')} title={t2('clinic.steps.0.title')} accent="pink">
        {t2('clinic.steps.0.body')}
      </Chapter>
      <Chapter index={1} eyebrow={t2('clinic.steps.1.eyebrow')} title={t2('clinic.steps.1.title')} accent="purple">
        {t2('clinic.steps.1.body')}
      </Chapter>
      <Chapter index={2} eyebrow={t2('clinic.steps.2.eyebrow')} title={t2('clinic.steps.2.title')} accent="yellow">
        {t2('clinic.steps.2.body')}
      </Chapter>
      <Chapter index={3} eyebrow={t2('clinic.steps.3.eyebrow')} title={t2('clinic.steps.3.title')} accent="mint">
        {t2('clinic.steps.3.body')}
      </Chapter>
    </div>
  );
}
