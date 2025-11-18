"use client"

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Large floating orb - top left */}
      <div className="absolute -top-48 -left-32 w-96 h-96 rounded-full opacity-40 dark:opacity-30 animate-float-slow blur-3xl orb-gradient-blue" />
      
      {/* Medium orb - top right */}
      <div className="absolute -top-24 right-0 w-80 h-80 rounded-full opacity-35 dark:opacity-25 animate-float-medium blur-3xl orb-gradient-purple animate-delay-2000" />
      
      {/* Large orb - center */}
      <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] rounded-full opacity-30 dark:opacity-20 animate-float-slow blur-3xl orb-gradient-pink animate-delay-4000" />
      
      {/* Medium orb - bottom left */}
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-40 dark:opacity-25 animate-float-fast blur-3xl orb-gradient-purple animate-delay-1000" />
      
      {/* Large orb - bottom right */}
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full opacity-35 dark:opacity-25 animate-float-medium blur-3xl orb-gradient-cyan animate-delay-3000" />
      
      {/* Small accent orb - top center */}
      <div className="absolute top-12 left-1/2 w-64 h-64 rounded-full opacity-25 dark:opacity-20 animate-float-fast blur-2xl orb-gradient-purple animate-delay-4000" />
      
      {/* Glassmorphism overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 dark:from-black/5 dark:via-transparent dark:to-black/5" />
    </div>
  )
}
