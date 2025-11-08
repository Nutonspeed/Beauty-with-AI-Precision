/**
 * Multi-Tenant Database Utilities
 * Handles clinic-scoped queries and permissions
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  Clinic, 
  MultiTenantUser, 
  Lead, 
  MultiTenantSkinAnalysis,
  PermissionContext,
  Permission,
  RolePermissions
} from '@/types/multi-tenant';

// ============================================================================
// Supabase Client with Service Role (for server-side operations)
// ============================================================================

export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// ============================================================================
// Clinic Operations
// ============================================================================

export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();
  
  if (error) {
    console.error('Error fetching clinic:', error);
    return null;
  }
  
  return data as Clinic;
}

export async function getActiveClinic(): Promise<Clinic[]> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('is_active', true)
    .order('clinic_name');
  
  if (error) {
    console.error('Error fetching clinics:', error);
    return [];
  }
  
  return data as Clinic[];
}

export async function getUserClinic(userId: string): Promise<Clinic | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('clinic_id, clinics(*)')
    .eq('id', userId)
    .single();
  
  if (error || !data?.clinic_id) {
    return null;
  }
  
  return data.clinics as unknown as Clinic;
}

// ============================================================================
// User Operations (with Clinic context)
// ============================================================================

export async function getUserWithClinic(userId: string): Promise<MultiTenantUser | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*, clinic:clinics(*)')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user with clinic:', error);
    return null;
  }
  
  return data as MultiTenantUser;
}

export async function getClinicStaff(clinicId: string, role?: string) {
  const supabase = getServiceRoleClient();
  
  let query = supabase
    .from('users')
    .select('*')
    .eq('clinic_id', clinicId);
  
  if (role) {
    query = query.eq('role', role);
  }
  
  const { data, error } = await query.order('full_name');
  
  if (error) {
    console.error('Error fetching clinic staff:', error);
    return [];
  }
  
  return data as MultiTenantUser[];
}

export async function getSalesStaffByClinic(clinicId: string) {
  return getClinicStaff(clinicId, 'sales_staff');
}

// ============================================================================
// Analysis Operations (Multi-Clinic)
// ============================================================================

export async function getClinicAnalyses(
  clinicId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching clinic analyses:', error);
    return [];
  }
  
  return data as MultiTenantSkinAnalysis[];
}

export async function getSalesStaffAnalyses(
  salesStaffId: string,
  limit: number = 50
) {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('sales_staff_id', salesStaffId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching sales staff analyses:', error);
    return [];
  }
  
  return data as MultiTenantSkinAnalysis[];
}

export async function createAnalysisWithClinic(
  analysis: Partial<MultiTenantSkinAnalysis>,
  userId: string
) {
  const supabase = getServiceRoleClient();
  
  // Get user's clinic_id and branch_id
  const user = await getUserWithClinic(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const enrichedAnalysis = {
    ...analysis,
    clinic_id: user.clinic_id,
    branch_id: user.branch_id,
    sales_staff_id: user.role === 'sales_staff' ? userId : undefined,
  };
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .insert(enrichedAnalysis)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating analysis:', error);
    throw error;
  }
  
  return data as MultiTenantSkinAnalysis;
}

// ============================================================================
// Lead Operations
// ============================================================================

export async function getClinicLeads(
  clinicId: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = getServiceRoleClient();
  
  let query = supabase
    .from('leads')
    .select('*')
    .eq('clinic_id', clinicId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching clinic leads:', error);
    return [];
  }
  
  return data as Lead[];
}

export async function getSalesStaffLeads(
  salesStaffId: string,
  status?: string
) {
  const supabase = getServiceRoleClient();
  
  let query = supabase
    .from('leads')
    .select('*')
    .eq('sales_staff_id', salesStaffId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query
    .order('lead_score', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching sales staff leads:', error);
    return [];
  }
  
  return data as Lead[];
}

export async function createLead(
  lead: Partial<Lead>,
  salesStaffId: string
) {
  const supabase = getServiceRoleClient();
  
  // Get sales staff's clinic_id
  const user = await getUserWithClinic(salesStaffId);
  if (!user?.clinic_id) {
    throw new Error('Sales staff must belong to a clinic');
  }
  
  const enrichedLead = {
    ...lead,
    clinic_id: user.clinic_id,
    branch_id: user.branch_id,
    sales_staff_id: salesStaffId,
    interaction_history: [],
  };
  
  const { data, error } = await supabase
    .from('leads')
    .insert(enrichedLead)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
  
  return data as Lead;
}

export async function updateLead(
  leadId: string,
  updates: Partial<Lead>
) {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
  
  return data as Lead;
}

// ============================================================================
// Permission & Access Control
// ============================================================================

const ROLE_PERMISSIONS: RolePermissions = {
  super_admin: [
    'view_all_clinics',
    'view_analyses',
    'create_analyses',
    'edit_analyses',
    'delete_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
    'delete_leads',
    'view_analytics',
    'manage_staff',
    'manage_clinic_settings',
  ],
  clinic_owner: [
    'view_analyses',
    'create_analyses',
    'edit_analyses',
    'delete_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
    'delete_leads',
    'view_analytics',
    'manage_staff',
    'manage_clinic_settings',
  ],
  clinic_admin: [
    'view_analyses',
    'create_analyses',
    'edit_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
    'view_analytics',
    'manage_staff',
  ],
  sales_staff: [
    'view_analyses',
    'create_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
  ],
  clinic_staff: [
    'view_analyses',
    'create_analyses',
  ],
  premium_customer: [
    'view_analyses',
    'create_analyses',
  ],
  free_user: [
    'view_analyses',
  ],
  public: [],
};

export function userHasPermission(
  context: PermissionContext,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[context.role] || [];
  return rolePermissions.includes(permission);
}

export function canAccessClinic(
  context: PermissionContext,
  targetClinicId: string
): boolean {
  // Super admin can access all clinics
  if (context.role === 'super_admin') {
    return true;
  }
  
  // Others can only access their own clinic
  return context.clinicId === targetClinicId;
}

export function canAccessAnalysis(
  context: PermissionContext,
  analysis: MultiTenantSkinAnalysis
): boolean {
  // Own analysis
  if (analysis.user_id === context.userId) {
    return true;
  }
  
  // Same clinic
  if (analysis.clinic_id && context.clinicId) {
    return analysis.clinic_id === context.clinicId;
  }
  
  // Demo analysis (no clinic)
  if (!analysis.clinic_id) {
    return true;
  }
  
  return false;
}

export function canAccessLead(
  context: PermissionContext,
  lead: Lead
): boolean {
  // Own lead
  if (lead.sales_staff_id === context.userId) {
    return true;
  }
  
  // Admin/Owner in same clinic
  if (
    lead.clinic_id === context.clinicId &&
    ['clinic_admin', 'clinic_owner', 'super_admin'].includes(context.role)
  ) {
    return true;
  }
  
  return false;
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

export async function getClinicStatistics(clinicId: string) {
  const supabase = getServiceRoleClient();
  
  // Total analyses
  const { count: totalAnalyses } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);
  
  // Total leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);
  
  // Conversions
  const { count: totalConversions } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('converted_to_customer', true);
  
  // Sales staff
  const { count: totalSalesStaff } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('role', 'sales_staff');
  
  const conversionRate = totalLeads ? (totalConversions! / totalLeads) * 100 : 0;
  
  return {
    clinic_id: clinicId,
    total_analyses: totalAnalyses || 0,
    total_leads: totalLeads || 0,
    total_conversions: totalConversions || 0,
    conversion_rate: conversionRate,
    total_sales_staff: totalSalesStaff || 0,
  };
}

export async function getSalesStaffPerformance(clinicId: string) {
  const supabase = getServiceRoleClient();
  
  // Get all sales staff in clinic
  const salesStaff = await getSalesStaffByClinic(clinicId);
  
  const performance = await Promise.all(
    salesStaff.map(async (staff) => {
      // Analyses count
      const { count: analyses } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('sales_staff_id', staff.id);
      
      // Leads count
      const { count: leads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('sales_staff_id', staff.id);
      
      // Hot leads
      const { count: hotLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('sales_staff_id', staff.id)
        .eq('status', 'hot');
      
      // Conversions
      const { count: conversions } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('sales_staff_id', staff.id)
        .eq('converted_to_customer', true);
      
      const conversionRate = leads ? (conversions! / leads) * 100 : 0;
      
      return {
        sales_staff_id: staff.id,
        full_name: staff.full_name || staff.email,
        total_analyses: analyses || 0,
        total_leads: leads || 0,
        hot_leads: hotLeads || 0,
        conversions: conversions || 0,
        conversion_rate: conversionRate,
        last_activity: staff.last_login_at || staff.updated_at,
      };
    })
  );
  
  return performance.sort((a, b) => b.total_leads - a.total_leads);
}
