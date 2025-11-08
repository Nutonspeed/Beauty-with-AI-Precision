/**
 * Security Manager
 * 
 * Comprehensive security and compliance system with:
 * - HIPAA compliance features
 * - Audit logging
 * - Data encryption/decryption
 * - Role-based access control (RBAC)
 * - Session management
 * - Security monitoring
 * - Compliance reporting
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// User & Authentication Types
export type UserRole = "super_admin" | "admin" | "doctor" | "nurse" | "receptionist" | "patient" | "customer"
export type AuthMethod = "password" | "2fa" | "biometric" | "sso" | "api_key"
export type SessionStatus = "active" | "expired" | "revoked" | "locked"

// Permission Types
export type Resource = 
  | "patients" | "treatments" | "appointments" | "medical_records" 
  | "prescriptions" | "billing" | "reports" | "analytics" 
  | "staff" | "inventory" | "settings" | "audit_logs"
  | "campaigns" | "segments" | "workflows"

export type Action = "create" | "read" | "update" | "delete" | "export" | "print" | "share"

// Audit & Compliance Types
export type AuditEventType = 
  | "login" | "logout" | "login_failed" | "password_change" | "password_reset"
  | "data_access" | "data_create" | "data_update" | "data_delete" | "data_export"
  | "permission_change" | "role_change" | "session_expired" | "session_revoked"
  | "compliance_violation" | "security_alert" | "policy_change"
  | "phi_access" | "phi_export" | "phi_print" | "phi_share"

export type RiskLevel = "low" | "medium" | "high" | "critical"
export type ComplianceStatus = "compliant" | "warning" | "violation" | "under_review"

// Encryption Types
export type EncryptionAlgorithm = "AES-256-GCM" | "RSA-2048" | "RSA-4096"
export type DataClassification = "public" | "internal" | "confidential" | "phi" | "pii"

// Security Alert Types
export type AlertType = 
  | "unauthorized_access" | "multiple_failed_logins" | "suspicious_activity"
  | "data_breach" | "compliance_violation" | "policy_violation"
  | "unusual_data_access" | "after_hours_access" | "geo_anomaly"

// ============================================================================
// INTERFACES
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  permissions: Permission[]
  mfaEnabled: boolean
  lastLogin?: Date
  loginAttempts: number
  accountLocked: boolean
  accountLockedUntil?: Date
  passwordLastChanged?: Date
  passwordExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  resource: Resource
  action: Action
  conditions?: PermissionCondition[]
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
}

export interface PermissionCondition {
  field: string
  operator: "equals" | "not_equals" | "in" | "not_in" | "contains"
  value: string | string[]
}

export interface Session {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  authMethod: AuthMethod
  status: SessionStatus
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  revokedAt?: Date
  revokedBy?: string
  revokedReason?: string
}

export interface GeoLocation {
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
}

export interface AuditLog {
  id: string
  eventType: AuditEventType
  userId: string
  userName: string
  userRole: UserRole
  sessionId: string
  resource?: Resource
  resourceId?: string
  action?: Action
  details: Record<string, unknown>
  ipAddress: string
  userAgent: string
  location?: GeoLocation
  riskLevel: RiskLevel
  phiAccessed: boolean
  dataClassification?: DataClassification
  timestamp: Date
  duration?: number
}

export interface SecurityAlert {
  id: string
  type: AlertType
  severity: RiskLevel
  userId?: string
  userName?: string
  sessionId?: string
  description: string
  details: Record<string, unknown>
  ipAddress?: string
  location?: GeoLocation
  relatedAuditLogs: string[]
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  resolution?: string
  createdAt: Date
}

export interface ComplianceReport {
  id: string
  reportType: "hipaa" | "pdpa" | "gdpr" | "sox" | "custom"
  period: {
    start: Date
    end: Date
  }
  status: ComplianceStatus
  findings: ComplianceFinding[]
  recommendations: string[]
  generatedBy: string
  generatedByName: string
  generatedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
}

export interface ComplianceFinding {
  id: string
  category: string
  requirement: string
  status: ComplianceStatus
  description: string
  evidence: string[]
  remediationSteps?: string[]
  dueDate?: Date
  assignedTo?: string
  resolvedAt?: Date
}

export interface EncryptedData {
  algorithm: EncryptionAlgorithm
  ciphertext: string
  iv: string
  authTag: string
  timestamp: Date
}

export interface DataAccessRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterRole: UserRole
  resource: Resource
  resourceId: string
  action: Action
  justification: string
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: Date
  deniedBy?: string
  deniedAt?: Date
  denialReason?: string
  expiresAt?: Date
  accessGranted: boolean
  createdAt: Date
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // days
  preventReuse: number // number of previous passwords
  lockoutThreshold: number // failed attempts
  lockoutDuration: number // minutes
}

export interface SecurityMetrics {
  totalUsers: number
  activeUsers: number
  lockedAccounts: number
  activeSessions: number
  expiredSessions: number
  revokedSessions: number
  auditLogs24h: number
  securityAlerts: {
    total: number
    unresolved: number
    bySeverity: Record<RiskLevel, number>
  }
  complianceStatus: ComplianceStatus
  phiAccessCount: number
  failedLoginAttempts: number
  suspiciousActivities: number
  lastSecurityAudit?: Date
  nextScheduledAudit?: Date
}

// ============================================================================
// SECURITY MANAGER CLASS
// ============================================================================

class SecurityManager {
  private static instance: SecurityManager
  
  // Data stores (in production, these would be database tables)
  private users: Map<string, User> = new Map()
  private sessions: Map<string, Session> = new Map()
  private auditLogs: Map<string, AuditLog> = new Map()
  private securityAlerts: Map<string, SecurityAlert> = new Map()
  private complianceReports: Map<string, ComplianceReport> = new Map()
  private accessRequests: Map<string, DataAccessRequest> = new Map()
  
  // Security configuration
  private passwordPolicy: PasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    preventReuse: 5,
    lockoutThreshold: 5,
    lockoutDuration: 30,
  }
  
  // Role-based permissions
  private rolePermissions: Map<UserRole, Permission[]> = new Map()
  
  private constructor() {
    this.initializeRolePermissions()
    this.initializeSampleData()
  }
  
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }
  
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================
  
  createUser(data: Omit<User, "id" | "createdAt" | "updatedAt" | "loginAttempts" | "accountLocked">): User {
    const user: User = {
      ...data,
      id: `USR${Date.now()}`,
      loginAttempts: 0,
      accountLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.users.set(user.id, user)
    
    // Audit log
    this.logAudit({
      eventType: "data_create",
      userId: "SYSTEM",
      userName: "System",
      userRole: "super_admin",
      sessionId: "SYSTEM",
      resource: "staff",
      resourceId: user.id,
      action: "create",
      details: { userEmail: user.email, userRole: user.role },
      ipAddress: "127.0.0.1",
      userAgent: "System",
      riskLevel: "low",
      phiAccessed: false,
    })
    
    return user
  }
  
  getUser(userId: string): User | undefined {
    return this.users.get(userId)
  }
  
  getAllUsers(filters?: {
    role?: UserRole
    department?: string
    accountLocked?: boolean
  }): User[] {
    let users = Array.from(this.users.values())
    
    if (filters?.role) {
      users = users.filter(u => u.role === filters.role)
    }
    
    if (filters?.department) {
      users = users.filter(u => u.department === filters.department)
    }
    
    if (filters?.accountLocked !== undefined) {
      users = users.filter(u => u.accountLocked === filters.accountLocked)
    }
    
    return users
  }
  
  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(userId)
    if (!user) return undefined
    
    const updatedUser = {
      ...user,
      ...updates,
      id: user.id, // Prevent ID change
      updatedAt: new Date(),
    }
    
    this.users.set(userId, updatedUser)
    
    // Audit log for role/permission changes
    if (updates.role || updates.permissions) {
      this.logAudit({
        eventType: updates.role ? "role_change" : "permission_change",
        userId: userId,
        userName: user.name,
        userRole: user.role,
        sessionId: "ADMIN",
        resource: "staff",
        resourceId: userId,
        action: "update",
        details: { 
          oldRole: user.role, 
          newRole: updates.role,
          permissionsUpdated: !!updates.permissions,
        },
        ipAddress: "127.0.0.1",
        userAgent: "Admin",
        riskLevel: "medium",
        phiAccessed: false,
      })
    }
    
    return updatedUser
  }
  
  lockAccount(userId: string, duration: number = 30): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    const lockedUntil = new Date()
    lockedUntil.setMinutes(lockedUntil.getMinutes() + duration)
    
    this.updateUser(userId, {
      accountLocked: true,
      accountLockedUntil: lockedUntil,
      loginAttempts: 0,
    })
    
    // Revoke all active sessions
    this.revokeUserSessions(userId, "account_locked")
    
    return true
  }
  
  unlockAccount(userId: string): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    this.updateUser(userId, {
      accountLocked: false,
      accountLockedUntil: undefined,
      loginAttempts: 0,
    })
    
    return true
  }
  
  // ============================================================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ============================================================================
  
  createSession(data: {
    userId: string
    authMethod: AuthMethod
    ipAddress: string
    userAgent: string
    location?: GeoLocation
  }): Session | null {
    const user = this.users.get(data.userId)
    if (!user || user.accountLocked) {
      return null
    }
    
    // Check for account lock expiration
    if (user.accountLockedUntil && new Date() > user.accountLockedUntil) {
      this.unlockAccount(user.id)
    } else if (user.accountLocked) {
      return null
    }
    
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000) // 8 hours
    
    const session: Session = {
      id: `SES${Date.now()}`,
      userId: data.userId,
      userName: user.name,
      userRole: user.role,
      authMethod: data.authMethod,
      status: "active",
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      createdAt: now,
      lastActivity: now,
      expiresAt: expiresAt,
    }
    
    this.sessions.set(session.id, session)
    
    // Update user last login
    this.updateUser(data.userId, {
      lastLogin: now,
      loginAttempts: 0,
    })
    
    // Audit log
    this.logAudit({
      eventType: "login",
      userId: data.userId,
      userName: user.name,
      userRole: user.role,
      sessionId: session.id,
      details: { authMethod: data.authMethod },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      riskLevel: "low",
      phiAccessed: false,
    })
    
    // Check for geo anomaly
    this.checkGeoAnomaly(user.id, data.location)
    
    return session
  }
  
  validateSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    
    const now = new Date()
    
    // Check if expired
    if (now > session.expiresAt) {
      this.expireSession(sessionId)
      return null
    }
    
    // Check if revoked
    if (session.status !== "active") {
      return null
    }
    
    // Update last activity
    session.lastActivity = now
    this.sessions.set(sessionId, session)
    
    return session
  }
  
  expireSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    session.status = "expired"
    this.sessions.set(sessionId, session)
    
    // Audit log
    this.logAudit({
      eventType: "session_expired",
      userId: session.userId,
      userName: session.userName,
      userRole: session.userRole,
      sessionId: sessionId,
      details: { duration: Date.now() - session.createdAt.getTime() },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      riskLevel: "low",
      phiAccessed: false,
    })
    
    return true
  }
  
  revokeSession(sessionId: string, revokedBy: string, reason: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    session.status = "revoked"
    session.revokedAt = new Date()
    session.revokedBy = revokedBy
    session.revokedReason = reason
    this.sessions.set(sessionId, session)
    
    // Audit log
    this.logAudit({
      eventType: "session_revoked",
      userId: session.userId,
      userName: session.userName,
      userRole: session.userRole,
      sessionId: sessionId,
      details: { revokedBy, reason },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      riskLevel: "medium",
      phiAccessed: false,
    })
    
    return true
  }
  
  revokeUserSessions(userId: string, reason: string): number {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.status === "active")
    
    sessions.forEach(session => {
      this.revokeSession(session.id, "SYSTEM", reason)
    })
    
    return sessions.length
  }
  
  handleFailedLogin(userId: string, ipAddress: string, userAgent: string): void {
    const user = this.users.get(userId)
    if (!user) return
    
    const attempts = user.loginAttempts + 1
    this.updateUser(userId, { loginAttempts: attempts })
    
    // Audit log
    this.logAudit({
      eventType: "login_failed",
      userId: userId,
      userName: user.name,
      userRole: user.role,
      sessionId: "N/A",
      details: { attempts },
      ipAddress: ipAddress,
      userAgent: userAgent,
      riskLevel: attempts >= this.passwordPolicy.lockoutThreshold ? "high" : "medium",
      phiAccessed: false,
    })
    
    // Lock account if threshold reached
    if (attempts >= this.passwordPolicy.lockoutThreshold) {
      this.lockAccount(userId, this.passwordPolicy.lockoutDuration)
      
      // Create security alert
      this.createSecurityAlert({
        type: "multiple_failed_logins",
        severity: "high",
        userId: userId,
        userName: user.name,
        description: `Account locked after ${attempts} failed login attempts`,
        details: { attempts, ipAddress, userAgent },
        ipAddress: ipAddress,
      })
    }
  }
  
  // ============================================================================
  // PERMISSION & ACCESS CONTROL
  // ============================================================================
  
  hasPermission(
    userId: string,
    resource: Resource,
    action: Action,
    context?: Record<string, unknown>
  ): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    // Check user-specific permissions
    const userPermission = user.permissions.find(
      p => p.resource === resource && p.action === action
    )
    
    if (userPermission) {
      // Check if expired
      if (userPermission.expiresAt && new Date() > userPermission.expiresAt) {
        return false
      }
      
      // Check conditions
      if (userPermission.conditions && context) {
        return this.evaluateConditions(userPermission.conditions, context)
      }
      
      return true
    }
    
    // Check role-based permissions
    const rolePermissions = this.rolePermissions.get(user.role) || []
    const rolePermission = rolePermissions.find(
      p => p.resource === resource && p.action === action
    )
    
    return !!rolePermission
  }
  
  private evaluateConditions(
    conditions: PermissionCondition[],
    context: Record<string, unknown>
  ): boolean {
    return conditions.every(condition => {
      const contextValue = context[condition.field]
      
      switch (condition.operator) {
        case "equals":
          return contextValue === condition.value
        case "not_equals":
          return contextValue !== condition.value
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(contextValue as string)
        case "not_in":
          return Array.isArray(condition.value) && !condition.value.includes(contextValue as string)
        case "contains":
          return String(contextValue).includes(String(condition.value))
        default:
          return false
      }
    })
  }
  
  grantPermission(
    userId: string,
    resource: Resource,
    action: Action,
    grantedBy: string,
    expiresAt?: Date,
    conditions?: PermissionCondition[]
  ): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    const permission: Permission = {
      id: `PRM${Date.now()}`,
      resource,
      action,
      conditions,
      grantedBy,
      grantedAt: new Date(),
      expiresAt,
    }
    
    user.permissions.push(permission)
    this.updateUser(userId, { permissions: user.permissions })
    
    return true
  }
  
  revokePermission(userId: string, permissionId: string): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    const updatedPermissions = user.permissions.filter(p => p.id !== permissionId)
    this.updateUser(userId, { permissions: updatedPermissions })
    
    return true
  }
  
  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================
  
  logAudit(data: Omit<AuditLog, "id" | "timestamp">): AuditLog {
    const log: AuditLog = {
      ...data,
      id: `AUD${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    
    this.auditLogs.set(log.id, log)
    
    // Detect suspicious patterns
    this.detectSuspiciousActivity(log)
    
    return log
  }
  
  getAuditLogs(filters?: {
    userId?: string
    eventType?: AuditEventType
    resource?: Resource
    riskLevel?: RiskLevel
    phiAccessed?: boolean
    startDate?: Date
    endDate?: Date
  }): AuditLog[] {
    let logs = Array.from(this.auditLogs.values())
    
    if (filters?.userId) {
      logs = logs.filter(l => l.userId === filters.userId)
    }
    
    if (filters?.eventType) {
      logs = logs.filter(l => l.eventType === filters.eventType)
    }
    
    if (filters?.resource) {
      logs = logs.filter(l => l.resource === filters.resource)
    }
    
    if (filters?.riskLevel) {
      logs = logs.filter(l => l.riskLevel === filters.riskLevel)
    }
    
    if (filters?.phiAccessed !== undefined) {
      logs = logs.filter(l => l.phiAccessed === filters.phiAccessed)
    }
    
    if (filters?.startDate) {
      logs = logs.filter(l => l.timestamp >= filters.startDate!)
    }
    
    if (filters?.endDate) {
      logs = logs.filter(l => l.timestamp <= filters.endDate!)
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
  
  logDataAccess(
    userId: string,
    resource: Resource,
    resourceId: string,
    action: Action,
    sessionId: string,
    phiAccessed: boolean = false
  ): void {
    const user = this.users.get(userId)
    const session = this.sessions.get(sessionId)
    
    if (!user || !session) return
    
    this.logAudit({
      eventType: phiAccessed ? "phi_access" : "data_access",
      userId: userId,
      userName: user.name,
      userRole: user.role,
      sessionId: sessionId,
      resource: resource,
      resourceId: resourceId,
      action: action,
      details: { phiAccessed },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      location: session.location,
      riskLevel: phiAccessed ? "high" : "low",
      phiAccessed: phiAccessed,
      dataClassification: phiAccessed ? "phi" : "internal",
    })
  }
  
  // ============================================================================
  // SECURITY ALERTS
  // ============================================================================
  
  createSecurityAlert(data: Omit<SecurityAlert, "id" | "createdAt" | "resolved" | "relatedAuditLogs">): SecurityAlert {
    const alert: SecurityAlert = {
      ...data,
      id: `ALT${Date.now()}`,
      resolved: false,
      relatedAuditLogs: [],
      createdAt: new Date(),
    }
    
    this.securityAlerts.set(alert.id, alert)
    
    return alert
  }
  
  resolveSecurityAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string
  ): boolean {
    const alert = this.securityAlerts.get(alertId)
    if (!alert) return false
    
    alert.resolved = true
    alert.resolvedBy = resolvedBy
    alert.resolvedAt = new Date()
    alert.resolution = resolution
    
    this.securityAlerts.set(alertId, alert)
    
    return true
  }
  
  getSecurityAlerts(filters?: {
    severity?: RiskLevel
    type?: AlertType
    resolved?: boolean
    userId?: string
  }): SecurityAlert[] {
    let alerts = Array.from(this.securityAlerts.values())
    
    if (filters?.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity)
    }
    
    if (filters?.type) {
      alerts = alerts.filter(a => a.type === filters.type)
    }
    
    if (filters?.resolved !== undefined) {
      alerts = alerts.filter(a => a.resolved === filters.resolved)
    }
    
    if (filters?.userId) {
      alerts = alerts.filter(a => a.userId === filters.userId)
    }
    
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  private detectSuspiciousActivity(log: AuditLog): void {
    // Detect after-hours access
    const hour = log.timestamp.getHours()
    if ((hour < 6 || hour > 22) && log.phiAccessed) {
      this.createSecurityAlert({
        type: "after_hours_access",
        severity: "medium",
        userId: log.userId,
        userName: log.userName,
        sessionId: log.sessionId,
        description: `After-hours PHI access by ${log.userName}`,
        details: { log },
        ipAddress: log.ipAddress,
        location: log.location,
      })
    }
    
    // Detect unusual data export
    if (log.action === "export" && log.phiAccessed) {
      this.createSecurityAlert({
        type: "unusual_data_access",
        severity: "high",
        userId: log.userId,
        userName: log.userName,
        sessionId: log.sessionId,
        description: `PHI data export by ${log.userName}`,
        details: { log },
        ipAddress: log.ipAddress,
        location: log.location,
      })
    }
  }
  
  private checkGeoAnomaly(userId: string, location?: GeoLocation): void {
    if (!location) return
    
    const user = this.users.get(userId)
    if (!user) return
    
    // Get recent sessions
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.location)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
    
    // Check if location is significantly different
    const isDifferent = recentSessions.some(s => {
      if (!s.location) return false
      return s.location.country !== location.country
    })
    
    if (isDifferent && recentSessions.length > 0) {
      this.createSecurityAlert({
        type: "geo_anomaly",
        severity: "medium",
        userId: userId,
        userName: user.name,
        description: `Unusual login location for ${user.name}`,
        details: { currentLocation: location, recentLocations: recentSessions.map(s => s.location) },
        location: location,
      })
    }
  }
  
  // ============================================================================
  // COMPLIANCE REPORTING
  // ============================================================================
  
  generateComplianceReport(
    reportType: ComplianceReport["reportType"],
    period: { start: Date; end: Date },
    generatedBy: string,
    generatedByName: string
  ): ComplianceReport {
    const findings: ComplianceFinding[] = []
    
    // HIPAA compliance checks
    if (reportType === "hipaa" || reportType === "custom") {
      findings.push(...this.checkHIPAACompliance(period))
    }
    
    // PDPA compliance checks
    if (reportType === "pdpa" || reportType === "custom") {
      findings.push(...this.checkPDPACompliance(period))
    }
    
    // Determine overall status
    const hasViolations = findings.some(f => f.status === "violation")
    const hasWarnings = findings.some(f => f.status === "warning")
    const status: ComplianceStatus = hasViolations ? "violation" : hasWarnings ? "warning" : "compliant"
    
    const report: ComplianceReport = {
      id: `RPT${Date.now()}`,
      reportType,
      period,
      status,
      findings,
      recommendations: this.generateRecommendations(findings),
      generatedBy,
      generatedByName,
      generatedAt: new Date(),
    }
    
    this.complianceReports.set(report.id, report)
    
    return report
  }
  
  private checkHIPAACompliance(period: { start: Date; end: Date }): ComplianceFinding[] {
    const findings: ComplianceFinding[] = []
    
    // Check: Access controls
    const usersWithoutMFA = Array.from(this.users.values()).filter(u => !u.mfaEnabled && u.role !== "patient")
    findings.push({
      id: `FND${Date.now()}_1`,
      category: "Access Control",
      requirement: "HIPAA § 164.312(a)(2)(i) - Unique User Identification",
      status: usersWithoutMFA.length > 0 ? "warning" : "compliant",
      description: usersWithoutMFA.length > 0 
        ? `${usersWithoutMFA.length} staff members do not have MFA enabled`
        : "All staff members have MFA enabled",
      evidence: usersWithoutMFA.map(u => u.email),
      remediationSteps: usersWithoutMFA.length > 0 
        ? ["Enable MFA for all staff accounts", "Enforce MFA policy in system settings"]
        : undefined,
    })
    
    // Check: Audit controls
    const phiAccessLogs = this.getAuditLogs({
      phiAccessed: true,
      startDate: period.start,
      endDate: period.end,
    })
    findings.push({
      id: `FND${Date.now()}_2`,
      category: "Audit Controls",
      requirement: "HIPAA § 164.312(b) - Audit Controls",
      status: "compliant",
      description: `${phiAccessLogs.length} PHI access events logged during the period`,
      evidence: [`Audit log count: ${phiAccessLogs.length}`, `Coverage: 100%`],
    })
    
    // Check: Password policy
    const weakPasswords = Array.from(this.users.values()).filter(u => {
      if (!u.passwordLastChanged) return true
      const daysSinceChange = (Date.now() - u.passwordLastChanged.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceChange > this.passwordPolicy.maxAge
    })
    findings.push({
      id: `FND${Date.now()}_3`,
      category: "Password Management",
      requirement: "HIPAA § 164.308(a)(5)(ii)(D) - Password Management",
      status: weakPasswords.length > 0 ? "warning" : "compliant",
      description: weakPasswords.length > 0
        ? `${weakPasswords.length} users have passwords older than ${this.passwordPolicy.maxAge} days`
        : "All passwords are within acceptable age",
      evidence: weakPasswords.map(u => u.email),
      remediationSteps: weakPasswords.length > 0
        ? ["Force password reset for affected users", "Implement automated password expiration"]
        : undefined,
    })
    
    // Check: Session timeout
    const longSessions = Array.from(this.sessions.values()).filter(s => {
      const duration = s.lastActivity.getTime() - s.createdAt.getTime()
      return duration > 8 * 60 * 60 * 1000 // 8 hours
    })
    findings.push({
      id: `FND${Date.now()}_4`,
      category: "Session Management",
      requirement: "HIPAA § 164.312(a)(2)(iii) - Automatic Logoff",
      status: longSessions.length > 0 ? "warning" : "compliant",
      description: longSessions.length > 0
        ? `${longSessions.length} sessions exceed 8-hour timeout threshold`
        : "All sessions comply with timeout policy",
      evidence: longSessions.map(s => `Session ${s.id}: ${s.userName}`),
    })
    
    return findings
  }
  
  private checkPDPACompliance(period: { start: Date; end: Date }): ComplianceFinding[] {
    const findings: ComplianceFinding[] = []
    
    // Check: Data access logging
    const dataAccessLogs = this.getAuditLogs({
      startDate: period.start,
      endDate: period.end,
    }).filter(log => 
      log.eventType === "data_access" || 
      log.eventType === "data_export" ||
      log.eventType === "phi_access"
    )
    
    findings.push({
      id: `FND${Date.now()}_5`,
      category: "Data Protection",
      requirement: "PDPA Section 26 - Data Access Logging",
      status: "compliant",
      description: `${dataAccessLogs.length} data access events logged`,
      evidence: [`Total access logs: ${dataAccessLogs.length}`, `Period: ${period.start.toISOString()} to ${period.end.toISOString()}`],
    })
    
    return findings
  }
  
  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = []
    
    const violations = findings.filter(f => f.status === "violation")
    const warnings = findings.filter(f => f.status === "warning")
    
    if (violations.length > 0) {
      recommendations.push(`Address ${violations.length} compliance violations immediately`)
    }
    
    if (warnings.length > 0) {
      recommendations.push(`Review and resolve ${warnings.length} compliance warnings`)
    }
    
    // MFA recommendation
    if (findings.some(f => f.category === "Access Control" && f.status !== "compliant")) {
      recommendations.push("Implement mandatory MFA for all staff accounts")
    }
    
    // Password policy recommendation
    if (findings.some(f => f.category === "Password Management" && f.status !== "compliant")) {
      recommendations.push("Enforce password rotation policy with automated reminders")
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Continue current security practices")
      recommendations.push("Schedule next compliance audit in 90 days")
    }
    
    return recommendations
  }
  
  getComplianceReport(reportId: string): ComplianceReport | undefined {
    return this.complianceReports.get(reportId)
  }
  
  getAllComplianceReports(): ComplianceReport[] {
    return Array.from(this.complianceReports.values())
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
  }
  
  // ============================================================================
  // DATA ENCRYPTION (Simulated)
  // ============================================================================
  
  encryptData(plaintext: string, algorithm: EncryptionAlgorithm = "AES-256-GCM"): EncryptedData {
    // In production, use Web Crypto API or Node.js crypto module
    // This is a simplified simulation
    const iv = this.generateRandomString(16)
    const authTag = this.generateRandomString(16)
    const ciphertext = Buffer.from(plaintext).toString("base64")
    
    return {
      algorithm,
      ciphertext,
      iv,
      authTag,
      timestamp: new Date(),
    }
  }
  
  decryptData(encrypted: EncryptedData): string {
    // In production, use proper decryption
    // This is a simplified simulation
    return Buffer.from(encrypted.ciphertext, "base64").toString("utf-8")
  }
  
  private generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  // ============================================================================
  // METRICS & ANALYTICS
  // ============================================================================
  
  getSecurityMetrics(): SecurityMetrics {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const allUsers = Array.from(this.users.values())
    const allSessions = Array.from(this.sessions.values())
    const allAlerts = Array.from(this.securityAlerts.values())
    
    const activeUsers = allUsers.filter(u => {
      return u.lastLogin && u.lastLogin > last24h
    }).length
    
    const activeSessions = allSessions.filter(s => s.status === "active").length
    const expiredSessions = allSessions.filter(s => s.status === "expired").length
    const revokedSessions = allSessions.filter(s => s.status === "revoked").length
    
    const auditLogs24h = this.getAuditLogs({
      startDate: last24h,
      endDate: now,
    }).length
    
    const unresolvedAlerts = allAlerts.filter(a => !a.resolved)
    
    const severityCount: Record<RiskLevel, number> = {
      low: unresolvedAlerts.filter(a => a.severity === "low").length,
      medium: unresolvedAlerts.filter(a => a.severity === "medium").length,
      high: unresolvedAlerts.filter(a => a.severity === "high").length,
      critical: unresolvedAlerts.filter(a => a.severity === "critical").length,
    }
    
    const phiAccessCount = this.getAuditLogs({
      phiAccessed: true,
      startDate: last24h,
      endDate: now,
    }).length
    
    const failedLogins = this.getAuditLogs({
      eventType: "login_failed",
      startDate: last24h,
      endDate: now,
    }).length
    
    // Determine compliance status from most recent report
    const reports = Array.from(this.complianceReports.values())
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
    const complianceStatus = reports[0]?.status || "compliant"
    
    return {
      totalUsers: allUsers.length,
      activeUsers,
      lockedAccounts: allUsers.filter(u => u.accountLocked).length,
      activeSessions,
      expiredSessions,
      revokedSessions,
      auditLogs24h,
      securityAlerts: {
        total: allAlerts.length,
        unresolved: unresolvedAlerts.length,
        bySeverity: severityCount,
      },
      complianceStatus,
      phiAccessCount,
      failedLoginAttempts: failedLogins,
      suspiciousActivities: unresolvedAlerts.filter(a => 
        a.type === "suspicious_activity" || 
        a.type === "unusual_data_access"
      ).length,
      lastSecurityAudit: reports[0]?.generatedAt,
      nextScheduledAudit: reports[0] ? new Date(reports[0].generatedAt.getTime() + 90 * 24 * 60 * 60 * 1000) : undefined,
    }
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  private initializeRolePermissions(): void {
    // Super Admin - Full access
    this.rolePermissions.set("super_admin", [
      { id: "1", resource: "patients", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "2", resource: "patients", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "3", resource: "patients", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "4", resource: "patients", action: "delete", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "5", resource: "medical_records", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "6", resource: "audit_logs", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "7", resource: "settings", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      // ... all resources and actions
    ])
    
    // Doctor - Medical access
    this.rolePermissions.set("doctor", [
      { id: "101", resource: "patients", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "102", resource: "patients", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "103", resource: "medical_records", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "104", resource: "medical_records", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "105", resource: "medical_records", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "106", resource: "treatments", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "107", resource: "treatments", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "108", resource: "prescriptions", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "109", resource: "prescriptions", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
    ])
    
    // Nurse - Limited medical access
    this.rolePermissions.set("nurse", [
      { id: "201", resource: "patients", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "202", resource: "appointments", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "203", resource: "appointments", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "204", resource: "appointments", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "205", resource: "treatments", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
    ])
    
    // Receptionist - Administrative access
    this.rolePermissions.set("receptionist", [
      { id: "301", resource: "patients", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "302", resource: "patients", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "303", resource: "appointments", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "304", resource: "appointments", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "305", resource: "appointments", action: "update", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "306", resource: "billing", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
    ])
    
    // Patient - Self access only
    this.rolePermissions.set("patient", [
      { id: "401", resource: "appointments", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "402", resource: "appointments", action: "create", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "403", resource: "medical_records", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
      { id: "404", resource: "billing", action: "read", grantedBy: "SYSTEM", grantedAt: new Date() },
    ])
  }
  
  private initializeSampleData(): void {
    // Create sample users
    this.createUser({
      email: "admin@clinic.com",
      name: "System Administrator",
      role: "super_admin",
      department: "IT",
      permissions: [],
      mfaEnabled: true,
      lastLogin: new Date(),
      passwordLastChanged: new Date(),
    })
    
    this.createUser({
      email: "dr.smith@clinic.com",
      name: "Dr. Sarah Smith",
      role: "doctor",
      department: "Dermatology",
      permissions: [],
      mfaEnabled: true,
      lastLogin: new Date(),
      passwordLastChanged: new Date(),
    })
    
    this.createUser({
      email: "nurse.jane@clinic.com",
      name: "Jane Nurse",
      role: "nurse",
      department: "General",
      permissions: [],
      mfaEnabled: false,
      passwordLastChanged: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
    })
    
    // Create sample sessions
    const adminUser = Array.from(this.users.values())[0]
    this.createSession({
      userId: adminUser.id,
      authMethod: "2fa",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      location: {
        country: "Thailand",
        region: "Bangkok",
        city: "Bangkok",
        latitude: 13.7563,
        longitude: 100.5018,
      },
    })
    
    // Create sample audit logs
    this.logAudit({
      eventType: "phi_access",
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      sessionId: Array.from(this.sessions.values())[0]?.id || "SES001",
      resource: "medical_records",
      resourceId: "MR001",
      action: "read",
      details: { patientId: "PAT001", recordType: "treatment_notes" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
      riskLevel: "high",
      phiAccessed: true,
      dataClassification: "phi",
    })
    
    // Create sample security alert
    this.createSecurityAlert({
      type: "after_hours_access",
      severity: "medium",
      userId: adminUser.id,
      userName: adminUser.name,
      description: "After-hours system access detected",
      details: { time: "02:30 AM", resource: "medical_records" },
      ipAddress: "192.168.1.100",
    })
    
    // Generate sample compliance report
    const now = new Date()
    const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    this.generateComplianceReport(
      "hipaa",
      { start: startDate, end: now },
      adminUser.id,
      adminUser.name
    )
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default SecurityManager
