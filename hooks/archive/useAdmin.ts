/**
 * useAdmin Hook - React hook for admin management
 */

'use client';

import { useState } from 'react';
import {
  AdminManager,
  Patient,
  PatientInput,
  Staff,
  InventoryItem,
  DashboardStats,
  RevenueReport,
  TreatmentAnalytics,
} from '@/lib/admin/admin-manager';

export function useAdmin() {
  const [adminManager] = useState(() => new AdminManager());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [treatmentAnalytics, setTreatmentAnalytics] = useState<TreatmentAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);

  // ===== Customer Management =====

  const createPatient = async (input: PatientInput): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const patient = await adminManager.createPatient(input);
      await loadPatients();
      return patient;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await adminManager.updatePatient(id, updates);
      await loadPatients();
      return true;
    } catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to update customer';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await adminManager.deletePatient(id);
      await loadPatients();
      return true;
    } catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async (filters?: {
    status?: 'active' | 'inactive';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { patients: data, total } = await adminManager.getAllPatients(filters);
      setPatients(data);
      setTotalPatients(total);
    } catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to load customers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Staff Management =====

  const createStaff = async (input: Partial<Staff>): Promise<Staff | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const staffMember = await adminManager.createStaff(input);
      await loadStaff();
      return staffMember;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create staff';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async (filters?: { role?: string; isActive?: boolean }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminManager.getAllStaff(filters);
      setStaff(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load staff';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Inventory Management =====

  const addInventoryItem = async (input: Partial<InventoryItem>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await adminManager.addInventoryItem(input);
      await loadInventory();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add inventory item';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventoryQuantity = async (id: string, quantity: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await adminManager.updateInventoryQuantity(id, quantity);
      await loadInventory();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update inventory';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventory = async (filters?: {
    category?: string;
    status?: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminManager.getAllInventory(filters);
      setInventory(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Analytics & Reports =====

  const loadDashboardStats = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminManager.getDashboardStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRevenueReport = async (
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminManager.getRevenueReport(period, startDate, endDate);
      setRevenueReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load revenue report';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTreatmentAnalytics = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminManager.getTreatmentAnalytics();
      setTreatmentAnalytics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load treatment analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    patients,
    staff,
    inventory,
    stats,
    revenueReport,
    treatmentAnalytics,
    isLoading,
    error,
    totalPatients,

    // Patient Actions
    createPatient,
    updatePatient,
    deletePatient,
    loadPatients,

    // Staff Actions
    createStaff,
    loadStaff,

    // Inventory Actions
    addInventoryItem,
    updateInventoryQuantity,
    loadInventory,

    // Analytics Actions
    loadDashboardStats,
    loadRevenueReport,
    loadTreatmentAnalytics,

    // Utility
    clearError,
  };
}
