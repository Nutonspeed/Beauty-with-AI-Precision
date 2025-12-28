/**
 * Advanced Beauty AI Loading Components
 * Loading animations ขั้นสูงพร้อมเอฟเฟกต์พิเศษ
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { GemLoading, RoseLoading } from './beauty-loading';

// DNA Beauty Loading - แสดงการวิเคราะห์ DNA ความงาม
export function DNABeautyLoading({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-20 h-20', className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        
        {/* DNA Helix */}
        {[0, 20, 40, 60, 80].map((y, i) => (
          <g key={i}>
            <circle
              cx="30"
              cy={y}
              r="4"
              fill="url(#dnaGradient)"
              className="animate-pulse-beauty"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            <circle
              cx="70"
              cy={y}
              r="4"
              fill="url(#dnaGradient)"
              className="animate-pulse-beauty"
              style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
            />
            <path
              d={`M30 ${y} Q50 ${y + 10} 70 ${y}`}
              stroke="url(#dnaGradient)"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d={`M70 ${y} Q50 ${y + 10} 30 ${y + 20}`}
              stroke="url(#dnaGradient)"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Skin Analysis Loading - แสดงการสแกนผิว
export function SkinAnalysisLoading({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-24 h-24', className)}>
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* ใบหน้า */}
        <ellipse
          cx="60"
          cy="60"
          rx="40"
          ry="50"
          fill="none"
          stroke="#E11D48"
          strokeWidth="2"
          className="animate-pulse-beauty"
        />
        
        {/* Scan Lines */}
        {[20, 35, 50, 65, 80, 95].map((y, i) => (
          <line
            key={i}
            x1="20"
            y1={y}
            x2="100"
            y2={y}
            stroke="#8B5CF6"
            strokeWidth="1"
            opacity="0.3 + (i * 0.1)"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        
        {/* Analysis Points */}
        {[{ x: 40, y: 40 }, { x: 80, y: 40 }, { x: 60, y: 60 }, { x: 45, y: 80 }, { x: 75, y: 80 }].map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3B82F6"
              className="animate-ping"
              style={{ animationDuration: '2s', animationDelay: `${i * 0.3}s` }}
            />
            <circle cx={point.x} cy={point.y} r="2" fill="#3B82F6" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// AI Brain Loading - แสดง AI กำลังประมวลผล
export function AIBrainLoading({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-20 h-20', className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* สมอง */}
        <path
          d="M50 20 C30 20, 20 35, 20 50 C20 65, 30 80, 50 80 C70 80, 80 65, 80 50 C80 35, 70 20, 50 20Z"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          className="animate-pulse-beauty"
        />
        
        {/* Neural Network */}
        {[
          { from: { x: 35, y: 35 }, to: { x: 50, y: 40 } },
          { from: { x: 50, y: 40 }, to: { x: 65, y: 35 } },
          { from: { x: 50, y: 40 }, to: { x: 50, y: 55 } },
          { from: { x: 50, y: 55 }, to: { x: 40, y: 65 } },
          { from: { x: 50, y: 55 }, to: { x: 60, y: 65 } },
        ].map((conn, i) => (
          <line
            key={i}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#E11D48"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        
        {/* Nodes */}
        {[{ x: 35, y: 35 }, { x: 65, y: 35 }, { x: 50, y: 40 }, { x: 50, y: 55 }, { x: 40, y: 65 }, { x: 60, y: 65 }].map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="3"
            fill="#3B82F6"
            className="animate-pulse-beauty"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

// Progress Loading แบบ Beauty
export function BeautyProgressLoading({ 
  progress = 0, 
  message = 'กำลังวิเคราะห์...' 
}: { 
  progress?: number; 
  message?: string; 
}) {
  return (
    <div className="w-full max-w-md mx-auto p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <span className="beauty-subtitle font-medium">{message}</span>
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-rose-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full shine-effect"></div>
        </div>
      </div>
      
      {/* Loading Icon */}
      <div className="mt-4 flex justify-center">
        <GemLoading size="sm" />
      </div>
    </div>
  );
}

// Staggered Loading - แสดงหลายอย่างพร้อมกัน
export function StaggeredBeautyLoading({ items = ['Analyzing skin', 'Checking database', 'Generating recommendations'] }: { items?: string[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    
    return () => clearInterval(timer);
  }, [items.length]);
  
  return (
    <div className="flex flex-col items-center gap-4">
      <RoseLoading size="md" />
      <div className="text-center">
        {items.map((item, i) => (
          <p
            key={i}
            className={cn(
              'beauty-subtitle transition-all duration-500',
              i === currentIndex ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 absolute'
            )}
          >
            {item}...
          </p>
        ))}
      </div>
    </div>
  );
}
