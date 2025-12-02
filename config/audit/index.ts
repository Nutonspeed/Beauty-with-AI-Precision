// Audit Configuration
export const auditConfig = {
  // General settings
  enabled: process.env.AUDIT_ENABLED !== 'false',
  
  // Buffer settings for performance
  buffer: {
    enabled: process.env.AUDIT_BUFFER_ENABLED !== 'false',
    maxSize: parseInt(process.env.AUDIT_BUFFER_MAX_SIZE || '100'),
    flushInterval: parseInt(process.env.AUDIT_BUFFER_FLUSH_INTERVAL || '5000')
  },
  
  // Retention settings
  retention: {
    days: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
    cleanupEnabled: process.env.AUDIT_CLEANUP_ENABLED !== 'false'
  },
  
  // Archive settings
  archive: {
    enabled: process.env.AUDIT_ARCHIVE_ENABLED !== 'false',
    thresholdDays: parseInt(process.env.AUDIT_ARCHIVE_THRESHOLD_DAYS || '90'),
    storageLocation: process.env.AUDIT_ARCHIVE_STORAGE || 'local'
  },
  
  // Security settings
  security: {
    encryptSensitiveData: process.env.AUDIT_ENCRYPT_SENSITIVE === 'true',
    sanitizePII: process.env.AUDIT_SANITIZE_PII !== 'false',
    requireAuth: process.env.AUDIT_REQUIRE_AUTH !== 'false'
  },
  
  // Performance settings
  performance: {
    maxQuerySize: parseInt(process.env.AUDIT_MAX_QUERY_SIZE || '1000'),
    queryTimeout: parseInt(process.env.AUDIT_QUERY_TIMEOUT || '30000'),
    indexOptimization: process.env.AUDIT_INDEX_OPTIMIZATION !== 'false'
  },
  
  // Compliance settings
  compliance: {
    gdpr: process.env.AUDIT_GDPR_COMPLIANT !== 'false',
    hipaa: process.env.AUDIT_HIPAA_COMPLIANT !== 'false',
    sox: process.env.AUDIT_SOX_COMPLIANT !== 'false'
  },
  
  // Notification settings
  notifications: {
    enabled: process.env.AUDIT_NOTIFICATIONS_ENABLED === 'true',
    criticalEvents: process.env.AUDIT_CRITICAL_NOTIFICATIONS === 'true',
    emailEndpoint: process.env.AUDIT_EMAIL_ENDPOINT,
    slackWebhook: process.env.AUDIT_SLACK_WEBHOOK
  },
  
  // Categories to audit
  categories: {
    auth: ['login', 'logout', 'register', 'password_change', 'mfa_verify'],
    data: ['read', 'create', 'update', 'delete', 'export', 'import'],
    system: ['startup', 'shutdown', 'restart', 'error', 'configuration_change'],
    security: ['breach_attempt', 'privilege_escalation', 'suspicious_activity'],
    business: ['appointment_booked', 'payment_processed', 'treatment_completed'],
    compliance: ['data_access', 'consent_given', 'policy_accepted']
  },
  
  // Resources to audit
  resources: {
    users: ['create', 'read', 'update', 'delete'],
    patients: ['create', 'read', 'update', 'delete', 'export'],
    treatments: ['create', 'read', 'update', 'delete'],
    appointments: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete', 'export']
  },
  
  // Severity levels
  severity: {
    low: ['login', 'read', 'view'],
    medium: ['create', 'update', 'export'],
    high: ['delete', 'admin_action', 'privilege_change'],
    critical: ['security_breach', 'data_loss', 'system_compromise']
  },
  
  // Exclusions
  exclusions: {
    paths: ['/health', '/metrics', '/_next', '/api/health', '/static'],
    methods: ['GET', 'HEAD', 'OPTIONS'],
    users: ['system', 'health_check'],
    resources: ['cache', 'logs', 'temp']
  }
}

export default auditConfig
