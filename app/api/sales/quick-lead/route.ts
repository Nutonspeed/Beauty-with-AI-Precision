import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"
import { createLead } from "@/lib/sales/leads-service"
import { logLeadSystemActivity } from "@/lib/sales/lead-activities-service"
import { getSubscriptionStatus } from "@/lib/subscriptions/check-subscription"

/**
 * POST /api/sales/quick-lead
 * สร้าง Lead อย่างรวดเร็วจากผลสแกน / วิเคราะห์ผิว (เช่น Quick Scan)
 * ใช้โดยทีมเซลหลังจากได้ผล AI แล้ว
 */
export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Role guard
    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const isGlobalAdmin = ["super_admin", "admin"].includes(userRow.role)
    if (!isGlobalAdmin) {
      if (!userRow.clinic_id) {
        return NextResponse.json({ error: "No clinic associated with user" }, { status: 400 })
      }

      const subStatus = await getSubscriptionStatus(userRow.clinic_id)
      if (!subStatus.isActive || subStatus.isTrialExpired) {
        const statusCode = subStatus.subscriptionStatus === 'past_due' || subStatus.isTrialExpired ? 402 : 403
        return NextResponse.json(
          {
            error: subStatus.message,
            subscription: {
              status: subStatus.subscriptionStatus,
              plan: subStatus.plan,
              isTrial: subStatus.isTrial,
              isTrialExpired: subStatus.isTrialExpired,
            },
          },
          { status: statusCode },
        )
      }
    }

    let body: any = null
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const name = body?.name
    const email = body?.email
    const phone = body?.phone
    const campaign = body?.campaign

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (phone && !/^[0-9-+() ]+$/.test(String(phone))) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 })
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(email))) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }
    }

    const requestedSource = body?.source ?? "quick_scan"
    const requestedStatus = body?.status ?? "cold"

    const mergedMetadata = {
      ...(body?.metadata || {}),
      ...(campaign ? { campaign } : {}),
    }

    const payload = {
      ...body,
      status: requestedStatus,
      source: requestedSource,
      metadata: mergedMetadata,
    }

    let newLead: any
    try {
      newLead = await createLead(user.id, userRow.clinic_id ?? null, payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes("lead_source") && message.includes("enum")) {
        const fallbackPayload = {
          ...payload,
          source: "other",
          metadata: {
            ...(payload?.metadata || {}),
            source_raw: requestedSource,
          },
        }
        newLead = await createLead(user.id, userRow.clinic_id ?? null, fallbackPayload)
      } else {
        throw error
      }
    }

    await logLeadSystemActivity(
      user.id,
      userRow.clinic_id ?? null,
      newLead.id,
      "Lead Created from Quick Scan",
      `Lead "${newLead.name}" was created from quick skin analysis`,
      {
        source: newLead.source,
        ...(newLead.source !== requestedSource ? { source_raw: requestedSource } : {}),
        from: "quick_lead",
        ...(campaign ? { campaign } : {}),
      },
    )

    return NextResponse.json({ data: newLead }, { status: 201 })
  } catch (error) {
    const status = (error as any)?.status
    const message = error instanceof Error ? error.message : "Failed to create quick lead"
    return NextResponse.json({ error: message }, { status: typeof status === "number" ? status : 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/quick-lead][POST] done", { durationMs: duration })
  }
}
