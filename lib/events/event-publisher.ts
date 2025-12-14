import { SalesEvent, EventPublisher, EventStore } from "./event-schema"
import { createServerClient } from "@/lib/supabase/server"

export class SupabaseEventPublisher implements EventPublisher {
  private eventStore: EventStore

  constructor(eventStore?: EventStore) {
    this.eventStore = eventStore || new SupabaseEventStore()
  }

  async publish(event: SalesEvent): Promise<void> {
    // Save to event store for persistence and replay
    await this.eventStore.save(event)

    // Publish to real-time channels (for immediate consumption)
    await this.publishToRealtime(event)
  }

  async publishBatch(events: SalesEvent[]): Promise<void> {
    // Save batch to event store
    await this.eventStore.saveBatch(events)

    // Publish batch to real-time channels
    await Promise.all(events.map(event => this.publishToRealtime(event)))
  }

  private async publishToRealtime(event: SalesEvent): Promise<void> {
    try {
      const supabase = await createServerClient()
      
      // Publish to clinic-specific channel
      if (event.clinic_id) {
        await supabase.channel(`clinic:${event.clinic_id}`)
          .send({
            type: 'broadcast',
            event: 'sales_event',
            payload: event
          })
      }

      // Publish to user-specific channel
      if (event.user_id) {
        await supabase.channel(`user:${event.user_id}`)
          .send({
            type: 'broadcast',
            event: 'sales_event',
            payload: event
          })
      }

      // Publish to global sales events channel
      await supabase.channel('sales_events')
        .send({
          type: 'broadcast',
          event: 'sales_event',
          payload: event
        })

    } catch (error) {
      console.error('Failed to publish event to realtime:', error)
      // Don't throw - realtime publishing is best effort
    }
  }
}

class SupabaseEventStore implements EventStore {
  async save(event: SalesEvent): Promise<void> {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('event_store')
      .insert({
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
        version: event.version,
        correlation_id: event.correlation_id,
        user_id: event.user_id,
        clinic_id: event.clinic_id,
        data: event.data
      })

    if (error) {
      console.error('Failed to save event to store:', error)
      throw error
    }
  }

  async saveBatch(events: SalesEvent[]): Promise<void> {
    const supabase = await createServerClient()
    
    const eventsData = events.map(event => ({
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      source: event.source,
      version: event.version,
      correlation_id: event.correlation_id,
      user_id: event.user_id,
      clinic_id: event.clinic_id,
      data: event.data
    }))

    const { error } = await supabase
      .from('event_store')
      .insert(eventsData)

    if (error) {
      console.error('Failed to save batch events to store:', error)
      throw error
    }
  }

  async getEvents(aggregateId?: string, fromTimestamp?: string): Promise<SalesEvent[]> {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('event_store')
      .select('*')
      .order('timestamp', { ascending: true })

    if (aggregateId) {
      // Filter by aggregate ID (lead_id, proposal_id, etc.)
      query = query.or(`data->>lead_id.eq.${aggregateId},data->>proposal_id.eq.${aggregateId}`)
    }

    if (fromTimestamp) {
      query = query.gte('timestamp', fromTimestamp)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to retrieve events from store:', error)
      throw error
    }

    return (data || []).map(row => ({
      id: row.id,
      type: row.type,
      timestamp: row.timestamp,
      source: row.source,
      version: row.version,
      correlation_id: row.correlation_id,
      user_id: row.user_id,
      clinic_id: row.clinic_id,
      data: row.data
    })) as SalesEvent[]
  }
}

// Event factory functions
export function createEvent(
  type: SalesEvent['type'],
  data: SalesEvent['data'],
  options: {
    user_id?: string
    clinic_id?: string
    correlation_id?: string
    source?: string
  } = {}
): SalesEvent {
  const event = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    source: options.source || 'sales-service',
    version: '1.0',
    data,
    ...(options.user_id && { user_id: options.user_id }),
    ...(options.clinic_id && { clinic_id: options.clinic_id }),
    ...(options.correlation_id && { correlation_id: options.correlation_id })
  } as const

  return event as unknown as SalesEvent
}

// Global event publisher instance
let eventPublisher: EventPublisher | null = null

export function getEventPublisher(): EventPublisher {
  if (!eventPublisher) {
    eventPublisher = new SupabaseEventPublisher()
  }
  return eventPublisher
}
