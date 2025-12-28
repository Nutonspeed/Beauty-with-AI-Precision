/**
 * Skin Analyses History API Helper
 * Helper functions for fetching and managing skin analysis history
 */

import { createClient } from '@/lib/supabase/server'

export interface SkinAnalysis {
  id: string
  user_id: string
  clinic_id?: string
  image_url?: string
  analysis_data: any
  created_at: string
  updated_at?: string
}

export async function getSkinAnalysesHistory(userId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    throw new Error(`Failed to fetch analyses: ${error.message}`)
  }
  
  return data as SkinAnalysis[]
}

export async function getSkinAnalysisById(analysisId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('id', analysisId)
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch analysis: ${error.message}`)
  }
  
  return data as SkinAnalysis
}

export async function deleteSkinAnalysis(analysisId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('skin_analyses')
    .delete()
    .eq('id', analysisId)
  
  if (error) {
    throw new Error(`Failed to delete analysis: ${error.message}`)
  }
  
  return true
}

export async function getClinicAnalyses(clinicId: string, limit = 50) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    throw new Error(`Failed to fetch clinic analyses: ${error.message}`)
  }
  
  return data as SkinAnalysis[]
}
