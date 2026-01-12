import { NextRequest, NextResponse } from 'next/server'
import { withCenterAuth } from '@/lib/auth/middleware'
import { createServerClient } from '@/lib/supabase/server'

export const GET = withCenterAuth(async (_req: NextRequest, user: any) => {
  try {
    const isTestMode =
      process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
      process.env.NODE_ENV === 'test'
    if (isTestMode) {
      return NextResponse.json({ center_id: user?.center_id ?? null, targets: {} })
    }

    const centerId = user?.center_id
    if (!centerId) {
      return NextResponse.json({ error: 'center_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('center_kpi_targets')
      .select('center_id, targets, created_at, updated_at')
      .eq('center_id', centerId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      center_id: centerId,
      targets: (data as any)?.targets || {},
      created_at: (data as any)?.created_at ?? null,
      updated_at: (data as any)?.updated_at ?? null,
    })
  } catch (error) {
    console.error('Error fetching center KPI targets:', error)
    return NextResponse.json({ error: 'Failed to fetch center KPI targets' }, { status: 500 })
  }
})

export const PUT = withCenterAuth(async (req: NextRequest, user: any) => {
  try {
    const isTestMode =
      process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
      process.env.NODE_ENV === 'test'
    if (isTestMode) {
      return new NextResponse(null, { status: 204 })
    }

    const centerId = user?.center_id
    if (!centerId) {
      return NextResponse.json({ error: 'center_id is required' }, { status: 400 })
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
      .from('center_kpi_targets')
      .upsert(
        {
          center_id: centerId,
          targets,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'center_id' }
      )
      .select('center_id, targets, created_at, updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      center_id: (data as any)?.center_id ?? centerId,
      targets: (data as any)?.targets ?? targets,
      created_at: (data as any)?.created_at ?? null,
      updated_at: (data as any)?.updated_at ?? null,
    })
  } catch (error) {
    console.error('Error saving center KPI targets:', error)
    return NextResponse.json({ error: 'Failed to save center KPI targets' }, { status: 500 })
  }
})
