// Patient Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { createServiceClient } from '@/lib/supabase/server'

export class PatientReportGenerator implements ReportGenerator {
  async generate(config: ReportConfig): Promise<ReportData> {
    const { dateRange, filters, metrics } = config
    
    try {
      // Fetch patient data
      const data = await this.fetchPatientData(dateRange, filters)
      
      // Process patient metrics
      const processedData = await this.processPatientData(data, metrics)
      
      // Generate patient insights
      const insights = await this.generatePatientInsights(processedData)
      
      return {
        metadata: {
          title: config.title,
          generatedAt: new Date().toISOString(),
          dateRange: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          },
          filters,
          totalRecords: data.patients.length
        },
        data: processedData,
        insights: insights as any,
        charts: this.generatePatientCharts(processedData, metrics) as any
      }
    } catch (error) {
      console.error('Failed to generate patient report:', error)
      throw new Error('Patient report generation failed')
    }
  }
  
  private async fetchPatientData(dateRange: any, filters: any) {
    const supabase = createServiceClient()
    const { startDate, endDate } = dateRange
    
    // Fetch patient demographics
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch treatment history
    const { data: treatments } = await supabase
      .from('treatments')
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
      patients: patients || [],
      treatments: treatments || [],
      analyses: analyses || [],
      appointments: appointments || []
    }
  }
  
  private async processPatientData(data: any, metrics: string[]) {
    const processed: any = {}
    
    // Demographics metrics
    if (metrics.includes('demographics')) {
      processed.demographics = {
        ageDistribution: this.calculateAgeDistribution(data.patients),
        genderDistribution: this.calculateGenderDistribution(data.patients),
        locationDistribution: this.calculateLocationDistribution(data.patients)
      }
    }
    
    // Treatment metrics
    if (metrics.includes('treatments')) {
      processed.treatments = {
        total: data.treatments.length,
        byType: this.groupTreatmentsByType(data.treatments),
        successRate: this.calculateTreatmentSuccessRate(data.treatments),
        averageRevenue: this.calculateAverageTreatmentRevenue(data.treatments)
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
  
  private async generatePatientInsights(data: any) {
    const insights = []
    
    // Demographics insights
    if (data.demographics) {
      const dominantAgeGroup = Object.entries(data.demographics.ageDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]
      
      insights.push({
        type: 'demographics',
        title: 'Primary Age Group',
        description: `Most patients are in the ${dominantAgeGroup[0]} age group`,
        value: Number(dominantAgeGroup[1]),
        category: 'age'
      })
    }
    
    // Treatment insights
    if (data.treatments) {
      insights.push({
        type: 'treatments',
        title: 'Treatment Success',
        description: `Treatment success rate is ${data.treatments.successRate}%`,
        value: data.treatments.successRate,
        benchmark: 85 // 85% benchmark
      })
    }
    
    return insights
  }
  
  private generatePatientCharts(data: any, metrics: string[]) {
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
    
    if (metrics.includes('treatments')) {
      charts.push({
        type: 'bar',
        title: 'Treatment Types',
        data: Object.entries(data.treatments.byType).map(([type, count]) => ({
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
  private calculateAgeDistribution(patients: any[]) {
    const distribution = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    }
    
    patients.forEach(patient => {
      const age = this.calculateAge(patient.date_of_birth)
      if (age >= 18 && age <= 25) distribution['18-25']++
      else if (age >= 26 && age <= 35) distribution['26-35']++
      else if (age >= 36 && age <= 45) distribution['36-45']++
      else if (age >= 46 && age <= 55) distribution['46-55']++
      else if (age >= 56) distribution['56+']++
    })
    
    return distribution
  }
  
  private calculateGenderDistribution(patients: any[]) {
    return patients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1
      return acc
    }, {})
  }
  
  private calculateLocationDistribution(patients: any[]) {
    return patients.reduce((acc, patient) => {
      const location = patient.city || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})
  }
  
  private groupTreatmentsByType(treatments: any[]) {
    return treatments.reduce((acc, treatment) => {
      acc[treatment.type] = (acc[treatment.type] || 0) + 1
      return acc
    }, {})
  }
  
  private async calculateTreatmentSuccessRate(treatments: any[]) {
    if (treatments.length === 0) return 0
    const _supabase = await createServerClient()
    const successful = treatments.filter(t => t.status === 'completed' && t.success).length
    return Math.round((successful / treatments.length) * 100)
  }
  
  private calculateAverageTreatmentRevenue(treatments: any[]) {
    if (treatments.length === 0) return 0
    const total = treatments.reduce((sum, t) => sum + (t.price || 0), 0)
    return total / treatments.length
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

export default PatientReportGenerator
