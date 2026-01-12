/**
 * Multi-Tenant Database Utilities
 * Handles center-scoped queries and permissions
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  Center, 
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
// Center Operations
// ============================================================================

export async function getCenterById(centerId: string): Promise<Center | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('id', centerId)
    .single();
  
  if (error) {
    console.error('Error fetching center:', error);
    return null;
  }
  
  return data as Center;
}

export async function getActiveCenter(): Promise<Center[]> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('is_active', true)
    .order('center_name');
  
  if (error) {
    console.error('Error fetching centers:', error);
    return [];
  }
  
  return data as Center[];
}

export async function getUserCenter(userId: string): Promise<Center | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('center_id, centers(*)')
    .eq('id', userId)
    .single();
  
  if (error || !data?.center_id) {
    return null;
  }
  
  return data.centers as unknown as Center;
}

// ============================================================================
// User Operations (with Center context)
// ============================================================================

export async function getUserWithCenter(userId: string): Promise<MultiTenantUser | null> {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*, center:centers(*)')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user with center:', error);
    return null;
  }
  
  return data as MultiTenantUser;
}

export async function getCenterStaff(centerId: string, role?: string) {
  const supabase = getServiceRoleClient();
  
  let query = supabase
    .from('users')
    .select('*')
    .eq('center_id', centerId);
  
  if (role) {
    query = query.eq('role', role);
  }
  
  const { data, error } = await query.order('full_name');
  
  if (error) {
    console.error('Error fetching center staff:', error);
    return [];
  }
  
  return data as MultiTenantUser[];
}

export async function getSalesStaffByCenter(centerId: string) {
  return getCenterStaff(centerId, 'sales_staff');
}

// ============================================================================
// Analysis Operations (Multi-Center)
// ============================================================================

export async function getCenterAnalyses(
  centerId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = getServiceRoleClient();
  
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('center_id', centerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching center analyses:', error);
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

export async function createAnalysisWithCenter(
  analysis: Partial<MultiTenantSkinAnalysis>,
  userId: string
) {
  const supabase = getServiceRoleClient();
  
  // Get user's center_id and branch_id
  const user = await getUserWithCenter(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const enrichedAnalysis = {
    ...analysis,
    center_id: user.center_id,
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

export async function getCenterLeads(
  centerId: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = getServiceRoleClient();
  
  let query = supabase
    .from('leads')
    .select('*')
    .eq('center_id', centerId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching center leads:', error);
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

export async function createLeadWithCenter(
  lead: Partial<Lead>,
  salesStaffId: string
) {
  const supabase = getServiceRoleClient();
  
  // Get sales staff's center_id
  const user = await getUserWithCenter(salesStaffId);
  if (!user?.center_id) {
    throw new Error('Sales staff must belong to a center');
  }
  
  const enrichedLead = {
    ...lead,
    center_id: user.center_id,
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
    'view_all_centers',
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
    'manage_center_settings',
  ],
  center_owner: [
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
    'manage_center_settings',
  ],
  center_admin: [
    'view_analyses',
    'create_analyses',
    'edit_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
    'view_analytics',
    'manage_staff',
    'manage_center_settings',
  ],
  sales_staff: [
    'view_analyses',
    'create_analyses',
    'view_leads',
    'create_leads',
    'edit_leads',
  ],
  center_staff: [
    'view_analyses',
    'create_analyses',
  ],
  customer: [
    'view_analyses',
  ],
  public: [],
};

export function hasPermission(
  role: string,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

export function canAccessCenter(
  context: PermissionContext,
  targetCenterId: string
): boolean {
  // Super admin can access all centers
  if (context.role === 'super_admin') {
    return true;
  }
  
  // Others can only access their own center
  return context.centerId === targetCenterId;
}

export function canAccessAnalysis(
  analysis: MultiTenantSkinAnalysis,
  context: PermissionContext
): boolean {
  // Super admin can access everything
  if (context.role === 'super_admin') {
    return true;
  }
  
  // Same center
  if (analysis.center_id && context.centerId) {
    return analysis.center_id === context.centerId;
  }
  
  // Demo analysis (no center)
  if (!analysis.center_id) {
    return true;
  }
  
  // Individual customer access
  return analysis.user_id === context.userId;
}

export function canManageLead(
  lead: Lead,
  context: PermissionContext
): boolean {
  // Super admin
  if (context.role === 'super_admin') {
    return true;
  }
  
  // Admin/Owner in same center
  if (
    lead.center_id === context.centerId &&
    ['center_admin', 'center_owner', 'super_admin'].includes(context.role)
  ) {
    return true;
  }
  
  // Sales staff can only manage their own leads
  return lead.sales_staff_id === context.userId;
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

export async function getCenterStatistics(centerId: string) {
  const supabase = getServiceRoleClient();
  
  // Total analyses
  const { count: totalAnalyses } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('center_id', centerId);
  
  // Total leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('center_id', centerId);
  
  // Conversions
  const { count: totalConversions } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('converted_to_customer', true);
  
  // Sales staff
  const { count: totalSalesStaff } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('role', 'sales_staff');
  
  const conversionRate = totalLeads ? (totalConversions! / totalLeads) * 100 : 0;
  
  return {
    center_id: centerId,
    total_analyses: totalAnalyses || 0,
    total_leads: totalLeads || 0,
    total_conversions: totalConversions || 0,
    conversion_rate: conversionRate,
    total_sales_staff: totalSalesStaff || 0,
  };
}

export async function getSalesStaffPerformance(centerId: string) {
  const supabase = getServiceRoleClient();
  
  // Get all sales staff in center
  const salesStaff: MultiTenantUser[] = await getSalesStaffByCenter(centerId);
  
  const performance = await Promise.all(
    salesStaff.map(async (staff: MultiTenantUser) => {
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
  
  return performance.sort((a: any, b: any) => b.total_leads - a.total_leads);
}
