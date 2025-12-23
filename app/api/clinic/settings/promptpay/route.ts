import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canManageClinicSettings } from "@/lib/auth/clinic-permissions"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()

    if (userErr || !userRow?.clinic_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Use canonical RBAC - only normalized roles allowed
    if (!canManageClinicSettings(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: clinic, error: clinicError } = await service
      .from("clinics")
      .select("id, promptpay_id, promptpay_type")
      .eq("id", userRow.clinic_id)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    return NextResponse.json({
      clinic_id: clinic.id,
      promptpay_id: clinic.promptpay_id,
      promptpay_type: clinic.promptpay_type,
    })
  } catch (e) {
    console.error("[API] GET /api/clinic/settings/promptpay error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()

    if (userErr || !userRow?.clinic_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Use canonical RBAC - only normalized roles allowed
    if (!canManageClinicSettings(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const promptpay_id = typeof body.promptpay_id === 'string' ? body.promptpay_id.trim() : null
    const promptpay_type = typeof body.promptpay_type === 'string' ? body.promptpay_type.trim() : null

    if (promptpay_id && !/^[0-9]{10,13}$/.test(promptpay_id.replace(/[^0-9]/g, ''))) {
      return NextResponse.json({ error: "promptpay_id must be 10 digits (mobile) or 13 digits (citizen_id)" }, { status: 400 })
    }

    if (promptpay_type && !['mobile', 'citizen_id'].includes(promptpay_type)) {
      return NextResponse.json({ error: "promptpay_type must be 'mobile' or 'citizen_id'" }, { status: 400 })
    }

    const updates: any = {
      promptpay_id,
      promptpay_type,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updErr } = await service
      .from("clinics")
      .update(updates)
      .eq("id", userRow.clinic_id)
      .select("id, promptpay_id, promptpay_type")
      .single()

    if (updErr || !updated) {
      return NextResponse.json({ error: "Failed to update clinic promptpay settings" }, { status: 500 })
    }

    return NextResponse.json({
      clinic_id: updated.id,
      promptpay_id: updated.promptpay_id,
      promptpay_type: updated.promptpay_type,
    })
  } catch (e) {
    console.error("[API] PUT /api/clinic/settings/promptpay error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
