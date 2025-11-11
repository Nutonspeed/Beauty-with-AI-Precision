// ============================================================================
// Phase 5: Clinic Admin Dashboard - TypeScript Type Definitions
// ============================================================================

// ============================================================================
// Database Models
// ============================================================================

export interface CustomerNote {
  id: string;
  clinic_id: string;
  customer_id: string;
  staff_id: string | null;
  note_type: 'general' | 'treatment' | 'concern' | 'follow_up' | 'complaint';
  content: string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (populated when joined)
  staff?: {
    id: string;
    name: string;
  };
}

export interface StaffSchedule {
  id: string;
  clinic_id: string;
  staff_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  staff?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ClinicService {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: string;
  clinic_id: string;
  appointment_id: string;
  amount: number;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'promptpay' | 'other';
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  payment_date: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  appointment?: {
    id: string;
    appointment_date: string;
    customer: {
      id: string;
      name: string;
    };
  };
}

export interface ClinicStatsCache {
  id: string;
  clinic_id: string;
  stat_date: string; // YYYY-MM-DD
  total_bookings: number;
  total_revenue: number;
  completed_bookings: number;
  cancelled_bookings: number;
  new_customers: number;
  total_customers: number;
  active_staff: number;
  stats_json: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  clinic_id: string | null;
  user_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  bookings_today: number;
  pending_analyses: number;
  active_customers: number;
  staff_on_duty: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
}

export interface RevenueChartData {
  date: string; // YYYY-MM-DD
  revenue: number;
  bookings: number;
}

export interface TopService {
  service_name: string;
  booking_count: number;
  total_revenue: number;
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  completed_bookings: number;
  total_revenue: number;
  average_rating: number | null;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Dashboard
export interface GetDashboardStatsResponse {
  stats: DashboardStats;
  revenueChart: RevenueChartData[];
  topServices: TopService[];
  recentActivity: ActivityLog[];
}

// Customer Notes
export interface CreateCustomerNoteRequest {
  customer_id: string;
  note_type: CustomerNote['note_type'];
  content: string;
  is_important?: boolean;
}

export interface UpdateCustomerNoteRequest {
  note_type?: CustomerNote['note_type'];
  content?: string;
  is_important?: boolean;
}

export interface GetCustomerNotesResponse {
  notes: CustomerNote[];
  total: number;
}

// Staff Schedules
export interface CreateStaffScheduleRequest {
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  notes?: string;
}

export interface UpdateStaffScheduleRequest {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  notes?: string;
}

export interface GetStaffScheduleResponse {
  staff_id: string;
  staff_name: string;
  schedules: StaffSchedule[];
}

export interface WeeklySchedule {
  [day: number]: StaffSchedule;
}

// Clinic Services
export interface CreateServiceRequest {
  name: string;
  description?: string;
  category?: string;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  duration_minutes?: number;
  price?: number;
  is_active?: boolean;
  display_order?: number;
}

export interface GetServicesResponse {
  services: ClinicService[];
  total: number;
}

// Booking Payments
export interface CreatePaymentRequest {
  appointment_id: string;
  amount: number;
  payment_method: BookingPayment['payment_method'];
  payment_date?: string;
  transaction_id?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  payment_method?: BookingPayment['payment_method'];
  payment_status?: BookingPayment['payment_status'];
  payment_date?: string;
  transaction_id?: string;
  notes?: string;
}

export interface GetPaymentsResponse {
  payments: BookingPayment[];
  total: number;
  total_amount: number;
}

// Activity Log
export interface CreateActivityLogRequest {
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface GetActivityLogResponse {
  activities: ActivityLog[];
  total: number;
}

// ============================================================================
// Enhanced Existing Types
// ============================================================================

export interface EnhancedAppointment {
  id: string;
  clinic_id: string;
  customer_id: string;
  staff_id: string | null;
  branch_id: string | null;
  service_id: string | null; // New: link to clinic_services
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  check_in_time: string | null; // New
  check_out_time: string | null; // New
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Relations
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  staff?: {
    id: string;
    name: string;
  };
  service?: ClinicService;
  payment?: BookingPayment;
}

export interface EnhancedStaffMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: 'clinic_owner' | 'manager' | 'sales_staff' | 'receptionist' | 'therapist';
  specialization: string | null; // New
  hire_date: string | null;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  commission_rate: number;
  weekly_hours: number | null; // New
  hourly_rate: number | null; // New
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
  schedules?: StaffSchedule[];
  performance?: StaffPerformance;
}

export interface EnhancedCustomer {
  id: string;
  clinic_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  skin_type: string | null;
  allergies: string | null;
  notes: string | null;
  tags: string[];
  status: 'active' | 'inactive' | 'archived';
  last_visit_date: string | null; // New - computed
  total_visits: number; // New - computed
  lifetime_value: number; // New - computed
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Relations
  customer_notes?: CustomerNote[];
  appointments?: EnhancedAppointment[];
  treatment_plans?: any[]; // Reference to existing type
}

// ============================================================================
// Filter Types
// ============================================================================

export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  status?: EnhancedAppointment['status'] | EnhancedAppointment['status'][];
  staff_id?: string;
  customer_id?: string;
  branch_id?: string;
  service_id?: string;
  has_payment?: boolean;
  payment_status?: BookingPayment['payment_status'];
}

export interface CustomerFilters {
  status?: EnhancedCustomer['status'] | EnhancedCustomer['status'][];
  skin_type?: string;
  tags?: string[];
  has_allergies?: boolean;
  created_from?: string;
  created_to?: string;
  last_visit_from?: string;
  last_visit_to?: string;
  min_visits?: number;
  max_visits?: number;
  min_lifetime_value?: number;
  max_lifetime_value?: number;
  search?: string; // Search by name, email, or phone
}

export interface StaffFilters {
  role?: EnhancedStaffMember['role'] | EnhancedStaffMember['role'][];
  status?: EnhancedStaffMember['status'] | EnhancedStaffMember['status'][];
  specialization?: string;
  branch_id?: string;
}

export interface PaymentFilters {
  date_from?: string;
  date_to?: string;
  payment_status?: BookingPayment['payment_status'] | BookingPayment['payment_status'][];
  payment_method?: BookingPayment['payment_method'] | BookingPayment['payment_method'][];
  min_amount?: number;
  max_amount?: number;
  customer_id?: string;
}

export interface ActivityLogFilters {
  action_type?: string | string[];
  entity_type?: string | string[];
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsDateRange {
  start_date: string;
  end_date: string;
}

export interface RevenueAnalytics {
  total_revenue: number;
  total_bookings: number;
  average_booking_value: number;
  revenue_by_service: {
    service_name: string;
    revenue: number;
    percentage: number;
  }[];
  revenue_by_payment_method: {
    payment_method: string;
    revenue: number;
    percentage: number;
  }[];
  daily_revenue: RevenueChartData[];
}

export interface CustomerAnalytics {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_retention_rate: number;
  average_lifetime_value: number;
  customers_by_skin_type: {
    skin_type: string;
    count: number;
    percentage: number;
  }[];
}

export interface StaffAnalytics {
  total_staff: number;
  active_staff: number;
  staff_performance: StaffPerformance[];
  bookings_by_staff: {
    staff_name: string;
    bookings: number;
    percentage: number;
  }[];
}

export interface BookingAnalytics {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  completion_rate: number;
  cancellation_rate: number;
  bookings_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  bookings_by_service: {
    service_name: string;
    count: number;
    percentage: number;
  }[];
  peak_booking_times: {
    hour: number;
    count: number;
  }[];
  peak_booking_days: {
    day: string;
    count: number;
  }[];
}

export interface ComprehensiveAnalytics {
  date_range: AnalyticsDateRange;
  revenue: RevenueAnalytics;
  customers: CustomerAnalytics;
  staff: StaffAnalytics;
  bookings: BookingAnalytics;
  generated_at: string;
}

// ============================================================================
// Export Helper Types
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  columns?: string[];
  include_summary?: boolean;
}

export interface ExportResponse {
  url: string;
  filename: string;
  expires_at: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_confirmed: boolean;
  booking_reminder: boolean;
  booking_cancelled: boolean;
  payment_received: boolean;
  new_customer: boolean;
  daily_summary: boolean;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface ClinicSettings {
  clinic_id: string;
  
  // Booking Settings
  booking_settings: {
    allow_online_booking: boolean;
    require_payment: boolean;
    cancellation_hours: number;
    auto_confirm: boolean;
    buffer_time_minutes: number;
  };
  
  // Notification Settings
  notification_settings: NotificationPreferences;
  
  // Business Hours
  business_hours: {
    [day: number]: {
      is_open: boolean;
      open_time: string;
      close_time: string;
    };
  };
  
  // Payment Settings
  payment_settings: {
    accepted_methods: BookingPayment['payment_method'][];
    require_deposit: boolean;
    deposit_percentage: number;
  };
}
