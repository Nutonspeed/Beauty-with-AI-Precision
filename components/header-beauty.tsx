/**
 * Beauty AI Custom Header
 * Header ที่ออกแบบเฉพาะสำหรับ Beauty with AI Precision
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BeautyAILogo, RoseIcon } from '@/components/icons/beauty-icons';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BeautyHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Add scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/analysis', label: 'AI Analysis', icon: '🔬' },
    { href: '/ar-simulator', label: 'AR Try-On', icon: '👗' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/about', label: 'About', icon: '✨' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card border-b border-rose-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BeautyAILogo size={32} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-all hover:text-rose-500 ${
                  pathname === item.href ? 'text-rose-500' : 'text-gray-600'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* CTA Button */}
            <Button className="btn-beauty hidden sm:flex">
              <RoseIcon size={16} className="mr-2" />
              Get Started
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
