/**
 * Lead Prioritization Algorithm
 * Calculates priority score for leads based on multiple factors
 */

export interface LeadData {
  id: string
  name: string
  age: number
  score: number
  isOnline: boolean
  estimatedValue: number
  lastActivity?: string
  analysisTimestamp?: Date | string
  engagementCount?: number
}

export interface PriorityScore {
  totalScore: number
  breakdown: {
    onlineBonus: number
    aiScoreBonus: number
    valueBonus: number
    timeBonus: number
    engagementBonus: number
  }
  priorityLevel: "critical" | "high" | "medium" | "low"
  badge: string
}

const CRITICAL_AI_BONUS = 50
const HIGH_AI_BONUS = 30
const MEDIUM_AI_BONUS = 15
const VIP_VALUE_BONUS = 30
const HIGH_VALUE_BONUS = 20
const MEDIUM_VALUE_BONUS = 10
const VERY_FRESH_BONUS = 15
const FRESH_BONUS = 10
const RECENT_BONUS = 5
const HIGH_ENGAGEMENT_BONUS = 20
const MEDIUM_ENGAGEMENT_BONUS = 10
const LOW_ENGAGEMENT_BONUS = 5

function normalizeTimestamp(timestamp?: Date | string): Date | null {
  if (!timestamp) return null
  const normalized = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return Number.isNaN(normalized.getTime()) ? null : normalized
}

function calculateAiScoreBonus(score: number): number {
  if (score < 60) return CRITICAL_AI_BONUS
  if (score < 70) return HIGH_AI_BONUS
  if (score < 80) return MEDIUM_AI_BONUS
  return 0
}

function calculateValueBonus(estimatedValue: number): number {
  if (estimatedValue >= 75000) return VIP_VALUE_BONUS
  if (estimatedValue >= 50000) return HIGH_VALUE_BONUS
  if (estimatedValue >= 30000) return MEDIUM_VALUE_BONUS
  return 0
}

function calculateTimeBonus(timestamp?: Date | string): number {
  const analysisDate = normalizeTimestamp(timestamp)
  if (!analysisDate) return 0

  const minutesSinceAnalysis = (Date.now() - analysisDate.getTime()) / 1000 / 60

  if (minutesSinceAnalysis <= 5) return VERY_FRESH_BONUS
  if (minutesSinceAnalysis <= 15) return FRESH_BONUS
  if (minutesSinceAnalysis <= 30) return RECENT_BONUS
  return 0
}

function calculateEngagementBonus(engagementCount = 0): number {
  if (engagementCount >= 5) return HIGH_ENGAGEMENT_BONUS
  if (engagementCount >= 3) return MEDIUM_ENGAGEMENT_BONUS
  if (engagementCount >= 1) return LOW_ENGAGEMENT_BONUS
  return 0
}

/**
 * Calculate priority score for a lead
 * @param lead Lead data
 * @returns Priority score with breakdown
 */
export function calculatePriorityScore(lead: LeadData): PriorityScore {
  const breakdown = {
    onlineBonus: lead.isOnline ? 50 : 0,
    aiScoreBonus: calculateAiScoreBonus(lead.score),
    valueBonus: calculateValueBonus(lead.estimatedValue),
    timeBonus: calculateTimeBonus(lead.analysisTimestamp),
    engagementBonus: calculateEngagementBonus(lead.engagementCount)
  }

  const totalScore = Object.values(breakdown).reduce((score, bonus) => score + bonus, 0)

  // Determine priority level based on total score
  let priorityLevel: "critical" | "high" | "medium" | "low"
  let badge: string

  if (totalScore >= 100) {
    priorityLevel = "critical"
    badge = "🔥 CRITICAL"
  } else if (totalScore >= 70) {
    priorityLevel = "high"
    badge = "⚡ HIGH"
  } else if (totalScore >= 40) {
    priorityLevel = "medium"
    badge = "📌 MEDIUM"
  } else {
    priorityLevel = "low"
    badge = "📋 LOW"
  }

  return {
    totalScore,
    breakdown,
    priorityLevel,
    badge
  }
}

/**
 * Sort leads by priority score (highest first)
 * @param leads Array of leads
 * @returns Sorted array with priority scores
 */
export function sortLeadsByPriority<T extends LeadData>(
  leads: T[]
): Array<T & { priorityScore: PriorityScore }> {
  return leads
    .map(lead => ({
      ...lead,
      priorityScore: calculatePriorityScore(lead)
    }))
    .sort((a, b) => b.priorityScore.totalScore - a.priorityScore.totalScore)
}

/**
 * Get priority color for UI
 * @param priorityLevel Priority level
 * @returns Tailwind color class
 */
export function getPriorityColor(priorityLevel: "critical" | "high" | "medium" | "low"): string {
  switch (priorityLevel) {
    case "critical":
      return "border-red-500 bg-red-50"
    case "high":
      return "border-orange-500 bg-orange-50"
    case "medium":
      return "border-yellow-500 bg-yellow-50"
    case "low":
      return "border-gray-300 bg-gray-50"
  }
}

/**
 * Get badge color for priority
 * @param priorityLevel Priority level
 * @returns Tailwind badge color class
 */
export function getPriorityBadgeColor(priorityLevel: "critical" | "high" | "medium" | "low"): string {
  switch (priorityLevel) {
    case "critical":
      return "bg-red-600 text-white"
    case "high":
      return "bg-orange-600 text-white"
    case "medium":
      return "bg-yellow-600 text-white"
    case "low":
      return "bg-gray-500 text-white"
  }
}

/**
 * Format time ago
 * @param date Date to format
 * @returns Human-readable time ago string
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
