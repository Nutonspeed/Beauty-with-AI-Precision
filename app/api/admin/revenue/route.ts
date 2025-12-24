import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const clinicId = searchParams.get('clinicId')

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date range
    const now = new Date()
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }
    const daysBack = ranges[period as keyof typeof ranges] || 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysBack)

    // 1. Get subscription revenue
    let subscriptionQuery = supabase
      .from('clinic_subscriptions')
      .select(`
        *,
        clinics!inner(name, created_at),
        subscription_plans!inner(name, price_amount, billing_interval)
      `)
      .in('status', ['active', 'trial'])

    if (clinicId) {
      subscriptionQuery = subscriptionQuery.eq('clinic_id', clinicId)
    }

    const { data: subscriptions } = await subscriptionQuery

    // Calculate metrics
    let mrr = 0
    let arr = 0
    const revenueByPlan = new Map()
    const revenueByClinic = new Map()

    subscriptions?.forEach(sub => {
      const plan = sub.subscription_plans
      const monthlyAmount = plan.billing_interval === 'monthly' ? plan.price_amount :
                           plan.billing_interval === 'quarterly' ? plan.price_amount / 3 :
                           plan.price_amount / 12
      
      mrr += monthlyAmount
      arr += monthlyAmount * 12

      // Revenue by plan
      const planRevenue = revenueByPlan.get(plan.name) || { revenue: 0, count: 0 }
      planRevenue.revenue += monthlyAmount
      planRevenue.count += 1
      revenueByPlan.set(plan.name, planRevenue)

      // Revenue by clinic
      const clinicRevenue = revenueByClinic.get(sub.clinics.name) || { revenue: 0, mrr: 0 }
      clinicRevenue.revenue += monthlyAmount
      clinicRevenue.mrr += monthlyAmount
      revenueByClinic.set(sub.clinics.name, clinicRevenue)
    })

    // 2. Get payment transactions
    let paymentQuery = supabase
      .from('payments')
      .select(`
        *,
        clinics!inner(name)
      `)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())

    if (clinicId) {
      paymentQuery = paymentQuery.eq('clinic_id', clinicId)
    }

    const { data: payments } = await paymentQuery

    // Calculate total revenue from payments
    const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    // Payment methods distribution
    const paymentMethods = new Map()
    payments?.forEach(payment => {
      const method = payment.payment_method || 'unknown'
      const current = paymentMethods.get(method) || { count: 0, amount: 0 }
      current.count += 1
      current.amount += payment.amount || 0
      paymentMethods.set(method, current)
    })

    // 3. Revenue by month (last 12 months)
    const revenueByMonth = new Map()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7)
      revenueByMonth.set(monthKey, { month: date.toLocaleDateString('en', { month: 'short' }), revenue: 0, subscriptions: 0 })
    }

    // Group payments by month
    payments?.forEach(payment => {
      const monthKey = payment.created_at.slice(0, 7)
      const monthData = revenueByMonth.get(monthKey)
      if (monthData) {
        monthData.revenue += payment.amount || 0
      }
    })

    // Group subscriptions by month
    subscriptions?.forEach(sub => {
      const monthKey = sub.created_at.slice(0, 7)
      const monthData = revenueByMonth.get(monthKey)
      if (monthData) {
        monthData.subscriptions += 1
      }
    })

    // 4. Top transactions
    const topTransactions = payments?.slice(0, 20).map(payment => ({
      id: payment.id,
      clinic: payment.clinics.name,
      amount: payment.amount,
      date: payment.created_at,
      status: payment.status,
    })) || []

    // 5. Calculate churn rate
    const { data: cancelledSubscriptions } = await supabase
      .from('clinic_subscriptions')
      .select('id')
      .eq('status', 'cancelled')
      .gte('cancelled_at', startDate.toISOString())

    const totalSubscriptions = subscriptions?.length || 1
    const churnRate = ((cancelledSubscriptions?.length || 0) / totalSubscriptions) * 100

    // 6. Calculate LTV and CAC (simplified)
    const avgMonthlyRevenue = mrr / (subscriptions?.length || 1)
    const avgCustomerLifetime = 24 // months (assumed)
    const ltv = avgMonthlyRevenue * avgCustomerLifetime
    
    // CAC based on marketing expenses (simplified calculation)
    const marketingExpenses = 50000 // placeholder
    const newCustomers = subscriptions?.filter(s => 
      new Date(s.created_at) >= startDate
    ).length || 1
    const cac = marketingExpenses / newCustomers

    // 7. Growth calculations
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data: lastMonthPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonth.toISOString())

    const { data: thisMonthPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thisMonth.toISOString())

    const lastMonthRevenue = lastMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const thisMonthRevenue = thisMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    
    const monthlyGrowth = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0

    const lastYear = new Date(now.getFullYear() - 1, 0, 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)
    
    const { data: lastYearPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', lastYear.toISOString())
      .lt('created_at', thisYear.toISOString())

    const { data: thisYearPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thisYear.toISOString())

    const lastYearRevenue = lastYearPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const thisYearRevenue = thisYearPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    
    const yearlyGrowth = lastYearRevenue > 0 ? 
      ((thisYearRevenue - lastYearRevenue) / lastYearRevenue * 100) : 0

    // Compile response
    const revenueData = {
      totalRevenue,
      mrr,
      arr,
      growth: {
        monthly: monthlyGrowth,
        yearly: yearlyGrowth,
      },
      revenueByMonth: Array.from(revenueByMonth.values()),
      revenueByPlan: Array.from(revenueByPlan.entries()).map(([plan, data]) => ({
        plan,
        revenue: data.revenue,
        count: data.count,
      })),
      revenueByClinic: Array.from(revenueByClinic.entries()).map(([clinic, data]) => ({
        clinic,
        revenue: data.revenue,
        mrr: data.mrr,
      })),
      topTransactions,
      paymentMethods: Array.from(paymentMethods.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
      })),
      churnRate,
      ltv,
      cac,
    }

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
