"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RadialMetricProps {
  label: string;
  value: number; // target value (e.g. 98)
  suffix?: string; // %, x, etc.
  colorClass?: string; // stroke color class like 'stroke-emerald-500'
  durationMs?: number;
  max?: number; // default 100 for percentage style
  size?: number;
  stroke?: number;
  className?: string;
}

/**
 * Animated radial metric with live count.
 * Uses requestAnimationFrame for smooth easing and accessible text output.
 */
export function RadialMetric({
  label,
  value,
  suffix = "%",
  colorClass = "stroke-emerald-500",
  durationMs = 900,
  max = 100,
  size = 96,
  stroke = 8,
  className = "",
}: RadialMetricProps) {
  const [display, setDisplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (t: number) => {
      const p = Math.min((t - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(value * eased));
      setProgress(eased);
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, durationMs]);

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(value, max);
  const dash = circumference * progress * (clamped / max);

  return (
    <div className={"rounded-2xl border bg-background p-4 flex items-center gap-4 " + className}>
      <svg width={size} height={size} className="shrink-0" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted fill-none" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={`${colorClass} fill-none transition-[stroke-dasharray] duration-150`}
          strokeWidth={stroke}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-current">
          <tspan className="text-xl font-semibold">{display}</tspan>
          {suffix && <tspan className="text-sm text-muted-foreground">{suffix}</tspan>}
        </text>
      </svg>
      <div>
        <p className="text-sm text-muted-foreground">Metric</p>
        <p className="text-base font-medium" aria-label={`${label} ${display}${suffix}`}>{label}</p>
      </div>
    </div>
  );
}

export default RadialMetric;
