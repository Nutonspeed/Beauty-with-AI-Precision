/**
 * Branch Management System
 * 
 * Comprehensive multi-branch clinic management with staff transfers,
 * inventory tracking, scheduling, and resource allocation.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type BranchStatus = "active" | "inactive" | "maintenance" | "closed"
export type TransferStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled"
export type StaffRole = "doctor" | "nurse" | "receptionist" | "manager" | "technician" | "pharmacist"
export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued"
export type ShiftType = "morning" | "afternoon" | "evening" | "night" | "full_day"
export type ResourceType = "equipment" | "room" | "vehicle" | "tool" | "other"

export interface Branch {
  id: string
  name: string
  code: string // Unique branch code (e.g., "BKK001")
  status: BranchStatus
  
  // Location
  address: {
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
  
  // Contact
  phone: string
  email: string
  website?: string
  
  // Operations
  operatingHours: {
    [day: string]: { open: string; close: string; closed?: boolean }
  }
  timezone: string
  
  // Settings
  settings: {
    allowOnlineBooking: boolean
    maxAppointmentsPerDay: number
    advanceBookingDays: number
    cancellationPolicy: string
    languages: string[]
  }
  
  // Metadata
  managerId?: string
  staffCount: number
  roomCount: number
  capacity: number
  
  openedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface StaffMember {
  id: string
  userId: string
  branchId: string
  
  // Personal info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Employment
  role: StaffRole
  employeeId: string
  department?: string
  specialization?: string
  
  // Status
  isActive: boolean
  startDate: Date
  endDate?: Date
  
  // Schedule
  workingDays: string[] // ["monday", "tuesday", ...]
  defaultShift: ShiftType
  
  createdAt: Date
  updatedAt: Date
}

export interface StaffTransfer {
  id: string
  staffId: string
  
  // Transfer details
  fromBranchId: string
  toBranchId: string
  requestedBy: string
  approvedBy?: string
  
  // Status
  status: TransferStatus
  reason: string
  notes?: string
  
  // Dates
  requestedDate: Date
  effectiveDate: Date
  approvedDate?: Date
  completedDate?: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  branchId: string
  
  // Product info
  productId: string
  productName: string
  productCode: string
  category: string
  
  // Stock
  quantity: number
  minQuantity: number
  maxQuantity: number
  status: InventoryStatus
  
  // Details
  unit: string
  cost: number
  price: number
  supplier?: string
  
  // Tracking
  lastRestocked?: Date
  expiryDate?: Date
  batchNumber?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface InventoryTransaction {
  id: string
  branchId: string
  itemId: string
  
  type: "in" | "out" | "transfer" | "adjustment" | "return"
  quantity: number
  
  // Transfer details (if applicable)
  fromBranchId?: string
  toBranchId?: string
  
  // Reference
  reference?: string // Order ID, Transfer ID, etc.
  notes?: string
  performedBy: string
  
  createdAt: Date
}

export interface StaffSchedule {
  id: string
  staffId: string
  branchId: string
  
  date: Date
  shiftType: ShiftType
  startTime: string
  endTime: string
  
  isOvertime: boolean
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface Resource {
  id: string
  branchId: string
  
  name: string
  type: ResourceType
  code: string
  
  description?: string
  capacity?: number
  
  isAvailable: boolean
  isActive: boolean
  
  // Maintenance
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  maintenanceNotes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface BranchReport {
  branchId: string
  period: {
    start: Date
    end: Date
  }
  
  metrics: {
    // Staff
    totalStaff: number
    activeStaff: number
    transfersIn: number
    transfersOut: number
    
    // Appointments
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    
    // Revenue
    totalRevenue: number
    averageTicketSize: number
    
    // Inventory
    totalInventoryValue: number
    lowStockItems: number
    outOfStockItems: number
    
    // Utilization
    roomUtilization: number
    staffUtilization: number
  }
  
  generatedAt: Date
}

// ============================================================================
// Branch Manager Class
// ============================================================================

export class BranchManager {
  private static instance: BranchManager
  
  private branches: Map<string, Branch> = new Map()
  private staff: Map<string, StaffMember[]> = new Map() // branchId -> staff[]
  private transfers: Map<string, StaffTransfer> = new Map()
  private inventory: Map<string, InventoryItem[]> = new Map() // branchId -> items[]
  private transactions: Map<string, InventoryTransaction[]> = new Map() // branchId -> transactions[]
  private schedules: Map<string, StaffSchedule[]> = new Map() // staffId -> schedules[]
  private resources: Map<string, Resource[]> = new Map() // branchId -> resources[]
  
  private constructor() {
    this.initializeSampleData()
  }
  
  public static getInstance(): BranchManager {
    if (!BranchManager.instance) {
      BranchManager.instance = new BranchManager()
    }
    return BranchManager.instance
  }
  
  // ========================================================================
  // Branch Management
  // ========================================================================
  
  createBranch(data: Omit<Branch, "id" | "createdAt" | "updatedAt">): Branch {
    const branch: Branch = {
      ...data,
      id: this.generateId("BRANCH"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.branches.set(branch.id, branch)
    this.staff.set(branch.id, [])
    this.inventory.set(branch.id, [])
    this.transactions.set(branch.id, [])
    this.resources.set(branch.id, [])
    
    return branch
  }
  
  getBranch(branchId: string): Branch | undefined {
    return this.branches.get(branchId)
  }
  
  getAllBranches(filters?: {
    status?: BranchStatus
    province?: string
    city?: string
  }): Branch[] {
    let branches = Array.from(this.branches.values())
    
    if (filters?.status) {
      branches = branches.filter(b => b.status === filters.status)
    }
    
    if (filters?.province) {
      branches = branches.filter(b => b.address.province === filters.province)
    }
    
    if (filters?.city) {
      branches = branches.filter(b => b.address.city === filters.city)
    }
    
    return branches.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  updateBranch(branchId: string, updates: Partial<Branch>): Branch {
    const branch = this.getBranch(branchId)
    if (!branch) throw new Error("Branch not found")
    
    const updated = {
      ...branch,
      ...updates,
      id: branch.id,
      updatedAt: new Date(),
    }
    
    this.branches.set(branchId, updated)
    return updated
  }
  
  deleteBranch(branchId: string): void {
    // Check if branch has staff
    const branchStaff = this.staff.get(branchId) || []
    if (branchStaff.length > 0) {
      throw new Error("Cannot delete branch with active staff")
    }
    
    this.branches.delete(branchId)
    this.staff.delete(branchId)
    this.inventory.delete(branchId)
    this.transactions.delete(branchId)
    this.resources.delete(branchId)
  }
  
  // ========================================================================
  // Staff Management
  // ========================================================================
  
  addStaff(data: Omit<StaffMember, "id" | "createdAt" | "updatedAt">): StaffMember {
    const staff: StaffMember = {
      ...data,
      id: this.generateId("STAFF"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const branchStaff = this.staff.get(data.branchId) || []
    branchStaff.push(staff)
    this.staff.set(data.branchId, branchStaff)
    
    // Update branch staff count
    const branch = this.getBranch(data.branchId)
    if (branch) {
      this.updateBranch(data.branchId, {
        staffCount: branchStaff.length,
      })
    }
    
    return staff
  }
  
  getStaffMember(staffId: string): StaffMember | undefined {
    for (const branchStaff of this.staff.values()) {
      const staff = branchStaff.find(s => s.id === staffId)
      if (staff) return staff
    }
    return undefined
  }
  
  getBranchStaff(branchId: string, filters?: {
    role?: StaffRole
    isActive?: boolean
  }): StaffMember[] {
    let staff = this.staff.get(branchId) || []
    
    if (filters?.role) {
      staff = staff.filter(s => s.role === filters.role)
    }
    
    if (filters?.isActive !== undefined) {
      staff = staff.filter(s => s.isActive === filters.isActive)
    }
    
    return staff
  }
  
  updateStaff(staffId: string, updates: Partial<StaffMember>): StaffMember {
    const staff = this.getStaffMember(staffId)
    if (!staff) throw new Error("Staff member not found")
    
    const updated = {
      ...staff,
      ...updates,
      id: staff.id,
      updatedAt: new Date(),
    }
    
    // Update in the correct branch's staff list
    const branchStaff = this.staff.get(staff.branchId) || []
    const index = branchStaff.findIndex(s => s.id === staffId)
    if (index !== -1) {
      branchStaff[index] = updated
      this.staff.set(staff.branchId, branchStaff)
    }
    
    return updated
  }
  
  // ========================================================================
  // Staff Transfer Management
  // ========================================================================
  
  requestTransfer(data: {
    staffId: string
    fromBranchId: string
    toBranchId: string
    requestedBy: string
    reason: string
    effectiveDate: Date
    notes?: string
  }): StaffTransfer {
    const staff = this.getStaffMember(data.staffId)
    if (!staff) throw new Error("Staff member not found")
    if (staff.branchId !== data.fromBranchId) {
      throw new Error("Staff member is not at the specified branch")
    }
    
    const transfer: StaffTransfer = {
      id: this.generateId("TRANSFER"),
      staffId: data.staffId,
      fromBranchId: data.fromBranchId,
      toBranchId: data.toBranchId,
      requestedBy: data.requestedBy,
      status: "pending",
      reason: data.reason,
      notes: data.notes,
      requestedDate: new Date(),
      effectiveDate: data.effectiveDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.transfers.set(transfer.id, transfer)
    return transfer
  }
  
  approveTransfer(transferId: string, approvedBy: string): StaffTransfer {
    const transfer = this.transfers.get(transferId)
    if (!transfer) throw new Error("Transfer not found")
    if (transfer.status !== "pending") {
      throw new Error("Transfer is not pending")
    }
    
    transfer.status = "approved"
    transfer.approvedBy = approvedBy
    transfer.approvedDate = new Date()
    transfer.updatedAt = new Date()
    
    this.transfers.set(transferId, transfer)
    return transfer
  }
  
  rejectTransfer(transferId: string, rejectedBy: string, reason?: string): StaffTransfer {
    const transfer = this.transfers.get(transferId)
    if (!transfer) throw new Error("Transfer not found")
    if (transfer.status !== "pending") {
      throw new Error("Transfer is not pending")
    }
    
    transfer.status = "rejected"
    transfer.approvedBy = rejectedBy
    transfer.notes = reason || transfer.notes
    transfer.approvedDate = new Date()
    transfer.updatedAt = new Date()
    
    this.transfers.set(transferId, transfer)
    return transfer
  }
  
  completeTransfer(transferId: string): StaffTransfer {
    const transfer = this.transfers.get(transferId)
    if (!transfer) throw new Error("Transfer not found")
    if (transfer.status !== "approved") {
      throw new Error("Transfer is not approved")
    }
    
    const staff = this.getStaffMember(transfer.staffId)
    if (!staff) throw new Error("Staff member not found")
    
    // Remove from old branch
    const fromStaff = this.staff.get(transfer.fromBranchId) || []
    const filteredStaff = fromStaff.filter(s => s.id !== transfer.staffId)
    this.staff.set(transfer.fromBranchId, filteredStaff)
    
    // Add to new branch
    staff.branchId = transfer.toBranchId
    staff.updatedAt = new Date()
    const toStaff = this.staff.get(transfer.toBranchId) || []
    toStaff.push(staff)
    this.staff.set(transfer.toBranchId, toStaff)
    
    // Update branch staff counts
    const fromBranch = this.getBranch(transfer.fromBranchId)
    if (fromBranch) {
      this.updateBranch(transfer.fromBranchId, {
        staffCount: filteredStaff.length,
      })
    }
    
    const toBranch = this.getBranch(transfer.toBranchId)
    if (toBranch) {
      this.updateBranch(transfer.toBranchId, {
        staffCount: toStaff.length,
      })
    }
    
    // Update transfer status
    transfer.status = "completed"
    transfer.completedDate = new Date()
    transfer.updatedAt = new Date()
    this.transfers.set(transferId, transfer)
    
    return transfer
  }
  
  getTransfers(filters?: {
    branchId?: string
    staffId?: string
    status?: TransferStatus
  }): StaffTransfer[] {
    let transfers = Array.from(this.transfers.values())
    
    if (filters?.branchId) {
      transfers = transfers.filter(
        t => t.fromBranchId === filters.branchId || t.toBranchId === filters.branchId
      )
    }
    
    if (filters?.staffId) {
      transfers = transfers.filter(t => t.staffId === filters.staffId)
    }
    
    if (filters?.status) {
      transfers = transfers.filter(t => t.status === filters.status)
    }
    
    return transfers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  // ========================================================================
  // Inventory Management
  // ========================================================================
  
  addInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
    const item: InventoryItem = {
      ...data,
      id: this.generateId("ITEM"),
      status: this.calculateInventoryStatus(data.quantity, data.minQuantity),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const branchInventory = this.inventory.get(data.branchId) || []
    branchInventory.push(item)
    this.inventory.set(data.branchId, branchInventory)
    
    return item
  }
  
  getBranchInventory(branchId: string, filters?: {
    category?: string
    status?: InventoryStatus
  }): InventoryItem[] {
    let items = this.inventory.get(branchId) || []
    
    if (filters?.category) {
      items = items.filter(i => i.category === filters.category)
    }
    
    if (filters?.status) {
      items = items.filter(i => i.status === filters.status)
    }
    
    return items
  }
  
  updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): InventoryItem {
    let found: InventoryItem | undefined
    let branchId: string | undefined
    
    for (const [bid, items] of this.inventory.entries()) {
      const item = items.find(i => i.id === itemId)
      if (item) {
        found = item
        branchId = bid
        break
      }
    }
    
    if (!found || !branchId) throw new Error("Inventory item not found")
    
    const updated = {
      ...found,
      ...updates,
      id: found.id,
      status: this.calculateInventoryStatus(
        updates.quantity ?? found.quantity,
        updates.minQuantity ?? found.minQuantity
      ),
      updatedAt: new Date(),
    }
    
    const branchInventory = this.inventory.get(branchId) || []
    const index = branchInventory.findIndex(i => i.id === itemId)
    if (index !== -1) {
      branchInventory[index] = updated
      this.inventory.set(branchId, branchInventory)
    }
    
    return updated
  }
  
  recordInventoryTransaction(data: Omit<InventoryTransaction, "id" | "createdAt">): InventoryTransaction {
    const transaction: InventoryTransaction = {
      ...data,
      id: this.generateId("TRANS"),
      createdAt: new Date(),
    }
    
    const branchTransactions = this.transactions.get(data.branchId) || []
    branchTransactions.push(transaction)
    this.transactions.set(data.branchId, branchTransactions)
    
    // Update inventory quantity
    const branchInventory = this.inventory.get(data.branchId) || []
    const item = branchInventory.find(i => i.id === data.itemId)
    
    if (item) {
      const quantityChange = data.type === "in" || data.type === "return" 
        ? data.quantity 
        : -data.quantity
      
      this.updateInventoryItem(data.itemId, {
        quantity: item.quantity + quantityChange,
      })
    }
    
    return transaction
  }
  
  transferInventory(data: {
    itemId: string
    fromBranchId: string
    toBranchId: string
    quantity: number
    performedBy: string
    notes?: string
  }): { outTransaction: InventoryTransaction; inTransaction: InventoryTransaction } {
    // Record outbound transaction
    const outTransaction = this.recordInventoryTransaction({
      branchId: data.fromBranchId,
      itemId: data.itemId,
      type: "transfer",
      quantity: data.quantity,
      toBranchId: data.toBranchId,
      performedBy: data.performedBy,
      notes: data.notes,
    })
    
    // Find or create item at destination branch
    const toBranchInventory = this.inventory.get(data.toBranchId) || []
    const fromBranchInventory = this.inventory.get(data.fromBranchId) || []
    const sourceItem = fromBranchInventory.find(i => i.id === data.itemId)
    
    if (!sourceItem) throw new Error("Source item not found")
    
    let destItem = toBranchInventory.find(i => i.productId === sourceItem.productId)
    
    if (!destItem) {
      // Create item at destination branch
      destItem = this.addInventoryItem({
        branchId: data.toBranchId,
        productId: sourceItem.productId,
        productName: sourceItem.productName,
        productCode: sourceItem.productCode,
        category: sourceItem.category,
        quantity: 0,
        minQuantity: sourceItem.minQuantity,
        maxQuantity: sourceItem.maxQuantity,
        unit: sourceItem.unit,
        cost: sourceItem.cost,
        price: sourceItem.price,
        supplier: sourceItem.supplier,
        status: "in_stock",
      })
    }
    
    // Record inbound transaction
    const inTransaction = this.recordInventoryTransaction({
      branchId: data.toBranchId,
      itemId: destItem.id,
      type: "transfer",
      quantity: data.quantity,
      fromBranchId: data.fromBranchId,
      performedBy: data.performedBy,
      notes: data.notes,
      reference: outTransaction.id,
    })
    
    return { outTransaction, inTransaction }
  }
  
  getInventoryTransactions(branchId: string, limit = 50): InventoryTransaction[] {
    const transactions = this.transactions.get(branchId) || []
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }
  
  // ========================================================================
  // Staff Scheduling
  // ========================================================================
  
  createSchedule(data: Omit<StaffSchedule, "id" | "createdAt" | "updatedAt">): StaffSchedule {
    const schedule: StaffSchedule = {
      ...data,
      id: this.generateId("SCHEDULE"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const staffSchedules = this.schedules.get(data.staffId) || []
    staffSchedules.push(schedule)
    this.schedules.set(data.staffId, staffSchedules)
    
    return schedule
  }
  
  getStaffSchedule(staffId: string, startDate?: Date, endDate?: Date): StaffSchedule[] {
    let schedules = this.schedules.get(staffId) || []
    
    if (startDate) {
      schedules = schedules.filter(s => s.date >= startDate)
    }
    
    if (endDate) {
      schedules = schedules.filter(s => s.date <= endDate)
    }
    
    return schedules.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
  
  getBranchSchedule(branchId: string, date: Date): StaffSchedule[] {
    const branchStaff = this.getBranchStaff(branchId)
    const schedules: StaffSchedule[] = []
    
    for (const staff of branchStaff) {
      const staffSchedules = this.getStaffSchedule(staff.id)
      const daySchedule = staffSchedules.filter(
        s => s.date.toDateString() === date.toDateString()
      )
      schedules.push(...daySchedule)
    }
    
    return schedules
  }
  
  // ========================================================================
  // Resource Management
  // ========================================================================
  
  addResource(data: Omit<Resource, "id" | "createdAt" | "updatedAt">): Resource {
    const resource: Resource = {
      ...data,
      id: this.generateId("RESOURCE"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const branchResources = this.resources.get(data.branchId) || []
    branchResources.push(resource)
    this.resources.set(data.branchId, branchResources)
    
    return resource
  }
  
  getBranchResources(branchId: string, filters?: {
    type?: ResourceType
    isAvailable?: boolean
    isActive?: boolean
  }): Resource[] {
    let resources = this.resources.get(branchId) || []
    
    if (filters?.type) {
      resources = resources.filter(r => r.type === filters.type)
    }
    
    if (filters?.isAvailable !== undefined) {
      resources = resources.filter(r => r.isAvailable === filters.isAvailable)
    }
    
    if (filters?.isActive !== undefined) {
      resources = resources.filter(r => r.isActive === filters.isActive)
    }
    
    return resources
  }
  
  updateResource(resourceId: string, updates: Partial<Resource>): Resource {
    let found: Resource | undefined
    let branchId: string | undefined
    
    for (const [bid, resources] of this.resources.entries()) {
      const resource = resources.find(r => r.id === resourceId)
      if (resource) {
        found = resource
        branchId = bid
        break
      }
    }
    
    if (!found || !branchId) throw new Error("Resource not found")
    
    const updated = {
      ...found,
      ...updates,
      id: found.id,
      updatedAt: new Date(),
    }
    
    const branchResources = this.resources.get(branchId) || []
    const index = branchResources.findIndex(r => r.id === resourceId)
    if (index !== -1) {
      branchResources[index] = updated
      this.resources.set(branchId, branchResources)
    }
    
    return updated
  }
  
  // ========================================================================
  // Reporting
  // ========================================================================
  
  generateBranchReport(branchId: string, startDate: Date, endDate: Date): BranchReport {
    const branch = this.getBranch(branchId)
    if (!branch) throw new Error("Branch not found")
    
    const staff = this.getBranchStaff(branchId)
    const activeStaff = staff.filter(s => s.isActive)
    const inventory = this.getBranchInventory(branchId)
    
    const transfers = this.getTransfers({ branchId })
    const transfersIn = transfers.filter(t => t.toBranchId === branchId && t.status === "completed")
    const transfersOut = transfers.filter(t => t.fromBranchId === branchId && t.status === "completed")
    
    const lowStock = inventory.filter(i => i.status === "low_stock")
    const outOfStock = inventory.filter(i => i.status === "out_of_stock")
    const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.quantity * i.cost), 0)
    
    return {
      branchId,
      period: { start: startDate, end: endDate },
      metrics: {
        totalStaff: staff.length,
        activeStaff: activeStaff.length,
        transfersIn: transfersIn.length,
        transfersOut: transfersOut.length,
        totalAppointments: 0, // Would integrate with appointment system
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: 0,
        averageTicketSize: 0,
        totalInventoryValue,
        lowStockItems: lowStock.length,
        outOfStockItems: outOfStock.length,
        roomUtilization: 0,
        staffUtilization: 0,
      },
      generatedAt: new Date(),
    }
  }
  
  // ========================================================================
  // Helper Methods
  // ========================================================================
  
  private calculateInventoryStatus(quantity: number, minQuantity: number): InventoryStatus {
    if (quantity === 0) return "out_of_stock"
    if (quantity <= minQuantity) return "low_stock"
    return "in_stock"
  }
  
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 9)
    return `${prefix}-${timestamp}-${random}`.toUpperCase()
  }
  
  // ========================================================================
  // Sample Data Initialization
  // ========================================================================
  
  private initializeSampleData(): void {
    // Create sample branches
    const bangkok = this.createBranch({
      name: "Bangkok Central Clinic",
      code: "BKK001",
      status: "active",
      address: {
        street: "123 Sukhumvit Road",
        city: "Bangkok",
        province: "Bangkok",
        postalCode: "10110",
        country: "Thailand",
      },
      coordinates: {
        latitude: 13.7563,
        longitude: 100.5018,
      },
      phone: "+66-2-123-4567",
      email: "bangkok@clinic.com",
      website: "https://clinic.com/bangkok",
      operatingHours: {
        monday: { open: "08:00", close: "20:00" },
        tuesday: { open: "08:00", close: "20:00" },
        wednesday: { open: "08:00", close: "20:00" },
        thursday: { open: "08:00", close: "20:00" },
        friday: { open: "08:00", close: "20:00" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { open: "09:00", close: "18:00" },
      },
      timezone: "Asia/Bangkok",
      settings: {
        allowOnlineBooking: true,
        maxAppointmentsPerDay: 50,
        advanceBookingDays: 30,
        cancellationPolicy: "Cancel up to 24 hours before appointment",
        languages: ["th", "en"],
      },
      staffCount: 0,
      roomCount: 8,
      capacity: 50,
      openedAt: new Date("2020-01-01"),
    })
    
    // Create Chiang Mai branch
    this.createBranch({
      name: "Chiang Mai Branch",
      code: "CNX001",
      status: "active",
      address: {
        street: "456 Nimmanhaemin Road",
        city: "Chiang Mai",
        province: "Chiang Mai",
        postalCode: "50200",
        country: "Thailand",
      },
      coordinates: {
        latitude: 18.7883,
        longitude: 98.9853,
      },
      phone: "+66-53-123-4567",
      email: "chiangmai@clinic.com",
      operatingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "09:00", close: "17:00", closed: false },
      },
      timezone: "Asia/Bangkok",
      settings: {
        allowOnlineBooking: true,
        maxAppointmentsPerDay: 30,
        advanceBookingDays: 21,
        cancellationPolicy: "Cancel up to 24 hours before appointment",
        languages: ["th", "en"],
      },
      staffCount: 0,
      roomCount: 5,
      capacity: 30,
      openedAt: new Date("2021-06-01"),
    })
    
    // Add sample staff
    this.addStaff({
      userId: "user1",
      branchId: bangkok.id,
      firstName: "Somchai",
      lastName: "Tanaka",
      email: "somchai@clinic.com",
      phone: "+66-81-234-5678",
      role: "doctor",
      employeeId: "EMP001",
      department: "Dermatology",
      specialization: "Facial Aesthetics",
      isActive: true,
      startDate: new Date("2020-01-15"),
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      defaultShift: "morning",
    })
    
    this.addStaff({
      userId: "user2",
      branchId: bangkok.id,
      firstName: "Nida",
      lastName: "Chairat",
      email: "nida@clinic.com",
      phone: "+66-82-234-5678",
      role: "nurse",
      employeeId: "EMP002",
      department: "General",
      isActive: true,
      startDate: new Date("2020-02-01"),
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      defaultShift: "full_day",
    })
    
    // Add sample inventory
    this.addInventoryItem({
      branchId: bangkok.id,
      productId: "PROD001",
      productName: "Hyaluronic Acid Serum",
      productCode: "HAS-100",
      category: "Skincare",
      quantity: 50,
      minQuantity: 20,
      maxQuantity: 100,
      unit: "bottle",
      cost: 500,
      price: 1200,
      supplier: "Beauty Supplier Co.",
      status: "in_stock",
    })
    
    this.addInventoryItem({
      branchId: bangkok.id,
      productId: "PROD002",
      productName: "Vitamin C Cream",
      productCode: "VCC-50",
      category: "Skincare",
      quantity: 15,
      minQuantity: 20,
      maxQuantity: 80,
      unit: "jar",
      cost: 300,
      price: 800,
      supplier: "Beauty Supplier Co.",
      status: "low_stock",
    })
    
    // Add sample resources
    this.addResource({
      branchId: bangkok.id,
      name: "Treatment Room 1",
      type: "room",
      code: "TR-001",
      description: "Main treatment room with laser equipment",
      capacity: 2,
      isAvailable: true,
      isActive: true,
    })
    
    this.addResource({
      branchId: bangkok.id,
      name: "Laser Device - CO2",
      type: "equipment",
      code: "LD-CO2-001",
      description: "CO2 Fractional Laser for skin resurfacing",
      isAvailable: true,
      isActive: true,
      lastMaintenanceDate: new Date("2024-10-01"),
      nextMaintenanceDate: new Date("2025-01-01"),
    })
  }
}
