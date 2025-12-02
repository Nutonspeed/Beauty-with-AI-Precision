// Report Types
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
