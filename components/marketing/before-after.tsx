"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

export type BeforeAfterProps = {
  beforeSrc?: string;
  afterSrc?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * Before/After scrubber with mouse/touch and keyboard support.
 * - If images are not provided, renders a graceful placeholder (no broken assets)
 */
export function BeforeAfter({ beforeSrc, afterSrc, alt = "before-after", className = "", width = 1200, height = 800 }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50); // %

  const onMove = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPos(Math.round((x / rect.width) * 100));
  };

  const onPointer = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onMove(e.clientX);
  };

  const hasImages = Boolean(beforeSrc && afterSrc);

  return (
    <div
      ref={containerRef}
      className={
        "relative overflow-hidden rounded-xl border bg-background select-none " + className
      }
      onPointerDown={onPointer}
      onPointerMove={(e) => e.buttons === 1 && onMove(e.clientX)}
      role="group"
      aria-label="before-after comparison"
    >
      {hasImages ? (
        <>
          <Image src={afterSrc!} alt={`${alt}-after`} width={width} height={height} className="pointer-events-none w-full h-auto object-cover" />
          <div className="absolute inset-y-0 left-0" style={{ width: `${pos}%` }}>
            <Image src={beforeSrc!} alt={`${alt}-before`} width={width} height={height} className="pointer-events-none w-full h-full object-cover" />
          </div>
        </>
      ) : (
        // Placeholder mode (no assets yet)
        <div className="w-full aspect-[3/2] bg-gradient-to-br from-muted/80 via-muted/50 to-muted/80" aria-hidden />
      )}

      {/* handle */}
      <div className="absolute inset-y-0" style={{ left: `calc(${pos}% - 1px)` }} aria-hidden>
        <div className="absolute inset-y-4 w-0.5 bg-white/70 dark:bg-white/40 shadow" />
        <div className="absolute top-1/2 -mt-4 -ml-4 h-8 w-8 rounded-full border bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
      </div>

      {/* keyboard accessible range */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="ปรับตำแหน่งเปรียบเทียบ"
        className="absolute inset-x-0 bottom-2 mx-auto w-1/2 opacity-0"
      />
    </div>
  );
}

export default BeforeAfter;
