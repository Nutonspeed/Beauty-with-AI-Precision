'use client';

import { useEffect, useState } from 'react';
import { getCacheStats, formatBytes, isOnline, onConnectionChange } from '@/lib/utils/service-worker-utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Activity, 
  HardDrive, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Layers,
  ArrowUpRight,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CacheStats {
  static: number;
  dynamic: number;
  images: number;
  total: number;
}

export function PerformanceMonitoringDashboard() {
  const t = useTranslations();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check online status
    setOnline(isOnline());
    
    // Listen for connection changes
    const cleanup = onConnectionChange((status) => {
      setOnline(status);
    });

    // Load cache stats
    loadCacheStats();

    return cleanup;
  }, []);

  const loadCacheStats = async () => {
    setLoading(true);
    const stats = await getCacheStats();
    setCacheStats(stats);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-[2rem] shadow-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic mb-4">{t('performanceMonitoring.title')}</h3>
        <p className="text-slate-500 text-xs italic">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Performance Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight italic flex items-center justify-center md:justify-start gap-4">
            <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
            {t('performanceMonitoring.title')}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
            {t('performanceMonitoring.subtitle')}
          </p>
        </div>
        <Badge className={cn("px-6 py-2 rounded-full border-none shadow-inner text-[10px] font-black uppercase tracking-widest italic", online ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
          {online ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
          {t('performanceMonitoring.networkStatus')}: {online ? t('performanceMonitoring.onlineLink') : t('performanceMonitoring.offlineState')}
        </Badge>
      </div>

      {/* Cache Metrics Grid - Infrastructure Nodes */}
      {cacheStats ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('performanceMonitoring.staticAssets'), val: formatBytes(cacheStats.static), sub: t('performanceMonitoring.immutableNodes'), icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('performanceMonitoring.dynamicCycles'), val: formatBytes(cacheStats.dynamic), sub: t('performanceMonitoring.temporalCache'), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: t('performanceMonitoring.imagingMatrix'), val: formatBytes(cacheStats.images), sub: t('performanceMonitoring.dermalBuffer'), icon: HardDrive, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: t('performanceMonitoring.cumulativeLoad'), val: formatBytes(cacheStats.total), sub: t('performanceMonitoring.sectorDensity'), icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
            ].map((node, i) => (
              <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{node.label}</CardTitle>
                  <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                    <node.icon className={cn("h-4 w-4", node.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-white tracking-tighter italic">{node.val}</div>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{node.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sync Control */}
          <div className="flex justify-center">
            <Button variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={loadCacheStats} disabled={loading}>
              <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
              {t('performanceMonitoring.initCacheSync')}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-20 text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
          <Monitor className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-slate-500 italic uppercase tracking-widest">{t('performanceMonitoring.swInactive')}</h3>
          <p className="text-sm text-slate-600 font-light mt-2 italic">{t('performanceMonitoring.swDisabledDesc')}</p>
        </Card>
      )}

      {/* Optimization Registry */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            {t('performanceMonitoring.optimizationProtocols')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('performanceMonitoring.efficiencyVectors')}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: t('performanceMonitoring.autoIngestion'), desc: t('performanceMonitoring.autoIngestionDesc') },
              { label: t('performanceMonitoring.neuralCaching'), desc: t('performanceMonitoring.neuralCachingDesc') },
              { label: t('performanceMonitoring.offlineCapability'), desc: t('performanceMonitoring.offlineCapabilityDesc') },
              { label: t('performanceMonitoring.bgSyncProtocol'), desc: t('performanceMonitoring.bgSyncProtocolDesc') },
            ].map((tip, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 group/tip hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-inner group-hover/tip:scale-110 transition-transform">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-white italic uppercase tracking-tight group-hover/tip:text-pink-400 transition-colors">{tip.label}</p>
                  <p className="text-[10px] text-slate-500 font-light leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
