import { NextResponse, NextRequest } from 'next/server'
import { getB2CPlans, getB2BPlans } from '@/lib/subscriptions/pricing-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'b2c' | 'b2b' | null

    let plans
    
    if (type === 'b2c') {
      plans = await getB2CPlans()
    } else if (type === 'b2b') {
      plans = await getB2BPlans()
    } else {
      // Return all plans with type distinction
      const [b2cPlans, b2bPlans] = await Promise.all([
        getB2CPlans(),
        getB2BPlans()
      ])
      plans = {
        b2c: b2cPlans,
        b2b: b2bPlans
      }
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}
