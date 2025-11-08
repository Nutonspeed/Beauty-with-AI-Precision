import type { PresentationData } from './presentation-types'

const STORAGE_PREFIX = 'presentation-session'
const SYNC_QUEUE_KEY = 'presentation-session-sync-queue'

type DateFieldKeys = 'completedAt' | 'lastSavedAt' | 'lastSyncedAt'

export interface PersistedPresentationData
  extends Omit<PresentationData, DateFieldKeys> {
  completedAt: string | null
  lastSavedAt: string | null
  lastSyncedAt: string | null
}

export interface PresentationSyncRecord {
  id: string
  customerId: string
  payload: PersistedPresentationData
  createdAt: string
  status: 'pending' | 'synced' | 'failed'
  attempts: number
  lastError?: string
  lastAttemptAt?: string
}

export type SyncHandler = (record: PresentationSyncRecord) => Promise<boolean>

function storageKey(customerId: string) {
  return `${STORAGE_PREFIX}:${customerId}`
}

function readQueue(): PresentationSyncRecord[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  const raw = localStorage.getItem(SYNC_QUEUE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as PresentationSyncRecord[]
    }
  } catch (error) {
    console.warn('[presentation-storage] Failed to parse sync queue', error)
  }

  return []
}

function writeQueue(queue: PresentationSyncRecord[]) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

function serialize(data: PresentationData): PersistedPresentationData {
  return {
    ...data,
    completedAt: data.completedAt ? data.completedAt.toISOString() : null,
    lastSavedAt: data.lastSavedAt ? data.lastSavedAt.toISOString() : null,
    lastSyncedAt: data.lastSyncedAt ? data.lastSyncedAt.toISOString() : null,
  }
}

function hydrate(data: PersistedPresentationData): PresentationData {
  return {
    ...data,
    completedAt: data.completedAt ? new Date(data.completedAt) : null,
    lastSavedAt: data.lastSavedAt ? new Date(data.lastSavedAt) : null,
    lastSyncedAt: data.lastSyncedAt ? new Date(data.lastSyncedAt) : null,
  }
}

export function loadPresentationData(customerId: string): PresentationData | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(storageKey(customerId))
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedPresentationData
    return hydrate(parsed)
  } catch (error) {
    console.warn('[presentation-storage] Failed to parse saved presentation', error)
    return null
  }
}

export function savePresentationData(customerId: string, data: PresentationData) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(storageKey(customerId), JSON.stringify(serialize(data)))
}

export function listStoredPresentationIds(): string[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  const ids: string[] = []

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key || !key.startsWith(`${STORAGE_PREFIX}:`)) {
      continue
    }

    ids.push(key.slice(`${STORAGE_PREFIX}:`.length))
  }

  return ids
}

export function clearPresentationData(customerId: string) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(storageKey(customerId))
}

export function enqueuePresentationSync(customerId: string, data: PresentationData) {
  if (typeof localStorage === 'undefined') {
    return
  }

  const queue = readQueue().filter(
    (record) => !(record.customerId === customerId && record.status === 'pending')
  )
  const record: PresentationSyncRecord = {
    id: `${customerId}-${Date.now()}`,
    customerId,
    payload: serialize(data),
    createdAt: new Date().toISOString(),
    status: 'pending',
    attempts: 0,
  }

  queue.push(record)
  writeQueue(queue)
}

export function getPendingSyncRecords() {
  return readQueue().filter((record) => record.status === 'pending')
}

export function updateSyncRecord(id: string, updater: (record: PresentationSyncRecord) => PresentationSyncRecord) {
  if (typeof localStorage === 'undefined') {
    return
  }

  const queue = readQueue()
  const index = queue.findIndex((record) => record.id === id)
  if (index === -1) {
    return
  }

  queue[index] = updater(queue[index])
  writeQueue(queue)
}

export async function flushPresentationSyncQueue(handler: SyncHandler): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) {
    return
  }

  const updatedQueue = await Promise.all(
    queue.map(async (record) => {
      if (record.status === 'synced') {
        return record
      }

      let nextState = { ...record, attempts: record.attempts + 1, lastAttemptAt: new Date().toISOString() }

      try {
        const success = await handler(record)
        if (success) {
          nextState = { ...nextState, status: 'synced', lastError: undefined }
        } else {
          nextState = { ...nextState, status: 'failed', lastError: 'Sync handler returned false' }
        }
      } catch (error) {
        nextState = {
          ...nextState,
          status: 'failed',
          lastError: error instanceof Error ? error.message : 'Unknown sync error',
        }
      }

      return nextState
    })
  )

  writeQueue(updatedQueue)
}
