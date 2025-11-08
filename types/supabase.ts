/**
 * Supabase Database Types
 * ปรับให้ตรงกับโครงสร้างฐานข้อมูลที่มีอยู่จริง (16 tables)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// User Roles (เป็น string ธรรมดา ไม่ใช่ ENUM ใน DB)
export type UserRole = 
  | 'clinic_owner'
  | 'sales_staff'
  | 'clinic_staff'
  | 'customer'
  | 'customer_free'
  | 'customer_premium'
  | 'customer_clinical'
  | 'super_admin'

// Analysis Tier - ไม่มีใน DB, คำนวณจาก role
export type AnalysisTier = 'free' | 'premium' | 'clinical'

export interface Database {
  public: {
    Tables: {
      // ตารางจริงที่มีอยู่ใน DB
      users: {
        Row: {
          id: string
          clinic_id: string | null
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string  // TEXT ไม่ใช่ ENUM
          permissions: Json | null  // JSONB
          last_login_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          clinic_id?: string | null
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          permissions?: Json | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          permissions?: Json | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skin_analyses: {
        Row: {
          id: string
          clinic_id: string | null
          customer_id: string | null
          analyzed_by: string | null
          image_url: string
          image_metadata: Json | null
          overall_score: number | null
          confidence_level: number | null
          metrics: Json | null
          concerns: string[] | null
          recommendations: Json | null
          processing_time_ms: number | null
          ai_model_version: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id?: string | null
          customer_id?: string | null
          analyzed_by?: string | null
          image_url: string
          image_metadata?: Json | null
          overall_score?: number | null
          confidence_level?: number | null
          metrics?: Json | null
          concerns?: string[] | null
          recommendations?: Json | null
          processing_time_ms?: number | null
          ai_model_version?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          customer_id?: string | null
          analyzed_by?: string | null
          image_url?: string
          image_metadata?: Json | null
          overall_score?: number | null
          confidence_level?: number | null
          metrics?: Json | null
          concerns?: string[] | null
          recommendations?: Json | null
          processing_time_ms?: number | null
          ai_model_version?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          slug: string | null
          email: string | null
          phone: string | null
          logo_url: string | null
          plan_tier: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          email?: string | null
          phone?: string | null
          logo_url?: string | null
          plan_tier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          email?: string | null
          phone?: string | null
          logo_url?: string | null
          plan_tier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Helper: แปลง string role เป็น UserRole type
export function parseUserRole(role: string): UserRole {
  const validRoles: UserRole[] = [
    'clinic_owner',
    'sales_staff', 
    'clinic_staff',
    'customer',
    'customer_free', 
    'customer_premium', 
    'customer_clinical',
    'super_admin'
  ]
  
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole
  }
  
  // Legacy role mapping
  if (role === 'free_user') return 'customer_free'
  if (role === 'premium_customer') return 'customer_premium'
  
  return 'customer_free' // default
}

// Helper: แปลง role เป็น tier
export function getRoleTier(role: UserRole): AnalysisTier {
  switch (role) {
    case 'clinic_owner':
    case 'super_admin':
    case 'customer_clinical':
      return 'clinical'
    case 'sales_staff':
    case 'clinic_staff':
    case 'customer_premium':
      return 'premium'
    case 'customer':
    case 'customer_free':
    default:
      return 'free'
  }
}

// Helper: เช็คว่า role มีสิทธิ์เข้าถึง feature หรือไม่
export function hasFeatureAccess(role: UserRole, feature: string): boolean {
  const tier = getRoleTier(role)
  
  const featureMap: Record<string, AnalysisTier[]> = {
    'basic_analysis': ['free', 'premium', 'clinical'],
    'advanced_analysis': ['premium', 'clinical'],
    'ai_recommendations': ['premium', 'clinical'],
    'comparison': ['premium', 'clinical'],
    'history': ['premium', 'clinical'],
    'export': ['premium', 'clinical'],
    'clinic_management': ['clinical'],
    'multi_user': ['clinical'],
    'api_access': ['clinical'],
  }
  
  const allowedTiers = featureMap[feature] || []
  return allowedTiers.includes(tier)
}
