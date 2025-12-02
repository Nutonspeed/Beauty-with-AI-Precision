// Advanced Reporting Configuration
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
