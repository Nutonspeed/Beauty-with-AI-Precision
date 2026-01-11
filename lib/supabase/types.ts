// Database types generated from Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "super_admin" | "center_owner" | "sales_staff" | "customer_free" | "customer_premium" | "center_admin" | "center_staff"

export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive"

export type AnalysisTier = "free" | "premium" | "aesthetic"

export type ConcernType = "wrinkle" | "pigmentation" | "pore" | "redness" | "acne" | "dark_circle"

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          role: UserRole
          center_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          role: UserRole
          center_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          role?: UserRole
          center_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      center_subscriptions: {
        Row: {
          id: string
          center_id: string
          status: string
          mrr: number
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
          plan_id: string
        }
        Insert: {
          id?: string
          center_id: string
          status: string
          mrr: number
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
          plan_id: string
        }
        Update: {
          id?: string
          center_id?: string
          status?: string
          mrr?: number
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
          plan_id?: string
        }
      }
      centers: {
        Row: {
          id: string
          name: string
          slug: string
          email: string | null
          phone: string | null
          address: string | null
          is_active: boolean
          subscription_plan: string | null
          subscription_status: string | null
          created_at: string
          updated_at: string
          settings: Json
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          subscription_plan?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          subscription_plan?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
          settings?: Json
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          skin_type: SkinType | null
          primary_concerns: Json
          allergies: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_type?: SkinType | null
          primary_concerns?: Json
          allergies?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_type?: SkinType | null
          primary_concerns?: Json
          allergies?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      skin_analyses: {
        Row: {
          id: string
          user_id: string
          image_url: string
          thumbnail_url: string | null
          concerns: Json
          heatmap_data: Json | null
          metrics: Json
          ai_version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          thumbnail_url?: string | null
          concerns?: Json
          heatmap_data?: Json | null
          metrics?: Json
          ai_version: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          thumbnail_url?: string | null
          concerns?: Json
          heatmap_data?: Json | null
          metrics?: Json
          ai_version?: string
          created_at?: string
        }
      }
      treatment_plans: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          concern_type: string
          treatments: Json
          schedule: Json
          estimated_cost: number | null
          estimated_duration: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          concern_type: string
          treatments?: Json
          schedule?: Json
          estimated_cost?: number | null
          estimated_duration?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          concern_type?: string
          treatments?: Json
          schedule?: Json
          estimated_cost?: number | null
          estimated_duration?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          treatment_type: string
          appointment_date: string
          duration: number
          status: BookingStatus
          notes: string | null
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          treatment_type: string
          appointment_date: string
          duration: number
          status?: BookingStatus
          notes?: string | null
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          treatment_type?: string
          appointment_date?: string
          duration?: number
          status?: BookingStatus
          notes?: string | null
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
