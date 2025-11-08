/**
 * Campaign Manager
 * 
 * Comprehensive marketing automation system for managing campaigns,
 * customer segmentation, email/SMS automation, and ROI tracking.
 */

// ==================== Type Definitions ====================

export type CampaignType = "email" | "sms" | "push" | "multi-channel"
export type CampaignStatus = "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled"
export type SegmentOperator = "and" | "or"
export type ConditionOperator = "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in"
export type TriggerType = "immediate" | "scheduled" | "event-based" | "behavioral"
export type EventType = "signup" | "purchase" | "booking" | "treatment_complete" | "birthday" | "anniversary" | "abandoned_cart" | "inactivity"
export type MessageStatus = "pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
export type ABTestStatus = "draft" | "running" | "completed" | "cancelled"

// ==================== Core Interfaces ====================

export interface Campaign {
  id: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus
  segmentId: string
  segmentName: string
  triggerType: TriggerType
  eventType?: EventType
  scheduledDate?: Date
  startDate?: Date
  endDate?: Date
  budget?: number
  actualSpent: number
  targetAudience: number
  reached: number
  goals: CampaignGoal[]
  messages: CampaignMessage[]
  abTest?: ABTest
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

export interface CampaignGoal {
  id: string
  type: "clicks" | "conversions" | "revenue" | "bookings" | "engagement"
  target: number
  achieved: number
  value?: number // For revenue goals
}

export interface CampaignMessage {
  id: string
  campaignId: string
  type: CampaignType
  variant?: string // For A/B testing: "A", "B", etc.
  subject?: string // For email
  body: string
  htmlBody?: string
  from?: string
  replyTo?: string
  attachments?: MessageAttachment[]
  cta?: CallToAction
  createdAt: Date
}

export interface MessageAttachment {
  filename: string
  url: string
  mimeType: string
  size: number
}

export interface CallToAction {
  text: string
  url: string
  trackingParams?: Record<string, string>
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  operator: SegmentOperator
  conditions: SegmentCondition[]
  customerCount: number
  lastUpdated: Date
  createdBy: string
  createdByName: string
  createdAt: Date
}

export interface SegmentCondition {
  id: string
  field: string
  operator: ConditionOperator
  value: any
  label: string
}

export interface MessageLog {
  id: string
  campaignId: string
  messageId: string
  customerId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  status: MessageStatus
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bouncedAt?: Date
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface ABTest {
  id: string
  campaignId: string
  name: string
  description: string
  status: ABTestStatus
  variants: ABTestVariant[]
  trafficSplit: number[] // Percentage split for each variant
  startDate?: Date
  endDate?: Date
  winningVariant?: string
  confidenceLevel?: number
  createdAt: Date
}

export interface ABTestVariant {
  id: string
  name: string
  messageId: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  conversions: number
  revenue: number
  openRate: number
  clickRate: number
  conversionRate: number
}

export interface CampaignAnalytics {
  campaignId: string
  campaignName: string
  type: CampaignType
  status: CampaignStatus
  sent: number
  delivered: number
  opened: number
  clicked: number
  conversions: number
  revenue: number
  spent: number
  roi: number
  deliveryRate: number
  openRate: number
  clickRate: number
  conversionRate: number
  revenuePerRecipient: number
  costPerConversion: number
  goalProgress: Array<{
    type: string
    target: number
    achieved: number
    percentage: number
  }>
}

export interface AutomationWorkflow {
  id: string
  name: string
  description: string
  triggerType: TriggerType
  eventType?: EventType
  status: "active" | "paused" | "draft"
  steps: WorkflowStep[]
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  type: "send_email" | "send_sms" | "wait" | "condition" | "tag" | "update_field"
  name: string
  config: Record<string, any>
  order: number
  nextSteps?: string[] // IDs of next steps
}

export interface TemplateLibrary {
  id: string
  name: string
  description: string
  type: CampaignType
  category: string
  subject?: string
  body: string
  htmlBody?: string
  thumbnailUrl?: string
  usageCount: number
  rating: number
  tags: string[]
  createdBy: string
  createdAt: Date
}

// ==================== Filters ====================

export interface CampaignFilters {
  status?: CampaignStatus
  type?: CampaignType
  createdBy?: string
  startDateFrom?: Date
  startDateTo?: Date
  segmentId?: string
}

export interface MessageLogFilters {
  campaignId?: string
  customerId?: string
  status?: MessageStatus
  sentFrom?: Date
  sentTo?: Date
}

// ==================== Campaign Manager Class ====================

class CampaignManager {
  private static instance: CampaignManager
  private campaigns = new Map<string, Campaign>()
  private segments = new Map<string, CustomerSegment>()
  private messageLogs = new Map<string, MessageLog>()
  private abTests = new Map<string, ABTest>()
  private workflows = new Map<string, AutomationWorkflow>()
  private templates = new Map<string, TemplateLibrary>()

  private constructor() {
    this.initializeSampleData()
  }

  public static getInstance(): CampaignManager {
    if (!CampaignManager.instance) {
      CampaignManager.instance = new CampaignManager()
    }
    return CampaignManager.instance
  }

  // ==================== Campaign Management ====================

  createCampaign(data: Omit<Campaign, "id" | "reached" | "actualSpent" | "createdAt" | "updatedAt">): Campaign {
    const campaign: Campaign = {
      ...data,
      id: `CMP${Date.now()}`,
      reached: 0,
      actualSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.campaigns.set(campaign.id, campaign)
    return campaign
  }

  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id)
  }

  getAllCampaigns(filters?: CampaignFilters): Campaign[] {
    let campaigns = Array.from(this.campaigns.values())

    if (filters) {
      if (filters.status) {
        campaigns = campaigns.filter((c) => c.status === filters.status)
      }
      if (filters.type) {
        campaigns = campaigns.filter((c) => c.type === filters.type)
      }
      if (filters.createdBy) {
        campaigns = campaigns.filter((c) => c.createdBy === filters.createdBy)
      }
      if (filters.startDateFrom) {
        campaigns = campaigns.filter((c) => c.startDate && c.startDate >= filters.startDateFrom!)
      }
      if (filters.startDateTo) {
        campaigns = campaigns.filter((c) => c.startDate && c.startDate <= filters.startDateTo!)
      }
      if (filters.segmentId) {
        campaigns = campaigns.filter((c) => c.segmentId === filters.segmentId)
      }
    }

    return campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign {
    const campaign = this.campaigns.get(id)
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`)
    }

    const updated = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
    }
    this.campaigns.set(id, updated)
    return updated
  }

  deleteCampaign(id: string): boolean {
    return this.campaigns.delete(id)
  }

  launchCampaign(id: string): Campaign {
    const campaign = this.campaigns.get(id)
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`)
    }

    const updated = {
      ...campaign,
      status: "active" as CampaignStatus,
      startDate: new Date(),
      updatedAt: new Date(),
    }
    this.campaigns.set(id, updated)

    // Simulate sending messages
    this.sendCampaignMessages(id)

    return updated
  }

  pauseCampaign(id: string): Campaign {
    return this.updateCampaign(id, { status: "paused" })
  }

  completeCampaign(id: string): Campaign {
    return this.updateCampaign(id, { status: "completed", endDate: new Date() })
  }

  // ==================== Segment Management ====================

  createSegment(data: Omit<CustomerSegment, "id" | "customerCount" | "lastUpdated" | "createdAt">): CustomerSegment {
    const segment: CustomerSegment = {
      ...data,
      id: `SEG${Date.now()}`,
      customerCount: this.calculateSegmentSize(data.conditions, data.operator),
      lastUpdated: new Date(),
      createdAt: new Date(),
    }
    this.segments.set(segment.id, segment)
    return segment
  }

  getSegment(id: string): CustomerSegment | undefined {
    return this.segments.get(id)
  }

  getAllSegments(): CustomerSegment[] {
    return Array.from(this.segments.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  updateSegment(id: string, updates: Partial<CustomerSegment>): CustomerSegment {
    const segment = this.segments.get(id)
    if (!segment) {
      throw new Error(`Segment ${id} not found`)
    }

    const updated = {
      ...segment,
      ...updates,
      lastUpdated: new Date(),
    }

    // Recalculate customer count if conditions changed
    if (updates.conditions || updates.operator) {
      updated.customerCount = this.calculateSegmentSize(updated.conditions, updated.operator)
    }

    this.segments.set(id, updated)
    return updated
  }

  deleteSegment(id: string): boolean {
    return this.segments.delete(id)
  }

  private calculateSegmentSize(conditions: SegmentCondition[], operator: SegmentOperator): number {
    // In real implementation, this would query the database
    // For demo, return simulated count based on conditions
    const baseCount = 1000
    const reduction = conditions.length * 0.3
    return Math.floor(baseCount * (1 - reduction))
  }

  // ==================== Message Log Management ====================

  logMessage(data: Omit<MessageLog, "id">): MessageLog {
    const log: MessageLog = {
      ...data,
      id: `LOG${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    }
    this.messageLogs.set(log.id, log)
    return log
  }

  getMessageLog(id: string): MessageLog | undefined {
    return this.messageLogs.get(id)
  }

  getMessageLogs(filters?: MessageLogFilters): MessageLog[] {
    let logs = Array.from(this.messageLogs.values())

    if (filters) {
      if (filters.campaignId) {
        logs = logs.filter((l) => l.campaignId === filters.campaignId)
      }
      if (filters.customerId) {
        logs = logs.filter((l) => l.customerId === filters.customerId)
      }
      if (filters.status) {
        logs = logs.filter((l) => l.status === filters.status)
      }
      if (filters.sentFrom && logs.length > 0) {
        logs = logs.filter((l) => l.sentAt && l.sentAt >= filters.sentFrom!)
      }
      if (filters.sentTo && logs.length > 0) {
        logs = logs.filter((l) => l.sentAt && l.sentAt <= filters.sentTo!)
      }
    }

    return logs.sort((a, b) => {
      const aDate = a.sentAt || new Date(0)
      const bDate = b.sentAt || new Date(0)
      return bDate.getTime() - aDate.getTime()
    })
  }

  updateMessageStatus(id: string, status: MessageStatus, timestamp?: Date): MessageLog {
    const log = this.messageLogs.get(id)
    if (!log) {
      throw new Error(`Message log ${id} not found`)
    }

    const updated = { ...log, status }
    const now = timestamp || new Date()

    switch (status) {
      case "sent":
        updated.sentAt = now
        break
      case "delivered":
        updated.deliveredAt = now
        break
      case "opened":
        updated.openedAt = now
        break
      case "clicked":
        updated.clickedAt = now
        break
      case "bounced":
        updated.bouncedAt = now
        break
    }

    this.messageLogs.set(id, updated)
    return updated
  }

  // ==================== A/B Testing ====================

  createABTest(data: Omit<ABTest, "id" | "createdAt">): ABTest {
    const abTest: ABTest = {
      ...data,
      id: `ABT${Date.now()}`,
      createdAt: new Date(),
    }
    this.abTests.set(abTest.id, abTest)
    return abTest
  }

  getABTest(id: string): ABTest | undefined {
    return this.abTests.get(id)
  }

  updateABTest(id: string, updates: Partial<ABTest>): ABTest {
    const abTest = this.abTests.get(id)
    if (!abTest) {
      throw new Error(`A/B Test ${id} not found`)
    }

    const updated = { ...abTest, ...updates }
    this.abTests.set(id, updated)
    return updated
  }

  calculateABTestWinner(id: string): ABTest {
    const abTest = this.abTests.get(id)
    if (!abTest) {
      throw new Error(`A/B Test ${id} not found`)
    }

    // Find variant with highest conversion rate
    const winner = abTest.variants.reduce((prev, current) =>
      current.conversionRate > prev.conversionRate ? current : prev
    )

    const updated = {
      ...abTest,
      status: "completed" as ABTestStatus,
      winningVariant: winner.id,
      confidenceLevel: this.calculateConfidence(abTest.variants),
      endDate: new Date(),
    }

    this.abTests.set(id, updated)
    return updated
  }

  private calculateConfidence(variants: ABTestVariant[]): number {
    // Simplified confidence calculation
    // In real implementation, use proper statistical methods
    if (variants.length < 2) return 0

    const totalSent = variants.reduce((sum, v) => sum + v.sent, 0)
    if (totalSent < 100) return 0 // Not enough data

    const rates = variants.map((v) => v.conversionRate)
    const max = Math.max(...rates)
    const min = Math.min(...rates)
    const diff = max - min

    // Confidence based on difference and sample size
    const sampleFactor = Math.min(totalSent / 1000, 1)
    return Math.min(diff * 100 * sampleFactor, 99)
  }

  // ==================== Analytics ====================

  getCampaignAnalytics(id: string): CampaignAnalytics {
    const campaign = this.campaigns.get(id)
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`)
    }

    const logs = this.getMessageLogs({ campaignId: id })

    const sent = logs.length
    const delivered = logs.filter((l) => l.status === "delivered" || l.status === "opened" || l.status === "clicked").length
    const opened = logs.filter((l) => l.status === "opened" || l.status === "clicked").length
    const clicked = logs.filter((l) => l.status === "clicked").length
    const conversions = campaign.goals.find((g) => g.type === "conversions")?.achieved || 0
    const revenue = campaign.goals.find((g) => g.type === "revenue")?.achieved || 0

    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0
    const conversionRate = clicked > 0 ? (conversions / clicked) * 100 : 0
    const revenuePerRecipient = sent > 0 ? revenue / sent : 0
    const costPerConversion = conversions > 0 ? campaign.actualSpent / conversions : 0
    const roi = campaign.actualSpent > 0 ? ((revenue - campaign.actualSpent) / campaign.actualSpent) * 100 : 0

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      type: campaign.type,
      status: campaign.status,
      sent,
      delivered,
      opened,
      clicked,
      conversions,
      revenue,
      spent: campaign.actualSpent,
      roi,
      deliveryRate,
      openRate,
      clickRate,
      conversionRate,
      revenuePerRecipient,
      costPerConversion,
      goalProgress: campaign.goals.map((g) => ({
        type: g.type,
        target: g.target,
        achieved: g.achieved,
        percentage: g.target > 0 ? (g.achieved / g.target) * 100 : 0,
      })),
    }
  }

  getOverallAnalytics(): {
    totalCampaigns: number
    activeCampaigns: number
    totalSent: number
    totalRevenue: number
    averageOpenRate: number
    averageClickRate: number
    averageROI: number
  } {
    const campaigns = Array.from(this.campaigns.values())
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length

    let totalSent = 0
    let totalRevenue = 0
    let totalOpenRate = 0
    let totalClickRate = 0
    let totalROI = 0

    campaigns.forEach((campaign) => {
      const analytics = this.getCampaignAnalytics(campaign.id)
      totalSent += analytics.sent
      totalRevenue += analytics.revenue
      totalOpenRate += analytics.openRate
      totalClickRate += analytics.clickRate
      totalROI += analytics.roi
    })

    const avgOpenRate = campaigns.length > 0 ? totalOpenRate / campaigns.length : 0
    const avgClickRate = campaigns.length > 0 ? totalClickRate / campaigns.length : 0
    const avgROI = campaigns.length > 0 ? totalROI / campaigns.length : 0

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalSent,
      totalRevenue,
      averageOpenRate: avgOpenRate,
      averageClickRate: avgClickRate,
      averageROI: avgROI,
    }
  }

  // ==================== Automation Workflows ====================

  createWorkflow(data: Omit<AutomationWorkflow, "id" | "totalExecutions" | "successfulExecutions" | "failedExecutions" | "createdAt" | "updatedAt">): AutomationWorkflow {
    const workflow: AutomationWorkflow = {
      ...data,
      id: `WF${Date.now()}`,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.workflows.set(workflow.id, workflow)
    return workflow
  }

  getWorkflow(id: string): AutomationWorkflow | undefined {
    return this.workflows.get(id)
  }

  getAllWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  updateWorkflow(id: string, updates: Partial<AutomationWorkflow>): AutomationWorkflow {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }

    const updated = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    }
    this.workflows.set(id, updated)
    return updated
  }

  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id)
  }

  // ==================== Template Library ====================

  createTemplate(data: Omit<TemplateLibrary, "id" | "usageCount" | "rating" | "createdAt">): TemplateLibrary {
    const template: TemplateLibrary = {
      ...data,
      id: `TPL${Date.now()}`,
      usageCount: 0,
      rating: 0,
      createdAt: new Date(),
    }
    this.templates.set(template.id, template)
    return template
  }

  getTemplate(id: string): TemplateLibrary | undefined {
    return this.templates.get(id)
  }

  getAllTemplates(filters?: { type?: CampaignType; category?: string }): TemplateLibrary[] {
    let templates = Array.from(this.templates.values())

    if (filters) {
      if (filters.type) {
        templates = templates.filter((t) => t.type === filters.type)
      }
      if (filters.category) {
        templates = templates.filter((t) => t.category === filters.category)
      }
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount)
  }

  incrementTemplateUsage(id: string): TemplateLibrary {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template ${id} not found`)
    }

    const updated = {
      ...template,
      usageCount: template.usageCount + 1,
    }
    this.templates.set(id, updated)
    return updated
  }

  // ==================== Helper Methods ====================

  private sendCampaignMessages(campaignId: string): void {
    const campaign = this.campaigns.get(campaignId)
    if (!campaign) return

    const segment = this.segments.get(campaign.segmentId)
    if (!segment) return

    // Simulate sending messages to segment customers
    const customerCount = segment.customerCount
    const message = campaign.messages[0]

    for (let i = 0; i < Math.min(customerCount, 10); i++) {
      // Limit to 10 for demo
      this.logMessage({
        campaignId: campaign.id,
        messageId: message.id,
        customerId: `CUST${i + 1}`,
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        status: "sent",
        sentAt: new Date(),
      })
    }

    // Update campaign reached count
    this.updateCampaign(campaignId, {
      reached: customerCount,
      actualSpent: (campaign.budget || 0) * 0.8, // Simulate 80% of budget spent
    })
  }

  // ==================== Sample Data ====================

  private initializeSampleData(): void {
    // Create sample segments
    const segment1 = this.createSegment({
      name: "VIP Customers",
      description: "High-value customers with 5+ treatments",
      operator: "and",
      conditions: [
        {
          id: "C1",
          field: "totalTreatments",
          operator: "greater_than",
          value: 5,
          label: "Total Treatments > 5",
        },
        {
          id: "C2",
          field: "totalSpent",
          operator: "greater_than",
          value: 50000,
          label: "Total Spent > 50,000 THB",
        },
      ],
      createdBy: "MKT001",
      createdByName: "Marketing Team",
    })

    const segment2 = this.createSegment({
      name: "New Customers",
      description: "Customers who signed up in the last 30 days",
      operator: "and",
      conditions: [
        {
          id: "C1",
          field: "signupDate",
          operator: "greater_than",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          label: "Signup Date < 30 days ago",
        },
        {
          id: "C2",
          field: "totalTreatments",
          operator: "equals",
          value: 0,
          label: "Total Treatments = 0",
        },
      ],
      createdBy: "MKT001",
      createdByName: "Marketing Team",
    })

    const segment3 = this.createSegment({
      name: "Inactive Customers",
      description: "Customers with no activity in 90+ days",
      operator: "and",
      conditions: [
        {
          id: "C1",
          field: "lastActivity",
          operator: "less_than",
          value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          label: "Last Activity > 90 days ago",
        },
        {
          id: "C2",
          field: "totalTreatments",
          operator: "greater_than",
          value: 0,
          label: "Total Treatments > 0",
        },
      ],
      createdBy: "MKT001",
      createdByName: "Marketing Team",
    })

    // Create sample templates
    this.createTemplate({
      name: "Welcome Email",
      description: "Welcome new customers and introduce our services",
      type: "email",
      category: "onboarding",
      subject: "Welcome to Beauty Clinic! 🌟",
      body: "Dear {{firstName}},\n\nWelcome to our clinic family! We're excited to have you...",
      htmlBody: "<h1>Welcome {{firstName}}!</h1><p>We're excited to have you...</p>",
      thumbnailUrl: "/templates/welcome-email.jpg",
      tags: ["welcome", "onboarding", "new-customer"],
      createdBy: "MKT001",
    })

    this.createTemplate({
      name: "Treatment Reminder",
      description: "Remind customers about upcoming appointments",
      type: "sms",
      category: "reminder",
      body: "Hi {{firstName}}, this is a reminder about your {{treatmentName}} appointment on {{date}} at {{time}}. See you soon!",
      tags: ["reminder", "appointment", "treatment"],
      createdBy: "MKT001",
    })

    this.createTemplate({
      name: "Birthday Promotion",
      description: "Send birthday wishes with special offer",
      type: "email",
      category: "promotion",
      subject: "Happy Birthday {{firstName}}! 🎉 Special Gift Inside",
      body: "Happy Birthday! Celebrate with 20% off any treatment this month...",
      htmlBody: "<div class='birthday-card'><h1>Happy Birthday {{firstName}}!</h1>...</div>",
      tags: ["birthday", "promotion", "discount"],
      createdBy: "MKT001",
    })

    // Create sample campaign
    const message1: CampaignMessage = {
      id: "MSG1",
      campaignId: "",
      type: "email",
      subject: "Exclusive Offer: 30% Off Laser Treatments",
      body: "Dear VIP Customer,\n\nAs one of our most valued clients, we're offering you an exclusive 30% discount on all laser treatments this month...",
      htmlBody: "<h2>Exclusive VIP Offer</h2><p>30% OFF Laser Treatments</p>...",
      from: "marketing@beautyclinic.com",
      replyTo: "support@beautyclinic.com",
      cta: {
        text: "Book Now",
        url: "https://beautyclinic.com/book",
        trackingParams: { campaign: "vip-laser-2024", source: "email" },
      },
      createdAt: new Date(),
    }

    const campaign1 = this.createCampaign({
      name: "VIP Laser Treatment Promotion",
      description: "Exclusive 30% discount for VIP customers on laser treatments",
      type: "email",
      status: "active",
      segmentId: segment1.id,
      segmentName: segment1.name,
      triggerType: "immediate",
      scheduledDate: new Date(),
      startDate: new Date(),
      budget: 50000,
      targetAudience: segment1.customerCount,
      goals: [
        {
          id: "G1",
          type: "clicks",
          target: 100,
          achieved: 45,
        },
        {
          id: "G2",
          type: "conversions",
          target: 30,
          achieved: 12,
        },
        {
          id: "G3",
          type: "revenue",
          target: 300000,
          achieved: 120000,
          value: 120000,
        },
      ],
      messages: [{ ...message1, campaignId: "" }],
      createdBy: "MKT001",
      createdByName: "Sarah Marketing",
    })

    campaign1.messages[0].campaignId = campaign1.id

    // Create sample A/B test campaign
    const messageA: CampaignMessage = {
      id: "MSGA",
      campaignId: "",
      type: "email",
      variant: "A",
      subject: "New Customer Special: First Treatment 50% Off",
      body: "Welcome! Get 50% off your first treatment...",
      cta: {
        text: "Claim Offer",
        url: "https://beautyclinic.com/first-time",
      },
      createdAt: new Date(),
    }

    const messageB: CampaignMessage = {
      id: "MSGB",
      campaignId: "",
      type: "email",
      variant: "B",
      subject: "Welcome Gift: 50% Off Your First Visit!",
      body: "Welcome! Start your beauty journey with 50% off...",
      cta: {
        text: "Get Started",
        url: "https://beautyclinic.com/first-time",
      },
      createdAt: new Date(),
    }

    const campaign2 = this.createCampaign({
      name: "New Customer Welcome Campaign",
      description: "A/B test for new customer onboarding emails",
      type: "email",
      status: "active",
      segmentId: segment2.id,
      segmentName: segment2.name,
      triggerType: "event-based",
      eventType: "signup",
      budget: 30000,
      targetAudience: segment2.customerCount,
      goals: [
        {
          id: "G1",
          type: "clicks",
          target: 200,
          achieved: 89,
        },
        {
          id: "G2",
          type: "conversions",
          target: 50,
          achieved: 23,
        },
      ],
      messages: [messageA, messageB],
      createdBy: "MKT001",
      createdByName: "Sarah Marketing",
    })

    campaign2.messages[0].campaignId = campaign2.id
    campaign2.messages[1].campaignId = campaign2.id

    // Create A/B test
    const abTest = this.createABTest({
      campaignId: campaign2.id,
      name: "Subject Line Test",
      description: "Test which subject line performs better",
      status: "running",
      variants: [
        {
          id: "A",
          name: "Variant A - Direct Offer",
          messageId: messageA.id,
          sent: 350,
          delivered: 340,
          opened: 170,
          clicked: 51,
          conversions: 13,
          revenue: 65000,
          openRate: 50,
          clickRate: 30,
          conversionRate: 25.5,
        },
        {
          id: "B",
          name: "Variant B - Welcome Focus",
          messageId: messageB.id,
          sent: 350,
          delivered: 338,
          opened: 189,
          clicked: 60,
          conversions: 18,
          revenue: 90000,
          openRate: 55.9,
          clickRate: 31.7,
          conversionRate: 30,
        },
      ],
      trafficSplit: [50, 50],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    })

    campaign2.abTest = abTest

    // Create win-back campaign
    const message3: CampaignMessage = {
      id: "MSG3",
      campaignId: "",
      type: "email",
      subject: "We Miss You! Come Back for 40% Off",
      body: "It's been a while! We'd love to see you again. Enjoy 40% off your next treatment...",
      cta: {
        text: "Redeem Offer",
        url: "https://beautyclinic.com/winback",
      },
      createdAt: new Date(),
    }

    this.createCampaign({
      name: "Win-Back Campaign - Inactive Customers",
      description: "Re-engage customers who haven't visited in 90+ days",
      type: "email",
      status: "scheduled",
      segmentId: segment3.id,
      segmentName: segment3.name,
      triggerType: "scheduled",
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      budget: 40000,
      targetAudience: segment3.customerCount,
      goals: [
        {
          id: "G1",
          type: "clicks",
          target: 80,
          achieved: 0,
        },
        {
          id: "G2",
          type: "conversions",
          target: 20,
          achieved: 0,
        },
        {
          id: "G3",
          type: "revenue",
          target: 200000,
          achieved: 0,
          value: 0,
        },
      ],
      messages: [message3],
      createdBy: "MKT001",
      createdByName: "Sarah Marketing",
    })

    // Create sample automation workflow
    this.createWorkflow({
      name: "Post-Treatment Follow-up",
      description: "Automated follow-up sequence after treatment completion",
      triggerType: "event-based",
      eventType: "treatment_complete",
      status: "active",
      steps: [
        {
          id: "S1",
          type: "wait",
          name: "Wait 24 hours",
          config: { duration: 24, unit: "hours" },
          order: 1,
          nextSteps: ["S2"],
        },
        {
          id: "S2",
          type: "send_email",
          name: "Send satisfaction survey",
          config: {
            subject: "How was your treatment?",
            templateId: "survey-email",
          },
          order: 2,
          nextSteps: ["S3"],
        },
        {
          id: "S3",
          type: "wait",
          name: "Wait 7 days",
          config: { duration: 7, unit: "days" },
          order: 3,
          nextSteps: ["S4"],
        },
        {
          id: "S4",
          type: "send_email",
          name: "Send aftercare tips",
          config: {
            subject: "Aftercare tips for best results",
            templateId: "aftercare-email",
          },
          order: 4,
        },
      ],
      createdBy: "MKT001",
      createdByName: "Sarah Marketing",
    })

    this.createWorkflow({
      name: "Birthday Automation",
      description: "Send birthday wishes and special offer",
      triggerType: "event-based",
      eventType: "birthday",
      status: "active",
      steps: [
        {
          id: "S1",
          type: "send_email",
          name: "Send birthday email",
          config: {
            subject: "Happy Birthday! 🎉",
            templateId: "birthday-email",
          },
          order: 1,
          nextSteps: ["S2"],
        },
        {
          id: "S2",
          type: "tag",
          name: "Add birthday tag",
          config: { tag: "birthday-2024" },
          order: 2,
        },
      ],
      createdBy: "MKT001",
      createdByName: "Sarah Marketing",
    })

    // Generate sample message logs for active campaign
    this.sendCampaignMessages(campaign1.id)

    // Simulate some message status updates
    const logs = this.getMessageLogs({ campaignId: campaign1.id })
    logs.slice(0, 8).forEach((log, index) => {
      // 8 delivered
      this.updateMessageStatus(log.id, "delivered", new Date(Date.now() - (10 - index) * 60000))
    })
    logs.slice(0, 5).forEach((log, index) => {
      // 5 opened
      this.updateMessageStatus(log.id, "opened", new Date(Date.now() - (8 - index) * 60000))
    })
    logs.slice(0, 2).forEach((log, index) => {
      // 2 clicked
      this.updateMessageStatus(log.id, "clicked", new Date(Date.now() - (5 - index) * 60000))
    })
  }
}

// Export both default and named export for compatibility
export { CampaignManager }
export default CampaignManager
