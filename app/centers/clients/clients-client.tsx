"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, UserPlus, ArrowLeft, Flame, Star, Sparkles, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  lead_status: string
  lead_score: number | null
  last_activity_at: string | null
  created_at: string
  source: string | null
  tags: string[] | null
  notes: string | null
  latest_booking: any | null
}

interface Stats {
  total: number
  hot: number
  warm: number
  new: number
  converted: number
}

interface ClientsClientProps {
  initialClients: Client[]
  initialStats: Stats
}

export function ClientsClient({ initialClients, initialStats }: ClientsClientProps) {
  const [clients] = useState<Client[]>(initialClients) // setter unused
  const [stats] = useState<Stats>(initialStats) // setter unused
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery))

    const matchesStatus = statusFilter === "all" || client.lead_status === statusFilter
    const matchesSource = sourceFilter === "all" || client.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const getLeadStatusBadge = (status: string, score: number | null) => {
    switch (status) {
      case "hot":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <Flame className="h-3 w-3 mr-1" />
            🔥 Hot Lead ({score || 0})
          </Badge>
        )
      case "warm":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <Star className="h-3 w-3 mr-1" />
            ⭐ Warm ({score || 0})
          </Badge>
        )
      case "new":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            ✨ New ({score || 0})
          </Badge>
        )
      case "converted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            ✅ Converted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return "ไม่มีกิจกรรม"
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: th,
      })
    } catch {
      return "ไม่ทราบ"
    }
  }

  const getSourceBadge = (source: string | null) => {
    if (!source) return <Badge variant="outline">ไม่ทราบ</Badge>
    
    const sourceMap: Record<string, { label: string; color: string }> = {
      facebook: { label: "Facebook", color: "bg-blue-500" },
      instagram: { label: "Instagram", color: "bg-pink-500" },
      google: { label: "Google", color: "bg-red-500" },
      line: { label: "LINE", color: "bg-green-500" },
      referral: { label: "แนะนำ", color: "bg-purple-500" },
      walkin: { label: "Walk-in", color: "bg-gray-500" },
      website: { label: "Website", color: "bg-cyan-500" },
    }

    const sourceInfo = sourceMap[source.toLowerCase()] || { label: source, color: "bg-gray-500" }
    
    return (
      <Badge className={`${sourceInfo.color} text-white`}>
        {sourceInfo.label}
      </Badge>
    )
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="border-b bg-background dark:bg-gray-900">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/center/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Client Management</h1>
                <p className="text-sm text-muted-foreground">จัดการลูกค้าและ Leads</p>
              </div>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              เพิ่มลูกค้า
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Clients</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">🔥 Hot Leads</div>
              <div className="text-2xl font-bold text-red-500">{stats.hot}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">⭐ Warm Leads</div>
              <div className="text-2xl font-bold text-orange-500">{stats.warm}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">✨ New Leads</div>
              <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">✅ Converted</div>
              <div className="text-2xl font-bold text-green-500">{stats.converted}</div>
              <div className="text-xs text-muted-foreground">
                {stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}% conversion
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทร..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Lead Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="hot">🔥 Hot Leads</SelectItem>
                  <SelectItem value="warm">⭐ Warm Leads</SelectItem>
                  <SelectItem value="new">✨ New Leads</SelectItem>
                  <SelectItem value="converted">✅ Converted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="line">LINE</SelectItem>
                  <SelectItem value="referral">แนะนำ</SelectItem>
                  <SelectItem value="walkin">Walk-in</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อลูกค้า ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Latest Booking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      ไม่พบข้อมูลลูกค้า
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {client.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLeadStatusBadge(client.lead_status, client.lead_score)}
                      </TableCell>
                      <TableCell>{getSourceBadge(client.source)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{formatLastActivity(client.last_activity_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.latest_booking ? (
                          <div className="text-sm">
                            <div className="font-medium text-xs">{client.latest_booking.program_type}</div>
                            <div className="text-xs text-muted-foreground">
                              ฿{client.latest_booking.payment_amount?.toLocaleString() || 0}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">ยังไม่มีการจอง</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              👁️ ดูรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              ✏️ แก้ไขข้อมูล
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              📞 ติดต่อลูกค้า
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              📅 สร้างการนัด
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              📝 เพิ่มโน้ต
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
