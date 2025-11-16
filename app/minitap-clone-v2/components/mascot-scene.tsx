'use client';

import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// A lightweight, original "agent mascot" built in SVG that reacts to scroll.
// It bobs, looks around, and slightly waves an arm as the page scrolls.
const MascotScene: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });

  // Smooth springed progress for nicer motion
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.2 });

  // Map progress to movement/rotation
  const x = useTransform(p, [0, 1], ['-10%', '10%']);
  const y = useTransform(p, [0, 1], ['0%', '8%']);
  const rotate = useTransform(p, [0, 0.5, 1], ['-4deg', '0deg', '4deg']);
  const eyeOffset = useTransform(p, [0, 1], [0, 3]); // eyes looking slightly right as you scroll
  const armWave = useTransform(p, [0, 0.5, 1], [0, -6, 0]);
  const scale = useTransform(p, [0, 1], [1, 1.05]);

  return (
    <section ref={sectionRef} className="relative h-[160vh] bg-black text-white">
      <div className="sticky top-20 md:top-24 h-[70vh] flex items-center justify-center overflow-visible">
        {/* Decorative glow orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

        <motion.div style={{ x, y, rotate, scale }} className="relative">
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shadow */}
            <ellipse cx="130" cy="210" rx="70" ry="16" fill="black" fillOpacity="0.35" />

            {/* Body */}
            <rect x="70" y="80" width="120" height="110" rx="24" fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.2)" />

            {/* Head */}
            <rect x="85" y="35" width="90" height="70" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />
            {/* Eyes group (moves slightly with scroll) */}
            <motion.g style={{ x: eyeOffset }}>
              <circle cx="115" cy="70" r="6" fill="white" />
              <circle cx="145" cy="70" r="6" fill="white" />
              <circle cx="115" cy="70" r="3" fill="#111827" />
              <circle cx="145" cy="70" r="3" fill="#111827" />
            </motion.g>

            {/* Smile */}
            <path d="M110 88c10 8 30 8 40 0" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />

            {/* Left arm (tiny wave) */}
            <motion.g style={{ y: armWave }}>
              <path d="M68 112c-14 14-20 28-10 38" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
            {/* Right arm */}
            <path d="M192 112c14 14 20 28 10 38" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />

            {/* Chest badge */}
            <circle cx="130" cy="132" r="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" />
            <path d="M124 132h12" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" />
            <path d="M130 126v12" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <linearGradient id="bodyGrad" x1="70" y1="80" x2="190" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(255,255,255,0.08)" />
                <stop offset="1" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating micro badges */}
          <motion.div
            style={{ y: useTransform(p, [0, 1], [-10, 10]) }}
            className="absolute -top-6 -right-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur"
          >
            Agent Online
          </motion.div>
          <motion.div
            style={{ y: useTransform(p, [0, 1], [6, -6]) }}
            className="absolute -bottom-4 -left-10 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur"
          >
            Scroll to Animate
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MascotScene;
