
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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

    const { sales_user_ids, amount, type = 'analysis' } = await req.json()

    if (!sales_user_ids || !Array.isArray(sales_user_ids) || sales_user_ids.length === 0 || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const centerId = userData.center_id
    const addonType = type === 'ar' ? 'extra_ar' : 'extra_analyses'
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // Valid for current period

    // 2. Prepare bulk insert data
    const insertData = sales_user_ids.map(id => ({
      center_id: centerId,
      sales_user_id: id,
      addon_type: addonType,
      quantity: amount,
      valid_until: expiresAt.toISOString(),
      price_paid: 0,
      metadata: { bulk_allocation: true, allocated_by: user.id }
    }))

    // 3. Insert into sales_quota_addons
    const { error: allocationError } = await supabase
      .from('sales_quota_addons')
      .insert(insertData)

    if (allocationError) {
      console.error('Bulk allocation error:', allocationError)
      return NextResponse.json({ error: 'Failed to record bulk quota allocation' }, { status: 500 })
    }

    // 4. Send notifications to each staff member
    const notifications = sales_user_ids.map(id => ({
      user_id: id,
      type: 'success',
      title: 'Quota Boost Synchronized',
      message: `Neural node synchronization successful. You have been allocated an additional ${amount} ${type} cycles.`,
      metadata: { 
        amount, 
        type, 
        allocated_by: user.id,
        sync_type: 'bulk_allocation'
      }
    }))

    await supabase.from('notifications').insert(notifications)

    console.info(`[QuotaAPI] Bulk allocation successful: ${amount} ${type} to ${sales_user_ids.length} nodes by ${user.id}`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synchronized ${amount} ${type} cycles to ${sales_user_ids.length} staff nodes` 
    })

  } catch (error) {
    console.error('Bulk Quota Allocation API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
