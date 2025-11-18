"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, shadows } from '@/lib/design/tokens';

interface Certification {
  id: string;
  label: string;
  authority: string;
  year: number;
  icon: string;
}

interface DoctorProfile {
  id: string;
  name: string;
  role: string;
  expYears: number;
  specialties: string[];
  avatar?: string;
}

const certifications: Certification[] = [
  { id: 'iso-med', label: 'ISO 13485', authority: 'Global Medical Quality', year: 2025, icon: '🛡️' },
  { id: 'ai-ethics', label: 'AI Ethics Compliance', authority: 'Clinical AI Board', year: 2025, icon: '🤖' },
  { id: 'data-sec', label: 'Data Security Tier IV', authority: 'Cyber Health Alliance', year: 2024, icon: '🔐' }
];

const doctors: DoctorProfile[] = [
  { id: 'dr-arin', name: 'Dr. Arin Ch.', role: 'Aesthetic Director', expYears: 12, specialties: ['Facial Mapping', 'Laser Protocol', 'AI Assisted Planning'] },
  { id: 'dr-nina', name: 'Dr. Nina P.', role: 'Clinical AI Lead', expYears: 9, specialties: ['Predictive Outcomes', 'Dermal Analytics'] }
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
  { id: 'a2', ts: '2025-11-18 09:13', actor: 'Dr. Arin', action: 'PLAN_ADJUST', detail: 'Refined laser intensity -2.4% for zone T.' },
  { id: 'a3', ts: '2025-11-18 09:15', actor: 'Model v2.3', action: 'RISK_SCORE', detail: 'Post protocol risk stable at 1.8% (green).' }
];

export function CredibilityPanel() {
  const [openAudit, setOpenAudit] = useState(false);
  return (
    <div className="cred-wrapper">
      <div className="cred-header">CLINICAL TRUST & COMPLIANCE</div>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          {certifications.map(cert => (
            <motion.div
              key={cert.id}
              whileHover={{ y: -4 }}
              className="cred-badge"
            >
              <div className="text-xl mb-1">{cert.icon}</div>
              <div className="text-[11px] font-semibold tracking-wide uppercase">{cert.label}</div>
              <div className="text-[10px] opacity-70">{cert.authority}</div>
              <div className="text-[10px] mt-1 text-pink-600">{cert.year}</div>
            </motion.div>
          ))}
        </div>
        <div className="space-y-3">
          {doctors.map(d => (
            <div key={d.id} className="doctor-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-[13px] font-medium text-gray-700">{d.name.split(' ')[1]?.[0] || d.name[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-800">{d.name}</span>
                    <span className="text-xs text-gray-500">{d.expYears} yrs</span>
                  </div>
                  <div className="text-[11px] text-pink-600 font-semibold tracking-wide">{d.role}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.specialties.map(s => (
                      <span key={s} className="spec-chip">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setOpenAudit(true)} className="audit-btn">View Audit Trail</button>
      </div>
      <AnimatePresence>
        {openAudit && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            className="audit-overlay"
          >
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:10 }} className="audit-modal">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold tracking-wide text-gray-700">AUDIT TRAIL (Last Session)</div>
                <button onClick={()=>setOpenAudit(false)} className="close-btn">✕</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {auditTrail.map(entry => (
                  <div key={entry.id} className="audit-row">
                    <div className="text-[10px] font-medium text-gray-500">{entry.ts}</div>
                    <div className="text-[11px] font-semibold text-gray-800">{entry.actor}</div>
                    <div className="text-[10px] text-pink-600 tracking-wide">{entry.action}</div>
                    <div className="text-[11px] text-gray-600">{entry.detail}</div>
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
