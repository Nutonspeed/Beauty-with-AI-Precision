/**
 * Program Progress Tracker
 * 
 * Core engine for tracking customer program progress, timelines, sessions,
 * before/after photos, milestones, and aesthetic program plans.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProgramStatus = "planned" | "in_progress" | "completed" | "paused" | "cancelled"
export type SessionStatus = "scheduled" | "completed" | "missed" | "cancelled" | "rescheduled"
export type MilestoneStatus = "pending" | "achieved" | "missed" | "skipped"
export type PhotoType = "before" | "after" | "progress"
export type ProgressRating = 1 | 2 | 3 | 4 | 5
export type ProgramCategory = "skin" | "hair" | "body" | "facial" | "laser" | "injection" | "other"

// ============================================================================
// INTERFACES
// ============================================================================

export interface ProgramPlan {
  id: string
  clientId: string
  clientName: string
  category: ProgramCategory
  programName: string
  description: string
  status: ProgramStatus
  startDate: Date
  estimatedEndDate: Date
  actualEndDate?: Date
  totalSessions: number
  completedSessions: number
  specialistId: string
  specialistName: string
  centerId: string
  centerName: string
  goals: string[]
  concerns: string[]
  estimatedCost: number
  actualCost: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ProgramSession {
  id: string
  programId: string
  sessionNumber: number
  status: SessionStatus
  scheduledDate: Date
  completedDate?: Date
  duration: number // in minutes
  specialistId: string
  specialistName: string
  centerId: string
  centerName: string
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
  clientFeedback?: string
  clientRating?: ProgressRating
  nextSteps: string
  cost: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ProgramMilestone {
  id: string
  programId: string
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

export interface ProgramPhoto {
  id: string
  programId: string
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

export interface ProgramTimeline {
  id: string
  programId: string
  date: Date
  type: "session" | "milestone" | "note" | "photo" | "status_change"
  title: string
  description: string
  relatedId?: string // sessionId, milestoneId, etc.
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface ProgramNote {
  id: string
  programId: string
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

export interface ProgramReport {
  programId: string
  clientId: string
  clientName: string
  programName: string
  category: ProgramCategory
  status: ProgramStatus
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
  timeline: ProgramTimeline[]
  recentNotes: ProgramNote[]
}

export interface ClientProgramSummary {
  clientId: string
  clientName: string
  totalPrograms: number
  activePrograms: number
  completedPrograms: number
  totalSessions: number
  totalSpent: number
  averageRating: number
  programs: ProgramPlan[]
  upcomingSessions: ProgramSession[]
}

// ============================================================================
// PROGRAM TRACKER CLASS
// ============================================================================

export class ProgramTracker {
  private static instance: ProgramTracker
  
  private programs: Map<string, ProgramPlan> = new Map()
  private sessions: Map<string, ProgramSession> = new Map()
  private milestones: Map<string, ProgramMilestone> = new Map()
  private photos: Map<string, ProgramPhoto> = new Map()
  private timeline: Map<string, ProgramTimeline> = new Map()
  private notes: Map<string, ProgramNote> = new Map()
  
  private constructor() {
    this.initializeSampleData()
  }
  
  static getInstance(): ProgramTracker {
    if (!ProgramTracker.instance) {
      ProgramTracker.instance = new ProgramTracker()
    }
    return ProgramTracker.instance
  }
  
  // ==========================================================================
  // PROGRAM PLAN MANAGEMENT
  // ==========================================================================
  
  createProgram(data: Omit<ProgramPlan, "id" | "createdAt" | "updatedAt">): ProgramPlan {
    const program: ProgramPlan = {
      id: `PRG${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.programs.set(program.id, program)
    
    // Add timeline entry
    this.addTimelineEntry({
      programId: program.id,
      type: "status_change",
      title: "Program Created",
      description: `${program.programName} program plan created`,
    })
    
    return program
  }
  
  getProgram(programId: string): ProgramPlan | undefined {
    return this.programs.get(programId)
  }
  
  getAllPrograms(filters?: {
    clientId?: string
    status?: ProgramStatus
    category?: ProgramCategory
    specialistId?: string
    centerId?: string
  }): ProgramPlan[] {
    let programs = Array.from(this.programs.values())
    
    if (filters) {
      if (filters.clientId) {
        programs = programs.filter(p => p.clientId === filters.clientId)
      }
      if (filters.status) {
        programs = programs.filter(p => p.status === filters.status)
      }
      if (filters.category) {
        programs = programs.filter(p => p.category === filters.category)
      }
      if (filters.specialistId) {
        programs = programs.filter(p => p.specialistId === filters.specialistId)
      }
      if (filters.centerId) {
        programs = programs.filter(p => p.centerId === filters.centerId)
      }
    }
    
    return programs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  updateProgram(programId: string, updates: Partial<Omit<ProgramPlan, "id" | "createdAt">>): ProgramPlan | null {
    const program = this.programs.get(programId)
    if (!program) return null
    
    const oldStatus = program.status
    const updatedProgram: ProgramPlan = {
      ...program,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.programs.set(programId, updatedProgram)
    
    // Add timeline entry for status change
    if (updates.status && updates.status !== oldStatus) {
      this.addTimelineEntry({
        programId,
        type: "status_change",
        title: "Status Updated",
        description: `Program status changed from ${oldStatus} to ${updates.status}`,
      })
    }
    
    return updatedProgram
  }
  
  deleteProgram(programId: string): boolean {
    return this.programs.delete(programId)
  }
  
  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================
  
  createSession(data: Omit<ProgramSession, "id" | "createdAt" | "updatedAt">): ProgramSession {
    const session: ProgramSession = {
      id: `SES${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.sessions.set(session.id, session)
    
    // Update program completed sessions if status is completed
    if (session.status === "completed") {
      const program = this.programs.get(session.programId)
      if (program) {
        program.completedSessions += 1
        program.actualCost += session.cost
        program.updatedAt = new Date()
        this.programs.set(program.id, program)
      }
    }
    
    // Add timeline entry
    this.addTimelineEntry({
      programId: session.programId,
      type: "session",
      title: `Session ${session.sessionNumber}`,
      description: `Session ${session.status}: ${session.procedures.join(", ")}`,
      relatedId: session.id,
    })
    
    return session
  }
  
  getSession(sessionId: string): ProgramSession | undefined {
    return this.sessions.get(sessionId)
  }
  
  getProgramSessions(programId: string): ProgramSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.programId === programId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
  }
  
  getUpcomingSessions(filters?: {
    clientId?: string
    specialistId?: string
    centerId?: string
    startDate?: Date
    endDate?: Date
  }): ProgramSession[] {
    let sessions = Array.from(this.sessions.values())
      .filter(s => s.status === "scheduled")
    
    if (filters) {
      if (filters.specialistId) {
        sessions = sessions.filter(s => s.specialistId === filters.specialistId)
      }
      if (filters.centerId) {
        sessions = sessions.filter(s => s.centerId === filters.centerId)
      }
      if (filters.startDate) {
        sessions = sessions.filter(s => s.scheduledDate >= filters.startDate!)
      }
      if (filters.endDate) {
        sessions = sessions.filter(s => s.scheduledDate <= filters.endDate!)
      }
      if (filters.clientId) {
        sessions = sessions.filter(s => {
          const program = this.programs.get(s.programId)
          return program?.clientId === filters.clientId
        })
      }
    }
    
    return sessions.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  }
  
  updateSession(sessionId: string, updates: Partial<Omit<ProgramSession, "id" | "createdAt">>): ProgramSession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    
    const oldStatus = session.status
    const updatedSession: ProgramSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.sessions.set(sessionId, updatedSession)
    
    // Update program if session completed
    if (updates.status === "completed" && oldStatus !== "completed") {
      const program = this.programs.get(session.programId)
      if (program) {
        program.completedSessions += 1
        program.actualCost += updatedSession.cost
        program.updatedAt = new Date()
        this.programs.set(program.id, program)
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
  
  createMilestone(data: Omit<ProgramMilestone, "id" | "createdAt" | "updatedAt">): ProgramMilestone {
    const milestone: ProgramMilestone = {
      id: `MLS${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.milestones.set(milestone.id, milestone)
    
    // Add timeline entry
    this.addTimelineEntry({
      programId: milestone.programId,
      type: "milestone",
      title: milestone.title,
      description: `Milestone ${milestone.status}: ${milestone.description}`,
      relatedId: milestone.id,
    })
    
    return milestone
  }
  
  getMilestone(milestoneId: string): ProgramMilestone | undefined {
    return this.milestones.get(milestoneId)
  }
  
  getProgramMilestones(programId: string): ProgramMilestone[] {
    return Array.from(this.milestones.values())
      .filter(m => m.programId === programId)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  }
  
  updateMilestone(milestoneId: string, updates: Partial<Omit<ProgramMilestone, "id" | "createdAt">>): ProgramMilestone | null {
    const milestone = this.milestones.get(milestoneId)
    if (!milestone) return null
    
    const updatedMilestone: ProgramMilestone = {
      ...milestone,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.milestones.set(milestoneId, updatedMilestone)
    
    // Add timeline entry for achieved milestones
    if (updates.status === "achieved" && milestone.status !== "achieved") {
      this.addTimelineEntry({
        programId: milestone.programId,
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
  
  addPhoto(data: Omit<ProgramPhoto, "id" | "createdAt">): ProgramPhoto {
    const photo: ProgramPhoto = {
      id: `PHT${Date.now()}`,
      ...data,
      createdAt: new Date(),
    }
    
    this.photos.set(photo.id, photo)
    
    // Add timeline entry
    this.addTimelineEntry({
      programId: photo.programId,
      type: "photo",
      title: `${photo.type.charAt(0).toUpperCase() + photo.type.slice(1)} Photo Added`,
      description: `${photo.area} - ${photo.angle}`,
      relatedId: photo.id,
    })
    
    return photo
  }
  
  getPhoto(photoId: string): ProgramPhoto | undefined {
    return this.photos.get(photoId)
  }
  
  getProgramPhotos(programId: string, filters?: {
    type?: PhotoType
    sessionId?: string
    milestoneId?: string
  }): ProgramPhoto[] {
    let photos = Array.from(this.photos.values())
      .filter(p => p.programId === programId)
    
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
  
  private addTimelineEntry(data: Omit<ProgramTimeline, "id" | "date" | "createdAt">): ProgramTimeline {
    const entry: ProgramTimeline = {
      id: `TML${Date.now()}`,
      date: new Date(),
      ...data,
      createdAt: new Date(),
    }
    
    this.timeline.set(entry.id, entry)
    return entry
  }
  
  getProgramTimeline(programId: string, filters?: {
    type?: ProgramTimeline["type"]
    startDate?: Date
    endDate?: Date
  }): ProgramTimeline[] {
    let entries = Array.from(this.timeline.values())
      .filter(e => e.programId === programId)
    
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
  
  addNote(data: Omit<ProgramNote, "id" | "createdAt" | "updatedAt">): ProgramNote {
    const note: ProgramNote = {
      id: `NOT${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.notes.set(note.id, note)
    
    // Add timeline entry
    this.addTimelineEntry({
      programId: note.programId,
      type: "note",
      title: "Note Added",
      description: note.content.substring(0, 100) + (note.content.length > 100 ? "..." : ""),
      relatedId: note.id,
    })
    
    return note
  }
  
  getNote(noteId: string): ProgramNote | undefined {
    return this.notes.get(noteId)
  }
  
  getProgramNotes(programId: string, filters?: {
    sessionId?: string
    authorId?: string
    includePrivate?: boolean
  }): ProgramNote[] {
    let notes = Array.from(this.notes.values())
      .filter(n => n.programId === programId)
    
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
  
  updateNote(noteId: string, updates: Partial<Omit<ProgramNote, "id" | "createdAt">>): ProgramNote | null {
    const note = this.notes.get(noteId)
    if (!note) return null
    
    const updatedNote: ProgramNote = {
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
  
  generateProgramReport(programId: string): ProgramReport | null {
    const program = this.programs.get(programId)
    if (!program) return null
    
    const sessions = this.getProgramSessions(programId)
    const milestones = this.getProgramMilestones(programId)
    const photos = this.getProgramPhotos(programId)
    const timeline = this.getProgramTimeline(programId)
    const notes = this.getProgramNotes(programId).slice(0, 10)
    
    const completedSessions = sessions.filter(s => s.status === "completed")
    const missedSessions = sessions.filter(s => s.status === "missed")
    const ratings = completedSessions.filter(s => s.clientRating).map(s => s.clientRating!)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    
    const startDate = program.startDate
    const endDate = program.actualEndDate || new Date()
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const progress = program.totalSessions > 0 ? (program.completedSessions / program.totalSessions) * 100 : 0
    
    const achievedMilestones = milestones.filter(m => m.status === "achieved").length
    
    const beforePhotos = photos.filter(p => p.type === "before").length
    const afterPhotos = photos.filter(p => p.type === "after").length
    const progressPhotos = photos.filter(p => p.type === "progress").length
    
    return {
      programId: program.id,
      clientId: program.clientId,
      clientName: program.clientName,
      programName: program.programName,
      category: program.category,
      status: program.status,
      startDate: program.startDate,
      endDate: program.actualEndDate,
      duration,
      progress,
      totalSessions: program.totalSessions,
      completedSessions: program.completedSessions,
      missedSessions: missedSessions.length,
      averageRating,
      totalCost: program.actualCost,
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
  
  getClientSummary(clientId: string): ClientProgramSummary {
    const programs = this.getAllPrograms({ clientId })
    const activePrograms = programs.filter(p => p.status === "in_progress" || p.status === "planned")
    const completedPrograms = programs.filter(p => p.status === "completed")
    
    const allSessions = programs.flatMap(p => this.getProgramSessions(p.id))
    const completedSessions = allSessions.filter(s => s.status === "completed")
    const ratings = completedSessions.filter(s => s.clientRating).map(s => s.clientRating!)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    
    const totalSpent = programs.reduce((sum, p) => sum + p.actualCost, 0)
    
    const upcomingSessions = this.getUpcomingSessions({ clientId })
    
    return {
      clientId,
      clientName: programs[0]?.clientName || "Unknown",
      totalPrograms: programs.length,
      activePrograms: activePrograms.length,
      completedPrograms: completedPrograms.length,
      totalSessions: allSessions.length,
      totalSpent,
      averageRating,
      programs,
      upcomingSessions: upcomingSessions.slice(0, 5),
    }
  }
  
  // ==========================================================================
  // SAMPLE DATA
  // ==========================================================================
  
  private initializeSampleData() {
    // Sample program plan
    const program1 = this.createProgram({
      clientId: "CST001",
      clientName: "Sarah Johnson",
      category: "skin",
      programName: "Aesthetic Precision - Laser Protocol",
      description: "6-session high-precision laser program for skin refinement",
      status: "in_progress",
      startDate: new Date("2024-10-01"),
      estimatedEndDate: new Date("2025-02-01"),
      totalSessions: 6,
      completedSessions: 2,
      specialistId: "SPEC001",
      specialistName: "Specialist Lisa Wong",
      centerId: "BKK001",
      centerName: "Bangkok Aesthetic Center",
      goals: ["Refine skin texture by 70%", "Optimize skin luminosity", "Balance skin tone"],
      concerns: ["Texture irregularities", "Uneven skin tone", "Post-inflammatory markers"],
      estimatedCost: 45000,
      actualCost: 15000,
      notes: "Client is responding excellently to the protocol. Optimized recovery noted.",
    })
    
    const _program2 = this.createProgram({
      clientId: "CST001",
      clientName: "Sarah Johnson",
      category: "facial",
      programName: "Regenerative Aesthetic Rejuvenation",
      description: "4-session regenerative facial protocol with bio-optimization",
      status: "planned",
      startDate: new Date("2025-01-15"),
      estimatedEndDate: new Date("2025-03-15"),
      totalSessions: 4,
      completedSessions: 0,
      specialistId: "SPEC002",
      specialistName: "Consultant Michael Chen",
      centerId: "BKK001",
      centerName: "Bangkok Aesthetic Center",
      goals: ["Optimize collagen density", "Enhance structural elasticity", "Revitalize complexion"],
      concerns: ["Structural firmness", "Luminosity enhancement", "Complexion optimization"],
      estimatedCost: 28000,
      actualCost: 0,
      notes: "Recommended as sequential optimization post-laser protocol",
    })
    
    // Sample sessions for program1
    this.createSession({
      programId: program1.id,
      sessionNumber: 1,
      status: "completed",
      scheduledDate: new Date("2024-10-08"),
      completedDate: new Date("2024-10-08"),
      duration: 45,
      specialistId: "SPEC001",
      specialistName: "Specialist Lisa Wong",
      centerId: "BKK001",
      centerName: "Bangkok Aesthetic Center",
      procedures: ["Fractional Precision Laser", "Cryo-Optimization"],
      productsUsed: [
        { productId: "PRD001", productName: "Aesthetic preparation cream", quantity: 1, unit: "application" },
        { productId: "PRD002", productName: "Bio-Cooling recovery gel", quantity: 1, unit: "tube" },
      ],
      beforePhotos: ["/photos/sarah-before-1.jpg"],
      afterPhotos: ["/photos/sarah-after-1.jpg"],
      progressPhotos: [],
      observations: "Exceptional response to laser modulation. Minor erythema resolved within 24h.",
      clientFeedback: "Minimal discomfort, very professional procedure",
      clientRating: 4,
      nextSteps: "Schedule session 2 in 4 weeks. Maintain SPF 50+ bio-shield.",
      cost: 7500,
      notes: "Client tolerated the modulation protocol well",
    })
    
    this.createSession({
      programId: program1.id,
      sessionNumber: 2,
      status: "completed",
      scheduledDate: new Date("2024-11-05"),
      completedDate: new Date("2024-11-05"),
      duration: 50,
      specialistId: "SPEC001",
      specialistName: "Specialist Lisa Wong",
      centerId: "BKK001",
      centerName: "Bangkok Aesthetic Center",
      procedures: ["Fractional Precision Laser", "Bio-Regenerative Application", "Cryo-Optimization"],
      productsUsed: [
        { productId: "PRD001", productName: "Aesthetic preparation cream", quantity: 1, unit: "application" },
        { productId: "PRD003", productName: "Regenerative Complex kit", quantity: 1, unit: "kit" },
        { productId: "PRD002", productName: "Bio-Cooling recovery gel", quantity: 1, unit: "tube" },
      ],
      beforePhotos: ["/photos/sarah-before-2.jpg"],
      afterPhotos: ["/photos/sarah-after-2.jpg"],
      progressPhotos: ["/photos/sarah-progress-2.jpg"],
      observations: "Significant structural improvement post-session 1. Markers reduced by approx 30%.",
      clientFeedback: "Thrilled with the refinement. Texture is noticeably smoother.",
      clientRating: 5,
      nextSteps: "Proceed with session 3 in 4 weeks. Optimized skincare maintenance.",
      cost: 7500,
      notes: "Accelerated progress observed",
    })
  }
}
