/**
 * Modern Beauty Icons 2025
 * ไอคอนสมัยใหม่ ดูน่าเชื่อถือ ด้วยเทคนิคปี 2025
 */

import React from 'react';

// 1. Glass Morphism AI Brain
export const GlassAIBrainIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Glass Effect Gradient */}
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
      </linearGradient>
      
      {/* AI Gradient */}
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      
      {/* Shadow Filter */}
      <filter id="glassShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="0" dy="4" result="offsetblur"/>
        <feFlood floodColor="#000000" floodOpacity="0.1"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Glass Background */}
    <ellipse 
      cx="50" 
      cy="45" 
      rx="35" 
      ry="30" 
      fill="url(#glassGradient)" 
      stroke="rgba(255,255,255,0.2)" 
      strokeWidth="1"
      filter="url(#glassShadow)"
    />
    
    {/* Brain Shape */}
    <path 
      d="M50 25 C35 25, 25 35, 25 45 C25 55, 35 65, 50 65 C65 65, 75 55, 75 45 C75 35, 65 25, 50 25Z" 
      fill="none" 
      stroke="url(#aiGradient)" 
      strokeWidth="2"
    />
    
    {/* Neural Network */}
    {[
      { from: { x: 38, y: 38 }, to: { x: 50, y: 42 } },
      { from: { x: 50, y: 42 }, to: { x: 62, y: 38 } },
      { from: { x: 50, y: 42 }, to: { x: 50, y: 52 } },
      { from: { x: 50, y: 52 }, to: { x: 42, y: 58 } },
      { from: { x: 50, y: 52 }, to: { x: 58, y: 58 } },
    ].map((conn, i) => (
      <line
        key={i}
        x1={conn.from.x}
        y1={conn.from.y}
        x2={conn.to.x}
        y2={conn.to.y}
        stroke="url(#aiGradient)"
        strokeWidth="1.5"
        opacity="0.6"
        className="animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
    
    {/* Nodes */}
    {[{ x: 38, y: 38 }, { x: 62, y: 38 }, { x: 50, y: 42 }, { x: 50, y: 52 }, { x: 42, y: 58 }, { x: 58, y: 58 }].map((node, i) => (
      <circle
        key={i}
        cx={node.x}
        cy={node.y}
        r="3"
        fill="url(#aiGradient)"
        className="animate-pulse"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </svg>
);

// 2. 3D Beauty Droplet
export const Beauty3DDropletIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* 3D Gradient */}
      <radialGradient id="droplet3D" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </radialGradient>
      
      {/* Highlight */}
      <radialGradient id="dropletHighlight" cx="35%" cy="25%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
      
      {/* Shadow */}
      <filter id="dropletShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="2" dy="4" result="offsetblur"/>
        <feFlood floodColor="#000000" floodOpacity="0.2"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Main Droplet */}
    <path 
      d="M50 15 C50 15, 25 40, 25 55 C25 70, 37.5 80, 50 80 C62.5 80, 75 70, 75 55 C75 40, 50 15, 50 15Z" 
      fill="url(#droplet3D)" 
      filter="url(#dropletShadow)"
    />
    
    {/* 3D Highlight */}
    <ellipse 
      cx="42" 
      cy="35" 
      rx="12" 
      ry="15" 
      fill="url(#dropletHighlight)" 
      opacity="0.6"
    />
    
    {/* Inner Reflection */}
    <ellipse 
      cx="45" 
      cy="40" 
      rx="6" 
      ry="8" 
      fill="rgba(255,255,255,0.4)"
    />
  </svg>
);

// 3. Neumorphic Rose
export const NeuroRoseIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Neumorphic Light */}
      <linearGradient id="neuroLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FECACA" />
        <stop offset="50%" stopColor="#FCA5A5" />
        <stop offset="100%" stopColor="#F87171" />
      </linearGradient>
      
      {/* Neumorphic Shadow */}
      <linearGradient id="neuroShadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E11D48" />
        <stop offset="50%" stopColor="#BE123C" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>
      
      {/* Soft Shadow Filter */}
      <filter id="softShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feFlood floodColor="#000000" floodOpacity="0.1"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Rose Petals with Neumorphic Effect */}
    {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
      <g key={i} transform={`rotate(${rotation} 50 50)`}>
        <ellipse
          cx="50"
          cy="30"
          rx="15"
          ry="20"
          fill={i % 2 === 0 ? "url(#neuroLight)" : "url(#neuroShadow)"}
          opacity="0.9"
          filter="url(#softShadow)"
          className="hover:opacity-100 transition-opacity"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      </g>
    ))}
    
    {/* Center */}
    <circle 
      cx="50" 
      cy="50" 
      r="8" 
      fill="url(#neuroShadow)" 
      filter="url(#softShadow)"
    />
    
    {/* Inner Highlight */}
    <circle 
      cx="48" 
      cy="48" 
      r="3" 
      fill="rgba(255,255,255,0.6)"
    />
  </svg>
);

// 4. Holographic Crystal
export const HoloCrystalIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Holographic Gradient */}
      <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B">
          <animate attributeName="stop-color" values="#F59E0B;#E11D48;#8B5CF6;#3B82F6;#F59E0B" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#E11D48">
          <animate attributeName="stop-color" values="#E11D48;#8B5CF6;#3B82F6;#F59E0B;#E11D48" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#8B5CF6">
          <animate attributeName="stop-color" values="#8B5CF6;#3B82F6;#F59E0B;#E11D48;#8B5CF6" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      {/* Holographic Shine */}
      <linearGradient id="holoShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      
      {/* Glow Effect */}
      <filter id="holoGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Crystal Shape */}
    <path 
      d="M50 10 L70 35 L70 65 L50 90 L30 65 L30 35 Z" 
      fill="url(#holoGradient)" 
      filter="url(#holoGlow)"
      className="animate-pulse-beauty"
    />
    
    {/* Inner Crystal */}
    <path 
      d="M50 25 L60 40 L60 60 L50 75 L40 60 L40 40 Z" 
      fill="url(#holoShine)" 
      opacity="0.6"
    />
    
    {/* Reflection Lines */}
    {[10, 30, 50, 70, 90].map((y, i) => (
      <line
        key={i}
        x1="35"
        y1={y}
        x2="65"
        y2={y}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
        className="animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </svg>
);

// 5. Floating Particle System
export const FloatingParticlesIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Particle Gradient */}
      <radialGradient id="particleGradient">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      
      {/* Glow Gradient */}
      <radialGradient id="particleGlow">
        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Background Glow */}
    <circle 
      cx="50" 
      cy="50" 
      r="40" 
      fill="url(#particleGlow)" 
      className="animate-pulse-beauty"
    />
    
    {/* Floating Particles */}
    {[
      { x: 30, y: 30, size: 8, delay: 0 },
      { x: 70, y: 25, size: 6, delay: 0.5 },
      { x: 50, y: 45, size: 10, delay: 1 },
      { x: 35, y: 65, size: 7, delay: 1.5 },
      { x: 65, y: 70, size: 5, delay: 2 },
      { x: 45, y: 20, size: 4, delay: 2.5 },
      { x: 55, y: 75, size: 6, delay: 3 },
    ].map((particle, i) => (
      <g key={i}>
        <circle
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          fill="url(#particleGradient)"
          className="animate-bounce-beauty"
          style={{ 
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s'
          }}
        />
        <circle
          cx={particle.x - 1}
          cy={particle.y - 1}
          r={particle.size * 0.3}
          fill="rgba(255,255,255,0.8)"
          className="animate-pulse"
          style={{ animationDelay: `${particle.delay}s` }}
        />
      </g>
    ))}
    
    {/* Connection Lines */}
    <path
      d="M30 30 Q50 40 70 25"
      stroke="rgba(139, 92, 246, 0.3)"
      strokeWidth="1"
      fill="none"
      className="animate-pulse"
    />
    <path
      d="M35 65 Q50 55 65 70"
      stroke="rgba(245, 158, 11, 0.3)"
      strokeWidth="1"
      fill="none"
      className="animate-pulse"
      style={{ animationDelay: '1s' }}
    />
  </svg>
);

// 6. Modern Analytics Chart
export const ModernAnalyticsIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Chart Gradient */}
      <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
      </linearGradient>
      
      {/* Glow Effect */}
      <filter id="chartGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Chart Bars */}
    {[20, 35, 50, 65, 80, 45, 70].map((height, i) => (
      <rect
        key={i}
        x={10 + i * 12}
        y={80 - height}
        width="8"
        height={height}
        fill="url(#chartGradient)"
        rx="4"
        filter="url(#chartGlow)"
        className="animate-pulse-beauty"
        style={{ 
          animationDelay: `${i * 0.1}s`,
          transformOrigin: 'bottom'
        }}
      />
    ))}
    
    {/* Trend Line */}
    <path
      d="M15 70 L30 55 L45 60 L60 40 L75 45 L90 30"
      stroke="#F59E0B"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      className="animate-pulse"
    />
    
    {/* Data Points */}
    {[{ x: 15, y: 70 }, { x: 30, y: 55 }, { x: 45, y: 60 }, { x: 60, y: 40 }, { x: 75, y: 45 }, { x: 90, y: 30 }].map((point, i) => (
      <circle
        key={i}
        cx={point.x}
        cy={point.y}
        r="3"
        fill="#F59E0B"
        className="animate-ping"
        style={{ animationDuration: '2s', animationDelay: `${i * 0.3}s` }}
      />
    ))}
  </svg>
);
