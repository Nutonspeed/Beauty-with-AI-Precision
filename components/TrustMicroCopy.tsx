"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Metric { key:'clarity'|'hydration'|'risk'; value:number; unit?:string; }
const initialMetrics: Metric[] = [
  { key:'clarity', value:92, unit:'%' },
  { key:'hydration', value:63, unit:'%' },
  { key:'risk', value:1.8, unit:'%' }
];

export function TrustMicroCopy() {
  const t = useTranslations();
  const [metrics,setMetrics] = useState(initialMetrics);
  useEffect(()=>{
    const id = setInterval(()=>{
      setMetrics(m=> m.map(x => ({ ...x, value: fluctuate(x.value, x.key==='risk'?0.2:1.5, x.key==='risk'?0:100) })));
    }, 3800);
    return ()=> clearInterval(id);
  },[]);
  function fluctuate(val:number, range:number, clampMax:number){
    const delta = (Math.random()-0.5)*range;
    let next = val + delta;
    if(clampMax>0){ next = Math.max(0, Math.min(clampMax, next)); }
    return parseFloat(next.toFixed( clampMax===0?1:0 ));
  }
  return (
    <div className="trust-micro-wrapper">
      <div className="micro-ribbon">
        {metrics.map(m => (
          <div key={m.key} className="metric-item">
            <span className="metric-label">{t(`trust.metrics.${m.key}`)}</span>
            <span className="metric-value">{m.value}{m.unit}</span>
          </div>
        ))}
      </div>
      <motion.div
        initial={{ opacity:0, y:10 }}
        animate={{ opacity:0.95, y:0 }}
        className="micro-copy-block"
      >
        {t.raw('trust.microLines').map((line:string, idx:number)=> (
          <p key={idx} className="micro-line">{line}</p>
        ))}
      </motion.div>
    </div>
  );
}
