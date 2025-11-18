'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const logos = [
  { src: '/minitap/logos/logo1.svg', alt: 'Logo 1' },
  { src: '/minitap/logos/logo2.svg', alt: 'Logo 2' },
  { src: '/minitap/logos/logo3.svg', alt: 'Logo 3' },
  { src: '/minitap/logos/logo4.svg', alt: 'Logo 4' },
  { src: '/minitap/logos/logo5.svg', alt: 'Logo 5' },
  { src: '/minitap/logos/logo6.svg', alt: 'Logo 6' },
  { src: '/minitap/logos/logo7.svg', alt: 'Logo 7' },
  { src: '/minitap/logos/logo8.svg', alt: 'Logo 8' },
];

const BackedBy = () => {
  const track = [...logos, ...logos];

  return (
    <section className="py-16 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-white/70">Backed By</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex items-center gap-16 min-w-max will-change-transform"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
          >
            {track.map((logo, index) => (
              <div key={index} className="h-12 w-32 md:h-12 md:w-40 flex-shrink-0">
                <div className="relative h-full w-full flex items-center justify-center">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={48}
                    className="opacity-80"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default BackedBy;
