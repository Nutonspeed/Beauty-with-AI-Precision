"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/language-context';

export interface PersonaSettings { tone:string; sensitivity:string; goal:string; }
interface PersonalizationPanelProps { value:PersonaSettings; onChange:(v:PersonaSettings)=>void; }

const toneKeys = ['cool','neutral','warm'] as const;
const sensKeys = ['low','medium','high'] as const;
const goalKeys = ['rejuvenate','firming','clarity'] as const;

export function PersonalizationPanel({ value, onChange }: PersonalizationPanelProps) {
  const { t } = useLanguage();
  function update<K extends keyof PersonaSettings>(k:K, v:PersonaSettings[K]){ onChange({ ...value, [k]:v }); }
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="persona-panel">
      <div className="persona-title">{t.persona.title}</div>
      <div className="grid gap-3">
        <div className="field-group">
          <label>{t.persona.tone}</label>
          <div className="seg-row">
            {toneKeys.map(k => {
              const label = t.persona.options.tone[k];
              return (
                <button key={k} onClick={()=>update('tone',label)} className={"seg-btn" + (value.tone===label?" active":"")}>{label}</button>
              );
            })}
          </div>
        </div>
        <div className="field-group">
          <label>{t.persona.sensitivity}</label>
          <div className="seg-row">
            {sensKeys.map(k => {
              const label = t.persona.options.sensitivity[k];
              return (
                <button key={k} onClick={()=>update('sensitivity',label)} className={"seg-btn" + (value.sensitivity===label?" active":"")}>{label}</button>
              );
            })}
          </div>
        </div>
        <div className="field-group">
          <label>{t.persona.goal}</label>
          <div className="seg-row">
            {goalKeys.map(k => {
              const label = t.persona.options.goal[k];
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
