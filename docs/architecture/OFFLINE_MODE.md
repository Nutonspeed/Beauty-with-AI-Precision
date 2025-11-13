# Offline Mode Documentation

## Overview

The AI Beauty Clinic platform supports full offline functionality for 120+ sales staff across 4 clinics. Sales staff can continue working when internet connectivity is lost, and all data will automatically sync when connection is restored.

## Architecture

### Layered Offline-First Design

```
┌─────────────────────────────────────────────┐
│           Hook Layer (React)                │
│  useOffline: Optimistic updates, queries    │
├─────────────────────────────────────────────┤
│              UI Layer                        │
│  OfflineIndicator: Status, progress, sync   │
├─────────────────────────────────────────────┤
│           Cache Layer (Service Worker)      │
│  Cache-first: Images/Fonts                  │
│  Network-first: API calls                   │
│  Stale-while-revalidate: Pages              │
├─────────────────────────────────────────────┤
│           Sync Layer                         │
│  BackgroundSyncManager: Retry logic         │
│  Exponential backoff: 1s × 2^attempts       │
│  Max 5 retries, FIFO queue                  │
├─────────────────────────────────────────────┤
│       Conflict Resolution Layer              │
│  ConflictResolver: 3 strategies              │
│  - Last-write-wins (timestamp comparison)   │
│  - Merge (arrays, notes)                    │
│  - Manual (critical fields)                 │
├─────────────────────────────────────────────┤
│         Storage Layer (IndexedDB)           │
│  4 Object Stores: analyses, leads,          │
│  sync-queue, clinic-cache                   │
│  Clinic-scoped with compound indexes        │
└─────────────────────────────────────────────┘
```

## Components

### 1. IndexedDB Manager (`lib/db/indexed-db.ts`)

**Database:** `ai367bar-multi-clinic` v2

**Object Stores:**

#### analyses
- **Indexes:** `clinic_id`, `sales_staff_id`, `offline_timestamp`, `synced`, `clinic_sales` (compound: [clinic_id, sales_staff_id])
- **Storage Limit:** Max 50 analyses per sales staff
- **Cleanup:** Synced analyses older than 24 hours are removed automatically
- **Usage:** Store offline skin analysis results

#### leads
- **Indexes:** `clinic_id`, `sales_staff_id`, `status`, `synced`, `clinic_sales` (compound: [clinic_id, sales_staff_id])
- **Storage Limit:** Unlimited
- **Usage:** Store all leads for offline access and updates

#### sync-queue
- **Indexes:** `clinic_id`, `action_type`, `created_at`
- **Usage:** Queue pending sync actions (create, update, delete)
- **Retry Tracking:** Stores `attempts` count and `last_error` for each action

#### clinic-cache
- **Indexes:** `expires_at`
- **TTL:** Default 3600 seconds (1 hour)
- **Usage:** Cache clinic data (logo, name, settings) for offline access

### 2. Conflict Resolver (`lib/sync/conflict-resolver.ts`)

**Resolution Strategies:**

#### Last-Write-Wins
- Compares `serverTimestamp` (from `updated_at`) vs `clientTimestamp` (from `offline_timestamp`)
- Newest timestamp wins
- Used for: Simple field updates (name, email, phone, notes on analyses)

#### Merge Strategy
- **Interaction Histories:** Filters unique by `date + type`, sorts descending
- **Notes:** Concatenates with `"--- Offline Edit ---"` separator if different
- **Recommendations:** Merges as unique array using JSON comparison
- Used for: Arrays and text fields that should preserve all edits

#### Manual Resolution
- **Critical Lead Fields:** `status`, `follow_up_date`, `converted_to_customer`, `converted_at`
- **Threshold:** More than 3 conflicts found
- **Process:** Sets `requires_manual_review: true` flag and generates conflict report
- **User Action:** Sales staff must review and choose correct values

**Conflict Report Example:**
```typescript
{
  strategy_used: 'last_write_wins',
  conflicts_found: [
    {
      field: 'status',
      server_value: 'hot',
      client_value: 'warm',
      resolved_value: 'warm' // client timestamp is newer
    }
  ],
  requires_manual_review: true
}
```

### 3. Background Sync Manager (`lib/sync/background-sync.ts`)

**Auto-Sync Triggers:**
- Window `online` event (connection restored)
- Manual sync button click
- Service Worker `sync` event

**Queue Processing:**
- **Order:** FIFO (First In, First Out) sorted by `created_at` ascending
- **Retry Logic:** Exponential backoff with formula: `delay = 1000ms × 2^attempts`
  - Attempt 1: 1 second delay
  - Attempt 2: 2 seconds delay
  - Attempt 3: 4 seconds delay
  - Attempt 4: 8 seconds delay
  - Attempt 5: 16 seconds delay (last attempt)
- **Max Retries:** 5 attempts before permanent failure
- **Progress Tracking:** Real-time updates via subscriber pattern

**Sync Actions:**

| Action Type | HTTP Method | Endpoint | Conflict Resolution |
|------------|-------------|----------|---------------------|
| `create_analysis` | POST | `/api/analysis/create` | None (new record) |
| `update_analysis` | PATCH | `/api/analysis/{id}` | Yes (fetch → resolve → patch) |
| `create_lead` | POST | `/api/leads` | None (new record) |
| `update_lead` | PATCH | `/api/leads/{id}` | Yes (fetch → resolve → patch) |
| `delete_lead` | DELETE | `/api/leads/{id}` | None (tombstone) |

**Update Flow with Conflict Resolution:**
```typescript
1. Fetch current server data: GET /api/leads/{id}
2. Resolve conflicts: conflictResolver.resolveLeadConflict(serverLead, clientLead, 'last_write_wins')
3. Apply resolved data: PATCH /api/leads/{id} with resolved_data
4. Mark as synced: indexedDB.markLeadSynced(id)
5. Remove from queue: indexedDB.removeSyncAction(actionId)
```

### 4. Service Worker (`public/sw.js`) v2

**Cache Strategies:**

#### Cache-First (Images & Fonts)
- **Pattern:** `/\.(png|jpg|jpeg|svg|gif|webp|ico)$/` and font files
- **Flow:** Check cache → Return if found → Fetch and cache if miss
- **Use Case:** Static assets that rarely change, improves offline performance

#### Network-First (API Calls)
- **Pattern:** `/\/api\//`, `/\/auth\//`, `/supabase/`
- **Flow:** Fetch network → Cache response → Fallback to cache on failure
- **Fallback:** Returns `offline.html` for navigation requests or 503 JSON error
- **Use Case:** Dynamic data that should be fresh but available offline

#### Stale-While-Revalidate (Pages)
- **Pattern:** All other requests (HTML pages, CSS, JS)
- **Flow:** Return cached response immediately → Update cache in background
- **Use Case:** Perceived performance improvement, always shows something

**Background Sync Events:**
- `sync-all`: Processes all pending actions in queue
- `sync-create_analysis`: Syncs only create analysis actions
- `sync-update_lead`: Syncs only update lead actions
- Pattern: `sync-{action_type}` for typed sync

**Message Handlers:**
- `SKIP_WAITING`: Force activate new service worker
- `SYNC_NOW`: Trigger immediate sync without waiting for online event

### 5. Offline Indicator (`components/offline/offline-indicator.tsx`)

**Real-Time Status:**
- **Online:** Green border, Wifi icon
- **Offline:** Orange border, WifiOff icon
- **Syncing:** RefreshCw spinner animation

**Pending Count:**
- Polls IndexedDB every 5 seconds
- Shows badge with count of items in sync queue
- Hides component when online with no pending items

**Expandable View:**
- **Compact:** 80px width (icon + badge)
- **Detailed:** 320px width (click to expand)
  - Connection status dot
  - Pending items count
  - Last sync timestamp
  - Progress bar (completed/total × 100%)
  - Current action text
  - Manual "Sync Now" button

**User Feedback:**
- Shows alert on manual sync completion with `synced_count` and `failed_count`
- Progress bar updates in real-time during sync
- Last sync time in relative format (e.g., "2 minutes ago")

### 6. useOffline Hook (`hooks/useOffline.ts`)

**State Management:**
```typescript
{
  isOnline: boolean,        // From navigator.onLine
  pendingCount: number,     // From sync-queue count
  isSyncing: boolean,       // From sync progress subscription
  lastSyncTime: Date | null // From sync completion event
}
```

**Optimistic Updates:**

#### saveAnalysisOffline(analysis)
1. Add `clinic_id` and `sales_staff_id` from `useAuth` context
2. Save to IndexedDB with `isOfflineCreated = !isOnline`
3. If offline, queue for sync with `action_type: 'create_analysis'`
4. Return immediately (optimistic)

#### saveLeadOffline(lead)
Same pattern as `saveAnalysisOffline`

#### updateLeadOffline(leadId, updates)
1. Get current lead from IndexedDB
2. Apply updates (merge objects)
3. Save updated lead with `offline_timestamp`
4. Queue for sync with `action_type: 'update_lead'`

**Clinic-Scoped Queries:**

#### getOfflineAnalyses(limit = 50)
```typescript
// Uses compound index [clinic_id, sales_staff_id]
indexedDB.getAnalysesBySalesStaff(clinic_id, user.id, limit)
```

#### getOfflineLeads()
```typescript
// Uses compound index [clinic_id, sales_staff_id]
indexedDB.getLeadsBySalesStaff(clinic_id, user.id)
```

**Manual Actions:**
- `syncNow()`: Trigger immediate sync, returns Promise with results
- `clearOfflineData()`: Clear all IndexedDB data (for testing/reset)
- `getDBStats()`: Get storage statistics (total items, estimated size in KB)

**Computed Properties:**
- `hasOfflineData`: `pendingCount > 0`
- `needsSync`: `pendingCount > 0 && isOnline`

## Usage Examples

### 1. Save Analysis Offline

```typescript
"use client"
import { useOffline } from "@/hooks/useOffline"

function AnalysisForm() {
  const { saveAnalysisOffline, isOnline } = useOffline()
  
  const handleSave = async (analysisData) => {
    try {
      await saveAnalysisOffline({
        patient_name: analysisData.patientName,
        skin_conditions: analysisData.conditions,
        recommendations: analysisData.recommendations,
        image_url: analysisData.imageUrl
      })
      
      toast.success(
        isOnline 
          ? "Analysis saved successfully!" 
          : "Analysis saved offline. Will sync when online."
      )
    } catch (error) {
      toast.error("Failed to save analysis")
    }
  }
  
  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
    </form>
  )
}
```

### 2. Update Lead with Offline Support

```typescript
"use client"
import { useOffline } from "@/hooks/useOffline"

function LeadDetails({ leadId }) {
  const { updateLeadOffline, isOnline, needsSync } = useOffline()
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateLeadOffline(leadId, {
        status: newStatus,
        last_contact_at: new Date().toISOString()
      })
      
      toast.success("Status updated")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }
  
  return (
    <div>
      {needsSync && (
        <Alert>
          <AlertDescription>
            This lead has offline changes. Will sync when online.
          </AlertDescription>
        </Alert>
      )}
      
      <Select onValueChange={handleStatusChange}>
        <SelectItem value="hot">Hot</SelectItem>
        <SelectItem value="warm">Warm</SelectItem>
        <SelectItem value="cold">Cold</SelectItem>
      </Select>
    </div>
  )
}
```

### 3. Display Offline Data

```typescript
"use client"
import { useOffline } from "@/hooks/useOffline"
import { useEffect, useState } from "react"

function OfflineDataDashboard() {
  const { getOfflineAnalyses, getOfflineLeads, isOnline } = useOffline()
  const [analyses, setAnalyses] = useState([])
  const [leads, setLeads] = useState([])
  
  useEffect(() => {
    async function loadOfflineData() {
      if (!isOnline) {
        const offlineAnalyses = await getOfflineAnalyses(20)
        const offlineLeads = await getOfflineLeads()
        
        setAnalyses(offlineAnalyses)
        setLeads(offlineLeads)
      }
    }
    
    loadOfflineData()
  }, [isOnline])
  
  if (isOnline) {
    return <div>Loading fresh data...</div>
  }
  
  return (
    <div>
      <Alert>
        <AlertDescription>
          Showing offline cached data. {analyses.length} analyses and {leads.length} leads available.
        </AlertDescription>
      </Alert>
      
      {/* Render analyses and leads */}
    </div>
  )
}
```

### 4. Manual Sync with Progress

```typescript
"use client"
import { useOffline } from "@/hooks/useOffline"

function SyncButton() {
  const { syncNow, isOnline, isSyncing, pendingCount } = useOffline()
  
  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline")
      return
    }
    
    try {
      const result = await syncNow()
      toast.success(
        `Synced ${result.synced_count} items. ${result.failed_count} failed.`
      )
    } catch (error) {
      toast.error("Sync failed")
    }
  }
  
  return (
    <Button 
      onClick={handleSync} 
      disabled={!isOnline || isSyncing || pendingCount === 0}
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now ({pendingCount})
        </>
      )}
    </Button>
  )
}
```

## Testing Checklist

### Offline Functionality Tests

- [ ] **Create Analysis Offline**
  1. Disconnect network (Chrome DevTools → Network → Offline)
  2. Navigate to `/analysis` page
  3. Upload image and analyze skin
  4. Verify analysis saved to IndexedDB
  5. Check sync-queue has `create_analysis` action
  6. Reconnect network
  7. Verify auto-sync triggers
  8. Check analysis appears in database with correct `clinic_id` and `sales_staff_id`

- [ ] **Update Lead Offline**
  1. Disconnect network
  2. Navigate to `/sales/leads` page
  3. Change lead status from Hot to Warm
  4. Verify lead updated in IndexedDB with `offline_timestamp`
  5. Check sync-queue has `update_lead` action
  6. Reconnect network
  7. Verify sync with conflict resolution (if lead was edited by another user)
  8. Check final lead status in database

- [ ] **Multi-User Conflict Resolution**
  1. User A: Edit lead X offline, change status to "Hot"
  2. User B: Edit same lead X online, change status to "Warm"
  3. User A: Reconnect network, trigger sync
  4. Verify conflict resolver detects status conflict
  5. Check `requires_manual_review` flag is set
  6. Verify last-write-wins: User B's edit should win (online timestamp is newer)
  7. Admin: Review conflict report, approve or override

- [ ] **Storage Limit Enforcement**
  1. Create 60 analyses offline for same sales staff
  2. Verify only last 50 are kept in IndexedDB
  3. Sync 50 analyses online
  4. Wait 25 hours (or manually advance clock for testing)
  5. Create 1 new analysis
  6. Verify cleanup removes old synced analyses (keeping last 50 per staff)

- [ ] **Clinic Data Isolation**
  1. Sales staff A from Clinic 1: Create analysis offline
  2. Sales staff B from Clinic 2: Check IndexedDB
  3. Verify staff B cannot see staff A's analysis
  4. Query with compound index `[clinic_id, sales_staff_id]`
  5. Confirm data scoped to correct clinic

### Sync Retry Tests

- [ ] **Exponential Backoff**
  1. Create analysis offline
  2. Mock API endpoint to return 500 error
  3. Reconnect network, trigger sync
  4. Verify retry delays: 1s, 2s, 4s, 8s, 16s
  5. Check `attempts` count increments in sync-queue
  6. Verify action removed after 5 failed attempts

- [ ] **Partial Sync Success**
  1. Create 10 analyses offline
  2. Mock API: First 5 succeed, last 5 fail with 500 error
  3. Reconnect network, trigger sync
  4. Verify first 5 removed from queue, last 5 remain
  5. Check progress tracking: `completed: 5`, `failed: 5`

### UI/UX Tests

- [ ] **Offline Indicator**
  1. Disconnect network
  2. Verify OfflineIndicator appears with orange border, WifiOff icon
  3. Create 3 analyses offline
  4. Check pending count badge shows "3"
  5. Click indicator to expand detailed view
  6. Verify shows connection status, pending items, last sync time
  7. Reconnect network
  8. Check indicator turns green with Wifi icon
  9. Verify auto-sync triggers and progress bar animates
  10. After sync completes, indicator should hide (online + no pending)

- [ ] **Progress Tracking**
  1. Create 20 analyses offline
  2. Reconnect network
  3. Expand OfflineIndicator detailed view
  4. Watch progress bar: 0% → 5% → 10% → ... → 100%
  5. Check current action text updates: "Syncing create_analysis 1/20"
  6. Verify completion alert shows synced and failed counts

### Cache Strategy Tests

- [ ] **Cache-First (Images)**
  1. Navigate to page with images while online
  2. Disconnect network
  3. Reload page
  4. Verify images load from cache (no network requests)

- [ ] **Network-First (API)**
  1. Fetch leads online (cached)
  2. Server updates lead status
  3. Reload page while online
  4. Verify fresh data loaded (network-first)
  5. Disconnect network
  6. Reload page
  7. Verify cached leads displayed

- [ ] **Stale-While-Revalidate (Pages)**
  1. Navigate to `/sales/dashboard` while online
  2. Disconnect network
  3. Navigate away and back to `/sales/dashboard`
  4. Verify page loads instantly from cache
  5. Reconnect network (in background)
  6. Verify page updates without visible reload

### Performance Tests

- [ ] **Large Dataset Sync**
  1. Create 50 analyses offline
  2. Reconnect network
  3. Measure sync time (should complete in < 30 seconds for 50 items)
  4. Check memory usage (IndexedDB should release memory after sync)

- [ ] **Concurrent Users**
  1. Simulate 10 sales staff offline (10 browser tabs)
  2. Each creates 5 analyses
  3. Reconnect all tabs simultaneously
  4. Verify all 50 analyses sync without errors
  5. Check for race conditions in conflict resolution

## Troubleshooting

### Common Issues

#### 1. "Sync stuck at 50%"
**Cause:** API endpoint returning 500 errors
**Solution:**
1. Open browser DevTools → Console
2. Check for red error messages from `syncAction()`
3. Verify API endpoint is accessible: `curl -X GET https://your-domain.com/api/leads`
4. Check server logs for errors
5. If needed, clear sync queue: `useOffline().clearOfflineData()`

#### 2. "Conflict resolution always requires manual review"
**Cause:** Too many fields changed offline vs online
**Solution:**
1. Reduce number of editable fields in offline mode
2. Or adjust `requiresManualResolution()` threshold in `conflict-resolver.ts`:
   ```typescript
   // Change from 3 to 5
   return conflicts_found.length > 5 || resolution.requires_manual_review
   ```

#### 3. "Storage quota exceeded"
**Cause:** IndexedDB quota exceeded (typically 50MB - 1GB depending on browser)
**Solution:**
1. Check storage usage: `useOffline().getDBStats()`
2. Manually trigger cleanup: `indexedDB.cleanupOldAnalyses()`
3. Reduce max analyses per staff from 50 to 30 in `indexed-db.ts`:
   ```typescript
   const MAX_ANALYSES_PER_STAFF = 30 // Changed from 50
   ```

#### 4. "Service worker not updating"
**Cause:** Browser caching old service worker
**Solution:**
1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Click "Unregister"
4. Reload page
5. Verify new SW version installed: Check for "v2" in SW file

#### 5. "Data not syncing after reconnection"
**Cause:** Online event listener not firing
**Solution:**
1. Manually trigger sync: Click "Sync Now" in OfflineIndicator
2. Check browser console for errors
3. Verify `window.addEventListener('online')` is registered:
   ```javascript
   console.log(window.ononline) // Should not be null
   ```
4. As last resort, reload page

## Best Practices

### For Sales Staff

1. **Check Offline Indicator:** Always glance at bottom-right corner to verify online/offline status before critical operations
2. **Wait for Sync:** After reconnecting, wait for green "✓ Synced" indicator before closing browser
3. **Manual Sync:** If auto-sync doesn't trigger, click "Sync Now" button in expanded view
4. **Avoid Conflicts:** Don't edit same lead on multiple devices offline simultaneously
5. **Storage Limits:** System keeps last 50 analyses per staff; older ones are auto-cleaned after sync

### For Developers

1. **Always Use useOffline Hook:** Don't directly call IndexedDB or fetch APIs for analyses/leads
2. **Clinic-Scoped Queries:** Always filter by `clinic_id` and `sales_staff_id` compound index
3. **Optimistic Updates:** Show success message immediately, don't wait for sync
4. **Error Boundaries:** Wrap offline operations in try-catch, show user-friendly errors
5. **Test Offline:** Always test features with network disabled in Chrome DevTools
6. **Monitor Sync Queue:** Log `pendingCount` to catch stuck syncs early

### For Admins

1. **Monitor Storage:** Regularly check IndexedDB size across clinics
2. **Review Conflicts:** Set up alert for `requires_manual_review: true` flags
3. **Adjust Limits:** Tune `MAX_ANALYSES_PER_STAFF` based on storage usage patterns
4. **Cache Invalidation:** Update SW version number when changing cache strategies
5. **Backup Strategy:** IndexedDB is client-side only; ensure server backups are running

## API Integration

All offline operations must follow this pattern:

### CREATE Operations
```typescript
// POST /api/analysis/create
{
  clinic_id: string,       // From session/auth
  sales_staff_id: string,  // From session/auth
  patient_name: string,
  skin_conditions: string[],
  recommendations: string[],
  image_url: string,
  offline_created: boolean // Flag to track offline origin
}
```

### UPDATE Operations
```typescript
// PATCH /api/leads/{id}
{
  ...updates,
  offline_timestamp: string, // ISO timestamp when offline edit was made
  conflict_resolution: {     // Optional, from conflict resolver
    strategy: 'last_write_wins' | 'merge' | 'manual',
    conflicts_found: ConflictDetail[],
    requires_manual_review: boolean
  }
}
```

### DELETE Operations
```typescript
// DELETE /api/leads/{id}
// No body, but server should:
// 1. Soft delete (set deleted_at timestamp)
// 2. Return 200 OK if already deleted (idempotent)
// 3. Return 404 if never existed
```

## Metrics & Monitoring

Track these metrics for offline mode health:

1. **Sync Success Rate:** `(successful_syncs / total_sync_attempts) × 100`
2. **Average Sync Time:** Time from reconnection to sync completion
3. **Conflict Rate:** `(manual_review_required / total_updates) × 100`
4. **Storage Usage:** IndexedDB size per clinic and per sales staff
5. **Queue Depth:** Number of pending actions in sync-queue
6. **Retry Count:** How many actions required > 1 attempt

**Alerting Thresholds:**
- Sync Success Rate < 95% → Investigate API errors
- Average Sync Time > 60 seconds → Check API performance
- Conflict Rate > 10% → Review user workflows
- Storage Usage > 80% quota → Trigger cleanup
- Queue Depth > 100 items → Alert sales staff to sync
- Retry Count > 20% → Check network stability

## Future Enhancements

1. **Differential Sync:** Only sync changed fields, not entire objects
2. **Binary Diff for Images:** Store image diffs instead of full images
3. **Compression:** Gzip IndexedDB data to save storage
4. **Smart Prefetch:** Predict which leads user will access offline, pre-cache
5. **Collaborative Editing:** Real-time conflict prevention with operational transforms
6. **Voice Sync Status:** Announce sync completion via text-to-speech for hands-free users

---

## Quick Reference

### Singleton Getters
```typescript
import { getIndexedDB } from '@/lib/db/indexed-db'
import { getConflictResolver } from '@/lib/sync/conflict-resolver'
import { getBackgroundSyncManager } from '@/lib/sync/background-sync'
```

### React Hook
```typescript
import { useOffline } from '@/hooks/useOffline'

const {
  isOnline,
  pendingCount,
  isSyncing,
  lastSyncTime,
  saveAnalysisOffline,
  saveLeadOffline,
  updateLeadOffline,
  getOfflineAnalyses,
  getOfflineLeads,
  syncNow,
  clearOfflineData,
  getDBStats,
  hasOfflineData,
  needsSync
} = useOffline()
```

### UI Component
```tsx
import { OfflineIndicator } from '@/components/offline/offline-indicator'

// Add to layout
<OfflineIndicator />
```

### Manual Testing Commands
```javascript
// In browser console

// Check online status
console.log(navigator.onLine)

// Get IndexedDB manager
const db = await import('/lib/db/indexed-db.ts').then(m => m.getIndexedDB())

// View statistics
console.log(await db.getStats())

// Get pending sync actions
console.log(await db.getPendingSyncActions())

// Clear all data
await db.clearAll()

// Force sync
const syncManager = await import('/lib/sync/background-sync.ts').then(m => m.getBackgroundSyncManager())
const result = await syncManager.syncAll()
console.log(result)
```

---

**Last Updated:** 2024-01-20  
**Version:** 2.0 (Multi-Clinic Offline Mode)  
**Contact:** Development Team
