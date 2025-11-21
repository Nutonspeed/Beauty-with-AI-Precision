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
  pink: 'from-pink-500 via-rose-500 to-pink-600',
  purple: 'from-purple-500 via-pink-500 to-fuchsia-500',
  yellow: 'from-yellow-400 via-amber-400 to-orange-400',
  mint: 'from-green-400 via-emerald-400 to-teal-500'
};

export function Chapter({ index: _index, title, eyebrow, children, accent='pink' }: ChapterProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
      <motion.div
        initial={{ opacity:0, y:40 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, amount:0.4 }}
        transition={{ duration:0.9, ease:[0.4,0,0.2,1] }}
        className="max-w-5xl w-full mx-auto text-center space-y-8"
      >
        {eyebrow && (
          <div className="text-xs tracking-[0.25em] font-semibold text-gray-500">{eyebrow}</div>
        )}
        <h2 className="font-light leading-tight">
          <span className={`bg-gradient-to-r ${accentMap[accent]} bg-clip-text text-transparent block text-5xl md:text-7xl`}>{title}</span>
        </h2>
        {children && (
          <div className="mx-auto max-w-3xl text-gray-600 text-lg md:text-xl leading-relaxed">
            {children}
          </div>
        )}
        <div className="absolute inset-x-0 -bottom-10 h-px bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />
      </motion.div>
    </section>
  );
}
