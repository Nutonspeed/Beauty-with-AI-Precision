/**
 * Beauty AI Custom Hero Section
 * Hero section ที่ออกแบบเฉพาะ
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AIStarIcon, BeautyGemIcon } from '@/components/icons/beauty-icons';
import Link from 'next/link';

export function BeautyHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-purple-50" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gold-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-6">
          <AIStarIcon size={16} />
          <span>Powered by Advanced AI Technology</span>
        </div>

        {/* Title */}
        <h1 className="beauty-title text-5xl md:text-7xl font-bold mb-6">
          Beauty with
          <br />
          AI Precision
        </h1>

        {/* Subtitle */}
        <p className="beauty-subtitle text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          ปฏิวัติวงการความงามด้วย AI ที่วิเคราะห์ผิวหน้าอย่างแม่นยำ
          <br />
          และแนะนำการดูแลที่เหมาะสมเฉพาะคุณ
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500">98%</div>
            <div className="text-sm text-gray-600">ความแม่นยำ</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">50K+</div>
            <div className="text-sm text-gray-600">ผู้ใช้งาน</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold-500">24/7</div>
            <div className="text-sm text-gray-600">AI Assistant</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/analysis">
            <Button size="lg" className="btn-beauty text-lg px-8 py-4">
              <BeautyGemIcon size={20} className="mr-2" />
              เริ่มวิเคราะห์ฟรี
            </Button>
          </Link>
          <Link href="/ar-simulator">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-rose-200 hover:bg-rose-50">
              <span className="mr-2">👗</span>
              ลองเสื้อผ้า AR
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">FDA Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Dermatologist Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm">AI Certified</span>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 hidden lg:block">
        <div className="glass-card p-4 rounded-2xl">
          <AIStarIcon size={32} className="text-purple-500" />
        </div>
      </div>
      
      <div className="absolute bottom-20 left-20 hidden lg:block">
        <div className="glass-card p-4 rounded-2xl">
          <BeautyGemIcon size={32} className="text-gold-500" />
        </div>
      </div>
    </section>
  );
}
