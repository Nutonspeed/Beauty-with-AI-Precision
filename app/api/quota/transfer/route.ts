
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

    const { from_sales_user_id, to_sales_user_id, amount, type = 'analysis' } = await req.json()

    if (!from_sales_user_id || !to_sales_user_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    if (from_sales_user_id === to_sales_user_id) {
      return NextResponse.json({ error: 'Cannot transfer quota to self' }, { status: 400 })
    }

    const centerId = userData.center_id

    // 2. STRICT VALIDATION: Check if 'from' user has enough quota
    const usageType = type === 'ar' ? 'ar' : 'analysis'
    const { data: quotaCheck, error: checkError } = await supabase.rpc('check_sales_quota', {
      p_sales_user_id: from_sales_user_id,
      p_usage_type: usageType
    })

    if (checkError || !quotaCheck) {
      console.error('Source quota check failed:', checkError)
      return NextResponse.json({ error: 'Failed to verify source node quota' }, { status: 500 })
    }

    // If not unlimited and amount exceeds remaining
    if (!quotaCheck.is_unlimited && quotaCheck.remaining < amount) {
      return NextResponse.json({ 
        error: 'Insufficient quota', 
        message: `Source node only has ${quotaCheck.remaining} cycles available. Requested: ${amount}` 
      }, { status: 400 })
    }

    // 3. Record the transfer
    const addonType = type === 'ar' ? 'extra_ar' : 'extra_analyses'
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // Valid for current period

    // Check if 'from' user has enough quota (including base + addons - used)
    // This logic is complex for a simple API call, usually better in a DB function.
    // For now, let's assume the owner knows what they are doing, but we should ideally check.

    // Record the transfer
    const { error: transferError } = await supabase
      .from('sales_quota_addons')
      .insert([
        {
          center_id: centerId,
          sales_user_id: from_sales_user_id,
          addon_type: addonType,
          quantity: -amount, // Deduct
          valid_until: expiresAt.toISOString(),
          price_paid: 0,
          metadata: { transfer_to: to_sales_user_id, transfer_by: user.id }
        },
        {
          center_id: centerId,
          sales_user_id: to_sales_user_id,
          addon_type: addonType,
          quantity: amount, // Add
          valid_until: expiresAt.toISOString(),
          price_paid: 0,
          metadata: { transfer_from: from_sales_user_id, transfer_by: user.id }
        }
      ])

    if (transferError) {
      console.error('Transfer error:', transferError)
      return NextResponse.json({ error: 'Failed to record quota transfer' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Successfully transferred ${amount} ${type} quota` })

  } catch (error) {
    console.error('Quota Transfer API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
