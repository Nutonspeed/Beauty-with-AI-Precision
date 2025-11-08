/**
 * Branch Management React Hooks
 * 
 * Custom hooks for managing branches, staff, inventory, and resources
 */

import { useState, useEffect, useCallback } from "react"
import {
  BranchManager,
  type Branch,
  type StaffMember,
  type StaffTransfer,
  type InventoryItem,
  type InventoryTransaction,
  type StaffSchedule,
  type Resource,
  type BranchReport,
  type BranchStatus,
  type TransferStatus,
  type StaffRole,
  type InventoryStatus,
  type ResourceType,
} from "@/lib/branch/branch-manager"

// ============================================================================
// Hook: useBranches
// Get all branches with optional filters
// ============================================================================

export function useBranches(filters?: {
  status?: BranchStatus
  province?: string
  city?: string
}) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadBranches = useCallback(() => {
    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getAllBranches(filters)
      setBranches(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load branches"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  return {
    branches,
    loading,
    error,
    refresh: loadBranches,
  }
}

// ============================================================================
// Hook: useBranch
// Get single branch by ID
// ============================================================================

export function useBranch(branchId: string | undefined) {
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadBranch = useCallback(() => {
    if (!branchId) {
      setBranch(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getBranch(branchId)
      setBranch(data || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load branch"))
    } finally {
      setLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    loadBranch()
  }, [loadBranch])

  const updateBranch = useCallback(
    async (updates: Partial<Branch>) => {
      if (!branchId) return

      try {
        const manager = BranchManager.getInstance()
        const updated = manager.updateBranch(branchId, updates)
        setBranch(updated)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update branch"))
        throw err
      }
    },
    [branchId]
  )

  return {
    branch,
    loading,
    error,
    refresh: loadBranch,
    updateBranch,
  }
}

// ============================================================================
// Hook: useBranchStaff
// Get staff members for a branch
// ============================================================================

export function useBranchStaff(
  branchId: string | undefined,
  filters?: {
    role?: StaffRole
    isActive?: boolean
  }
) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadStaff = useCallback(() => {
    if (!branchId) {
      setStaff([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getBranchStaff(branchId, filters)
      setStaff(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load staff"))
    } finally {
      setLoading(false)
    }
  }, [branchId, filters])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const addStaff = useCallback(
    async (data: Omit<StaffMember, "id" | "createdAt" | "updatedAt" | "branchId">) => {
      if (!branchId) throw new Error("Branch ID required")

      try {
        const manager = BranchManager.getInstance()
        const newStaff = manager.addStaff({
          ...data,
          branchId,
        })
        setStaff(prev => [...prev, newStaff])
        setError(null)
        return newStaff
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add staff"))
        throw err
      }
    },
    [branchId]
  )

  const updateStaff = useCallback(async (staffId: string, updates: Partial<StaffMember>) => {
    try {
      const manager = BranchManager.getInstance()
      const updated = manager.updateStaff(staffId, updates)
      setStaff(prev => prev.map(s => (s.id === staffId ? updated : s)))
      setError(null)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update staff"))
      throw err
    }
  }, [])

  return {
    staff,
    loading,
    error,
    refresh: loadStaff,
    addStaff,
    updateStaff,
  }
}

// ============================================================================
// Hook: useStaffTransfers
// Manage staff transfers
// ============================================================================

export function useStaffTransfers(filters?: {
  branchId?: string
  staffId?: string
  status?: TransferStatus
}) {
  const [transfers, setTransfers] = useState<StaffTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTransfers = useCallback(() => {
    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getTransfers(filters)
      setTransfers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load transfers"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTransfers()
  }, [loadTransfers])

  const requestTransfer = useCallback(
    async (data: {
      staffId: string
      fromBranchId: string
      toBranchId: string
      requestedBy: string
      reason: string
      effectiveDate: Date
      notes?: string
    }) => {
      try {
        const manager = BranchManager.getInstance()
        const transfer = manager.requestTransfer(data)
        setTransfers(prev => [transfer, ...prev])
        setError(null)
        return transfer
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to request transfer"))
        throw err
      }
    },
    []
  )

  const approveTransfer = useCallback(async (transferId: string, approvedBy: string) => {
    try {
      const manager = BranchManager.getInstance()
      const updated = manager.approveTransfer(transferId, approvedBy)
      setTransfers(prev => prev.map(t => (t.id === transferId ? updated : t)))
      setError(null)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to approve transfer"))
      throw err
    }
  }, [])

  const rejectTransfer = useCallback(
    async (transferId: string, rejectedBy: string, reason?: string) => {
      try {
        const manager = BranchManager.getInstance()
        const updated = manager.rejectTransfer(transferId, rejectedBy, reason)
        setTransfers(prev => prev.map(t => (t.id === transferId ? updated : t)))
        setError(null)
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to reject transfer"))
        throw err
      }
    },
    []
  )

  const completeTransfer = useCallback(async (transferId: string) => {
    try {
      const manager = BranchManager.getInstance()
      const updated = manager.completeTransfer(transferId)
      setTransfers(prev => prev.map(t => (t.id === transferId ? updated : t)))
      setError(null)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to complete transfer"))
      throw err
    }
  }, [])

  return {
    transfers,
    loading,
    error,
    refresh: loadTransfers,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    completeTransfer,
  }
}

// ============================================================================
// Hook: useBranchInventory
// Manage branch inventory
// ============================================================================

export function useBranchInventory(
  branchId: string | undefined,
  filters?: {
    category?: string
    status?: InventoryStatus
  }
) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadInventory = useCallback(() => {
    if (!branchId) {
      setInventory([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getBranchInventory(branchId, filters)
      setInventory(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load inventory"))
    } finally {
      setLoading(false)
    }
  }, [branchId, filters])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const addItem = useCallback(
    async (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt" | "branchId" | "status">) => {
      if (!branchId) throw new Error("Branch ID required")

      try {
        const manager = BranchManager.getInstance()
        const newItem = manager.addInventoryItem({
          ...data,
          branchId,
          status: data.status || "in_stock",
        })
        setInventory(prev => [...prev, newItem])
        setError(null)
        return newItem
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add inventory item"))
        throw err
      }
    },
    [branchId]
  )

  const updateItem = useCallback(async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const manager = BranchManager.getInstance()
      const updated = manager.updateInventoryItem(itemId, updates)
      setInventory(prev => prev.map(i => (i.id === itemId ? updated : i)))
      setError(null)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update inventory item"))
      throw err
    }
  }, [])

  const recordTransaction = useCallback(
    async (data: {
      itemId: string
      type: "in" | "out" | "adjustment" | "return"
      quantity: number
      performedBy: string
      reference?: string
      notes?: string
    }) => {
      if (!branchId) throw new Error("Branch ID required")

      try {
        const manager = BranchManager.getInstance()
        const transaction = manager.recordInventoryTransaction({
          ...data,
          branchId,
        })
        loadInventory() // Refresh to show updated quantities
        setError(null)
        return transaction
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to record transaction"))
        throw err
      }
    },
    [branchId, loadInventory]
  )

  return {
    inventory,
    loading,
    error,
    refresh: loadInventory,
    addItem,
    updateItem,
    recordTransaction,
  }
}

// ============================================================================
// Hook: useInventoryTransfer
// Transfer inventory between branches
// ============================================================================

export function useInventoryTransfer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const transferInventory = useCallback(
    async (data: {
      itemId: string
      fromBranchId: string
      toBranchId: string
      quantity: number
      performedBy: string
      notes?: string
    }) => {
      try {
        setLoading(true)
        const manager = BranchManager.getInstance()
        const result = manager.transferInventory(data)
        setError(null)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to transfer inventory"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    transferInventory,
  }
}

// ============================================================================
// Hook: useInventoryTransactions
// Get inventory transaction history
// ============================================================================

export function useInventoryTransactions(branchId: string | undefined, limit = 50) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTransactions = useCallback(() => {
    if (!branchId) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getInventoryTransactions(branchId, limit)
      setTransactions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load transactions"))
    } finally {
      setLoading(false)
    }
  }, [branchId, limit])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    error,
    refresh: loadTransactions,
  }
}

// ============================================================================
// Hook: useBranchSchedule
// Get staff schedules for a branch
// ============================================================================

export function useBranchSchedule(branchId: string | undefined, date: Date) {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSchedule = useCallback(() => {
    if (!branchId) {
      setSchedules([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getBranchSchedule(branchId, date)
      setSchedules(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load schedule"))
    } finally {
      setLoading(false)
    }
  }, [branchId, date])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  const createSchedule = useCallback(
    async (data: Omit<StaffSchedule, "id" | "createdAt" | "updatedAt" | "branchId">) => {
      if (!branchId) throw new Error("Branch ID required")

      try {
        const manager = BranchManager.getInstance()
        const schedule = manager.createSchedule({
          ...data,
          branchId,
        })
        setSchedules(prev => [...prev, schedule])
        setError(null)
        return schedule
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to create schedule"))
        throw err
      }
    },
    [branchId]
  )

  return {
    schedules,
    loading,
    error,
    refresh: loadSchedule,
    createSchedule,
  }
}

// ============================================================================
// Hook: useBranchResources
// Manage branch resources
// ============================================================================

export function useBranchResources(
  branchId: string | undefined,
  filters?: {
    type?: ResourceType
    isAvailable?: boolean
    isActive?: boolean
  }
) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadResources = useCallback(() => {
    if (!branchId) {
      setResources([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.getBranchResources(branchId, filters)
      setResources(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load resources"))
    } finally {
      setLoading(false)
    }
  }, [branchId, filters])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const addResource = useCallback(
    async (data: Omit<Resource, "id" | "createdAt" | "updatedAt" | "branchId">) => {
      if (!branchId) throw new Error("Branch ID required")

      try {
        const manager = BranchManager.getInstance()
        const resource = manager.addResource({
          ...data,
          branchId,
        })
        setResources(prev => [...prev, resource])
        setError(null)
        return resource
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add resource"))
        throw err
      }
    },
    [branchId]
  )

  const updateResource = useCallback(async (resourceId: string, updates: Partial<Resource>) => {
    try {
      const manager = BranchManager.getInstance()
      const updated = manager.updateResource(resourceId, updates)
      setResources(prev => prev.map(r => (r.id === resourceId ? updated : r)))
      setError(null)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update resource"))
      throw err
    }
  }, [])

  return {
    resources,
    loading,
    error,
    refresh: loadResources,
    addResource,
    updateResource,
  }
}

// ============================================================================
// Hook: useBranchReport
// Generate branch performance report
// ============================================================================

export function useBranchReport(
  branchId: string | undefined,
  startDate: Date,
  endDate: Date
) {
  const [report, setReport] = useState<BranchReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const generateReport = useCallback(() => {
    if (!branchId) {
      setReport(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = manager.generateBranchReport(branchId, startDate, endDate)
      setReport(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate report"))
    } finally {
      setLoading(false)
    }
  }, [branchId, startDate, endDate])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  return {
    report,
    loading,
    error,
    refresh: generateReport,
  }
}

// ============================================================================
// Hook: useBranchComparison
// Compare metrics across multiple branches
// ============================================================================

export function useBranchComparison(branchIds: string[], startDate: Date, endDate: Date) {
  const [reports, setReports] = useState<BranchReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const generateReports = useCallback(() => {
    if (branchIds.length === 0) {
      setReports([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const manager = BranchManager.getInstance()
      const data = branchIds.map(id => manager.generateBranchReport(id, startDate, endDate))
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate reports"))
    } finally {
      setLoading(false)
    }
  }, [branchIds, startDate, endDate])

  useEffect(() => {
    generateReports()
  }, [generateReports])

  return {
    reports,
    loading,
    error,
    refresh: generateReports,
  }
}
