'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    key: 'observe',
    title: 'Observe',
    desc: 'Ground vision on live UI to detect elements and state.',
    code: `observe()
  .screen()
  .detect({ text: 'Sign in', role: 'button' })`,
  },
  {
    key: 'act',
    title: 'Act',
    desc: 'Tap, type, and swipe with robust action primitives.',
    code: `act()
  .tap('Sign in')
  .type('#email', user.email)
  .type('#password', user.pass)
  .tap('Continue')`,
  },
  {
    key: 'check',
    title: 'Check',
    desc: 'Assert outcomes and branch flows deterministically.',
    code: `check()
  .expect({ text: 'Welcome' })
  .else(() => recover('Try again'))`,
  },
];

const WorkflowBuilder: React.FC = () => {
  const [active, setActive] = React.useState(steps[0].key);
  const current = steps.find((s) => s.key === active)!;

  return (
    <section className="relative bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Workflow Builder</h2>
          <p className="mt-2 text-gray-300/90">Compose agent flows from reusable building blocks.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Steps list */}
          <div className="space-y-4">
            {steps.map((s, i) => {
              const selected = s.key === active;
              return (
                <motion.button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className={`w-full text-left rounded-2xl border p-5 backdrop-blur-md transition focus:outline-none ${
                    selected
                      ? 'border-white/30 bg-white/[0.08]'
                      : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{s.title}</div>
                      <div className="text-sm text-gray-300/90 mt-1">{s.desc}</div>
                    </div>
                    <motion.div
                      aria-hidden
                      animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.6, repeat: selected ? Infinity : 0, repeatDelay: 1.2 }}
                      className={`h-2 w-2 rounded-full ${selected ? 'bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.7)]' : 'bg-gray-500'}`}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Code/preview panel */}
          <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-black/40 p-6 backdrop-blur-lg min-h-[320px]">
            <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-sm text-gray-300/80">flow.ts</span>
              </div>
              <div className="relative rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-sm leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={current.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="whitespace-pre-wrap text-gray-200"
                  >
{current.code}
                  </motion.pre>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowBuilder;
