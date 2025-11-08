"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Phone, MessageSquare, Mail, Star, Filter, Search } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const hotLeads = [
  {
    id: "1",
    name: "นางสาว สมใจ รักสวย",
    phone: "081-234-5678",
    email: "somjai@email.com",
    status: "hot",
    priority: "high",
    score: 95,
    lastActivity: "2 นาทีที่แล้ว",
    potentialValue: 25000,
    avatar: "/avatars/01.png",
    treatment: "Laser Treatment + Facial",
    notes: "สนใจแพ็คเกจครบครัน ต้องการปรึกษาเรื่องราคา",
    nextFollowUp: "วันนี้ 14:00"
  },
  {
    id: "2",
    name: "นาย วิชัย ใจดี",
    phone: "089-876-5432",
    email: "wichai@email.com",
    status: "warm",
    priority: "medium",
    score: 78,
    lastActivity: "15 นาทีที่แล้ว",
    potentialValue: 15000,
    avatar: "/avatars/02.png",
    treatment: "Anti-Aging Package",
    notes: "ส่ง proposal แล้ว รอการติดต่อกลับ",
    nextFollowUp: "พรุ่งนี้ 10:00"
  },
  {
    id: "3",
    name: "นาง วรรณา สวยงาม",
    phone: "086-543-2109",
    email: "wanna@email.com",
    status: "hot",
    priority: "high",
    score: 92,
    lastActivity: "5 นาทีที่แล้ว",
    potentialValue: 35000,
    avatar: "/avatars/03.png",
    treatment: "Complete Skin Renewal",
    notes: "พร้อมทำสัญญา ต้องการเริ่มทรีตเมนต์สัปดาห์หน้า",
    nextFollowUp: "วันนี้ 16:00"
  },
  {
    id: "4",
    name: "นาย สมชาย มั่นคง",
    phone: "082-345-6789",
    email: "somchai@email.com",
    status: "new",
    priority: "low",
    score: 65,
    lastActivity: "1 ชั่วโมงที่แล้ว",
    potentialValue: 12000,
    avatar: "/avatars/04.png",
    treatment: "Basic Facial",
    notes: "เพิ่งสมัครใช้งาน ยังไม่ได้ติดต่อ",
    nextFollowUp: "พรุ่งนี้ 14:00"
  }
]

export function HotLeadsManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-800"
      case "warm": return "bg-orange-100 text-orange-800"
      case "new": return "bg-blue-100 text-blue-800"
      case "cold": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hot": return "🔥 Hot Lead"
      case "warm": return "🌡️ Warm Lead"
      case "new": return "🆕 New Lead"
      case "cold": return "❄️ Cold Lead"
      default: return "Unknown"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredLeads = hotLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.treatment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อหรือทรีตเมนต์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="hot">Hot Lead</SelectItem>
                <SelectItem value="warm">Warm Lead</SelectItem>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="cold">Cold Lead</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="ความสำคัญ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกความสำคัญ</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="medium">กลาง</SelectItem>
                <SelectItem value="low">ต่ำ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">รายการ</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{lead.name}</h3>
                        <Badge className={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>
                        <Badge className={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{lead.treatment}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lead.lastActivity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-green-600">{formatCurrency(lead.potentialValue)}</div>
                          <div className="text-sm text-muted-foreground">Lead Score: {lead.score}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Next Follow-up</div>
                          <div className="text-sm text-muted-foreground">{lead.nextFollowUp}</div>
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                          <strong>Notes:</strong> {lead.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" className="w-full">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["hot", "warm", "new", "cold"].map((status) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{getStatusLabel(status)}</h3>
                  <Badge className={getStatusColor(status)}>
                    {filteredLeads.filter(l => l.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {filteredLeads
                    .filter(lead => lead.status === status)
                    .map((lead) => (
                      <Card key={lead.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.avatar} />
                            <AvatarFallback className="text-xs">{lead.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">{lead.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{lead.treatment}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-green-600">{formatCurrency(lead.potentialValue)}</span>
                          <span>Score: {lead.score}%</span>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
