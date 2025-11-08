/**
 * Treatment Recommendation Engine
 * AI-powered algorithm to recommend treatments based on skin analysis
 */

import type { 
  Treatment, 
  TreatmentRecommendation, 
  RecommendationCriteria,
  RecommendationResult 
} from '@/types/treatment'

interface AnalysisResults {
  spots?: { count?: number; severity?: number }
  pores?: { count?: number; size?: number }
  wrinkles?: { severity?: number }
  texture?: { score?: number }
  redness?: { level?: number }
  overall_score?: number
}

/**
 * Main recommendation engine
 * Analyzes skin concerns and matches with most effective treatments
 */
export async function generateTreatmentRecommendations(
  analysisResults: AnalysisResults,
  criteria: RecommendationCriteria
): Promise<RecommendationResult> {
  // 1. Get all active treatments from database
  const allTreatments = await fetchActiveTreatments()

  // 2. Score each treatment based on analysis results
  const scoredTreatments = allTreatments.map(treatment => ({
    treatment,
    score: calculateTreatmentScore(treatment, analysisResults, criteria)
  }))

  // 3. Filter and sort by score
  const topTreatments = scoredTreatments
    .filter(t => t.score > 0.3) // Minimum 30% match
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Top 10 recommendations

  // 4. Create personalized recommendations
  const recommendations: TreatmentRecommendation[] = topTreatments.map((item, index) => ({
    id: '', // Will be set by database
    analysis_id: '',
    treatment_id: item.treatment.id,
    treatment: item.treatment,
    priority: index + 1,
    confidence_score: item.score,
    estimated_cost_min: calculateCost(item.treatment, criteria, 'min'),
    estimated_cost_max: calculateCost(item.treatment, criteria, 'max'),
    estimated_sessions: estimateSessions(item.treatment, analysisResults),
    predicted_improvement: predictImprovement(item.treatment, analysisResults),
    timeline_weeks: calculateTimeline(item.treatment),
    recommendation_reason: generateReason(item.treatment, analysisResults),
    target_concerns: identifyTargetConcerns(item.treatment, analysisResults),
    status: 'suggested',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  // 5. Calculate totals
  const totalCostMin = recommendations.reduce((sum, r) => sum + r.estimated_cost_min, 0)
  const totalCostMax = recommendations.reduce((sum, r) => sum + r.estimated_cost_max, 0)
  const totalTimeline = Math.max(...recommendations.map(r => r.timeline_weeks))
  const avgImprovement = recommendations.reduce((sum, r) => sum + r.predicted_improvement, 0) / recommendations.length

  return {
    recommended_treatments: recommendations,
    recommended_packages: [], // TODO: Package recommendation logic
    total_estimated_cost_min: totalCostMin,
    total_estimated_cost_max: totalCostMax,
    total_timeline_weeks: totalTimeline,
    overall_predicted_improvement: Math.round(avgImprovement)
  }
}

/**
 * Calculate treatment score based on effectiveness for detected concerns
 */
function calculateTreatmentScore(
  treatment: Treatment,
  analysis: AnalysisResults,
  criteria: RecommendationCriteria
): number {
  let score = 0
  let factorCount = 0

  // 1. Effectiveness matching (60% weight)
  if (analysis.spots && treatment.effectiveness_spots) {
    const severity = analysis.spots.severity || 0
    const effectiveness = treatment.effectiveness_spots / 100
    score += severity * effectiveness * 0.6
    factorCount++
  }

  if (analysis.pores && treatment.effectiveness_pores) {
    const severity = analysis.pores.size || 0
    const effectiveness = treatment.effectiveness_pores / 100
    score += severity * effectiveness * 0.6
    factorCount++
  }

  if (analysis.wrinkles && treatment.effectiveness_wrinkles) {
    const severity = analysis.wrinkles.severity || 0
    const effectiveness = treatment.effectiveness_wrinkles / 100
    score += severity * effectiveness * 0.6
    factorCount++
  }

  if (analysis.texture && treatment.effectiveness_texture) {
    const severity = 1 - (analysis.texture.score || 0)
    const effectiveness = treatment.effectiveness_texture / 100
    score += severity * effectiveness * 0.6
    factorCount++
  }

  if (analysis.redness && treatment.effectiveness_redness) {
    const severity = analysis.redness.level || 0
    const effectiveness = treatment.effectiveness_redness / 100
    score += severity * effectiveness * 0.6
    factorCount++
  }

  // 2. Budget compatibility (20% weight)
  if (criteria.budget_max) {
    const avgCost = (treatment.price_min + treatment.price_max) / 2
    if (avgCost <= criteria.budget_max) {
      const budgetScore = 1 - (avgCost / criteria.budget_max)
      score += budgetScore * 0.2
      factorCount++
    }
  }

  // 3. Downtime compatibility (10% weight)
  if (criteria.max_downtime_days !== undefined) {
    if (treatment.downtime_days <= criteria.max_downtime_days) {
      const downtimeScore = 1 - (treatment.downtime_days / (criteria.max_downtime_days || 1))
      score += downtimeScore * 0.1
      factorCount++
    }
  }

  // 4. Pain tolerance (5% weight)
  if (criteria.max_pain_level !== undefined && treatment.pain_level !== undefined) {
    if (treatment.pain_level <= criteria.max_pain_level) {
      const painScore = 1 - (treatment.pain_level / 10)
      score += painScore * 0.05
      factorCount++
    }
  }

  // 5. Popularity boost (5% weight)
  const popularityScore = treatment.popularity_score / 100
  score += popularityScore * 0.05
  factorCount++

  // Normalize score
  return factorCount > 0 ? score / factorCount : 0
}

/**
 * Calculate personalized cost estimate
 */
function calculateCost(
  treatment: Treatment,
  criteria: RecommendationCriteria,
  type: 'min' | 'max'
): number {
  const basePrice = type === 'min' ? treatment.price_min : treatment.price_max
  const sessions = (treatment.sessions_min + treatment.sessions_max) / 2
  
  // Adjust for multiple sessions
  return basePrice * sessions
}

/**
 * Estimate number of sessions needed
 */
function estimateSessions(treatment: Treatment, analysis: AnalysisResults): number {
  // More severe cases may need more sessions
  const severity = analysis.overall_score ? (1 - analysis.overall_score) : 0.5
  
  if (severity > 0.7) {
    return treatment.sessions_max
  } else if (severity > 0.4) {
    return Math.ceil((treatment.sessions_min + treatment.sessions_max) / 2)
  } else {
    return treatment.sessions_min
  }
}

/**
 * Predict improvement percentage
 */
function predictImprovement(treatment: Treatment, analysis: AnalysisResults): number {
  // Base improvement on treatment effectiveness
  const baseImprovement = treatment.effectiveness_overall

  // Adjust based on current severity (worse = more room for improvement)
  const severity = analysis.overall_score ? (1 - analysis.overall_score) : 0.5
  const severityMultiplier = 0.5 + (severity * 0.5) // 0.5 to 1.0

  return Math.round(baseImprovement * severityMultiplier)
}

/**
 * Calculate treatment timeline in weeks
 */
function calculateTimeline(treatment: Treatment): number {
  const sessions = treatment.sessions_max
  const intervalDays = treatment.interval_days || 7
  const resultsVisibleDays = treatment.results_visible_days || 7

  const treatmentDays = (sessions - 1) * intervalDays + resultsVisibleDays
  return Math.ceil(treatmentDays / 7)
}

/**
 * Generate human-readable recommendation reason
 */
function generateReason(treatment: Treatment, analysis: AnalysisResults): string {
  const concerns: string[] = []

  if (analysis.spots && treatment.effectiveness_spots && treatment.effectiveness_spots > 50) {
    concerns.push('dark spots')
  }
  if (analysis.pores && treatment.effectiveness_pores && treatment.effectiveness_pores > 50) {
    concerns.push('enlarged pores')
  }
  if (analysis.wrinkles && treatment.effectiveness_wrinkles && treatment.effectiveness_wrinkles > 50) {
    concerns.push('wrinkles')
  }
  if (analysis.redness && treatment.effectiveness_redness && treatment.effectiveness_redness > 50) {
    concerns.push('redness')
  }

  if (concerns.length === 0) {
    return `Recommended for overall skin improvement`
  }

  return `Highly effective for treating ${concerns.join(', ')}`
}

/**
 * Identify which concerns this treatment targets
 */
function identifyTargetConcerns(treatment: Treatment, analysis: AnalysisResults): string[] {
  const targets: string[] = []

  if (analysis.spots && treatment.effectiveness_spots && treatment.effectiveness_spots > 40) {
    targets.push('spots')
  }
  if (analysis.pores && treatment.effectiveness_pores && treatment.effectiveness_pores > 40) {
    targets.push('pores')
  }
  if (analysis.wrinkles && treatment.effectiveness_wrinkles && treatment.effectiveness_wrinkles > 40) {
    targets.push('wrinkles')
  }
  if (analysis.texture && treatment.effectiveness_texture && treatment.effectiveness_texture > 40) {
    targets.push('texture')
  }
  if (analysis.redness && treatment.effectiveness_redness && treatment.effectiveness_redness > 40) {
    targets.push('redness')
  }

  return targets
}

/**
 * Fetch active treatments from database (placeholder)
 * TODO: Replace with actual Supabase query
 */
async function fetchActiveTreatments(): Promise<Treatment[]> {
  // In production, this would be:
  // const { data } = await supabase.from('treatments').select('*').eq('is_active', true)
  // return data || []

  // For now, return sample data
  return getSampleTreatments()
}

/**
 * Sample treatments for development
 */
function getSampleTreatments(): Treatment[] {
  return [
    {
      id: '1',
      name: 'Botox Forehead',
      name_th: 'โบท็อกซ์หน้าผาก',
      category: 'injectable',
      subcategory: 'botox',
      price_min: 3000,
      price_max: 8000,
      price_unit: 'THB',
      price_per: 'unit',
      duration_minutes: 15,
      sessions_min: 1,
      sessions_max: 1,
      interval_days: 90,
      downtime_days: 0,
      pain_level: 2,
      effectiveness_spots: 0,
      effectiveness_pores: 0,
      effectiveness_wrinkles: 90,
      effectiveness_texture: 10,
      effectiveness_redness: 0,
      effectiveness_overall: 85,
      min_age: 25,
      max_age: 65,
      results_visible_days: 3,
      results_duration_months: 3,
      improvement_percentage_min: 70,
      improvement_percentage_max: 95,
      popularity_score: 95,
      is_active: true,
      requires_doctor: true,
      requires_consultation: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Picosecond Laser',
      name_th: 'เลเซอร์พิโคเซคคอนด์',
      category: 'laser',
      subcategory: 'pico_laser',
      price_min: 5000,
      price_max: 15000,
      price_unit: 'THB',
      price_per: 'session',
      duration_minutes: 30,
      sessions_min: 3,
      sessions_max: 6,
      interval_days: 21,
      downtime_days: 1,
      pain_level: 4,
      effectiveness_spots: 95,
      effectiveness_pores: 60,
      effectiveness_wrinkles: 30,
      effectiveness_texture: 70,
      effectiveness_redness: 40,
      effectiveness_overall: 80,
      min_age: 18,
      results_visible_days: 14,
      results_duration_months: 12,
      improvement_percentage_min: 60,
      improvement_percentage_max: 90,
      popularity_score: 90,
      is_active: true,
      requires_doctor: true,
      requires_consultation: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Hyaluronic Acid Filler',
      name_th: 'ฟิลเลอร์กรดไฮยารูโรนิก',
      category: 'injectable',
      subcategory: 'filler',
      price_min: 8000,
      price_max: 25000,
      price_unit: 'THB',
      price_per: 'syringe',
      duration_minutes: 30,
      sessions_min: 1,
      sessions_max: 2,
      downtime_days: 2,
      pain_level: 3,
      effectiveness_spots: 0,
      effectiveness_pores: 0,
      effectiveness_wrinkles: 85,
      effectiveness_texture: 40,
      effectiveness_redness: 0,
      effectiveness_overall: 75,
      min_age: 25,
      max_age: 70,
      results_visible_days: 1,
      results_duration_months: 9,
      improvement_percentage_min: 70,
      improvement_percentage_max: 95,
      popularity_score: 88,
      is_active: true,
      requires_doctor: true,
      requires_consultation: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}
