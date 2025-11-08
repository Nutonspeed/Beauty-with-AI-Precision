'use client';

/**
 * Analytics Page
 * Advanced Analytics & Reporting Dashboard
 */

import { useState } from 'react';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { ReportBuilder } from '@/components/report-builder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  FileText,
  TrendingUp,
  Settings,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                Advanced Analytics & Reporting
              </h1>
              <p className="text-muted-foreground mt-1">
                Phase 3 - Task 2: Real-time insights, custom reports, and predictive analytics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reports</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold">1.2M</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights Generated</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-semibold">30s ago</p>
                </div>
                <RefreshCw className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Report Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportBuilder />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-900">✓ Real-time Metrics</p>
                <p className="text-blue-700">Live data updates every 30 seconds</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Custom Reports</p>
                <p className="text-blue-700">Revenue, customers, appointments, inventory</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Data Visualization</p>
                <p className="text-blue-700">Charts, graphs, and interactive dashboards</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Export Functionality</p>
                <p className="text-blue-700">PDF, Excel, CSV formats</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Predictive Analytics</p>
                <p className="text-blue-700">AI-powered forecasting</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Performance Tracking</p>
                <p className="text-blue-700">Team and operational metrics</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ ROI Calculation</p>
                <p className="text-blue-700">Investment return analysis</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">✓ Automated Insights</p>
                <p className="text-blue-700">AI-generated recommendations</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
