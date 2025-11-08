"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StickyNote, Search, Calendar, User, Bell, CheckCircle2, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import Link from "next/link"

interface CustomerNote {
  id: string
  customer_id: string
  customer_name: string
  note_text: string
  note_type: "general" | "concern" | "preference" | "follow-up"
  followup_date?: string
  reminder_sent?: boolean
  created_at: string
  created_by?: string
}

export default function CustomerNotesPage() {
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "general" | "concern" | "preference" | "follow-up">("all")
  const [loading, setLoading] = useState(true)

  // Load all notes from localStorage (in production, this would be API call)
  useEffect(() => {
    loadAllNotes()
  }, [])

  const loadAllNotes = () => {
    setLoading(true)
    try {
      const allNotes: CustomerNote[] = []
      
      // Scan all localStorage keys for customer notes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("customer-notes-")) {
          const customerId = key.replace("customer-notes-", "")
          const savedNotes = localStorage.getItem(key)
          if (savedNotes) {
            const customerNotes = JSON.parse(savedNotes)
            // Add customer_id to each note
            customerNotes.forEach((note: any) => {
              allNotes.push({
                ...note,
                customer_id: customerId,
                customer_name: note.customer_name || `Customer ${customerId.slice(0, 8)}`
              })
            })
          }
        }
      }

      // Sort by created_at (newest first)
      allNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setNotes(allNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    // Filter by type
    if (filterType !== "all" && note.note_type !== filterType) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        note.customer_name.toLowerCase().includes(query) ||
        note.note_text.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Count by type
  const noteCounts = {
    all: notes.length,
    general: notes.filter(n => n.note_type === "general").length,
    concern: notes.filter(n => n.note_type === "concern").length,
    preference: notes.filter(n => n.note_type === "preference").length,
    "follow-up": notes.filter(n => n.note_type === "follow-up").length,
  }

  // Check for overdue follow-ups
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const overdueFollowUps = notes.filter((note) => {
    if (!note.followup_date || note.reminder_sent) return false
    const followupDate = new Date(note.followup_date)
    followupDate.setHours(0, 0, 0, 0)
    return followupDate <= today && note.note_type === "follow-up"
  })

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-blue-100 text-blue-800"
      case "concern":
        return "bg-red-100 text-red-800"
      case "preference":
        return "bg-green-100 text-green-800"
      case "follow-up":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "general":
        return "ทั่วไป"
      case "concern":
        return "ข้อกังวล"
      case "preference":
        return "ความต้องการ"
      case "follow-up":
        return "ติดตาม"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <StickyNote className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Customer Notes</h1>
              <p className="text-muted-foreground">บันทึกและติดตามโน้ตลูกค้าทั้งหมด</p>
            </div>
          </div>

          {/* Overdue Follow-ups Alert */}
          {overdueFollowUps.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">
                    มี {overdueFollowUps.length} รายการที่ต้องติดตามวันนี้
                  </p>
                  <p className="text-sm text-orange-700">คลิกดูรายการที่ต้องติดตาม</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noteCounts.all}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ทั่วไป</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{noteCounts.general}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ข้อกังวล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{noteCounts.concern}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ความต้องการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{noteCounts.preference}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ติดตาม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{noteCounts["follow-up"]}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาด้วยชื่อลูกค้าหรือเนื้อหาโน้ต..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({noteCounts.all})</TabsTrigger>
                  <TabsTrigger value="general">ทั่วไป</TabsTrigger>
                  <TabsTrigger value="concern">ข้อกังวล</TabsTrigger>
                  <TabsTrigger value="preference">ความต้องการ</TabsTrigger>
                  <TabsTrigger value="follow-up">ติดตาม</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">กำลังโหลดโน้ต...</p>
              </CardContent>
            </Card>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || filterType !== "all" ? "ไม่พบโน้ตที่ตรงกับเงื่อนไข" : "ยังไม่มีโน้ต"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== "all" ? "ลองเปลี่ยนเงื่อนไขการค้นหา" : "เริ่มบันทึกโน้ตลูกค้าเพื่อติดตามความคืบหน้า"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => {
              const isOverdue = note.followup_date && !note.reminder_sent && 
                new Date(note.followup_date) <= today && note.note_type === "follow-up"

              return (
                <Card key={note.id} className={isOverdue ? "border-orange-500 border-2" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">
                            <Link 
                              href={`/sales/quick-scan?customer_id=${note.customer_id}`}
                              className="hover:underline"
                            >
                              {note.customer_name}
                            </Link>
                          </CardTitle>
                          <Badge className={getNoteTypeColor(note.note_type)}>
                            {getNoteTypeLabel(note.note_type)}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Bell className="h-3 w-3 mr-1" />
                              ต้องติดตามวันนี้
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: th })}
                          {note.created_by && ` • by ${note.created_by}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap mb-3">{note.note_text}</p>
                    
                    {note.followup_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                        <Calendar className="h-4 w-4" />
                        <span>Follow-up: {new Date(note.followup_date).toLocaleDateString("th-TH")}</span>
                        {note.reminder_sent && (
                          <Badge variant="outline" className="ml-auto">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            แจ้งเตือนแล้ว
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Link href={`/sales/quick-scan?customer_id=${note.customer_id}`}>
                        <Button size="sm" variant="outline">
                          View Customer
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center pt-4">
          <Link href="/sales/dashboard">
            <Button variant="outline">
              กลับไปที่ Sales Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
