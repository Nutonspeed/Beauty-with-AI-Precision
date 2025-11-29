"use client"

type FluidBackgroundProps = {
  className?: string
  gradient?: [string, string]
  intensity?: number
}

/**
 * Simple gradient background component
 * For animated version, use FluidBackgroundOptimized
 */
export default function FluidBackground({
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