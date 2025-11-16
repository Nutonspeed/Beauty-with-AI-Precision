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

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18 2h3l-7.5 8.5L22 22h-6l-5-6.5L5 22H2l8-9.5L2 2h6l4.5 6L18 2Z" />
  </svg>
);

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.footer
      className="bg-gray-900 text-white py-16 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <motion.div variants={itemVariants}>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Benchmark</Link></li>
              <li><Link href="#" className="hover:text-white">Cloud</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white">API Status</Link></li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="h-6 w-6 rounded bg-white/10" aria-hidden />
            <span className="text-sm text-white/80">minitap.ai</span>
          </div>
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Minitap Clone. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="h-9 w-9 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1]"
              aria-label="GitHub"
            >
              <GithubIcon />
            </Link>
            <Link
              href="#"
              className="h-9 w-9 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1]"
              aria-label="Discord"
            >
              <DiscordIcon />
            </Link>
            <Link
              href="#"
              className="h-9 w-9 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1]"
              aria-label="X"
            >
              <XIcon />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
