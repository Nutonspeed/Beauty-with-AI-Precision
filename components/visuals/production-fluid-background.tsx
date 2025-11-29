"use client"

import React from "react"

type FluidBackgroundProps = {
  className?: string
  /** สี gradient พื้นหลัง */
  gradient?: [string, string]
  /** ความเข้มของสีเอฟเฟกต์ (0–1) */
  intensity?: number
}

/**
 * ProductionFluidBackground: เวอร์ชัน production ที่ไม่มี animation
 * - เร็วและเบาสำหรับ build performance
 * - ยังคงมี visual appeal ด้วย gradient
 * - ไม่มี canvas หรือ animation loop
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
