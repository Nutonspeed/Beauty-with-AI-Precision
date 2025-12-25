'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Clock, DollarSign, Award, Target, Sparkles, Heart, Eye, Flame, Scissors, Brain, Calculator, MessageSquare, Camera, Wand2, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShimmerSkeleton } from '@/components/ui/modern-loader'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'

interface MetricBlock {
  today: number
  yesterday: number
  change: number
  target: number
}

interface SalesMetricsResponse {
  callsMade: MetricBlock
  leadsContacted: MetricBlock
  proposalsSent: MetricBlock
  conversionRate: MetricBlock
  revenueGenerated: MetricBlock
  aiLeads: MetricBlock
  aiProposals: MetricBlock
  aiBookings: MetricBlock
  aiBookingRevenue: MetricBlock
  remoteConsultRequests: MetricBlock
  remoteConsultConversion: MetricBlock
}

interface PeriodStats {
  scans: number
  revenue: number
}

interface TopPackage {
  name: string
  sold: number
  revenue: number
}

interface SalesOverviewResponse {
  today: PeriodStats
  thisWeek: PeriodStats
  thisMonth: PeriodStats
  topPackages: TopPackage[]
}

interface FunnelStage {
  name: string
  count: number
  value: number
}

interface ConversionRates {
  leadsToQualified: number
  qualifiedToProposals: number
  proposalsToWon: number
}

interface SalesFunnelResponse {
  range: string
  stages: FunnelStage[]
  conversionRates: ConversionRates
}

export default function SalesDashboard() {
  const router = useRouter()
  const lp = useLocalizePath()
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<SalesMetricsResponse | null>(null)
  const [overview, setOverview] = useState<SalesOverviewResponse | null>(null)
  const [funnel, setFunnel] = useState<SalesFunnelResponse | null>(null)
  const [range, setRange] = useState<'1d' | '7d' | '30d'>('7d')

  type ClinicSubscriptionStatus = {
    isActive: boolean
    isTrial: boolean
    isTrialExpired: boolean
    subscriptionStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'
    plan: string
    message: string
  }

  const [subscription, setSubscription] = useState<ClinicSubscriptionStatus | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  const canWrite = subscriptionLoading ? false : (subscription?.isActive ?? true)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        // Role/auth guard via API
        const roleRes = await fetch('/api/auth/check-role', { headers: { Accept: 'application/json' } })
        if (!roleRes.ok) {
          router.push(lp('/auth/login'))
          return
        }
        const roleData = await roleRes.json()
        if (!['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(roleData.role)) {
          router.push(lp('/unauthorized'))
          return
        }
        if (cancelled) return
        setIsCheckingRole(false)

        const qs = `?range=${range}`
        const [metricsRes, overviewRes, funnelRes] = await Promise.all([
          fetch(`/api/sales/metrics${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
          fetch(`/api/sales/overview${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
          fetch(`/api/sales/funnel${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
        ])

        if (!metricsRes.ok) {
          throw new Error(`Failed to load sales metrics: ${metricsRes.status}`)
        }
        if (!overviewRes.ok) {
          throw new Error(`Failed to load sales overview: ${overviewRes.status}`)
        }
        if (!funnelRes.ok) {
          throw new Error(`Failed to load sales funnel: ${funnelRes.status}`)
        }

        const metricsData: SalesMetricsResponse = await metricsRes.json()
        const overviewData: SalesOverviewResponse = await overviewRes.json()
        const funnelData: SalesFunnelResponse = await funnelRes.json()
        if (!cancelled) {
          setMetrics(metricsData)
          setOverview(overviewData)
          setFunnel(funnelData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Sales Dashboard Error:', error)
        if (!cancelled) {
          setError('Failed to load dashboard')
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [router, range, lp])

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true)
        const res = await fetch('/api/clinic/subscription-status')
        if (!res.ok) {
          setSubscription(null)
          return
        }
        const data = await res.json()
        setSubscription(data?.subscription || null)
      } catch {
        setSubscription(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const totalScansThisMonth = metrics?.leadsContacted.today ?? 0
  const revenueThisMonth = metrics?.revenueGenerated.today ?? 0
  const aiLeadsToday = metrics?.aiLeads.today ?? 0
  const aiProposalsToday = metrics?.aiProposals.today ?? 0
  const aiBookingsToday = metrics?.aiBookings.today ?? 0
  const aiBookingRevenueToday = metrics?.aiBookingRevenue.today ?? 0
  const remoteConsultRequestsToday = metrics?.remoteConsultRequests.today ?? 0

  if (isCheckingRole || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <ShimmerSkeleton className="h-8 w-48" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
            <ShimmerSkeleton className="h-10 w-32 rounded-lg" />
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4">
                  <ShimmerSkeleton className="h-4 w-20 mb-4" />
                  <ShimmerSkeleton className="h-8 w-16 mb-2" />
                  <ShimmerSkeleton className="h-3 w-24" />
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            <ShimmerSkeleton className="h-64 rounded-xl" />
            <ShimmerSkeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {!subscriptionLoading && subscription && !subscription.isActive ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-yellow-900">Subscription จำกัดการใช้งาน</div>
                <div className="text-sm text-yellow-800">{subscription.message}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your sales performance</p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!canWrite}
            onClick={() => {
              if (!canWrite) {
                return
              }
              router.push(lp('/sales/quick-scan'))
            }}
          >
            <Target className="w-5 h-5 mr-2" />
            Quick Scan
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScansThisMonth}</div>
              <p className="text-xs text-gray-600">
                +{metrics?.leadsContacted.today ?? 0} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Award className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.proposalsSent.today ?? 0}</div>
              <p className="text-xs text-gray-600">
                vs previous: {(metrics?.proposalsSent.change ?? 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics?.conversionRate.today ?? 0).toFixed(1)}%</div>
              <p className="text-xs text-gray-600">
                {(metrics?.conversionRate.change ?? 0).toFixed(1)}% change
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{(revenueThisMonth / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-gray-600">
                +฿{(metrics?.revenueGenerated.today ?? 0).toLocaleString()} today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Funnel (วันนี้ / ช่วง {range})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-700 font-semibold uppercase">AI Leads</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{aiLeadsToday}</p>
                <p className="text-[11px] text-purple-700 mt-1">บันทึกจาก AI Scan</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold uppercase">AI Proposals</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{aiProposalsToday}</p>
                <p className="text-[11px] text-blue-700 mt-1">สร้างจาก AI Recommendations</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-semibold uppercase">AI Bookings</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{aiBookingsToday}</p>
                <p className="text-[11px] text-green-700 mt-1">จองจาก Proposal ที่ AI สร้าง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remote Consult Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Remote Consult Requests (ช่วง {range})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-700">{remoteConsultRequestsToday}</p>
                <p className="text-xs text-gray-600 mt-1">คำขอจากลูกค้าที่กดขอปรึกษาออนไลน์</p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Conversion: {(metrics?.remoteConsultConversion.today ?? 0).toFixed(1)}% ของคำขอที่ปิดเป็นลูกค้า
                </p>
              </div>
              <Link href={lp('/sales/leads')}>
                <Button variant="outline" size="sm" className="text-xs">
                  ดูคิว Remote
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Sales Tools */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Sales Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={lp('/sales/quick-scan')}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-purple-100"
                >
                  <Camera className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-sm">Quick Scan</h4>
                  <p className="text-xs text-gray-500">วิเคราะห์ผิว AI</p>
                </motion.div>
              </Link>
              
              <Link href="/analysis/future">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-purple-100"
                >
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-sm">Future Predict</h4>
                  <p className="text-xs text-gray-500">ทำนาย 1-5 ปี</p>
                </motion.div>
              </Link>
              
              <Link href="/ar-simulator">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-purple-100"
                >
                  <Wand2 className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm">AR Simulator</h4>
                  <p className="text-xs text-gray-500">ดูผลก่อนรักษา</p>
                </motion.div>
              </Link>
              
              <Link href={lp('/sales/presentations')}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-purple-100"
                >
                  <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                  <h4 className="font-semibold text-sm">Presentations</h4>
                  <p className="text-xs text-gray-500">สร้างใบเสนอราคา</p>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{metrics?.leadsContacted.today ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{(metrics?.revenueGenerated.today ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{metrics?.leadsContacted.yesterday ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{(metrics?.revenueGenerated.yesterday ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{metrics?.leadsContacted.target ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{(metrics?.revenueGenerated.target ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(overview?.topPackages || []).map((pkg: TopPackage, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">#{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-600">{pkg.sold} packages sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ฿{pkg.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AR Tools Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AR Sales Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Horizontal scroll, Desktop: Grid */}
            <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
              <Link href={lp('/sales/ar-tools')} className="block flex-shrink-0 w-[140px] md:w-auto snap-start">
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/50 active:scale-95 transition-all text-center min-h-[100px] flex flex-col items-center justify-center">
                  <Heart className="w-7 h-7 md:w-8 md:h-8 text-pink-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Filler & Lips</p>
                </div>
              </Link>
              <Link href={lp('/sales/ar-tools')} className="block flex-shrink-0 w-[140px] md:w-auto snap-start">
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/50 active:scale-95 transition-all text-center min-h-[100px] flex flex-col items-center justify-center">
                  <Flame className="w-7 h-7 md:w-8 md:h-8 text-orange-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Body</p>
                </div>
              </Link>
              <Link href={lp('/sales/ar-tools')} className="block flex-shrink-0 w-[140px] md:w-auto snap-start">
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/50 active:scale-95 transition-all text-center min-h-[100px] flex flex-col items-center justify-center">
                  <Scissors className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Hair</p>
                </div>
              </Link>
              <Link href={lp('/sales/ar-tools')} className="block flex-shrink-0 w-[140px] md:w-auto snap-start">
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/50 active:scale-95 transition-all text-center min-h-[100px] flex flex-col items-center justify-center">
                  <Eye className="w-7 h-7 md:w-8 md:h-8 text-blue-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Eye</p>
                </div>
              </Link>
              <Link href={lp('/sales/ar-tools')} className="block flex-shrink-0 w-[140px] md:w-auto snap-start">
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 hover:border-purple-500/50 active:scale-95 transition-all text-center min-h-[100px] flex flex-col items-center justify-center">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-purple-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">All Tools</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Sales Tools Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="w-5 h-5" />
              AI Sales Tools
              <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">NEW</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={lp('/sales/tools')} className="block">
                <div className="p-4 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-center">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">AI Recommendations</p>
                  <p className="text-xs text-gray-500 mt-1">แนะนำ treatment</p>
                </div>
              </Link>
              <Link href={lp('/sales/tools')} className="block">
                <div className="p-4 rounded-xl bg-white border border-green-200 hover:border-green-400 hover:shadow-md transition-all text-center">
                  <Calculator className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Quick Quote</p>
                  <p className="text-xs text-gray-500 mt-1">ใบเสนอราคา</p>
                </div>
              </Link>
              <Link href={lp('/sales/tools')} className="block">
                <div className="p-4 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Conversion AI</p>
                  <p className="text-xs text-gray-500 mt-1">วิเคราะห์โอกาส</p>
                </div>
              </Link>
              <Link href={lp('/sales/tools')} className="block">
                <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all text-center">
                  <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Quick Message</p>
                  <p className="text-xs text-gray-500 mt-1">LINE/WhatsApp</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={lp('/sales/quick-scan')} className="block">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-gray-900">Quick Scan</h3>
                  <p className="text-sm text-gray-600 mt-1">Start new customer scan</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer" className="block">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-gray-900">Customers</h3>
                  <p className="text-sm text-gray-600 mt-1">View customer database</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={lp('/sales/tools')} className="block">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-gray-900">AI Tools</h3>
                  <p className="text-sm text-gray-600 mt-1">เครื่องมือ AI ทั้งหมด</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
