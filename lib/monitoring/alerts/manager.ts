// Alert System for Performance Monitoring

export interface Alert {
  id: string
  type: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  message: string
  timestamp: number
  service: string
  metadata: Record<string, any>
  resolved: boolean
  resolvedAt?: number
  resolvedBy?: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  enabled: boolean
  threshold: number
  duration: number
  notifications: {
    email: boolean
    sms: boolean
    slack: boolean
    webhook: boolean
  }
  cooldown: number
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'sms' | 'slack' | 'webhook'
  config: Record<string, any>
  enabled: boolean
}

class AlertManager {
  private alerts: Alert[] = []
  private rules: AlertRule[] = []
  private channels: NotificationChannel[] = []
  private alertHistory: Alert[] = []
  private maxAlerts = 1000
  private maxHistory = 10000

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultChannels()
  }

  // Initialize default alert rules
  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'slow-response',
        name: 'Slow API Response',
        description: 'Alert when API response time exceeds threshold',
        condition: 'responseTime > threshold',
        severity: 'WARNING',
        enabled: true,
        threshold: 5000,
        duration: 60000,
        notifications: {
          email: true,
          sms: false,
          slack: true,
          webhook: true
        },
        cooldown: 300000
      },
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds threshold',
        condition: 'memoryPercentage > threshold',
        severity: 'WARNING',
        enabled: true,
        threshold: 80,
        duration: 300000,
        notifications: {
          email: true,
          sms: false,
          slack: true,
          webhook: true
        },
        cooldown: 600000
      },
      {
        id: 'high-cpu',
        name: 'High CPU Usage',
        description: 'Alert when CPU usage exceeds threshold',
        condition: 'cpuUsage > threshold',
        severity: 'WARNING',
        enabled: true,
        threshold: 80,
        duration: 300000,
        notifications: {
          email: true,
          sms: false,
          slack: true,
          webhook: true
        },
        cooldown: 600000
      },
      {
        id: 'error-rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds threshold',
        condition: 'errorRate > threshold',
        severity: 'ERROR',
        enabled: true,
        threshold: 5,
        duration: 300000,
        notifications: {
          email: true,
          sms: true,
          slack: true,
          webhook: true
        },
        cooldown: 900000
      },
      {
        id: 'database-connection',
        name: 'Database Connection Issues',
        description: 'Alert when database connections are high',
        condition: 'dbConnections > threshold',
        severity: 'CRITICAL',
        enabled: true,
        threshold: 80,
        duration: 60000,
        notifications: {
          email: true,
          sms: true,
          slack: true,
          webhook: true
        },
        cooldown: 300000
      }
    ]
  }

  // Initialize default notification channels
  private initializeDefaultChannels() {
    this.channels = [
      {
        id: 'email',
        type: 'email',
        config: {
          smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          },
          from: process.env.ALERT_EMAIL_FROM || 'alerts@beauty-with-ai-precision.com',
          to: process.env.ALERT_EMAIL_TO?.split(',') || []
        },
        enabled: true
      },
      {
        id: 'slack',
        type: 'slack',
        config: {
          webhook: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL || '#alerts'
        },
        enabled: !!process.env.SLACK_WEBHOOK_URL
      },
      {
        id: 'webhook',
        type: 'webhook',
        config: {
          url: process.env.WEBHOOK_URL,
          headers: {
            'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`,
            'Content-Type': 'application/json'
          }
        },
        enabled: !!process.env.WEBHOOK_URL
      }
    ]
  }

  // Create new alert
  async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) {
    const alert: Alert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: Date.now(),
      resolved: false
    }

    // Check if similar alert already exists and is within cooldown
    const existingAlert = this.findSimilarAlert(alert)
    if (existingAlert && this.isInCooldown(existingAlert)) {
      return existingAlert
    }

    this.alerts.push(alert)
    this.alertHistory.push(alert)

    // Keep arrays manageable
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts)
    }
    if (this.alertHistory.length > this.maxHistory) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistory)
    }

    // Send notifications
    await this.sendNotifications(alert)

    return alert
  }

  // Find similar existing alert
  private findSimilarAlert(newAlert: Alert) {
    return this.alerts.find(alert => 
      alert.type === newAlert.type &&
      alert.severity === newAlert.severity &&
      !alert.resolved &&
      (Date.now() - alert.timestamp) < 3600000 // Within last hour
    )
  }

  // Check if alert is in cooldown period
  private isInCooldown(alert: Alert) {
    const rule = this.rules.find(r => r.id === alert.type)
    if (!rule) return false
    
    return (Date.now() - alert.timestamp) < rule.cooldown
  }

  // Send notifications for alert
  private async sendNotifications(alert: Alert) {
    const rule = this.rules.find(r => r.id === alert.type)
    if (!rule) return

    const notifications = []

    if (rule.notifications.email) {
      notifications.push(this.sendEmailNotification(alert))
    }

    if (rule.notifications.slack) {
      notifications.push(this.sendSlackNotification(alert))
    }

    if (rule.notifications.webhook) {
      notifications.push(this.sendWebhookNotification(alert))
    }

    await Promise.allSettled(notifications)
  }

  // Send email notification
  private async sendEmailNotification(alert: Alert) {
    try {
      const channel = this.channels.find(c => c.type === 'email' && c.enabled)
      if (!channel) return

      const emailContent = this.generateEmailContent(alert)
      
      // This would use your email service (e.g., Resend, Nodemailer)
      console.log('Email notification sent:', emailContent)
      
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  // Send Slack notification
  private async sendSlackNotification(alert: Alert) {
    try {
      const channel = this.channels.find(c => c.type === 'slack' && c.enabled)
      if (!channel) return

      const slackPayload = {
        text: `🚨 ${alert.severity} Alert: ${alert.message}`,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: 'Service',
                value: alert.service,
                short: true
              },
              {
                title: 'Time',
                value: new Date(alert.timestamp).toISOString(),
                short: true
              },
              {
                title: 'Type',
                value: alert.type,
                short: true
              },
              {
                title: 'Severity',
                value: alert.severity,
                short: true
              }
            ]
          }
        ]
      }

      const response = await fetch(channel.config.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackPayload)
      })

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`)
      }
      
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  // Send webhook notification
  private async sendWebhookNotification(alert: Alert) {
    try {
      const channel = this.channels.find(c => c.type === 'webhook' && c.enabled)
      if (!channel) return

      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: channel.config.headers,
        body: JSON.stringify({
          alert,
          timestamp: Date.now(),
          service: 'beauty-ai-precision'
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook notification failed: ${response.statusText}`)
      }
      
    } catch (error) {
      console.error('Failed to send webhook notification:', error)
    }
  }

  // Generate email content
  private generateEmailContent(alert: Alert) {
    const severityColors = {
      INFO: '#17a2b8',
      WARNING: '#ffc107',
      ERROR: '#dc3545',
      CRITICAL: '#6f42c1'
    }

    return {
      subject: `[${alert.severity}] Beauty AI Precision Alert: ${alert.type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColors[alert.severity]}; color: white; padding: 20px; text-align: center;">
            <h1>🚨 ${alert.severity} Alert</h1>
            <p>${alert.type}</p>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2>${alert.message}</h2>
            <p><strong>Service:</strong> ${alert.service}</p>
            <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            ${Object.keys(alert.metadata).length > 0 ? `
              <h3>Details:</h3>
              <ul>
                ${Object.entries(alert.metadata).map(([key, value]) => 
                  `<li><strong>${key}:</strong> ${value}</li>`
                ).join('')}
              </ul>
            ` : ''}
          </div>
          <div style="padding: 20px; text-align: center; background: #e9ecef;">
            <p>This alert was generated by Beauty with AI Precision monitoring system.</p>
            <p><a href="https://beauty-with-ai-precision.com/monitoring">View Dashboard</a></p>
          </div>
        </div>
      `
    }
  }

  // Get severity color for Slack
  private getSeverityColor(severity: string) {
    const colors = {
      INFO: '#17a2b8',
      WARNING: '#ffc107',
      ERROR: '#dc3545',
      CRITICAL: '#6f42c1'
    }
    return colors[severity as keyof typeof colors] || '#6c757d'
  }

  // Resolve alert
  resolveAlert(alertId: string, resolvedBy: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      alert.resolvedBy = resolvedBy
    }
    return alert
  }

  // Get active alerts
  getActiveAlerts() {
    return this.alerts.filter(alert => !alert.resolved)
  }

  // Get alert history
  getAlertHistory(limit?: number) {
    let history = [...this.alertHistory].sort((a, b) => b.timestamp - a.timestamp)
    if (limit) {
      history = history.slice(0, limit)
    }
    return history
  }

  // Get alert statistics
  getAlertStats(timeRange?: { start: number; end: number }) {
    let alerts = this.alertHistory

    if (timeRange) {
      alerts = alerts.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      )
    }

    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const typeCounts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: alerts.length,
      active: this.getActiveAlerts().length,
      resolved: alerts.filter(a => a.resolved).length,
      bySeverity: severityCounts,
      byType: typeCounts,
      timeRange
    }
  }

  // Generate alert ID
  private generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Update alert rule
  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId)
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
      return this.rules[ruleIndex]
    }
    return null
  }

  // Get alert rules
  getRules() {
    return this.rules
  }

  // Get notification channels
  getChannels() {
    return this.channels
  }

  // Update notification channel
  updateChannel(channelId: string, updates: Partial<NotificationChannel>) {
    const channelIndex = this.channels.findIndex(c => c.id === channelId)
    if (channelIndex !== -1) {
      this.channels[channelIndex] = { ...this.channels[channelIndex], ...updates }
      return this.channels[channelIndex]
    }
    return null
  }
}

// Global alert manager instance
export const alertManager = new AlertManager()

export default AlertManager
