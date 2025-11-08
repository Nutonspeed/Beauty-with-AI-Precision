"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Phone, MessageCircle, DollarSign } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const hotLeads = [
  {
    id: "1",
    name: "นางสาว สมใจ รักสวย",
    phone: "081-234-5678",
    status: "hot",
    lastActivity: "2 นาทีที่แล้ว",
    potentialValue: 25000,
    avatar: "/avatars/01.png",
    treatment: "Laser Treatment + Facial",
    score: 95
  },
  {
    id: "2",
    name: "นาย วิชัย ใจดี",
    phone: "089-876-5432",
    status: "warm",
    lastActivity: "15 นาทีที่แล้ว",
    potentialValue: 15000,
    avatar: "/avatars/02.png",
    treatment: "Anti-Aging Package",
    score: 78
  },
  {
    id: "3",
    name: "นาง วรรณา สวยงาม",
    phone: "086-543-2109",
    status: "hot",
    lastActivity: "5 นาทีที่แล้ว",
    potentialValue: 35000,
    avatar: "/avatars/03.png",
    treatment: "Complete Skin Renewal",
    score: 92
  },
  {
    id: "4",
    name: "นาย สมชาย มั่นคง",
    phone: "082-345-6789",
    status: "new",
    lastActivity: "1 ชั่วโมงที่แล้ว",
    potentialValue: 12000,
    avatar: "/avatars/04.png",
    treatment: "Basic Facial",
    score: 65
  }
]

export function LivePipeline() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-800"
      case "warm": return "bg-orange-100 text-orange-800"
      case "new": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hot": return "🔥 Hot Lead"
      case "warm": return "🌡️ Warm Lead"
      case "new": return "🆕 New Lead"
      default: return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hot Leads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 Hot Leads Pipeline
            <Badge className="bg-red-100 text-red-800">{hotLeads.filter(l => l.status === 'hot').length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotLeads.filter(lead => lead.status === 'hot').map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.treatment}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lead.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">{formatCurrency(lead.potentialValue)}</div>
                <div className="text-sm text-muted-foreground">Score: {lead.score}%</div>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pipeline Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">{hotLeads.filter(l => l.status === 'new').length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Warm Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-sm font-medium">{hotLeads.filter(l => l.status === 'warm').length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hot Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                  <span className="text-sm font-medium">{hotLeads.filter(l => l.status === 'hot').length}</span>
                </div>
              </div>
            </div>

            {/* Total Pipeline Value */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Pipeline Value</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(hotLeads.reduce((sum, lead) => sum + lead.potentialValue, 0))}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average deal size: {formatCurrency(Math.round(hotLeads.reduce((sum, lead) => sum + lead.potentialValue, 0) / hotLeads.length))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Hot Lead
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Proposal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
