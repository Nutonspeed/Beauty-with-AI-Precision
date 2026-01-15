
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Check if the requester is center_owner or center_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, center_id')
      .eq('id', user.id)
      .single()

    if (!userData || !['center_owner', 'center_admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const centerId = userData.center_id

    // 2. Fetch transfer history from sales_quota_addons
    // We look for records that have transfer metadata
    const { data: history, error } = await supabase
      .from('sales_quota_addons')
      .select(`
        id,
        created_at,
        sales_user_id,
        addon_type,
        quantity,
        metadata,
        users!sales_user_id (id, full_name, email)
      `)
      .eq('center_id', centerId)
      .not('metadata', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transfer history:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    // 3. Process the data to group transfers (since each transfer creates two records: - and +)
    // For simplicity in UI, we can just return them all and let the UI handle or group by a unique transfer ID if we had one.
    // Since we don't have a unique transfer ID across both records yet, we'll return them as is.

    return NextResponse.json({
      success: true,
      history: (history || []).map(item => ({
        id: item.id,
        timestamp: item.created_at,
        userId: item.sales_user_id,
        userName: (item.users as any)?.full_name || 'Unknown Staff',
        userEmail: (item.users as any)?.email || 'unknown@center.com',
        type: item.addon_type.replace('extra_', ''),
        amount: Math.abs(Number(item.quantity)),
        direction: Number(item.quantity) > 0 ? 'in' : 'out',
        metadata: item.metadata
      }))
    })

  } catch (error) {
    console.error('Quota Transfer History API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
