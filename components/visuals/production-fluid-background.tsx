"use client"

import React from "react"

type FluidBackgroundProps = {
  className?: string
  /** Background gradient colors */
  gradient?: [string, string]
  /** Effect color intensity (0–1) */
  intensity?: number
}

/**
 * ProductionFluidBackground: Production version without animation
 * - Fast and lightweight for build performance
 * - Still maintains visual appeal with gradient
 * - No canvas or animation loop
 */
export default function ProductionFluidBackground({
  className,
  gradient,
  intensity = 0.6,
}: FluidBackgroundProps) {
  const g0 = gradient?.[0] ?? `hsla(210, 80%, 55%, ${0.05 * intensity})`
  const g1 = gradient?.[1] ?? `hsla(195, 70%, 60%, ${0.05 * intensity})`

  return (
    <div 
      className={className}
      style={{
        background: `linear-gradient(135deg, ${g0}, ${g1})`,
      }}
    />
  )
}
