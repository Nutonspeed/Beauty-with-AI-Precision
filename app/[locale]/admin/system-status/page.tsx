'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Server
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-purple-400" />
              System Status
            </h1>
            <p className="text-gray-400 mt-1">ClinicIQ Platform Health Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              className="border-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${
            status?.overall === 'operational' ? 'border-green-500/50 bg-green-500/10' :
            status?.overall === 'degraded' ? 'border-yellow-500/50 bg-yellow-500/10' :
            'border-red-500/50 bg-red-500/10'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {status?.overall === 'operational' ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : status?.overall === 'degraded' ? (
                    <AlertTriangle className="w-12 h-12 text-yellow-500" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {status?.overall === 'operational' ? 'All Systems Operational' :
                       status?.overall === 'degraded' ? 'Some Systems Degraded' :
                       'System Issues Detected'}
                    </h2>
                    <p className="text-gray-400">
                      {operationalCount} of {totalServices} services operational
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{Math.round(healthPercentage)}%</div>
                  <div className="text-sm text-gray-400">Health Score</div>
                </div>
              </div>
              <Progress value={healthPercentage} className="mt-4 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Uptime</p>
                  <p className="text-xl font-bold text-white">
                    {status ? formatUptime(status.uptime) : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">DB Latency</p>
                  <p className="text-xl font-bold text-white">
                    {status?.metrics.database.latency ? `${status.metrics.database.latency}ms` : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Users</p>
                  <p className="text-xl font-bold text-white">
                    {status?.metrics.database.tableCount || '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Server className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">Version</p>
                  <p className="text-xl font-bold text-white">
                    {status?.version || '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status?.services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      service.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                      service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {SERVICE_ICONS[service.name] || <Server className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{service.name}</p>
                      <p className="text-sm text-gray-400">{service.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.latency && (
                      <span className="text-sm text-gray-400">{service.latency}ms</span>
                    )}
                    <Badge className={`${STATUS_COLORS[service.status]} text-white`}>
                      {STATUS_TEXT[service.status]}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Services Detail */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Services Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${
                status?.metrics.ai.geminiConfigured 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-red-500/50 bg-red-500/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Google Gemini</span>
                  {status?.metrics.ai.geminiConfigured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {status?.metrics.ai.geminiConfigured ? 'Configured & Ready' : 'Not Configured'}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                status?.metrics.ai.huggingfaceConfigured 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-red-500/50 bg-red-500/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Hugging Face</span>
                  {status?.metrics.ai.huggingfaceConfigured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {status?.metrics.ai.huggingfaceConfigured ? 'Configured & Ready' : 'Not Configured'}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                status?.metrics.ai.openaiConfigured 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-yellow-500/50 bg-yellow-500/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">OpenAI GPT</span>
                  {status?.metrics.ai.openaiConfigured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {status?.metrics.ai.openaiConfigured ? 'Configured & Ready' : 'Needs API Key'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
