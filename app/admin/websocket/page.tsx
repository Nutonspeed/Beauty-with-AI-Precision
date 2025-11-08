"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Server, Activity, Clock, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HealthMetrics {
  ok: boolean;
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  clients: number;
  byRole: Record<string, number>;
  byClinic: Record<string, number>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export default function WebSocketMetricsPage() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const WS_PORT = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      const response = await fetch(`http://localhost:${WS_PORT}/health`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchMetrics();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Connection Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchMetrics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WebSocket Metrics</h1>
          <p className="text-muted-foreground">Real-time server health and statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={metrics?.ok ? 'default' : 'destructive'} className="h-8">
            <Activity className="h-3 w-3 mr-1" />
            {metrics?.ok ? 'Online' : 'Offline'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatUptime(metrics.uptime) : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connected Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.clients ?? '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Heap Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatBytes(metrics.memory.heapUsed) : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              of {metrics ? formatBytes(metrics.memory.heapTotal) : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              RSS Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatBytes(metrics.memory.rss) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Clients by Role</CardTitle>
          <CardDescription>Distribution of connected users by role</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics && Object.keys(metrics.byRole).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(metrics.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No clients connected</p>
          )}
        </CardContent>
      </Card>

      {/* Clients by Clinic */}
      <Card>
        <CardHeader>
          <CardTitle>Clients by Clinic</CardTitle>
          <CardDescription>Distribution of connected users by clinic</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics && Object.keys(metrics.byClinic).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(metrics.byClinic)
                .sort((a, b) => b[1] - a[1])
                .map(([clinic, count]) => (
                  <div key={clinic} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium truncate" title={clinic}>
                      {clinic === 'default' ? 'No Clinic' : clinic}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No clients connected</p>
          )}
        </CardContent>
      </Card>

      {/* Memory Details */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
          <CardDescription>Detailed memory consumption</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Heap Used</span>
                <span className="text-sm">
                  {formatBytes(metrics.memory.heapUsed)} / {formatBytes(metrics.memory.heapTotal)}
                  <span className="text-muted-foreground ml-2">
                    ({((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-medium">Total RSS</span>
                <span className="text-sm">{formatBytes(metrics.memory.rss)}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
