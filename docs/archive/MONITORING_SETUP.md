# Beauty-with-AI-Precision Monitoring Setup

## 📊 Production Monitoring & Alerting

Complete monitoring setup for healthcare platform operations.

---

## 🎯 Monitoring Objectives

- **System Health**: 99.9% uptime, <2s response times
- **Security**: Real-time threat detection and alerts
- **Performance**: AI processing <3s, page loads <2s
- **Business Metrics**: Appointment bookings, customer satisfaction
- **Compliance**: Audit logging and data protection monitoring

---

## 🔧 Core Monitoring Setup

### 1. Application Performance Monitoring (APM)

#### Sentry Configuration
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // ... next config
}, {
  silent: true,
  org: 'your-org',
  project: 'beauty-ai-precision',
});

// lib/sentry.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

#### Performance Monitoring
```javascript
// app/layout.js or pages/_app.js
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Core Web Vitals tracking
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);

  return <Component {...pageProps} />;
}
```

### 2. Infrastructure Monitoring

#### Health Check Endpoints
```javascript
// app/api/health/route.js
export async function GET() {
  try {
    // Database connectivity
    const dbHealth = await checkDatabaseHealth();

    // External services
    const aiHealth = await checkAIServicesHealth();
    const emailHealth = await checkEmailServiceHealth();

    // System resources
    const systemHealth = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.version,
    };

    const overallHealth = dbHealth && aiHealth && emailHealth ? 'healthy' : 'degraded';

    return Response.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        ai_services: aiHealth ? 'healthy' : 'unhealthy',
        email: emailHealth ? 'healthy' : 'unhealthy',
      },
      system: systemHealth,
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

#### System Metrics
```javascript
// app/api/metrics/route.js
export async function GET() {
  const metrics = {
    // Application metrics
    activeUsers: await getActiveUserCount(),
    apiRequests: await getAPIRequestCount(),
    errorRate: await getErrorRate(),

    // Business metrics
    appointmentsToday: await getTodaysAppointments(),
    aiAnalysesCompleted: await getAIAnalysesCount(),
    revenueToday: await getTodaysRevenue(),

    // Performance metrics
    avgResponseTime: await getAvgResponseTime(),
    cacheHitRate: await getCacheHitRate(),
    dbConnectionPoolUsage: await getDBPoolUsage(),
  };

  return Response.json(metrics);
}
```

### 3. Database Monitoring

#### Query Performance Monitoring
```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor table bloat
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  (n_dead_tup::float / (n_live_tup + n_dead_tup)) * 100 as bloat_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY bloat_ratio DESC;
```

#### Connection Pool Monitoring
```javascript
// lib/database.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Monitor pool health
setInterval(() => {
  console.log('Pool stats:', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
}, 60000);
```

---

## 🚨 Alerting Configuration

### 1. Critical Alerts

#### Application Down Alert
```yaml
# Prometheus Alert Rule
groups:
  - name: beauty-ai-precision
    rules:
      - alert: ApplicationDown
        expr: up{job="beauty-ai-precision"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Beauty-with-AI-Precision application is down"
          description: "Application has been down for more than 5 minutes"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | printf \"%.2f\" }}% over last 5 minutes"
```

#### Database Issues Alert
```yaml
      - alert: DatabaseDown
        expr: pg_up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"

      - alert: HighDBConnections
        expr: pg_stat_activity_count{datname="beauty_ai_precision"} > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"
```

### 2. Performance Alerts

#### Slow Response Times
```yaml
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="beauty-ai-precision"}[5m])) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response times"
          description: "95th percentile response time is {{ $value | printf \"%.2f\" }}s"

      - alert: SlowAIDetection
        expr: rate(ai_processing_duration_seconds{quantile="0.95"}[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow AI processing"
          description: "AI processing is taking {{ $value | printf \"%.2f\" }}s on average"
```

### 3. Business Alerts

#### Low Appointment Bookings
```yaml
      - alert: LowAppointmentBookings
        expr: rate(appointment_bookings_total[1h]) < 1
        for: 2h
        labels:
          severity: info
        annotations:
          summary: "Low appointment booking rate"
          description: "Only {{ $value | printf \"%.2f\" }} appointments booked in last hour"

      - alert: HighCancellationRate
        expr: rate(appointment_cancellations_total[1h]) / rate(appointment_bookings_total[1h]) > 0.3
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "High appointment cancellation rate"
          description: "Cancellation rate is {{ $value | printf \"%.2f\" }}% in last hour"
```

---

## 📈 Custom Metrics & Dashboards

### 1. Business Metrics

#### Appointment Analytics
```javascript
// Track appointment metrics
export async function trackAppointmentMetrics(appointment) {
  // Appointment booking
  metrics.increment('appointment_booked_total', {
    clinic_id: appointment.clinic_id,
    service_type: appointment.service_type,
  });

  // Revenue tracking
  metrics.gauge('appointment_revenue', appointment.price, {
    clinic_id: appointment.clinic_id,
    service_type: appointment.service_type,
  });

  // Customer satisfaction
  if (appointment.satisfaction_rating) {
    metrics.histogram('appointment_satisfaction', appointment.satisfaction_rating, {
      clinic_id: appointment.clinic_id,
    });
  }
}
```

#### AI Performance Tracking
```javascript
// Track AI analysis performance
export async function trackAIPerformance(analysis) {
  const duration = Date.now() - analysis.startTime;

  metrics.histogram('ai_analysis_duration', duration, {
    model: analysis.model,
    analysis_type: analysis.type,
  });

  metrics.increment('ai_analysis_completed_total', {
    model: analysis.model,
    success: analysis.success ? 'true' : 'false',
  });

  if (analysis.accuracy_score) {
    metrics.gauge('ai_analysis_accuracy', analysis.accuracy_score, {
      model: analysis.model,
    });
  }
}
```

### 2. Custom Dashboards

#### Real-time Dashboard
```javascript
// app/dashboard/realtime/page.js
import { useEffect, useState } from 'react';

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers}
        change="+12%"
      />
      <MetricCard
        title="Appointments Today"
        value={metrics.appointmentsToday}
        change="+8%"
      />
      <MetricCard
        title="AI Analyses"
        value={metrics.aiAnalysesCompleted}
        change="+15%"
      />
    </div>
  );
}
```

---

## 🔍 Log Aggregation & Analysis

### 1. Structured Logging

```javascript
// lib/logger.js
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage throughout app
logger.info({ userId, action: 'appointment_booked' }, 'Appointment booked successfully');
logger.error({ err, userId, endpoint: '/api/appointments' }, 'Failed to book appointment');
```

### 2. Log Aggregation

#### Winston + CloudWatch
```javascript
// lib/winston-config.js
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new CloudWatchTransport({
      logGroupName: 'beauty-ai-precision',
      logStreamName: 'application-logs',
      awsRegion: process.env.AWS_REGION,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  ],
});

export default logger;
```

---

## 🔐 Security Monitoring

### 1. Authentication Monitoring

```javascript
// Track authentication events
export async function logAuthEvent(event) {
  logger.info({
    event: 'authentication',
    type: event.type, // 'login', 'logout', 'failed_attempt'
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    success: event.success,
  });

  // Alert on failed attempts
  if (event.type === 'failed_attempt') {
    metrics.increment('auth_failed_attempts_total', {
      ip: event.ip,
      reason: event.reason,
    });
  }
}
```

### 2. Data Access Monitoring

```javascript
// Monitor sensitive data access
export async function logDataAccess(access) {
  logger.info({
    event: 'data_access',
    userId: access.userId,
    resource: access.resource, // 'patient_record', 'financial_data'
    action: access.action, // 'read', 'write', 'delete'
    ip: access.ip,
    timestamp: new Date().toISOString(),
  });

  // Alert on unusual access patterns
  if (access.suspicious) {
    await sendSecurityAlert({
      type: 'suspicious_data_access',
      details: access,
    });
  }
}
```

### 3. Intrusion Detection

```javascript
// Monitor for security threats
export async function detectIntrusion(request) {
  const threats = [];

  // Check for SQL injection patterns
  if (hasSQLInjectionPatterns(request)) {
    threats.push('sql_injection_attempt');
  }

  // Check for XSS patterns
  if (hasXSSPatterns(request)) {
    threats.push('xss_attempt');
  }

  // Check for brute force
  if (await isBruteForceAttempt(request)) {
    threats.push('brute_force_attempt');
  }

  if (threats.length > 0) {
    logger.warn({
      event: 'security_threat',
      threats,
      ip: request.ip,
      endpoint: request.url,
      userAgent: request.headers['user-agent'],
    });

    // Block suspicious IPs
    await blockIP(request.ip, threats);
  }

  return threats;
}
```

---

## 📊 Monitoring Tools Integration

### 1. Vercel Analytics (Built-in)
```javascript
// Automatic metrics collection
// - Page views and performance
// - Core Web Vitals
// - API route performance
// - Error tracking
```

### 2. New Relic Integration
```javascript
// lib/newrelic.js
import newrelic from 'newrelic';

export function trackCustomMetric(name, value, tags = {}) {
  newrelic.recordMetric(name, value, tags);
}

export function trackError(error, customAttributes = {}) {
  newrelic.noticeError(error, customAttributes);
}

// Usage
trackCustomMetric('ai.analysis.duration', duration, {
  model: 'claude-3',
  clinic_id: clinicId,
});
```

### 3. DataDog Integration
```javascript
// lib/datadog.js
import { dogstatsd } from 'datadog-metrics';

export function increment(metric, tags = {}) {
  dogstatsd.increment(metric, tags);
}

export function gauge(metric, value, tags = {}) {
  dogstatsd.gauge(metric, value, tags);
}

export function histogram(metric, value, tags = {}) {
  dogstatsd.histogram(metric, value, tags);
}

// Usage
increment('appointment.booked', {
  clinic_id: clinicId,
  service_type: serviceType,
});
```

---

## 🚨 Incident Response

### 1. Alert Response Procedures

#### Critical Alert Response (Application Down)
1. **Immediate Actions:**
   - Check application status: `pm2 status`
   - Review error logs: `pm2 logs beauty-ai-precision`
   - Attempt restart: `pm2 restart beauty-ai-precision`

2. **Investigation:**
   - Check server resources (CPU, memory, disk)
   - Review recent deployments
   - Check database connectivity
   - Examine external service status

3. **Communication:**
   - Notify development team
   - Update status page
   - Inform customers if outage > 15 minutes

#### Security Incident Response
1. **Containment:**
   - Block suspicious IP addresses
   - Disable compromised accounts
   - Isolate affected systems

2. **Investigation:**
   - Analyze security logs
   - Identify breach scope
   - Determine data exposure

3. **Recovery:**
   - Restore from clean backups
   - Update security measures
   - Monitor for additional threats

### 2. Post-Incident Analysis

```javascript
// Incident tracking
export async function createIncidentReport(incident) {
  const report = {
    id: generateIncidentId(),
    type: incident.type,
    severity: incident.severity,
    startTime: incident.startTime,
    endTime: incident.endTime,
    affectedSystems: incident.affectedSystems,
    rootCause: incident.rootCause,
    resolution: incident.resolution,
    preventiveActions: incident.preventiveActions,
  };

  await saveIncidentReport(report);
  await notifyStakeholders(report);
}
```

---

## 📈 Scaling & Performance Tuning

### 1. Auto-scaling Configuration

#### Vercel Scale Configuration
```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "regions": ["sin1", "hnd1"],
  "minify": true,
  "optimizeFonts": true
}
```

#### Database Scaling
```sql
-- Create read replicas for high-traffic queries
CREATE PUBLICATION beauty_ai_main FOR ALL TABLES;
CREATE SUBSCRIPTION beauty_ai_replica CONNECTION 'host=...' PUBLICATION beauty_ai_main;

-- Implement query result caching
CREATE TABLE query_cache (
  query_hash TEXT PRIMARY KEY,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### 2. Performance Optimization

#### API Response Caching
```javascript
// lib/cache.js
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheResponse(key, data, ttl = 300) {
  await redis.setex(key, ttl, JSON.stringify(data));
}

export async function getCachedResponse(key) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

// Usage in API routes
const cacheKey = `analytics:${clinicId}:${period}`;
let data = await getCachedResponse(cacheKey);

if (!data) {
  data = await fetchAnalyticsData(clinicId, period);
  await cacheResponse(cacheKey, data);
}
```

#### Database Query Optimization
```sql
-- Create optimized indexes
CREATE INDEX CONCURRENTLY idx_appointments_clinic_date_status
ON appointments(clinic_id, appointment_date, status);

CREATE INDEX CONCURRENTLY idx_analyses_customer_created
ON skin_analyses(customer_id, created_at DESC);

-- Implement partial indexes for active records
CREATE INDEX idx_active_appointments
ON appointments(appointment_date, status)
WHERE status IN ('confirmed', 'pending');
```

---

## 📋 Monitoring Checklist

### Daily Monitoring
- [ ] Application uptime and response times
- [ ] Error rates and critical alerts
- [ ] Database performance and connection counts
- [ ] AI service availability and response times
- [ ] Business metrics (appointments, revenue)

### Weekly Monitoring
- [ ] Security scan results and vulnerability assessments
- [ ] Performance trend analysis and optimization opportunities
- [ ] User feedback and satisfaction metrics
- [ ] System resource utilization and capacity planning

### Monthly Monitoring
- [ ] Comprehensive security audit and penetration testing
- [ ] Disaster recovery testing and backup verification
- [ ] Compliance audit (GDPR, HIPAA requirements)
- [ ] Cost optimization and resource efficiency analysis

---

*This monitoring guide ensures 24/7 visibility into system health, performance, and security for the Beauty-with-AI-Precision healthcare platform.*
