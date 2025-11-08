// @ts-nocheck
"use client"

/**
 * Campaign List Component
 * 
 * Displays filterable list of marketing campaigns with actions.
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  MessageSquare,
  Bell,
  Plus,
  Search,
  Eye,
  Play,
  Pause,
  CheckCircle,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react"
import { useCampaigns } from "@/hooks/useMarketing"
import type { CampaignType, CampaignStatus } from "@/lib/marketing/campaign-manager"

interface CampaignListProps {
  onCreateCampaign?: () => void
  onViewCampaign?: (campaignId: string) => void
  onViewAnalytics?: (campaignId: string) => void
}

export default function CampaignList({
  onCreateCampaign,
  onViewCampaign,
  onViewAnalytics,
}: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<CampaignType | "all">("all")

  const filters = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(typeFilter !== "all" && { type: typeFilter }),
  }

  const { campaigns, loading, launchCampaign, pauseCampaign, completeCampaign } = useCampaigns(filters)

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCampaignIcon = (type: CampaignType) => {
    switch (type) {
      case "email":
        return Mail
      case "sms":
        return MessageSquare
      case "push":
        return Bell
      default:
        return Mail
    }
  }

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-purple-100 text-purple-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))

  const handleLaunch = async (campaignId: string) => {
    if (confirm("Are you sure you want to launch this campaign?")) {
      try {
        await launchCampaign(campaignId)
      } catch (error) {
        alert(`Failed to launch campaign: ${error}`)
      }
    }
  }

  const handlePause = async (campaignId: string) => {
    if (confirm("Are you sure you want to pause this campaign?")) {
      try {
        await pauseCampaign(campaignId)
      } catch (error) {
        alert(`Failed to pause campaign: ${error}`)
      }
    }
  }

  const handleComplete = async (campaignId: string) => {
    if (confirm("Are you sure you want to complete this campaign? This action cannot be undone.")) {
      try {
        await completeCampaign(campaignId)
      } catch (error) {
        alert(`Failed to complete campaign: ${error}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={`loading-${i}`}>
            <CardContent className="p-6">
              <div className="h-32 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and monitor your marketing campaigns
            </p>
          </div>
          {onCreateCampaign && (
            <Button onClick={onCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CampaignStatus | "all")}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CampaignType | "all")}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="multi-channel">Multi-Channel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">No campaigns found</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first campaign to get started"}
                </p>
              </div>
              {onCreateCampaign && !searchQuery && (
                <Button onClick={onCreateCampaign} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((campaign) => {
            const Icon = getCampaignIcon(campaign.type)
            const statusColor = getStatusColor(campaign.status)

            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {campaign.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={statusColor}>{campaign.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className="text-sm font-medium capitalize">{campaign.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Segment</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <p className="text-sm font-medium">{campaign.segment.customerCount.toLocaleString()}</p>
                      </div>
                    </div>
                    {campaign.startDate && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Start Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <p className="text-sm font-medium">{formatDate(campaign.startDate)}</p>
                        </div>
                      </div>
                    )}
                    {campaign.budget && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Budget</p>
                        <p className="text-sm font-medium">{formatCurrency(campaign.budget.estimated)}</p>
                      </div>
                    )}
                  </div>

                  {/* Goals Progress */}
                  {campaign.goals && campaign.goals.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Goals</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {campaign.goals.slice(0, 3).map((goal, index) => (
                          <div key={`goal-${campaign.id}-${goal.type}-${index}`} className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-3 h-3 text-blue-600" />
                            <span className="text-gray-600 capitalize">{goal.type}:</span>
                            <span className="font-medium">
                              {goal.achieved} / {goal.target}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {campaign.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleLaunch(campaign.id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Launch
                      </Button>
                    )}
                    {campaign.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePause(campaign.id)}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(campaign.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    {campaign.status === "paused" && (
                      <Button
                        size="sm"
                        onClick={() => handleLaunch(campaign.id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    {onViewAnalytics && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAnalytics(campaign.id)}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Analytics
                      </Button>
                    )}
                    {onViewCampaign && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewCampaign(campaign.id)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {filteredCampaigns.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCampaigns.length}</span> campaign
              {filteredCampaigns.length !== 1 && "s"}
              {(statusFilter !== "all" || typeFilter !== "all") && (
                <span>
                  {" "}
                  matching filters
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
