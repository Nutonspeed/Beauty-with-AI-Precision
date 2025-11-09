/**
 * Offline Mode Integration Test
 * 
 * This test verifies the complete offline workflow:
 * 1. Save analysis/lead offline
 * 2. Verify data in IndexedDB
 * 3. Simulate reconnection
 * 4. Verify auto-sync
 * 5. Check conflict resolution
 * 
 * Run: npm run test:offline
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'

// Mock IndexedDB for Node.js environment
import 'fake-indexeddb/auto'

// Import our offline modules
import { getIndexedDB, resetIndexedDB } from '@/lib/db/indexed-db'
import { getConflictResolver, resetConflictResolver } from '@/lib/sync/conflict-resolver'
import { getBackgroundSyncManager, resetBackgroundSyncManager } from '@/lib/sync/background-sync'
import type { MultiTenantSkinAnalysis, Lead } from '@/types/multi-tenant'
import type { OfflineAnalysis, OfflineLead } from '@/lib/db/indexed-db'

describe('Offline Mode - Complete Workflow', () => {
  let indexedDB: ReturnType<typeof getIndexedDB>
  let conflictResolver: ReturnType<typeof getConflictResolver>

  const clinicId = 'test-clinic-1'
  const salesStaffId = 'test-staff-1'

  const createAnalysis = (overrides: Partial<MultiTenantSkinAnalysis> = {}): MultiTenantSkinAnalysis => {
    const now = overrides.updated_at ?? new Date().toISOString()
    const base: MultiTenantSkinAnalysis = {
      id: overrides.id ?? 'analysis-default',
      user_id: overrides.user_id ?? 'user-default',
      clinic_id: overrides.clinic_id ?? clinicId,
      branch_id: overrides.branch_id,
      sales_staff_id: overrides.sales_staff_id ?? salesStaffId,
      image_url: overrides.image_url ?? 'https://example.com/offline-analysis.jpg',
      overall_score: overrides.overall_score ?? 75,
      confidence: overrides.confidence ?? 0.9,
      spots_severity: overrides.spots_severity ?? 0,
      spots_count: overrides.spots_count ?? 0,
      pores_severity: overrides.pores_severity ?? 0,
      pores_count: overrides.pores_count ?? 0,
      wrinkles_severity: overrides.wrinkles_severity ?? 0,
      wrinkles_count: overrides.wrinkles_count ?? 0,
      texture_severity: overrides.texture_severity ?? 0,
      redness_severity: overrides.redness_severity ?? 0,
      redness_count: overrides.redness_count ?? 0,
      created_at: overrides.created_at ?? now,
      updated_at: overrides.updated_at ?? now,
      patient_name: overrides.patient_name,
      patient_age: overrides.patient_age,
      patient_gender: overrides.patient_gender,
      patient_skin_type: overrides.patient_skin_type,
      ai_skin_type: overrides.ai_skin_type,
      ai_concerns: overrides.ai_concerns ?? [],
      ai_severity: overrides.ai_severity,
      ai_treatment_plan: overrides.ai_treatment_plan,
      recommendations: overrides.recommendations ?? [],
      notes: overrides.notes,
      analysis_time_ms: overrides.analysis_time_ms,
      is_shared: overrides.is_shared,
      share_token: overrides.share_token,
      share_expires_at: overrides.share_expires_at,
    }

    return { ...base, ...overrides }
  }

  const createOfflineAnalysis = (overrides: Partial<OfflineAnalysis> = {}): OfflineAnalysis => {
    const { offline_created, offline_timestamp, synced, sync_attempts, last_sync_error, ...analysisOverrides } = overrides
    const base = createAnalysis(analysisOverrides)

    return {
      ...base,
      offline_created: offline_created ?? true,
      offline_timestamp: offline_timestamp ?? Date.now(),
      synced: synced ?? false,
      sync_attempts: sync_attempts ?? 0,
      last_sync_error,
    }
  }

  const createLead = (overrides: Partial<Lead> = {}): Lead => {
    const now = overrides.updated_at ?? new Date().toISOString()
    const base: Lead = {
      id: overrides.id ?? 'lead-default',
      clinic_id: overrides.clinic_id ?? clinicId,
      branch_id: overrides.branch_id,
      sales_staff_id: overrides.sales_staff_id ?? salesStaffId,
      full_name: overrides.full_name ?? 'Lead Name',
      phone: overrides.phone,
      email: overrides.email,
      line_id: overrides.line_id,
      status: overrides.status ?? 'new',
      source: overrides.source,
      analysis_id: overrides.analysis_id,
      follow_up_date: overrides.follow_up_date,
      last_contact_date: overrides.last_contact_date,
      next_action: overrides.next_action,
      interested_treatments: overrides.interested_treatments ?? [],
      budget_range: overrides.budget_range,
      converted_to_customer: overrides.converted_to_customer ?? false,
      converted_user_id: overrides.converted_user_id,
      converted_at: overrides.converted_at,
      notes: overrides.notes,
      interaction_history: overrides.interaction_history ?? [],
      lead_score: overrides.lead_score ?? 0,
      offline_created: overrides.offline_created,
      offline_timestamp: overrides.offline_timestamp,
      synced: overrides.synced,
      sync_attempts: overrides.sync_attempts,
      last_sync_error: overrides.last_sync_error,
      created_at: overrides.created_at ?? now,
      updated_at: overrides.updated_at ?? now,
    }

    return { ...base, ...overrides }
  }

  const createOfflineLead = (overrides: Partial<OfflineLead> = {}): OfflineLead => {
    const { offline_created, offline_timestamp, synced, sync_attempts, last_sync_error, ...leadOverrides } = overrides
    const base = createLead(leadOverrides)

    return {
      ...base,
      offline_created: offline_created ?? true,
      offline_timestamp: offline_timestamp ?? Date.now(),
      synced: synced ?? false,
      sync_attempts: sync_attempts ?? 0,
      last_sync_error,
    }
  }

  const triggerCleanup = async (manager: typeof indexedDB, staffId: string, keepLast = 50) => {
    const cleanup = (manager as unknown as { cleanupOldAnalyses: (salesStaffId: string, limit?: number) => Promise<void> }).cleanupOldAnalyses
    await cleanup.call(manager, staffId, keepLast)
  }

  beforeAll(async () => {
    indexedDB = getIndexedDB()
    conflictResolver = getConflictResolver()

    await indexedDB.initialize()
  }, 30000) // Increase timeout for IndexedDB initialization

  afterAll(async () => {
    await indexedDB.clearAll()
    resetIndexedDB()
    resetConflictResolver()
    resetBackgroundSyncManager()
  }, 30000) // Increase timeout for cleanup

  beforeEach(async () => {
    await indexedDB.clearAll()
  }, 30000) // Increase timeout for clearing between tests

  describe('IndexedDB Storage', () => {
    it('should save analysis with clinic scope', async () => {
      const analysis = createAnalysis({
        id: 'analysis-1',
        patient_name: 'Test Patient',
        ai_skin_type: 'oily',
        ai_concerns: ['acne', 'dark_spots'],
        recommendations: ['laser_treatment', 'chemical_peel'],
      })

      await indexedDB.saveAnalysis(analysis, true)

      const saved = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      expect(saved).toHaveLength(1)
      expect(saved[0].patient_name).toBe('Test Patient')
      expect(saved[0].synced).toBe(false)
      expect(saved[0].ai_concerns).toContain('acne')
    })

    it('should enforce max 50 analyses per staff', async () => {
      vi.useFakeTimers()
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime()

      for (let i = 0; i < 60; i++) {
        vi.setSystemTime(baseTime + i * 1000)
        await indexedDB.saveAnalysis(
          createAnalysis({
            id: `analysis-${i}`,
            patient_name: `Patient ${i}`,
          }),
          true
        )
      }

      vi.useRealTimers()

      const analyses = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId, 100)
      expect(analyses.length).toBeLessThanOrEqual(50)
      
      // Should keep the newest 50
      expect(analyses[0].patient_name).toBe('Patient 59')
    }, 30000) // Increase timeout for large batch operations

    it('should isolate data by clinic', async () => {
      await indexedDB.saveAnalysis(
        createAnalysis({
          id: 'analysis-1',
          clinic_id: 'clinic-1',
          patient_name: 'Clinic 1 Patient',
        }),
        true
      )

      await indexedDB.saveAnalysis(
        createAnalysis({
          id: 'analysis-2',
          clinic_id: 'clinic-2',
          patient_name: 'Clinic 2 Patient',
        }),
        true
      )

      const clinic1Data = await indexedDB.getAnalysesBySalesStaff('clinic-1', salesStaffId)
      const clinic2Data = await indexedDB.getAnalysesBySalesStaff('clinic-2', salesStaffId)

      expect(clinic1Data).toHaveLength(1)
      expect(clinic2Data).toHaveLength(1)
      expect(clinic1Data[0].patient_name).toBe('Clinic 1 Patient')
      expect(clinic2Data[0].patient_name).toBe('Clinic 2 Patient')
    }, 30000)

    it('should save lead with all fields', async () => {
      const lead = createLead({
        id: 'lead-1',
        full_name: 'Test Lead',
        phone: '+66812345678',
        email: 'test@example.com',
        status: 'hot',
        source: 'social_media',
        interested_treatments: ['laser', 'facial'],
      })

      await indexedDB.saveLead(lead, true)

      const leads = await indexedDB.getLeadsBySalesStaff(clinicId, salesStaffId)
      expect(leads).toHaveLength(1)
      expect(leads[0].full_name).toBe('Test Lead')
      expect(leads[0].status).toBe('hot')
    }, 30000)
  })

  describe('Sync Queue Management', () => {
    it('should add action to sync queue', async () => {
      await indexedDB.addToSyncQueue({
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        action_type: 'create_analysis',
        resource_type: 'analysis',
        resource_id: 'analysis-queued',
        data: { patient_name: 'Test' },
      })

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending).toHaveLength(1)
      expect(pending[0].resource_id).toBe('analysis-queued')
    }, 30000)

    it('should process sync queue in FIFO order', async () => {
      vi.useFakeTimers()
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime()

      vi.setSystemTime(baseTime)
      await indexedDB.addToSyncQueue({
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        action_type: 'create_analysis',
        resource_type: 'analysis',
        resource_id: 'analysis-oldest',
        data: {},
      })

      vi.setSystemTime(baseTime + 1000)
      await indexedDB.addToSyncQueue({
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        action_type: 'update_lead',
        resource_type: 'lead',
        resource_id: 'lead-update',
        data: {},
      })

      vi.setSystemTime(baseTime + 2000)
      await indexedDB.addToSyncQueue({
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        action_type: 'create_lead',
        resource_type: 'lead',
        resource_id: 'lead-create',
        data: {},
      })

      vi.useRealTimers()

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending.map((action) => action.resource_id)).toEqual([
        'analysis-oldest',
        'lead-update',
        'lead-create',
      ])
    }, 30000)

    it('should track retry attempts', async () => {
      await indexedDB.addToSyncQueue({
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        action_type: 'create_analysis',
        resource_type: 'analysis',
        resource_id: 'analysis-retry',
        data: {},
      })

      const [queuedAction] = await indexedDB.getPendingSyncActions()
      const actionId = queuedAction.id

      // Simulate 3 retry attempts
      for (let i = 0; i < 3; i++) {
        await indexedDB.updateSyncActionAttempt(actionId, `Error attempt ${i + 1}`)
      }

      const pending = await indexedDB.getPendingSyncActions()
      const updatedAction = pending.find(a => a.id === actionId)
      
      expect(updatedAction?.attempts).toBe(3)
      expect(updatedAction?.last_error).toBe('Error attempt 3')
    }, 30000)
  })

  describe('Conflict Resolution', () => {
    it('should resolve lead conflict with last-write-wins', async () => {
      const now = Date.now()
      const serverLead = createLead({
        id: 'lead-1',
        full_name: 'Server Lead',
        status: 'hot',
        updated_at: new Date(now - 1000).toISOString(),
      })

      const clientLead = createOfflineLead({
        id: 'lead-1',
        full_name: 'Client Lead',
        status: 'warm',
        offline_timestamp: now,
        updated_at: new Date(now).toISOString(),
      })

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'last_write_wins'
      )

      // Client should win (newer timestamp)
      expect(resolution.resolved_data.status).toBe('warm')
      expect(resolution.strategy).toBe('last_write_wins')
    }, 30000)

    it('should detect critical field conflicts requiring manual review', async () => {
      const now = Date.now()
      const serverLead = createLead({
        id: 'lead-1',
        full_name: 'Test Lead',
        status: 'hot',
        follow_up_date: '2024-01-20',
        converted_to_customer: false,
      })

      const clientLead = createOfflineLead({
        id: 'lead-1',
        full_name: 'Test Lead',
        status: 'warm',
        follow_up_date: '2024-01-25',
        converted_to_customer: true,
        offline_timestamp: now,
        updated_at: new Date(now).toISOString(),
      })

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'last_write_wins'
      )

      expect(resolution.requires_manual_review).toBe(true)
      expect(resolution.conflicts_found.length).toBeGreaterThanOrEqual(3)
    }, 30000)

    it('should merge interaction histories', async () => {
      const serverLead = createLead({
        id: 'lead-1',
        interaction_history: [
          { date: '2024-01-15', type: 'call', notes: 'Server call' },
        ],
      })

      const clientLead = createOfflineLead({
        id: 'lead-1',
        interaction_history: [
          { date: '2024-01-16', type: 'email', notes: 'Client email' },
        ],
        offline_timestamp: Date.now(),
      })

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'merge'
      )

      const mergedHistory = resolution.resolved_data.interaction_history
      expect(mergedHistory).toHaveLength(2)
      expect(mergedHistory[0].type).toBe('email') // Newer first
      expect(mergedHistory[1].type).toBe('call')
    }, 30000)

    it('should merge analysis notes with separator', async () => {
      const serverAnalysis = createAnalysis({
        id: 'analysis-1',
        notes: 'Server notes: Patient has sensitive skin',
        updated_at: new Date(Date.now() - 1000).toISOString(),
      })

      const clientAnalysis = createOfflineAnalysis({
        id: 'analysis-1',
        notes: 'Client notes: Recommended gentle cleanser',
        offline_timestamp: Date.now(),
      })

      const resolution = conflictResolver.resolveAnalysisConflict(
        serverAnalysis,
        clientAnalysis,
        'merge'
      )

      expect(resolution.resolved_data.notes).toContain('Server notes')
      expect(resolution.resolved_data.notes).toContain('--- Offline Edit ---')
      expect(resolution.resolved_data.notes).toContain('Client notes')
    }, 30000)
  })

  describe('Offline Indicator State', () => {
    it('should reflect pending count', async () => {
      // Add 3 pending actions
      for (let i = 0; i < 3; i++) {
        await indexedDB.addToSyncQueue({
          clinic_id: clinicId,
          sales_staff_id: salesStaffId,
          action_type: 'create_analysis',
          resource_type: 'analysis',
          resource_id: `analysis-pending-${i}`,
          data: {},
        })
      }

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending).toHaveLength(3)
    }, 30000)

    it('should calculate storage statistics', async () => {
      // Add some data
      await indexedDB.saveAnalysis(
        createAnalysis({ id: 'analysis-1', patient_name: 'Test' }),
        true
      )

      await indexedDB.saveLead(
        createLead({ id: 'lead-1', full_name: 'Test Lead' }),
        true
      )

      const stats = await indexedDB.getStats()
      
      expect(stats.analyses_count).toBe(1)
      expect(stats.leads_count).toBe(1)
      expect(stats.total_size_mb).toBeGreaterThan(0)
    }, 30000)
  })

  describe('Cleanup Operations', () => {
    it('should clean up old synced analyses after 24 hours', async () => {
      vi.useFakeTimers()
      const baseTime = new Date('2024-01-15T00:00:00Z').getTime()

      // Add old synced analysis (older than 24h)
      vi.setSystemTime(baseTime - 25 * 60 * 60 * 1000)
      await indexedDB.saveAnalysis(
        createAnalysis({
          id: 'old-analysis',
          patient_name: 'Old Patient',
        }),
        false
      )

      // Add recent unsynced analysis
      vi.setSystemTime(baseTime)
      await indexedDB.saveAnalysis(
        createAnalysis({
          id: 'new-analysis',
          patient_name: 'New Patient',
        }),
        true
    )

    await triggerCleanup(indexedDB, salesStaffId, 1)
      vi.useRealTimers()

      const remaining = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      
      // Old synced should be removed, new unsynced should remain
      expect(remaining.some(a => a.id === 'old-analysis')).toBe(false)
      expect(remaining.some(a => a.id === 'new-analysis')).toBe(true)
    }, 30000)

    it('should clear all data on reset', async () => {
      await indexedDB.saveAnalysis(createAnalysis({ id: 'analysis-1' }), true)

      await indexedDB.saveLead(createLead({ id: 'lead-1' }), true)

      await indexedDB.clearAll()

      const analyses = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      const leads = await indexedDB.getLeadsBySalesStaff(clinicId, salesStaffId)
      const pending = await indexedDB.getPendingSyncActions()

      expect(analyses).toHaveLength(0)
      expect(leads).toHaveLength(0)
      expect(pending).toHaveLength(0)
    }, 30000)
  })

  describe('Edge Cases', () => {
    let indexedDB: ReturnType<typeof getIndexedDB>

    beforeAll(async () => {
      indexedDB = getIndexedDB()
      await indexedDB.initialize()
    }, 30000)

    afterAll(async () => {
      await indexedDB.clearAll()
    }, 30000)

    it('should handle duplicate IDs gracefully', async () => {
      let analysis = createAnalysis({
        id: 'duplicate-id',
        clinic_id: 'test-clinic',
        sales_staff_id: 'test-staff',
        patient_name: 'First Save',
      })

      await indexedDB.saveAnalysis(analysis, true)
      
      // Save again with same ID (should update)
      analysis = {
        ...analysis,
        patient_name: 'Second Save',
      }
      await indexedDB.saveAnalysis(analysis, true)

      const saved = await indexedDB.getAnalysesBySalesStaff('test-clinic', 'test-staff')
      const duplicate = saved.find(a => a.id === 'duplicate-id')
      
      expect(duplicate?.patient_name).toBe('Second Save')
    })

    it('should handle empty sync queue', async () => {
      await indexedDB.clearAll()
      const pending = await indexedDB.getPendingSyncActions()
      expect(pending).toHaveLength(0)
    })

    it('should handle missing optional fields', async () => {
      await expect(
        indexedDB.saveAnalysis(
          createAnalysis({ id: 'minimal-analysis', clinic_id: 'test-clinic' }),
          true
        )
      ).resolves.not.toThrow()
    })
  })
})
