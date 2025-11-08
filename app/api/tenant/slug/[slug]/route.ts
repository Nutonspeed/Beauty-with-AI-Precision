import { type NextRequest, NextResponse } from 'next/server'
import { getTenantBySlug } from '@/lib/tenant/tenant-manager'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const tenant = await getTenantBySlug(slug)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Error fetching tenant by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
