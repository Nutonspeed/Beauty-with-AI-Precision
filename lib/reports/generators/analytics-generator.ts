// Analytics Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { supabase } from '@/lib/supabase'

export class AnalyticsReportGenerator implements ReportGenerator {
  async generate(config: ReportConfig): Promise<ReportData> {
    const { dateRange, filters, metrics } = config
    
    try {
      // Fetch analytics data
      const data = await this.fetchAnalyticsData(dateRange, filters)
      
      // Process and aggregate data
      const processedData = await this.processData(data, metrics)
      
      // Generate insights
      const insights = await this.generateInsights(processedData)
      
      return {
        metadata: {
          title: config.title,
          generatedAt: new Date().toISOString(),
          dateRange: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          },
          filters,
          totalRecords: data.userAnalytics.length + data.sessionData.length + data.featureUsage.length
        },
        data: processedData,
        insights,
        charts: this.generateChartConfigs(processedData, metrics)
      }
    } catch (error) {
      console.error('Failed to generate analytics report:', error)
      throw new Error('Report generation failed')
    }
  }
  
  private async fetchAnalyticsData(dateRange: any, filters: any) {
    const { startDate, endDate } = dateRange
    
    // Fetch user analytics
    const { data: userAnalytics } = await supabase()
      .from('user_analytics')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch session data
    const { data: sessionData } = await supabase()
      .from('user_sessions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch feature usage
    const { data: featureUsage } = await supabase()
      .from('feature_usage')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    return {
      userAnalytics: userAnalytics || [],
      sessionData: sessionData || [],
      featureUsage: featureUsage || []
    }
  }
  
  private async processData(data: any, metrics: string[]) {
    const processed: any = {}
    
    // Process user metrics
    if (metrics.includes('users')) {
      processed.users = {
        total: data.userAnalytics.length,
        newUsers: data.userAnalytics.filter((u: any) => u.is_new_user).length,
        returningUsers: data.userAnalytics.filter((u: any) => !u.is_new_user).length,
        activeUsers: this.calculateActiveUsers(data.sessionData)
      }
    }
    
    // Process session metrics
    if (metrics.includes('sessions')) {
      processed.sessions = {
        total: data.sessionData.length,
        averageDuration: this.calculateAverageSessionDuration(data.sessionData),
        bounceRate: this.calculateBounceRate(data.sessionData),
        peakHours: this.calculatePeakHours(data.sessionData)
      }
    }
    
    // Process feature usage
    if (metrics.includes('features')) {
      processed.features = this.processFeatureUsage(data.featureUsage)
    }
    
    return processed
  }
  
  private async generateInsights(data: any) {
    const insights = []
    
    // User growth insights
    if (data.users) {
      const growthRate = this.calculateGrowthRate(data.users.newUsers, data.users.returningUsers)
      insights.push({
        type: 'user_growth',
        title: 'User Growth Trend',
        description: `User base is ${growthRate > 0 ? 'growing' : 'declining'} at ${Math.abs(growthRate)}%`,
        value: growthRate,
        trend: (growthRate > 0 ? 'up' : 'down') as 'up' | 'down' | 'stable'
      })
    }
    
    // Session insights
    if (data.sessions) {
      insights.push({
        type: 'engagement',
        title: 'User Engagement',
        description: `Average session duration is ${data.sessions.averageDuration} minutes`,
        value: data.sessions.averageDuration,
        benchmark: 5 // 5 minutes benchmark
      })
    }
    
    return insights
  }
  
  private generateChartConfigs(data: any, metrics: string[]) {
    const charts = []
    
    if (metrics.includes('users')) {
      charts.push({
        type: 'line' as const,
        title: 'User Growth Over Time',
        data: this.formatTimeSeriesData(data.userAnalytics, 'created_at'),
        xAxis: 'date',
        yAxis: 'count',
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      })
    }
    
    if (metrics.includes('sessions')) {
      charts.push({
        type: 'bar' as const,
        title: 'Session Duration Distribution',
        data: data.sessionData.map((s: any) => ({ duration: s.duration, count: 1 })),
        xAxis: 'duration',
        yAxis: 'count',
        config: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      })
    }
    
    return charts
  }
  
  // Helper methods
  private calculateActiveUsers(sessions: any[]) {
    const uniqueUsers = new Set(sessions.map((s: any) => s.user_id))
    return uniqueUsers.size
  }
  
  private calculateAverageSessionDuration(sessions: any[]) {
    if (sessions.length === 0) return 0
    const totalDuration = sessions.reduce((sum: number, s: any) => sum + s.duration, 0)
    return Math.round(totalDuration / sessions.length)
  }
  
  private calculateBounceRate(sessions: any[]) {
    if (sessions.length === 0) return 0
    const bouncedSessions = sessions.filter(s => s.duration < 60).length // < 1 minute
    return Math.round((bouncedSessions / sessions.length) * 100)
  }
  
  private calculatePeakHours(sessions: any[]) {
    const hourCounts = sessions.reduce((acc: Record<number, number>, session: any) => {
      const hour = new Date(session.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(hourCounts)
      .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
  }
  
  private processFeatureUsage(usage: any[]) {
    return usage.reduce((acc: Record<string, { count: number; users: Set<string> }>, item: any) => {
      if (!acc[item.feature]) {
        acc[item.feature] = { count: 0, users: new Set() }
      }
      acc[item.feature].count++
      acc[item.feature].users.add(item.user_id)
      return acc
    }, {} as Record<string, { count: number; users: Set<string> }>)
  }
  
  private calculateGrowthRate(newUsers: number, returningUsers: number) {
    const total = newUsers + returningUsers
    if (total === 0) return 0
    return Math.round(((newUsers - returningUsers) / total) * 100)
  }
  
  private formatTimeSeriesData(data: any[], dateField: string) {
    return data.map(item => ({
      date: new Date(item[dateField]).toISOString().split('T')[0],
      count: 1
    }))
  }
}

export default AnalyticsReportGenerator
