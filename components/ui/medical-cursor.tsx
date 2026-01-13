"use client"

import React, { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function MedicalCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 250 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  const [isVisible, setIsVisible] = useState(false)
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === "pointer")
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", moveCursor)
    document.body.addEventListener("mouseenter", handleMouseEnter)
    document.body.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      document.body.removeEventListener("mouseenter", handleMouseEnter)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference hidden lg:block"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{
          scale: isPointer ? 1.5 : 1,
          rotate: isPointer ? 45 : 0,
        }}
        className="w-full h-full border border-blue-500 rounded-sm relative flex items-center justify-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-blue-500" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-blue-500" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-blue-500" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-blue-500" />
        
        <motion.div 
          animate={{ opacity: isPointer ? 1 : 0 }}
          className="w-1 h-1 bg-blue-500 rounded-full" 
        />
      </motion.div>
      
      {isPointer && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -right-16 top-0 text-[8px] font-bold text-blue-500 tracking-[0.2em] uppercase"
        >
          Select
        </motion.span>
      )}
    </motion.div>
  )
}
