"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function ScannerCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCoords({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, [role="button"], input, select, .interactive-element');
      setIsHovering(!!clickable);
    };

    const handleMouseOut = () => setIsVisible(false);
    const handleMouseIn = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseOut);
    document.addEventListener('mouseenter', handleMouseIn);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseOut);
      document.removeEventListener('mouseenter', handleMouseIn);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {/* Outer Reticle */}
      <motion.div
        animate={{
          rotate: 360,
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(236, 72, 153, 0.8)' : 'rgba(236, 72, 153, 0.3)',
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.3 },
          borderColor: { duration: 0.3 }
        }}
        className="w-12 h-12 border border-pink-500/30 rounded-full flex items-center justify-center relative"
      >
        {/* Reticle Marks */}
        {[0, 90, 180, 270].map((angle) => (
          <div
            key={angle}
            className="absolute w-1 h-[2px] bg-pink-500/50"
            style={{
              transform: `rotate(${angle}deg) translateY(-24px)`,
            }}
          />
        ))}
      </motion.div>

      {/* Inner Dot & Scanning Lines */}
      <motion.div
        animate={{
          scale: isHovering ? 0.5 : 1,
          backgroundColor: isHovering ? 'rgba(14, 165, 233, 0.8)' : 'rgba(236, 72, 153, 0.8)',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"
      />

      {/* Coordinate Telemetry */}
      <motion.div
        animate={{ opacity: isHovering ? 0.2 : 0.6 }}
        className="absolute top-8 left-8 font-mono text-[8px] text-pink-500/60 whitespace-nowrap flex flex-col gap-0.5"
      >
        <div className="flex gap-2">
          <span>X: {Math.round(coords.x)}</span>
          <span>Y: {Math.round(coords.y)}</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
          <span>SCAN_ACTIVE</span>
        </div>
      </motion.div>

      {/* Hover Information Box */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: isHovering ? 0.8 : 0,
          x: isHovering ? 30 : 20
        }}
        className="absolute top-0 left-0 bg-black/40 backdrop-blur-md border border-pink-500/20 px-2 py-1 rounded text-[7px] text-pink-400 font-mono tracking-tighter uppercase whitespace-nowrap"
      >
        System.Execute(Access_Granted)
      </motion.div>
    </motion.div>
  );
}
