"use client";
import { motion } from 'framer-motion';
import { colors } from '@/lib/design/tokens';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

export interface ProgramSettings {
  innerColor: string;
  outerColor: string;
  distort: number;
  opacity: number;
  intensity: number;
  beamColor: string;
  beamSpeed: number;
}

interface Props {
  value: ProgramSettings;
  onChange: (v: ProgramSettings) => void;
}

const presets: Record<string, Partial<ProgramSettings>> = {
  rejuvenate: { innerColor: '#2563eb', outerColor: '#4f46e5', distort: 0.42, intensity: 1, beamColor: '#2563eb' },
  detox: { innerColor: '#06b6d4', outerColor: '#0ea5e9', distort: 0.28, intensity: 0.85, beamColor: '#06b6d4' },
  whitening: { innerColor: '#3b82f6', outerColor: '#6366f1', distort: 0.33, intensity: 0.9, beamColor: '#3b82f6' },
  firming: { innerColor: '#4f46e5', outerColor: '#8b5cf6', distort: 0.38, intensity: 1.05, beamColor: '#4f46e5' }
};

export function ProgramConfigurator({ value, onChange }: Props) {
  const t = useTranslations();
  const update = (patch: Partial<ProgramSettings>) => onChange({ ...value, ...patch });
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-premium space-y-8">
      <div className="text-[10px] font-black tracking-[0.4em] mb-2 text-slate-400 uppercase italic flex items-center gap-3">
        <Zap className="h-4 w-4 text-blue-600" />
        {t('programConfigurator.title')}
      </div>
      <div className="grid gap-8">
        <div className="flex gap-3 flex-wrap">
          {Object.entries(presets).map(([key, p]) => (
            <button
              key={key}
              onClick={()=>update(p)}
              className="px-6 py-2.5 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest italic hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 shadow-sm"
              aria-label={`Apply ${key} program preset`}
            >
              {t(`programConfigurator.presets.${key}` as any)}
            </button>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
              <span>{t('programConfigurator.controls.distort')}</span>
              <span className="text-blue-600">{(value.distort * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.15} max={0.6} step={0.01} value={value.distort} onChange={e=>update({distort: parseFloat(e.target.value)})} className="w-full accent-blue-600" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
              <span>{t('programConfigurator.controls.opacity')}</span>
              <span className="text-blue-600">{(value.opacity * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.3} max={1} step={0.01} value={value.opacity} onChange={e=>update({opacity: parseFloat(e.target.value)})} className="w-full accent-blue-600" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
              <span>{t('programConfigurator.controls.intensity')}</span>
              <span className="text-blue-600">{(value.intensity * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.6} max={1.3} step={0.01} value={value.intensity} onChange={e=>update({intensity: parseFloat(e.target.value)})} className="w-full accent-blue-600" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
              <span>{t('programConfigurator.controls.beamSpeed')}</span>
              <span className="text-blue-600">{(value.beamSpeed * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.05} max={0.7} step={0.01} value={value.beamSpeed} onChange={e=>update({beamSpeed: parseFloat(e.target.value)})} className="w-full accent-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 italic text-center">
              {t('programConfigurator.controls.innerColor')}
            </label>
            <div className="relative h-10 w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner">
              <input type="color" value={value.innerColor} onChange={e=>update({innerColor: e.target.value})} className="absolute inset-0 w-full h-full cursor-pointer scale-150" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 italic text-center">
              {t('programConfigurator.controls.outerColor')}
            </label>
            <div className="relative h-10 w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner">
              <input type="color" value={value.outerColor} onChange={e=>update({outerColor: e.target.value})} className="absolute inset-0 w-full h-full cursor-pointer scale-150" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 italic text-center">
              {t('programConfigurator.controls.beamColor')}
            </label>
            <div className="relative h-10 w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner">
              <input type="color" value={value.beamColor} onChange={e=>update({beamColor: e.target.value})} className="absolute inset-0 w-full h-full cursor-pointer scale-150" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
