import { writeFileSync } from 'fs';

const navContent = `'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/" className="text-white font-bold">BeautyIQ</Link>
      </div>
    </nav>
  )
}

export default Navigation
`;

const servicesContent = `'use client'

import { motion } from 'framer-motion'
import { Brain, Activity, Shield } from 'lucide-react'

const services = [
  { icon: Brain, title: 'AI Analysis', description: 'Advanced computer vision.', gradient: 'from-purple-600 to-blue-600' },
  { icon: Activity, title: 'Tracking', description: 'Visual progress tracking.', gradient: 'from-green-600 to-teal-600' },
  { icon: Shield, title: 'Security', description: 'HIPAA compliant.', gradient: 'from-blue-600 to-indigo-600' }
]

export function ServicesSection() {
  return (
    <section className="py-24 bg-black" id="features">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white mb-8">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={\`inline-flex p-3 rounded-xl bg-gradient-to-br \${service.gradient} mb-6\`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
`;

writeFileSync('components/founders-clone/Navigation.tsx', navContent);
writeFileSync('components/founders-clone/ServicesSection.tsx', servicesContent);

console.log('Files created successfully!');
