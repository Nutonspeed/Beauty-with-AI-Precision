'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

type Props = {
  eyeOffset: MotionValue<number>;
  armWave: MotionValue<number>;
  className?: string;
};

const MascotSVG: React.FC<Props> = ({ eyeOffset, armWave, className }) => {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="130" cy="210" rx="70" ry="16" fill="black" fillOpacity="0.35" />

      {/* Body */}
      <rect x="70" y="80" width="120" height="110" rx="24" fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.2)" />

      {/* Head */}
      <rect x="85" y="35" width="90" height="70" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />

      {/* Eyes */}
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
  );
};

export default MascotSVG;
