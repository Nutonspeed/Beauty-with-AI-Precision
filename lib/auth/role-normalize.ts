/**
 * Canonical Role Normalization Utility
 * รวม role หลายรูปแบบ (legacy / supabase / enum) ให้เป็นชุดเดียวที่ใช้ภายในระบบ
 */

export type CanonicalRole =
  | 'public'
  | 'guest'
  | 'customer_free'
  | 'customer_premium'
  | 'customer_clinical'
  | 'customer' // generic customer (fallback)
  | 'clinic_staff'
  | 'clinic_owner'
  | 'clinic_admin'
  | 'sales_staff'
  | 'super_admin'

// Legacy aliases -> canonical mapping
const LEGACY_MAP: Record<string, CanonicalRole> = {
  free_user: 'customer_free',
  premium_customer: 'customer_premium',
  customer_free: 'customer_free',
  customer_premium: 'customer_premium',
  customer_clinical: 'customer_clinical',
  customer: 'customer',
  clinic_staff: 'clinic_staff',
  clinic_owner: 'clinic_owner',
  clinic_admin: 'clinic_admin',
  sales_staff: 'sales_staff',
  sales: 'sales_staff',
  super_admin: 'super_admin',
  superadmin: 'super_admin',
  public: 'public',
  guest: 'guest',
}

/**
 * Normalize any incoming role string ให้เป็น CanonicalRole
 * ถ้าไม่รู้จัก จะ fallback เป็น 'customer_free'
 */
export function normalizeRole(role: string | null | undefined): CanonicalRole {
  if (!role) return 'public'
  // standardize variants: camelCase, spaces, dashes, case-insensitive
  const raw = String(role).trim()
  if (!raw) return 'public'
  // ใช้ replaceAll กับ regex patterns เพื่อให้ผ่าน lint rule
  const snake = raw
    .replaceAll(/([a-z])([A-Z])/g, '$1_$2')
    .replaceAll(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
  return LEGACY_MAP[snake] ?? 'customer_free'
}

/**
 * Helper: ตรวจสอบว่า role อยู่ในกลุ่ม clinic (owner/admin/staff)
 */
export function isClinicRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  return r === 'clinic_owner' || r === 'clinic_admin' || r === 'clinic_staff' || r === 'sales_staff'
}

/**
 * Helper: ตรวจสอบว่า role เป็นระดับ super / elevated
 */
export function isElevatedRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  return r === 'super_admin' || r === 'clinic_admin'
}

/**
 * Helper: แปลง canonical role เป็น analysis tier
 */
export type AnalysisTier = 'free' | 'premium' | 'clinical'
export function roleToTier(role: string | null | undefined): AnalysisTier {
  const r = normalizeRole(role)
  switch (r) {
    case 'customer_premium':
    case 'sales_staff':
    case 'clinic_staff':
      return 'premium'
    case 'customer_clinical':
    case 'clinic_owner':
    case 'clinic_admin':
    case 'super_admin':
      return 'clinical'
    case 'customer_free':
    case 'customer':
    case 'public':
    case 'guest':
    default:
      return 'free'
  }
}

/**
 * Helper: รวมเพื่อใช้ใน UI สำหรับแสดง label ภาษาไทย
 */
export function roleDisplayName(role: string | null | undefined): string {
  const r = normalizeRole(role)
  switch (r) {
    case 'customer_free': return 'ผู้ใช้ฟรี'
    case 'customer_premium': return 'ผู้ใช้พรีเมียม'
    case 'customer_clinical': return 'ลูกค้าคลินิก'
    case 'clinic_staff': return 'พนักงานคลินิก'
    case 'clinic_owner': return 'เจ้าของคลินิก'
    case 'clinic_admin': return 'ผู้ดูแลคลินิก'
    case 'sales_staff': return 'พนักงานขาย'
    case 'super_admin': return 'ซูเปอร์แอดมิน'
    case 'customer': return 'ผู้ใช้'
    case 'guest': return 'ผู้เยี่ยมชมสาธารณะ'
    default: return 'สาธารณะ'
  }
}
