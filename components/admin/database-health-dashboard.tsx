'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  Activity,
  HardDrive,
  Link as LinkIcon,
  AlertCircle,
  TrendingUp,
  Zap,
  Shield,
  Layers,
  Users,
  Building2,
  Brain,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthCheck {
  count: number;
  status: 'ok' | 'warning' | 'error';
}

interface HealthData {
  health_status: 'healthy' | 'needs_attention' | 'critical';
  database_size: string;
  timestamp: string;
  checks: {
    foreign_keys: HealthCheck;
    indexes: HealthCheck;
    orphaned_analyses: HealthCheck;
    orphaned_leads: HealthCheck;
    duplicate_invitations: HealthCheck;
    invalid_user_refs: HealthCheck;
  };
  table_counts: {
    users: number;
    centers: number;
    invitations: number;
    sales_leads: number;
    appointments: number;
    skin_analyses: number;
  };
}

interface HealthResponse {
  success: boolean;
  timestamp: string;
  health: HealthData;
  error?: string;
}

export default function DatabaseHealthDashboard() {
  const t = useTranslations();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health/database');
      const data: HealthResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch health data');
      }
      
      setHealth(data.health);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    const interval = setInterval(fetchHealth, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'warning':
      case 'needs_attention':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5 text-rose-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'bg-emerald-50 text-emerald-600 border-none shadow-sm';
      case 'warning':
      case 'needs_attention':
        return 'bg-amber-50 text-amber-600 border-none shadow-sm';
      case 'error':
      case 'critical':
        return 'bg-rose-50 text-rose-600 border-none shadow-sm';
      default:
        return 'bg-slate-50 text-slate-400 border-none shadow-sm';
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Health Node...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[3rem] p-10 text-center space-y-6 shadow-premium">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <XCircle className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Telemetry_Failure</CardTitle>
            <p className="text-sm text-slate-500 font-light italic leading-relaxed">{error}</p>
          </div>
          <Button variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm" onClick={fetchHealth}>
            <RefreshCw className="h-4 w-4 mr-3" />
            {t('databaseHealth.retry' as any) || 'Re-Initialize'}
          </Button>
        </Card>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Telemetry Actions interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
              <Database className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            {t('databaseHealth.title' as any) || 'Database_Integrity_Monitor'}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            {t('databaseHealth.temporalSync' as any) || 'Last Temporal Sync'}: <span className="text-slate-950">{lastUpdate?.toLocaleTimeString('th-TH') || '-'}</span>
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={cn("mr-3 h-4 w-4 text-pink-600", loading && "animate-spin")} />
            {t('databaseHealth.schemaSync' as any) || 'SYNC_SCHEMA'}
          </Button>
        </div>
      </div>

      {/* Global Status architecture interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className={cn("p-4 rounded-3xl border border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110 bg-white")}>
              {getStatusIcon(health.health_status)}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('databaseHealth.globalStatus' as any) || 'Infrastructure_Stability'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('databaseHealth.integrityVerify' as any) || 'Global relational and neural data verification'}</CardDescription>
            </div>
          </div>
          <Badge className={cn("px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl", getStatusStyles(health.health_status))}>
            {health.health_status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { label: t('databaseHealth.infrastructureSize' as any) || 'DB_Size', val: health.database_size, icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('databaseHealth.foreignKeyClusters' as any) || 'Relational_Nodes', val: health.checks.foreign_keys.count, icon: LinkIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: t('databaseHealth.optimizationIndices' as any) || 'Search_Indices', val: health.checks.indexes.count, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: t('databaseHealth.sectorStatus' as any) || 'Flux_State', val: 'NOMINAL', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' }
            ].map((stat, i) => (
              <div key={i} className="space-y-4 group/stat">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl border border-slate-50 shadow-inner group-hover/stat:scale-110 transition-transform duration-700", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover/stat:text-slate-950 transition-colors">{stat.label}</p>
                </div>
                <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/stat:text-pink-600 transition-colors">{stat.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check Nodes interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: 'Relational Integrity', key: 'foreign_keys', desc: 'Cross-node reference verification' },
          { label: 'Access Optimization', key: 'indexes', desc: 'Query velocity and index health' },
          { label: 'Neural Variance', key: 'orphaned_analyses', desc: 'Unlinked diagnostic output nodes' },
          { label: 'Entity Drift', key: 'orphaned_leads', desc: 'Unsynchronized sales vector identities' },
          { label: 'Protocol Collisions', key: 'duplicate_invitations', desc: 'Duplicate authorization sequence detection' },
          { label: 'Reference Faults', key: 'invalid_user_refs', desc: 'Corrupted identity node mapping' }
        ].map((check, i) => {
          const checkData = health.checks[check.key as keyof typeof health.checks] as HealthCheck;
          return (
            <motion.div
              key={check.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-start justify-between p-10 pb-6">
                  <div className="space-y-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors leading-none">{check.label}</CardTitle>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">{check.desc}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", getStatusStyles(checkData.status))}>
                    {getStatusIcon(checkData.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0 flex-1 flex flex-col justify-between">
                  <div className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{checkData.count}</div>
                  <div className="mt-8">
                    <Badge className={cn("px-5 py-1.5 rounded-full border-none shadow-sm text-[10px] font-black uppercase italic leading-none", getStatusStyles(checkData.status))}>
                      {checkData.status === 'ok' ? 'NOMINAL' : 'VARIANCE_DETECTED'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Population interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Layers className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            {t('databaseHealth.populationMap' as any) || 'Sector_Node_Population'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('databaseHealth.populationDesc' as any) || 'Global entity and biometric node density distribution'}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: 'Identities', val: health.table_counts.users, icon: Users, color: 'blue' },
              { label: 'Centers', val: health.table_counts.centers, icon: Building2, color: 'emerald' },
              { label: 'Access', val: health.table_counts.invitations, icon: Shield, color: 'amber' },
              { label: 'Leads', val: health.table_counts.sales_leads, icon: TrendingUp, color: 'cyan' },
              { label: 'Cycles', val: health.table_counts.appointments, icon: Activity, color: 'indigo' },
              { label: 'Inferences', val: health.table_counts.skin_analyses, icon: Brain, color: 'purple' },
            ].map((sector, i) => (
              <div key={i} className="flex flex-col items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-pink-500/20 transition-all duration-700 group/sector text-center shadow-inner">
                <div className={cn("p-4 rounded-2xl border border-slate-100 shadow-sm transition-transform duration-700 group-hover/sector:scale-110 group-hover/sector:bg-white group-hover/sector:border-pink-100", `bg-${sector.color}-50`)}>
                  <sector.icon className={cn("h-8 w-8", `text-${sector.color}-600`)} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{sector.val.toLocaleString()}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/sector:text-pink-600 transition-colors">{sector.label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation interface */}
      <AnimatePresence>
        {health.health_status !== 'healthy' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-amber-100 bg-amber-50/20 shadow-premium rounded-[3.5rem] relative overflow-hidden group transition-all duration-700 hover:border-amber-300">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <AlertTriangle className="w-48 h-48 text-amber-600" />
              </div>
              <CardHeader className="p-10 lg:p-12 pb-8 border-b border-amber-100/50 bg-amber-50/50">
                <CardTitle className="text-3xl font-black text-amber-600 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Zap className="h-8 w-8 text-amber-600 animate-pulse" />
                  </div>
                  {t('databaseHealth.mitigationProtocols' as any) || 'Recommended_Node_Optimization'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 bg-white/50 backdrop-blur-sm">
                <div className="grid gap-6">
                  {Object.entries(health.checks).filter(([_, v]) => v.status !== 'ok').map(([key, v], i) => (
                    <motion.div 
                      key={key} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white border border-amber-100 shadow-sm hover:border-amber-300 transition-all duration-500 group/mit"
                    >
                      <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 shadow-inner group-hover/mit:scale-110 transition-all">
                        <Info className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/mit:text-amber-600 transition-colors leading-none">{key.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-slate-500 font-medium italic">Protocol requires immediate synchronization for <span className="text-amber-600 font-black">{v.count} affected nodes</span>.</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto h-12 px-8 rounded-xl border-amber-200 bg-white text-amber-600 font-black uppercase tracking-widest italic hover:bg-amber-50 shadow-sm">Initialize_Fix</Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
