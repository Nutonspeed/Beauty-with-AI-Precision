"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors } from "@/lib/design/tokens";

interface MetricDef {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  precision?: number;
}

const metricDefs: MetricDef[] = [
  { key: "analysisConfidence", label: "Analysis Confidence", unit: "%", min: 86, max: 99.4, precision: 1 },
  { key: "scanClarity", label: "Scan Clarity", unit: "%", min: 72, max: 95.2, precision: 1 },
  { key: "treatmentFit", label: "Treatment Fit", unit: "%", min: 64, max: 90.8, precision: 1 }
];

export function AiMetricsPanel() {
  const [metrics, setMetrics] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    metricDefs.forEach(m => (init[m.key] = m.min));
    return init;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => {
        const next: Record<string, number> = { ...prev };
        metricDefs.forEach(m => {
          // gentle wandering within range
            const drift = (Math.random() - 0.5) * (m.max - m.min) * 0.015;
            let v = next[m.key] + drift;
            if (v < m.min) v = m.min + Math.random() * (m.max - m.min) * 0.1;
            if (v > m.max) v = m.max - Math.random() * (m.max - m.min) * 0.1;
            next[m.key] = v;
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none select-none"
    >
      <div className="aimetrics-panel">
        <div className="aimetrics-header">
          AI LIVE METRICS
        </div>
        <div className="space-y-3">
          {metricDefs.map(m => {
            const value = metrics[m.key];
            const pct = ((value - m.min) / (m.max - m.min)) * 100;
            return (
              <div key={m.key} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium aimetrics-label-row">
                  <span>{m.label}</span>
                  <span className="aimetrics-value">
                    {value.toFixed(m.precision || 0)}{m.unit}
                  </span>
                </div>
                <div className="aimetrics-bar-track">
                  <motion.div
                    className="h-full"
                    style={{ background: colors.accentPink, borderRadius: 999 }}
                    animate={{ width: pct + "%" }}
                    transition={{ type: "spring", stiffness: 120, damping: 24 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
