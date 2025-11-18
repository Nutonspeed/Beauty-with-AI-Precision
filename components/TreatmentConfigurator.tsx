"use client";
import { motion } from 'framer-motion';
import { colors } from '@/lib/design/tokens';

export interface TreatmentSettings {
  innerColor: string;
  outerColor: string;
  distort: number;
  opacity: number;
  beamColor: string;
  beamSpeed: number;
  intensity: number;
}

interface Props {
  value: TreatmentSettings;
  onChange: (v: TreatmentSettings) => void;
}

const presets: Record<string, Partial<TreatmentSettings>> = {
  rejuvenate: { innerColor: colors.accentPink, outerColor: colors.accentPurple, distort: 0.42, intensity: 1, beamColor: colors.accentPink },
  detox: { innerColor: '#5AD4B6', outerColor: '#9BE8D8', distort: 0.28, intensity: 0.85, beamColor: colors.accentMint },
  whitening: { innerColor: '#FFE6A3', outerColor: '#FBBF24', distort: 0.33, intensity: 0.9, beamColor: colors.accentYellow },
  firming: { innerColor: '#D6A9FF', outerColor: '#C084FC', distort: 0.38, intensity: 1.05, beamColor: colors.accentPurple }
};

export function TreatmentConfigurator({ value, onChange }: Props) {
  const update = (patch: Partial<TreatmentSettings>) => onChange({ ...value, ...patch });
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="treatment-configurator">
      <div className="text-xs font-semibold tracking-wide mb-3 text-gray-600">TREATMENT CONFIGURATOR</div>
      <div className="grid gap-3">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(presets).map(([key,p]) => (
            <button
              key={key}
              onClick={()=>update(p)}
              className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border text-xs hover:bg-white transition"
              aria-label={`Apply ${key} treatment preset`}
            >{key}</button>
          ))}
        </div>
        <label className="block text-[11px] font-medium text-gray-500">Halo Distort
          <input type="range" min={0.15} max={0.6} step={0.01} value={value.distort} onChange={e=>update({distort: parseFloat(e.target.value)})} />
        </label>
        <label className="block text-[11px] font-medium text-gray-500">Halo Opacity
          <input type="range" min={0.3} max={1} step={0.01} value={value.opacity} onChange={e=>update({opacity: parseFloat(e.target.value)})} />
        </label>
        <label className="block text-[11px] font-medium text-gray-500">Halo Intensity
          <input type="range" min={0.6} max={1.3} step={0.01} value={value.intensity} onChange={e=>update({intensity: parseFloat(e.target.value)})} />
        </label>
        <label className="block text-[11px] font-medium text-gray-500">Beam Speed
          <input type="range" min={0.05} max={0.7} step={0.01} value={value.beamSpeed} onChange={e=>update({beamSpeed: parseFloat(e.target.value)})} />
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-500">Inner Color
              <input type="color" value={value.innerColor} onChange={e=>update({innerColor: e.target.value})} />
            </label>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-500">Outer Color
              <input type="color" value={value.outerColor} onChange={e=>update({outerColor: e.target.value})} />
            </label>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-500">Beam Color
              <input type="color" value={value.beamColor} onChange={e=>update({beamColor: e.target.value})} />
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
