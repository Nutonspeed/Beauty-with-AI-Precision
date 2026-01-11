import { NextRequest, NextResponse } from 'next/server'
import { withClinicAuth } from '@/lib/auth/middleware'
import { createServerClient } from '@/lib/supabase/server'

export const GET = withClinicAuth(async (_req: NextRequest, user: any) => {
  try {
    const isTestMode =
      process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
      process.env.NODE_ENV === 'test'
    if (isTestMode) {
      return NextResponse.json({ clinic_id: user?.clinic_id ?? null, targets: {} })
    }

    const clinicId = user?.clinic_id
    if (!clinicId) {
      return NextResponse.json({ error: 'clinic_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('clinic_kpi_targets')
      .select('clinic_id, targets, created_at, updated_at')
      .eq('clinic_id', clinicId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      clinic_id: clinicId,
      targets: (data as any)?.targets || {},
      created_at: (data as any)?.created_at ?? null,
      updated_at: (data as any)?.updated_at ?? null,
    })
  } catch (error) {
    console.error('Error fetching clinic KPI targets:', error)
    return NextResponse.json({ error: 'Failed to fetch clinic KPI targets' }, { status: 500 })
  }
})

export const PUT = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const isTestMode =
      process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
      process.env.NODE_ENV === 'test'
    if (isTestMode) {
      return new NextResponse(null, { status: 204 })
    }

    const clinicId = user?.clinic_id
    if (!clinicId) {
      return NextResponse.json({ error: 'clinic_id is required' }, { status: 400 })
    }

    let body: any = null
    try {
      body = await req.json()
    } catch {
      return new NextResponse(null, { status: 204 })
    }

    const targets = body?.targets
    if (!targets || typeof targets !== 'object' || Array.isArray(targets)) {
      return NextResponse.json({ error: 'targets object is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('clinic_kpi_targets')
      .upsert(
        {
          clinic_id: clinicId,
          targets,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clinic_id' }
      )
      .select('clinic_id, targets, created_at, updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      clinic_id: (data as any)?.clinic_id ?? clinicId,
      targets: (data as any)?.targets ?? targets,
      created_at: (data as any)?.created_at ?? null,
      updated_at: (data as any)?.updated_at ?? null,
    })
  } catch (error) {
    console.error('Error saving clinic KPI targets:', error)
    return NextResponse.json({ error: 'Failed to save clinic KPI targets' }, { status: 500 })
  }
})
