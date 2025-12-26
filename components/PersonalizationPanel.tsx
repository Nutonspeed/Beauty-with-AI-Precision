"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

export interface PersonaSettings { tone:string; sensitivity:string; goal:string; }
interface PersonalizationPanelProps { value:PersonaSettings; onChange:(v:PersonaSettings)=>void; }

const toneKeys = ['cool','neutral','warm'] as const;
const sensKeys = ['low','medium','high'] as const;
const goalKeys = ['rejuvenate','firming','clarity'] as const;

export function PersonalizationPanel({ value, onChange }: PersonalizationPanelProps) {
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  function update<K extends keyof PersonaSettings>(k:K, v:PersonaSettings[K]){ onChange({ ...value, [k]:v }); }
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="persona-panel">
      <div className="persona-title">{isThaiLocale ? 'ปรับแต่งประสบการณ์' : 'Personalize Experience'}</div>
      <div className="grid gap-3">
        <div className="field-group">
          <label>{isThaiLocale ? 'โทน' : 'Tone'}</label>
          <div className="seg-row">
            {toneKeys.map(k => {
              const label = isThaiLocale 
                ? { cool: 'เย็น', neutral: 'กลาง', warm: 'อุ่น' }[k]
                : { cool: 'Cool', neutral: 'Neutral', warm: 'Warm' }[k];
              return (
                <button key={k} onClick={()=>update('tone',label)} className={"seg-btn" + (value.tone===label?" active":"")}>{label}</button>
              );
            })}
          </div>
        </div>
        <div className="field-group">
          <label>{isThaiLocale ? 'ความไว' : 'Sensitivity'}</label>
          <div className="seg-row">
            {sensKeys.map(k => {
              const label = isThaiLocale 
                ? { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง' }[k]
                : { low: 'Low', medium: 'Medium', high: 'High' }[k];
              return (
                <button key={k} onClick={()=>update('sensitivity',label)} className={"seg-btn" + (value.sensitivity===label?" active":"")}>{label}</button>
              );
            })}
          </div>
        </div>
        <div className="field-group">
          <label>{isThaiLocale ? 'เป้าหมาย' : 'Goal'}</label>
          <div className="seg-row">
            {goalKeys.map(k => {
              const label = isThaiLocale 
                ? { rejuvenate: 'ปรับปรุง', firming: 'กระชับ', clarity: 'ใส' }[k]
                : { rejuvenate: 'Rejuvenate', firming: 'Firming', clarity: 'Clarity' }[k];
              return (
                <button key={k} onClick={()=>update('goal',label)} className={"seg-btn" + (value.goal===label?" active":"")}>{label}</button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
