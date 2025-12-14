import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

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
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const {
      name,
      email,
      phone,
      status = "cold",
      source = "quick_scan",
      concern,
      budget_min,
      budget_max,
      preferred_date,
      estimated_value,
      metadata,
      notes,
      tags,
      custom_fields,
      campaign,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Phone validation (optional)
    if (phone && !/^[0-9-+() ]+$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 })
    }

    // Email validation (optional; quick_scan ไม่บังคับ)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }
    }

    // คำนวณ score จาก metadata ของ AI ถ้ามี (โครงเหมือน /api/sales/leads)
    let computedScore: number = body.score || 0
    if (!computedScore && metadata) {
      try {
        const meta = metadata as any
        const estValue = estimated_value ?? meta.estimated_value ?? 0
        const concerns = meta.concerns || []
        const maxSeverity = Array.isArray(concerns) && concerns.length
          ? Math.max(...concerns.map((c: any) => Number(c.severity) || 0))
          : 0

        let score = 0
        score += Math.min(maxSeverity * 8, 40) // สูงสุด 40 จากความรุนแรง
        score += Math.min(Math.floor(estValue / 1000), 40) // สูงสุด 40 จากมูลค่า
        score += 20 // base score

        computedScore = Math.max(0, Math.min(score, 100))
      } catch {
        computedScore = 0
      }
    }

    const leadData = {
      sales_user_id: user.id,
      name,
      email: email || null,
      phone: phone || null,
      status,
      source,
      concern: concern || null,
      budget_min: budget_min ?? null,
      budget_max: budget_max ?? null,
      preferred_date: preferred_date || null,
      score: computedScore,
      notes: notes || null,
      tags: tags || [],
      custom_fields: custom_fields || {},
      metadata: {
        ...(metadata || {}),
        ...(campaign ? { campaign } : {}),
      },
    }

    const { data: newLead, error } = await supabase
      .from("sales_leads")
      .insert([leadData])
      .select(
        `*,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `,
      )
      .single()

    if (error) {
      console.error("Error creating quick lead:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from("sales_activities").insert([
      {
        lead_id: newLead.id,
        user_id: user.id,
        type: "note",
        title: "Lead Created from Quick Scan",
        description: `Lead "${name}" was created from quick skin analysis`,
        metadata: { source, from: "quick_lead", ...(campaign ? { campaign } : {}) },
      },
    ])

    return NextResponse.json({ data: newLead }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating quick lead:", error)
    return NextResponse.json(
      { error: "Failed to create quick lead", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/quick-lead][POST] done", { durationMs: duration })
  }
}
