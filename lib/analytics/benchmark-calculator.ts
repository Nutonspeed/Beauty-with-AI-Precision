/**
 * Benchmark Calculator
 * Phase 2 Week 5 Task 5.1
 * 
 * Calculates customer performance benchmarks against age group averages
 */

import { createServerClient } from '@/lib/supabase/server';
import { AgeGroup, BenchmarkResponse, MetricType } from '@/types/analytics';

// =============================================
// Types
// =============================================

interface CustomerScores {
  overall: number;
  spots: number;
  wrinkles: number;
  texture: number;
  pores: number;
  hydration: number;
}

interface AgeGroupData {
  ageGroup: AgeGroup;
  totalCustomers: number;
  averages: CustomerScores;
  medians: CustomerScores;
  std: CustomerScores;
}

// =============================================
// Age Group Utilities
// =============================================

/**
 * Determine age group from birthdate or age
 */
export function determineAgeGroup(birthdate?: string, age?: number): AgeGroup {
  let customerAge = age;

  if (!customerAge && birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    customerAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      customerAge--;
    }
  }

  if (!customerAge) {
    return '30-39'; // Default
  }

  if (customerAge >= 20 && customerAge <= 29) return '20-29';
  if (customerAge >= 30 && customerAge <= 39) return '30-39';
  if (customerAge >= 40 && customerAge <= 49) return '40-49';
  return '50+';
}

/**
 * Get age from birthdate
 */
export function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// =============================================
// Customer Scores
// =============================================

/**
 * Get customer's average scores
 */
export async function getCustomerAverageScores(
  customerId: string
): Promise<CustomerScores | null> {
  const supabase = await createServerClient();

  // Get customer's recent analyses (last 10)
  const { data: analyses, error } = await supabase
    .from('skin_analyses')
    .select('overall_score, ai_analysis')
    .eq('user_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !analyses || analyses.length === 0) {
    return null;
  }

  // Calculate averages
  const scores: CustomerScores = {
    overall: 0,
    spots: 0,
    wrinkles: 0,
    texture: 0,
    pores: 0,
    hydration: 0,
  };

  let count = 0;

  for (const analysis of analyses) {
    scores.overall += analysis.overall_score || 0;
    scores.spots += analysis.ai_analysis?.acne_score || 0;
    scores.wrinkles += analysis.ai_analysis?.wrinkles_score || 0;
    scores.texture += analysis.ai_analysis?.texture_score || 0;
    scores.pores += analysis.ai_analysis?.pores_score || 0;
    scores.hydration += analysis.ai_analysis?.hydration_score || 0;
    count++;
  }

  if (count === 0) return null;

  // Return averages
  return {
    overall: Math.round((scores.overall / count) * 10) / 10,
    spots: Math.round((scores.spots / count) * 10) / 10,
    wrinkles: Math.round((scores.wrinkles / count) * 10) / 10,
    texture: Math.round((scores.texture / count) * 10) / 10,
    pores: Math.round((scores.pores / count) * 10) / 10,
    hydration: Math.round((scores.hydration / count) * 10) / 10,
  };
}

// =============================================
// Age Group Averages
// =============================================

/**
 * Get age group average scores
 */
export async function getAgeGroupAverages(
  ageGroup: AgeGroup
): Promise<CustomerScores> {
  const supabase = await createServerClient();

  // Get all users in age group with analyses
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, birth_date, age')
    .not('birth_date', 'is', null);

  if (usersError || !users) {
    // Return default values if no data
    return getDefaultAgeGroupScores(ageGroup);
  }

  // Filter users by age group
  const filteredUsers = users.filter((user) => {
    const userAgeGroup = determineAgeGroup(user.birth_date, user.age);
    return userAgeGroup === ageGroup;
  });

  if (filteredUsers.length === 0) {
    return getDefaultAgeGroupScores(ageGroup);
  }

  // Get analyses for these users
  const userIds = filteredUsers.map((u) => u.id);

  const { data: analyses, error: analysesError } = await supabase
    .from('skin_analyses')
    .select('user_id, overall_score, ai_analysis, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  if (analysesError || !analyses || analyses.length === 0) {
    return getDefaultAgeGroupScores(ageGroup);
  }

  // Get most recent analysis per user
  const userLatestAnalyses = new Map<string, any>();
  for (const analysis of analyses) {
    if (!userLatestAnalyses.has(analysis.user_id)) {
      userLatestAnalyses.set(analysis.user_id, analysis);
    }
  }

  // Calculate averages
  const scores: CustomerScores = {
    overall: 0,
    spots: 0,
    wrinkles: 0,
    texture: 0,
    pores: 0,
    hydration: 0,
  };

  let count = 0;

  for (const analysis of userLatestAnalyses.values()) {
    scores.overall += analysis.overall_score || 0;
    scores.spots += analysis.ai_analysis?.acne_score || 0;
    scores.wrinkles += analysis.ai_analysis?.wrinkles_score || 0;
    scores.texture += analysis.ai_analysis?.texture_score || 0;
    scores.pores += analysis.ai_analysis?.pores_score || 0;
    scores.hydration += analysis.ai_analysis?.hydration_score || 0;
    count++;
  }

  if (count === 0) {
    return getDefaultAgeGroupScores(ageGroup);
  }

  return {
    overall: Math.round((scores.overall / count) * 10) / 10,
    spots: Math.round((scores.spots / count) * 10) / 10,
    wrinkles: Math.round((scores.wrinkles / count) * 10) / 10,
    texture: Math.round((scores.texture / count) * 10) / 10,
    pores: Math.round((scores.pores / count) * 10) / 10,
    hydration: Math.round((scores.hydration / count) * 10) / 10,
  };
}

/**
 * Default scores when no real data available
 */
function getDefaultAgeGroupScores(ageGroup: AgeGroup): CustomerScores {
  const defaults: Record<AgeGroup, CustomerScores> = {
    '20-29': {
      overall: 72,
      spots: 68,
      wrinkles: 85,
      texture: 70,
      pores: 65,
      hydration: 75,
    },
    '30-39': {
      overall: 68,
      spots: 70,
      wrinkles: 75,
      texture: 68,
      pores: 63,
      hydration: 72,
    },
    '40-49': {
      overall: 63,
      spots: 72,
      wrinkles: 62,
      texture: 65,
      pores: 60,
      hydration: 68,
    },
    '50+': {
      overall: 58,
      spots: 74,
      wrinkles: 52,
      texture: 60,
      pores: 58,
      hydration: 63,
    },
  };

  return defaults[ageGroup];
}

// =============================================
// Percentile Calculation
// =============================================

/**
 * Calculate percentile ranking
 */
export async function calculatePercentile(
  customerId: string,
  ageGroup: AgeGroup
): Promise<number> {
  const supabase = await createServerClient();

  // Get customer's average score
  const customerScores = await getCustomerAverageScores(customerId);
  if (!customerScores) return 50; // Default to median

  const customerOverall = customerScores.overall;

  // Get all users in age group
  const { data: users } = await supabase
    .from('users')
    .select('id, birth_date, age')
    .not('birth_date', 'is', null);

  if (!users) return 50;

  // Filter by age group
  const filteredUsers = users.filter((user) => {
    const userAgeGroup = determineAgeGroup(user.birth_date, user.age);
    return userAgeGroup === ageGroup;
  });

  if (filteredUsers.length === 0) return 50;

  // Get all their latest scores
  const userIds = filteredUsers.map((u) => u.id);

  const { data: analyses } = await supabase
    .from('skin_analyses')
    .select('user_id, overall_score, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  if (!analyses || analyses.length === 0) return 50;

  // Get latest score per user
  const userScores = new Map<string, number>();
  for (const analysis of analyses) {
    if (!userScores.has(analysis.user_id)) {
      userScores.set(analysis.user_id, analysis.overall_score || 0);
    }
  }

  const allScores = Array.from(userScores.values()).sort((a, b) => a - b);

  // Calculate percentile
  const lowerCount = allScores.filter((score) => score < customerOverall).length;
  const percentile = (lowerCount / allScores.length) * 100;

  return Math.round(percentile);
}

/**
 * Calculate metric-specific percentile
 */
export async function calculateMetricPercentile(
  customerId: string,
  ageGroup: AgeGroup,
  metric: MetricType
): Promise<number> {
  const supabase = await createServerClient();

  // Get customer's score
  const customerScores = await getCustomerAverageScores(customerId);
  if (!customerScores) return 50;

  const customerScore = customerScores[metric];

  // Get all scores for this metric in age group
  const { data: users } = await supabase
    .from('users')
    .select('id, birth_date, age')
    .not('birth_date', 'is', null);

  if (!users) return 50;

  const filteredUsers = users.filter((user) => {
    const userAgeGroup = determineAgeGroup(user.birth_date, user.age);
    return userAgeGroup === ageGroup;
  });

  if (filteredUsers.length === 0) return 50;

  const userIds = filteredUsers.map((u) => u.id);

  const { data: analyses } = await supabase
    .from('skin_analyses')
    .select('user_id, overall_score, ai_analysis, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  if (!analyses || analyses.length === 0) return 50;

  // Extract metric values
  const userScores = new Map<string, number>();
  for (const analysis of analyses) {
    if (userScores.has(analysis.user_id)) continue;

    let score = 0;
    switch (metric) {
      case 'overall':
        score = analysis.overall_score || 0;
        break;
      case 'spots':
        score = analysis.ai_analysis?.acne_score || 0;
        break;
      case 'wrinkles':
        score = analysis.ai_analysis?.wrinkles_score || 0;
        break;
      case 'texture':
        score = analysis.ai_analysis?.texture_score || 0;
        break;
      case 'pores':
        score = analysis.ai_analysis?.pores_score || 0;
        break;
      case 'hydration':
        score = analysis.ai_analysis?.hydration_score || 0;
        break;
    }

    userScores.set(analysis.user_id, score);
  }

  const allScores = Array.from(userScores.values()).sort((a, b) => a - b);
  const lowerCount = allScores.filter((score) => score < customerScore).length;
  const percentile = (lowerCount / allScores.length) * 100;

  return Math.round(percentile);
}

// =============================================
// Main Benchmark Function
// =============================================

/**
 * Calculate complete benchmark response
 */
export async function calculateBenchmark(
  customerId: string,
  ageGroup?: AgeGroup
): Promise<BenchmarkResponse | null> {
  const supabase = await createServerClient();

  // Determine age group if not provided
  let customerAgeGroup = ageGroup;

  if (!customerAgeGroup) {
    const { data: user } = await supabase
      .from('users')
      .select('birth_date, age')
      .eq('id', customerId)
      .single();

    if (user) {
      customerAgeGroup = determineAgeGroup(user.birth_date, user.age);
    } else {
      customerAgeGroup = '30-39'; // Default
    }
  }

  // Get customer scores
  const customerScores = await getCustomerAverageScores(customerId);
  if (!customerScores) return null;

  // Get group averages
  const groupAverages = await getAgeGroupAverages(customerAgeGroup);

  // Calculate percentile
  const percentile = await calculatePercentile(customerId, customerAgeGroup);

  return {
    customerScores,
    groupAverages,
    percentile,
    betterThan: percentile,
    ageGroup: customerAgeGroup,
  };
}
