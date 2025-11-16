'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import useMascotMotion from './useMascotMotion';
import MascotSVG from './MascotSVG';

const Mascot: React.FC = () => {
  const { sectionRef, x, y, rotate, scale, eyeOffset, armWave, badgeTopY, badgeBottomY } = useMascotMotion();
  const inView = useInView(sectionRef, { amount: 0.2, margin: '-20% 0% -20% 0%' });

  return (
    <section ref={sectionRef} className="relative h-[160vh] bg-black text-white">
      <div className="sticky top-20 md:top-24 h-[70vh] flex items-center justify-center overflow-visible">
        {/* Decorative glow orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

        {inView && (
          <motion.div style={{ x, y, rotate, scale }} className="relative" aria-hidden>
            <MascotSVG eyeOffset={eyeOffset} armWave={armWave} />

            {/* Floating micro badges */}
            <motion.div
              style={{ y: badgeTopY }}
              className="absolute -top-6 -right-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur"
            >
              Agent Online
            </motion.div>
            <motion.div
              style={{ y: badgeBottomY }}
              className="absolute -bottom-4 -left-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur"
            >
              Scroll to Animate
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Mascot;
