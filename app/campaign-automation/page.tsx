// @ts-nocheck
"use client"

/**
 * Campaign Automation Demo Page
 * 
 * Comprehensive marketing automation and campaign management interface.
 * Phase 3 - Task 6: Marketing Automation & Campaign Management
 */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  BarChart3,
  Settings,
  Workflow,
  FileText,
  Target,
  Filter,
} from "lucide-react"
import CampaignList from "@/components/campaign-list"
import CampaignAnalytics from "@/components/campaign-analytics"
import SegmentBuilder from "@/components/segment-builder"
import ABTestResults from "@/components/ab-test-results"
import WorkflowBuilder from "@/components/workflow-builder"
import { useOverallAnalytics, useSegments, useWorkflows, useTemplates, useCampaigns } from "@/hooks/useMarketing"
import { CampaignManager } from "@/lib/marketing/campaign-manager"

export default function CampaignAutomationPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null)
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false)
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false)

  const { analytics: overallAnalytics, loading: analyticsLoading } = useOverallAnalytics()
  const { segments, createSegment, refresh: refreshSegments } = useSegments()
  const { workflows, createWorkflow, refresh: refreshWorkflows } = useWorkflows()
  const { templates } = useTemplates()
  const { campaigns } = useCampaigns()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  const handleSaveSegment = async (segmentData: {
    name: string
    description: string
    conditions: unknown[]
    operator: "AND" | "OR"
  }) => {
    try {
      await createSegment({
        name: segmentData.name,
        description: segmentData.description,
        conditions: segmentData.conditions,
        operator: segmentData.operator.toLowerCase() as "and" | "or",
        createdBy: "current-user", // TODO: Get from auth context
        createdByName: "Admin User" // TODO: Get from auth context
      })
      setShowSegmentBuilder(false)
      refreshSegments()
      alert("Segment created successfully!")
    } catch (error) {
      alert(`Failed to create segment: ${error}`)
    }
  }

  const handleSaveWorkflow = async (workflowData: Parameters<typeof createWorkflow>[0]) => {
    try {
      await createWorkflow(workflowData)
      setShowWorkflowBuilder(false)
      refreshWorkflows()
      alert("Workflow created successfully!")
    } catch (error) {
      alert(`Failed to create workflow: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Automation</h1>
          <p className="text-gray-600 mt-1">
            Advanced marketing automation, customer segmentation, and analytics
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Phase 3 - Task 6
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Mail className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Filter className="w-4 h-4 mr-2" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="ab-tests">
            <Target className="w-4 h-4 mr-2" />
            A/B Tests
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Card key={`loading-stat-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-100 animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Campaigns
                      </CardTitle>
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{overallAnalytics?.totalCampaigns || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {overallAnalytics?.activeCampaigns || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Messages Sent
                      </CardTitle>
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {overallAnalytics?.totalSent?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(overallAnalytics?.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">From marketing campaigns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Avg. ROI
                      </CardTitle>
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatPercent(overallAnalytics?.averageROI || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Return on investment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Overall campaign effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Average Open Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-purple-600">
                          {formatPercent(overallAnalytics?.averageOpenRate || 0)}
                        </p>
                        <Badge variant="outline" className="text-xs">Industry avg: 21.5%</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Average Click Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-600">
                          {formatPercent(overallAnalytics?.averageClickRate || 0)}
                        </p>
                        <Badge variant="outline" className="text-xs">Industry avg: 10.5%</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Average Conversion Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-green-600">
                          {formatPercent(overallAnalytics?.averageConversionRate || 0)}
                        </p>
                        <Badge variant="outline" className="text-xs">Industry avg: 2.9%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Segments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{segments.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Customer segments created</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{workflows.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Automation workflows active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{templates.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Message templates available</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {selectedCampaignId ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedCampaignId(null)}>
                ← Back to Campaigns
              </Button>
              <CampaignAnalytics campaignId={selectedCampaignId} />
            </div>
          ) : (
            <CampaignList
              onViewAnalytics={(id) => setSelectedCampaignId(id)}
              onCreateCampaign={() => alert("Campaign creation UI would open here")}
            />
          )}
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          {showSegmentBuilder ? (
            <div className="space-y-4">
              <SegmentBuilder
                onSave={handleSaveSegment}
                onCancel={() => setShowSegmentBuilder(false)}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Customer Segments</h2>
                <Button onClick={() => setShowSegmentBuilder(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Create Segment
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((segment) => (
                  <Card key={segment.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <CardDescription>{segment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <p className="text-2xl font-bold">
                          {segment.customerCount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">customers</p>
                      </div>
                      <Badge variant="outline" className="mt-3">
                        {segment.conditions.length} conditions ({segment.operator})
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          {showWorkflowBuilder ? (
            <div className="space-y-4">
              <WorkflowBuilder
                onSave={handleSaveWorkflow}
                onCancel={() => setShowWorkflowBuilder(false)}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Automation Workflows</h2>
                <Button onClick={() => setShowWorkflowBuilder(true)}>
                  <Workflow className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={workflow.active ? "default" : "outline"}>
                          {workflow.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Trigger:</span>
                        <span className="font-medium capitalize">{workflow.trigger}</span>
                        {workflow.event && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {workflow.event}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Steps:</span>
                        <span className="font-medium">{workflow.steps.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Executions:</span>
                        <span className="font-medium">{workflow.executionCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Message Templates</h2>
            <Button onClick={() => alert("Template creation UI would open here")}>
              <FileText className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">{template.type}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.category && (
                    <Badge className="capitalize">{template.category}</Badge>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Used {template.usageCount} times</span>
                    {template.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{template.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="ab-tests" className="space-y-6">
          {selectedTestId ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedTestId(null)}>
                ← Back to A/B Tests
              </Button>
              <ABTestResults
                testId={selectedTestId}
                onDeclareWinner={(winnerId) => {
                  alert(`Winner declared: ${winnerId}`)
                  setSelectedTestId(null)
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">A/B Tests</h2>
                <Button onClick={() => alert("A/B test creation UI would open here")}>
                  <Target className="w-4 h-4 mr-2" />
                  Create A/B Test
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {campaigns
                  .filter((c) => c.abTestId)
                  .map((campaign) => {
                    const manager = CampaignManager.getInstance()
                    const test = manager.getABTest(campaign.abTestId!)
                    if (!test) return null

                    return (
                      <Card key={campaign.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedTestId(test.id)}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{test.name}</CardTitle>
                            <Badge variant={test.status === "running" ? "default" : "outline"}>
                              {test.status}
                            </Badge>
                          </div>
                          <CardDescription>Testing {test.metric}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Variants:</span>
                              <span className="font-medium ml-1">{test.variants.length}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Sent:</span>
                              <span className="font-medium ml-1">
                                {test.variants.reduce((sum, v) => sum + v.sent, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
