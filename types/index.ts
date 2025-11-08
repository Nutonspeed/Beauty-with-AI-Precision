// Central types export file
export * from './api';
export * from './multi-tenant';
export * from './next-auth';
export * from './progress';
export * from './supabase';
export * from './treatment';
export * from './websocket-client';
export * from './websocket';

// Explicit exports to resolve conflicts
export type { ApiResponse } from './api';
export type { UserRole } from './supabase';
export type { TreatmentRecommendation } from './treatment';

// Re-export from lib/types for convenience
export type { SkinConcern } from '../lib/types/skin-analysis';
export type { VISIAAnalysisResult } from '../lib/skin-condition-alert-system';
export type { SkinAnalysisResult as AnalysisResults } from '../lib/ai/types-phase1';