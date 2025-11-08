/**
 * Security Hooks
 * 
 * React hooks for security, compliance, and audit features
 */

import { useState, useEffect, useCallback } from "react"
import SecurityManager, {
  User,
  Session,
  AuditLog,
  SecurityAlert,
  ComplianceReport,
  SecurityMetrics,
  UserRole,
  Resource,
  Action,
  AuditEventType,
  RiskLevel,
  AlertType,
} from "@/lib/security/security-manager"

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

export function useUsers(filters?: {
  role?: UserRole
  department?: string
  accountLocked?: boolean
}) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadUsers = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getAllUsers(filters)
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  useEffect(() => {
    loadUsers()
  }, [loadUsers])
  
  const createUser = useCallback(async (data: Omit<User, "id" | "createdAt" | "updatedAt" | "loginAttempts" | "accountLocked">) => {
    try {
      const user = manager.createUser(data)
      loadUsers()
      return user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
      throw err
    }
  }, [loadUsers])
  
  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const user = manager.updateUser(userId, updates)
      loadUsers()
      return user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
      throw err
    }
  }, [loadUsers])
  
  const lockAccount = useCallback(async (userId: string, duration?: number) => {
    try {
      const success = manager.lockAccount(userId, duration)
      loadUsers()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lock account")
      throw err
    }
  }, [loadUsers])
  
  const unlockAccount = useCallback(async (userId: string) => {
    try {
      const success = manager.unlockAccount(userId)
      loadUsers()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock account")
      throw err
    }
  }, [loadUsers])
  
  return {
    users,
    loading,
    error,
    refresh: loadUsers,
    createUser,
    updateUser,
    lockAccount,
    unlockAccount,
  }
}

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadUser = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getUser(userId)
      setUser(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user")
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  useEffect(() => {
    loadUser()
  }, [loadUser])
  
  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      const updated = manager.updateUser(userId, updates)
      if (updated) {
        setUser(updated)
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
      throw err
    }
  }, [userId])
  
  const grantPermission = useCallback(async (
    resource: Resource,
    action: Action,
    grantedBy: string,
    expiresAt?: Date
  ) => {
    try {
      const success = manager.grantPermission(userId, resource, action, grantedBy, expiresAt)
      loadUser()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant permission")
      throw err
    }
  }, [userId, loadUser])
  
  const revokePermission = useCallback(async (permissionId: string) => {
    try {
      const success = manager.revokePermission(userId, permissionId)
      loadUser()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke permission")
      throw err
    }
  }, [userId, loadUser])
  
  return {
    user,
    loading,
    error,
    refresh: loadUser,
    updateUser,
    grantPermission,
    revokePermission,
  }
}

// ============================================================================
// SESSION MANAGEMENT HOOKS
// ============================================================================

export function useSessions(filters?: { userId?: string; status?: Session["status"] }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadSessions = useCallback(() => {
    try {
      setLoading(true)
      // Get all sessions and filter (in production, this would be done server-side)
      const allSessions = Array.from((manager as any).sessions.values()) as Session[]
      let filtered = allSessions
      
      if (filters?.userId) {
        filtered = filtered.filter(s => s.userId === filters.userId)
      }
      if (filters?.status) {
        filtered = filtered.filter(s => s.status === filters.status)
      }
      
      setSessions(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  useEffect(() => {
    loadSessions()
  }, [loadSessions])
  
  const revokeSession = useCallback(async (sessionId: string, revokedBy: string, reason: string) => {
    try {
      const success = manager.revokeSession(sessionId, revokedBy, reason)
      loadSessions()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session")
      throw err
    }
  }, [loadSessions])
  
  const revokeUserSessions = useCallback(async (userId: string, reason: string) => {
    try {
      const count = manager.revokeUserSessions(userId, reason)
      loadSessions()
      return count
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke user sessions")
      throw err
    }
  }, [loadSessions])
  
  return {
    sessions,
    loading,
    error,
    refresh: loadSessions,
    revokeSession,
    revokeUserSessions,
  }
}

// ============================================================================
// AUDIT LOG HOOKS
// ============================================================================

export function useAuditLogs(filters?: {
  userId?: string
  eventType?: AuditEventType
  resource?: Resource
  riskLevel?: RiskLevel
  phiAccessed?: boolean
  startDate?: Date
  endDate?: Date
}) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadLogs = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getAuditLogs(filters)
      setLogs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  useEffect(() => {
    loadLogs()
  }, [loadLogs])
  
  const logDataAccess = useCallback((
    userId: string,
    resource: Resource,
    resourceId: string,
    action: Action,
    sessionId: string,
    phiAccessed: boolean = false
  ) => {
    try {
      manager.logDataAccess(userId, resource, resourceId, action, sessionId, phiAccessed)
      loadLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log data access")
      throw err
    }
  }, [loadLogs])
  
  return {
    logs,
    loading,
    error,
    refresh: loadLogs,
    logDataAccess,
  }
}

// ============================================================================
// SECURITY ALERT HOOKS
// ============================================================================

export function useSecurityAlerts(filters?: {
  severity?: RiskLevel
  type?: AlertType
  resolved?: boolean
  userId?: string
}) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadAlerts = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getSecurityAlerts(filters)
      setAlerts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security alerts")
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])
  
  const resolveAlert = useCallback(async (alertId: string, resolvedBy: string, resolution: string) => {
    try {
      const success = manager.resolveSecurityAlert(alertId, resolvedBy, resolution)
      loadAlerts()
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve alert")
      throw err
    }
  }, [loadAlerts])
  
  return {
    alerts,
    loading,
    error,
    refresh: loadAlerts,
    resolveAlert,
  }
}

// ============================================================================
// COMPLIANCE REPORTING HOOKS
// ============================================================================

export function useComplianceReports() {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadReports = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getAllComplianceReports()
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load compliance reports")
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadReports()
  }, [loadReports])
  
  const generateReport = useCallback(async (
    reportType: ComplianceReport["reportType"],
    period: { start: Date; end: Date },
    generatedBy: string,
    generatedByName: string
  ) => {
    try {
      const report = manager.generateComplianceReport(reportType, period, generatedBy, generatedByName)
      loadReports()
      return report
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
      throw err
    }
  }, [loadReports])
  
  return {
    reports,
    loading,
    error,
    refresh: loadReports,
    generateReport,
  }
}

export function useComplianceReport(reportId: string) {
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadReport = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getComplianceReport(reportId)
      setReport(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load compliance report")
    } finally {
      setLoading(false)
    }
  }, [reportId])
  
  useEffect(() => {
    loadReport()
  }, [loadReport])
  
  return {
    report,
    loading,
    error,
    refresh: loadReport,
  }
}

// ============================================================================
// SECURITY METRICS HOOKS
// ============================================================================

export function useSecurityMetrics() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const manager = SecurityManager.getInstance()
  
  const loadMetrics = useCallback(() => {
    try {
      setLoading(true)
      const data = manager.getSecurityMetrics()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security metrics")
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadMetrics()
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [loadMetrics])
  
  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics,
  }
}

// ============================================================================
// PERMISSION CHECK HOOKS
// ============================================================================

export function usePermission(
  userId: string,
  resource: Resource,
  action: Action,
  context?: Record<string, unknown>
) {
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const manager = SecurityManager.getInstance()
  
  useEffect(() => {
    try {
      setLoading(true)
      const permitted = manager.hasPermission(userId, resource, action, context)
      setHasPermission(permitted)
    } catch (err) {
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }, [userId, resource, action, context])
  
  return { hasPermission, loading }
}

// ============================================================================
// ENCRYPTION HOOKS
// ============================================================================

export function useEncryption() {
  const manager = SecurityManager.getInstance()
  
  const encrypt = useCallback((plaintext: string) => {
    return manager.encryptData(plaintext)
  }, [])
  
  const decrypt = useCallback((encrypted: ReturnType<typeof manager.encryptData>) => {
    return manager.decryptData(encrypted)
  }, [])
  
  return { encrypt, decrypt }
}

// Export useSecurity as a convenience hook that combines common security functionality
export function useSecurity(userId?: string) {
  const { users } = useUsers()
  const user = userId ? useUser(userId) : { user: null, loading: false, error: null }
  const { metrics } = useSecurityMetrics()
  const { alerts } = useSecurityAlerts({ resolved: false })
  
  return {
    users,
    user: user.user,
    metrics,
    unresolvedAlerts: alerts,
  }
}

