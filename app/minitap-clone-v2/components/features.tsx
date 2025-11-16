'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    title: 'Universal Mobile Control',
    desc: 'Agents can tap, type, and swipe reliably across iOS and Android UIs.',
  },
  {
    title: 'Deterministic Replay',
    desc: 'Record and replay flows with high consistency for evals and demos.',
  },
  {
    title: 'Vision + Action Loop',
    desc: 'Grounded perception with robust actions to reduce hallucinations.',
  },
  {
    title: 'Templates & Workflows',
    desc: 'Compose agent workflows from reusable blocks and constraints.',
  },
  {
    title: 'Cloud or Self-Host',
    desc: 'Run on our cloud or bring your own infra with Docker.',
  },
];

const Features: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const elements = refs.current.filter(Boolean) as HTMLDivElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible entry as active
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = elements.indexOf(visible.target as HTMLDivElement);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { root: null, rootMargin: '0px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Sticky visual */}
        <div className="md:sticky md:top-24 h-fit">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-lg">
            <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative aspect-[9/16] w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-xl border border-white/10">
              <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/10" />
              <div className="h-full w-full relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`preview-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Simple preview mock that changes color/shape per activeIndex */}
                    <div
                      className={
                        'h-28 w-40 rounded-xl border border-white/20 ' +
                        [
                          'bg-fuchsia-500/15',
                          'bg-sky-500/15',
                          'bg-emerald-500/15',
                          'bg-amber-500/15',
                          'bg-purple-500/15',
                        ][activeIndex % 5]
                      }
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className="relative mt-4 text-center text-sm text-gray-300/90">Live app surface preview</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              ref={(el) => (refs.current[i] = el)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0 }}
              className={
                'group rounded-2xl border p-6 backdrop-blur-md transition-colors ' +
                (activeIndex === i
                  ? 'border-white/25 bg-white/[0.10]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]')
              }
            >
              <div className="text-xs uppercase tracking-wider text-white/60">Feature {String(i + 1).padStart(2, '0')}</div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-gray-300/90">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
