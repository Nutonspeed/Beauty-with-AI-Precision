'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import useMascotMotion from './useMascotMotion';
import MascotSVG from './MascotSVG';

type MascotProps = {
  variant?: 'svg' | 'lottie' | 'rive';
};

const Mascot: React.FC<MascotProps> = ({ variant = 'svg' }) => {
  const { sectionRef, x, y, rotate, scale, eyeOffset, armWave, badgeTopY, badgeBottomY } = useMascotMotion();
  const inView = useInView(sectionRef, { amount: 0.2, margin: '-20% 0% -20% 0%' });
  const prefersReduced = useReducedMotion();

  return (
    <section ref={sectionRef} className="relative h-[130vh] md:h-[160vh] bg-black text-white">
      <div className="sticky top-16 md:top-24 h-[60vh] md:h-[70vh] flex items-center justify-center overflow-visible">
        {/* Decorative glow orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl hidden sm:block" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl hidden sm:block" />

        {inView && variant === 'svg' && (
          <motion.div style={{ x, y, rotate, scale }} className="relative will-change-transform" aria-hidden>
            <MascotSVG eyeOffset={eyeOffset} armWave={armWave} className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72" />

            {/* Floating micro badges */}
            {!prefersReduced && (
              <>
                <motion.div
                  style={{ y: badgeTopY }}
                  className="absolute -top-6 -right-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur hidden md:block"
                >
                  Agent Online
                </motion.div>
                <motion.div
                  style={{ y: badgeBottomY }}
                  className="absolute -bottom-4 -left-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur hidden md:block"
                >
                  Scroll to Animate
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {inView && variant !== 'svg' && (
          <div className="relative text-xs text-white/70">
            {/* Placeholder for future Rive/Lottie variants */}
            Animated mascot variant: {variant}
          </div>
        )}
      </div>
    </section>
  );
};

export default Mascot;
