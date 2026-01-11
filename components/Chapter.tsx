"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChapterProps {
  index: number; // unused, retained for external API compatibility
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  accent?: 'pink'|'purple'|'yellow'|'mint';
}

const accentMap: Record<string,string> = {
  pink: 'from-blue-600 via-indigo-600 to-blue-700',
  purple: 'from-indigo-500 via-blue-500 to-cyan-500',
  yellow: 'from-blue-400 via-cyan-400 to-indigo-400',
  mint: 'from-cyan-400 via-blue-400 to-indigo-500'
};

export function Chapter({ index: _index, title, eyebrow, children, accent='pink' }: ChapterProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/grid.svg')] bg-center" />
      <motion.div
        initial={{ opacity:0, y:40 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, amount:0.4 }}
        transition={{ duration:0.9, ease:[0.4,0,0.2,1] }}
        className="max-w-5xl w-full mx-auto text-center space-y-10 relative z-10"
      >
        {eyebrow && (
          <div className="text-[10px] tracking-[0.4em] font-black text-slate-400 uppercase italic mb-4">{eyebrow}</div>
        )}
        <h2 className="font-bold tracking-tighter leading-[0.9] italic">
          <span className={`bg-gradient-to-r ${accentMap[accent]} bg-clip-text text-transparent block text-6xl md:text-9xl`}>{title}</span>
        </h2>
        {children && (
          <div className="mx-auto max-w-3xl text-slate-500 text-xl md:text-2xl font-light italic leading-relaxed pt-6">
            {children}
          </div>
        )}
        <div className="absolute inset-x-0 -bottom-20 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </motion.div>
    </section>
  );
}
