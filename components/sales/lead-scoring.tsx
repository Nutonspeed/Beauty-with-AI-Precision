"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Target, Users, DollarSign } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const leadsData = [
  {
    id: "1",
    name: "นางสาว สมใจ รักสวย",
    avatar: "/avatars/01.png",
    email: "somjai@email.com",
    phone: "081-234-5678",
    source: "Facebook Ads",
    status: "hot",
    score: 95,
    lastActivity: "2 ชั่วโมงที่แล้ว",
    budget: "สูง",
    timeline: "ด่วน",
    interests: ["สิว", "รูขุมขน"],
    engagement: {
      websiteVisits: 12,
      emailOpens: 8,
      chatInteractions: 5,
      socialEngagement: 15
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
    lastActivity: "1 วันที่แล้ว",
    budget: "กลาง",
    timeline: "1-3 เดือน",
    interests: ["ริ้วรอย", "ผิวไม่กระชับ"],
    engagement: {
      websiteVisits: 8,
      emailOpens: 3,
      chatInteractions: 2,
      socialEngagement: 6
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
    lastActivity: "1 สัปดาห์ที่แล้ว",
    budget: "ต่ำ",
    timeline: "ยังไม่แน่ใจ",
    interests: ["HydraFacial"],
    engagement: {
      websiteVisits: 2,
      emailOpens: 0,
      chatInteractions: 0,
      socialEngagement: 3
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
  const [leads, setLeads] = useState(leadsData)
  const [sortBy, setSortBy] = useState("score")
  const [filterBy, setFilterBy] = useState("all")

  // Simulate real-time scoring updates
  useEffect(() => {
    const updateScores = () => {
      setLeads(prevLeads =>
        prevLeads.map(lead => ({
          ...lead,
          score: Math.min(100, lead.score + Math.floor(Math.random() * 3) - 1)
        }))
      )
    }

    const interval = setInterval(updateScores, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedLeads = leads
    .filter(lead => filterBy === "all" || lead.status === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score
        case "value":
          return b.predictedValue - a.predictedValue
        case "probability":
          return b.conversionProbability - a.conversionProbability
        case "activity":
          return a.lastActivity.localeCompare(b.lastActivity)
        default:
          return 0
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
                  ฿{leads.reduce((sum, lead) => sum + lead.predictedValue, 0).toLocaleString()}
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
                  {Math.round(leads.reduce((sum, lead) => sum + lead.conversionProbability, 0) / leads.length)}%
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
                  <SelectItem value="score">คะแนนสูงสุด</SelectItem>
                  <SelectItem value="value">มูลค่าสูงสุด</SelectItem>
                  <SelectItem value="probability">โอกาสการขายสูงสุด</SelectItem>
                  <SelectItem value="activity">กิจกรรมล่าสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads List */}
          <div className="space-y-4">
            {filteredAndSortedLeads.map((lead) => (
              <Card key={lead.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{lead.name}</h3>
                        {getStatusBadge(lead.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <div className="font-medium text-foreground">Source</div>
                          {lead.source}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Budget</div>
                          {lead.budget}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Timeline</div>
                          {lead.timeline}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Last Activity</div>
                          {lead.lastActivity}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="font-medium text-foreground text-sm mb-1">Interests</div>
                        <div className="flex flex-wrap gap-1">
                          {lead.interests.map((interest, _index) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Engagement Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <div className="font-medium text-foreground">Website Visits</div>
                          {lead.engagement.websiteVisits}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Email Opens</div>
                          {lead.engagement.emailOpens}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Chat Interactions</div>
                          {lead.engagement.chatInteractions}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Social Engagement</div>
                          {lead.engagement.socialEngagement}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scoring Section */}
                  <div className="text-right min-w-[200px]">
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Lead Score</span>
                        <span className="text-lg font-bold">{lead.score}/100</span>
                      </div>
                      <Progress value={lead.score} className="h-2" />
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      Predicted Value: ฿{lead.predictedValue.toLocaleString()}
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      Conversion: {lead.conversionProbability}%
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateScore(lead.id, Math.min(100, lead.score + 5))}
                      >
                        +5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateScore(lead.id, Math.max(0, lead.score - 5))}
                      >
                        -5
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleContactLead(lead.id)}
                      >
                        ติดต่อ
                      </Button>
                    </div>
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
