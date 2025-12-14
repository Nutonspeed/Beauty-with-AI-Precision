// Event Schema for Sales Dashboard
// Defines all events that can be published by the sales module

export type EventType = 
  | "lead.created"
  | "lead.updated"
  | "lead.status_changed"
  | "lead.deleted"
  | "proposal.created"
  | "proposal.updated"
  | "proposal.sent"
  | "proposal.viewed"
  | "proposal.accepted"
  | "proposal.rejected"
  | "proposal.booked"
  | "activity.created"

export interface BaseEvent {
  id: string
  type: EventType
  timestamp: string
  source: string // e.g., "sales-api", "sales-service"
  version: string // event schema version
  correlation_id?: string // for tracing related events
  user_id?: string // user who triggered the event
  clinic_id?: string // clinic context
}

export interface LeadEvent extends BaseEvent {
  type: "lead.created" | "lead.updated" | "lead.status_changed" | "lead.deleted"
  data: {
    lead_id: string
    sales_user_id: string
    previous_status?: string
    new_status?: string
    changes?: Record<string, any>
    metadata?: Record<string, any>
  }
}

export interface ProposalEvent extends BaseEvent {
  type: "proposal.created" | "proposal.updated" | "proposal.sent" | "proposal.viewed" | "proposal.accepted" | "proposal.rejected" | "proposal.booked"
  data: {
    proposal_id: string
    lead_id: string
    sales_user_id: string
    previous_status?: string
    new_status?: string
    total_value?: number
    win_probability?: number
    changes?: Record<string, any>
    metadata?: Record<string, any>
  }
}

export interface ActivityEvent extends BaseEvent {
  type: "activity.created"
  data: {
    activity_id: string
    lead_id: string
    proposal_id?: string
    sales_user_id: string
    activity_type: string
    subject: string
    description?: string
    metadata?: Record<string, any>
  }
}

export type SalesEvent = LeadEvent | ProposalEvent | ActivityEvent

// Event Publishing Interface
export interface EventPublisher {
  publish(event: SalesEvent): Promise<void>
  publishBatch(events: SalesEvent[]): Promise<void>
}

// Event Handler Interface
export interface EventHandler<T extends SalesEvent = SalesEvent> {
  handle(event: T): Promise<void>
  canHandle(event: SalesEvent): boolean
}

// Event Store Interface (for persistence and replay)
export interface EventStore {
  save(event: SalesEvent): Promise<void>
  saveBatch(events: SalesEvent[]): Promise<void>
  getEvents(aggregateId?: string, fromTimestamp?: string): Promise<SalesEvent[]>
}
