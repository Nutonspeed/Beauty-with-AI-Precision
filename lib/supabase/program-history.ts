/**
 * Supabase integration for program history management
 */

import { createClient } from '@supabase/supabase-js';
import { ProgramType, ProgramHistory, UserProfile } from '../ai/program-recommender';
import { EnhancedMetricsResult } from '../ai/enhanced-skin-metrics';

// Supabase types for database tables
export interface ProgramHistoryRecord {
  id: string;
  user_id: string;
  program_type: ProgramType;
  program_date: string;
  effectiveness: number;
  side_effects: string[];
  notes?: string;
  cost?: number;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRecord {
  id: string;
  user_id: string;
  age: number;
  skin_type: string;
  allergies: string[];
  medications: string[];
  budget_min?: number;
  budget_max?: number;
  downtime_preference: 'none' | 'minimal' | 'flexible';
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistoryRecord {
  id: string;
  user_id: string;
  analysis_date: string;
  metrics: EnhancedMetricsResult;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

/**
 * Program history manager with Supabase backend
 */
export class ProgramHistoryManager {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Initialize Supabase client
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
  this.supabase = createClient(url, key);
  }

  /**
   * Get current user ID from Supabase auth
   */
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Create or update user profile
   */
  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfileRecord | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const profileData: Partial<UserProfileRecord> = {
      user_id: userId,
      age: profile.age,
      skin_type: profile.skinType,
      allergies: profile.allergies || [],
      medications: profile.medications || [],
      budget_min: profile.budget?.min,
      budget_max: profile.budget?.max,
      downtime_preference: profile.downtimePreference || 'flexible',
      updated_at: new Date().toISOString(),
    };

    // Check if profile exists
    const { data: existing } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle<{ id: string }>();

    if (existing) {
      // Update existing profile
      const { data, error } = await (this.supabase
        .from('user_profiles') as any)
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfileRecord;
    } else {
      // Insert new profile
      const { data, error } = await (this.supabase
        .from('user_profiles') as any)
        .insert({ ...profileData, created_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      return data as UserProfileRecord;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle<UserProfileRecord>();

    if (error || !data) return null;

    const record = data as UserProfileRecord;

    // Get program history
    const programs = await this.getProgramHistory();

    return {
      age: record.age,
      skinType: record.skin_type,
      allergies: record.allergies,
      medications: record.medications,
      previousPrograms: programs,
      budget: record.budget_min && record.budget_max ? {
        min: record.budget_min,
        max: record.budget_max,
      } : undefined,
      downtimePreference: record.downtime_preference,
    };
  }

  /**
   * Add program to history
   */
  async addProgram(program: Omit<ProgramHistory, 'date'> & {
    cost?: number;
    provider?: string;
  }): Promise<ProgramHistoryRecord | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const programData: Partial<ProgramHistoryRecord> = {
      user_id: userId,
      program_type: program.programType,
      program_date: new Date().toISOString(),
      effectiveness: program.effectiveness,
      side_effects: program.sideEffects,
      notes: program.notes,
      cost: program.cost,
      provider: program.provider,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (this.supabase
      .from('program_history') as any)
      .insert(programData)
      .select()
      .single();

    if (error) throw error;
    return data as ProgramHistoryRecord;
  }

  /**
   * Get program history for current user
   */
  async getProgramHistory(limit?: number): Promise<ProgramHistory[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    let query = this.supabase
      .from('program_history')
      .select('*')
      .eq('user_id', userId)
      .order('program_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    const records = data as ProgramHistoryRecord[];

    return records.map(record => ({
      programType: record.program_type,
      date: new Date(record.program_date),
      effectiveness: record.effectiveness,
      sideEffects: record.side_effects,
      notes: record.notes,
    }));
  }

  /**
   * Update program effectiveness rating
   */
  async updateProgramEffectiveness(
    programId: string,
    effectiveness: number,
    notes?: string
  ): Promise<void> {
    const { error } = await (this.supabase
      .from('program_history') as any)
      .update({
        effectiveness,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);

    if (error) throw error;
  }

  /**
   * Save analysis result to history
   */
  async saveAnalysis(
    metrics: EnhancedMetricsResult,
    photoUrl?: string,
    notes?: string
  ): Promise<AnalysisHistoryRecord | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const analysisData: Partial<AnalysisHistoryRecord> = {
      user_id: userId,
      analysis_date: new Date().toISOString(),
      metrics,
      photo_url: photoUrl,
      notes,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (this.supabase
      .from('analysis_history') as any)
      .insert(analysisData)
      .select()
        .single();

  if (error) throw error;
    return data as AnalysisHistoryRecord;
  }

  /**
   * Get analysis history for progress tracking
   */
  async getAnalysisHistory(limit?: number): Promise<{
    date: Date;
    metrics: EnhancedMetricsResult;
    photoUrl?: string;
  }[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    let query = this.supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

  const { data, error } = await query;

    if (error || !data) return [];

    const records = data as AnalysisHistoryRecord[];

    return records.map(record => ({
      date: new Date(record.analysis_date),
      metrics: record.metrics,
      photoUrl: record.photo_url,
    }));
  }

  /**
   * Get latest analysis
   */
  async getLatestAnalysis(): Promise<EnhancedMetricsResult | null> {
    const history = await this.getAnalysisHistory(1);
    return history.length > 0 ? history[0].metrics : null;
  }

  /**
   * Compare current analysis with previous
   */
  async getProgressComparison(currentMetrics: EnhancedMetricsResult): Promise<{
    previous: EnhancedMetricsResult | null;
    improvements: {
      spots: number;
      pores: number;
      wrinkles: number;
      texture: number;
      redness: number;
      hydration: number;
      skinTone: number;
      elasticity: number;
      overallHealth: number;
    } | null;
  }> {
    const history = await this.getAnalysisHistory(2);
    
    if (history.length < 2) {
      return { previous: null, improvements: null };
    }

    const previous = history[1].metrics;
    
    const improvements = {
      spots: currentMetrics.spots.score - previous.spots.score,
      pores: currentMetrics.pores.score - previous.pores.score,
      wrinkles: currentMetrics.wrinkles.score - previous.wrinkles.score,
      texture: currentMetrics.texture.score - previous.texture.score,
      redness: currentMetrics.redness.score - previous.redness.score,
      hydration: currentMetrics.hydration.score - previous.hydration.score,
      skinTone: currentMetrics.skinTone.score - previous.skinTone.score,
      elasticity: currentMetrics.elasticity.score - previous.elasticity.score,
      overallHealth: currentMetrics.overallHealth.score - previous.overallHealth.score,
    };

    return { previous, improvements };
  }

  /**
   * Delete program from history
   */
  async deleteProgram(programId: string): Promise<void> {
    const { error } = await this.supabase
      .from('program_history')
      .delete()
      .eq('id', programId);

    if (error) throw error;
  }

  /**
   * Get program statistics
   */
  async getProgramStats(): Promise<{
    totalPrograms: number;
    averageEffectiveness: number;
    mostEffectiveProgram: ProgramType | null;
    totalSpent: number;
  }> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      return {
        totalPrograms: 0,
        averageEffectiveness: 0,
        mostEffectiveProgram: null,
        totalSpent: 0,
      };
    }

    const { data, error } = await this.supabase
      .from('program_history')
      .select('*')
      .eq('user_id', userId);

    const typedData = (data as ProgramHistoryRecord[] | null) ?? null;

    if (error || !typedData || typedData.length === 0) {
      return {
        totalPrograms: 0,
        averageEffectiveness: 0,
        mostEffectiveProgram: null,
        totalSpent: 0,
      };
    }

    const totalEffectiveness = typedData.reduce((sum, p) => sum + p.effectiveness, 0);
    const averageEffectiveness = totalEffectiveness / typedData.length;

    const programEffectiveness = new Map<ProgramType, number[]>();
    typedData.forEach(p => {
      const existing = programEffectiveness.get(p.program_type) || [];
      existing.push(p.effectiveness);
      programEffectiveness.set(p.program_type, existing);
    });

    let mostEffectiveProgram: ProgramType | null = null;
    let highestAvg = 0;
    programEffectiveness.forEach((values, type) => {
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        mostEffectiveProgram = type;
      }
    });

    const totalSpent = typedData.reduce((sum, p) => sum + (p.cost || 0), 0);

    return {
      totalPrograms: typedData.length,
      averageEffectiveness,
      mostEffectiveProgram,
      totalSpent,
    };
  }
}

// Export singleton instance
export const programHistoryManager = new ProgramHistoryManager();
