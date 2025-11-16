'use client';

import React from 'react';
import { motion } from 'framer-motion';

const items = [
  { title: 'Onboarding Automation', desc: 'Automate sign-ups and profile setup in any app.' },
  { title: 'E2E App Testing', desc: 'Robust scripted tests across device types and OS versions.' },
  { title: 'Data Entry & ETL', desc: 'Gather and normalize data from mobile operations apps.' },
  { title: 'Support Triaging', desc: 'Navigate support apps to triage, tag, and resolve faster.' },
  { title: 'Catalog Management', desc: 'Maintain listings in marketplaces with repeatable flows.' },
  { title: 'Field Ops', desc: 'Assist agents completing tasks in logistics and service apps.' },
];

const UseCases: React.FC = () => {
  return (
    <section className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Use Cases</h2>
          <p className="mt-2 text-gray-300/90">Where mobile-grounded AI agents shine.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md hover:bg-white/[0.06] transition-transform will-change-transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-gray-300/90">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
