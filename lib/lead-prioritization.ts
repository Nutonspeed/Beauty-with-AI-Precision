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
  analysisTimestamp?: Date
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

/**
 * Calculate priority score for a lead
 * @param lead Lead data
 * @returns Priority score with breakdown
 */
export function calculatePriorityScore(lead: LeadData): PriorityScore {
  let totalScore = 0
  const breakdown = {
    onlineBonus: 0,
    aiScoreBonus: 0,
    valueBonus: 0,
    timeBonus: 0,
    engagementBonus: 0
  }

  // 1. Online Status Bonus (+50 points)
  if (lead.isOnline) {
    breakdown.onlineBonus = 50
    totalScore += 50
  }

  // 2. AI Score Bonus (Lower score = Higher priority)
  if (lead.score < 60) {
    breakdown.aiScoreBonus = 50 // Critical issues
    totalScore += 50
  } else if (lead.score < 70) {
    breakdown.aiScoreBonus = 30 // High priority issues
    totalScore += 30
  } else if (lead.score < 80) {
    breakdown.aiScoreBonus = 15 // Medium priority
    totalScore += 15
  }

  // 3. Estimated Value Bonus
  if (lead.estimatedValue >= 75000) {
    breakdown.valueBonus = 30 // VIP leads
    totalScore += 30
  } else if (lead.estimatedValue >= 50000) {
    breakdown.valueBonus = 20 // High value
    totalScore += 20
  } else if (lead.estimatedValue >= 30000) {
    breakdown.valueBonus = 10 // Medium value
    totalScore += 10
  }

  // 4. Time Since Analysis Bonus (Fresher = Higher priority)
  if (lead.analysisTimestamp) {
    const minutesSinceAnalysis = (Date.now() - lead.analysisTimestamp.getTime()) / 1000 / 60

    if (minutesSinceAnalysis <= 5) {
      breakdown.timeBonus = 15 // Very fresh
      totalScore += 15
    } else if (minutesSinceAnalysis <= 15) {
      breakdown.timeBonus = 10 // Fresh
      totalScore += 10
    } else if (minutesSinceAnalysis <= 30) {
      breakdown.timeBonus = 5 // Recent
      totalScore += 5
    }
  }

  // 5. Engagement Bonus (More engagement = Higher interest)
  if (lead.engagementCount) {
    if (lead.engagementCount >= 5) {
      breakdown.engagementBonus = 20 // High engagement
      totalScore += 20
    } else if (lead.engagementCount >= 3) {
      breakdown.engagementBonus = 10 // Medium engagement
      totalScore += 10
    } else if (lead.engagementCount >= 1) {
      breakdown.engagementBonus = 5 // Some engagement
      totalScore += 5
    }
  }

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
