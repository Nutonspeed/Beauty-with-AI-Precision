'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.86 2.83 1.32 3.52 1.01.11-.8.42-1.32.76-1.62-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.56.12-3.25 0 0 1.01-.32 3.3 1.23.96-.27 1.99-.4 3.01-.41 1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.69.25 2.94.12 3.25.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-4.935 0A8.258 8.258 0 0 0 10.443 3 19.736 19.736 0 0 0 6.68 4.369C2.391 10.66 1.274 16.8 1.68 22.86A19.9 19.9 0 0 0 8.34 25c.32-.44.6-.91.85-1.4a12.8 12.8 0 0 1-1.35-.66c.11-.08.22-.16.32-.24a14 14 0 0 0 8.27 0c.11.08.22.16.33.24-.43.24-.89.46-1.36.66.25.49.53.96.85 1.4a19.86 19.86 0 0 0 6.65-2.14c.56-8.01-1.31-14.11-3.31-18.87ZM8.96 17.3c-1.03 0-1.87-.95-1.87-2.11 0-1.17.83-2.12 1.87-2.12s1.88.95 1.88 2.12c0 1.16-.84 2.11-1.88 2.11Zm6.09 0c-1.03 0-1.87-.95-1.87-2.11 0-1.17.83-2.12 1.87-2.12s1.88.95 1.88 2.12c0 1.16-.84 2.11-1.88 2.11Z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14"/>
    <path d="M12 5l7 7-7 7"/>
  </svg>
);

const Header = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 p-3"
    >
      <div
        className={`mx-auto max-w-7xl flex justify-between items-center px-3 py-2 rounded-full border transition-all duration-300 ${
          scrolled
            ? 'bg-black/40 backdrop-blur-xl border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
            : 'bg-black/10 backdrop-blur-md border-white/10'
        }`}
      >
        <div className="flex items-center gap-6">
          <Link href="/minitap-clone-v2" className="pl-2 font-bold text-white text-base md:text-lg tracking-tight">
            minitap.ai
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="#" className="text-white/80 hover:text-white transition">Benchmark</Link>
            <Link href="#" className="text-white/80 hover:text-white transition">Blog</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/90 hover:bg-white/[0.1]"
            aria-label="GitHub"
          >
            <GithubIcon />
            <span className="hidden md:inline">GitHub</span>
          </Link>
          <Link
            href="#"
            className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/90 hover:bg-white/[0.1]"
            aria-label="Discord"
          >
            <DiscordIcon />
            <span className="hidden md:inline">Discord</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-full bg-white text-black font-medium px-4 py-1.5 text-sm"
          >
            Join Cloud Waitlist
            <ArrowRightIcon />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
