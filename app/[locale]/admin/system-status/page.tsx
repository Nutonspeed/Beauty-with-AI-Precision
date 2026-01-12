'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Shield,
  Brain,
  Mail,
  HardDrive,
  Wifi,
  Clock,
  Activity,
  Server,
  LayoutGrid
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  details?: string;
}

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  uptime: number;
  services: ServiceStatus[];
  metrics: {
    database: { connected: boolean; tableCount?: number; latency?: number };
    auth: { configured: boolean; provider: string };
    ai: { geminiConfigured: boolean; huggingfaceConfigured: boolean; openaiConfigured: boolean };
    email: { configured: boolean; provider: string };
    storage: { configured: boolean };
  };
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'PostgreSQL Database': <Database className="w-5 h-5" />,
  'Authentication (Supabase Auth)': <Shield className="w-5 h-5" />,
  'AI Services': <Brain className="w-5 h-5" />,
  'Email Service (Resend)': <Mail className="w-5 h-5" />,
  'File Storage (Supabase Storage)': <HardDrive className="w-5 h-5" />,
  'Real-time (Supabase Realtime)': <Wifi className="w-5 h-5" />,
};

const STATUS_COLORS = {
  operational: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
  unknown: 'bg-gray-500'
};

const STATUS_TEXT = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown'
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function SystemStatusPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/system/status');
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const operationalCount = status?.services.filter(s => s.status === 'operational').length || 0;
  const totalServices = status?.services.length || 0;
  const healthPercentage = totalServices > 0 ? (operationalCount / totalServices) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Status Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Global System Telemetry
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                System<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Health</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Monitor real-time infrastructure nominals and authorize aesthetic node synchronization.
              </p>
            </motion.div>
            
            <div className="flex flex-col items-end gap-4 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <Button
                variant="premium"
                size="xl"
                onClick={fetchStatus}
                disabled={loading}
                className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border"
              >
                <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
                Sync Telemetry
              </Button>
            </div>
          </div>

          {/* Overall Health Architecture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Card className={cn(
              "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative group",
              status?.overall === 'operational' ? "border-emerald-500/20" : 
              status?.overall === 'degraded' ? "border-amber-500/20" : "border-rose-500/20"
            )}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <CardContent className="p-10 lg:p-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-10">
                    <div className={cn(
                      "h-24 w-24 rounded-[2rem] flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-700",
                      status?.overall === 'operational' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      status?.overall === 'degraded' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    )}>
                      {status?.overall === 'operational' ? (
                        <CheckCircle className="w-12 h-12" />
                      ) : status?.overall === 'degraded' ? (
                        <AlertTriangle className="w-12 h-12" />
                      ) : (
                        <XCircle className="w-12 h-12" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold text-white tracking-tight italic">
                        {status?.overall === 'operational' ? 'All Systems Nominal' :
                         status?.overall === 'degraded' ? 'Some Nodes Degraded' :
                         'System Error Detected'}
                      </h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        {operationalCount} of {totalServices} Aesthetic services operational
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <div className="text-6xl font-black text-white tracking-tighter italic">{Math.round(healthPercentage)}%</div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Global Health Yield</p>
                  </div>
                </div>
                <div className="mt-12 relative h-3 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${healthPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      status?.overall === 'operational' ? "bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
                      status?.overall === 'degraded' ? "bg-gradient-to-r from-amber-600 to-orange-400" :
                      "bg-gradient-to-r from-rose-600 to-red-400"
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Critical Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: 'Uptime Protocol', val: status ? formatUptime(status.uptime) : '--', icon: Clock, color: 'text-blue-400' },
              { label: 'DB Latency Sync', val: status?.metrics.database.latency ? `${status.metrics.database.latency}ms` : '--', icon: Activity, color: 'text-emerald-400' },
              { label: 'Registry Load', val: status?.metrics.database.tableCount || '--', icon: Database, color: 'text-purple-400' },
              { label: 'Build Hash', val: status?.version || '--', icon: Server, color: 'text-orange-400' }
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border border-white/5 shadow-inner bg-white/[0.02]", m.color)}>
                        <m.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">{m.label}</p>
                        <p className="text-xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{m.val}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Service Node Grid */}
            <div className="lg:col-span-8 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <LayoutGrid className="h-8 w-8 text-pink-500" />
                    Operational Nodes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {status?.services.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="group/item flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover/item:bg-pink-600 transition-colors" />
                      <div className="flex items-center gap-8 mb-6 md:mb-0">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-all duration-700",
                          service.status === 'operational' ? "bg-emerald-500/10 text-emerald-400" :
                          service.status === 'degraded' ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                          {SERVICE_ICONS[service.name] || <Server className="w-8 h-8" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-bold text-white italic group-hover/item:text-pink-400 transition-colors">{service.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{service.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right space-y-2">
                          {service.latency && (
                            <p className="text-xl font-black text-white tracking-tighter italic">{service.latency}ms</p>
                          )}
                          <Badge className={cn(
                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner italic",
                            STATUS_COLORS[service.status]
                          )}>
                            {STATUS_TEXT[service.status]}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* AI Control Node Column */}
            <div className="lg:col-span-4 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <Brain className="h-6 w-6 text-cyan-400" />
                    AI Core Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="space-y-8">
                    {[
                      { name: 'Google Gemini', status: status?.metrics.ai.geminiConfigured },
                      { name: 'Hugging Face', status: status?.metrics.ai.huggingfaceConfigured },
                      { name: 'OpenAI GPT', status: status?.metrics.ai.openaiConfigured }
                    ].map((ai, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-cyan-500/30 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white italic group-hover:text-cyan-400 transition-colors">{ai.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            {ai.status ? 'CONFIGURED & READY' : 'PARAMETER_PENDING'}
                          </p>
                        </div>
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-all",
                          ai.status ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                          {ai.status ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Alert className="border-rose-500/20 bg-rose-500/[0.02] rounded-2xl p-6">
                        <div className="flex items-center gap-4 text-rose-400">
                          <XCircle className="w-5 h-5" />
                          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                      </Alert>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
