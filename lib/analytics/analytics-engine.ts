/**
 * Analytics Engine
 * Core analytics processing and data aggregation
 */

export interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
  timestamp: Date;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
  branchId?: string;
  doctorId?: string;
  serviceType?: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'revenue' | 'appointments' | 'customers' | 'inventory' | 'performance' | 'custom';
  filters?: ReportFilter;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface PredictionData {
  date: Date;
  predictedValue: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

export interface InsightData {
  id: string;
  type: 'warning' | 'info' | 'success' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  metadata?: any;
  createdAt: Date;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private metricsCache: Map<string, MetricData[]> = new Map();
  private reportsCache: Map<string, Report> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(category?: string): Promise<MetricData[]> {
    const cacheKey = `metrics-${category || 'all'}`;
    
    // Check cache (5 seconds freshness for real-time)
    const cached = this.metricsCache.get(cacheKey);
    if (cached) {
      const cacheAge = Date.now() - cached[0].timestamp.getTime();
      if (cacheAge < 5000) {
        return cached;
      }
    }

    // Fetch fresh metrics
    const metrics = await this.fetchRealTimeMetrics(category);
    this.metricsCache.set(cacheKey, metrics);
    
    return metrics;
  }

  private async fetchRealTimeMetrics(category?: string): Promise<MetricData[]> {
    // TODO: Replace with actual API call
    // Simulated real-time metrics
    const baseMetrics: MetricData[] = [
      {
        id: 'revenue-today',
        name: 'Revenue Today',
        value: 125000,
        previousValue: 98000,
        change: 27000,
        changePercent: 27.55,
        trend: 'up',
        unit: 'THB',
        timestamp: new Date(),
      },
      {
        id: 'appointments-today',
        name: 'Appointments Today',
        value: 42,
        previousValue: 38,
        change: 4,
        changePercent: 10.53,
        trend: 'up',
        unit: 'count',
        timestamp: new Date(),
      },
      {
        id: 'new-customers',
        name: 'New Customers',
        value: 15,
        previousValue: 12,
        change: 3,
        changePercent: 25,
        trend: 'up',
        unit: 'count',
        timestamp: new Date(),
      },
      {
        id: 'satisfaction-score',
        name: 'Customer Satisfaction',
        value: 4.7,
        previousValue: 4.6,
        change: 0.1,
        changePercent: 2.17,
        trend: 'up',
        unit: 'score',
        timestamp: new Date(),
      },
      {
        id: 'avg-service-time',
        name: 'Avg Service Time',
        value: 45,
        previousValue: 52,
        change: -7,
        changePercent: -13.46,
        trend: 'up',
        unit: 'minutes',
        timestamp: new Date(),
      },
      {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        value: 68.5,
        previousValue: 65.2,
        change: 3.3,
        changePercent: 5.06,
        trend: 'up',
        unit: '%',
        timestamp: new Date(),
      },
    ];

    if (category) {
      return baseMetrics.filter(m => m.id.includes(category));
    }

    return baseMetrics;
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: string,
    filter: ReportFilter
  ): Promise<TimeSeriesData[]> {
    const { startDate, endDate, period = 'daily' } = filter;

    // TODO: Replace with actual API call
    // Simulated time series data
    const data: TimeSeriesData[] = [];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();
    
    let current = new Date(start);
    while (current <= end) {
      data.push({
        timestamp: new Date(current),
        value: Math.floor(Math.random() * 100000) + 50000,
        label: this.formatDateLabel(current, period),
      });
      
      // Increment based on period
      if (period === 'daily') {
        current.setDate(current.getDate() + 1);
      } else if (period === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else if (period === 'monthly') {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return data;
  }

  /**
   * Generate chart data from time series
   */
  async generateChartData(
    metrics: string[],
    filter: ReportFilter
  ): Promise<ChartData> {
    const datasets = await Promise.all(
      metrics.map(async (metric) => {
        const timeSeries = await this.getTimeSeriesData(metric, filter);
        return {
          label: this.getMetricLabel(metric),
          data: timeSeries.map(ts => ts.value),
          borderColor: this.getMetricColor(metric),
          backgroundColor: this.getMetricColor(metric, 0.1),
          fill: true,
        };
      })
    );

    const firstSeries = await this.getTimeSeriesData(metrics[0], filter);
    const labels = firstSeries.map(ts => ts.label || '');

    return {
      labels,
      datasets,
    };
  }

  /**
   * Generate custom report
   */
  async generateReport(
    type: Report['type'],
    filters?: ReportFilter,
    userId?: string
  ): Promise<Report> {
    const reportId = `report-${Date.now()}`;

    let data: any = {};

    switch (type) {
      case 'revenue':
        data = await this.generateRevenueReport(filters);
        break;
      case 'appointments':
        data = await this.generateAppointmentsReport(filters);
        break;
      case 'customers':
        data = await this.generateCustomersReport(filters);
        break;
      case 'inventory':
        data = await this.generateInventoryReport(filters);
        break;
      case 'performance':
        data = await this.generatePerformanceReport(filters);
        break;
      default:
        data = { message: 'Custom report type' };
    }

    const report: Report = {
      id: reportId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      description: `Generated ${type} report`,
      type,
      filters,
      data,
      generatedAt: new Date(),
      generatedBy: userId || 'system',
    };

    this.reportsCache.set(reportId, report);
    return report;
  }

  private async generateRevenueReport(filters?: ReportFilter) {
    return {
      totalRevenue: 1250000,
      periodRevenue: 125000,
      revenueByService: [
        { service: 'Laser Treatment', revenue: 450000, percentage: 36 },
        { service: 'Facial', revenue: 350000, percentage: 28 },
        { service: 'Consultation', revenue: 200000, percentage: 16 },
        { service: 'Products', revenue: 150000, percentage: 12 },
        { service: 'Other', revenue: 100000, percentage: 8 },
      ],
      revenueByBranch: [
        { branch: 'Bangkok Central', revenue: 600000, percentage: 48 },
        { branch: 'Chiang Mai', revenue: 400000, percentage: 32 },
        { branch: 'Phuket', revenue: 250000, percentage: 20 },
      ],
      trend: await this.getTimeSeriesData('revenue', filters || {}),
    };
  }

  private async generateAppointmentsReport(filters?: ReportFilter) {
    return {
      totalAppointments: 420,
      completedAppointments: 385,
      canceledAppointments: 25,
      noShowAppointments: 10,
      completionRate: 91.67,
      appointmentsByService: [
        { service: 'Laser Treatment', count: 150, percentage: 35.71 },
        { service: 'Facial', count: 120, percentage: 28.57 },
        { service: 'Consultation', count: 80, percentage: 19.05 },
        { service: 'Follow-up', count: 70, percentage: 16.67 },
      ],
      peakHours: [
        { hour: '10:00-11:00', count: 45 },
        { hour: '14:00-15:00', count: 42 },
        { hour: '16:00-17:00', count: 38 },
      ],
      trend: await this.getTimeSeriesData('appointments', filters || {}),
    };
  }

  private async generateCustomersReport(filters?: ReportFilter) {
    return {
      totalCustomers: 1250,
      newCustomers: 150,
      returningCustomers: 1100,
      retentionRate: 88,
      customersByAge: [
        { range: '18-25', count: 180, percentage: 14.4 },
        { range: '26-35', count: 425, percentage: 34 },
        { range: '36-45', count: 380, percentage: 30.4 },
        { range: '46-55', count: 200, percentage: 16 },
        { range: '56+', count: 65, percentage: 5.2 },
      ],
      customersByGender: [
        { gender: 'Female', count: 950, percentage: 76 },
        { gender: 'Male', count: 280, percentage: 22.4 },
        { gender: 'Other', count: 20, percentage: 1.6 },
      ],
      averageLifetimeValue: 25000,
      trend: await this.getTimeSeriesData('customers', filters || {}),
    };
  }

  private async generateInventoryReport(_filters?: ReportFilter) {
    return {
      totalProducts: 450,
      lowStockProducts: 25,
      outOfStockProducts: 5,
      inventoryValue: 2500000,
      topSellingProducts: [
        { product: 'Vitamin C Serum', sold: 450, revenue: 225000 },
        { product: 'Hyaluronic Acid', sold: 380, revenue: 190000 },
        { product: 'Sunscreen SPF50', sold: 320, revenue: 128000 },
      ],
      stockAlerts: [
        { product: 'Retinol Cream', currentStock: 5, minStock: 20 },
        { product: 'Face Mask Set', currentStock: 8, minStock: 30 },
      ],
      turnoverRate: 4.5,
    };
  }

  private async generatePerformanceReport(_filters?: ReportFilter) {
    return {
      overallPerformance: 87.5,
      metrics: {
        customerSatisfaction: 4.7,
        appointmentCompletionRate: 91.67,
        averageWaitTime: 12,
        revenuePerCustomer: 1000,
        serviceUtilization: 78.5,
      },
      topPerformers: [
        { name: 'Dr. Somchai', rating: 4.9, appointments: 120, revenue: 450000 },
        { name: 'Dr. Suda', rating: 4.8, appointments: 115, revenue: 420000 },
        { name: 'Dr. Anan', rating: 4.7, appointments: 95, revenue: 350000 },
      ],
      serviceEfficiency: [
        { service: 'Laser Treatment', avgDuration: 45, efficiency: 92 },
        { service: 'Facial', avgDuration: 60, efficiency: 88 },
        { service: 'Consultation', avgDuration: 30, efficiency: 95 },
      ],
    };
  }

  /**
   * Export report to various formats
   */
  async exportReport(
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ): Promise<Blob> {
    const report = this.reportsCache.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(report, null, 2)], {
          type: 'application/json',
        });
      
      case 'csv':
        return this.exportToCSV(report);
      
      case 'excel':
        return this.exportToExcel(report);
      
      case 'pdf':
        return this.exportToPDF(report);
      
      default:
        throw new Error('Unsupported format');
    }
  }

  private exportToCSV(report: Report): Blob {
    // Simple CSV export
    let csv = `Report: ${report.name}\nGenerated: ${report.generatedAt}\n\n`;
    
    // Convert data to CSV rows
    const flatData = this.flattenObject(report.data);
    csv += Object.keys(flatData).join(',') + '\n';
    csv += Object.values(flatData).join(',') + '\n';

    return new Blob([csv], { type: 'text/csv' });
  }

  private exportToExcel(report: Report): Blob {
    // TODO: Implement Excel export using library like xlsx
    // For now, return CSV as placeholder
    return this.exportToCSV(report);
  }

  private exportToPDF(report: Report): Blob {
    // TODO: Implement PDF export using library like jsPDF
    // For now, return JSON as placeholder
    return new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/pdf',
    });
  }

  /**
   * Generate predictive analytics
   */
  async generatePrediction(
    metric: string,
    daysAhead: number = 30
  ): Promise<PredictionData[]> {
    // Simple linear regression prediction
    const historicalData = await this.getTimeSeriesData(metric, {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      period: 'daily',
    });

    const predictions: PredictionData[] = [];
    const avgValue = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
    const trend = this.calculateTrend(historicalData);

    for (let i = 1; i <= daysAhead; i++) {
      const predictedValue = avgValue + (trend * i);
      const variance = avgValue * 0.1; // 10% variance

      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        predictedValue,
        confidence: Math.max(0.5, 1 - (i / daysAhead) * 0.3), // Decreasing confidence
        lowerBound: predictedValue - variance,
        upperBound: predictedValue + variance,
      });
    }

    return predictions;
  }

  private calculateTrend(data: TimeSeriesData[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Generate automated insights
   */
  async generateInsights(_filters?: ReportFilter): Promise<InsightData[]> {
    const insights: InsightData[] = [];
    const metrics = await this.getRealTimeMetrics();

    // Revenue insights
    const revenueMetric = metrics.find(m => m.id === 'revenue-today');
    if (revenueMetric && revenueMetric.changePercent && revenueMetric.changePercent > 20) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'success',
        title: 'Revenue Surge Detected',
        description: `Today's revenue is ${revenueMetric.changePercent.toFixed(1)}% higher than yesterday. Great performance!`,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Analyze which services are driving this growth and consider increasing capacity.',
        createdAt: new Date(),
      });
    }

    // Appointment insights
    const appointmentMetric = metrics.find(m => m.id === 'appointments-today');
    if (appointmentMetric && appointmentMetric.value < 30) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'warning',
        title: 'Low Appointment Volume',
        description: `Only ${appointmentMetric.value} appointments today. This is below the average of 40.`,
        impact: 'medium',
        actionable: true,
        suggestedAction: 'Consider running a promotion or reaching out to regular customers.',
        createdAt: new Date(),
      });
    }

    // Customer satisfaction insights
    const satisfactionMetric = metrics.find(m => m.id === 'satisfaction-score');
    if (satisfactionMetric && satisfactionMetric.value >= 4.5) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        type: 'success',
        title: 'Excellent Customer Satisfaction',
        description: `Your satisfaction score of ${satisfactionMetric.value} is excellent!`,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Encourage satisfied customers to leave reviews and refer friends.',
        createdAt: new Date(),
      });
    }

    // Conversion rate insights
    const conversionMetric = metrics.find(m => m.id === 'conversion-rate');
    if (conversionMetric && conversionMetric.changePercent && conversionMetric.changePercent > 0) {
      insights.push({
        id: `insight-${Date.now()}-4`,
        type: 'info',
        title: 'Improving Conversion Rate',
        description: `Your conversion rate has improved by ${conversionMetric.changePercent.toFixed(1)}%.`,
        impact: 'medium',
        actionable: false,
        createdAt: new Date(),
      });
    }

    // Performance prediction
    const predictions = await this.generatePrediction('revenue', 7);
    const nextWeekRevenue = predictions.reduce((sum, p) => sum + p.predictedValue, 0);
    insights.push({
      id: `insight-${Date.now()}-5`,
      type: 'info',
      title: 'Revenue Forecast',
      description: `Based on current trends, estimated revenue for next week: ฿${Math.round(nextWeekRevenue).toLocaleString()}`,
      impact: 'medium',
      actionable: true,
      suggestedAction: 'Plan staff schedules and inventory accordingly.',
      metadata: { predictions },
      createdAt: new Date(),
    });

    return insights;
  }

  /**
   * Calculate ROI (Return on Investment)
   */
  calculateROI(investment: number, revenue: number, costs: number): number {
    const netProfit = revenue - costs - investment;
    const roi = (netProfit / investment) * 100;
    return roi;
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(
    metric: string,
    value: number,
    metadata?: any
  ): Promise<void> {
    // TODO: Send to analytics backend
    console.log(`Tracking ${metric}: ${value}`, metadata);
  }

  // Helper methods
  private formatDateLabel(date: Date, period: string): string {
    if (period === 'daily') {
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    } else if (period === 'weekly') {
      return `Week ${Math.ceil(date.getDate() / 7)}`;
    } else if (period === 'monthly') {
      return date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
    }
    return date.toISOString();
  }

  private getMetricLabel(metric: string): string {
    const labels: Record<string, string> = {
      revenue: 'Revenue',
      appointments: 'Appointments',
      customers: 'Customers',
      satisfaction: 'Satisfaction',
    };
    return labels[metric] || metric;
  }

  private getMetricColor(metric: string, alpha: number = 1): string {
    const colors: Record<string, string> = {
      revenue: alpha === 1 ? '#3b82f6' : `rgba(59, 130, 246, ${alpha})`,
      appointments: alpha === 1 ? '#10b981' : `rgba(16, 185, 129, ${alpha})`,
      customers: alpha === 1 ? '#f59e0b' : `rgba(245, 158, 11, ${alpha})`,
      satisfaction: alpha === 1 ? '#8b5cf6' : `rgba(139, 92, 246, ${alpha})`,
    };
    return colors[metric] || (alpha === 1 ? '#6b7280' : `rgba(107, 114, 128, ${alpha})`);
  }

  private flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const analyticsEngine = AnalyticsEngine.getInstance();
