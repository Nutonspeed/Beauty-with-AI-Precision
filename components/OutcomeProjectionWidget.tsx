"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/language-context';

interface OutcomeProjectionWidgetProps {
  baselineUrl?: string; // snapshot baseline
  onCaptureBaseline?: () => void;
  disabled?: boolean;
}

export const OutcomeProjectionWidget: React.FC<OutcomeProjectionWidgetProps> = ({ baselineUrl, onCaptureBaseline, disabled }) => {
  const [open, setOpen] = useState(false);
  const [intensity, setIntensity] = useState(0.6); // 0..1
  const [mode, setMode] = useState<'clarity'|'firming'|'hydration'>('clarity');
  const { t } = useLanguage();

  const improvedFilter = useMemo(() => {
    // Different enhancement presets by mode
    switch(mode){
      case 'firming':
        return `brightness(${1 + intensity*0.05}) contrast(${1 + intensity*0.25}) saturate(${1 + intensity*0.05}) hue-rotate(${intensity*5}deg)`;
      case 'hydration':
        return `brightness(${1 + intensity*0.12}) contrast(${1 + intensity*0.08}) saturate(${1 + intensity*0.3}) blur(${(1-intensity)*1}px)`;
      case 'clarity':
      default:
        return `brightness(${1 + intensity*0.06}) contrast(${1 + intensity*0.18}) saturate(${1 + intensity*0.12}) drop-shadow(0 0 ${Math.round(intensity*6)}px rgba(255,107,157,0.35))`;
    }
  }, [intensity, mode]);

  return (
    <div className="outcome-projection-wrapper">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/65 backdrop-blur-md border border-pink-100 shadow-sm">
        <button
          onClick={() => setOpen(o=>!o)}
          disabled={disabled}
          className="text-[10px] tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow hover:brightness-110 disabled:opacity-40"
        >{open? (t as any).outcome?.toggleHide : (t as any).outcome?.toggleShow}</button>
        {!baselineUrl && (
          <button
            onClick={onCaptureBaseline}
            disabled={disabled}
            className="text-[10px] tracking-wider px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-pink-200 text-pink-600 hover:bg-white disabled:opacity-40"
          >{(t as any).outcome?.captureBaseline}</button>
        )}
        {baselineUrl && (
          <span className="text:[10px] tracking-wider text-gray-600">{(t as any).outcome?.baselineReady}</span>
        )}
      </div>
      <AnimatePresence>
        {open && baselineUrl && (
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:20 }}
            className="mt-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-pink-100 shadow-lg p-4 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['clarity','firming','hydration'] as const).map(m=> (
                  <button
                    key={m}
                    onClick={()=>setMode(m)}
                    className={`text-[10px] px-3 py-1 rounded-full border ${mode===m? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow' : 'bg-white/60 text-pink-600 border-pink-200 hover:bg-white'}`}
                  >{(t as any).outcome?.modes?.[m]}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] tracking-wider text-gray-600">
                {(t as any).outcome?.intensity}
                <label className="sr-only" htmlFor="outcome-intensity">{(t as any).outcome?.intensity}</label>
                <input
                  id="outcome-intensity"
                  aria-label={(t as any).outcome?.intensity}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={intensity}
                  onChange={e=>setIntensity(parseFloat(e.target.value))}
                  className="w-32 accent-pink-500"
                />
              </div>
            </div>
            <div className="relative w-full overflow-hidden rounded-lg border border-pink-200/60 bg-black/5">
              <div className="flex w-full">
                <div className="flex-1 p-2 flex flex-col gap-1">
                  <p className="text-[10px] font-semibold tracking-wider text-pink-600">{(t as any).outcome?.before}</p>
                  <img src={baselineUrl} alt={(t as any).outcome?.before} className="rounded-md w-full object-cover" />
                </div>
                <div className="flex-1 p-2 flex flex-col gap-1">
                  <p className="text-[10px] font-semibold tracking-wider text-pink-600">{(t as any).outcome?.afterProjected}</p>
                  <div className="relative">
                    <img src={baselineUrl} alt={(t as any).outcome?.afterProjected} className={`rounded-md w-full object-cover projection-img transition-filter`} data-mode={mode} data-intensity={intensity} />
                    <div className="absolute inset-0 rounded-md pointer-events-none projection-overlay" data-intensity={intensity} />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-1 right-2 text-[9px] tracking-wider text-gray-500">{(t as any).outcome?.footer}</div>
            </div>
          </motion.div>
        )}
        {open && !baselineUrl && (
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:20 }}
            className="mt-3 rounded-xl bg-white/80 backdrop-blur-xl border border-pink-100 shadow p-4 text-[11px] text-gray-600"
          >
            {(t as any).outcome?.needBaseline}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
