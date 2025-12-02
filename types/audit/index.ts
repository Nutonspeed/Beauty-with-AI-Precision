// Audit Type Definitions
export interface AuditEvent {
  id?: string
  timestamp: string
  userId?: string
  clinicId?: string
  sessionId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  metadata?: {
    userAgent?: string
    ipAddress?: string
    requestId?: string
    path?: string
    method?: string
    statusCode?: number
    responseTime?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string
  tags?: string[]
}

export interface AuditFilter {
  userId?: string
  clinicId?: string
  action?: string
  resource?: string
  severity?: AuditEvent['severity'][]
  category?: AuditEvent['category'][]
  result?: AuditEvent['result'][]
  dateRange?: [string, string]
  tags?: string[]
  search?: string
}

export interface AuditQuery {
  filter?: AuditFilter
  pagination?: {
    from?: number
    size?: number
    sort?: string
  }
  aggregations?: {
    actions?: boolean
    users?: boolean
    resources?: boolean
    severity?: boolean
    timeline?: boolean
  }
}

export interface AuditQueryResult {
  events: AuditEvent[]
  total: number
  hasMore: boolean
}

export interface AuditStatistics {
  total: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  byAction: Record<string, number>
  byResource: Record<string, number>
  byResult: Record<string, number>
  timeline: Record<string, number>
}

export interface AuditConfig {
  enabled: boolean
  buffer: {
    enabled: boolean
    maxSize: number
    flushInterval: number
  }
  retention: {
    days: number
    cleanupEnabled: boolean
  }
  archive: {
    enabled: boolean
    thresholdDays: number
    storageLocation: string
  }
  security: {
    encryptSensitiveData: boolean
    sanitizePII: boolean
    requireAuth: boolean
  }
  performance: {
    maxQuerySize: number
    queryTimeout: number
    indexOptimization: boolean
  }
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
  }
  notifications: {
    enabled: boolean
    criticalEvents: boolean
    emailEndpoint?: string
    slackWebhook?: string
  }
  categories: {
    auth: string[]
    data: string[]
    system: string[]
    security: string[]
    business: string[]
    compliance: string[]
  }
  resources: {
    users: string[]
    patients: string[]
    treatments: string[]
    appointments: string[]
    payments: string[]
    reports: string[]
  }
  severity: {
    low: string[]
    medium: string[]
    high: string[]
    critical: string[]
  }
  exclusions: {
    paths: string[]
    methods: string[]
    users: string[]
    resources: string[]
  }
}

export interface AuditMiddlewareOptions {
  excludePaths?: string[]
  excludeMethods?: string[]
  logRequestBody?: boolean
  logResponseBody?: boolean
  sanitizeData?: boolean
}

export interface AuditExportOptions {
  format?: 'json' | 'csv'
  filter?: AuditFilter
  includeMetadata?: boolean
}

export interface AuditReport {
  id: string
  name: string
  description: string
  type: 'summary' | 'detailed' | 'compliance' | 'security'
  filters: AuditFilter
  generatedAt: string
  generatedBy: string
  data: any
}

export interface AuditAlert {
  id: string
  type: 'threshold' | 'pattern' | 'security' | 'compliance'
  severity: AuditEvent['severity']
  condition: any
  enabled: boolean
  notificationChannels: string[]
  lastTriggered?: string
  count: number
}

export interface AuditRetention {
  category: AuditEvent['category']
  severity: AuditEvent['severity']
  retentionDays: number
  archiveAfterDays?: number
}

export interface AuditArchive {
  id: string
  startDate: string
  endDate: string
  eventCount: number
  fileSize: number
  checksum: string
  location: string
  createdAt: string
  createdBy: string
}

export interface AuditCompliance {
  standard: 'GDPR' | 'HIPAA' | 'SOX' | 'ISO27001'
  requirements: {
    id: string
    name: string
    description: string
    mandatory: boolean
    auditFields: string[]
  }[]
  status: 'compliant' | 'non-compliant' | 'partial'
  lastAssessment: string
  nextAssessment: string
}

// Database schema types
export interface AuditLogTable {
  id: string
  timestamp: string
  user_id?: string
  clinic_id?: string
  session_id?: string
  action: string
  resource: string
  resource_id?: string
  details?: any
  metadata?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string
  tags?: string[]
  created_at: string
}

// Event type helpers
export type AuthAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'auth'
  action: 'login' | 'logout' | 'register' | 'password_change' | 'mfa_verify' | 'session_expired'
}

export type DataAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'data'
  action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'import'
}

export type SecurityAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'security'
  action: 'breach_attempt' | 'privilege_escalation' | 'suspicious_activity' | 'blocked_request' | 'rate_limit_exceeded'
}

export type SystemAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'system'
  action: string
}

export type BusinessAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'business'
  action: string
}

export type ComplianceAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'compliance'
  action: string
}

// API response types
export interface AuditAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuditLogsResponse extends AuditAPIResponse<AuditQueryResult> {
  query?: AuditQuery
}

export interface AuditReportsResponse extends AuditAPIResponse<AuditStatistics> {
  filter?: AuditFilter
}

export interface AuditExportResponse extends AuditAPIResponse<string> {
  filename?: string
  format?: string
}
