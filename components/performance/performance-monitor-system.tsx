/**
 * Performance Monitoring & Optimization System
 * Real-time performance tracking and optimization recommendations
 * Competitive advantage: Proactive performance management
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  Timer,
  Database,
  Globe
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
}

interface PerformanceReport {
  timestamp: Date;
  overallScore: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
  alerts: string[];
  optimizationOpportunities: OptimizationSuggestion[];
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'infrastructure';
  implemented: boolean;
  potentialImprovement: number; // percentage improvement
}

interface RealTimeMetrics {
  pageLoadTime: number;
  aiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  errorRate: number;
  activeUsers: number;
  databaseQueries: number;
}

export function PerformanceMonitorSystem() {
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics>({
    pageLoadTime: 0,
    aiResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkRequests: 0,
    errorRate: 0,
    activeUsers: 0,
    databaseQueries: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState<PerformanceReport[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Initialize optimization suggestions
  useEffect(() => {
    const suggestions: OptimizationSuggestion[] = [
      {
        id: 'bundle-splitting',
        title: 'Implement Code Splitting',
        description: 'Split large bundles into smaller chunks for faster initial load',
        impact: 'high',
        effort: 'medium',
        category: 'frontend',
        implemented: false,
        potentialImprovement: 35
      },
      {
        id: 'ai-caching',
        title: 'AI Response Caching',
        description: 'Cache AI responses for similar queries to reduce API calls',
        impact: 'high',
        effort: 'low',
        category: 'ai',
        implemented: false,
        potentialImprovement: 60
      },
      {
        id: 'image-optimization',
        title: 'Image Optimization Pipeline',
        description: 'Implement automatic image compression and WebP conversion',
        impact: 'medium',
        effort: 'low',
        category: 'frontend',
        implemented: false,
        potentialImprovement: 25
      },
      {
        id: 'database-indexing',
        title: 'Database Query Optimization',
        description: 'Add indexes and optimize slow database queries',
        impact: 'high',
        effort: 'medium',
        category: 'database',
        implemented: false,
        potentialImprovement: 45
      },
      {
        id: 'cdn-implementation',
        title: 'CDN Implementation',
        description: 'Implement CDN for static assets and API responses',
        impact: 'medium',
        effort: 'low',
        category: 'infrastructure',
        implemented: false,
        potentialImprovement: 30
      },
      {
        id: 'lazy-loading',
        title: 'Lazy Loading Components',
        description: 'Implement lazy loading for non-critical components',
        impact: 'medium',
        effort: 'low',
        category: 'frontend',
        implemented: false,
        potentialImprovement: 20
      }
    ];

    setOptimizations(suggestions);
  }, []);

  // Simulate real-time metrics collection
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setCurrentMetrics(prev => ({
        pageLoadTime: Math.max(800, prev.pageLoadTime + (Math.random() - 0.5) * 200),
        aiResponseTime: Math.max(500, prev.aiResponseTime + (Math.random() - 0.5) * 300),
        memoryUsage: Math.min(100, Math.max(20, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        cpuUsage: Math.min(100, Math.max(10, prev.cpuUsage + (Math.random() - 0.5) * 15)),
        networkRequests: Math.max(0, prev.networkRequests + Math.floor(Math.random() * 5) - 2),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 1)),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
        databaseQueries: Math.max(0, prev.databaseQueries + Math.floor(Math.random() * 20) - 10)
      }));

      // Check for alerts
      setCurrentMetrics(current => {
        const newAlerts: string[] = [];

        if (current.pageLoadTime > 3000) {
          newAlerts.push('Page load time exceeds 3 seconds');
        }
        if (current.aiResponseTime > 2000) {
          newAlerts.push('AI response time exceeds 2 seconds');
        }
        if (current.memoryUsage > 80) {
          newAlerts.push('Memory usage above 80%');
        }
        if (current.errorRate > 2) {
          newAlerts.push('Error rate above 2%');
        }

        if (newAlerts.length > 0) {
          setAlerts(prev => [...new Set([...prev, ...newAlerts])]);
        }

        return current;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const generateReport = useCallback(() => {
    const metrics: PerformanceMetric[] = [
      {
        id: 'page-load',
        name: 'Page Load Time',
        value: currentMetrics.pageLoadTime,
        unit: 'ms',
        target: 2000,
        status: currentMetrics.pageLoadTime < 2000 ? 'good' : currentMetrics.pageLoadTime < 3000 ? 'warning' : 'critical',
        trend: 'stable',
        timestamp: new Date()
      },
      {
        id: 'ai-response',
        name: 'AI Response Time',
        value: currentMetrics.aiResponseTime,
        unit: 'ms',
        target: 1500,
        status: currentMetrics.aiResponseTime < 1500 ? 'good' : currentMetrics.aiResponseTime < 2000 ? 'warning' : 'critical',
        trend: 'stable',
        timestamp: new Date()
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: currentMetrics.memoryUsage,
        unit: '%',
        target: 70,
        status: currentMetrics.memoryUsage < 70 ? 'good' : currentMetrics.memoryUsage < 85 ? 'warning' : 'critical',
        trend: 'stable',
        timestamp: new Date()
      },
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: currentMetrics.cpuUsage,
        unit: '%',
        target: 60,
        status: currentMetrics.cpuUsage < 60 ? 'good' : currentMetrics.cpuUsage < 80 ? 'warning' : 'critical',
        trend: 'stable',
        timestamp: new Date()
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: currentMetrics.errorRate,
        unit: '%',
        target: 1,
        status: currentMetrics.errorRate < 1 ? 'good' : currentMetrics.errorRate < 2 ? 'warning' : 'critical',
        trend: 'stable',
        timestamp: new Date()
      }
    ];

    const overallScore = metrics.reduce((sum, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 70 : 40;
      return sum + score;
    }, 0) / metrics.length;

    const report: PerformanceReport = {
      timestamp: new Date(),
      overallScore,
      metrics,
      recommendations: [
        'Implement AI response caching to reduce API calls',
        'Optimize bundle size with code splitting',
        'Add database query indexes for faster responses',
        'Implement CDN for static assets',
        'Add error boundary components for better error handling'
      ],
      alerts: [...alerts],
      optimizationOpportunities: optimizations.filter(opt => !opt.implemented)
    };

    setPerformanceHistory(prev => [report, ...prev.slice(0, 9)]); // Keep last 10 reports
    setAlerts([]); // Clear alerts after generating report
  }, [currentMetrics, alerts, optimizations]);

  const implementOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt =>
      opt.id === optimizationId ? { ...opt, implemented: true } : opt
    ));

    // Simulate performance improvement
    setCurrentMetrics(prev => ({
      ...prev,
      pageLoadTime: prev.pageLoadTime * 0.8,
      aiResponseTime: prev.aiResponseTime * 0.7,
      memoryUsage: prev.memoryUsage * 0.9,
      cpuUsage: prev.cpuUsage * 0.85
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-teal-600">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Performance Monitor</CardTitle>
                <p className="text-sm text-gray-600">Real-time performance tracking and optimization</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? 'default' : 'outline'}
              >
                {isMonitoring ? 'หยุด' : 'เริ่ม'} Monitoring
              </Button>
              <Button onClick={generateReport}>
                <BarChart3 className="w-4 h-4 mr-2" />
                สร้างรายงาน
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Page Load Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(
                  currentMetrics.pageLoadTime < 2000 ? 'good' :
                  currentMetrics.pageLoadTime < 3000 ? 'warning' : 'critical'
                )}`}>
                  {currentMetrics.pageLoadTime.toFixed(0)}ms
                </p>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
            <Progress
              value={Math.min(100, (currentMetrics.pageLoadTime / 3000) * 100)}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI Response Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(
                  currentMetrics.aiResponseTime < 1500 ? 'good' :
                  currentMetrics.aiResponseTime < 2000 ? 'warning' : 'critical'
                )}`}>
                  {currentMetrics.aiResponseTime.toFixed(0)}ms
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <Progress
              value={Math.min(100, (currentMetrics.aiResponseTime / 2000) * 100)}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className={`text-2xl font-bold ${getStatusColor(
                  currentMetrics.memoryUsage < 70 ? 'good' :
                  currentMetrics.memoryUsage < 85 ? 'warning' : 'critical'
                )}`}>
                  {currentMetrics.memoryUsage.toFixed(1)}%
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={currentMetrics.memoryUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {currentMetrics.activeUsers}
                </p>
              </div>
              <Globe className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Performance Alerts:</p>
              <ul className="list-disc list-inside space-y-1">
                {alerts.map((alert, index) => (
                  <li key={index} className="text-sm">{alert}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="optimizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimizations">Optimization Opportunities</TabsTrigger>
          <TabsTrigger value="history">Performance History</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optimizations.map((opt) => (
              <Card key={opt.id} className={`${opt.implemented ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{opt.title}</CardTitle>
                    {opt.implemented && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(opt.impact)}>
                      {opt.impact === 'high' ? 'ผลกระทบสูง' :
                       opt.impact === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                    </Badge>
                    <Badge variant="outline">
                      {opt.category === 'frontend' ? 'Frontend' :
                       opt.category === 'backend' ? 'Backend' :
                       opt.category === 'database' ? 'Database' :
                       opt.category === 'ai' ? 'AI' : 'Infrastructure'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{opt.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Effort:</span>
                      <div className="font-medium">
                        {opt.effort === 'low' ? 'ต่ำ' :
                         opt.effort === 'medium' ? 'ปานกลาง' : 'สูง'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Potential Improvement:</span>
                      <div className="font-medium text-green-600">
                        +{opt.potentialImprovement}%
                      </div>
                    </div>
                  </div>

                  {!opt.implemented && (
                    <Button
                      onClick={() => implementOptimization(opt.id)}
                      className="w-full"
                      size="sm"
                    >
                      Implement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {performanceHistory.length > 0 ? (
            <div className="space-y-4">
              {performanceHistory.map((report, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Performance Report - {report.timestamp.toLocaleString('th-TH')}
                      </CardTitle>
                      <Badge className={getStatusBadgeColor(
                        report.overallScore >= 80 ? 'good' :
                        report.overallScore >= 60 ? 'warning' : 'critical'
                      )}>
                        Score: {report.overallScore.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Key Metrics</h4>
                        <div className="space-y-2">
                          {report.metrics.map((metric) => (
                            <div key={metric.id} className="flex justify-between text-sm">
                              <span>{metric.name}</span>
                              <span className={`font-medium ${getStatusColor(metric.status)}`}>
                                {metric.value.toFixed(1)}{metric.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Recommendations</h4>
                        <ul className="space-y-1">
                          {report.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Performance Reports</h3>
              <p className="text-gray-600 mt-1">
                Generate your first performance report to see historical data
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">CPU Usage</p>
                    <p className="text-2xl font-bold">{currentMetrics.cpuUsage.toFixed(1)}%</p>
                  </div>
                  <Cpu className="w-8 h-8 text-orange-500" />
                </div>
                <Progress value={currentMetrics.cpuUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Network Requests</p>
                    <p className="text-2xl font-bold">{currentMetrics.networkRequests}</p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Error Rate</p>
                    <p className="text-2xl font-bold">{currentMetrics.errorRate.toFixed(2)}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <Progress value={currentMetrics.errorRate * 20} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Database Queries</p>
                    <p className="text-2xl font-bold">{currentMetrics.databaseQueries}</p>
                  </div>
                  <Database className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceMonitorSystem;
