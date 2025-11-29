/**
 * Security Logging System
 * Logs security events for monitoring and audit trails
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'rate_limit' | 'suspicious_activity' | 'api_access'
  ip: string
  userAgent?: string
  userId?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    await supabase.from('security_logs').insert({
      type: event.type,
      ip: event.ip,
      user_agent: event.userAgent,
      user_id: event.userId,
      details: event.details,
      severity: event.severity,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

export async function logRateLimit(ip: string, userAgent?: string) {
  await logSecurityEvent({
    type: 'rate_limit',
    ip,
    userAgent,
    severity: 'medium',
    details: { message: 'Rate limit exceeded' }
  })
}

export async function logLoginAttempt(ip: string, email: string, userAgent?: string) {
  await logSecurityEvent({
    type: 'login_attempt',
    ip,
    userAgent,
    details: { email },
    severity: 'low'
  })
}

export async function logLoginFailure(ip: string, email: string, reason: string, userAgent?: string) {
  await logSecurityEvent({
    type: 'login_failure',
    ip,
    userAgent,
    details: { email, reason },
    severity: 'medium'
  })
}

export async function logLoginSuccess(ip: string, userId: string, userAgent?: string) {
  await logSecurityEvent({
    type: 'login_success',
    ip,
    userId,
    userAgent,
    severity: 'low'
  })
}

export async function logSuspiciousActivity(ip: string, activity: string, details?: Record<string, any>, userAgent?: string) {
  await logSecurityEvent({
    type: 'suspicious_activity',
    ip,
    userAgent,
    details: { activity, ...details },
    severity: 'high'
  })
}
