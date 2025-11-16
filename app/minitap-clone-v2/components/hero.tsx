'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BenchmarkCard from './benchmark-card';

const Hero = () => {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-6%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <section ref={sectionRef} className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10 will-change-transform"
        style={{ y, scale }}
        src="https://files.staging.peachworlds.com/website/852a3108-5559-446c-838a-6194b8f8c1d5/hero-bg-1_1.mp4"
      />
      <div className="absolute inset-0 bg-black/50 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10 px-4"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-5 leading-[1.02] tracking-tighter">
          Opening the mobile world <br /> to AI agents.
        </h1>
        <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-10 text-white/85">
          The first reliable platform that lets AI agents tap, swipe, and navigate any mobile app.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black font-medium px-6 py-2.5 rounded-full shadow-lg transition-transform flex items-center gap-2"
          >
            Join Cloud Waitlist
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14"/>
              <path d="M12 5l7 7-7 7"/>
            </svg>
          </motion.button>
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/90 hover:bg-white/[0.1]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.86 2.83 1.32 3.52 1.01.11-.8.42-1.32.76-1.62-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.56.12-3.25 0 0 1.01-.32 3.3 1.23.96-.27 1.99-.4 3.01-.41 1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.69.25 2.94.12 3.25.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/>
              </svg>
              1.6k GitHub
            </a>
            <a href="#" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/90 hover:bg-white/[0.1]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-4.935 0A8.258 8.258 0 0 0 10.443 3 19.736 19.736 0 0 0 6.68 4.369C2.391 10.66 1.274 16.8 1.68 22.86A19.9 19.9 0 0 0 8.34 25c.32-.44.6-.91.85-1.4a12.8 12.8 0 0 1-1.35-.66c.11-.08.22-.16.32-.24a14 14 0 0 0 8.27 0c.11.08.22.16.33.24-.43.24-.89.46-1.36.66.25.49.53.96.85 1.4a19.86 19.86 0 0 0 6.65-2.14c.56-8.01-1.31-14.11-3.31-18.87ZM8.96 17.3c-1.03 0-1.87-.95-1.87-2.11 0-1.17.83-2.12 1.87-2.12s1.88.95 1.88 2.12c0 1.16-.84 2.11-1.88 2.11Zm6.09 0c-1.03 0-1.87-.95-1.87-2.11 0-1.17.83-2.12 1.87-2.12s1.88.95 1.88 2.12c0 1.16-.84 2.11-1.88 2.11Z"/>
              </svg>
              Discord
            </a>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs flex items-center gap-2">
        <div className="h-5 w-3 rounded-full border border-white/40 relative">
          <div className="absolute left-1/2 top-1 translate-x-[-50%] h-1.5 w-1 rounded-full bg-white/70 animate-bounce" />
        </div>
        Scroll
      </div>

      {/* Benchmark / metric card + badge */}
      <div className="pointer-events-none absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10 space-y-2">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/90 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Internal benchmark snapshot
        </div>
        <BenchmarkCard />
      </div>
    </section>
  );
};

export default Hero;
