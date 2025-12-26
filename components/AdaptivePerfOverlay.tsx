"use client";
import React, { useEffect, useRef, useState } from 'react';

interface AdaptivePerfOverlayProps { onLowPerf?:()=>void; onRecover?:()=>void; }
export function AdaptivePerfOverlay({ onLowPerf, onRecover }: AdaptivePerfOverlayProps) {
  const [fps,setFps] = useState(0);
  const [avgFrame,setAvgFrame] = useState(0);
  const [mem,setMem] = useState<{used:number; total:number}|null>(null);
  const [low,setLow] = useState(false);
  const frameCount = useRef(0); const lastTime = useRef(performance.now());
  useEffect(()=>{
    let mounted=true;
    const frameTimes: number[] = [];
    function loop(){
      if(!mounted) return;
      const start=performance.now();
      frameCount.current++;
      const now = performance.now();
      frameTimes.push(now-start);
      if(now - lastTime.current >= 1000){
        const currentFps = frameCount.current;
        frameCount.current=0; lastTime.current=now; setFps(currentFps);
        const avg = frameTimes.reduce((a,b)=>a+b,0) / frameTimes.length;
        setAvgFrame(parseFloat(avg.toFixed(1)));
        frameTimes.length=0;
        // Memory (Chrome only)
        const perfMem:any = (performance as any).memory;
        if(perfMem){ setMem({ used: perfMem.usedJSHeapSize, total: perfMem.jsHeapSizeLimit }); }
        if(currentFps < 50 && !low){ setLow(true); onLowPerf?.(); }
        else if(currentFps >= 55 && low){ setLow(false); onRecover?.(); }
      }
      requestAnimationFrame(loop);
    }
    const id=requestAnimationFrame(loop);
    return ()=>{ mounted=false; cancelAnimationFrame(id); };
  },[low,onLowPerf,onRecover]);
  return (
    <div className="perf-overlay">
      <div><span className="label">FPS</span> {fps}</div>
      <div><span className="label">Frame</span> {avgFrame}ms</div>
      {mem && <div><span className="label">Memory</span> { (mem.used/1e6).toFixed(1) } / { (mem.total/1e6).toFixed(0) } MB</div>}
      <div className={low?"status low":"status ok"}>{low?"Low Performance" : "Stable"}</div>
    </div>
  );
}
