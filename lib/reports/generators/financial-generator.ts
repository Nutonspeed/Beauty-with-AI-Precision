// Financial Report Generator
import { ReportGenerator, ReportConfig, ReportData } from '@/types/reports'
import { createServiceClient } from '@/lib/supabase/server'

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
          dateRange: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          },
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
    const supabase = createServiceClient()
    
    // Fetch revenue data
    const { data: revenueData } = await supabase
      .from('revenue')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch expense data
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    // Fetch transaction data
    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(filters)
    
    return {
      revenue: revenueData || [],
      expenses: expenseData || [],
      transactions: transactionData || []
    }
  }
  
  private async processFinancialData(data: any, metrics: string[]) {
    const processed: any = {}
    
    // Revenue metrics
    if (metrics.includes('revenue')) {
      processed.revenue = {
        total: data.revenue.reduce((sum: number, r: any) => sum + r.amount, 0),
        byCategory: this.groupByCategory(data.revenue),
        byMonth: this.groupByMonth(data.revenue),
        averagePerTransaction: this.calculateAveragePerTransaction(data.revenue)
      }
    }
    
    // Expense metrics
    if (metrics.includes('expenses')) {
      processed.expenses = {
        total: data.expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        byCategory: this.groupByCategory(data.expenses),
        byMonth: this.groupByMonth(data.expenses),
        topCategories: this.getTopExpenseCategories(data.expenses)
      }
    }
    
    // Profit metrics
    if (metrics.includes('profit')) {
      const totalRevenue = data.revenue.reduce((sum: number, r: any) => sum + r.amount, 0)
      const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
      
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
        description: `Revenue is ${revenueGrowth > 0 ? 'growing' : 'declining'} by ${Math.abs(revenueGrowth)}%`,
        value: revenueGrowth,
        trend: (revenueGrowth > 0 ? 'up' : 'down') as 'up' | 'down' | 'stable'
      })
    }
    
    // Profit insights
    if (data.profit) {
      insights.push({
        type: 'profitability',
        title: 'Profit Margin',
        description: `Current profit margin is ${data.profit.margin.toFixed(1)}%`,
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
        type: 'line' as const,
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
                label: (context: any) => `Revenue: ฿${context.parsed.y.toLocaleString()}`
              }
            }
          }
        }
      })
    }
    
    if (metrics.includes('expenses')) {
      charts.push({
        type: 'pie' as const,
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
                label: (context: any) => `${context.label}: ฿${context.parsed.toLocaleString()}`
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
    return transactions.reduce((acc: Record<string, number>, transaction: any) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)
  }
  
  private groupByMonth(transactions: any[]) {
    return transactions.reduce((acc: Record<string, number>, transaction: any) => {
      const month = new Date(transaction.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)
  }
  
  private calculateAveragePerTransaction(transactions: any[]) {
    if (transactions.length === 0) return 0
    const total = transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    return total / transactions.length
  }
  
  private getTopExpenseCategories(expenses: any[]) {
    const grouped = this.groupByCategory(expenses)
    return Object.entries(grouped)
      .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))
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
