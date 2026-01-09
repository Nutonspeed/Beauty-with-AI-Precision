"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TelemetryItem {
  id: string;
  label: string;
  value: string;
  status: 'active' | 'pending' | 'sync';
}

export function LiveTelemetry({ className = "" }: { className?: string }) {
  const [items, setItems] = useState<TelemetryItem[]>([
    { id: '1', label: 'NEURAL_LINK', value: 'ESTABLISHED', status: 'active' },
    { id: '2', label: 'PRECISION_INDEX', value: '0.9984', status: 'sync' },
    { id: '3', label: 'VERTEX_BUFFER', value: 'READY', status: 'active' },
    { id: '4', label: 'SYNC_CLOCK', value: '0.00ms', status: 'pending' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        if (item.label === 'PRECISION_INDEX') {
          return { ...item, value: (0.998 + Math.random() * 0.001).toFixed(4) };
        }
        if (item.label === 'SYNC_CLOCK') {
          return { ...item, value: (Math.random() * 2).toFixed(2) + 'ms' };
        }
        return item;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`font-mono text-[9px] space-y-2 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
        <span className="text-cyan-500/60 font-black tracking-[0.2em] uppercase">System_Telemetry_Active</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-l border-white/5 pl-3 group hover:border-cyan-500/30 transition-colors">
            <span className="text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{item.label}</span>
            <span className={`font-black italic ${
              item.status === 'active' ? 'text-cyan-400' : 
              item.status === 'sync' ? 'text-pink-400' : 'text-slate-400'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {/* Moving Bitstream Decorator */}
      <div className="pt-4 overflow-hidden w-full whitespace-nowrap opacity-20">
        <motion.div
          animate={{ x: [0, -100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="text-[7px] text-cyan-500/40"
        >
          01010110 01001001 01010011 01001001 01001111 01001110 01011111 01000001 01001001 
        </motion.div>
      </div>
    </div>
  );
}
