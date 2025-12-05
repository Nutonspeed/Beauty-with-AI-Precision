"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AILeadScorer, LeadData, AIScoreResult } from "@/lib/ai/lead-scorer"
import { Target, Users, DollarSign, TrendingUp } from 'lucide-react'
import { AIMarketingCampaignGenerator } from "@/lib/ai/campaign-generator"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const leadsData: any[] = [
  {
    id: "1",
    name: "นางสาว สมใจ รักสวย",
    avatar: "/avatars/01.png",
    email: "somjai@email.com",
    phone: "081-234-5678",
    source: "Facebook Ads",
    status: "hot",
    score: 95,
    lastActivity: new Date(),
    firstContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    totalInteractions: 25,
    responseTime: 12,
    budget: "high",
    timeline: "ด่วน",
    interests: ["สิว", "รูขุมขน"],
    engagement: {
      websiteVisits: 12,
      emailOpens: 8,
      emailClicks: 4,
      chatInteractions: 5,
      socialEngagement: 15,
      contentDownloads: 2,
      appointmentBookings: 1
    },
    predictedValue: 45000,
    conversionProbability: 85
  },
  {
    id: "2",
    name: "นาย วิชัย ใจดี",
    avatar: "/avatars/02.png",
    email: "wichai@email.com",
    phone: "082-345-6789",
    source: "Google Search",
    status: "warm",
    score: 72,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    firstContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalInteractions: 12,
    responseTime: 24,
    budget: "medium",
    timeline: "1-3 เดือน",
    interests: ["ริ้วรอย", "ผิวไม่กระชับ"],
    engagement: {
      websiteVisits: 8,
      emailOpens: 3,
      emailClicks: 1,
      chatInteractions: 2,
      socialEngagement: 6,
      contentDownloads: 1,
      appointmentBookings: 0
    },
    predictedValue: 28000,
    conversionProbability: 45
  },
  {
    id: "3",
    name: "นาง วรรณา สวยงาม",
    avatar: "/avatars/03.png",
    email: "wanna@email.com",
    phone: "083-456-7890",
    source: "Instagram",
    status: "cold",
    score: 35,
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    firstContact: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    totalInteractions: 3,
    responseTime: 72,
    budget: "low",
    timeline: "ยังไม่แน่ใจ",
    interests: ["HydraFacial"],
    engagement: {
      websiteVisits: 2,
      emailOpens: 0,
      emailClicks: 0,
      chatInteractions: 0,
      socialEngagement: 3,
      contentDownloads: 0,
      appointmentBookings: 0
    },
    predictedValue: 12000,
    conversionProbability: 15
  }
]


const getStatusBadge = (status: string) => {
  switch (status) {
    case "hot":
      return <Badge className="bg-red-100 text-red-800">Hot Lead</Badge>
    case "warm":
      return <Badge className="bg-orange-100 text-orange-800">Warm Lead</Badge>
    case "cold":
      return <Badge className="bg-gray-100 text-gray-800">Cold Lead</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function LeadScoring() {
  const [leads, setLeads] = useState<any[]>(leadsData)
  const [sortBy, setSortBy] = useState("aiScore")
  const [filterBy, setFilterBy] = useState("all")
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [aiScorer] = useState(() => new AILeadScorer())
  const [campaignGenerator] = useState(() => new AIMarketingCampaignGenerator())
  const [selectedLead, setSelectedLead] = useState<(LeadData & { aiScore?: AIScoreResult }) | null>(null)

  // AI-powered lead scoring and campaign generation
  useEffect(() => {
    const analyzeLeads = async () => {
      setIsAnalyzing(true)

      const updatedLeads = await Promise.all(
        leadsData.map(async (lead) => {
          try {
            // Get AI score
            const aiScore = await aiScorer.scoreLead(lead)

            // Generate personalized campaign
            const campaign = await campaignGenerator.generateCampaign(lead, aiScore)

            return {
              ...lead,
              aiScore,
              campaign,
              score: aiScore.overallScore, // Update legacy score field
            }
          } catch (error) {
            console.error(`Failed to analyze lead ${lead.id}:`, error)
            return {
              ...lead,
              aiScore: undefined,
              campaign: undefined,
            }
          }
        })
      )

      setLeads(updatedLeads)
      setIsAnalyzing(false)
    }

    analyzeLeads()
  }, [])

  const filteredAndSortedLeads = leads
    .filter(lead => filterBy === "all" || lead.status === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "aiScore":
          return (b.aiScore?.overallScore || 0) - (a.aiScore?.overallScore || 0)
        case "conversion":
          return (b.aiScore?.conversionProbability || 0) - (a.aiScore?.conversionProbability || 0)
        case "value":
          return (b.aiScore?.predictedValue || 0) - (a.aiScore?.predictedValue || 0)
        case "urgency":
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          const bKey = (b.aiScore?.urgency || 'low') as keyof typeof urgencyOrder
          const aKey = (a.aiScore?.urgency || 'low') as keyof typeof urgencyOrder
          return (urgencyOrder[bKey] || 1) - (urgencyOrder[aKey] || 1)
        case "activity":
          return b.lastActivity.getTime() - a.lastActivity.getTime()
        default:
          return (b.aiScore?.overallScore || b.score || 0) - (a.aiScore?.overallScore || a.score || 0)
      }
    })

  const handleContactLead = (leadId: string) => {
    // ในโปรดักชั่นจะเปิด chat หรือส่ง email
    console.log("Contacting lead:", leadId)
    alert("เปิดการสนทนากับ Lead")
  }

  const handleUpdateScore = (leadId: string, newScore: number) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, score: newScore } : lead
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Hot Leads</p>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.status === "hot").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Predicted Revenue</p>
                <p className="text-2xl font-bold">
                  ฿{leads.reduce((sum, lead) => sum + (lead.aiScore?.predictedValue || (lead as any).predictedValue || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Avg Conversion</p>
                <p className="text-2xl font-bold">
                  {Math.round(leads.reduce((sum, lead) => sum + (lead.aiScore?.conversionProbability || (lead as any).conversionProbability || 0), 0) / leads.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <div className="text-sm font-medium mb-2">กรองตามสถานะ</div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="hot">Hot Leads</SelectItem>
                  <SelectItem value="warm">Warm Leads</SelectItem>
                  <SelectItem value="cold">Cold Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">เรียงตาม</div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aiScore">AI Score สูงสุด</SelectItem>
                  <SelectItem value="conversion">โอกาสขายสูงสุด</SelectItem>
                  <SelectItem value="value">มูลค่าสูงสุด</SelectItem>
                  <SelectItem value="urgency">ความเร่งด่วนสูงสุด</SelectItem>
                  <SelectItem value="activity">กิจกรรมล่าสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads List (simplified for build stability) */}
          <div className="space-y-4">
            {filteredAndSortedLeads.map((lead) => (
              <Card key={lead.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{lead.name}</h3>
                    <div className="text-sm text-muted-foreground">Score: {lead.aiScore?.overallScore ?? (lead as any).score ?? 0}</div>
                  </div>
                  <div>
                    <Button size="sm" onClick={() => handleContactLead(lead.id)}>ติดต่อ</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
