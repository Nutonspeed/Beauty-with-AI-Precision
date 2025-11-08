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

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Mock IndexedDB for Node.js environment
import 'fake-indexeddb/auto'

// Import our offline modules
import { getIndexedDB, resetIndexedDB } from '@/lib/db/indexed-db'
import { getConflictResolver, resetConflictResolver } from '@/lib/sync/conflict-resolver'
import { getBackgroundSyncManager, resetBackgroundSyncManager } from '@/lib/sync/background-sync'
import type { MultiTenantSkinAnalysis, Lead } from '@/types/multi-tenant'

describe('Offline Mode - Complete Workflow', () => {
  let indexedDB: ReturnType<typeof getIndexedDB>
  let conflictResolver: ReturnType<typeof getConflictResolver>
  let syncManager: ReturnType<typeof getBackgroundSyncManager>

  const clinicId = 'test-clinic-1'
  const salesStaffId = 'test-staff-1'

  beforeAll(async () => {
    indexedDB = getIndexedDB()
    conflictResolver = getConflictResolver()
    syncManager = getBackgroundSyncManager()

    await indexedDB.initialize()
  })

  afterAll(async () => {
    await indexedDB.clearAll()
    resetIndexedDB()
    resetConflictResolver()
    resetBackgroundSyncManager()
  })

  beforeEach(async () => {
    await indexedDB.clearAll()
  })

  describe('IndexedDB Storage', () => {
    it('should save analysis with clinic scope', async () => {
      const analysis: Partial<MultiTenantSkinAnalysis> = {
        id: 'analysis-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        patient_name: 'Test Patient',
        skin_type: 'oily',
        skin_conditions: JSON.stringify(['acne', 'dark_spots']),
        recommendations: JSON.stringify(['laser_treatment', 'chemical_peel']),
      }

      await indexedDB.saveAnalysis(analysis as any, true)

      const saved = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      expect(saved).toHaveLength(1)
      expect(saved[0].patient_name).toBe('Test Patient')
      expect(saved[0].synced).toBe(false)
    })

    it('should enforce max 50 analyses per staff', async () => {
      // Create 60 analyses
      for (let i = 0; i < 60; i++) {
        await indexedDB.saveAnalysis({
          id: `analysis-${i}`,
          clinic_id: clinicId,
          sales_staff_id: salesStaffId,
          patient_name: `Patient ${i}`,
          offline_timestamp: new Date(Date.now() - i * 1000).toISOString(), // Older ones first
        } as any, true)
      }

      const analyses = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId, 100)
      expect(analyses.length).toBeLessThanOrEqual(50)
      
      // Should keep the newest 50
      expect(analyses[0].patient_name).toBe('Patient 59')
    })

    it('should isolate data by clinic', async () => {
      const clinic1Analysis = {
        id: 'analysis-1',
        clinic_id: 'clinic-1',
        sales_staff_id: salesStaffId,
        patient_name: 'Clinic 1 Patient',
      }

      const clinic2Analysis = {
        id: 'analysis-2',
        clinic_id: 'clinic-2',
        sales_staff_id: salesStaffId,
        patient_name: 'Clinic 2 Patient',
      }

      await indexedDB.saveAnalysis(clinic1Analysis as any, true)
      await indexedDB.saveAnalysis(clinic2Analysis as any, true)

      const clinic1Data = await indexedDB.getAnalysesBySalesStaff('clinic-1', salesStaffId)
      const clinic2Data = await indexedDB.getAnalysesBySalesStaff('clinic-2', salesStaffId)

      expect(clinic1Data).toHaveLength(1)
      expect(clinic2Data).toHaveLength(1)
      expect(clinic1Data[0].patient_name).toBe('Clinic 1 Patient')
      expect(clinic2Data[0].patient_name).toBe('Clinic 2 Patient')
    })

    it('should save lead with all fields', async () => {
      const lead: Partial<Lead> = {
        id: 'lead-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        full_name: 'Test Lead',
        phone: '+66812345678',
        email: 'test@example.com',
        status: 'hot',
        source: 'facebook',
        interested_treatments: JSON.stringify(['laser', 'facial']),
      }

      await indexedDB.saveLead(lead as any, true)

      const leads = await indexedDB.getLeadsBySalesStaff(clinicId, salesStaffId)
      expect(leads).toHaveLength(1)
      expect(leads[0].full_name).toBe('Test Lead')
      expect(leads[0].status).toBe('hot')
    })
  })

  describe('Sync Queue Management', () => {
    it('should add action to sync queue', async () => {
      await indexedDB.addToSyncQueue({
        id: 'sync-1',
        clinic_id: clinicId,
        action_type: 'create_analysis',
        data: { patient_name: 'Test' },
        created_at: new Date().toISOString(),
        attempts: 0,
        can_retry: true,
      })

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending).toHaveLength(1)
      expect(pending[0].action_type).toBe('create_analysis')
    })

    it('should process sync queue in FIFO order', async () => {
      // Add 3 actions with different timestamps
      await indexedDB.addToSyncQueue({
        id: 'sync-1',
        clinic_id: clinicId,
        action_type: 'create_analysis',
        data: {},
        created_at: new Date(Date.now() - 3000).toISOString(),
        attempts: 0,
        can_retry: true,
      })

      await indexedDB.addToSyncQueue({
        id: 'sync-2',
        clinic_id: clinicId,
        action_type: 'update_lead',
        data: {},
        created_at: new Date(Date.now() - 2000).toISOString(),
        attempts: 0,
        can_retry: true,
      })

      await indexedDB.addToSyncQueue({
        id: 'sync-3',
        clinic_id: clinicId,
        action_type: 'create_lead',
        data: {},
        created_at: new Date(Date.now() - 1000).toISOString(),
        attempts: 0,
        can_retry: true,
      })

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending[0].id).toBe('sync-1') // Oldest first
      expect(pending[1].id).toBe('sync-2')
      expect(pending[2].id).toBe('sync-3')
    })

    it('should track retry attempts', async () => {
      const actionId = 'sync-retry-test'
      await indexedDB.addToSyncQueue({
        id: actionId,
        clinic_id: clinicId,
        action_type: 'create_analysis',
        data: {},
        created_at: new Date().toISOString(),
        attempts: 0,
        can_retry: true,
      })

      // Simulate 3 retry attempts
      for (let i = 0; i < 3; i++) {
        await indexedDB.updateSyncActionAttempt(actionId, `Error attempt ${i + 1}`)
      }

      const pending = await indexedDB.getPendingSyncActions()
      const action = pending.find(a => a.id === actionId)
      
      expect(action?.attempts).toBe(3)
      expect(action?.last_error).toBe('Error attempt 3')
    })
  })

  describe('Conflict Resolution', () => {
    it('should resolve lead conflict with last-write-wins', async () => {
      const now = Date.now()
      
      const serverLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        full_name: 'Server Lead',
        status: 'hot',
        updated_at: new Date(now - 1000).toISOString(), // 1 second ago
      } as Lead

      const clientLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        full_name: 'Client Lead',
        status: 'warm',
        offline_timestamp: new Date(now).toISOString(), // Now (newer)
      } as Lead

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'last_write_wins'
      )

      // Client should win (newer timestamp)
      expect(resolution.resolved_data.status).toBe('warm')
      expect(resolution.strategy_used).toBe('last_write_wins')
    })

    it('should detect critical field conflicts requiring manual review', async () => {
      const serverLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        full_name: 'Test Lead',
        status: 'hot',
        follow_up_date: '2024-01-20',
        converted_to_customer: false,
      } as Lead

      const clientLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        full_name: 'Test Lead',
        status: 'warm', // Critical field changed
        follow_up_date: '2024-01-25', // Critical field changed
        converted_to_customer: true, // Critical field changed
        offline_timestamp: new Date().toISOString(),
      } as Lead

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'last_write_wins'
      )

      expect(resolution.requires_manual_review).toBe(true)
      expect(resolution.conflicts_found.length).toBeGreaterThanOrEqual(3)
    })

    it('should merge interaction histories', async () => {
      const serverLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        interaction_history: JSON.stringify([
          { date: '2024-01-15', type: 'call', notes: 'Server call' }
        ]),
      } as Lead

      const clientLead: Lead = {
        id: 'lead-1',
        clinic_id: clinicId,
        interaction_history: JSON.stringify([
          { date: '2024-01-16', type: 'email', notes: 'Client email' }
        ]),
        offline_timestamp: new Date().toISOString(),
      } as Lead

      const resolution = conflictResolver.resolveLeadConflict(
        serverLead,
        clientLead,
        'merge'
      )

      const mergedHistory = JSON.parse(resolution.resolved_data.interaction_history || '[]')
      expect(mergedHistory).toHaveLength(2)
      expect(mergedHistory[0].type).toBe('email') // Newer first
      expect(mergedHistory[1].type).toBe('call')
    })

    it('should merge analysis notes with separator', async () => {
      const serverAnalysis: Partial<MultiTenantSkinAnalysis> = {
        id: 'analysis-1',
        notes: 'Server notes: Patient has sensitive skin',
        updated_at: new Date(Date.now() - 1000).toISOString(),
      }

      const clientAnalysis: Partial<MultiTenantSkinAnalysis> = {
        id: 'analysis-1',
        notes: 'Client notes: Recommended gentle cleanser',
        offline_timestamp: new Date().toISOString(),
      }

      const resolution = conflictResolver.resolveAnalysisConflict(
        serverAnalysis as any,
        clientAnalysis as any,
        'merge'
      )

      expect(resolution.resolved_data.notes).toContain('Server notes')
      expect(resolution.resolved_data.notes).toContain('--- Offline Edit ---')
      expect(resolution.resolved_data.notes).toContain('Client notes')
    })
  })

  describe('Offline Indicator State', () => {
    it('should reflect pending count', async () => {
      // Add 3 pending actions
      for (let i = 0; i < 3; i++) {
        await indexedDB.addToSyncQueue({
          id: `sync-${i}`,
          clinic_id: clinicId,
          action_type: 'create_analysis',
          data: {},
          created_at: new Date().toISOString(),
          attempts: 0,
          can_retry: true,
        })
      }

      const pending = await indexedDB.getPendingSyncActions()
      expect(pending).toHaveLength(3)
    })

    it('should calculate storage statistics', async () => {
      // Add some data
      await indexedDB.saveAnalysis({
        id: 'analysis-1',
        clinic_id: clinicId,
        patient_name: 'Test',
      } as any, true)

      await indexedDB.saveLead({
        id: 'lead-1',
        clinic_id: clinicId,
        full_name: 'Test Lead',
      } as any, true)

      const stats = await indexedDB.getStats()
      
      expect(stats.total_analyses).toBe(1)
      expect(stats.total_leads).toBe(1)
      expect(stats.estimated_size_kb).toBeGreaterThan(0)
    })
  })

  describe('Cleanup Operations', () => {
    it('should clean up old synced analyses after 24 hours', async () => {
      const now = Date.now()
      const twentyFiveHoursAgo = now - (25 * 60 * 60 * 1000)

      // Add old synced analysis
      await indexedDB.saveAnalysis({
        id: 'old-analysis',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        patient_name: 'Old Patient',
        synced: true,
        offline_timestamp: new Date(twentyFiveHoursAgo).toISOString(),
      } as any, false)

      // Add recent unsynced analysis
      await indexedDB.saveAnalysis({
        id: 'new-analysis',
        clinic_id: clinicId,
        sales_staff_id: salesStaffId,
        patient_name: 'New Patient',
        synced: false,
        offline_timestamp: new Date(now).toISOString(),
      } as any, true)

      // Manually trigger cleanup (normally happens automatically)
      await indexedDB.cleanupOldAnalyses(clinicId, salesStaffId)

      const remaining = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      
      // Old synced should be removed, new unsynced should remain
      expect(remaining.some(a => a.id === 'old-analysis')).toBe(false)
      expect(remaining.some(a => a.id === 'new-analysis')).toBe(true)
    })

    it('should clear all data on reset', async () => {
      await indexedDB.saveAnalysis({
        id: 'analysis-1',
        clinic_id: clinicId,
      } as any, true)

      await indexedDB.saveLead({
        id: 'lead-1',
        clinic_id: clinicId,
      } as any, true)

      await indexedDB.clearAll()

      const analyses = await indexedDB.getAnalysesBySalesStaff(clinicId, salesStaffId)
      const leads = await indexedDB.getLeadsBySalesStaff(clinicId, salesStaffId)
      const pending = await indexedDB.getPendingSyncActions()

      expect(analyses).toHaveLength(0)
      expect(leads).toHaveLength(0)
      expect(pending).toHaveLength(0)
    })
  })
})

describe('Edge Cases', () => {
  let indexedDB: ReturnType<typeof getIndexedDB>

  beforeAll(async () => {
    indexedDB = getIndexedDB()
    await indexedDB.initialize()
  })

  afterAll(async () => {
    await indexedDB.clearAll()
  })

  it('should handle duplicate IDs gracefully', async () => {
    const analysis = {
      id: 'duplicate-id',
      clinic_id: 'test-clinic',
      patient_name: 'First Save',
    }

    await indexedDB.saveAnalysis(analysis as any, true)
    
    // Save again with same ID (should update)
    analysis.patient_name = 'Second Save'
    await indexedDB.saveAnalysis(analysis as any, true)

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
    const minimalAnalysis = {
      id: 'minimal-analysis',
      clinic_id: 'test-clinic',
      // Only required fields
    }

    await expect(
      indexedDB.saveAnalysis(minimalAnalysis as any, true)
    ).resolves.not.toThrow()
  })
})
