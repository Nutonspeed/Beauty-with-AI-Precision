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
// Canonical Supabase User Roles (normalized via normalizeRole). Added 'public'.
export type UserRole = 
  | 'public'
  | 'center_owner'
  | 'center_admin'
  | 'sales_staff'
  | 'center_staff'
  | 'customer'
  | 'customer_free'
  | 'customer_premium'
  | 'customer_aesthetic'
  | 'super_admin'

// Analysis Tier - ไม่มีใน DB, คำนวณจาก role
export type AnalysisTier = 'free' | 'premium' | 'aesthetic'

export interface Database {
  public: {
    Tables: {
      // ตารางจริงที่มีอยู่ใน DB
      users: {
        Row: {
          id: string
          center_id: string | null
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
          center_id?: string | null
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
          center_id?: string | null
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
          center_id: string | null
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
          customer_info: Json | null
          appointment_id: string | null
          program_plan_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          center_id?: string | null
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
          customer_info?: Json | null
          appointment_id?: string | null
          program_plan_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          center_id?: string | null
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
          customer_info?: Json | null
          appointment_id?: string | null
          program_plan_id?: string | null
          created_at?: string
        }
      }
      centers: {
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
import { normalizeRole } from '../lib/auth/role-normalize'

export function parseUserRole(role: string): UserRole {
  const normalized = normalizeRole(role)
  // normalizeRole may return canonical roles including 'public' & 'customer_free'
  // Cast is safe because CanonicalRole ⊆ UserRole; fallback already handled inside normalizeRole.
  return normalized as UserRole
}

// Helper: แปลง role เป็น tier
export function getRoleTier(role: UserRole): AnalysisTier {
  switch (role) {
    case 'center_owner':
    case 'super_admin':
    case 'customer_aesthetic':
      return 'aesthetic'
    case 'sales_staff':
    case 'center_staff':
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
    'basic_analysis': ['free', 'premium', 'aesthetic'],
    'advanced_analysis': ['premium', 'aesthetic'],
    'ai_recommendations': ['premium', 'aesthetic'],
    'comparison': ['premium', 'aesthetic'],
    'history': ['premium', 'aesthetic'],
    'export': ['premium', 'aesthetic'],
    'center_management': ['aesthetic'],
    'multi_user': ['aesthetic'],
    'api_access': ['aesthetic'],
  }
  
  const allowedTiers = featureMap[feature] || []
  return allowedTiers.includes(tier)
}

// Customer Info Type for skin_analyses.patient_info JSONB column
export interface CustomerInfo {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  history?: string[];
  allergies?: string[];
  currentProducts?: string[];
  notes?: string;
}
