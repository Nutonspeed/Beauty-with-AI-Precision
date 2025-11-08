"use client"

/**
 * Campaign Analytics Component
 * 
 * Comprehensive analytics dashboard for campaign performance metrics.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Mail,
  MousePointerClick,
  Eye,
  TrendingUp,
  Users,
  Target,
  Award,
} from "lucide-react"
import { useCampaignAnalytics } from "@/hooks/useMarketing"

interface CampaignAnalyticsProps {
  campaignId: string
}

export default function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const { analytics, loading } = useCampaignAnalytics(campaignId)

  if (loading || !analytics) {
    const skeletonKeys = ["sent", "delivery", "open", "click", "conversion", "revenue", "roi", "cost"]
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {skeletonKeys.map((key) => (
            <Card key={`skeleton-${key}`}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-100 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analytics.campaignName}</h2>
          <p className="text-sm text-gray-600 mt-1">Campaign Performance Analytics</p>
        </div>
        <Badge className={getStatusColor(analytics.status)}>{analytics.status}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sent */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{analytics.sent.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total messages delivered</p>
          </CardContent>
        </Card>

        {/* Delivery Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPercent(analytics.deliveryRate)}</span>
              {getTrendIcon(analytics.deliveryRate - 95)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.delivered.toLocaleString()} delivered
            </p>
          </CardContent>
        </Card>

        {/* Open Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPercent(analytics.openRate)}</span>
              {getTrendIcon(analytics.openRate - 20)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{analytics.opened.toLocaleString()} opened</p>
          </CardContent>
        </Card>

        {/* Click Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Click Rate</CardTitle>
              <MousePointerClick className="w-5 h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPercent(analytics.clickRate)}</span>
              {getTrendIcon(analytics.clickRate - 10)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{analytics.clicked.toLocaleString()} clicked</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion & Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{analytics.conversions.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercent(analytics.conversionRate)} conversion rate
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatCurrency(analytics.revenue)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(analytics.revenuePerRecipient)} per recipient
            </p>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPercent(analytics.roi)}</span>
              {getTrendIcon(analytics.roi)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Return on investment</p>
          </CardContent>
        </Card>

        {/* Cost per Conversion */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Cost/Conversion</CardTitle>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(analytics.costPerConversion)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Average acquisition cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      {analytics.goalProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Track campaign objectives and targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.goalProgress.map((goal) => {
              const getGoalStatusBadge = () => {
                if (goal.percentage >= 100) {
                  return <Badge className="bg-green-100 text-green-800 text-xs">Achieved ✓</Badge>
                }
                if (goal.percentage >= 75) {
                  return <Badge className="bg-blue-100 text-blue-800 text-xs">On Track</Badge>
                }
                return <Badge className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>
              }

              return (
                <div key={`goal-${goal.type}-${goal.target}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium capitalize">{goal.type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{goal.achieved.toLocaleString()}</span>
                      <span className="text-gray-400"> / {goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={Math.min(goal.percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatPercent(goal.percentage)} complete</span>
                      {getGoalStatusBadge()}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Visual representation of customer journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Sent */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sent</span>
                <span className="text-sm text-gray-600">{analytics.sent.toLocaleString()}</span>
              </div>
              <Progress value={100} className="h-3 bg-blue-100" />
            </div>

            {/* Delivered */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivered</span>
                <span className="text-sm text-gray-600">
                  {analytics.delivered.toLocaleString()} ({formatPercent(analytics.deliveryRate)})
                </span>
              </div>
              <Progress value={analytics.deliveryRate} className="h-3 bg-green-100" />
            </div>

            {/* Opened */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Opened</span>
                <span className="text-sm text-gray-600">
                  {analytics.opened.toLocaleString()} ({formatPercent(analytics.openRate)})
                </span>
              </div>
              <Progress
                value={(analytics.opened / analytics.sent) * 100}
                className="h-3 bg-purple-100"
              />
            </div>

            {/* Clicked */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clicked</span>
                <span className="text-sm text-gray-600">
                  {analytics.clicked.toLocaleString()} ({formatPercent(analytics.clickRate)})
                </span>
              </div>
              <Progress
                value={(analytics.clicked / analytics.sent) * 100}
                className="h-3 bg-orange-100"
              />
            </div>

            {/* Converted */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Converted</span>
                <span className="text-sm text-gray-600">
                  {analytics.conversions.toLocaleString()} (
                  {formatPercent(analytics.conversionRate)})
                </span>
              </div>
              <Progress
                value={(analytics.conversions / analytics.sent) * 100}
                className="h-3 bg-green-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Spending</CardTitle>
          <CardDescription>Campaign cost analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.spent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue Generated</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p
                className={`text-2xl font-bold ${
                  analytics.revenue - analytics.spent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(analytics.revenue - analytics.spent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
