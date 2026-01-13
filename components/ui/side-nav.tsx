"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SideNavProps {
  sections: { id: string; label: string }[]
  containerRef: React.RefObject<HTMLElement | null>
}

export function SideNav({ sections, containerRef }: SideNavProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHovered, setIsHovered] = useState<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      
      const index = Math.round(scrollTop / clientHeight)
      if (index !== activeSection) {
        setActiveSection(index)
      }

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollProgress(progress)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [activeSection, containerRef])

  const scrollToSection = (index: number) => {
    const container = containerRef.current
    if (!container) return
    
    container.scrollTo({
      top: index * container.clientHeight,
      behavior: "smooth"
    })
  }

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-8 py-10 px-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hidden lg:flex shadow-2xl">
      {/* Vertical Progress Track */}
      <div className="absolute top-10 bottom-10 w-[1px] bg-slate-200/30 -z-10">
        <motion.div 
          className="absolute top-0 w-full bg-blue-600"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {sections.map((section, i) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(i)}
          onMouseEnter={() => setIsHovered(i)}
          onMouseLeave={() => setIsHovered(null)}
          className="group relative flex items-center justify-center w-4 h-4"
          aria-label={`Scroll to ${section.label}`}
        >
          <AnimatePresence>
            {(isHovered === i || activeSection === i) && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "absolute right-8 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-xl border border-white/10",
                  activeSection === i ? "text-blue-400" : "text-slate-300"
                )}
              >
                {section.label}
              </motion.span>
            )}
          </AnimatePresence>

          <div className="relative flex items-center justify-center">
            {activeSection === i && (
              <motion.div
                layoutId="activeDot"
                className="absolute inset-[-8px] border border-blue-500/50 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <motion.div 
              animate={{
                scale: activeSection === i ? 1.2 : 1,
                backgroundColor: activeSection === i ? "#2563eb" : "transparent"
              }}
              className={cn(
                "h-2 w-2 rounded-full border border-blue-600/50 transition-colors duration-300",
                activeSection === i ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "group-hover:border-blue-400"
              )} 
            />
          </div>
        </button>
      ))}
    </div>
  )
}
