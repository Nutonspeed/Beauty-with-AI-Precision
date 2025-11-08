/**
 * Role-Based Access Control (RBAC)
 * Defines user roles and their permissions
 */

// User Roles
export enum UserRole {
  PUBLIC = "public",
  FREE_USER = "free_user",
  PREMIUM_CUSTOMER = "premium_customer",
  CLINIC_STAFF = "clinic_staff",
  CLINIC_ADMIN = "clinic_admin",
  SALES_STAFF = "sales_staff",
  SUPER_ADMIN = "super_admin",
}

// Analysis Tiers (ความละเอียดของ AI)
export enum AnalysisTier {
  FREE = "free",
  PREMIUM = "premium",
  CLINICAL = "clinical",
}

// Permissions
export enum Permission {
  // Public Permissions
  VIEW_PUBLIC_PAGES = "view_public_pages",
  VIEW_PRICING = "view_pricing",

  // Free User Permissions
  CREATE_ACCOUNT = "create_account",
  BASIC_ANALYSIS = "basic_analysis",
  VIEW_LIMITED_RESULTS = "view_limited_results",
  VIEW_HISTORY_7_DAYS = "view_history_7_days",

  // Premium Customer Permissions
  PREMIUM_ANALYSIS = "premium_analysis",
  VIEW_FULL_RESULTS = "view_full_results",
  USE_AR_SIMULATOR = "use_ar_simulator",
  VIEW_HEATMAP = "view_heatmap",
  PROGRESS_TRACKING = "progress_tracking",
  VIEW_UNLIMITED_HISTORY = "view_unlimited_history",
  EXPORT_PDF = "export_pdf",
  CHAT_WITH_SALES = "chat_with_sales",
  BOOKING_APPOINTMENTS = "booking_appointments",

  // Clinic Permissions
  VIEW_CLINIC_DASHBOARD = "view_clinic_dashboard",
  VIEW_CLINIC_CUSTOMERS = "view_clinic_customers",
  MANAGE_BOOKINGS = "manage_bookings",
  UPLOAD_ANALYSIS = "upload_analysis",
  VIEW_CLINIC_REPORTS = "view_clinic_reports",

  // Clinic Admin Permissions (additional)
  MANAGE_CLINIC_STAFF = "manage_clinic_staff",
  MANAGE_CLINIC_SETTINGS = "manage_clinic_settings",
  VIEW_FINANCIAL_REPORTS = "view_financial_reports",
  EXPORT_CLINIC_DATA = "export_clinic_data",

  // Sales Permissions
  VIEW_SALES_DASHBOARD = "view_sales_dashboard",
  VIEW_ALL_LEADS = "view_all_leads",
  MANAGE_OWN_LEADS = "manage_own_leads",
  CREATE_PROPOSALS = "create_proposals",
  CHAT_WITH_CUSTOMERS = "chat_with_customers",
  VIEW_OWN_SALES_REPORTS = "view_own_sales_reports",

  // Super Admin Permissions
  VIEW_ADMIN_DASHBOARD = "view_admin_dashboard",
  MANAGE_ALL_TENANTS = "manage_all_tenants",
  MANAGE_ALL_USERS = "manage_all_users",
  MANAGE_SUBSCRIPTIONS = "manage_subscriptions",
  VIEW_SYSTEM_ANALYTICS = "view_system_analytics",
  MANAGE_SYSTEM_SETTINGS = "manage_system_settings",
  VIEW_SYSTEM_LOGS = "view_system_logs",
  IMPERSONATE_USERS = "impersonate_users",
}

// Base permissions for each role (without inheritance)
const PUBLIC_PERMISSIONS = [Permission.VIEW_PUBLIC_PAGES, Permission.VIEW_PRICING]

const FREE_USER_PERMISSIONS = [
  Permission.VIEW_PUBLIC_PAGES,
  Permission.VIEW_PRICING,
  Permission.CREATE_ACCOUNT,
  Permission.BASIC_ANALYSIS,
  Permission.VIEW_LIMITED_RESULTS,
  Permission.VIEW_HISTORY_7_DAYS,
]

const PREMIUM_CUSTOMER_PERMISSIONS = [
  Permission.PREMIUM_ANALYSIS,
  Permission.VIEW_FULL_RESULTS,
  Permission.USE_AR_SIMULATOR,
  Permission.VIEW_HEATMAP,
  Permission.PROGRESS_TRACKING,
  Permission.VIEW_UNLIMITED_HISTORY,
  Permission.EXPORT_PDF,
  Permission.CHAT_WITH_SALES,
  Permission.BOOKING_APPOINTMENTS,
]

const CLINIC_STAFF_PERMISSIONS = [
  Permission.VIEW_CLINIC_DASHBOARD,
  Permission.VIEW_CLINIC_CUSTOMERS,
  Permission.MANAGE_BOOKINGS,
  Permission.UPLOAD_ANALYSIS,
  Permission.VIEW_CLINIC_REPORTS,
]

const CLINIC_ADMIN_PERMISSIONS = [
  Permission.MANAGE_CLINIC_STAFF,
  Permission.MANAGE_CLINIC_SETTINGS,
  Permission.VIEW_FINANCIAL_REPORTS,
  Permission.EXPORT_CLINIC_DATA,
]

const SALES_STAFF_PERMISSIONS = [
  Permission.VIEW_SALES_DASHBOARD,
  Permission.VIEW_ALL_LEADS,
  Permission.MANAGE_OWN_LEADS,
  Permission.CREATE_PROPOSALS,
  Permission.CHAT_WITH_CUSTOMERS,
  Permission.VIEW_OWN_SALES_REPORTS,
]

// Role to Permissions Mapping (with inheritance)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PUBLIC]: PUBLIC_PERMISSIONS,

  [UserRole.FREE_USER]: [...FREE_USER_PERMISSIONS],

  [UserRole.PREMIUM_CUSTOMER]: [
    ...FREE_USER_PERMISSIONS,
    ...PREMIUM_CUSTOMER_PERMISSIONS,
  ],

  [UserRole.CLINIC_STAFF]: [
    ...FREE_USER_PERMISSIONS,
    ...PREMIUM_CUSTOMER_PERMISSIONS,
    ...CLINIC_STAFF_PERMISSIONS,
  ],

  [UserRole.CLINIC_ADMIN]: [
    ...FREE_USER_PERMISSIONS,
    ...PREMIUM_CUSTOMER_PERMISSIONS,
    ...CLINIC_STAFF_PERMISSIONS,
    ...CLINIC_ADMIN_PERMISSIONS,
  ],

  [UserRole.SALES_STAFF]: [
    ...FREE_USER_PERMISSIONS,
    ...PREMIUM_CUSTOMER_PERMISSIONS,
    ...SALES_STAFF_PERMISSIONS,
  ],

  [UserRole.SUPER_ADMIN]: [...Object.values(Permission)],
}

// Feature to Tier Mapping (ควบคุม AI features ตาม tier)
export const TIER_FEATURES: Record<AnalysisTier, string[]> = {
  [AnalysisTier.FREE]: [
    "browser_ai",
    "8_point_metrics",
    "top_3_concerns",
    "basic_recommendations",
    "standard_speed",
  ],

  [AnalysisTier.PREMIUM]: [
    "browser_ai",
    "cloud_ai",
    "8_point_metrics",
    "all_concerns",
    "heatmap",
    "confidence_scores",
    "personalized_recommendations",
    "priority_processing",
    "ar_simulator",
    "progress_tracking",
    "unlimited_history",
  ],

  [AnalysisTier.CLINICAL]: [
    "browser_ai",
    "cloud_ai",
    "visia_equivalent",
    "8_point_metrics",
    "all_concerns",
    "advanced_heatmap",
    "uv_imaging",
    "polarized_light",
    "3d_estimation",
    "expert_validation",
    "batch_analysis",
    "crm_integration",
    "api_access",
    "unlimited_everything",
  ],
}

// Helper function: Check if role has permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Helper function: Check if tier has feature
export function hasTierFeature(tier: AnalysisTier, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false
}

// Helper function: Get role hierarchy level
export function getRoleLevel(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    [UserRole.PUBLIC]: 0,
    [UserRole.FREE_USER]: 1,
    [UserRole.PREMIUM_CUSTOMER]: 2,
    [UserRole.CLINIC_STAFF]: 3,
    [UserRole.CLINIC_ADMIN]: 4,
    [UserRole.SALES_STAFF]: 3,
    [UserRole.SUPER_ADMIN]: 5,
  }
  return hierarchy[role] ?? 0
}

// Helper function: Check if roleA is higher than roleB
export function isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
  return getRoleLevel(roleA) > getRoleLevel(roleB)
}
