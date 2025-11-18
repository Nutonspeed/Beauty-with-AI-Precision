"use client"

export function GradientMesh() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        {/* Top left orb */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-glow-pulse bg-orb-blue" />
        
        {/* Top right orb */}
        <div className="absolute -top-20 -right-32 w-80 h-80 rounded-full blur-3xl animate-glow-pulse animate-delay-1000 bg-orb-purple" />
        
        {/* Center floating orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-glow-pulse animate-delay-2000 bg-orb-pink" />
        
        {/* Bottom left orb */}
        <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full blur-3xl animate-glow-pulse animate-delay-3000 bg-orb-violet" />
        
        {/* Bottom right orb */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-glow-pulse animate-delay-4000 bg-orb-cyan" />
      </div>
      
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] grain-texture" />
    </div>
  )
}
