"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  FileText,
  Radio,
  Wrench,
  Megaphone,
  Building2,
  UserCog,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { ChannelSubscriber } from "@/components/realtime/ChannelSubscriber"
import { channels } from "@/lib/realtime/channels"
import { toast } from "sonner"

interface AdminDashboardClientProps {
  stats: {
    totalBookings: number
    activeCustomers: number
    revenue: number
    conversionRate: number
  } | null
  bookings: any[]
}

export function AdminDashboardClient({ stats, bookings }: AdminDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleRealtimeMessage = (msg: { type: string; data?: any }) => {
    if (msg.type === 'MAINTENANCE') {
      toast.warning('System Maintenance', {
        description: msg.data?.message || 'Maintenance scheduled',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20" variant="outline">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20" variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-700 border-red-500/20" variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Realtime maintenance alerts subscription */}
      <ChannelSubscriber
        channels={[channels.system.maintenance]}
        onMessage={handleRealtimeMessage}
      />
      
      <div className="border-b border-border bg-background">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">แดชบอร์ดผู้ดูแลระบบ</p>
            </div>
            <Badge className="bg-primary/10 text-primary" variant="secondary">
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Admin Tools Quick Access */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Admin Tools / เครื่องมือผู้ดูแลระบบ</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/super-admin">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                    <UserCog className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Users</p>
                    <p className="text-xs text-muted-foreground">จัดการผู้ใช้</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/super-admin">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                    <Building2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Clinics</p>
                    <p className="text-xs text-muted-foreground">จัดการคลินิก</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/security">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Security</p>
                    <p className="text-xs text-muted-foreground">ความปลอดภัย</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/security/audit-logs">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Audit Logs</p>
                    <p className="text-xs text-muted-foreground">บันทึกการใช้งาน</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/admin/websocket">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                    <Radio className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">WebSocket</p>
                    <p className="text-xs text-muted-foreground">ตรวจสอบ realtime</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/admin/fix-rls">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                    <Wrench className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Fix RLS</p>
                    <p className="text-xs text-muted-foreground">แก้ไข database</p>
                  </div>
                  <Badge className="ml-auto bg-orange-500 text-xs">Dev</Badge>
                </CardContent>
              </Card>
            </a>

            <a href="/admin/broadcast">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
                    <Megaphone className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Broadcast</p>
                    <p className="text-xs text-muted-foreground">ส่งข้อความทั่วระบบ</p>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a href="/analytics">
              <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Analytics</p>
                    <p className="text-xs text-muted-foreground">วิเคราะห์ข้อมูล</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="mt-1 text-2xl font-bold">{stats?.totalBookings || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                  <p className="mt-1 text-2xl font-bold">{stats?.activeCustomers || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue (Month)</p>
                  <p className="mt-1 text-2xl font-bold">฿{(stats?.revenue || 0).toLocaleString()}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="mt-1 text-2xl font-bold">{stats?.conversionRate || 0}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users / ผู้ใช้</TabsTrigger>
            <TabsTrigger value="bookings">Bookings / การจอง</TabsTrigger>
            <TabsTrigger value="clinics">Clinics / คลินิก</TabsTrigger>
            <TabsTrigger value="analytics">Analytics / วิเคราะห์</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management / จัดการผู้ใช้</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.user?.full_name || booking.user?.email}</TableCell>
                        <TableCell>{booking.treatment_type}</TableCell>
                        <TableCell>{booking.booking_date}</TableCell>
                        <TableCell>{booking.booking_time}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Confirm</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="clinics" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Clinics / คลินิก</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search clinics..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button>Add Clinic</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Placeholder for clinics data */}
                <p className="text-sm text-muted-foreground">Clinics data will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Treatments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Botox Treatment", count: 45, percentage: 35 },
                      { name: "Dermal Filler", count: 38, percentage: 30 },
                      { name: "Laser Treatment", count: 28, percentage: 22 },
                      { name: "Chemical Peel", count: 17, percentage: 13 },
                    ].map((treatment, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{treatment.name}</span>
                          <span className="text-muted-foreground">{treatment.count} bookings</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${treatment.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Treatments", amount: "฿180K", percentage: 73 },
                      { category: "Consultations", amount: "฿35K", percentage: 14 },
                      { category: "Products", amount: "฿30K", percentage: 13 },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-muted-foreground">{item.amount}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "New booking", customer: "Sarah Johnson", time: "5 minutes ago" },
                      { action: "Payment received", customer: "Michael Chen", time: "1 hour ago" },
                      { action: "Appointment completed", customer: "Emma Wilson", time: "2 hours ago" },
                      { action: "New customer registered", customer: "David Lee", time: "3 hours ago" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.customer}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
