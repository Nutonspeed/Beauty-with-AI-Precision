'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

type BenchmarkCardProps = {
  value?: number;
  label?: string;
  sublabel?: string;
  className?: string;
};

const BenchmarkCard: React.FC<BenchmarkCardProps> = ({
  value = 84.48,
  label = 'Task success',
  sublabel = 'Benchmark across core mobile flows',
  className = '',
}) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => v.toFixed(2));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [mv, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative w-[300px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden ${className}`}
    >
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="relative p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-gray-200/80">{label}</div>
        <div className="mt-1.5 flex items-end gap-1">
          <motion.span className="text-[44px] md:text-5xl font-bold text-white tabular-nums leading-none">
            {display}
          </motion.span>
          <span className="text-2xl font-semibold text-white">%</span>
        </div>
        <div className="mt-2 text-[11px] text-gray-300/80">{sublabel}</div>
        <div className="mt-2 text-[10px] text-gray-300/60">Internal eval · Nov 2025</div>
      </div>
    </motion.div>
  );
};

export default BenchmarkCard;
