"use client"

import React from "react"
import { motion } from "framer-motion"

export function MedicalPulse({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      className={className}
    >
      <motion.path
        d="M 0 10 L 10 10 L 15 2 L 20 18 L 25 10 L 100 10"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="0.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1],
          opacity: [0, 1, 0],
          x: ["0%", "0%", "100%"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </svg>
  )
}
