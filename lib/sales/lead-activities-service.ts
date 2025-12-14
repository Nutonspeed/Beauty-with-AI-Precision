import { createServerClient } from "@/lib/supabase/server"
import { createEvent, getEventPublisher } from "@/lib/events/event-publisher"

export async function listLeadActivities(userId: string, clinicId: string | null, leadId: string) {
  const supabase = await createServerClient()

  let leadQuery = supabase
    .from("sales_leads")
    .select("id")
    .eq("id", leadId)
    .eq("sales_user_id", userId)

  if (clinicId) leadQuery = leadQuery.eq("clinic_id", clinicId)

  const { data: lead, error: leadError } = await leadQuery.single()
  if (leadError || !lead) {
    const err: any = new Error("Lead not found or unauthorized")
    err.status = 404
    throw err
  }

  const { data, error } = await supabase
    .from("sales_activities")
    .select(
      `
        *,
        sales_user:users!sales_activities_sales_user_id_fkey(full_name, email)
      `,
    )
    .eq("lead_id", leadId)
    .eq("sales_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return { data: data || [] }
}

export async function createLeadActivity(userId: string, clinicId: string | null, leadId: string, body: any) {
  const supabase = await createServerClient()

  const normalizedType = String(body?.type || "").trim()
  const normalizedSubject = body?.subject ?? body?.title

  if (!normalizedType || !normalizedSubject) {
    const err: any = new Error("Type and subject are required")
    err.status = 400
    throw err
  }

  const allowedTypes = new Set([
    "call",
    "email",
    "meeting",
    "note",
    "task",
    "proposal_sent",
    "status_change",
  ])
  if (!allowedTypes.has(normalizedType)) {
    const err: any = new Error("Invalid activity type")
    err.status = 400
    throw err
  }

  let leadQuery = supabase
    .from("sales_leads")
    .select("id")
    .eq("id", leadId)
    .eq("sales_user_id", userId)

  if (clinicId) leadQuery = leadQuery.eq("clinic_id", clinicId)

  const { data: lead, error: leadError } = await leadQuery.single()
  if (leadError || !lead) {
    const err: any = new Error("Lead not found or unauthorized")
    err.status = 404
    throw err
  }

  const payload: any = {
    lead_id: leadId,
    sales_user_id: userId,
    type: normalizedType,
    subject: String(normalizedSubject),
    description: body.description || null,
    contact_method: body.contact_method || null,
    duration_minutes: body.duration_minutes || null,
    is_task: body.is_task || false,
    due_date: body.due_date || null,
    completed_at: body.completed_at || null,
    metadata: body.metadata || {},
  }

  const { data, error } = await supabase
    .from("sales_activities")
    .insert([payload])
    .select(
      `
        *,
        sales_user:users!sales_activities_sales_user_id_fkey(full_name, email)
      `,
    )
    .single()

  if (error) throw error

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "activity.created",
        {
          activity_id: data.id,
          lead_id: leadId,
          proposal_id: (data as any).proposal_id ?? undefined,
          sales_user_id: userId,
          activity_type: data.type,
          subject: data.subject,
          description: data.description ?? undefined,
          metadata: data.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: clinicId ?? undefined,
          source: "lead-activities-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish activity.created event:", eventError)
  }

  if (["call", "email", "meeting"].includes(String(body.type))) {
    const now = new Date().toISOString()
    let updateLeadQuery = supabase
      .from("sales_leads")
      .update({ last_contact_at: now })
      .eq("id", leadId)

    if (clinicId) updateLeadQuery = updateLeadQuery.eq("clinic_id", clinicId)

    await updateLeadQuery
  }

  return { data }
}

export async function logLeadSystemActivity(userId: string, clinicId: string | null, leadId: string, subject: string, description: string, metadata?: any) {
  const supabase = await createServerClient()

  const payload: any = {
    lead_id: leadId,
    sales_user_id: userId,
    type: "note",
    subject,
    description,
    metadata: metadata || {},
  }

  await supabase.from("sales_activities").insert([payload])
}
