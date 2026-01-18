/**
 * Canonical Role Normalization Utility
 * รวม role หลายรูปแบบ (legacy / supabase / enum) ให้เป็นชุดเดียวที่ใช้ภายในระบบ
 */

export type CanonicalRole =
  | 'public'
  | 'guest'
  | 'customer_free'
  | 'customer_premium'
  | 'customer_aesthetic'
  | 'customer' // generic customer (fallback)
  | 'center_staff'
  | 'center_owner'
  | 'center_admin'
  | 'sales_staff'
  | 'super_admin'

// Legacy aliases -> canonical mapping
const LEGACY_MAP: Record<string, CanonicalRole> = {
  free_user: 'customer_free',
  premium_customer: 'customer_premium',
  customer_free: 'customer_free',
  customer_premium: 'customer_premium',
  customer_aesthetic: 'customer_aesthetic',
  customer_centeral: 'customer_aesthetic',
  customer: 'customer',
  admin: 'super_admin',
  manager: 'center_admin',
  center_staff: 'center_staff',
  clinic_staff: 'center_staff',
  center_owner: 'center_owner',
  clinic_owner: 'center_owner',
  center_admin: 'center_admin',
  clinic_admin: 'center_admin',
  clinic_manager: 'center_admin',
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
 * Helper: ตรวจสอบว่า role อยู่ในกลุ่ม center (owner/admin/staff)
 */
export function isCenterRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  return r === 'center_owner' || r === 'center_admin' || r === 'center_staff' || r === 'sales_staff'
}

/**
 * Helper: ตรวจสอบว่า role เป็นระดับ super / elevated
 */
export function isElevatedRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  return r === 'super_admin' || r === 'center_admin'
}

/**
 * Helper: แปลง canonical role เป็น analysis tier
 */
export type AnalysisTier = 'free' | 'premium' | 'aesthetic'
export function roleToTier(role: string | null | undefined): AnalysisTier {
  const r = normalizeRole(role)
  switch (r) {
    case 'customer_premium':
    case 'sales_staff':
    case 'center_staff':
      return 'premium'
    case 'customer_aesthetic':
    case 'center_owner':
    case 'center_admin':
    case 'super_admin':
      return 'aesthetic'
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
    case 'customer_aesthetic': return 'ลูกค้าศูนย์ความงาม'
    case 'center_staff': return 'พนักงานศูนย์ความงาม'
    case 'center_owner': return 'เจ้าของศูนย์ความงาม'
    case 'center_admin': return 'ผู้ดูแลศูนย์ความงาม'
    case 'sales_staff': return 'พนักงานขาย'
    case 'super_admin': return 'ซูเปอร์แอดมิน'
    case 'customer': return 'ผู้ใช้'
    case 'guest': return 'ผู้เยี่ยมชมสาธารณะ'
    default: return 'สาธารณะ'
  }
}
