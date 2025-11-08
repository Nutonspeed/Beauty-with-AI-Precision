/**
 * Treatment Progress Tracker
 * 
 * Core engine for tracking patient treatment progress, timelines, sessions,
 * before/after photos, milestones, and treatment plans.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TreatmentStatus = "planned" | "in_progress" | "completed" | "paused" | "cancelled"
export type SessionStatus = "scheduled" | "completed" | "missed" | "cancelled" | "rescheduled"
export type MilestoneStatus = "pending" | "achieved" | "missed" | "skipped"
export type PhotoType = "before" | "after" | "progress"
export type ProgressRating = 1 | 2 | 3 | 4 | 5
export type TreatmentCategory = "skin" | "hair" | "body" | "facial" | "laser" | "injection" | "other"

// ============================================================================
// INTERFACES
// ============================================================================

export interface TreatmentPlan {
  id: string
  patientId: string
  patientName: string
  category: TreatmentCategory
  treatmentName: string
  description: string
  status: TreatmentStatus
  startDate: Date
  estimatedEndDate: Date
  actualEndDate?: Date
  totalSessions: number
  completedSessions: number
  doctorId: string
  doctorName: string
  branchId: string
  branchName: string
  goals: string[]
  concerns: string[]
  estimatedCost: number
  actualCost: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface TreatmentSession {
  id: string
  treatmentId: string
  sessionNumber: number
  status: SessionStatus
  scheduledDate: Date
  completedDate?: Date
  duration: number // in minutes
  doctorId: string
  doctorName: string
  branchId: string
  branchName: string
  procedures: string[]
  productsUsed: Array<{
    productId: string
    productName: string
    quantity: number
    unit: string
  }>
  beforePhotos: string[]
  afterPhotos: string[]
  progressPhotos: string[]
  observations: string
  patientFeedback?: string
  patientRating?: ProgressRating
  nextSteps: string
  cost: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface TreatmentMilestone {
  id: string
  treatmentId: string
  title: string
  description: string
  targetDate: Date
  achievedDate?: Date
  status: MilestoneStatus
  criteria: string[]
  photos: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface TreatmentPhoto {
  id: string
  treatmentId: string
  sessionId?: string
  milestoneId?: string
  type: PhotoType
  url: string
  thumbnailUrl: string
  capturedDate: Date
  area: string // e.g., "face", "forehead", "cheek"
  angle: string // e.g., "front", "left", "right", "top"
  notes: string
  metadata: {
    width: number
    height: number
    size: number
    format: string
  }
  createdAt: Date
}

export interface TreatmentTimeline {
  id: string
  treatmentId: string
  date: Date
  type: "session" | "milestone" | "note" | "photo" | "status_change"
  title: string
  description: string
  relatedId?: string // sessionId, milestoneId, etc.
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface TreatmentNote {
  id: string
  treatmentId: string
  sessionId?: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  isPrivate: boolean
  attachments: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TreatmentReport {
  treatmentId: string
  patientId: string
  patientName: string
  treatmentName: string
  category: TreatmentCategory
  status: TreatmentStatus
  startDate: Date
  endDate?: Date
  duration: number // in days
  progress: number // 0-100
  totalSessions: number
  completedSessions: number
  missedSessions: number
  averageRating: number
  totalCost: number
  milestonesAchieved: number
  totalMilestones: number
  photoCount: {
    before: number
    after: number
    progress: number
  }
  timeline: TreatmentTimeline[]
  recentNotes: TreatmentNote[]
}

export interface PatientTreatmentSummary {
  patientId: string
  patientName: string
  totalTreatments: number
  activeTreatments: number
  completedTreatments: number
  totalSessions: number
  totalSpent: number
  averageRating: number
  treatments: TreatmentPlan[]
  upcomingSessions: TreatmentSession[]
}

// ============================================================================
// TREATMENT TRACKER CLASS
// ============================================================================

export class TreatmentTracker {
  private static instance: TreatmentTracker
  
  private treatments: Map<string, TreatmentPlan> = new Map()
  private sessions: Map<string, TreatmentSession> = new Map()
  private milestones: Map<string, TreatmentMilestone> = new Map()
  private photos: Map<string, TreatmentPhoto> = new Map()
  private timeline: Map<string, TreatmentTimeline> = new Map()
  private notes: Map<string, TreatmentNote> = new Map()
  
  private constructor() {
    this.initializeSampleData()
  }
  
  static getInstance(): TreatmentTracker {
    if (!TreatmentTracker.instance) {
      TreatmentTracker.instance = new TreatmentTracker()
    }
    return TreatmentTracker.instance
  }
  
  // ==========================================================================
  // TREATMENT PLAN MANAGEMENT
  // ==========================================================================
  
  createTreatment(data: Omit<TreatmentPlan, "id" | "createdAt" | "updatedAt">): TreatmentPlan {
    const treatment: TreatmentPlan = {
      id: `TRT${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.treatments.set(treatment.id, treatment)
    
    // Add timeline entry
    this.addTimelineEntry({
      treatmentId: treatment.id,
      type: "status_change",
      title: "Treatment Created",
      description: `${treatment.treatmentName} treatment plan created`,
    })
    
    return treatment
  }
  
  getTreatment(treatmentId: string): TreatmentPlan | undefined {
    return this.treatments.get(treatmentId)
  }
  
  getAllTreatments(filters?: {
    patientId?: string
    status?: TreatmentStatus
    category?: TreatmentCategory
    doctorId?: string
    branchId?: string
  }): TreatmentPlan[] {
    let treatments = Array.from(this.treatments.values())
    
    if (filters) {
      if (filters.patientId) {
        treatments = treatments.filter(t => t.patientId === filters.patientId)
      }
      if (filters.status) {
        treatments = treatments.filter(t => t.status === filters.status)
      }
      if (filters.category) {
        treatments = treatments.filter(t => t.category === filters.category)
      }
      if (filters.doctorId) {
        treatments = treatments.filter(t => t.doctorId === filters.doctorId)
      }
      if (filters.branchId) {
        treatments = treatments.filter(t => t.branchId === filters.branchId)
      }
    }
    
    return treatments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  updateTreatment(treatmentId: string, updates: Partial<Omit<TreatmentPlan, "id" | "createdAt">>): TreatmentPlan | null {
    const treatment = this.treatments.get(treatmentId)
    if (!treatment) return null
    
    const oldStatus = treatment.status
    const updatedTreatment: TreatmentPlan = {
      ...treatment,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.treatments.set(treatmentId, updatedTreatment)
    
    // Add timeline entry for status change
    if (updates.status && updates.status !== oldStatus) {
      this.addTimelineEntry({
        treatmentId,
        type: "status_change",
        title: "Status Updated",
        description: `Treatment status changed from ${oldStatus} to ${updates.status}`,
      })
    }
    
    return updatedTreatment
  }
  
  deleteTreatment(treatmentId: string): boolean {
    return this.treatments.delete(treatmentId)
  }
  
  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================
  
  createSession(data: Omit<TreatmentSession, "id" | "createdAt" | "updatedAt">): TreatmentSession {
    const session: TreatmentSession = {
      id: `SES${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.sessions.set(session.id, session)
    
    // Update treatment completed sessions if status is completed
    if (session.status === "completed") {
      const treatment = this.treatments.get(session.treatmentId)
      if (treatment) {
        treatment.completedSessions += 1
        treatment.actualCost += session.cost
        treatment.updatedAt = new Date()
        this.treatments.set(treatment.id, treatment)
      }
    }
    
    // Add timeline entry
    this.addTimelineEntry({
      treatmentId: session.treatmentId,
      type: "session",
      title: `Session ${session.sessionNumber}`,
      description: `Session ${session.status}: ${session.procedures.join(", ")}`,
      relatedId: session.id,
    })
    
    return session
  }
  
  getSession(sessionId: string): TreatmentSession | undefined {
    return this.sessions.get(sessionId)
  }
  
  getTreatmentSessions(treatmentId: string): TreatmentSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.treatmentId === treatmentId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
  }
  
  getUpcomingSessions(filters?: {
    patientId?: string
    doctorId?: string
    branchId?: string
    startDate?: Date
    endDate?: Date
  }): TreatmentSession[] {
    let sessions = Array.from(this.sessions.values())
      .filter(s => s.status === "scheduled")
    
    if (filters) {
      if (filters.doctorId) {
        sessions = sessions.filter(s => s.doctorId === filters.doctorId)
      }
      if (filters.branchId) {
        sessions = sessions.filter(s => s.branchId === filters.branchId)
      }
      if (filters.startDate) {
        sessions = sessions.filter(s => s.scheduledDate >= filters.startDate!)
      }
      if (filters.endDate) {
        sessions = sessions.filter(s => s.scheduledDate <= filters.endDate!)
      }
      if (filters.patientId) {
        sessions = sessions.filter(s => {
          const treatment = this.treatments.get(s.treatmentId)
          return treatment?.patientId === filters.patientId
        })
      }
    }
    
    return sessions.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  }
  
  updateSession(sessionId: string, updates: Partial<Omit<TreatmentSession, "id" | "createdAt">>): TreatmentSession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    
    const oldStatus = session.status
    const updatedSession: TreatmentSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.sessions.set(sessionId, updatedSession)
    
    // Update treatment if session completed
    if (updates.status === "completed" && oldStatus !== "completed") {
      const treatment = this.treatments.get(session.treatmentId)
      if (treatment) {
        treatment.completedSessions += 1
        treatment.actualCost += updatedSession.cost
        treatment.updatedAt = new Date()
        this.treatments.set(treatment.id, treatment)
      }
    }
    
    return updatedSession
  }
  
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }
  
  // ==========================================================================
  // MILESTONE MANAGEMENT
  // ==========================================================================
  
  createMilestone(data: Omit<TreatmentMilestone, "id" | "createdAt" | "updatedAt">): TreatmentMilestone {
    const milestone: TreatmentMilestone = {
      id: `MLS${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.milestones.set(milestone.id, milestone)
    
    // Add timeline entry
    this.addTimelineEntry({
      treatmentId: milestone.treatmentId,
      type: "milestone",
      title: milestone.title,
      description: `Milestone ${milestone.status}: ${milestone.description}`,
      relatedId: milestone.id,
    })
    
    return milestone
  }
  
  getMilestone(milestoneId: string): TreatmentMilestone | undefined {
    return this.milestones.get(milestoneId)
  }
  
  getTreatmentMilestones(treatmentId: string): TreatmentMilestone[] {
    return Array.from(this.milestones.values())
      .filter(m => m.treatmentId === treatmentId)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  }
  
  updateMilestone(milestoneId: string, updates: Partial<Omit<TreatmentMilestone, "id" | "createdAt">>): TreatmentMilestone | null {
    const milestone = this.milestones.get(milestoneId)
    if (!milestone) return null
    
    const updatedMilestone: TreatmentMilestone = {
      ...milestone,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.milestones.set(milestoneId, updatedMilestone)
    
    // Add timeline entry for achieved milestones
    if (updates.status === "achieved" && milestone.status !== "achieved") {
      this.addTimelineEntry({
        treatmentId: milestone.treatmentId,
        type: "milestone",
        title: `Milestone Achieved: ${milestone.title}`,
        description: milestone.description,
        relatedId: milestoneId,
      })
    }
    
    return updatedMilestone
  }
  
  deleteMilestone(milestoneId: string): boolean {
    return this.milestones.delete(milestoneId)
  }
  
  // ==========================================================================
  // PHOTO MANAGEMENT
  // ==========================================================================
  
  addPhoto(data: Omit<TreatmentPhoto, "id" | "createdAt">): TreatmentPhoto {
    const photo: TreatmentPhoto = {
      id: `PHT${Date.now()}`,
      ...data,
      createdAt: new Date(),
    }
    
    this.photos.set(photo.id, photo)
    
    // Add timeline entry
    this.addTimelineEntry({
      treatmentId: photo.treatmentId,
      type: "photo",
      title: `${photo.type.charAt(0).toUpperCase() + photo.type.slice(1)} Photo Added`,
      description: `${photo.area} - ${photo.angle}`,
      relatedId: photo.id,
    })
    
    return photo
  }
  
  getPhoto(photoId: string): TreatmentPhoto | undefined {
    return this.photos.get(photoId)
  }
  
  getTreatmentPhotos(treatmentId: string, filters?: {
    type?: PhotoType
    sessionId?: string
    milestoneId?: string
  }): TreatmentPhoto[] {
    let photos = Array.from(this.photos.values())
      .filter(p => p.treatmentId === treatmentId)
    
    if (filters) {
      if (filters.type) {
        photos = photos.filter(p => p.type === filters.type)
      }
      if (filters.sessionId) {
        photos = photos.filter(p => p.sessionId === filters.sessionId)
      }
      if (filters.milestoneId) {
        photos = photos.filter(p => p.milestoneId === filters.milestoneId)
      }
    }
    
    return photos.sort((a, b) => b.capturedDate.getTime() - a.capturedDate.getTime())
  }
  
  deletePhoto(photoId: string): boolean {
    return this.photos.delete(photoId)
  }
  
  // ==========================================================================
  // TIMELINE MANAGEMENT
  // ==========================================================================
  
  private addTimelineEntry(data: Omit<TreatmentTimeline, "id" | "date" | "createdAt">): TreatmentTimeline {
    const entry: TreatmentTimeline = {
      id: `TML${Date.now()}`,
      date: new Date(),
      ...data,
      createdAt: new Date(),
    }
    
    this.timeline.set(entry.id, entry)
    return entry
  }
  
  getTreatmentTimeline(treatmentId: string, filters?: {
    type?: TreatmentTimeline["type"]
    startDate?: Date
    endDate?: Date
  }): TreatmentTimeline[] {
    let entries = Array.from(this.timeline.values())
      .filter(e => e.treatmentId === treatmentId)
    
    if (filters) {
      if (filters.type) {
        entries = entries.filter(e => e.type === filters.type)
      }
      if (filters.startDate) {
        entries = entries.filter(e => e.date >= filters.startDate!)
      }
      if (filters.endDate) {
        entries = entries.filter(e => e.date <= filters.endDate!)
      }
    }
    
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime())
  }
  
  // ==========================================================================
  // NOTE MANAGEMENT
  // ==========================================================================
  
  addNote(data: Omit<TreatmentNote, "id" | "createdAt" | "updatedAt">): TreatmentNote {
    const note: TreatmentNote = {
      id: `NOT${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.notes.set(note.id, note)
    
    // Add timeline entry
    this.addTimelineEntry({
      treatmentId: note.treatmentId,
      type: "note",
      title: "Note Added",
      description: note.content.substring(0, 100) + (note.content.length > 100 ? "..." : ""),
      relatedId: note.id,
    })
    
    return note
  }
  
  getNote(noteId: string): TreatmentNote | undefined {
    return this.notes.get(noteId)
  }
  
  getTreatmentNotes(treatmentId: string, filters?: {
    sessionId?: string
    authorId?: string
    includePrivate?: boolean
  }): TreatmentNote[] {
    let notes = Array.from(this.notes.values())
      .filter(n => n.treatmentId === treatmentId)
    
    if (filters) {
      if (filters.sessionId) {
        notes = notes.filter(n => n.sessionId === filters.sessionId)
      }
      if (filters.authorId) {
        notes = notes.filter(n => n.authorId === filters.authorId)
      }
      if (!filters.includePrivate) {
        notes = notes.filter(n => !n.isPrivate)
      }
    }
    
    return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  updateNote(noteId: string, updates: Partial<Omit<TreatmentNote, "id" | "createdAt">>): TreatmentNote | null {
    const note = this.notes.get(noteId)
    if (!note) return null
    
    const updatedNote: TreatmentNote = {
      ...note,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.notes.set(noteId, updatedNote)
    return updatedNote
  }
  
  deleteNote(noteId: string): boolean {
    return this.notes.delete(noteId)
  }
  
  // ==========================================================================
  // REPORTING & ANALYTICS
  // ==========================================================================
  
  generateTreatmentReport(treatmentId: string): TreatmentReport | null {
    const treatment = this.treatments.get(treatmentId)
    if (!treatment) return null
    
    const sessions = this.getTreatmentSessions(treatmentId)
    const milestones = this.getTreatmentMilestones(treatmentId)
    const photos = this.getTreatmentPhotos(treatmentId)
    const timeline = this.getTreatmentTimeline(treatmentId)
    const notes = this.getTreatmentNotes(treatmentId).slice(0, 10)
    
    const completedSessions = sessions.filter(s => s.status === "completed")
    const missedSessions = sessions.filter(s => s.status === "missed")
    const ratings = completedSessions.filter(s => s.patientRating).map(s => s.patientRating!)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    
    const startDate = treatment.startDate
    const endDate = treatment.actualEndDate || new Date()
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const progress = treatment.totalSessions > 0 ? (treatment.completedSessions / treatment.totalSessions) * 100 : 0
    
    const achievedMilestones = milestones.filter(m => m.status === "achieved").length
    
    const beforePhotos = photos.filter(p => p.type === "before").length
    const afterPhotos = photos.filter(p => p.type === "after").length
    const progressPhotos = photos.filter(p => p.type === "progress").length
    
    return {
      treatmentId: treatment.id,
      patientId: treatment.patientId,
      patientName: treatment.patientName,
      treatmentName: treatment.treatmentName,
      category: treatment.category,
      status: treatment.status,
      startDate: treatment.startDate,
      endDate: treatment.actualEndDate,
      duration,
      progress,
      totalSessions: treatment.totalSessions,
      completedSessions: treatment.completedSessions,
      missedSessions: missedSessions.length,
      averageRating,
      totalCost: treatment.actualCost,
      milestonesAchieved: achievedMilestones,
      totalMilestones: milestones.length,
      photoCount: {
        before: beforePhotos,
        after: afterPhotos,
        progress: progressPhotos,
      },
      timeline,
      recentNotes: notes,
    }
  }
  
  getPatientSummary(patientId: string): PatientTreatmentSummary {
    const treatments = this.getAllTreatments({ patientId })
    const activeTreatments = treatments.filter(t => t.status === "in_progress" || t.status === "planned")
    const completedTreatments = treatments.filter(t => t.status === "completed")
    
    const allSessions = treatments.flatMap(t => this.getTreatmentSessions(t.id))
    const completedSessions = allSessions.filter(s => s.status === "completed")
    const ratings = completedSessions.filter(s => s.patientRating).map(s => s.patientRating!)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    
    const totalSpent = treatments.reduce((sum, t) => sum + t.actualCost, 0)
    
    const upcomingSessions = this.getUpcomingSessions({ patientId })
    
    return {
      patientId,
      patientName: treatments[0]?.patientName || "Unknown",
      totalTreatments: treatments.length,
      activeTreatments: activeTreatments.length,
      completedTreatments: completedTreatments.length,
      totalSessions: allSessions.length,
      totalSpent,
      averageRating,
      treatments,
      upcomingSessions: upcomingSessions.slice(0, 5),
    }
  }
  
  // ==========================================================================
  // SAMPLE DATA
  // ==========================================================================
  
  private initializeSampleData() {
    // Sample treatment plan
    const treatment1 = this.createTreatment({
      patientId: "PAT001",
      patientName: "Sarah Johnson",
      category: "skin",
      treatmentName: "Acne Scar Removal - Laser Treatment",
      description: "6-session laser treatment plan for acne scar reduction on facial area",
      status: "in_progress",
      startDate: new Date("2024-10-01"),
      estimatedEndDate: new Date("2025-02-01"),
      totalSessions: 6,
      completedSessions: 2,
      doctorId: "DOC001",
      doctorName: "Dr. Lisa Wong",
      branchId: "BKK001",
      branchName: "Bangkok Branch",
      goals: ["Reduce acne scars by 70%", "Improve skin texture", "Even out skin tone"],
      concerns: ["Acne scars on cheeks", "Uneven skin texture", "Post-inflammatory hyperpigmentation"],
      estimatedCost: 45000,
      actualCost: 15000,
      notes: "Patient is responding well to treatment. Minor redness after each session.",
    })
    
    const treatment2 = this.createTreatment({
      patientId: "PAT001",
      patientName: "Sarah Johnson",
      category: "facial",
      treatmentName: "Anti-Aging Facial Rejuvenation",
      description: "4-session facial rejuvenation with collagen boost",
      status: "planned",
      startDate: new Date("2025-01-15"),
      estimatedEndDate: new Date("2025-03-15"),
      totalSessions: 4,
      completedSessions: 0,
      doctorId: "DOC002",
      doctorName: "Dr. Michael Chen",
      branchId: "BKK001",
      branchName: "Bangkok Branch",
      goals: ["Reduce fine lines", "Boost collagen production", "Improve skin elasticity"],
      concerns: ["Fine lines around eyes", "Loss of skin firmness", "Dull complexion"],
      estimatedCost: 28000,
      actualCost: 0,
      notes: "Recommended as follow-up to laser treatment",
    })
    
    // Sample sessions for treatment1
    this.createSession({
      treatmentId: treatment1.id,
      sessionNumber: 1,
      status: "completed",
      scheduledDate: new Date("2024-10-08"),
      completedDate: new Date("2024-10-08"),
      duration: 45,
      doctorId: "DOC001",
      doctorName: "Dr. Lisa Wong",
      branchId: "BKK001",
      branchName: "Bangkok Branch",
      procedures: ["Fractional CO2 Laser", "Cooling treatment"],
      productsUsed: [
        { productId: "PRD001", productName: "Anesthetic cream", quantity: 1, unit: "application" },
        { productId: "PRD002", productName: "Cooling gel", quantity: 1, unit: "tube" },
      ],
      beforePhotos: ["/photos/sarah-before-1.jpg"],
      afterPhotos: ["/photos/sarah-after-1.jpg"],
      progressPhotos: [],
      observations: "Good response to laser. Slight redness expected for 48 hours.",
      patientFeedback: "Slight discomfort during procedure but manageable",
      patientRating: 4,
      nextSteps: "Schedule session 2 in 4 weeks. Use sunscreen SPF 50+",
      cost: 7500,
      notes: "Patient tolerated procedure well",
    })
    
    this.createSession({
      treatmentId: treatment1.id,
      sessionNumber: 2,
      status: "completed",
      scheduledDate: new Date("2024-11-05"),
      completedDate: new Date("2024-11-05"),
      duration: 50,
      doctorId: "DOC001",
      doctorName: "Dr. Lisa Wong",
      branchId: "BKK001",
      branchName: "Bangkok Branch",
      procedures: ["Fractional CO2 Laser", "PRP application", "Cooling treatment"],
      productsUsed: [
        { productId: "PRD001", productName: "Anesthetic cream", quantity: 1, unit: "application" },
        { productId: "PRD003", productName: "PRP kit", quantity: 1, unit: "kit" },
        { productId: "PRD002", productName: "Cooling gel", quantity: 1, unit: "tube" },
      ],
      beforePhotos: ["/photos/sarah-before-2.jpg"],
      afterPhotos: ["/photos/sarah-after-2.jpg"],
      progressPhotos: ["/photos/sarah-progress-2.jpg"],
      observations: "Noticeable improvement from session 1. Scars lightening by approximately 30%.",
      patientFeedback: "Very happy with results so far. Skin texture improving.",
      patientRating: 5,
      nextSteps: "Continue with session 3 in 4 weeks. Maintain skincare routine.",
      cost: 7500,
      notes: "Excellent progress",
    })
    
    this.createSession({
      treatmentId: treatment1.id,
      sessionNumber: 3,
      status: "scheduled",
      scheduledDate: new Date("2024-12-03"),
      duration: 50,
      doctorId: "DOC001",
      doctorName: "Dr. Lisa Wong",
      branchId: "BKK001",
      branchName: "Bangkok Branch",
      procedures: ["Fractional CO2 Laser", "PRP application", "LED therapy"],
      productsUsed: [],
      beforePhotos: [],
      afterPhotos: [],
      progressPhotos: [],
      observations: "",
      nextSteps: "",
      cost: 7500,
      notes: "",
    })
    
    // Sample milestones
    this.createMilestone({
      treatmentId: treatment1.id,
      title: "30% Scar Reduction",
      description: "Achieve 30% reduction in acne scar visibility",
      targetDate: new Date("2024-11-15"),
      achievedDate: new Date("2024-11-05"),
      status: "achieved",
      criteria: ["Visual assessment by doctor", "Patient satisfaction", "Photo comparison"],
      photos: ["/photos/milestone-1.jpg"],
      notes: "Target achieved ahead of schedule after session 2",
    })
    
    this.createMilestone({
      treatmentId: treatment1.id,
      title: "50% Scar Reduction",
      description: "Achieve 50% reduction in acne scar visibility",
      targetDate: new Date("2024-12-31"),
      status: "pending",
      criteria: ["Visual assessment by doctor", "Patient satisfaction", "Photo comparison"],
      photos: [],
      notes: "Expected after session 4",
    })
    
    this.createMilestone({
      treatmentId: treatment1.id,
      title: "70% Scar Reduction (Final Goal)",
      description: "Achieve final goal of 70% reduction in acne scar visibility",
      targetDate: new Date("2025-02-01"),
      status: "pending",
      criteria: ["Visual assessment by doctor", "Patient satisfaction", "Photo comparison", "Skin texture analysis"],
      photos: [],
      notes: "Final treatment goal",
    })
    
    // Sample photos
    this.addPhoto({
      treatmentId: treatment1.id,
      type: "before",
      url: "/photos/sarah-face-before-front.jpg",
      thumbnailUrl: "/photos/thumbs/sarah-face-before-front.jpg",
      capturedDate: new Date("2024-10-01"),
      area: "face",
      angle: "front",
      notes: "Initial consultation photos",
      metadata: {
        width: 1920,
        height: 1080,
        size: 245000,
        format: "jpeg",
      },
    })
    
    this.addPhoto({
      treatmentId: treatment1.id,
      type: "before",
      url: "/photos/sarah-face-before-left.jpg",
      thumbnailUrl: "/photos/thumbs/sarah-face-before-left.jpg",
      capturedDate: new Date("2024-10-01"),
      area: "face",
      angle: "left",
      notes: "Left cheek showing prominent acne scars",
      metadata: {
        width: 1920,
        height: 1080,
        size: 238000,
        format: "jpeg",
      },
    })
    
    this.addPhoto({
      treatmentId: treatment1.id,
      sessionId: this.getTreatmentSessions(treatment1.id)[1]?.id,
      type: "progress",
      url: "/photos/sarah-face-progress-session2.jpg",
      thumbnailUrl: "/photos/thumbs/sarah-face-progress-session2.jpg",
      capturedDate: new Date("2024-11-05"),
      area: "face",
      angle: "front",
      notes: "After session 2 - visible improvement",
      metadata: {
        width: 1920,
        height: 1080,
        size: 251000,
        format: "jpeg",
      },
    })
    
    // Sample notes
    this.addNote({
      treatmentId: treatment1.id,
      authorId: "DOC001",
      authorName: "Dr. Lisa Wong",
      authorRole: "Dermatologist",
      content: "Patient showing excellent response to treatment. Recommend continuing with current protocol. Consider adding vitamin C serum to home care routine for enhanced results.",
      isPrivate: false,
      attachments: [],
    })
    
    this.addNote({
      treatmentId: treatment1.id,
      sessionId: this.getTreatmentSessions(treatment1.id)[0]?.id,
      authorId: "NRS001",
      authorName: "Nurse Amy",
      authorRole: "Clinical Nurse",
      content: "Patient asked about post-treatment care. Provided detailed instructions on sunscreen application and avoiding direct sun exposure.",
      isPrivate: false,
      attachments: [],
    })
  }
}

export default TreatmentTracker.getInstance()
