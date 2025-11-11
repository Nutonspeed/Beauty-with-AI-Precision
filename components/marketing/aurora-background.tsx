"use client";

import React from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

// Reusable animated aurora container with subtle grid overlay for brand precision feel.
export function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
  return (
    <section
      className={
        "relative isolate overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 " +
        className
      }
    >
      {/* moving glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-[380px] rounded-full bg-primary/25 blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[420px] rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-3xl animate-aurora-rev" />
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          color: "rgb(100 116 139)", // slate-500
          backgroundSize: "42px 42px",
        }}
      />
      <div className="relative">
        {children}
      </div>
    </section>
  );
}

export default AuroraBackground;
