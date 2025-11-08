"use client"

/**
 * Marketing Automation Hooks
 * 
 * React hooks for campaign management, segmentation, and analytics.
 */

import { useState, useEffect, useCallback } from "react"
import CampaignManager, {
  Campaign,
  CampaignFilters,
  CustomerSegment,
  MessageLog,
  MessageLogFilters,
  CampaignAnalytics,
  ABTest,
  AutomationWorkflow,
  TemplateLibrary,
  CampaignType,
} from "@/lib/marketing/campaign-manager"

const manager = CampaignManager.getInstance()

// ==================== Campaign Hooks ====================

export function useCampaigns(filters?: CampaignFilters) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCampaigns = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getAllCampaigns(filters)
      setCampaigns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const createCampaign = useCallback(
    (data: Omit<Campaign, "id" | "reached" | "actualSpent" | "createdAt" | "updatedAt">) => {
      try {
        const campaign = manager.createCampaign(data)
        loadCampaigns()
        return campaign
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  const updateCampaign = useCallback(
    (id: string, updates: Partial<Campaign>) => {
      try {
        const campaign = manager.updateCampaign(id, updates)
        loadCampaigns()
        return campaign
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  const deleteCampaign = useCallback(
    (id: string) => {
      try {
        manager.deleteCampaign(id)
        loadCampaigns()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  const launchCampaign = useCallback(
    (id: string) => {
      try {
        const campaign = manager.launchCampaign(id)
        loadCampaigns()
        return campaign
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to launch campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  const pauseCampaign = useCallback(
    (id: string) => {
      try {
        const campaign = manager.pauseCampaign(id)
        loadCampaigns()
        return campaign
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to pause campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  const completeCampaign = useCallback(
    (id: string) => {
      try {
        const campaign = manager.completeCampaign(id)
        loadCampaigns()
        return campaign
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete campaign")
        throw err
      }
    },
    [loadCampaigns]
  )

  return {
    campaigns,
    loading,
    error,
    refresh: loadCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    pauseCampaign,
    completeCampaign,
  }
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCampaign = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getCampaign(id)
      setCampaign(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  const updateCampaign = useCallback(
    (updates: Partial<Campaign>) => {
      try {
        const updated = manager.updateCampaign(id, updates)
        setCampaign(updated)
        return updated
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update campaign")
        throw err
      }
    },
    [id]
  )

  return {
    campaign,
    loading,
    error,
    refresh: loadCampaign,
    updateCampaign,
  }
}

// ==================== Segment Hooks ====================

export function useSegments() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSegments = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getAllSegments()
      setSegments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load segments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSegments()
  }, [loadSegments])

  const createSegment = useCallback(
    (data: Omit<CustomerSegment, "id" | "customerCount" | "lastUpdated" | "createdAt">) => {
      try {
        const segment = manager.createSegment(data)
        loadSegments()
        return segment
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create segment")
        throw err
      }
    },
    [loadSegments]
  )

  const updateSegment = useCallback(
    (id: string, updates: Partial<CustomerSegment>) => {
      try {
        const segment = manager.updateSegment(id, updates)
        loadSegments()
        return segment
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update segment")
        throw err
      }
    },
    [loadSegments]
  )

  const deleteSegment = useCallback(
    (id: string) => {
      try {
        manager.deleteSegment(id)
        loadSegments()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete segment")
        throw err
      }
    },
    [loadSegments]
  )

  return {
    segments,
    loading,
    error,
    refresh: loadSegments,
    createSegment,
    updateSegment,
    deleteSegment,
  }
}

export function useSegment(id: string) {
  const [segment, setSegment] = useState<CustomerSegment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSegment = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getSegment(id)
      setSegment(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load segment")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadSegment()
  }, [loadSegment])

  return {
    segment,
    loading,
    error,
    refresh: loadSegment,
  }
}

// ==================== Message Log Hooks ====================

export function useMessageLogs(filters?: MessageLogFilters) {
  const [logs, setLogs] = useState<MessageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getMessageLogs(filters)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load message logs")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  return {
    logs,
    loading,
    error,
    refresh: loadLogs,
  }
}

// ==================== Analytics Hooks ====================

export function useCampaignAnalytics(campaignId: string) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getCampaignAnalytics(campaignId)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
  }
}

export function useOverallAnalytics() {
  const [analytics, setAnalytics] = useState<{
    totalCampaigns: number
    activeCampaigns: number
    totalSent: number
    totalRevenue: number
    averageOpenRate: number
    averageClickRate: number
    averageROI: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getOverallAnalytics()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overall analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
  }
}

// ==================== A/B Test Hooks ====================

export function useABTest(id: string) {
  const [abTest, setABTest] = useState<ABTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadABTest = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getABTest(id)
      setABTest(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load A/B test")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadABTest()
  }, [loadABTest])

  const calculateWinner = useCallback(() => {
    try {
      const updated = manager.calculateABTestWinner(id)
      setABTest(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate winner")
      throw err
    }
  }, [id])

  return {
    abTest,
    loading,
    error,
    refresh: loadABTest,
    calculateWinner,
  }
}

// ==================== Workflow Hooks ====================

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflows = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getAllWorkflows()
      setWorkflows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const createWorkflow = useCallback(
    (data: Omit<AutomationWorkflow, "id" | "totalExecutions" | "successfulExecutions" | "failedExecutions" | "createdAt" | "updatedAt">) => {
      try {
        const workflow = manager.createWorkflow(data)
        loadWorkflows()
        return workflow
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create workflow")
        throw err
      }
    },
    [loadWorkflows]
  )

  const updateWorkflow = useCallback(
    (id: string, updates: Partial<AutomationWorkflow>) => {
      try {
        const workflow = manager.updateWorkflow(id, updates)
        loadWorkflows()
        return workflow
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update workflow")
        throw err
      }
    },
    [loadWorkflows]
  )

  const deleteWorkflow = useCallback(
    (id: string) => {
      try {
        manager.deleteWorkflow(id)
        loadWorkflows()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete workflow")
        throw err
      }
    },
    [loadWorkflows]
  )

  return {
    workflows,
    loading,
    error,
    refresh: loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  }
}

export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<AutomationWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflow = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getWorkflow(id)
      setWorkflow(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadWorkflow()
  }, [loadWorkflow])

  return {
    workflow,
    loading,
    error,
    refresh: loadWorkflow,
  }
}

// ==================== Template Hooks ====================

export function useTemplates(filters?: { type?: CampaignType; category?: string }) {
  const [templates, setTemplates] = useState<TemplateLibrary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getAllTemplates(filters)
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const createTemplate = useCallback(
    (data: Omit<TemplateLibrary, "id" | "usageCount" | "rating" | "createdAt">) => {
      try {
        const template = manager.createTemplate(data)
        loadTemplates()
        return template
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create template")
        throw err
      }
    },
    [loadTemplates]
  )

  const useTemplate = useCallback(
    (id: string) => {
      try {
        const template = manager.incrementTemplateUsage(id)
        loadTemplates()
        return template
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to use template")
        throw err
      }
    },
    [loadTemplates]
  )

  return {
    templates,
    loading,
    error,
    refresh: loadTemplates,
    createTemplate,
    useTemplate,
  }
}

export function useTemplate(id: string) {
  const [template, setTemplate] = useState<TemplateLibrary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplate = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const data = manager.getTemplate(id)
      setTemplate(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  return {
    template,
    loading,
    error,
    refresh: loadTemplate,
  }
}
