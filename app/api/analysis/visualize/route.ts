import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withPublicAccess } from '@/lib/auth/middleware'
import { getAIServiceUrl } from '@/lib/config/ai'

export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    const AI_SERVICE_URL = getAIServiceUrl()
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    const id = body?.id || new URL(request.url).searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing analysis id' }, { status: 400 })
    }

    // Require authenticated user and ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: analysis, error } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    if (analysis.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch original image
    const imgRes = await fetch(analysis.image_url)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 })
    }
    const buffer = await imgRes.arrayBuffer()

    // Call AI visualization service
    const vizForm = new FormData()
    vizForm.append('file', new Blob([buffer], { type: imgRes.headers.get('content-type') || 'image/jpeg' }), 'image.jpg')

    const vizResponse = await fetch(
      `${AI_SERVICE_URL}/api/visualize/multi-mode?show_legend=true&show_stats=true&show_numbers=true&include_heatmap=true`,
      { method: 'POST', body: vizForm }
    )

    if (!vizResponse.ok) {
      const text = await vizResponse.text()
      return NextResponse.json({ error: 'Visualization service failed', details: text }, { status: 502 })
    }
    const vizBuffer = await vizResponse.arrayBuffer()

    // Upload to storage
    const filename = `${user.id}/${Date.now()}-visualization.png`
    const { error: uploadError } = await supabase.storage
      .from('skin-analysis-images')
      .upload(filename, vizBuffer, { contentType: 'image/png', cacheControl: '3600' })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload visualization' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('skin-analysis-images')
      .getPublicUrl(filename)

    await supabase
      .from('skin_analyses')
      .update({ visualization_url: publicUrl })
      .eq('id', id)

    return NextResponse.json({ success: true, visualization_url: publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })
