// Customer Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { createServiceClient } from '@/lib/supabase/server'

export class CustomerReportGenerator implements ReportGenerator {
  async generate(config: ReportConfig): Promise<ReportData> {
    const { dateRange, filters, metrics } = config
    
    try {
      // Fetch customer data
      const data = await this.fetchCustomerData(dateRange, filters)
      
      // Process customer metrics
      const processedData = await this.processCustomerData(data, metrics)
      
      // Generate customer insights
      const insights = await this.generateCustomerInsights(processedData)
      
      return {
        metadata: {
          title: config.title,
          generatedAt: new Date().toISOString(),
          dateRange: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          },
          filters,
          totalRecords: data.customers.length
        },
        data: processedData,
        insights: insights as any,
        charts: this.generateCustomerCharts(processedData, metrics) as any
      }
    } catch (error) {
      console.error('Failed to generate customer report:', error)
      throw new Error('Customer report generation failed')
    }
  }
  
  private async fetchCustomerData(dateRange: any, filters: any) {
    const supabase = createServiceClient()
    const { startDate, endDate } = dateRange
    
    // Fetch customer demographics
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch program history
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch skin analyses
    const { data: analyses } = await supabase
      .from('skin_analyses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    return {
      customers: customers || [],
      programs: programs || [],
      analyses: analyses || [],
      appointments: appointments || []
    }
  }
  
  private async processCustomerData(data: any, metrics: string[]) {
    const processed: any = {}
    
    // Demographics metrics
    if (metrics.includes('demographics')) {
      processed.demographics = {
        ageDistribution: this.calculateAgeDistribution(data.customers),
        genderDistribution: this.calculateGenderDistribution(data.customers),
        locationDistribution: this.calculateLocationDistribution(data.customers)
      }
    }
    
    // Program metrics
    if (metrics.includes('programs')) {
      processed.programs = {
        total: data.programs.length,
        byType: this.groupProgramsByType(data.programs),
        successRate: this.calculateProgramSuccessRate(data.programs),
        averageRevenue: this.calculateAverageProgramRevenue(data.programs)
      }
    }
    
    // Analysis metrics
    if (metrics.includes('analyses')) {
      processed.analyses = {
        total: data.analyses.length,
        averageScore: this.calculateAverageAnalysisScore(data.analyses),
        commonConcerns: this.getCommonSkinConcerns(data.analyses),
        improvementRate: this.calculateImprovementRate(data.analyses)
      }
    }
    
    // Appointment metrics
    if (metrics.includes('appointments')) {
      processed.appointments = {
        total: data.appointments.length,
        showRate: this.calculateShowRate(data.appointments),
        cancellationRate: this.calculateCancellationRate(data.appointments),
        peakTimes: this.getPeakAppointmentTimes(data.appointments)
      }
    }
    
    return processed
  }
  
  private async generateCustomerInsights(data: any) {
    const insights = []
    
    // Demographics insights
    if (data.demographics) {
      const dominantAgeGroup = Object.entries(data.demographics.ageDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]
      
      insights.push({
        type: 'demographics',
        title: 'Primary Age Group',
        description: `Most customers are in the ${dominantAgeGroup[0]} age group`,
        value: Number(dominantAgeGroup[1]),
        category: 'age'
      })
    }
    
    // Program insights
    if (data.programs) {
      insights.push({
        type: 'programs',
        title: 'Program Success',
        description: `Program success rate is ${data.programs.successRate}%`,
        value: data.programs.successRate,
        benchmark: 85 // 85% benchmark
      })
    }
    
    return insights
  }
  
  private generateCustomerCharts(data: any, metrics: string[]) {
    const charts = []
    
    if (metrics.includes('demographics')) {
      charts.push({
        type: 'pie',
        title: 'Age Distribution',
        data: Object.entries(data.demographics.ageDistribution).map(([age, count]) => ({
          age,
          count
        })),
        xAxis: 'age',
        yAxis: 'count',
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'right' }
          }
        }
      })
    }
    
    if (metrics.includes('programs')) {
      charts.push({
        type: 'bar',
        title: 'Program Types',
        data: Object.entries(data.programs.byType).map(([type, count]) => ({
          type,
          count
        })),
        xAxis: 'type',
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
  private calculateAgeDistribution(customers: any[]) {
    const distribution = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    }
    
    customers.forEach(customer => {
      const age = this.calculateAge(customer.date_of_birth)
      if (age >= 18 && age <= 25) distribution['18-25']++
      else if (age >= 26 && age <= 35) distribution['26-35']++
      else if (age >= 36 && age <= 45) distribution['36-45']++
      else if (age >= 46 && age <= 55) distribution['46-55']++
      else if (age >= 56) distribution['56+']++
    })
    
    return distribution
  }
  
  private calculateGenderDistribution(customers: any[]) {
    return customers.reduce((acc, customer) => {
      acc[customer.gender] = (acc[customer.gender] || 0) + 1
      return acc
    }, {})
  }
  
  private calculateLocationDistribution(customers: any[]) {
    return customers.reduce((acc, customer) => {
      const location = customer.city || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})
  }
  
  private groupProgramsByType(programs: any[]) {
    return programs.reduce((acc, program) => {
      acc[program.type] = (acc[program.type] || 0) + 1
      return acc
    }, {})
  }
  
  private async calculateProgramSuccessRate(programs: any[]) {
    if (programs.length === 0) return 0
    const _supabase = createServiceClient()
    const successful = programs.filter(p => p.status === 'completed' && p.success).length
    return Math.round((successful / programs.length) * 100)
  }
  
  private calculateAverageProgramRevenue(programs: any[]) {
    if (programs.length === 0) return 0
    const total = programs.reduce((sum, p) => sum + (p.price || 0), 0)
    return total / programs.length
  }
  
  private calculateAverageAnalysisScore(analyses: any[]) {
    if (analyses.length === 0) return 0
    const total = analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0)
    return total / analyses.length
  }
  
  private getCommonSkinConcerns(analyses: any[]) {
    const concerns = analyses.reduce((acc, analysis) => {
      if (analysis.concerns) {
        analysis.concerns.forEach((concern: any) => {
          acc[concern] = (acc[concern] || 0) + 1
        })
      }
      return acc
    }, {})
    
    return Object.entries(concerns)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([concern, count]) => ({ concern, count }))
  }
  
  private calculateImprovementRate(_analyses: any[]) {
    // This would compare initial vs follow-up analysis scores
    // For now, return a placeholder
    return 75
  }
  
  private calculateShowRate(appointments: any[]) {
    if (appointments.length === 0) return 0
    const showed = appointments.filter(a => a.status === 'completed').length
    return Math.round((showed / appointments.length) * 100)
  }
  
  private calculateCancellationRate(appointments: any[]) {
    if (appointments.length === 0) return 0
    const cancelled = appointments.filter(a => a.status === 'cancelled').length
    return Math.round((cancelled / appointments.length) * 100)
  }
  
  private getPeakAppointmentTimes(appointments: any[]) {
    const hourCounts = appointments.reduce((acc, appointment) => {
      const hour = new Date(appointment.scheduled_time).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
  }
  
  private calculateAge(dateOfBirth: string) {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }
}

export default CustomerReportGenerator
