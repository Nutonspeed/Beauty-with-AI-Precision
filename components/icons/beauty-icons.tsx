/**
 * Custom Beauty AI Icons
 * ไอคอนเฉพาะสำหรับ Beauty with AI Precision
 */

import React from 'react'

// ดอกกุหลาบ - หลัก
export const RoseIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2C12 2 8 6 8 10C8 13.314 9.686 15 12 15C14.314 15 16 13.314 16 10C16 6 12 2 12 2Z" 
      fill="currentColor"
      opacity="0.9"
    />
    <path 
      d="M12 15V22M8 18H16" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <circle cx="12" cy="10" r="2" fill="white" opacity="0.5" />
  </svg>
)

// ดาว AI - เทคโนโลยี
export const AIStarIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2L14.09 8.26L20.18 8.27L15.54 12.14L17.64 18.4L12 14.54L6.36 18.4L8.46 12.14L3.82 8.27L9.91 8.26L12 2Z" 
      fill="url(#aiGradient)"
    />
    <circle cx="12" cy="10" r="2" fill="white" opacity="0.8" />
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
)

// พลอยความงาม
export const BeautyGemIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" 
      fill="url(#gemGradient)"
    />
    <path 
      d="M12 8L13 11L16 12L13 13L12 16L11 13L8 12L11 11L12 8Z" 
      fill="white" 
      opacity="0.6"
    />
    <defs>
      <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
  </svg>
)

// Logo หลัก
export const BeautyAILogo = ({ className, size = 40 }: { className?: string; size?: number }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative">
      <RoseIcon size={size} className="text-rose-500" />
      <div className="absolute -top-1 -right-1">
        <AIStarIcon size={size * 0.4} className="text-purple-500" />
      </div>
    </div>
    <span className="font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
      Beauty AI
    </span>
  </div>
)
