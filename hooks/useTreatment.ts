/**
 * Treatment Progress Tracking Hooks
 * 
 * React hooks for managing treatment plans, sessions, milestones, photos,
 * and timeline data.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import TreatmentTracker, {
  type TreatmentPlan,
  type TreatmentSession,
  type TreatmentMilestone,
  type TreatmentPhoto,
  type TreatmentTimeline,
  type TreatmentNote,
  type TreatmentReport,
  type PatientTreatmentSummary,
  type TreatmentStatus,
  type PhotoType,
  type TreatmentCategory,
} from "@/lib/treatment/treatment-tracker"

// ============================================================================
// TREATMENT PLAN HOOKS
// ============================================================================

export function useTreatments(filters?: {
  patientId?: string
  status?: TreatmentStatus
  category?: TreatmentCategory
  doctorId?: string
  branchId?: string
}) {
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTreatments = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getAllTreatments(filters)
      setTreatments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load treatments")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTreatments()
  }, [loadTreatments])

  const createTreatment = useCallback(
    (data: Omit<TreatmentPlan, "id" | "createdAt" | "updatedAt">) => {
      const manager = TreatmentTracker
      const newTreatment = manager.createTreatment(data)
      loadTreatments()
      return newTreatment
    },
    [loadTreatments]
  )

  const updateTreatment = useCallback(
    (treatmentId: string, updates: Partial<Omit<TreatmentPlan, "id" | "createdAt">>) => {
      const manager = TreatmentTracker
      const updated = manager.updateTreatment(treatmentId, updates)
      if (updated) {
        loadTreatments()
      }
      return updated
    },
    [loadTreatments]
  )

  const deleteTreatment = useCallback(
    (treatmentId: string) => {
      const manager = TreatmentTracker
      const success = manager.deleteTreatment(treatmentId)
      if (success) {
        loadTreatments()
      }
      return success
    },
    [loadTreatments]
  )

  return {
    treatments,
    loading,
    error,
    refresh: loadTreatments,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  }
}

export function useTreatment(treatmentId: string) {
  const [treatment, setTreatment] = useState<TreatmentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTreatment = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatment(treatmentId)
      setTreatment(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load treatment")
    } finally {
      setLoading(false)
    }
  }, [treatmentId])

  useEffect(() => {
    loadTreatment()
  }, [loadTreatment])

  const updateTreatment = useCallback(
    (updates: Partial<Omit<TreatmentPlan, "id" | "createdAt">>) => {
      const manager = TreatmentTracker
      const updated = manager.updateTreatment(treatmentId, updates)
      if (updated) {
        setTreatment(updated)
      }
      return updated
    },
    [treatmentId]
  )

  return {
    treatment,
    loading,
    error,
    refresh: loadTreatment,
    updateTreatment,
  }
}

// ============================================================================
// SESSION HOOKS
// ============================================================================

export function useTreatmentSessions(treatmentId: string) {
  const [sessions, setSessions] = useState<TreatmentSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatmentSessions(treatmentId)
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [treatmentId])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const createSession = useCallback(
    (data: Omit<TreatmentSession, "id" | "createdAt" | "updatedAt">) => {
      const manager = TreatmentTracker
      const newSession = manager.createSession(data)
      loadSessions()
      return newSession
    },
    [loadSessions]
  )

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Omit<TreatmentSession, "id" | "createdAt">>) => {
      const manager = TreatmentTracker
      const updated = manager.updateSession(sessionId, updates)
      if (updated) {
        loadSessions()
      }
      return updated
    },
    [loadSessions]
  )

  const deleteSession = useCallback(
    (sessionId: string) => {
      const manager = TreatmentTracker
      const success = manager.deleteSession(sessionId)
      if (success) {
        loadSessions()
      }
      return success
    },
    [loadSessions]
  )

  return {
    sessions,
    loading,
    error,
    refresh: loadSessions,
    createSession,
    updateSession,
    deleteSession,
  }
}

export function useUpcomingSessions(filters?: {
  patientId?: string
  doctorId?: string
  branchId?: string
  startDate?: Date
  endDate?: Date
}) {
  const [sessions, setSessions] = useState<TreatmentSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getUpcomingSessions(filters)
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load upcoming sessions")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return {
    sessions,
    loading,
    error,
    refresh: loadSessions,
  }
}

// ============================================================================
// MILESTONE HOOKS
// ============================================================================

export function useTreatmentMilestones(treatmentId: string) {
  const [milestones, setMilestones] = useState<TreatmentMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMilestones = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatmentMilestones(treatmentId)
      setMilestones(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load milestones")
    } finally {
      setLoading(false)
    }
  }, [treatmentId])

  useEffect(() => {
    loadMilestones()
  }, [loadMilestones])

  const createMilestone = useCallback(
    (data: Omit<TreatmentMilestone, "id" | "createdAt" | "updatedAt">) => {
      const manager = TreatmentTracker
      const newMilestone = manager.createMilestone(data)
      loadMilestones()
      return newMilestone
    },
    [loadMilestones]
  )

  const updateMilestone = useCallback(
    (milestoneId: string, updates: Partial<Omit<TreatmentMilestone, "id" | "createdAt">>) => {
      const manager = TreatmentTracker
      const updated = manager.updateMilestone(milestoneId, updates)
      if (updated) {
        loadMilestones()
      }
      return updated
    },
    [loadMilestones]
  )

  const deleteMilestone = useCallback(
    (milestoneId: string) => {
      const manager = TreatmentTracker
      const success = manager.deleteMilestone(milestoneId)
      if (success) {
        loadMilestones()
      }
      return success
    },
    [loadMilestones]
  )

  return {
    milestones,
    loading,
    error,
    refresh: loadMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  }
}

// ============================================================================
// PHOTO HOOKS
// ============================================================================

export function useTreatmentPhotos(
  treatmentId: string,
  filters?: {
    type?: PhotoType
    sessionId?: string
    milestoneId?: string
  }
) {
  const [photos, setPhotos] = useState<TreatmentPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPhotos = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatmentPhotos(treatmentId, filters)
      setPhotos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos")
    } finally {
      setLoading(false)
    }
  }, [treatmentId, filters])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const addPhoto = useCallback(
    (data: Omit<TreatmentPhoto, "id" | "createdAt">) => {
      const manager = TreatmentTracker
      const newPhoto = manager.addPhoto(data)
      loadPhotos()
      return newPhoto
    },
    [loadPhotos]
  )

  const deletePhoto = useCallback(
    (photoId: string) => {
      const manager = TreatmentTracker
      const success = manager.deletePhoto(photoId)
      if (success) {
        loadPhotos()
      }
      return success
    },
    [loadPhotos]
  )

  return {
    photos,
    loading,
    error,
    refresh: loadPhotos,
    addPhoto,
    deletePhoto,
  }
}

// ============================================================================
// TIMELINE HOOKS
// ============================================================================

export function useTreatmentTimeline(
  treatmentId: string,
  filters?: {
    type?: TreatmentTimeline["type"]
    startDate?: Date
    endDate?: Date
  }
) {
  const [timeline, setTimeline] = useState<TreatmentTimeline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTimeline = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatmentTimeline(treatmentId, filters)
      setTimeline(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline")
    } finally {
      setLoading(false)
    }
  }, [treatmentId, filters])

  useEffect(() => {
    loadTimeline()
  }, [loadTimeline])

  return {
    timeline,
    loading,
    error,
    refresh: loadTimeline,
  }
}

// ============================================================================
// NOTE HOOKS
// ============================================================================

export function useTreatmentNotes(
  treatmentId: string,
  filters?: {
    sessionId?: string
    authorId?: string
    includePrivate?: boolean
  }
) {
  const [notes, setNotes] = useState<TreatmentNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getTreatmentNotes(treatmentId, filters)
      setNotes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes")
    } finally {
      setLoading(false)
    }
  }, [treatmentId, filters])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const addNote = useCallback(
    (data: Omit<TreatmentNote, "id" | "createdAt" | "updatedAt">) => {
      const manager = TreatmentTracker
      const newNote = manager.addNote(data)
      loadNotes()
      return newNote
    },
    [loadNotes]
  )

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Omit<TreatmentNote, "id" | "createdAt">>) => {
      const manager = TreatmentTracker
      const updated = manager.updateNote(noteId, updates)
      if (updated) {
        loadNotes()
      }
      return updated
    },
    [loadNotes]
  )

  const deleteNote = useCallback(
    (noteId: string) => {
      const manager = TreatmentTracker
      const success = manager.deleteNote(noteId)
      if (success) {
        loadNotes()
      }
      return success
    },
    [loadNotes]
  )

  return {
    notes,
    loading,
    error,
    refresh: loadNotes,
    addNote,
    updateNote,
    deleteNote,
  }
}

// ============================================================================
// REPORT & ANALYTICS HOOKS
// ============================================================================

export function useTreatmentReport(treatmentId: string) {
  const [report, setReport] = useState<TreatmentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.generateTreatmentReport(treatmentId)
      setReport(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [treatmentId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  return {
    report,
    loading,
    error,
    refresh: loadReport,
  }
}

export function usePatientSummary(patientId: string) {
  const [summary, setSummary] = useState<PatientTreatmentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(() => {
    try {
      setLoading(true)
      const manager = TreatmentTracker
      const data = manager.getPatientSummary(patientId)
      setSummary(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient summary")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return {
    summary,
    loading,
    error,
    refresh: loadSummary,
  }
}
