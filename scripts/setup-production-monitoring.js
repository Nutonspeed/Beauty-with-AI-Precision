#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * 
 * Configures Sentry, Vercel Analytics, and custom monitoring
 * for production deployment
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📊 Production Monitoring Setup\n')

// Check if we have required environment variables
function checkEnvironment() {
  console.log('🔍 Checking environment configuration...')
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:')
    missing.forEach(key => console.log(`  - ${key}`))
    console.log('\nPlease set these in .env.local or Vercel dashboard')
    return false
  }
  
  console.log('✅ Environment variables configured')
  return true
}

// Setup Sentry configuration
function setupSentry() {
  console.log('\n🔧 Setting up Sentry error tracking...')
  
  const sentryConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
  }
  
  // Update .env.local with Sentry config
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }
  
  // Add or update Sentry variables
  if (!envContent.includes('NEXT_PUBLIC_SENTRY_DSN=')) {
    envContent += `\n# Sentry Error Tracking\nNEXT_PUBLIC_SENTRY_DSN="${sentryConfig.dsn}"\n`
  }
  
  if (!envContent.includes('NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=')) {
    envContent += `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true\n`
  }
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Sentry configuration added to .env.local')
  
  // Create Sentry configuration file
  const sentryConfigContent = `
// Sentry Configuration for Beauty with AI Precision
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    // Enable browser session replay
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Performance monitoring
    new Sentry.BrowserTracing(),
  ],
  beforeSend(event) {
    // Filter out sensitive data
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('password') || error?.value?.includes('token')) {
        return null // Don't send sensitive errors
      }
    }
    return event
  }
}

// Custom error context
export const setSentryContext = (user, clinic) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      clinic_id: user.clinic_id
    })
    
    window.Sentry.setTags({
      clinic_id: clinic?.id,
      user_role: user.role,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    })
  }
}

// Performance tracking
export const trackSentryPerformance = (name, data) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      message: name,
      level: 'info',
      data
    })
    
    window.Sentry.metrics.increment(name, 1, data)
  }
}
`
  
  const sentryConfigPath = path.join(process.cwd(), 'lib', 'monitoring', 'sentry-config.js')
  if (!fs.existsSync(path.dirname(sentryConfigPath))) {
    fs.mkdirSync(path.dirname(sentryConfigPath), { recursive: true })
  }
  
  fs.writeFileSync(sentryConfigPath, sentryConfigContent)
  console.log('✅ Sentry configuration file created')
}

// Setup Vercel Analytics
function setupVercelAnalytics() {
  console.log('\n📈 Setting up Vercel Analytics...')
  
  // Check if @vercel/analytics is installed
  exec('pnpm list @vercel/analytics', (error, stdout) => {
    if (error) {
      console.log('📥 Installing @vercel/analytics...')
      exec('pnpm add @vercel/analytics', (installError) => {
        if (installError) {
          console.log('❌ Failed to install Vercel Analytics')
        } else {
          console.log('✅ Vercel Analytics installed')
        }
      })
    } else {
      console.log('✅ Vercel Analytics already installed')
    }
  })
  
  // Create analytics configuration
  const analyticsConfig = `
// Vercel Analytics Configuration
// https://vercel.com/docs/concepts/analytics

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export function AnalyticsProvider({ children }) {
  return (
    <>
      {children}
      <Analytics 
        mode={'production'}
        debug={false}
        beforeSend={(event) => {
          // Filter out sensitive data
          if (event.url.includes('/api/') && event.url.includes('token')) {
            return null
          }
          return event
        }}
      />
      <SpeedInsights 
        debug={false}
        routePath={window.location.pathname}
      />
    </>
  )
}

// Custom events tracking
export const trackAnalyticsEvent = (name, data) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', name, data)
  }
}

// Speed insights
export const trackPageSpeed = (metric) => {
  if (typeof window !== 'undefined' && window.si) {
    window.si(metric)
  }
}
`
  
  const analyticsConfigPath = path.join(process.cwd(), 'lib', 'monitoring', 'vercel-analytics.js')
  fs.writeFileSync(analyticsConfigPath, analyticsConfig)
  console.log('✅ Vercel Analytics configuration created')
}

// Setup custom monitoring dashboard
function setupCustomMonitoring() {
  console.log('\n🎛️  Setting up custom monitoring dashboard...')
  
  const dashboardConfig = `
// Custom Monitoring Dashboard Configuration
// Real-time metrics and health monitoring

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/server'

export function useMonitoringData() {
  const [data, setData] = useState({
    health: {},
    metrics: {},
    errors: [],
    performance: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        // Fetch health status
        const healthResponse = await fetch('/api/health')
        const health = await healthResponse.json()
        
        // Fetch performance metrics
        const metricsResponse = await fetch('/api/monitoring/metrics')
        const metrics = await metricsResponse.json()
        
        // Fetch recent errors
        const errorsResponse = await fetch('/api/monitoring/error')
        const errors = await errorsResponse.json()
        
        setData({
          health,
          metrics: metrics.summary || {},
          errors: errors.errors || [],
          performance: {
            score: metrics.summary?.performance_score || 0,
            uptime: health.uptime || 0
          }
        })
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonitoringData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  error_rate: 0.05, // 5%
  response_time: 2000, // 2 seconds
  uptime: 0.99, // 99%
  performance_score: 80
}

// Check if alerts should be triggered
export const checkAlerts = (data) => {
  const alerts = []
  
  const errorRate = data.metrics.api_error_rate || 0
  if (errorRate > ALERT_THRESHOLDS.error_rate) {
    alerts.push({
      type: 'error',
      message: \`High error rate: \${(errorRate * 100).toFixed(2)}%\`,
      severity: 'critical'
    })
  }
  
  const avgResponseTime = data.metrics.api_response_time?.average || 0
  if (avgResponseTime > ALERT_THRESHOLDS.response_time) {
    alerts.push({
      type: 'performance',
      message: \`Slow response time: \${avgResponseTime}ms\`,
      severity: 'warning'
    })
  }
  
  const performanceScore = data.performance.score || 0
  if (performanceScore < ALERT_THRESHOLDS.performance_score) {
    alerts.push({
      type: 'performance',
      message: \`Low performance score: \${performanceScore}/100\`,
      severity: 'warning'
    })
  }
  
  return alerts
}
`
  
  const dashboardConfigPath = path.join(process.cwd(), 'lib', 'monitoring', 'dashboard.js')
  fs.writeFileSync(dashboardConfigPath, dashboardConfig)
  console.log('✅ Custom monitoring dashboard configuration created')
}

// Create monitoring dashboard component
function createDashboardComponent() {
  console.log('\n📊 Creating monitoring dashboard component...')
  
  const dashboardComponent = `
'use client'

import { useMonitoringData, checkAlerts, ALERT_THRESHOLDS } from '@/lib/monitoring/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default function MonitoringDashboard() {
  const { data, loading } = useMonitoringData()
  const alerts = checkAlerts(data)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production Monitoring</h1>
        <div className="flex items-center space-x-2">
          {data.health.status === 'healthy' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm">
            {data.health.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={\`p-3 rounded-lg flex items-center space-x-2 \${
                alert.severity === 'critical' 
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }\`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.score || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {ALERT_THRESHOLDS.performance_score}+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.api_response_time?.average || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Target: < {ALERT_THRESHOLDS.response_time}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.metrics.api_error_rate || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: < {ALERT_THRESHOLDS.error_rate * 100}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.errors?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      {data.errors?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{error.error_message}</div>
                  <div className="text-gray-500">
                    {new Date(error.timestamp).toLocaleString()} - {error.url}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
`
  
  const dashboardComponentPath = path.join(process.cwd(), 'app', 'admin', 'monitoring', 'page.tsx')
  const dashboardDir = path.dirname(dashboardComponentPath)
  
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true })
  }
  
  fs.writeFileSync(dashboardComponentPath, dashboardComponent)
  console.log('✅ Monitoring dashboard component created')
}

// Create monitoring setup documentation
function createMonitoringDocs() {
  console.log('\n📖 Creating monitoring documentation...')
  
  const docs = `
# Production Monitoring Setup

## 📊 Overview

Beauty with AI Precision includes comprehensive production monitoring with:

- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: User analytics and speed insights  
- **Custom Dashboard**: Real-time metrics and health monitoring

## 🔧 Configuration

### 1. Sentry Setup

1. Create Sentry account at https://sentry.io
2. Create new project for Next.js
3. Copy DSN to environment variables:
   \`\`\`
   NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
   NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
   \`\`\`

### 2. Vercel Analytics

1. Enable in Vercel dashboard: Project Settings > Analytics
2. Install package:
   \`\`\`bash
   pnpm add @vercel/analytics
   \`\`\`

### 3. Custom Monitoring

Access dashboard at: \`/admin/monitoring\`

## 📈 Metrics Tracked

### Performance Metrics
- Page load time
- API response time
- Bundle size
- Core Web Vitals

### Error Metrics  
- JavaScript errors
- API failures
- Database errors
- AI service errors

### Business Metrics
- User sessions
- AI analysis usage
- Feature adoption
- Conversion rates

## 🚨 Alerting

### Automatic Alerts
- Error rate > 5%
- Response time > 2s
- Performance score < 80
- Service downtime

### Manual Alert Setup
1. Configure Sentry alerts
2. Set up Vercel notifications
3. Configure custom webhook alerts

## 🔍 Monitoring Dashboard

Access at: \`/admin/monitoring\`

Features:
- Real-time health status
- Performance metrics
- Error tracking
- Alert management

## 📱 Mobile Monitoring

- Crash reporting
- Performance tracking
- User session analysis
- Device-specific metrics

## 🔧 Troubleshooting

### Common Issues
1. **Sentry not receiving errors**: Check DSN configuration
2. **Analytics not tracking**: Verify Vercel Analytics enabled
3. **Custom dashboard empty**: Check API endpoints

### Debug Mode
Enable debug monitoring:
\`\`\`
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
DEBUG=true
\`\`\`

## 📊 Reporting

### Daily Reports
- Error summary
- Performance metrics
- Usage statistics

### Weekly Reports  
- Trend analysis
- User behavior insights
- System health overview

## 🔄 Maintenance

### Regular Tasks
- Review error patterns
- Update alert thresholds
- Clean up old data
- Monitor costs

### Performance Optimization
- Monitor bundle size
- Track database queries
- Analyze user flows
- Optimize images
`
  
  const docsPath = path.join(process.cwd(), 'docs', 'MONITORING_SETUP.md')
  fs.writeFileSync(docsPath, docs)
  console.log('✅ Monitoring documentation created')
}

// Main setup function
async function setup() {
  try {
    console.log('🚀 Setting up production monitoring...\n')
    
    // Check environment
    const envOk = checkEnvironment()
    if (!envOk) return
    
    // Setup components
    setupSentry()
    setupVercelAnalytics()
    setupCustomMonitoring()
    createDashboardComponent()
    createMonitoringDocs()
    
    console.log('\n✅ Production monitoring setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Get Sentry DSN from https://sentry.io')
    console.log('2. Set NEXT_PUBLIC_SENTRY_DSN in environment')
    console.log('3. Enable Vercel Analytics in dashboard')
    console.log('4. Deploy and test monitoring')
    console.log('5. Access dashboard at /admin/monitoring')
    
    console.log('\n📖 Documentation: docs/MONITORING_SETUP.md')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setup()
