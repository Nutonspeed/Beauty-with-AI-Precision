import { createServerClient } from "@/lib/supabase/server"
import { createEvent, getEventPublisher } from "@/lib/events/event-publisher"

export type ProposalsListParams = {
  userId: string
  clinicId: string | null
  status: string | null
  search: string | null
  limit: number
  offset: number
}

function normalizeProposalStatus(input: unknown) {
  const s = String(input ?? "").trim().toLowerCase()
  const allowed = new Set(["draft", "sent", "viewed", "accepted", "rejected", "expired"])
  return allowed.has(s) ? s : "draft"
}

export async function listProposals(params: ProposalsListParams) {
  const supabase = await createServerClient()

  let query = supabase
    .from("sales_proposals")
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
      { count: "exact" },
    )
    .eq("sales_user_id", params.userId)
    .order("created_at", { ascending: false })
    .range(params.offset, params.offset + params.limit - 1)

  if (params.clinicId) {
    query = query.eq("clinic_id", params.clinicId)
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", normalizeProposalStatus(params.status))
  }

  if (params.search) {
    const s = params.search
    query = query.or(`title.ilike.%${s}%,lead.name.ilike.%${s}%,lead.email.ilike.%${s}%`)
  }

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      limit: params.limit,
      offset: params.offset,
      hasMore: (count || 0) > params.offset + params.limit,
    },
  }
}

export async function createProposal(userId: string, clinicId: string | null, body: any) {
  const supabase = await createServerClient()

  const leadId = body?.lead_id
  const title = body?.title
  const treatments = body?.treatments

  if (!leadId || !title) {
    const err: any = new Error("lead_id and title are required")
    err.status = 400
    throw err
  }

  if (!Array.isArray(treatments) || treatments.length === 0) {
    const err: any = new Error("At least one treatment is required")
    err.status = 400
    throw err
  }

  let leadQuery = supabase
    .from("sales_leads")
    .select("id, clinic_id")
    .eq("id", leadId)
    .eq("sales_user_id", userId)

  if (clinicId) leadQuery = leadQuery.eq("clinic_id", clinicId)

  const { data: lead, error: leadError } = await leadQuery.single()
  if (leadError || !lead) {
    const err: any = new Error("Lead not found or unauthorized")
    err.status = 404
    throw err
  }

  const insertPayload: any = {
    lead_id: leadId,
    sales_user_id: userId,
    clinic_id: lead.clinic_id,
    title,
    description: body?.description ?? null,
    status: "draft",
    treatments,
    subtotal: body?.subtotal || 0,
    discount_percent: body?.discount_percent || 0,
    discount_amount: body?.discount_amount || 0,
    total_value: body?.total_value || 0,
    valid_until: body?.valid_until ?? null,
    payment_terms: body?.payment_terms ?? null,
    terms_and_conditions: body?.terms_and_conditions ?? null,
    metadata: body?.metadata ?? {},
    win_probability: body?.win_probability ?? 0,
  }

  const { data: proposal, error } = await supabase
    .from("sales_proposals")
    .insert(insertPayload)
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (error) throw error

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.created",
        {
          proposal_id: proposal.id,
          lead_id: leadId,
          sales_user_id: userId,
          total_value: Number(proposal.total_value ?? 0),
          win_probability: Number(proposal.win_probability ?? 0),
          new_status: proposal.status,
          changes: insertPayload,
          metadata: proposal.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: proposal.clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.created event:", eventError)
  }

  await supabase.from("sales_activities").insert({
    lead_id: leadId,
    sales_user_id: userId,
    proposal_id: proposal.id,
    type: "note",
    subject: "Proposal Created",
    description: `Created proposal: ${title}`,
  })

  return proposal
}

export async function getProposalById(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from("sales_proposals")
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status,
          primary_concern
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) query = query.eq("clinic_id", clinicId)

  const { data, error } = await query.single()
  if (error) throw error
  return data
}

export async function updateProposal(userId: string, clinicId: string | null, id: string, body: any) {
  const supabase = await createServerClient()

  let check = supabase
    .from("sales_proposals")
    .select("id, status, lead_id")
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) check = check.eq("clinic_id", clinicId)

  const { data: existing, error: checkError } = await check.single()
  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  const allowedFields = [
    "title",
    "description",
    "treatments",
    "subtotal",
    "discount_percent",
    "discount_amount",
    "total_value",
    "valid_until",
    "payment_terms",
    "terms_and_conditions",
    "metadata",
    "win_probability",
    "status",
  ]

  const updates: any = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = field === "status" ? normalizeProposalStatus(body[field]) : body[field]
    }
  }

  if (updates.treatments && (!Array.isArray(updates.treatments) || updates.treatments.length === 0)) {
    const err: any = new Error("Treatments must be a non-empty array")
    err.status = 400
    throw err
  }

  let updateQuery = supabase
    .from("sales_proposals")
    .update(updates)
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) updateQuery = updateQuery.eq("clinic_id", clinicId)

  const { data, error } = await updateQuery
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (error) throw error

  if ("status" in body && body.status !== existing.status) {
    await supabase.from("sales_activities").insert({
      lead_id: existing.lead_id,
      sales_user_id: userId,
      proposal_id: id,
      type: "status_change",
      subject: "Proposal Status Updated",
      description: `Status changed from ${existing.status} to ${updates.status}`,
      metadata: { old_status: existing.status, new_status: updates.status },
    })
  }

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.updated",
        {
          proposal_id: data.id,
          lead_id: existing.lead_id,
          sales_user_id: userId,
          previous_status: existing.status,
          new_status: data.status,
          total_value: Number(data.total_value ?? 0),
          win_probability: Number(data.win_probability ?? 0),
          changes: updates,
          metadata: data.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: (data as any).clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.updated event:", eventError)
  }

  return data
}

export async function deleteDraftProposal(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let check = supabase
    .from("sales_proposals")
    .select("id, lead_id, status")
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) check = check.eq("clinic_id", clinicId)

  const { data: existing, error: checkError } = await check.single()
  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (existing.status !== "draft") {
    const err: any = new Error("Only draft proposals can be deleted. Use status update instead.")
    err.status = 400
    throw err
  }

  let del = supabase.from("sales_proposals").delete().eq("id", id).eq("sales_user_id", userId)
  if (clinicId) del = del.eq("clinic_id", clinicId)

  const { error } = await del
  if (error) throw error

  await supabase.from("sales_activities").insert({
    lead_id: existing.lead_id,
    sales_user_id: userId,
    type: "note",
    subject: "Proposal Deleted",
    description: "Deleted draft proposal",
  })

  return { message: "Proposal deleted successfully" }
}

export async function sendProposal(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let check = supabase
    .from("sales_proposals")
    .select("id, status, lead_id, title")
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) check = check.eq("clinic_id", clinicId)

  const { data: existing, error: checkError } = await check.single()
  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (existing.status !== "draft") {
    const err: any = new Error("Only draft proposals can be sent")
    err.status = 400
    throw err
  }

  const now = new Date().toISOString()

  let updateQuery = supabase
    .from("sales_proposals")
    .update({ status: "sent", sent_at: now, updated_at: now })
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) updateQuery = updateQuery.eq("clinic_id", clinicId)

  const { data, error } = await updateQuery
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (error) throw error

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.sent",
        {
          proposal_id: data.id,
          lead_id: existing.lead_id,
          sales_user_id: userId,
          previous_status: existing.status,
          new_status: data.status,
          total_value: Number(data.total_value ?? 0),
          win_probability: Number(data.win_probability ?? 0),
          metadata: data.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: (data as any).clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.sent event:", eventError)
  }

  await supabase.from("sales_activities").insert({
    lead_id: existing.lead_id,
    sales_user_id: userId,
    proposal_id: id,
    type: "email",
    subject: "Proposal Sent",
    description: `Sent proposal: ${existing.title}`,
    contact_method: "email",
  })

  return data
}

export async function acceptProposal(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let check = supabase
    .from("sales_proposals")
    .select("id, status, lead_id, title")
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) check = check.eq("clinic_id", clinicId)

  const { data: existing, error: checkError } = await check.single()
  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (existing.status !== "sent") {
    const err: any = new Error("Only sent proposals can be accepted")
    err.status = 400
    throw err
  }

  const now = new Date().toISOString()

  let updateQuery = supabase
    .from("sales_proposals")
    .update({ status: "accepted", accepted_at: now, updated_at: now, win_probability: 100 })
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) updateQuery = updateQuery.eq("clinic_id", clinicId)

  const { data, error } = await updateQuery
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (error) throw error

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.accepted",
        {
          proposal_id: data.id,
          lead_id: existing.lead_id,
          sales_user_id: userId,
          previous_status: existing.status,
          new_status: data.status,
          total_value: Number(data.total_value ?? 0),
          win_probability: Number(data.win_probability ?? 0),
          metadata: data.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: (data as any).clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.accepted event:", eventError)
  }

  // Align lead status with DB enum lead_status: use won (not converted)
  let leadUpdate = supabase
    .from("sales_leads")
    .update({ status: "won", updated_at: now })
    .eq("id", existing.lead_id)
    .eq("sales_user_id", userId)
  if (clinicId) leadUpdate = leadUpdate.eq("clinic_id", clinicId)
  await leadUpdate

  await supabase.from("sales_activities").insert({
    lead_id: existing.lead_id,
    sales_user_id: userId,
    proposal_id: id,
    type: "status_change",
    subject: "Proposal Accepted",
    description: `Customer accepted proposal: ${existing.title}`,
    metadata: { old_status: existing.status, new_status: "accepted" },
  })

  return data
}

export async function rejectProposal(userId: string, clinicId: string | null, id: string, reason: string | null) {
  const supabase = await createServerClient()

  let check = supabase
    .from("sales_proposals")
    .select("id, status, lead_id, title")
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) check = check.eq("clinic_id", clinicId)

  const { data: existing, error: checkError } = await check.single()
  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (existing.status !== "sent") {
    const err: any = new Error("Only sent proposals can be rejected")
    err.status = 400
    throw err
  }

  const now = new Date().toISOString()

  let updateQuery = supabase
    .from("sales_proposals")
    .update({
      status: "rejected",
      rejected_at: now,
      rejection_reason: reason || "No reason provided",
      updated_at: now,
      win_probability: 0,
    })
    .eq("id", id)
    .eq("sales_user_id", userId)

  if (clinicId) updateQuery = updateQuery.eq("clinic_id", clinicId)

  const { data, error } = await updateQuery
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (error) throw error

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.rejected",
        {
          proposal_id: data.id,
          lead_id: existing.lead_id,
          sales_user_id: userId,
          previous_status: existing.status,
          new_status: data.status,
          total_value: Number(data.total_value ?? 0),
          win_probability: Number(data.win_probability ?? 0),
          metadata: { ...(data.metadata ?? {}), rejection_reason: reason ?? undefined },
        },
        {
          user_id: userId,
          clinic_id: (data as any).clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.rejected event:", eventError)
  }

  await supabase.from("sales_activities").insert({
    lead_id: existing.lead_id,
    sales_user_id: userId,
    proposal_id: id,
    type: "status_change",
    subject: "Proposal Rejected",
    description: `Customer rejected proposal: ${existing.title}. Reason: ${reason || "Not specified"}`,
    metadata: { old_status: existing.status, new_status: "rejected", rejection_reason: reason },
  })

  return data
}

export async function trackProposalView(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  const { data: proposal, error: rpcError } = await supabase.rpc("increment_proposal_view_count", {
    proposal_id: id,
    user_id: userId,
  })

  if (!rpcError) {
    try {
      const publisher = getEventPublisher()
      await publisher.publish(
        createEvent(
          "proposal.viewed",
          {
            proposal_id: (proposal as any)?.id ?? id,
            lead_id: (proposal as any)?.lead_id ?? (proposal as any)?.lead?.id ?? "",
            sales_user_id: userId,
            new_status: (proposal as any)?.status,
            metadata: (proposal as any)?.metadata ?? {},
          },
          {
            user_id: userId,
            clinic_id: (proposal as any)?.clinic_id ?? clinicId ?? undefined,
            source: "proposals-service",
          },
        ),
      )
    } catch (eventError) {
      console.error("Failed to publish proposal.viewed event:", eventError)
    }

    return proposal
  }

  const { data: existing, error: checkError } = await supabase
    .from("sales_proposals")
    .select("id, view_count, first_viewed_at, lead_id, title, sales_user_id, clinic_id")
    .eq("id", id)
    .single()

  if (checkError || !existing) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (existing.sales_user_id !== userId) {
    const err: any = new Error("Forbidden")
    err.status = 403
    throw err
  }

  if (clinicId && existing.clinic_id && existing.clinic_id !== clinicId) {
    const err: any = new Error("Forbidden")
    err.status = 403
    throw err
  }

  const now = new Date().toISOString()
  const updates: any = {
    viewed_at: now,
    view_count: (existing.view_count || 0) + 1,
    updated_at: now,
  }

  if (!existing.first_viewed_at) {
    updates.first_viewed_at = now
  }

  let updateQuery = supabase.from("sales_proposals").update(updates).eq("id", id)
  if (clinicId) updateQuery = updateQuery.eq("clinic_id", clinicId)

  const { data: updated, error: updateError } = await updateQuery
    .select(
      `
        *,
        lead:sales_leads!lead_id (
          id,
          clinic_id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `,
    )
    .single()

  if (updateError) throw updateError

  if (!existing.first_viewed_at) {
    await supabase.from("sales_activities").insert({
      lead_id: existing.lead_id,
      sales_user_id: userId,
      proposal_id: id,
      type: "note",
      subject: "Proposal First Viewed",
      description: `Customer viewed proposal: ${existing.title} for the first time`,
    })
  }

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.viewed",
        {
          proposal_id: updated.id,
          lead_id: existing.lead_id,
          sales_user_id: userId,
          previous_status: null as any,
          new_status: updated.status,
          total_value: Number(updated.total_value ?? 0),
          win_probability: Number(updated.win_probability ?? 0),
          metadata: updated.metadata ?? {},
        },
        {
          user_id: userId,
          clinic_id: (updated as any).clinic_id ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.viewed event:", eventError)
  }

  return updated
}

export type BookFromProposalParams = {
  booking_date: string
  booking_time: string
  service_id: string
  staff_id?: string
  customer_notes?: string
  internal_notes?: string
}

export async function bookFromProposal(
  userId: string,
  clinicId: string | null,
  proposalId: string,
  params: BookFromProposalParams
) {
  const supabase = await createServerClient()

  const { booking_date, booking_time, service_id, staff_id, customer_notes, internal_notes } = params

  if (!service_id) {
    const err: any = new Error("service_id is required to create a booking")
    err.status = 400
    throw err
  }

  if (!booking_date || !booking_time) {
    const err: any = new Error("booking_date and booking_time are required")
    err.status = 400
    throw err
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
    const err: any = new Error("booking_date must be in format YYYY-MM-DD")
    err.status = 400
    throw err
  }

  if (!/^\d{2}:\d{2}:\d{2}$/.test(booking_time)) {
    const err: any = new Error("booking_time must be in format HH:MM:SS")
    err.status = 400
    throw err
  }

  // 1) Load proposal (must belong to current sales_user)
  let proposalQuery = supabase
    .from("sales_proposals")
    .select(
      `
      id,
      lead_id,
      sales_user_id,
      clinic_id,
      status,
      total_value,
      treatments,
      lead:sales_leads!lead_id (
        id,
        sales_user_id,
        customer_user_id,
        name,
        email,
        phone,
        clinic_id
      )
    `
    )
    .eq("id", proposalId)
    .eq("sales_user_id", userId)

  if (clinicId) proposalQuery = proposalQuery.eq("clinic_id", clinicId)

  const { data: proposal, error: proposalError } = await proposalQuery.single()

  if (proposalError || !proposal) {
    const err: any = new Error("Proposal not found")
    err.status = 404
    throw err
  }

  if (proposal.status !== "accepted") {
    const err: any = new Error("Only accepted proposals can be converted to bookings")
    err.status = 400
    throw err
  }

  const lead = Array.isArray(proposal.lead) ? proposal.lead[0] : proposal.lead
  const effectiveClinicId = proposal.clinic_id || lead?.clinic_id
  if (!effectiveClinicId) {
    const err: any = new Error("Proposal is missing clinic context")
    err.status = 400
    throw err
  }

  // 2) Ensure a customer exists for this lead/clinic
  let customerId: string | null = null

  if (lead?.email || lead?.phone) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("clinic_id", effectiveClinicId)
      .or(
        [
          lead.email ? `email.eq.${lead.email}` : "",
          lead.phone ? `phone.eq.${lead.phone}` : "",
        ]
          .filter(Boolean)
          .join(","),
      )
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id as string
    }
  }

  if (!customerId) {
    const { data: newCustomer, error: createCustomerError } = await supabase
      .from("customers")
      .insert({
        clinic_id: effectiveClinicId,
        full_name: lead?.name ?? "Unknown",
        email: lead?.email ?? null,
        phone: lead?.phone ?? null,
        created_by: userId,
      })
      .select("id")
      .single()

    if (createCustomerError || !newCustomer) {
      const err: any = new Error("Failed to create customer")
      err.status = 500
      throw err
    }

    customerId = newCustomer.id as string
  }

  // 3) Validate staff belongs to this clinic and is active
  if (staff_id) {
    const { data: staffRow, error: staffError } = await supabase
      .from("clinic_staff")
      .select("id")
      .eq("user_id", staff_id)
      .eq("clinic_id", effectiveClinicId)
      .eq("status", "active")
      .maybeSingle()

    if (staffError) {
      const err: any = new Error("Failed to validate staff for this clinic")
      err.status = 500
      throw err
    }

    if (!staffRow) {
      const err: any = new Error("Invalid staff for this clinic or staff is not active")
      err.status = 400
      throw err
    }
  }

  // 4) Load the service to derive price / duration
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, treatment_type, price, duration_minutes")
    .eq("id", service_id)
    .eq("clinic_id", effectiveClinicId)
    .single()

  if (serviceError || !service) {
    const err: any = new Error("Service not found for this clinic")
    err.status = 404
    throw err
  }

  const durationMinutes = service.duration_minutes || 60
  const price = Number(service.price ?? proposal.total_value ?? 0)

  // 5) Create booking record
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      clinic_id: effectiveClinicId,
      customer_id: customerId,
      service_id: service.id,
      treatment_type: service.treatment_type || "treatment",
      booking_date,
      booking_time,
      duration_minutes: durationMinutes,
      price,
      status: "pending",
      staff_id: staff_id ?? null,
      customer_notes: customer_notes ?? null,
      internal_notes: internal_notes ?? `Created from accepted proposal ${proposal.id} by ${userId}`,
    })
    .select("*")
    .single()

  if (bookingError || !booking) {
    const err: any = new Error("Failed to create booking")
    err.status = 500
    throw err
  }

  try {
    const publisher = getEventPublisher()
    await publisher.publish(
      createEvent(
        "proposal.booked",
        {
          proposal_id: proposal.id,
          lead_id: proposal.lead_id,
          sales_user_id: userId,
          total_value: Number(proposal.total_value ?? 0),
          win_probability: Number((proposal as any).win_probability ?? 0),
          new_status: proposal.status,
          metadata: { booking_id: booking.id },
        },
        {
          user_id: userId,
          clinic_id: effectiveClinicId ?? clinicId ?? undefined,
          source: "proposals-service",
        },
      ),
    )
  } catch (eventError) {
    console.error("Failed to publish proposal.booked event:", eventError)
  }

  // Best-effort: create a matching appointment row for this booking
  try {
    const startDateTime = new Date(`${booking_date}T${booking_time}`)
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000)

    const startTime = `${startDateTime.getHours().toString().padStart(2, "0")}:${startDateTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`
    const endTime = `${endDateTime.getHours().toString().padStart(2, "0")}:${endDateTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`

    await supabase.from("appointments").insert({
      appointment_number: `APT-${Date.now()}`,
      customer_id: customerId,
      clinic_id: effectiveClinicId,
      staff_id: staff_id ?? null,
      appointment_date: booking_date,
      start_time: startTime,
      end_time: endTime,
      duration: durationMinutes,
      status: "scheduled",
      customer_notes,
      staff_notes: internal_notes,
    })
  } catch (error) {
    console.error("Failed to create appointment from booking:", error)
  }

  return booking
}
