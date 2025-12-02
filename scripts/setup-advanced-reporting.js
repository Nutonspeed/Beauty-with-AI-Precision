#!/usr/bin/env node

/**
 * Advanced Reporting and Data Visualization Setup Script
 * Implements comprehensive reporting system with interactive data visualization
 * for Beauty with AI Precision platform
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create reporting directories
function createReportingDirectories() {
  colorLog('\n📁 Creating reporting directories...', 'cyan')
  
  const directories = [
    'lib/reports',
    'lib/reports/generators',
    'lib/reports/analyzers',
    'lib/reports/exporters',
    'lib/reports/schedulers',
    'components/reports',
    'components/reports/charts',
    'components/reports/dashboards',
    'components/reports/filters',
    'components/reports/exports',
    'app/api/reports',
    'app/api/reports/generate',
    'app/api/reports/export',
    'app/api/reports/schedule',
    'app/api/reports/analytics',
    'hooks/reports',
    'utils/reports',
    'utils/reports/chart-configs',
    'utils/reports/data-processors',
    'config/reports',
    'types/reports',
    'docs/reports'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create report generators
function createReportGenerators() {
  colorLog('\n📊 Creating report generators...', 'cyan')
  
  const analyticsGenerator = `// Analytics Report Generator
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
          dateRange,
          filters,
          totalRecords: data.length
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
    const { data: userAnalytics } = await supabase
      .from('user_analytics')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch session data
    const { data: sessionData } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch feature usage
    const { data: featureUsage } = await supabase
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
        newUsers: data.userAnalytics.filter(u => u.is_new_user).length,
        returningUsers: data.userAnalytics.filter(u => !u.is_new_user).length,
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
        description: \`User base is \${growthRate > 0 ? 'growing' : 'declining'} at \${Math.abs(growthRate)}%\`,
        value: growthRate,
        trend: growthRate > 0 ? 'up' : 'down'
      })
    }
    
    // Session insights
    if (data.sessions) {
      insights.push({
        type: 'engagement',
        title: 'User Engagement',
        description: \`Average session duration is \${data.sessions.averageDuration} minutes\`,
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
        type: 'line',
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
        type: 'bar',
        title: 'Session Duration Distribution',
        data: data.sessionData.map(s => ({ duration: s.duration, count: 1 })),
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
    const uniqueUsers = new Set(sessions.map(s => s.user_id))
    return uniqueUsers.size
  }
  
  private calculateAverageSessionDuration(sessions: any[]) {
    if (sessions.length === 0) return 0
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
    return Math.round(totalDuration / sessions.length)
  }
  
  private calculateBounceRate(sessions: any[]) {
    if (sessions.length === 0) return 0
    const bouncedSessions = sessions.filter(s => s.duration < 60).length // < 1 minute
    return Math.round((bouncedSessions / sessions.length) * 100)
  }
  
  private calculatePeakHours(sessions: any[]) {
    const hourCounts = sessions.reduce((acc, session) => {
      const hour = new Date(session.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
  }
  
  private processFeatureUsage(usage: any[]) {
    return usage.reduce((acc, item) => {
      if (!acc[item.feature]) {
        acc[item.feature] = { count: 0, users: new Set() }
      }
      acc[item.feature].count++
      acc[item.feature].users.add(item.user_id)
      return acc
    }, {})
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
`

  const financialGenerator = `// Financial Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { supabase } from '@/lib/supabase'

export class FinancialReportGenerator implements ReportGenerator {
  async generate(config: ReportConfig): Promise<ReportData> {
    const { dateRange, filters, metrics } = config
    
    try {
      // Fetch financial data
      const data = await this.fetchFinancialData(dateRange, filters)
      
      // Process financial metrics
      const processedData = await this.processFinancialData(data, metrics)
      
      // Generate financial insights
      const insights = await this.generateFinancialInsights(processedData)
      
      return {
        metadata: {
          title: config.title,
          generatedAt: new Date().toISOString(),
          dateRange,
          filters,
          currency: 'THB'
        },
        data: processedData,
        insights,
        charts: this.generateFinancialCharts(processedData, metrics)
      }
    } catch (error) {
      console.error('Failed to generate financial report:', error)
      throw new Error('Financial report generation failed')
    }
  }
  
  private async fetchFinancialData(dateRange: any, filters: any) {
    const { startDate, endDate } = dateRange
    
    // Fetch revenue data
    const { data: revenue } = await supabase
      .from('revenue')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    return {
      revenue: revenue || [],
      expenses: expenses || [],
      invoices: invoices || []
    }
  }
  
  private async processFinancialData(data: any, metrics: string[]) {
    const processed: any = {}
    
    // Revenue metrics
    if (metrics.includes('revenue')) {
      processed.revenue = {
        total: data.revenue.reduce((sum, r) => sum + r.amount, 0),
        byCategory: this.groupByCategory(data.revenue),
        byMonth: this.groupByMonth(data.revenue),
        averagePerTransaction: this.calculateAveragePerTransaction(data.revenue)
      }
    }
    
    // Expense metrics
    if (metrics.includes('expenses')) {
      processed.expenses = {
        total: data.expenses.reduce((sum, e) => sum + e.amount, 0),
        byCategory: this.groupByCategory(data.expenses),
        byMonth: this.groupByMonth(data.expenses),
        topCategories: this.getTopExpenseCategories(data.expenses)
      }
    }
    
    // Profit metrics
    if (metrics.includes('profit')) {
      const totalRevenue = data.revenue.reduce((sum, r) => sum + r.amount, 0)
      const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0)
      
      processed.profit = {
        total: totalRevenue - totalExpenses,
        margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
        trend: this.calculateProfitTrend(data.revenue, data.expenses)
      }
    }
    
    return processed
  }
  
  private async generateFinancialInsights(data: any) {
    const insights = []
    
    // Revenue insights
    if (data.revenue) {
      const revenueGrowth = this.calculateRevenueGrowth(data.revenue.byMonth)
      insights.push({
        type: 'revenue_growth',
        title: 'Revenue Growth',
        description: \`Revenue is \${revenueGrowth > 0 ? 'growing' : 'declining'} by \${Math.abs(revenueGrowth)}%\`,
        value: revenueGrowth,
        trend: revenueGrowth > 0 ? 'up' : 'down'
      })
    }
    
    // Profit insights
    if (data.profit) {
      insights.push({
        type: 'profitability',
        title: 'Profit Margin',
        description: \`Current profit margin is \${data.profit.margin.toFixed(1)}%\`,
        value: data.profit.margin,
        benchmark: 20 // 20% benchmark
      })
    }
    
    return insights
  }
  
  private generateFinancialCharts(data: any, metrics: string[]) {
    const charts = []
    
    if (metrics.includes('revenue')) {
      charts.push({
        type: 'line',
        title: 'Revenue Trend',
        data: Object.entries(data.revenue.byMonth).map(([month, amount]) => ({
          month,
          revenue: amount
        })),
        xAxis: 'month',
        yAxis: 'revenue',
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (context) => \`Revenue: ฿\${context.parsed.y.toLocaleString()}\`
              }
            }
          }
        }
      })
    }
    
    if (metrics.includes('expenses')) {
      charts.push({
        type: 'pie',
        title: 'Expense Breakdown',
        data: Object.entries(data.expenses.byCategory).map(([category, amount]) => ({
          category,
          amount
        })),
        xAxis: 'category',
        yAxis: 'amount',
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            tooltip: {
              callbacks: {
                label: (context) => \`\${context.label}: ฿\${context.parsed.toLocaleString()}\`
              }
            }
          }
        }
      })
    }
    
    return charts
  }
  
  // Helper methods
  private groupByCategory(transactions: any[]) {
    return transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {})
  }
  
  private groupByMonth(transactions: any[]) {
    return transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + transaction.amount
      return acc
    }, {})
  }
  
  private calculateAveragePerTransaction(transactions: any[]) {
    if (transactions.length === 0) return 0
    const total = transactions.reduce((sum, t) => sum + t.amount, 0)
    return total / transactions.length
  }
  
  private getTopExpenseCategories(expenses: any[]) {
    const grouped = this.groupByCategory(expenses)
    return Object.entries(grouped)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))
  }
  
  private calculateProfitTrend(revenue: any[], expenses: any[]) {
    // Calculate profit trend over time
    const revenueByMonth = this.groupByMonth(revenue)
    const expensesByMonth = this.groupByMonth(expenses)
    
    const months = Object.keys({ ...revenueByMonth, ...expensesByMonth }).sort()
    const profits = months.map(month => 
      (revenueByMonth[month] || 0) - (expensesByMonth[month] || 0)
    )
    
    if (profits.length < 2) return 0
    
    const recentProfit = profits[profits.length - 1]
    const previousProfit = profits[profits.length - 2]
    
    return previousProfit !== 0 ? ((recentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0
  }
  
  private calculateRevenueGrowth(revenueByMonth: any) {
    const months = Object.keys(revenueByMonth).sort()
    if (months.length < 2) return 0
    
    const currentMonth = revenueByMonth[months[months.length - 1]]
    const previousMonth = revenueByMonth[months[months.length - 2]]
    
    return previousMonth !== 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0
  }
}

export default FinancialReportGenerator
`

  const patientGenerator = `// Patient Analytics Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { supabase } from '@/lib/supabase'

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
          dateRange,
          filters,
          patientCount: data.patients.length
        },
        data: processedData,
        insights,
        charts: this.generatePatientCharts(processedData, metrics)
      }
    } catch (error) {
      console.error('Failed to generate patient report:', error)
      throw new Error('Patient report generation failed')
    }
  }
  
  private async fetchPatientData(dateRange: any, filters: any) {
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
        .sort(([,a], [,b]) => b - a)[0]
      
      insights.push({
        type: 'demographics',
        title: 'Primary Age Group',
        description: \`Most patients are in the \${dominantAgeGroup[0]} age group\`,
        value: dominantAgeGroup[1],
        category: 'age'
      })
    }
    
    // Treatment insights
    if (data.treatments) {
      insights.push({
        type: 'treatments',
        title: 'Treatment Success',
        description: \`Treatment success rate is \${data.treatments.successRate}%\`,
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
  
  private calculateTreatmentSuccessRate(treatments: any[]) {
    if (treatments.length === 0) return 0
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
        analysis.concerns.forEach(concern => {
          acc[concern] = (acc[concern] || 0) + 1
        })
      }
      return acc
    }, {})
    
    return Object.entries(concerns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([concern, count]) => ({ concern, count }))
  }
  
  private calculateImprovementRate(analyses: any[]) {
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
      .sort(([,a], [,b]) => b - a)
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
`

  // Write generators
  const generators = [
    { file: 'lib/reports/generators/analytics-generator.ts', content: analyticsGenerator },
    { file: 'lib/reports/generators/financial-generator.ts', content: financialGenerator },
    { file: 'lib/reports/generators/patient-generator.ts', content: patientGenerator }
  ]
  
  generators.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create chart components
function createChartComponents() {
  colorLog('\n📈 Creating chart components...', 'cyan')
  
  const chartComponent = `'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }[]
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  title: string
  data: ChartData
  options?: any
  height?: number
  className?: string
}

const defaultColors = [
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
]

const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => defaultColors[i % defaultColors.length])
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}

export function Chart({ type, title, data, options = {}, height = 300, className = '' }: ChartConfig) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    }
  }

  // Ensure data has colors
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || generateColors(dataset.data.length),
      borderColor: dataset.borderColor || generateColors(dataset.data.length)
    }))
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />
      case 'polarArea':
        return <PolarArea data={chartData} options={chartOptions} />
      default:
        return <Line data={chartData} options={chartOptions} />
    }
  }

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 p-4 \${className}\`}>
      <div style={{ height }}>
        {renderChart()}
      </div>
    </div>
  )
}

// Chart utility functions
export const createLineChartData = (labels: string[], datasets: any[]): ChartData => ({
  labels,
  datasets: datasets.map(dataset => ({
    ...dataset,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }))
})

export const createBarChartData = (labels: string[], datasets: any[]): ChartData => ({
  labels,
  datasets: datasets.map(dataset => ({
    ...dataset,
    borderWidth: 0,
    borderRadius: 4
  }))
})

export const createPieChartData = (labels: string[], data: number[]): ChartData => ({
  labels,
  datasets: [{
    data,
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
})

export const formatCurrency = (value: number) => \`฿\${value.toLocaleString('th-TH')}\`

export const formatPercentage = (value: number) => \`\${value.toFixed(1)}%\`

export default Chart
`

  const dashboardComponent = `'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Chart, ChartConfig, createLineChartData, createBarChartData, createPieChartData } from './chart'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'
import { ReportData } from '@/types/reports'

export interface DashboardProps {
  reportData: ReportData
  onRefresh?: () => void
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
  onDateRangeChange?: (range: any) => void
  onFilterChange?: (filters: any) => void
}

export function ReportDashboard({ 
  reportData, 
  onRefresh, 
  onExport, 
  onDateRangeChange, 
  onFilterChange 
}: DashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    onExport?.(format)
  }

  const renderOverview = () => {
    const { data, insights } = reportData

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value.total !== undefined) {
              const trend = insights.find(i => i.type === \`\${key}_growth\`)
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </CardTitle>
                    {trend ? (
                      trend.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{value.total.toLocaleString()}</div>
                    {trend && (
                      <p className={\`text-xs \${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}\`}>
                        {trend.trend === 'up' ? '+' : ''}{trend.value.toFixed(1)}% from last period
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            }
            return null
          })}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Important trends and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                        {insight.trend === 'up' ? 'Positive' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderCharts = () => {
    return (
      <div className="space-y-6">
        {reportData.charts.map((chart, index) => (
          <Chart
            key={index}
            type={chart.type}
            title={chart.title}
            data={chart.data}
            options={chart.config}
            height={400}
          />
        ))}
      </div>
    )
  }

  const renderDetails = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>Comprehensive data breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Report Generated</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(reportData.metadata.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Date Range</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(reportData.metadata.dateRange.startDate).toLocaleDateString()} - {' '}
                    {new Date(reportData.metadata.dateRange.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Summary</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(reportData.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{reportData.metadata.title}</h2>
          <p className="text-gray-600">
            Generated on {new Date(reportData.metadata.generatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={\`h-4 w-4 mr-2 \${isRefreshing ? 'animate-spin' : ''}\`} />
            Refresh
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range)
                  onDateRangeChange?.(range)
                }}
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="charts">
          {renderCharts()}
        </TabsContent>
        
        <TabsContent value="details">
          {renderDetails()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportDashboard
`

  // Write components
  const components = [
    { file: 'components/reports/charts/chart.tsx', content: chartComponent },
    { file: 'components/reports/dashboards/report-dashboard.tsx', content: dashboardComponent }
  ]
  
  components.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create API endpoints
function createAPIEndpoints() {
  colorLog('\n🔌 Creating API endpoints...', 'cyan')
  
  const generateAPI = `// Generate Report API
import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsReportGenerator } from '@/lib/reports/generators/analytics-generator'
import { FinancialReportGenerator } from '@/lib/reports/generators/financial-generator'
import { PatientReportGenerator } from '@/lib/reports/generators/patient-generator'
import { ReportConfig } from '@/types/reports'

const generators = {
  analytics: new AnalyticsReportGenerator(),
  financial: new FinancialReportGenerator(),
  patient: new PatientReportGenerator()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, config } = body

    if (!type || !config) {
      return NextResponse.json(
        { error: 'Report type and config are required' },
        { status: 400 }
      )
    }

    const generator = generators[type as keyof typeof generators]
    if (!generator) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Validate config
    const validatedConfig = validateReportConfig(config)
    
    // Generate report
    const reportData = await generator.generate(validatedConfig)

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Report generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type) {
    return NextResponse.json({
      availableTypes: Object.keys(generators),
      schemas: {
        analytics: getAnalyticsSchema(),
        financial: getFinancialSchema(),
        patient: getPatientSchema()
      }
    })
  }

  const generator = generators[type as keyof typeof generators]
  if (!generator) {
    return NextResponse.json(
      { error: 'Invalid report type' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    type,
    schema: getReportSchema(type)
  })
}

function validateReportConfig(config: any): ReportConfig {
  // Basic validation
  if (!config.title || typeof config.title !== 'string') {
    throw new Error('Title is required and must be a string')
  }

  if (!config.dateRange || !config.dateRange.startDate || !config.dateRange.endDate) {
    throw new Error('Date range with start and end dates is required')
  }

  if (!config.metrics || !Array.isArray(config.metrics) || config.metrics.length === 0) {
    throw new Error('At least one metric is required')
  }

  return {
    title: config.title,
    dateRange: {
      startDate: new Date(config.dateRange.startDate),
      endDate: new Date(config.dateRange.endDate)
    },
    filters: config.filters || {},
    metrics: config.metrics
  }
}

function getAnalyticsSchema() {
  return {
    title: 'Analytics Report',
    description: 'Comprehensive analytics and user behavior report',
    metrics: ['users', 'sessions', 'features'],
    filters: {
      clinic_id: 'string',
      user_type: 'string',
      date_range: 'object'
    }
  }
}

function getFinancialSchema() {
  return {
    title: 'Financial Report',
    description: 'Revenue, expenses, and profit analysis',
    metrics: ['revenue', 'expenses', 'profit'],
    filters: {
      clinic_id: 'string',
      category: 'string',
      date_range: 'object'
    }
  }
}

function getPatientSchema() {
  return {
    title: 'Patient Report',
    description: 'Patient demographics, treatments, and outcomes',
    metrics: ['demographics', 'treatments', 'analyses', 'appointments'],
    filters: {
      clinic_id: 'string',
      age_range: 'object',
      gender: 'string',
      date_range: 'object'
    }
  }
}

function getReportSchema(type: string) {
  const schemas = {
    analytics: getAnalyticsSchema(),
    financial: getFinancialSchema(),
    patient: getPatientSchema()
  }
  return schemas[type as keyof typeof schemas]
}
`

  const exportAPI = `// Export Report API
import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { Parser } from 'json2csv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData, format } = body

    if (!reportData || !format) {
      return NextResponse.json(
        { error: 'Report data and format are required' },
        { status: 400 }
      )
    }

    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case 'pdf':
        fileBuffer = await generatePDF(reportData)
        contentType = 'application/pdf'
        filename = \`\${reportData.metadata.title.replace(/\\s+/g, '_')}.pdf\`
        break

      case 'excel':
        fileBuffer = await generateExcel(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = \`\${reportData.metadata.title.replace(/\\s+/g, '_')}.xlsx\`
        break

      case 'csv':
        fileBuffer = await generateCSV(reportData)
        contentType = 'text/csv'
        filename = \`\${reportData.metadata.title.replace(/\\s+/g, '_')}.csv\`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        )
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': \`attachment; filename="\${filename}"\`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}

async function generatePDF(reportData: any): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text(reportData.metadata.title, 20, 30)
  
  // Metadata
  doc.setFontSize(12)
  doc.text(\`Generated: \${new Date(reportData.metadata.generatedAt).toLocaleString()}\`, 20, 50)
  doc.text(\`Date Range: \${new Date(reportData.metadata.dateRange.startDate).toLocaleDateString()} - \${new Date(reportData.metadata.dateRange.endDate).toLocaleDateString()}\`, 20, 60)
  
  // Data section
  let yPosition = 80
  doc.setFontSize(14)
  doc.text('Report Data', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  Object.entries(reportData.data).forEach(([key, value]) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.text(\`\${key}: \${JSON.stringify(value)}\`, 20, yPosition)
    yPosition += 10
  })
  
  // Insights
  if (reportData.insights && reportData.insights.length > 0) {
    yPosition += 10
    doc.setFontSize(14)
    doc.text('Insights', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    reportData.insights.forEach((insight: any) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(\`• \${insight.title}: \${insight.description}\`, 20, yPosition)
      yPosition += 10
    })
  }
  
  return Buffer.from(doc.output('arraybuffer'))
}

async function generateExcel(reportData: any): Promise<Buffer> {
  const workbook = XLSX.utils.book_new()
  
  // Metadata sheet
  const metadataData = [
    ['Title', reportData.metadata.title],
    ['Generated At', reportData.metadata.generatedAt],
    ['Start Date', reportData.metadata.dateRange.startDate],
    ['End Date', reportData.metadata.dateRange.endDate]
  ]
  
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData)
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')
  
  // Data sheet
  const dataSheet = XLSX.utils.json_to_sheet(flattenObject(reportData.data))
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data')
  
  // Insights sheet
  if (reportData.insights && reportData.insights.length > 0) {
    const insightsSheet = XLSX.utils.json_to_sheet(reportData.insights)
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights')
  }
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(excelBuffer)
}

async function generateCSV(reportData: any): Promise<Buffer> {
  const parser = new Parser()
  const csvData = parser.parse(flattenObject(reportData.data))
  return Buffer.from(csvData, 'utf-8')
}

function flattenObject(obj: any, prefix = ''): any[] {
  const result: any[] = []
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? \`\${prefix}.\${key}\` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        result.push(...flattenObject(obj[key], newKey))
      } else {
        result.push({
          [newKey]: typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key]
        })
      }
    }
  }
  
  return result
}
`

  const analyticsAPI = `// Report Analytics API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period') || '30d'
    const clinicId = searchParams.get('clinic_id')

    let data: any = {}

    switch (type) {
      case 'overview':
        data = await getOverviewData(period, clinicId)
        break
      case 'trends':
        data = await getTrendsData(period, clinicId)
        break
      case 'performance':
        data = await getPerformanceData(period, clinicId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      period,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics API failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function getOverviewData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  // Get user counts
  const { data: users } = await supabase
    .from('users')
    .select('created_at, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get session counts
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('created_at, duration, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get treatment counts
  const { data: treatments } = await supabase
    .from('treatments')
    .select('created_at, status, price, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    users: {
      total: users?.length || 0,
      new: users?.filter(u => isNewUser(u.created_at)).length || 0,
      growth: calculateGrowthRate(users)
    },
    sessions: {
      total: sessions?.length || 0,
      averageDuration: calculateAverageDuration(sessions || []),
      active: calculateActiveUsers(sessions || [])
    },
    treatments: {
      total: treatments?.length || 0,
      completed: treatments?.filter(t => t.status === 'completed').length || 0,
      revenue: calculateTotalRevenue(treatments || [])
    }
  }
}

async function getTrendsData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  // Get daily user counts
  const { data: dailyUsers } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get daily revenue
  const { data: dailyRevenue } = await supabase
    .from('treatments')
    .select('created_at, price')
    .gte('created_at', startDate.toISOString())
    .eq('status', 'completed')
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    users: groupByDay(dailyUsers || []),
    revenue: groupRevenueByDay(dailyRevenue || [])
  }
}

async function getPerformanceData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  // Get feature usage
  const { data: featureUsage } = await supabase
    .from('feature_usage')
    .select('feature, created_at, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get page views
  const { data: pageViews } = await supabase
    .from('page_views')
    .select('page, created_at, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    features: groupFeatureUsage(featureUsage || []),
    pages: groupPageViews(pageViews || []),
    performance: calculatePerformanceMetrics(featureUsage || [], pageViews || [])
  }
}

// Helper functions
function isNewUser(createdAt: string): boolean {
  const userAge = Date.now() - new Date(createdAt).getTime()
  return userAge < 7 * 24 * 60 * 60 * 1000 // Less than 7 days
}

function calculateGrowthRate(users: any[]): number {
  if (users.length < 2) return 0
  
  const midPoint = Math.floor(users.length / 2)
  const firstHalf = users.slice(0, midPoint)
  const secondHalf = users.slice(midPoint)
  
  return ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100
}

function calculateAverageDuration(sessions: any[]): number {
  if (sessions.length === 0) return 0
  const total = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  return total / sessions.length
}

function calculateActiveUsers(sessions: any[]): number {
  const uniqueUsers = new Set(sessions.map(s => s.user_id))
  return uniqueUsers.size
}

function calculateTotalRevenue(treatments: any[]): number {
  return treatments.reduce((sum, t) => sum + (t.price || 0), 0)
}

function groupByDay(items: any[]): any {
  return items.reduce((acc, item) => {
    const day = new Date(item.created_at).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
}

function groupRevenueByDay(treatments: any[]): any {
  return treatments.reduce((acc, treatment) => {
    const day = new Date(treatment.created_at).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + (treatment.price || 0)
    return acc
  }, {})
}

function groupFeatureUsage(usage: any[]): any {
  return usage.reduce((acc, item) => {
    acc[item.feature] = (acc[item.feature] || 0) + 1
    return acc
  }, {})
}

function groupPageViews(views: any[]): any {
  return views.reduce((acc, view) => {
    acc[view.page] = (acc[view.page] || 0) + 1
    return acc
  }, {})
}

function calculatePerformanceMetrics(featureUsage: any[], pageViews: any[]): any {
  return {
    totalInteractions: featureUsage.length + pageViews.length,
    uniqueFeatures: new Set(featureUsage.map(f => f.feature)).size,
    uniquePages: new Set(pageViews.map(p => p.page)).size,
    averageInteractionsPerUser: (featureUsage.length + pageViews.length) / Math.max(
      new Set([...featureUsage.map(f => f.user_id), ...pageViews.map(p => p.user_id)]).size,
      1
    )
  }
}
`

  // Write API endpoints
  const apis = [
    { file: 'app/api/reports/generate/route.ts', content: generateAPI },
    { file: 'app/api/reports/export/route.ts', content: exportAPI },
    { file: 'app/api/reports/analytics/route.ts', content: analyticsAPI }
  ]
  
  apis.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create TypeScript types
function createTypes() {
  colorLog('\n📝 Creating TypeScript types...', 'cyan')
  
  const types = `// Report Types
export interface ReportConfig {
  title: string
  dateRange: {
    startDate: Date
    endDate: Date
  }
  filters?: Record<string, any>
  metrics: string[]
}

export interface ReportData {
  metadata: {
    title: string
    generatedAt: string
    dateRange: {
      startDate: string
      endDate: string
    }
    filters?: Record<string, any>
    totalRecords?: number
    currency?: string
  }
  data: Record<string, any>
  insights: ReportInsight[]
  charts: ChartConfig[]
}

export interface ReportInsight {
  type: string
  title: string
  description: string
  value: number
  trend?: 'up' | 'down' | 'stable'
  benchmark?: number
  category?: string
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  title: string
  data: any
  config?: any
}

export interface ReportGenerator {
  generate(config: ReportConfig): Promise<ReportData>
}

export interface ReportSchedule {
  id: string
  name: string
  type: string
  config: ReportConfig
  frequency: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportExport {
  id: string
  reportId: string
  format: 'pdf' | 'excel' | 'csv'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  createdAt: string
  completedAt?: string
}

export interface ReportFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
  value: any
  label?: string
}

export interface ReportMetric {
  key: string
  label: string
  description: string
  type: 'number' | 'string' | 'boolean' | 'date'
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  config: Partial<ReportConfig>
  metrics: ReportMetric[]
  filters: ReportFilter[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Chart Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }[]
}

export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right'
      labels?: {
        usePointStyle?: boolean
        padding?: number
      }
    }
    tooltip?: {
      backgroundColor?: string
      padding?: number
      cornerRadius?: number
      titleFont?: {
        size?: number
        weight?: string
      }
      bodyFont?: {
        size?: number
      }
      callbacks?: {
        label?: (context: any) => string
      }
    }
    title?: {
      display?: boolean
      text?: string
      font?: {
        size?: number
        weight?: string
      }
      padding?: number
    }
  }
  animation?: {
    duration?: number
    easing?: string
  }
  scales?: {
    x?: {
      beginAtZero?: boolean
    }
    y?: {
      beginAtZero?: boolean
    }
  }
}

// Analytics Types
export interface AnalyticsData {
  users: {
    total: number
    new: number
    returning: number
    active: number
    growth: number
  }
  sessions: {
    total: number
    averageDuration: number
    bounceRate: number
    peakHours: Array<{ hour: number; count: number }>
  }
  revenue?: {
    total: number
    byCategory: Record<string, number>
    byMonth: Record<string, number>
    averagePerTransaction: number
  }
  features?: {
    [feature: string]: {
      count: number
      users: Set<string>
    }
  }
}

// Financial Types
export interface FinancialData {
  revenue: {
    total: number
    byCategory: Record<string, number>
    byMonth: Record<string, number>
    averagePerTransaction: number
  }
  expenses: {
    total: number
    byCategory: Record<string, number>
    byMonth: Record<string, number>
    topCategories: Array<{ category: string; amount: number }>
  }
  profit: {
    total: number
    margin: number
    trend: number
  }
}

// Patient Types
export interface PatientData {
  demographics: {
    ageDistribution: Record<string, number>
    genderDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }
  treatments: {
    total: number
    byType: Record<string, number>
    successRate: number
    averageRevenue: number
  }
  analyses: {
    total: number
    averageScore: number
    commonConcerns: Array<{ concern: string; count: number }>
    improvementRate: number
  }
  appointments: {
    total: number
    showRate: number
    cancellationRate: number
    peakTimes: Array<{ hour: number; count: number }>
  }
}

// Report Builder Types
export interface ReportBuilderConfig {
  name: string
  description: string
  type: string
  dataSource: string
  metrics: string[]
  dimensions: string[]
  filters: ReportFilter[]
  chartType: string
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

export interface DataSource {
  id: string
  name: string
  description: string
  type: 'database' | 'api' | 'file'
  connection: string
  schema: Record<string, any>
  availableMetrics: ReportMetric[]
  availableDimensions: string[]
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeRawData: boolean
  template?: string
  customOptions?: Record<string, any>
}

export interface ExportResult {
  id: string
  format: string
  fileSize: number
  downloadUrl: string
  expiresAt: string
}
`

  // Write types
  const typeFiles = [
    { file: 'types/reports/index.ts', content: types }
  ]
  
  typeFiles.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create configuration
function createConfiguration() {
  colorLog('\n⚙️ Creating configuration...', 'cyan')
  
  const config = `// Advanced Reporting Configuration
export const reportingConfig = {
  // Report Types
  reportTypes: {
    analytics: {
      name: 'Analytics Report',
      description: 'User behavior and platform analytics',
      generator: 'AnalyticsReportGenerator',
      defaultMetrics: ['users', 'sessions', 'features'],
      availableMetrics: [
        { key: 'users', label: 'Users', description: 'User metrics and growth' },
        { key: 'sessions', label: 'Sessions', description: 'Session data and engagement' },
        { key: 'features', label: 'Features', description: 'Feature usage statistics' }
      ]
    },
    financial: {
      name: 'Financial Report',
      description: 'Revenue, expenses, and profit analysis',
      generator: 'FinancialReportGenerator',
      defaultMetrics: ['revenue', 'expenses', 'profit'],
      availableMetrics: [
        { key: 'revenue', label: 'Revenue', description: 'Revenue breakdown and trends' },
        { key: 'expenses', label: 'Expenses', description: 'Expense analysis' },
        { key: 'profit', label: 'Profit', description: 'Profit metrics and margins' }
      ]
    },
    patient: {
      name: 'Patient Report',
      description: 'Patient demographics and treatment analytics',
      generator: 'PatientReportGenerator',
      defaultMetrics: ['demographics', 'treatments', 'analyses'],
      availableMetrics: [
        { key: 'demographics', label: 'Demographics', description: 'Patient demographics' },
        { key: 'treatments', label: 'Treatments', description: 'Treatment statistics' },
        { key: 'analyses', label: 'Analyses', description: 'Skin analysis data' },
        { key: 'appointments', label: 'Appointments', description: 'Appointment metrics' }
      ]
    }
  },

  // Chart Configuration
  charts: {
    defaultColors: [
      '#ec4899', // pink-500
      '#8b5cf6', // violet-500
      '#3b82f6', // blue-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#6366f1', // indigo-500
      '#14b8a6', // teal-500
      '#f97316', // orange-500
      '#84cc16', // lime-500
    ],
    types: {
      line: {
        responsive: true,
        maintainAspectRatio: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      bar: {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 0,
        borderRadius: 4
      },
      pie: {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 2,
        borderColor: '#ffffff'
      },
      doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 2,
        borderColor: '#ffffff'
      },
      radar: {
        responsive: true,
        maintainAspectRatio: false
      },
      polarArea: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },

  // Export Configuration
  export: {
    formats: {
      pdf: {
        enabled: true,
        options: {
          format: 'A4',
          orientation: 'portrait',
          margin: 20,
          includeCharts: true,
          includeRawData: false
        }
      },
      excel: {
        enabled: true,
        options: {
          includeCharts: false,
          includeRawData: true,
          sheetNames: ['Summary', 'Data', 'Insights']
        }
      },
      csv: {
        enabled: true,
        options: {
          includeRawData: true,
          flattenObjects: true
        }
      }
    },
    storage: {
      type: 'local', // 'local' | 's3' | 'azure'
      path: './exports',
      retention: {
        days: 30,
        maxSize: '100MB'
      }
    }
  },

  // Scheduling Configuration
  scheduling: {
    enabled: true,
    frequencies: {
      daily: { cron: '0 8 * * *', description: 'Every day at 8:00 AM' },
      weekly: { cron: '0 8 * * 1', description: 'Every Monday at 8:00 AM' },
      monthly: { cron: '0 8 1 * *', description: 'First day of month at 8:00 AM' }
    },
    retention: {
      reports: 90, // days
      exports: 30  // days
    },
    notifications: {
      enabled: true,
      channels: ['email', 'webhook'],
      templates: {
        report_ready: 'report-ready',
        report_failed: 'report-failed',
        export_ready: 'export-ready'
      }
    }
  },

  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      ttl: 3600, // 1 hour
      maxSize: 100, // number of cached reports
      strategy: 'lru' // 'lru' | 'fifo' | 'lfu'
    },
    limits: {
      maxReportSize: 50, // MB
      maxExportSize: 100, // MB
      maxConcurrentReports: 5,
      maxConcurrentExports: 3
    },
    timeout: {
      reportGeneration: 300000, // 5 minutes
      exportGeneration: 600000  // 10 minutes
    }
  },

  // Security Configuration
  security: {
    permissions: {
      view: ['admin', 'clinic_owner', 'staff'],
      generate: ['admin', 'clinic_owner'],
      export: ['admin', 'clinic_owner'],
      schedule: ['admin', 'clinic_owner'],
      delete: ['admin']
    },
    dataAccess: {
      rowLevelSecurity: true,
      clinicIsolation: true,
      auditLogging: true
    },
    encryption: {
      exports: true,
      sensitiveData: true
    }
  },

  // Integration Configuration
  integrations: {
    email: {
      enabled: true,
      provider: 'resend', // 'resend' | 'sendgrid' | 'ses'
      templates: {
        report_ready: {
          subject: 'Your report is ready',
          template: 'report-ready-template'
        }
      }
    },
    storage: {
      enabled: false,
      provider: 's3', // 's3' | 'azure' | 'gcs'
      bucket: 'beauty-ai-reports',
      region: 'us-east-1'
    },
    webhook: {
      enabled: false,
      urls: [],
      authentication: {
        type: 'bearer', // 'bearer' | 'basic' | 'api_key'
        token: process.env.REPORTING_WEBHOOK_TOKEN
      }
    }
  },

  // UI Configuration
  ui: {
    dashboard: {
      defaultCharts: ['line', 'bar', 'pie'],
      maxChartsPerReport: 10,
      refreshInterval: 30000, // 30 seconds
      autoRefresh: true
    },
    builder: {
      maxMetrics: 20,
      maxFilters: 10,
      maxDimensions: 5,
      previewMode: true
    },
    export: {
      showProgress: true,
      allowCustomOptions: true,
      batchExport: true
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NODE_ENV === 'development',
    mockData: process.env.REPORTING_MOCK_DATA === 'true',
    logLevel: process.env.REPORTING_LOG_LEVEL || 'info',
    profiling: process.env.REPORTING_PROFILING === 'true'
  }
}

export default reportingConfig
`

  // Write configuration
  const configFiles = [
    { file: 'config/reports/index.ts', content: config }
  ]
  
  configFiles.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Update package.json
function updatePackageDependencies() {
  colorLog('\n📦 Updating package.json with reporting dependencies...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add reporting dependencies
    const newDependencies = {
      'chart.js': '^4.4.0',
      'react-chartjs-2': '^5.2.0',
      'jspdf': '^2.5.1',
      'xlsx': '^0.18.5',
      'json2csv': '^6.1.0',
      'date-fns': '^2.30.0',
      'recharts': '^2.8.0'
    }
    
    // Add reporting dev dependencies
    const newDevDependencies = {
      '@types/jspdf': '^2.3.0',
      '@types/json2csv': '^3.0.0'
    }
    
    // Merge dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    }
    
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...newDevDependencies
    }
    
    // Add reporting scripts
    const newScripts = {
      'reports:generate': 'node scripts/reports/generate-reports.js',
      'reports:export': 'node scripts/reports/export-reports.js',
      'reports:cleanup': 'node scripts/reports/cleanup-reports.js',
      'reports:schedule': 'node scripts/reports/schedule-reports.js'
    }
    
    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with reporting dependencies and scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create documentation
function createDocumentation() {
  colorLog('\n📚 Creating documentation...', 'cyan')
  
  const docs = `# Advanced Reporting and Data Visualization

## 📊 Beauty with AI Precision - Reporting System

Comprehensive reporting system with interactive data visualization, automated report generation, and multi-format export capabilities.

### ✨ Key Features

#### 📈 Interactive Data Visualization
- **Multiple Chart Types**: Line, Bar, Pie, Doughnut, Radar, Polar Area
- **Real-time Updates**: Live data refresh and streaming
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Interactive Filters**: Dynamic filtering and drill-down capabilities
- **Export Options**: High-quality chart exports in multiple formats

#### 🤖 Automated Report Generation
- **Scheduled Reports**: Daily, weekly, monthly automated reports
- **Multiple Data Sources**: Analytics, financial, patient data integration
- **Smart Caching**: Performance optimization with intelligent caching
- **Error Handling**: Robust error recovery and retry mechanisms
- **Email Delivery**: Automated report distribution via email

#### 📊 Comprehensive Analytics
- **User Analytics**: User behavior, engagement, and growth metrics
- **Financial Reports**: Revenue, expenses, profit analysis
- **Patient Insights**: Demographics, treatments, outcomes analysis
- **Performance Metrics**: System performance and usage statistics
- **Custom Metrics**: Flexible metric definition and calculation

#### 🔍 Advanced Filtering
- **Date Range Selection**: Flexible date range filtering
- **Multi-dimensional Filters**: Clinic, user, category-based filtering
- **Saved Filters**: Reusable filter configurations
- **Quick Filters**: Pre-defined common filter combinations
- **Dynamic Filtering**: Real-time filter application

## 🛠️ Technical Implementation

### Report Generators
\`\`\`typescript
// Example: Analytics Report Generator
export class AnalyticsReportGenerator implements ReportGenerator {
  async generate(config: ReportConfig): Promise<ReportData> {
    // 1. Fetch data from multiple sources
    const data = await this.fetchAnalyticsData(config.dateRange, config.filters)
    
    // 2. Process and aggregate data
    const processedData = await this.processData(data, config.metrics)
    
    // 3. Generate insights
    const insights = await this.generateInsights(processedData)
    
    // 4. Create chart configurations
    const charts = this.generateChartConfigs(processedData, config.metrics)
    
    return {
      metadata: { /* ... */ },
      data: processedData,
      insights,
      charts
    }
  }
}
\`\`\`

### Chart Components
\`\`\`typescript
// Interactive Chart Component
export function Chart({ type, title, data, options, height }: ChartConfig) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { /* custom tooltip config */ }
    },
    animation: { duration: 1000 }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div style={{ height }}>
        {renderChart(type, data, chartOptions)}
      </div>
    </div>
  )
}
\`\`\`

### API Endpoints
- **POST** \`/api/reports/generate\` - Generate reports
- **POST** \`/api/reports/export\` - Export reports
- **GET** \`/api/reports/analytics\` - Fetch analytics data
- **GET** \`/api/reports/schedule\` - Manage scheduled reports

## 📋 Report Types

### 1. Analytics Reports
**Metrics Available:**
- User growth and engagement
- Session analytics
- Feature usage statistics
- Performance metrics
- Geographic distribution

**Use Cases:**
- Platform usage analysis
- User behavior insights
- Feature adoption tracking
- Performance monitoring

### 2. Financial Reports
**Metrics Available:**
- Revenue breakdown
- Expense analysis
- Profit margins
- Transaction analytics
- Category performance

**Use Cases:**
- Financial planning
- Revenue optimization
- Cost analysis
- Budget tracking

### 3. Patient Reports
**Metrics Available:**
- Demographics analysis
- Treatment statistics
- Skin analysis trends
- Appointment metrics
- Outcome tracking

**Use Cases:**
- Patient care optimization
- Treatment planning
- Service improvement
- Clinical insights

## 🎨 Chart Types and Usage

### Line Charts
**Best for:**
- Time series data
- Trend analysis
- Growth tracking
- Performance over time

**Configuration:**
\`\`\`typescript
{
  type: 'line',
  data: createLineChartData(labels, datasets),
  options: {
    tension: 0.4,
    pointRadius: 4,
    borderWidth: 2
  }
}
\`\`\`

### Bar Charts
**Best for:**
- Category comparisons
- Ranking data
- Distribution analysis
- Volume metrics

**Configuration:**
\`\`\`typescript
{
  type: 'bar',
  data: createBarChartData(labels, datasets),
  options: {
    borderRadius: 4,
    borderWidth: 0
  }
}
\`\`\`

### Pie Charts
**Best for:**
- Proportional data
- Composition analysis
- Percentage breakdown
- Category distribution

**Configuration:**
\`\`\`typescript
{
  type: 'pie',
  data: createPieChartData(labels, data),
  options: {
    borderWidth: 2,
    borderColor: '#ffffff'
  }
}
\`\`\`

## 📤 Export Options

### PDF Export
- **Features**: Professional formatting, charts, headers/footers
- **Use Case**: Executive reports, sharing with stakeholders
- **Options**: Template selection, custom branding

### Excel Export
- **Features**: Multiple sheets, raw data, formulas
- **Use Case**: Data analysis, custom calculations
- **Options**: Sheet organization, data formatting

### CSV Export
- **Features**: Raw data export, flat structure
- **Use Case**: Data import, system integration
- **Options**: Delimiter selection, encoding

## ⚙️ Configuration

### Environment Variables
\`\`\`bash
# Reporting Configuration
REPORTING_ENABLED=true
REPORTING_CACHE_TTL=3600
REPORTING_MAX_REPORT_SIZE=50

# Export Configuration
REPORTING_EXPORT_STORAGE=local
REPORTING_EXPORT_RETENTION_DAYS=30

# Scheduling Configuration
REPORTING_SCHEDULING_ENABLED=true
REPORTING_SCHEDULING_TIMEZONE=Asia/Bangkok

# Email Configuration
REPORTING_EMAIL_ENABLED=true
REPORTING_EMAIL_FROM=reports@beauty-with-ai-precision.com

# Security Configuration
REPORTING_AUDIT_LOGGING=true
REPORTING_ENCRYPTION_ENABLED=true
\`\`\`

### Report Configuration
\`\`\`typescript
export const reportingConfig = {
  reportTypes: {
    analytics: {
      name: 'Analytics Report',
      defaultMetrics: ['users', 'sessions', 'features'],
      availableMetrics: [/* ... */]
    }
  },
  charts: {
    defaultColors: ['#ec4899', '#8b5cf6', '#3b82f6'],
    types: { /* chart configurations */ }
  },
  export: {
    formats: { pdf: {}, excel: {}, csv: {} },
    storage: { type: 'local', path: './exports' }
  }
}
\`\`\`

## 🚀 Performance Optimization

### Caching Strategy
- **Report Caching**: TTL-based caching with LRU eviction
- **Data Caching**: Query result caching for frequently accessed data
- **Chart Caching**: Pre-rendered chart caching for faster loading
- **Export Caching**: Temporary storage for generated exports

### Performance Metrics
- **Generation Time**: < 5 seconds for standard reports
- **Export Time**: < 30 seconds for PDF/Excel exports
- **Cache Hit Rate**: > 80% for frequently accessed reports
- **Memory Usage**: < 100MB for concurrent report generation

### Optimization Techniques
1. **Lazy Loading**: Load chart data on demand
2. **Pagination**: Handle large datasets efficiently
3. **Background Processing**: Async report generation
4. **Resource Pooling**: Reuse database connections
5. **Query Optimization**: Efficient database queries

## 🔒 Security Features

### Access Control
- **Role-based Permissions**: Granular access control
- **Data Isolation**: Clinic-based data separation
- **Audit Logging**: Complete audit trail
- **Session Management**: Secure session handling

### Data Protection
- **Encryption**: Export file encryption
- **Sanitization**: Input validation and sanitization
- **Rate Limiting**: API rate limiting
- **Authentication**: Secure user authentication

## 📱 Mobile Optimization

### Responsive Design
- **Touch-friendly**: Optimized for touch interactions
- **Mobile Layouts**: Adaptive layouts for mobile devices
- **Performance**: Optimized for mobile performance
- **Offline Support**: Basic offline functionality

### Mobile Features
- **Swipe Gestures**: Chart navigation with gestures
- **Touch Tooltips**: Mobile-optimized tooltips
- **Compact Views**: Space-efficient mobile views
- **Quick Actions**: Mobile-optimized quick actions

## 🔍 Troubleshooting

### Common Issues

#### Report Generation Slow
1. Check database query performance
2. Verify caching configuration
3. Review data volume and complexity
4. Optimize data processing logic

#### Chart Not Rendering
1. Verify Chart.js dependencies
2. Check data format and structure
3. Review chart configuration
4. Check browser console for errors

#### Export Fails
1. Verify file system permissions
2. Check export storage configuration
3. Review export format settings
4. Monitor memory usage

#### Scheduled Reports Not Running
1. Verify scheduler configuration
2. Check cron job settings
3. Review error logs
4. Test manual report generation

### Debug Tools
- **Chrome DevTools**: Performance profiling
- **Network Tab**: API request monitoring
- **Console Logs**: Error tracking
- **Memory Profiler**: Memory usage analysis

## 📚 Best Practices

### Report Design
1. **Clear Objectives**: Define clear report goals
2. **Audience Awareness**: Design for target audience
3. **Visual Hierarchy**: Emphasize important data
4. **Consistent Branding**: Use consistent styling
5. **Accessibility**: Ensure accessibility compliance

### Performance
1. **Efficient Queries**: Optimize database queries
2. **Data Pagination**: Handle large datasets
3. **Caching Strategy**: Implement appropriate caching
4. **Background Processing**: Use async processing
5. **Resource Management**: Monitor resource usage

### Security
1. **Input Validation**: Validate all inputs
2. **Access Control**: Implement proper permissions
3. **Data Encryption**: Encrypt sensitive data
4. **Audit Logging**: Log all report activities
5. **Regular Updates**: Keep dependencies updated

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database permissions set
- [ ] File storage configured
- [ ] Email service configured
- [ ] Security settings applied
- [ ] Performance monitoring set up
- [ ] Backup procedures in place
- [ ] Load testing completed

### Scaling Considerations
- **Horizontal Scaling**: Multiple report generation instances
- **Database Scaling**: Read replicas for reporting queries
- **Storage Scaling**: Distributed storage for exports
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Distribute report generation load

## 📞 Support and Resources

### Getting Help
- **Documentation**: Complete API and component documentation
- **Examples**: Sample reports and configurations
- **Best Practices**: Guidelines for report design
- **Support Team**: Technical support and assistance

### Additional Resources
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [React Chart.js 2](https://react-chartjs-2.js.org/)
- [PDF Generation](https://github.com/parallax/jsPDF)
- [Excel Export](https://github.com/SheetJS/sheetjs)

---

**Advanced reporting system provides comprehensive data visualization and analytics capabilities for Beauty with AI Precision platform.**

📊 [Generate Reports Now](/reports)  
📈 [View Analytics](/analytics)  
📤 [Export Data](/export)  
📞 [Get Support](https://support.beauty-with-ai-precision.com)
`

  // Write documentation
  const documentation = [
    { file: 'docs/reports/README.md', content: docs }
  ]
  
  documentation.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Main execution function
async function main() {
  colorLog('📊 Setting up Advanced Reporting with Data Visualization', 'bright')
  colorLog('='.repeat(60), 'cyan')
  
  try {
    createReportingDirectories()
    createReportGenerators()
    createChartComponents()
    createAPIEndpoints()
    createTypes()
    createConfiguration()
    updatePackageDependencies()
    createDocumentation()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Advanced Reporting with Data Visualization setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Install reporting dependencies: pnpm install', 'blue')
    colorLog('2. Configure database connections for report data', 'blue')
    colorLog('3. Set up email service for report delivery', 'blue')
    colorLog('4. Configure export storage and permissions', 'blue')
    colorLog('5. Test report generation and visualization', 'blue')
    
    colorLog('\n📊 Reporting Features Implemented:', 'yellow')
    colorLog('• Interactive data visualization with multiple chart types', 'white')
    colorLog('• Automated report generation and scheduling', 'white')
    colorLog('• Multi-format export (PDF, Excel, CSV)', 'white')
    colorLog('• Real-time analytics and insights generation', 'white')
    colorLog('• Advanced filtering and data exploration', 'white')
    colorLog('• Performance optimization with intelligent caching', 'white')
    
    colorLog('\n📈 Visualization Capabilities:', 'cyan')
    colorLog('• Line charts for time series and trend analysis', 'blue')
    colorLog('• Bar charts for categorical comparisons', 'blue')
    colorLog('• Pie and doughnut charts for proportional data', 'blue')
    colorLog('• Radar charts for multi-dimensional analysis', 'blue')
    colorLog('• Interactive tooltips and drill-down capabilities', 'blue')
    colorLog('• Responsive design for all device types', 'blue')
    
    colorLog('\n🤖 Automation Features:', 'green')
    colorLog('• Scheduled report generation (daily, weekly, monthly)', 'white')
    colorLog('• Email delivery and notification system', 'white')
    colorLog('• Background processing for large reports', 'white')
    colorLog('• Smart caching and performance optimization', 'white')
    colorLog('• Error handling and retry mechanisms', 'white')
    colorLog('• Audit logging and security features', 'white')
    
    colorLog('\n🔧 Developer Tools:', 'magenta')
    colorLog('• TypeScript-based report generators', 'white')
    colorLog('• Configurable chart components with Chart.js', 'white')
    colorLog('• RESTful API endpoints for report operations', 'white')
    colorLog('• Flexible configuration system', 'white')
    colorLog('• Comprehensive documentation and examples', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createReportingDirectories,
  createReportGenerators,
  createChartComponents,
  createAPIEndpoints,
  createTypes,
  createConfiguration,
  updatePackageDependencies,
  createDocumentation
}
