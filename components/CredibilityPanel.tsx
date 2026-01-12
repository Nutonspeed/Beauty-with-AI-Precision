"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, Globe, Zap } from 'lucide-react';

interface Certification {
  id: string;
  label: string;
  authority: string;
  year: number;
  icon: string;
}

interface SpecialistProfile {
  id: string;
  name: string;
  role: string;
  expYears: number;
  specialties: string[];
  avatar?: string;
}

const certifications: Certification[] = [
  { id: 'iso-med', label: 'ISO 13485', authority: 'Global Medical Quality', year: 2025, icon: '🛡️' },
  { id: 'ai-ethics', label: 'AI Ethics Compliance', authority: 'Aesthetic AI Board', year: 2025, icon: '🤖' },
  { id: 'data-sec', label: 'Data Security Tier IV', authority: 'Cyber Health Alliance', year: 2024, icon: '🔐' }
];

const specialists: SpecialistProfile[] = [
  { id: 'spec-arin', name: 'Specialist Arin Ch.', role: 'Aesthetic Director', expYears: 12, specialties: ['Facial Mapping', 'Laser Protocol', 'AI Assisted Planning'] },
  { id: 'spec-nina', name: 'Specialist Nina P.', role: 'Aesthetic AI Lead', expYears: 9, specialties: ['Predictive Outcomes', 'Dermal Analytics'] }
];

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
}

const auditTrail: AuditEntry[] = [
  { id: 'a1', ts: '2025-11-18 09:12', actor: 'Model v2.3', action: 'SCAN_COMPLETE', detail: 'Full facial dermal density map generated.' },
  { id: 'a2', ts: '2025-11-18 09:13', actor: 'Specialist Arin', action: 'PLAN_ADJUST', detail: 'Refined laser intensity -2.4% for zone T.' },
  { id: 'a3', ts: '2025-11-18 09:15', actor: 'Model v2.3', action: 'RISK_SCORE', detail: 'Post protocol risk stable at 1.8% (green).' }
];

export function CredibilityPanel() {
  const [openAudit, setOpenAudit] = useState(false);
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-premium w-[340px] space-y-8">
      <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase italic flex items-center gap-3">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        AESTHETIC_TRUST_SYNC
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-3">
          {certifications.map(cert => (
            <motion.div
              key={cert.id}
              whileHover={{ y: -4 }}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-center space-y-2 group/cert hover:border-blue-200 transition-all"
            >
              <div className="text-xl mb-1 group-hover/cert:scale-110 transition-transform">{cert.icon}</div>
              <div className="text-[9px] font-black tracking-widest uppercase text-slate-900 leading-tight">{cert.label}</div>
              <div className="text-[8px] font-black uppercase text-blue-600 italic mt-1">{cert.year}</div>
            </motion.div>
          ))}
        </div>
        <div className="space-y-4">
          {specialists.map(s => (
            <div key={s.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group/doc">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-[13px] font-black text-blue-600 shadow-inner group-hover/doc:scale-105 transition-transform">{s.name.split(' ')[1]?.[0] || s.name[0]}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 italic uppercase">{s.name}</span>
                    <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-widest">{s.expYears}Y_EXP</span>
                  </div>
                  <div className="text-[10px] text-blue-600 font-black tracking-[0.15em] uppercase italic">{s.role}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.specialties.map(spec => (
                      <span key={spec} className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 italic group-hover/doc:border-blue-100 group-hover/doc:text-blue-400 transition-all">{spec}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setOpenAudit(true)} 
          className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
        >
          <Activity className="h-4 w-4" />
          EXECUTE_AUDIT_LOG
        </button>
      </div>
      <AnimatePresence>
        {openAudit && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:10 }} className="bg-white rounded-[3rem] border border-white shadow-premium w-full max-w-xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">SYSTEM_PROTOCOL_TRACE</div>
                  <div className="text-xl font-bold italic tracking-tight text-slate-900 uppercase">AUDIT_TRAIL_SYNCHRONIZER</div>
                </div>
                <button onClick={()=>setOpenAudit(false)} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors">✕</button>
              </div>
              <div className="p-10 space-y-6 max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {auditTrail.map(entry => (
                  <div key={entry.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 group/row hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{entry.ts}</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 italic bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{entry.action}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <div className="text-[11px] font-bold text-slate-900 uppercase italic">{entry.actor}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-light italic leading-relaxed pl-4 border-l border-slate-200">{entry.detail}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
