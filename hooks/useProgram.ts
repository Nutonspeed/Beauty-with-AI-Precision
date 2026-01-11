/**
 * Program Progress Tracking Hooks
 * 
 * React hooks for managing program plans, sessions, milestones, photos,
 * and timeline data.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { ProgramTracker } from "@/lib/programs/program-tracker"
import type {
  ProgramPlan,
  ProgramSession,
  ProgramMilestone,
  ProgramPhoto,
  ProgramTimeline,
  ProgramNote,
  ProgramReport,
  CustomerProgramSummary,
  ProgramStatus,
  PhotoType,
  ProgramCategory,
} from "@/lib/programs/program-tracker"

// ============================================================================
// PROGRAM PLAN HOOKS
// ============================================================================

export function usePrograms(filters?: {
  customerId?: string
  status?: ProgramStatus
  category?: ProgramCategory
  specialistId?: string
  centerId?: string
}) {
  const [programs, setPrograms] = useState<ProgramPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPrograms = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getAllPrograms(filters)
      setPrograms(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadPrograms()
  }, [loadPrograms])

  const createProgram = useCallback(
    (data: Omit<ProgramPlan, "id" | "createdAt" | "updatedAt">) => {
      const manager = ProgramTracker.getInstance()
      const newProgram = manager.createProgram(data)
      loadPrograms()
      return newProgram
    },
    [loadPrograms]
  )

  const updateProgram = useCallback(
    (programId: string, updates: Partial<Omit<ProgramPlan, "id" | "createdAt">>) => {
      const manager = ProgramTracker.getInstance()
      const updated = manager.updateProgram(programId, updates)
      if (updated) {
        loadPrograms()
      }
      return updated
    },
    [loadPrograms]
  )

  const deleteProgram = useCallback(
    (programId: string) => {
      const manager = ProgramTracker.getInstance()
      const success = manager.deleteProgram(programId)
      if (success) {
        loadPrograms()
      }
      return success
    },
    [loadPrograms]
  )

  return {
    programs,
    loading,
    error,
    refresh: loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  }
}

export function useProgram(programId: string) {
  const [program, setProgram] = useState<ProgramPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgram = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgram(programId)
      setProgram(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load program")
    } finally {
      setLoading(false)
    }
  }, [programId])

  useEffect(() => {
    loadProgram()
  }, [loadProgram])

  const updateProgram = useCallback(
    (updates: Partial<Omit<ProgramPlan, "id" | "createdAt">>) => {
      const manager = ProgramTracker.getInstance()
      const updated = manager.updateProgram(programId, updates)
      if (updated) {
        setProgram(updated)
      }
      return updated
    },
    [programId]
  )

  return {
    program,
    loading,
    error,
    refresh: loadProgram,
    updateProgram,
  }
}

// ============================================================================
// SESSION HOOKS
// ============================================================================

export function useProgramSessions(programId: string) {
  const [sessions, setSessions] = useState<ProgramSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgramSessions(programId)
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [programId])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const createSession = useCallback(
    (data: Omit<ProgramSession, "id" | "createdAt" | "updatedAt">) => {
      const manager = ProgramTracker.getInstance()
      const newSession = manager.createSession(data)
      loadSessions()
      return newSession
    },
    [loadSessions]
  )

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Omit<ProgramSession, "id" | "createdAt">>) => {
      const manager = ProgramTracker.getInstance()
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
      const manager = ProgramTracker.getInstance()
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
  customerId?: string
  specialistId?: string
  centerId?: string
  startDate?: Date
  endDate?: Date
}) {
  const [sessions, setSessions] = useState<ProgramSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
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

export function useProgramMilestones(programId: string) {
  const [milestones, setMilestones] = useState<ProgramMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMilestones = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgramMilestones(programId)
      setMilestones(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load milestones")
    } finally {
      setLoading(false)
    }
  }, [programId])

  useEffect(() => {
    loadMilestones()
  }, [loadMilestones])

  const createMilestone = useCallback(
    (data: Omit<ProgramMilestone, "id" | "createdAt" | "updatedAt">) => {
      const manager = ProgramTracker.getInstance()
      const newMilestone = manager.createMilestone(data)
      loadMilestones()
      return newMilestone
    },
    [loadMilestones]
  )

  const updateMilestone = useCallback(
    (milestoneId: string, updates: Partial<Omit<ProgramMilestone, "id" | "createdAt">>) => {
      const manager = ProgramTracker.getInstance()
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
      const manager = ProgramTracker.getInstance()
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

export function useProgramPhotos(
  programId: string,
  filters?: {
    type?: PhotoType
    sessionId?: string
    milestoneId?: string
  }
) {
  const [photos, setPhotos] = useState<ProgramPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPhotos = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgramPhotos(programId, filters)
      setPhotos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos")
    } finally {
      setLoading(false)
    }
  }, [programId, filters])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const addPhoto = useCallback(
    (data: Omit<ProgramPhoto, "id" | "createdAt">) => {
      const manager = ProgramTracker.getInstance()
      const newPhoto = manager.addPhoto(data)
      loadPhotos()
      return newPhoto
    },
    [loadPhotos]
  )

  const deletePhoto = useCallback(
    (photoId: string) => {
      const manager = ProgramTracker.getInstance()
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

export function useProgramTimeline(
  programId: string,
  filters?: {
    type?: ProgramTimeline["type"]
    startDate?: Date
    endDate?: Date
  }
) {
  const [timeline, setTimeline] = useState<ProgramTimeline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTimeline = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgramTimeline(programId, filters)
      setTimeline(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline")
    } finally {
      setLoading(false)
    }
  }, [programId, filters])

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

export function useProgramNotes(
  programId: string,
  filters?: {
    sessionId?: string
    authorId?: string
    includePrivate?: boolean
  }
) {
  const [notes, setNotes] = useState<ProgramNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getProgramNotes(programId, filters)
      setNotes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes")
    } finally {
      setLoading(false)
    }
  }, [programId, filters])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const addNote = useCallback(
    (data: Omit<ProgramNote, "id" | "createdAt" | "updatedAt">) => {
      const manager = ProgramTracker.getInstance()
      const newNote = manager.addNote(data)
      loadNotes()
      return newNote
    },
    [loadNotes]
  )

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Omit<ProgramNote, "id" | "createdAt">>) => {
      const manager = ProgramTracker.getInstance()
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
      const manager = ProgramTracker.getInstance()
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

export function useProgramReport(programId: string) {
  const [report, setReport] = useState<ProgramReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.generateProgramReport(programId)
      setReport(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [programId])

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

export function useCustomerSummary(customerId: string) {
  const [summary, setSummary] = useState<CustomerProgramSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(() => {
    try {
      setLoading(true)
      const manager = ProgramTracker.getInstance()
      const data = manager.getCustomerSummary(customerId)
      setSummary(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer summary")
    } finally {
      setLoading(false)
    }
  }, [customerId])

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
