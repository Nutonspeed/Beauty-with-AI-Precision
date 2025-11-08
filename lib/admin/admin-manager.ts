/**
 * AdminManager - ระบบจัดการ Admin Dashboard
 * 
 * Features:
 * - Customer Management (CRUD)
 * - Treatment Analytics
 * - Revenue & Sales Reports
 * - Staff Management
 * - Appointment Calendar
 * - Inventory Tracking
 * - Real-time Statistics
 */

import { createBrowserClient } from '@supabase/ssr';

// ===== Customer Management =====

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: string;
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  profileImage?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientInput {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: string;
  skinType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
}

// ===== Staff Management =====

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor' | 'nurse' | 'receptionist' | 'admin';
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: Date;
  dateOfJoining: Date;
  salary?: number;
  workingHours?: {
    [key: string]: { start: string; end: string };
  };
  isActive: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Inventory Management =====

export interface InventoryItem {
  id: string;
  name: string;
  category: 'product' | 'equipment' | 'medicine' | 'supply';
  sku: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier?: string;
  expiryDate?: Date;
  lastRestocked?: Date;
  location?: string;
  notes?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  createdAt: Date;
  updatedAt: Date;
}

// ===== Analytics & Reports =====

export interface DashboardStats {
  // Overview
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  
  // Revenue
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number; // percentage
  
  // Appointments
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  
  // Treatments
  totalTreatments: number;
  popularTreatments: Array<{ name: string; count: number; revenue: number }>;
  
  // Staff
  totalStaff: number;
  activeStaff: number;
  
  // Inventory
  totalInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface RevenueReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: Array<{
    date: string;
    revenue: number;
    appointments: number;
    avgBookingValue: number;
  }>;
  totalRevenue: number;
  totalAppointments: number;
  avgBookingValue: number;
}

export interface TreatmentAnalytics {
  treatmentType: string;
  totalBookings: number;
  totalRevenue: number;
  avgPrice: number;
  growthRate: number;
  popularityRank: number;
}

export class AdminManager {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ===== Customer Management =====

  /**
   * สร้างลูกค้าใหม่
   */
  async createPatient(input: PatientInput): Promise<Patient> {
    const patient: Patient = {
      id: this.generatePatientId(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      address: input.address,
      skinType: input.skinType as any,
      allergies: input.allergies || [],
      medications: input.medications || [],
      medicalHistory: input.medicalHistory,
      totalVisits: 0,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await this.supabase
      .from('patients')
      .insert(this.mapPatientToDatabase(patient));

    if (error) {
      console.error('Error creating patient:', error);
  throw new Error('Failed to create customer');
    }

    return patient;
  }

  /**
   * อัพเดทข้อมูลลูกค้า
   */
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const patient = await this.getPatientById(id);
    if (!patient) {
  throw new Error('Customer not found');
    }

    const updated: Patient = {
      ...patient,
      ...updates,
      updatedAt: new Date(),
    };

    const { error } = await this.supabase
      .from('patients')
      .update(this.mapPatientToDatabase(updated))
      .eq('id', id);

    if (error) {
  throw new Error('Failed to update customer');
    }

    return updated;
  }

  /**
   * ลบลูกค้า (soft delete)
   */
  async deletePatient(id: string): Promise<void> {
    await this.updatePatient(id, { status: 'inactive' });
  }

  /**
   * ดึงข้อมูลลูกค้าทั้งหมด
   */
  async getAllPatients(filters?: {
    status?: 'active' | 'inactive';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ patients: Patient[]; total: number }> {
    let query = this.supabase.from('patients').select('*', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) {
  console.error('Error fetching customers:', error);
      return { patients: [], total: 0 };
    }

    return {
      patients: (data || []).map(row => this.mapDatabaseToPatient(row)),
      total: count || 0,
    };
  }

  /**
   * ดึงข้อมูลลูกค้าตาม ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToPatient(data);
  }

  // ===== Staff Management =====

  /**
   * สร้างพนักงานใหม่
   */
  async createStaff(input: Partial<Staff>): Promise<Staff> {
    const staff: Staff = {
      id: this.generateStaffId(),
      name: input.name!,
      email: input.email!,
      phone: input.phone!,
      role: input.role || 'receptionist',
      specialization: input.specialization,
      licenseNumber: input.licenseNumber,
      dateOfBirth: input.dateOfBirth,
      dateOfJoining: input.dateOfJoining || new Date(),
      salary: input.salary,
      workingHours: input.workingHours,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await this.supabase
      .from('staff')
      .insert(this.mapStaffToDatabase(staff));

    if (error) {
      throw new Error('Failed to create staff');
    }

    return staff;
  }

  /**
   * ดึงข้อมูลพนักงานทั้งหมด
   */
  async getAllStaff(filters?: { role?: string; isActive?: boolean }): Promise<Staff[]> {
    let query = this.supabase.from('staff').select('*');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapDatabaseToStaff(row));
  }

  // ===== Inventory Management =====

  /**
   * เพิ่มสินค้าในคลัง
   */
  async addInventoryItem(input: Partial<InventoryItem>): Promise<InventoryItem> {
    const quantity = input.quantity ?? 0;
    const minQuantity = input.minQuantity ?? 10;

    const item: InventoryItem = {
      id: this.generateInventoryId(),
      name: input.name!,
      category: input.category || 'supply',
      sku: input.sku || this.generateSKU(),
      description: input.description,
      quantity,
      minQuantity,
      unitPrice: input.unitPrice || 0,
      supplier: input.supplier,
      expiryDate: input.expiryDate,
      lastRestocked: new Date(),
      location: input.location,
      notes: input.notes,
      status: this.calculateInventoryStatus(quantity, minQuantity),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await this.supabase
      .from('inventory')
      .insert(this.mapInventoryToDatabase(item));

    if (error) {
      throw new Error('Failed to add inventory item');
    }

    return item;
  }

  /**
   * อัพเดทจำนวนสินค้า
   */
  async updateInventoryQuantity(id: string, quantity: number): Promise<void> {
    const { data: row } = await this.supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (!row) {
      throw new Error('Inventory item not found');
    }

    const existing = this.mapDatabaseToInventory(row);
    const status = this.calculateInventoryStatus(quantity, existing.minQuantity);
    const updatedTimestamp = new Date().toISOString();

    await this.supabase
      .from('inventory')
      .update({
        quantity,
        status,
        last_restocked:
          quantity > existing.quantity
            ? updatedTimestamp
            : existing.lastRestocked?.toISOString() ?? row.last_restocked,
        updated_at: updatedTimestamp,
      })
      .eq('id', id);
  }

  /**
   * ดึงรายการสินค้าทั้งหมด
   */
  async getAllInventory(filters?: {
    category?: string;
    status?: string;
  }): Promise<InventoryItem[]> {
    let query = this.supabase.from('inventory').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapDatabaseToInventory(row));
  }

  // ===== Dashboard Statistics =====

  /**
   * ดึงสถิติ Dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Patients
    const { data: allCustomers } = await this.supabase.from('patients').select('*');
    const activeCustomers = allCustomers?.filter(p => p.status === 'active') || [];
    const newCustomers = allCustomers?.filter(
      p => new Date(p.created_at) >= firstDayOfMonth
    ) || [];

    // Revenue
    const { data: bookings } = await this.supabase.from('bookings').select('*');
    const paidBookings = bookings?.filter(b => b.payment_status === 'paid') || [];
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.payment_amount, 0);
    
    const thisMonthRevenue = paidBookings
      .filter(b => new Date(b.appointment_date) >= firstDayOfMonth)
      .reduce((sum, b) => sum + b.payment_amount, 0);
    
    const lastMonthRevenue = paidBookings
      .filter(
        b =>
          new Date(b.appointment_date) >= firstDayOfLastMonth &&
          new Date(b.appointment_date) <= lastDayOfLastMonth
      )
      .reduce((sum, b) => sum + b.payment_amount, 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Appointments
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
    
    const appointmentsToday = bookings?.filter(
      b => b.appointment_date === today
    ).length || 0;
    
    const appointmentsThisWeek = bookings?.filter(
      b => new Date(b.appointment_date) >= thisWeekStart
    ).length || 0;
    
    const appointmentsThisMonth = bookings?.filter(
      b => new Date(b.appointment_date) >= firstDayOfMonth
    ).length || 0;

    // Popular Treatments
    const treatmentStats = this.calculateTreatmentStats(bookings || []);

    // Staff
    const { data: staff } = await this.supabase.from('staff').select('*');
    const activeStaff = staff?.filter(s => s.is_active) || [];

    // Inventory
    const { data: inventory } = await this.supabase.from('inventory').select('*');
    const lowStock = inventory?.filter(i => i.status === 'low-stock') || [];
    const outOfStock = inventory?.filter(i => i.status === 'out-of-stock') || [];

    return {
  totalPatients: allCustomers?.length || 0,
  activePatients: activeCustomers.length,
  newPatientsThisMonth: newCustomers.length,
      
      totalRevenue,
      revenueThisMonth: thisMonthRevenue,
      revenueLastMonth: lastMonthRevenue,
      revenueGrowth,
      
      totalAppointments: bookings?.length || 0,
      appointmentsToday,
      appointmentsThisWeek,
      appointmentsThisMonth,
      
      totalTreatments: treatmentStats.length,
      popularTreatments: treatmentStats.slice(0, 5),
      
      totalStaff: staff?.length || 0,
      activeStaff: activeStaff.length,
      
      totalInventoryItems: inventory?.length || 0,
      lowStockItems: lowStock.length,
      outOfStockItems: outOfStock.length,
    };
  }

  /**
   * สร้างรายงานรายได้
   */
  async getRevenueReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date
  ): Promise<RevenueReport> {
    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .gte('appointment_date', startDate.toISOString().split('T')[0])
      .lte('appointment_date', endDate.toISOString().split('T')[0])
      .eq('payment_status', 'paid');

    const groupedData = this.groupBookingsByPeriod(bookings || [], period);
    
    const data = groupedData.map(group => ({
      date: group.date,
      revenue: group.bookings.reduce((sum, b) => sum + b.payment_amount, 0),
      appointments: group.bookings.length,
      avgBookingValue:
        group.bookings.length > 0
          ? group.bookings.reduce((sum, b) => sum + b.payment_amount, 0) / group.bookings.length
          : 0,
    }));

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalAppointments = data.reduce((sum, d) => sum + d.appointments, 0);

    return {
      period,
      data,
      totalRevenue,
      totalAppointments,
      avgBookingValue: totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
    };
  }

  /**
   * วิเคราะห์ทรีทเมนท์
   */
  async getTreatmentAnalytics(): Promise<TreatmentAnalytics[]> {
    const { data: bookings } = await this.supabase.from('bookings').select('*');

    if (!bookings) return [];

    const treatmentMap = new Map<string, TreatmentAnalytics>();

    bookings.forEach(booking => {
      const existing = treatmentMap.get(booking.treatment_type);
      if (existing) {
        existing.totalBookings++;
        existing.totalRevenue += booking.payment_amount;
      } else {
        treatmentMap.set(booking.treatment_type, {
          treatmentType: booking.treatment_type,
          totalBookings: 1,
          totalRevenue: booking.payment_amount,
          avgPrice: booking.payment_amount,
          growthRate: 0,
          popularityRank: 0,
        });
      }
    });

    const analytics = Array.from(treatmentMap.values())
      .map(t => ({
        ...t,
        avgPrice: t.totalRevenue / t.totalBookings,
      }))
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .map((t, index) => ({
        ...t,
        popularityRank: index + 1,
      }));

    return analytics;
  }

  // ===== Helper Methods =====

  private generatePatientId(): string {
    return `PAT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateStaffId(): string {
    return `STF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateInventoryId(): string {
    return `INV${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSKU(): string {
    return `SKU${Date.now()}`;
  }

  private calculateInventoryStatus(
    quantity: number,
    minQuantity: number
  ): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minQuantity) return 'low-stock';
    return 'in-stock';
  }

  private calculateTreatmentStats(bookings: any[]): Array<{
    name: string;
    count: number;
    revenue: number;
  }> {
    const stats = new Map<string, { count: number; revenue: number }>();

    bookings.forEach(booking => {
      const existing = stats.get(booking.treatment_type);
      if (existing) {
        existing.count++;
        existing.revenue += booking.payment_amount;
      } else {
        stats.set(booking.treatment_type, {
          count: 1,
          revenue: booking.payment_amount,
        });
      }
    });

    return Array.from(stats.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  private groupBookingsByPeriod(
    bookings: any[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Array<{ date: string; bookings: any[] }> {
    const groups = new Map<string, any[]>();

    bookings.forEach(booking => {
      const date = new Date(booking.appointment_date);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        }
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
      }

      const existing = groups.get(key) || [];
      existing.push(booking);
      groups.set(key, existing);
    });

    return Array.from(groups.entries())
      .map(([date, bookings]) => ({ date, bookings }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private mapStaffToDatabase(staff: Staff): any {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      specialization: staff.specialization,
      license_number: staff.licenseNumber,
      date_of_birth: staff.dateOfBirth
        ? staff.dateOfBirth.toISOString().split('T')[0]
        : null,
      hire_date: staff.dateOfJoining.toISOString().split('T')[0],
      salary: staff.salary ?? null,
      working_hours: staff.workingHours ?? null,
      is_active: staff.isActive,
      created_at: staff.createdAt.toISOString(),
      updated_at: staff.updatedAt.toISOString(),
    };
  }

  private mapDatabaseToStaff(row: any): Staff {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      specialization: row.specialization ?? undefined,
      licenseNumber: row.license_number ?? undefined,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      dateOfJoining: row.hire_date ? new Date(row.hire_date) : new Date(row.created_at),
      salary: row.salary !== null && row.salary !== undefined ? Number(row.salary) : undefined,
      workingHours: row.working_hours ? (row.working_hours as Staff['workingHours']) : undefined,
      isActive: Boolean(row.is_active),
      profileImage: row.profile_image ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapInventoryToDatabase(item: InventoryItem): any {
    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit_price: item.unitPrice,
      supplier: item.supplier,
      expiry_date: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : null,
      status: item.status,
      last_restocked: item.lastRestocked ? item.lastRestocked.toISOString() : null,
      location: item.location,
      notes: item.notes,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }

  private mapDatabaseToInventory(row: any): InventoryItem {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      sku: row.sku,
      description: row.description ?? undefined,
      quantity: row.quantity !== null && row.quantity !== undefined ? Number(row.quantity) : 0,
      minQuantity: row.min_quantity !== null && row.min_quantity !== undefined ? Number(row.min_quantity) : 0,
      unitPrice: row.unit_price !== null && row.unit_price !== undefined ? Number(row.unit_price) : 0,
      supplier: row.supplier ?? undefined,
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
      lastRestocked: row.last_restocked ? new Date(row.last_restocked) : undefined,
      location: row.location ?? undefined,
      notes: row.notes ?? undefined,
      status: row.status as InventoryItem['status'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapPatientToDatabase(patient: Patient): any {
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth.toISOString().split('T')[0],
      gender: patient.gender,
      address: patient.address,
      skin_type: patient.skinType,
      allergies: patient.allergies,
      current_medications: patient.medications,
      medical_history: patient.medicalHistory,
      profile_image: patient.profileImage,
      total_visits: patient.totalVisits,
      total_spent: patient.totalSpent,
      last_visit_date: patient.lastVisit?.toISOString(),
      status: patient.status,
      created_at: patient.createdAt.toISOString(),
      updated_at: patient.updatedAt.toISOString(),
    };
  }

  private mapDatabaseToPatient(row: any): Patient {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      dateOfBirth: new Date(row.date_of_birth),
      gender: row.gender,
      address: row.address,
      skinType: row.skin_type,
      allergies: row.allergies || [],
      medications: row.current_medications || [],
      medicalHistory: row.medical_history,
      profileImage: row.profile_image,
      totalVisits:
        row.total_visits !== null && row.total_visits !== undefined ? Number(row.total_visits) : 0,
      totalSpent:
        row.total_spent !== null && row.total_spent !== undefined ? Number(row.total_spent) : 0,
      lastVisit: row.last_visit_date ? new Date(row.last_visit_date) : undefined,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
