// Performance Monitoring Configuration
export const monitoringConfig = {
  // Metrics collection
  metrics: {
    enabled: true,
    collectionInterval: 30000, // 30 seconds
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    maxMetrics: 10000,
    
    // Performance thresholds
    thresholds: {
      responseTime: {
        warning: 5000,  // 5 seconds
        critical: 10000 // 10 seconds
      },
      errorRate: {
        warning: 5,   // 5%
        critical: 10  // 10%
      },
      memoryUsage: {
        warning: 80,  // 80%
        critical: 90  // 90%
      },
      cpuUsage: {
        warning: 80,  // 80%
        critical: 90  // 90%
      }
    }
  },

  // Alerting
  alerts: {
    enabled: true,
    cooldownPeriod: 300000, // 5 minutes
    maxAlerts: 1000,
    
    // Notification channels
    channels: {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        from: process.env.ALERT_EMAIL_FROM || 'alerts@beauty-with-ai-precision.com',
        to: process.env.ALERT_EMAIL_TO?.split(',') || [],
        smtp: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL || '#alerts'
      },
      webhook: {
        enabled: !!process.env.WEBHOOK_URL,
        url: process.env.WEBHOOK_URL,
        token: process.env.WEBHOOK_TOKEN
      }
    },

    // Alert rules
    rules: [
      {
        id: 'slow-response',
        name: 'Slow API Response',
        condition: 'responseTime > threshold',
        threshold: 5000,
        severity: 'WARNING',
        enabled: true,
        notifications: ['email', 'slack', 'webhook']
      },
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        condition: 'memoryPercentage > threshold',
        threshold: 80,
        severity: 'WARNING',
        enabled: true,
        notifications: ['email', 'slack']
      },
      {
        id: 'high-cpu',
        name: 'High CPU Usage',
        condition: 'cpuUsage > threshold',
        threshold: 80,
        severity: 'WARNING',
        enabled: true,
        notifications: ['email', 'slack']
      },
      {
        id: 'error-rate',
        name: 'High Error Rate',
        condition: 'errorRate > threshold',
        threshold: 5,
        severity: 'ERROR',
        enabled: true,
        notifications: ['email', 'slack', 'webhook']
      }
    ]
  },

  // Health checks
  health: {
    enabled: true,
    checkInterval: 60000, // 1 minute
    timeout: 10000,      // 10 seconds
    
    checks: {
      database: {
        enabled: true,
        timeout: 5000,
        query: 'SELECT 1'
      },
      redis: {
        enabled: true,
        timeout: 3000,
        command: 'PING'
      },
      ai_services: {
        enabled: true,
        timeout: 10000,
        endpoints: [
          '/api/ai/health',
          '/api/analysis/health'
        ]
      },
      disk: {
        enabled: true,
        threshold: 90 // 90% usage
      }
    }
  },

  // Performance optimization
  optimization: {
    enabled: true,
    
    // Automatic scaling
    scaling: {
      enabled: false,
      minInstances: 1,
      maxInstances: 10,
      scaleUpThreshold: 80,
      scaleDownThreshold: 30,
      cooldownPeriod: 300000
    },

    // Cache management
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60000 // 1 minute
    },

    // Connection pooling
    connectionPool: {
      database: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000
      },
      redis: {
        min: 1,
        max: 5,
        idleTimeoutMillis: 30000
      }
    }
  },

  // Reporting
  reporting: {
    enabled: true,
    
    // Automated reports
    automated: {
      enabled: true,
      schedule: '0 9 * * *', // Daily at 9 AM
      recipients: process.env.REPORT_RECIPIENTS?.split(',') || [],
      formats: ['html', 'pdf']
    },

    // Report types
    types: [
      'performance_summary',
      'error_analysis',
      'usage_statistics',
      'system_health'
    ]
  },

  // Integration
  integration: {
    // External monitoring services
    services: {
      sentry: {
        enabled: !!process.env.SENTRY_DSN,
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development'
      },
      datadog: {
        enabled: !!process.env.DATADOG_API_KEY,
        apiKey: process.env.DATADOG_API_KEY,
        site: process.env.DATADOG_SITE || 'datadoghq.com'
      },
      newrelic: {
        enabled: !!process.env.NEWRELIC_LICENSE_KEY,
        licenseKey: process.env.NEWRELIC_LICENSE_KEY,
        appName: 'beauty-ai-precision'
      }
    },

    // Custom webhooks
    webhooks: [
      {
        name: 'performance-alerts',
        url: process.env.PERFORMANCE_WEBHOOK_URL,
        events: ['slow_response', 'high_error_rate', 'system_overload']
      },
      {
        name: 'health-status',
        url: process.env.HEALTH_WEBHOOK_URL,
        events: ['service_down', 'service_recovered']
      }
    ]
  },

  // Security
  security: {
    // Rate limiting for monitoring endpoints
    rateLimit: {
      enabled: true,
      windowMs: 60000, // 1 minute
      max: 100         // 100 requests per minute
    },

    // Authentication for monitoring APIs
    auth: {
      enabled: process.env.MONITORING_AUTH_ENABLED === 'true',
      token: process.env.MONITORING_AUTH_TOKEN
    },

    // Data retention policies
    retention: {
      metrics: 7 * 24 * 60 * 60 * 1000,    // 7 days
      alerts: 30 * 24 * 60 * 60 * 1000,   // 30 days
      logs: 90 * 24 * 60 * 60 * 1000      // 90 days
    }
  }
}

export default monitoringConfig
