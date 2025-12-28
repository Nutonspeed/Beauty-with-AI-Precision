/**
 * Beauty AI Loading Components
 * Loading animations ที่ออกแบบเฉพาะสำหรับ Beauty with AI Precision
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ดอกกุหลาบบาน - หลัก
export function RoseLoading({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        className="w-full h-full animate-spin-slow text-rose-500"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* กลีบดอกกุหลาบ */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, i) => (
          <path
            key={i}
            d="M50 50 Q50 30, 65 20 Q80 10, 85 25 Q90 40, 75 50 Q60 60, 50 50"
            fill="currentColor"
            opacity={0.3 + (i * 0.1)}
            transform={`rotate(${rotation} 50 50)`}
            className="animate-pulse-beauty"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {/* วงกลมกลาง */}
        <circle cx="50" cy="50" r="8" fill="currentColor" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// พลอยเรืองแสง
export function GemLoading({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        className="w-full h-full animate-bounce-beauty"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* พลอย */}
        <path
          d="M50 10 L70 40 L90 50 L70 60 L50 90 L30 60 L10 50 L30 40 Z"
          fill="url(#gemGradient)"
          className="animate-pulse"
        />
        <path
          d="M50 35 L60 45 L50 55 L40 45 Z"
          fill="white"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" className="animate-pulse" />
            <stop offset="100%" stopColor="#E11D48" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// หยดน้ำ AI
export function WaterDropLoading({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-12 h-16',
    lg: 'w-16 h-20'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        className="w-full h-full"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <path
          d="M30 5 C30 5, 10 35, 10 50 C10 65, 20 75, 30 75 C40 75, 50 65, 50 50 C50 35, 30 5, 30 5Z"
          fill="url(#dropGradient)"
          className="animate-pulse-beauty"
        />
        <circle cx="30" cy="45" r="8" fill="white" opacity="0.3" className="animate-pulse" />
      </svg>
    </div>
  );
}

// ระฆังความงาม
export function BeautyBellLoading({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        className="w-full h-full animate-pulse-beauty"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 10 C40 10, 35 20, 35 30 L35 50 C35 60, 30 70, 20 70 L80 70 C70 70, 65 60, 65 50 L65 30 C65 20, 60 10, 50 10Z"
          fill="currentColor"
          className="text-rose-500"
        />
        <path
          d="M40 70 L60 70 L55 80 L45 80 Z"
          fill="currentColor"
          className="text-rose-600"
        />
        <circle cx="50" cy="30" r="3" fill="white" className="animate-ping" />
      </svg>
    </div>
  );
}

// Loading แบบ Fullscreen
export function BeautyFullscreenLoading({ message = 'กำลังเตรียมความงาม...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <RoseLoading size="lg" className="mx-auto" />
        </div>
        <p className="beauty-subtitle text-lg animate-pulse">{message}</p>
        <div className="mt-4 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-rose-400 rounded-full animate-bounce-beauty"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading แบบ Card
export function BeautyCardLoading({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="flex items-center gap-4">
        <RoseLoading size="sm" />
        <div className="flex-1">
          <div className="h-4 bg-rose-100 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-rose-50 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Loading แบบ Button
export function BeautyButtonLoading({ children }: { children: React.ReactNode }) {
  return (
    <button disabled className="btn-beauty opacity-70 cursor-not-allowed flex items-center gap-2">
      <GemLoading size="sm" />
      {children}
    </button>
  );
}
