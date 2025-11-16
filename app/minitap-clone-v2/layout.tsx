import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Minitap Clone',
};

export default function MinitapCloneV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} bg-black text-white`}>{children}</div>
  );
}
