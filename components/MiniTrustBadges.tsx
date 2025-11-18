"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/language-context';

interface BadgeDef { id:string; icon:string; }
const badges: BadgeDef[] = [
  { id:'iso', icon:'🛡️' },
  { id:'ethics', icon:'🤖' },
  { id:'secure', icon:'🔐' }
];

export function MiniTrustBadges() {
  const { t } = useLanguage();
  return (
    <div className="mini-trust-wrapper">
      {badges.map((b,i) => (
        <motion.button
          key={b.id}
          whileHover={{ y:-3 }}
          whileTap={{ scale:0.92 }}
          onClick={()=>{ window.location.href='/clinic-experience'; }}
          className="mini-trust-badge"
          title={(t as any).badges?.[b.id]?.tooltip}
        >
          <span className="text-lg leading-none">{b.icon}</span>
          <span className="text-[10px] font-medium tracking-wide">{(t as any).badges?.[b.id]?.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
