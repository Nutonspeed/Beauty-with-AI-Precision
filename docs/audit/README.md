# Comprehensive Audit Logging System

## 🔍 Enterprise-Grade Audit Trail

Beauty with AI Precision features a comprehensive audit logging system that provides complete visibility into all system activities, ensuring compliance, security, and accountability.

### 🎯 Key Features

#### Complete Activity Tracking
- **User Actions**: Login, logout, data access, modifications
- **System Events**: Configuration changes, errors, restarts
- **Security Events**: Failed attempts, privilege escalation, breaches
- **Business Events**: Appointments, payments, treatments
- **Compliance Events**: Data access, consent, policy acceptance

#### Intelligent Categorization
- **Authentication**: User login, logout, registration, MFA
- **Data Access**: CRUD operations, exports, imports
- **System**: Configuration, errors, maintenance
- **Security**: Threats, breaches, suspicious activity
- **Business**: Clinical operations, financial transactions
- **Compliance**: Regulatory requirements, privacy controls

#### Advanced Filtering & Search
- **Multi-criteria Filtering**: User, resource, date range, severity
- **Full-text Search**: Search across all audit event data
- **Real-time Monitoring**: Live event streaming and alerts
- **Custom Queries**: Complex query building with aggregations

## 🚀 Quick Start

### 1. Enable Audit Logging
```bash
# .env.local
AUDIT_ENABLED=true
AUDIT_BUFFER_ENABLED=true
AUDIT_RETENTION_DAYS=365
```

### 2. Use Audit Logger
```typescript
import { auditLogger } from '@/lib/audit/audit-logger'

// Log authentication event
await auditLogger.logAuth({
  action: 'login',
  userId: 'user-123',
  result: 'success'
})

// Log data access
await auditLogger.logDataAccess({
  action: 'read',
  resource: 'patient',
  resourceId: 'patient-456',
  userId: 'user-123',
  result: 'success'
})

// Log security event
await auditLogger.logSecurity({
  action: 'suspicious_activity',
  userId: 'user-789',
  details: { reason: 'multiple_failed_attempts' },
  result: 'failure'
})
```

### 3. Query Audit Logs
```bash
# Get all audit events
curl "http://localhost:3000/api/audit/logs"

# Filter by user and date range
curl "http://localhost:3000/api/audit/logs?userId=user-123&startDate=2023-01-01&endDate=2023-12-31"

# Get statistics
curl "http://localhost:3000/api/audit/reports"
```

## 📋 Audit Event Structure

### Core Fields
```typescript
interface AuditEvent {
  id: string              // Unique event identifier
  timestamp: string        // ISO timestamp
  userId?: string         // User who performed the action
  clinicId?: string       // Clinic context
  sessionId?: string      // Session identifier
  action: string          // Action performed
  resource: string        // Resource affected
  resourceId?: string     // Specific resource ID
  details?: object        // Additional event details
  metadata?: object       // Technical metadata
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string          // Source system/component
  tags?: string[]         // Custom tags
}
```

### Metadata Information
```typescript
interface AuditMetadata {
  userAgent?: string      // Client user agent
  ipAddress?: string      // Client IP address
  requestId?: string      // Request correlation ID
  path?: string          // API endpoint path
  method?: string        // HTTP method
  statusCode?: number    // Response status code
  responseTime?: number  // Response time in milliseconds
}
```

## 🔧 API Endpoints

### Query Audit Logs
```bash
GET /api/audit/logs
  ?userId=user-123
  &clinicId=clinic-456
  &action=login
  &resource=patient
  &severity=high,critical
  &category=auth,security
  &result=failure
  &startDate=2023-01-01
  &endDate=2023-12-31
  &search=failed
  &from=0
  &size=50
  &sort=timestamp:desc
```

### Create Custom Audit Event
```bash
POST /api/audit/logs
{
  "action": "custom_action",
  "resource": "custom_resource",
  "userId": "user-123",
  "details": { "custom": "data" },
  "severity": "medium",
  "category": "business",
  "result": "success",
  "source": "custom_app"
}
```

### Get Audit Statistics
```bash
GET /api/audit/reports
  ?userId=user-123
  &clinicId=clinic-456
  &startDate=2023-01-01
  &endDate=2023-12-31
```

### Export Audit Logs
```bash
GET /api/audit/export
  ?format=csv|json
  &userId=user-123
  &startDate=2023-01-01
  &endDate=2023-12-31
```

## 🛠️ Configuration

### Environment Variables
```bash
# Core Settings
AUDIT_ENABLED=true
AUDIT_BUFFER_ENABLED=true
AUDIT_BUFFER_MAX_SIZE=100
AUDIT_BUFFER_FLUSH_INTERVAL=5000

# Retention & Archive
AUDIT_RETENTION_DAYS=365
AUDIT_CLEANUP_ENABLED=true
AUDIT_ARCHIVE_ENABLED=true
AUDIT_ARCHIVE_THRESHOLD_DAYS=90
AUDIT_ARCHIVE_STORAGE=local

# Security
AUDIT_ENCRYPT_SENSITIVE=false
AUDIT_SANITIZE_PII=true
AUDIT_REQUIRE_AUTH=true

# Performance
AUDIT_MAX_QUERY_SIZE=1000
AUDIT_QUERY_TIMEOUT=30000
AUDIT_INDEX_OPTIMIZATION=true

# Compliance
AUDIT_GDPR_COMPLIANT=true
AUDIT_HIPAA_COMPLIANT=true
AUDIT_SOX_COMPLIANT=false

# Notifications
AUDIT_NOTIFICATIONS_ENABLED=false
AUDIT_CRITICAL_NOTIFICATIONS=false
AUDIT_EMAIL_ENDPOINT=
AUDIT_SLACK_WEBHOOK=
```

### Audit Configuration
```typescript
// config/audit/index.ts
export const auditConfig = {
  enabled: true,
  buffer: {
    enabled: true,
    maxSize: 100,
    flushInterval: 5000
  },
  retention: {
    days: 365,
    cleanupEnabled: true
  },
  categories: {
    auth: ['login', 'logout', 'register'],
    data: ['read', 'create', 'update', 'delete'],
    security: ['breach_attempt', 'suspicious_activity'],
    business: ['appointment_booked', 'payment_processed']
  },
  severity: {
    low: ['login', 'read'],
    medium: ['create', 'update'],
    high: ['delete', 'admin_action'],
    critical: ['security_breach', 'data_loss']
  }
}
```

## 📊 Audit Categories

### Authentication Events
- **Login**: User authentication attempts
- **Logout**: User session termination
- **Register**: New user account creation
- **Password Change**: Password modification requests
- **MFA Verify**: Multi-factor authentication
- **Session Expired**: Automatic session termination

### Data Access Events
- **Read**: Data retrieval operations
- **Create**: New data creation
- **Update**: Data modification
- **Delete**: Data removal
- **Export**: Data export operations
- **Import**: Data import operations

### Security Events
- **Breach Attempt**: Security violation attempts
- **Privilege Escalation**: Unauthorized access attempts
- **Suspicious Activity**: Anomalous behavior detection
- **Blocked Request**: Malicious request blocking
- **Rate Limit Exceeded**: API rate limiting violations

### System Events
- **Startup**: System initialization
- **Shutdown**: System termination
- **Restart**: System restart operations
- **Error**: System errors and exceptions
- **Configuration Change**: System configuration updates

### Business Events
- **Appointment Booked**: Patient appointment scheduling
- **Payment Processed**: Financial transaction completion
- **Treatment Completed**: Medical procedure completion
- **Report Generated**: Business report creation

### Compliance Events
- **Data Access**: Compliance-related data access
- **Consent Given**: Patient consent recording
- **Policy Accepted**: Policy agreement confirmation
- **Audit Request**: Compliance audit requests

## 🔒 Security & Compliance

### Data Protection
- **PII Sanitization**: Automatic sensitive data masking
- **Encryption**: Optional data encryption for sensitive events
- **Access Control**: Role-based audit log access
- **Immutable Logs**: Tamper-evident audit trail

### Regulatory Compliance
- **GDPR**: Right to access and delete audit data
- **HIPAA**: Protected health information auditing
- **SOX**: Financial transaction auditing
- **ISO 27001**: Information security management

### Privacy Controls
- **Data Minimization**: Collect only necessary audit data
- **Retention Policies**: Automatic data cleanup and archiving
- **Consent Tracking**: Patient consent audit trail
- **Anonymization**: Data anonymization for long-term storage

## 📈 Performance Optimization

### Buffering Strategy
- **Event Buffering**: Batch processing for high-volume scenarios
- **Async Processing**: Non-blocking audit event logging
- **Flush Intervals**: Configurable buffer flush timing
- **Memory Management**: Efficient buffer size management

### Database Optimization
- **Index Strategy**: Optimized database indexes for queries
- **Partitioning**: Time-based table partitioning
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Database connection management

### Caching Layer
- **Query Caching**: Frequent query result caching
- **Statistics Caching**: Pre-computed audit statistics
- **Metadata Caching**: User and session metadata caching
- **Cache Invalidation**: Smart cache refresh strategies

## 🛠️ Management Scripts

### Cleanup Old Logs
```bash
# Delete logs older than 365 days
pnpm audit:cleanup

# Custom retention period
pnpm audit:cleanup --days 90

# Dry run (show what would be deleted)
pnpm audit:cleanup --dry-run
```

### Archive Historical Data
```bash
# Archive logs older than 90 days
pnpm audit:archive

# Custom archive threshold
pnpm audit:archive --days 180

# Dry run (show what would be archived)
pnpm audit:archive --dry-run
```

### View Statistics
```bash
# Show audit log statistics
pnpm audit:stats
```

## 📊 Monitoring & Analytics

### Real-time Monitoring
- **Live Dashboard**: Real-time audit event visualization
- **Alert System**: Automatic notifications for critical events
- **Pattern Detection**: AI-powered anomaly detection
- **Performance Metrics**: Audit system performance monitoring

### Business Intelligence
- **User Activity**: User behavior analysis and insights
- **Resource Usage**: Resource access patterns and trends
- **Security Insights**: Security threat analysis and trends
- **Compliance Reports**: Automated compliance reporting

### Custom Reports
- **Scheduled Reports**: Automated report generation
- **Custom Filters**: User-defined report criteria
- **Export Formats**: Multiple export format support
- **Report Templates**: Pre-built report templates

## 🔍 Advanced Features

### Event Correlation
- **Session Tracking**: Complete user session audit trail
- **Request Tracing**: End-to-end request correlation
- **Causal Chains**: Event relationship mapping
- **Timeline Views**: Chronological event visualization

### Machine Learning
- **Anomaly Detection**: Unusual activity pattern identification
- **Risk Scoring**: Event risk assessment and scoring
- **Predictive Analytics**: Security threat prediction
- **Behavioral Analysis**: User behavior profiling

### Integration Capabilities
- **SIEM Integration**: Security information and event management
- **Log Aggregation**: Centralized log management
- **API Integration**: Third-party system integration
- **Webhook Support**: Real-time event notifications

## 🛠️ Troubleshooting

### Common Issues

#### Missing Audit Events
1. Check audit logging is enabled
2. Verify buffer configuration
3. Review database connectivity
4. Check system permissions

#### Slow Query Performance
1. Review database indexes
2. Optimize query parameters
3. Check buffer flush intervals
4. Monitor system resources

#### High Memory Usage
1. Reduce buffer size
2. Adjust flush intervals
3. Monitor event volume
4. Review retention policies

### Debugging Tools
- **Query Profiler**: Analyze query performance
- **Event Tracer**: Track event flow
- **Buffer Monitor**: Monitor buffer status
- **Performance Metrics**: System performance data

## 📞 Support and Resources

### Getting Help
- **Documentation**: Complete audit system documentation
- **API Reference**: Detailed API documentation
- **Best Practices**: Audit logging guidelines
- **Support Team**: Technical support and assistance

### Additional Resources
- [Security Guidelines](./security.md)
- [Compliance Documentation](./compliance.md)
- [Performance Tuning](./performance.md)
- [Integration Guide](./integration.md)

---

**Comprehensive audit logging ensures complete visibility, compliance, and security for Beauty with AI Precision platform.**

🔍 [Start Auditing Now](../audit/)  
📊 [View Reports](./reports.md)  
🔧 [Configure System](./configuration.md)  
📞 [Get Support](https://support.beauty-with-ai-precision.com)
