/**
 * Clinic Settings RBAC Helper
 * Ensures only authorized roles can manage clinic settings
 */

import { normalizeRole } from './role-normalize'

/**
 * Check if user can manage clinic settings
 * @param role User's role (raw from database)
 * @returns true if user can manage clinic settings
 */
export function canManageClinicSettings(role: string): boolean {
  const normalizedRole = normalizeRole(role)
  const allowedRoles = ['clinic_owner', 'clinic_admin', 'super_admin']
  return allowedRoles.includes(normalizedRole)
}

/**
 * Check if user can view clinic analytics
 * @param role User's role (raw from database)
 * @returns true if user can view analytics
 */
export function canViewClinicAnalytics(role: string): boolean {
  const normalizedRole = normalizeRole(role)
  const allowedRoles = ['clinic_owner', 'clinic_admin', 'super_admin']
  return allowedRoles.includes(normalizedRole)
}

/**
 * Check if user can manage clinic staff
 * @param role User's role (raw from database)
 * @returns true if user can manage staff
 */
export function canManageClinicStaff(role: string): boolean {
  const normalizedRole = normalizeRole(role)
  const allowedRoles = ['clinic_owner', 'clinic_admin', 'super_admin']
  return allowedRoles.includes(normalizedRole)
}
