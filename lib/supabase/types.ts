// Database types generated from Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "super_admin" | "clinic_owner" | "sales_staff" | "customer_free" | "customer_premium"

export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive"

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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          slug: string
          settings: Json
          branding: Json
          features: Json
          subscription: Json
          created_at: string
          updated_at: string
          created_by: string
          is_active: boolean
          is_trial: boolean
          isolation_strategy: string
          usage: Json
        }
        Insert: {
          id?: string
          slug: string
          settings?: Json
          branding?: Json
          features?: Json
          subscription?: Json
          created_at?: string
          updated_at?: string
          created_by: string
          is_active?: boolean
          is_trial?: boolean
          isolation_strategy?: string
          usage?: Json
        }
        Update: {
          id?: string
          slug?: string
          settings?: Json
          branding?: Json
          features?: Json
          subscription?: Json
          created_at?: string
          updated_at?: string
          created_by?: string
          is_active?: boolean
          is_trial?: boolean
          isolation_strategy?: string
          usage?: Json
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
