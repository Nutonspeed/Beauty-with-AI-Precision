"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface Snapshot {
  id: string;
  stage: string;
  timestamp: number;
  dataUrl: string;
  perfLow: boolean;
  persona: { tone: string; sensitivity: string; goal: string };
}

interface SessionTimelineProps {
  snapshots: Snapshot[];
  onRequestCapture?: () => void;
  onRemove?: (id: string) => void;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ snapshots, onRequestCapture, onRemove }) => {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();

  return (
    <div className="session-timeline-wrapper">
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-pink-100 shadow-sm">
        <button
          onClick={onRequestCapture}
          className="text-[10px] tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow hover:brightness-110"
        >{t('timeline.capture')}</button>
        <div className="flex items-center gap-2">
          {snapshots.map(s => (
            <div key={s.id} className="relative group">
              <img
                src={s.dataUrl}
                alt={`${t('timeline.stagePrefix')} ${s.stage} ${t('timeline.atTime')} ${new Date(s.timestamp).toLocaleTimeString()}`}
                className="h-12 w-12 object-cover rounded-md ring-1 ring-pink-200/50 cursor-pointer"
                onClick={()=>setOpen(true)}
              />
              <div className="absolute -top-1 -right-1 flex gap-1">
                <span title={s.stage} className="text-[9px] px-1 py-[2px] rounded bg-pink-500/80 text-white leading-none">{s.stage[0].toUpperCase()}</span>
                {s.perfLow && <span title={t('timeline.lowPerfTooltip')} className="text-[9px] px-1 py-[2px] rounded bg-yellow-500/80 text-white leading-none">A</span>}
              </div>
              <button
                onClick={()=>onRemove && onRemove(s.id)}
                className="absolute bottom-0 right-0 text-[9px] opacity-0 group-hover:opacity-100 bg-white/70 backdrop-blur px-1 rounded"
              >×</button>
            </div>
          ))}
        </div>
        {snapshots.length > 0 && (
          <button
            onClick={()=>setOpen(true)}
            className="ml-auto text-[10px] tracking-wider px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-pink-200 text-pink-600 hover:bg-white"
          >{t('timeline.gallery')}</button>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y:40, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              exit={{ y:40, opacity:0 }}
              className="w-[min(100%-2rem,880px)] max-h-[80vh] overflow-y-auto rounded-2xl bg-white/85 backdrop-blur-xl border border-pink-200/60 shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-pink-600">{t('timeline.title')}</h3>
                <button onClick={()=>setOpen(false)} className="text-xs px-3 py-1 rounded-full bg-pink-500 text-white">{t('timeline.close')}</button>
              </div>
              {snapshots.length === 0 && (
                <p className="text-xs text-gray-500">{t('timeline.empty')}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {snapshots.map(s => (
                  <div key={s.id} className="rounded-xl border border-pink-100 bg-white/70 backdrop-blur p-3 flex flex-col gap-2">
                    <img src={s.dataUrl} alt={`Snapshot ${s.stage} captured at ${new Date(s.timestamp).toLocaleTimeString()}`} className="rounded-md object-cover max-h-48" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-pink-600">
                        <span>{s.stage}</span>
                        <span>{new Date(s.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-600 leading-relaxed">
                        {t('timeline.persona')}: {s.persona.tone}/{s.persona.sensitivity}/{s.persona.goal}<br />
                        {s.perfLow ? t('timeline.adaptiveReduced') : t('timeline.adaptiveFull')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
