"use client";
import React, { useEffect, useState } from 'react';

export const AccessibilityToolbar: React.FC = () => {
  const [contrast, setContrast] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    const storedContrast = localStorage.getItem('ciq-high-contrast') === 'yes';
    const storedMotion = localStorage.getItem('ciq-reduced-motion') === 'yes';
    setContrast(storedContrast);
    setMotionReduced(storedMotion);
    if (storedContrast) document.documentElement.classList.add('high-contrast');
  }, []);

  const toggleContrast = () => {
    const next = !contrast;
    setContrast(next);
    localStorage.setItem('ciq-high-contrast', next ? 'yes':'no');
    document.documentElement.classList.toggle('high-contrast', next);
  };

  const toggleMotion = () => {
    const next = !motionReduced;
    setMotionReduced(next);
    localStorage.setItem('ciq-reduced-motion', next ? 'yes':'no');
    // We rely on prefers-reduced-motion media query; here we emulate by adding a class.
    document.documentElement.classList.toggle('reduce-motion', next);
  };

  return (
    <div className="fixed top-4 left-4 z-[90] flex flex-col gap-2 rounded-xl bg-white/80 backdrop-blur-md border border-pink-200 p-3 shadow" aria-label="Accessibility toolbar">
      <button
        onClick={toggleContrast}
        className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow hover:brightness-110"
        aria-label="Toggle high contrast mode"
        data-state={contrast ? 'on' : 'off'}
      >Contrast {contrast? 'ON':'OFF'}</button>
      <button
        onClick={toggleMotion}
        className="text-[11px] px-3 py-1 rounded-full bg-white text-pink-600 border border-pink-300 hover:bg-pink-50"
        aria-label="Toggle reduced motion"
        data-state={motionReduced ? 'on' : 'off'}
      >Motion {motionReduced? 'REDUCED':'FULL'}</button>
    </div>
  );
};
