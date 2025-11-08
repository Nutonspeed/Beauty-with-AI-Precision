import { createServerClient } from "@/lib/supabase/server"

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.update"
  | "user.delete"
  | "booking.create"
  | "booking.update"
  | "booking.cancel"
  | "analysis.create"
  | "analysis.view"
  | "payment.create"
  | "payment.refund"
  | "data.export"
  | "settings.update"

export type ResourceType = "user" | "booking" | "analysis" | "payment" | "settings" | "other"

export interface AuditLogEntry {
  userId?: string
  action: AuditAction
  resourceType: ResourceType
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status?: "success" | "failure" | "error"
}

export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    const supabase = await createServerClient()

    await supabase.rpc("log_audit_event", {
      p_user_id: entry.userId || null,
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_details: entry.details || null,
      p_ip_address: entry.ipAddress || null,
      p_user_agent: entry.userAgent || null,
      p_status: entry.status || "success",
    })

    console.log("[Audit] Logged event:", entry.action)
  } catch (error) {
    console.error("[Audit] Failed to log event:", error)
    // Don't throw - audit logging should not break the main flow
  }
}

export async function logDataAccess(
  userId: string,
  accessedBy: string,
  resourceType: ResourceType,
  resourceId: string,
  reason?: string,
) {
  try {
    const supabase = await createServerClient()

    await supabase.rpc("log_data_access", {
      p_user_id: userId,
      p_accessed_by: accessedBy,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_access_reason: reason || null,
    })

    console.log("[Audit] Logged data access:", { userId, accessedBy, resourceType })
  } catch (error) {
    console.error("[Audit] Failed to log data access:", error)
  }
}
