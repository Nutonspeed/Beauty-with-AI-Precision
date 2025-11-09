/**
 * Centralized Color System
 * Consistent colors across all components
 */

// Status Colors for Bookings/Appointments
export const STATUS_COLORS = {
  pending: {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
    background: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  confirmed: {
    badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
    background: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  arrived: {
    badge: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800",
    background: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
  },
  in_progress: {
    badge: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800",
    background: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
  },
  completed: {
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800",
    background: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
  },
  cancelled: {
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
    background: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
  },
  no_show: {
    badge: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800",
    background: "bg-gray-50 dark:bg-gray-950",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  },
} as const;

// Role Badge Colors
export const ROLE_COLORS = {
  super_admin: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
  clinic_owner: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
  clinic_staff: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200",
  sales_staff: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
  customer: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200",
  premium_customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200",
} as const;

// Priority/Severity Colors
export const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
  info: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200",
} as const;

// Metric/Trend Colors (for dashboards)
export const METRIC_COLORS = {
  revenue: {
    icon: "text-green-600 dark:text-green-400",
    background: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
  },
  customers: {
    icon: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
  },
  bookings: {
    icon: "text-purple-600 dark:text-purple-400",
    background: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
  },
  treatments: {
    icon: "text-pink-600 dark:text-pink-400",
    background: "bg-pink-50 dark:bg-pink-950",
    border: "border-pink-200 dark:border-pink-800",
  },
  staff: {
    icon: "text-indigo-600 dark:text-indigo-400",
    background: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  inventory: {
    icon: "text-amber-600 dark:text-amber-400",
    background: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
  },
} as const;

// Trend Colors (up/down indicators)
export const TREND_COLORS = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  neutral: "text-gray-600 dark:text-gray-400",
} as const;

// Helper Functions
export function getStatusColor(status: keyof typeof STATUS_COLORS) {
  return STATUS_COLORS[status] || STATUS_COLORS.pending;
}

export function getRoleColor(role: string): string {
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS.customer;
}

export function getPriorityColor(priority: keyof typeof PRIORITY_COLORS) {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.info;
}

export function getMetricColor(metric: keyof typeof METRIC_COLORS) {
  return METRIC_COLORS[metric] || METRIC_COLORS.customers;
}

export function getTrendColor(value: number): string {
  if (value > 0) return TREND_COLORS.up;
  if (value < 0) return TREND_COLORS.down;
  return TREND_COLORS.neutral;
}

// Status Display Names (for UI)
export const STATUS_LABELS = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  arrived: "มาถึงแล้ว",
  in_progress: "กำลังให้บริการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  no_show: "ไม่มา",
} as const;

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  clinic_owner: "เจ้าของคลินิก",
  clinic_staff: "พนักงาน",
  sales_staff: "ฝ่ายขาย",
  customer: "ลูกค้า",
  premium_customer: "ลูกค้า VIP",
} as const;
