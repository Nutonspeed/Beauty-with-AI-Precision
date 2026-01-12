import { describe, it, expect } from 'vitest'
import { normalizeRole, isCenterRole, isElevatedRole, roleDisplayName, roleToTier } from '@/lib/auth/role-normalize'

// Mapping of legacy variants => canonical expected
const legacyCases: Array<[string, string]> = [
  ['SUPER_ADMIN', 'super_admin'],
  ['SuperAdmin', 'super_admin'],
  ['centerAdmin', 'center_admin'],
  ['Center_Admin', 'center_admin'],
  ['salesStaff', 'sales_staff'],
  ['Sales', 'sales_staff'],
  ['customer', 'customer'],
  ['CUSTOMER', 'customer'],
  ['guest', 'guest'],
  ['GUEST', 'guest'],
]

describe('role-normalize', () => {
  it('normalizes role variants to canonical lowercase snake_case', () => {
    for (const [input, expected] of legacyCases) {
      expect(normalizeRole(input)).toBe(expected)
    }
  })

  it('handles unknown/empty values returning public or customer_free', () => {
    expect(normalizeRole('')).toBe('public')
    expect(normalizeRole(null as any)).toBe('public')
    expect(normalizeRole(undefined as any)).toBe('public')
    // Unknown strings fallback to customer_free
    expect(normalizeRole('unknown_role_x')).toBe('customer_free')
  })

  it('identifies center roles', () => {
    expect(isCenterRole('center_admin')).toBe(true)
    expect(isCenterRole('sales_staff')).toBe(true)
    expect(isCenterRole('super_admin')).toBe(false)
    expect(isCenterRole('customer')).toBe(false)
  })

  it('identifies elevated roles', () => {
    expect(isElevatedRole('super_admin')).toBe(true)
    expect(isElevatedRole('center_admin')).toBe(true)
    expect(isElevatedRole('sales_staff')).toBe(false)
    expect(isElevatedRole('customer')).toBe(false)
  })

  it('provides Thai display names', () => {
    expect(roleDisplayName('super_admin')).toMatch(/แอดมิน/i)
    expect(roleDisplayName('center_admin')).toMatch(/ศูนย์ความงาม/i)
    expect(roleDisplayName('sales_staff')).toMatch(/ขาย/i)
    expect(roleDisplayName('customer')).toMatch(/ผู้ใช้|ลูกค้า/)
    expect(roleDisplayName('guest')).toMatch(/สาธารณะ/)
  })

  it('maps roles to tiers (free/premium/aesthetic)', () => {
    expect(roleToTier('super_admin')).toBe('aesthetic')
    expect(roleToTier('center_admin')).toBe('aesthetic')
    expect(roleToTier('sales_staff')).toBe('premium')
    expect(roleToTier('customer')).toBe('free')
    expect(roleToTier('guest')).toBe('free')
  })
})
