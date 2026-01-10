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
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    clinics: number;
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
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchHealth, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'needs_attention':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('databaseHealth.checking')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-6 w-6" />
              {t('databaseHealth.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchHealth}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('databaseHealth.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight italic flex items-center justify-center md:justify-start gap-4">
            <Database className="w-8 h-8 text-cyan-500 animate-pulse" />
            {t('databaseHealth.title')}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
            {t('databaseHealth.temporalSync')}: {lastUpdate?.toLocaleTimeString('th-TH') || '-'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
            {t('databaseHealth.schemaSync')}
          </Button>
        </div>
      </div>

      {/* Overall Integrity Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={cn("p-4 rounded-3xl border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110", health.health_status === 'healthy' ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              {getStatusIcon(health.health_status)}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('databaseHealth.globalStatus')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{t('databaseHealth.integrityVerify')}</CardDescription>
            </div>
          </div>
          <Badge className={cn("px-6 py-2 rounded-full border-none shadow-inner text-[10px] font-black uppercase tracking-widest italic", health.health_status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
            {t(`ui.status.${health.health_status}`)}
          </Badge>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('databaseHealth.infrastructureSize'), val: health.database_size, icon: HardDrive, color: 'text-blue-400' },
              { label: t('databaseHealth.foreignKeyClusters'), val: health.checks.foreign_keys.count, icon: LinkIcon, color: 'text-purple-400' },
              { label: t('databaseHealth.optimizationIndices'), val: health.checks.indexes.count, icon: TrendingUp, color: 'text-cyan-400' },
              { label: t('databaseHealth.sectorStatus'), val: t('ui.status.activeLink'), icon: Activity, color: 'text-emerald-400' }
            ].map((stat, i) => (
              <div key={i} className="space-y-3 group/stat">
                <div className="flex items-center gap-3">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{stat.label}</p>
                </div>
                <div className="text-2xl font-black text-white italic tracking-tighter group-hover/stat:text-pink-400 transition-colors">{stat.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: t('databaseHealth.checks.relationalIntegrity.label'), key: 'foreign_keys', desc: t('databaseHealth.checks.relationalIntegrity.desc') },
          { label: t('databaseHealth.checks.accessOptimization.label'), key: 'indexes', desc: t('databaseHealth.checks.accessOptimization.desc') },
          { label: t('databaseHealth.checks.neuralVariance.label'), key: 'orphaned_analyses', desc: t('databaseHealth.checks.neuralVariance.desc') },
          { label: t('databaseHealth.checks.entityDrift.label'), key: 'orphaned_leads', desc: t('databaseHealth.checks.entityDrift.desc') },
          { label: t('databaseHealth.checks.protocolCollisions.label'), key: 'duplicate_invitations', desc: t('databaseHealth.checks.protocolCollisions.desc') },
          { label: t('databaseHealth.checks.referenceFaults.label'), key: 'invalid_user_refs', desc: t('databaseHealth.checks.referenceFaults.desc') }
        ].map((check, i) => (
          <motion.div
            key={check.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{check.label}</CardTitle>
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{check.desc}</p>
                </div>
                <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", (health.checks[check.key as keyof typeof health.checks] as HealthCheck).status === 'ok' ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
                  {getStatusIcon((health.checks[check.key as keyof typeof health.checks] as HealthCheck).status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-white italic tracking-tighter">{(health.checks[check.key as keyof typeof health.checks] as HealthCheck).count}</div>
                <Badge variant="outline" className={cn("mt-4 px-3 py-0 h-5 border-none rounded-full text-[8px] font-black uppercase italic tracking-tighter", (health.checks[check.key as keyof typeof health.checks] as HealthCheck).status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                  {(health.checks[check.key as keyof typeof health.checks] as HealthCheck).status === 'ok' ? t('databaseHealth.nominal') : t('databaseHealth.varianceDetected')}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sector Population Map */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Layers className="h-6 w-6 text-purple-400" />
            {t('databaseHealth.populationMap')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('databaseHealth.populationDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: t('databaseHealth.sectors.identityNodes'), val: health.table_counts.users, icon: Users, color: 'blue' },
              { label: t('databaseHealth.sectors.clinicalUplinks'), val: health.table_counts.clinics, icon: Building2, color: 'emerald' },
              { label: t('databaseHealth.sectors.accessVectors'), val: health.table_counts.invitations, icon: Shield, color: 'amber' },
              { label: t('databaseHealth.sectors.salesLeads'), val: health.table_counts.sales_leads, icon: TrendingUp, color: 'cyan' },
              { label: t('databaseHealth.sectors.processCycles'), val: health.table_counts.appointments, icon: Activity, color: 'indigo' },
              { label: t('databaseHealth.sectors.neuralOutputs'), val: health.table_counts.skin_analyses, icon: Brain, color: 'purple' },
            ].map((sector, i) => (
              <div key={i} className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 group/sector text-center">
                <div className={cn("p-3 rounded-2xl border border-white/5 shadow-inner transition-transform duration-700 group-hover/sector:scale-110", `bg-${sector.color}-500/10`)}>
                  <sector.icon className={cn("h-6 w-6", `text-${sector.color}-400`)} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white italic tracking-tighter">{sector.val.toLocaleString()}</div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">{sector.label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Recommendations */}
      {health.health_status !== 'healthy' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-amber-500/20 bg-amber-500/[0.02] backdrop-blur-3xl rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <AlertTriangle className="w-32 h-32 text-amber-500" />
            </div>
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4 text-amber-400">
                <Zap className="h-6 w-6 animate-pulse" />
                {t('databaseHealth.mitigationProtocols')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 lg:p-12">
              <ul className="space-y-6">
                {health.checks.orphaned_analyses.count > 0 && (
                  <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">{t('databaseHealth.mitigations.orphanedAnalyses', { count: health.checks.orphaned_analyses.count })}</span>
                  </li>
                )}
                {health.checks.orphaned_leads.count > 0 && (
                  <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">{t('databaseHealth.mitigations.orphanedLeads', { count: health.checks.orphaned_leads.count })}</span>
                  </li>
                )}
                {health.checks.duplicate_invitations.count > 0 && (
                  <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">{t('databaseHealth.mitigations.duplicateInvitations', { count: health.checks.duplicate_invitations.count })}</span>
                  </li>
                )}
                {health.checks.invalid_user_refs.count > 0 && (
                  <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">{t('databaseHealth.mitigations.invalidUserRefs', { count: health.checks.invalid_user_refs.count })}</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
