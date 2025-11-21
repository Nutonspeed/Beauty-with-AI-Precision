"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, MoreVertical, UserPlus, ArrowLeft, Star, Edit, Trash2, UserCog } from "lucide-react"
import Link from "next/link"
import StaffModal from "@/components/clinic/staff-modal"
import { toast } from "sonner"

interface StaffMember {
  id: string
  user_id: string
  clinic_id: string | null
  role: string
  specialty: string | null
  email: string
  phone: string | null
  status: string
  rating: number | null
  patients_today: number
  appointments_today: number
  join_date: string
  avatar_url: string | null
  full_name: string
  working_hours: any
  days_off: string[] | null
  hired_date: string | null
  bio: string | null
  certifications: string[] | null
  languages: string[] | null
  metadata: any
  user?: {
    full_name: string
    email: string
  }
}

interface StaffStats {
  total: number
  active: number
  on_leave: number
  doctors: number
  nurses: number
  therapists: number
  admins: number
}

interface StaffClientProps {
  initialStaff: StaffMember[]
  initialStats: StaffStats
}

export function StaffClient({ initialStaff, initialStats }: StaffClientProps) {
  const [staff, _setStaff] = useState<StaffMember[]>(initialStaff)
  const [stats, _setStats] = useState<StaffStats>(initialStats)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Modal states
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; email: string; full_name: string }>>([])

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('users')
        .select('id, email, full_name')
        .limit(100)
      if (data) setUsers(data)
    }
    fetchUsers()
  }, [])

  // Real-time subscription
  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel('clinic_staff_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_staff',
        },
        (payload) => {
          console.log('Staff change received:', payload)
          // Reload page to get fresh data
          globalThis.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Handler functions
  const handleRefresh = () => {
    globalThis.location.reload()
  }

  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember)
    setShowStaffModal(true)
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to terminate this staff member?')) return

    try {
      const response = await fetch(`/api/clinic/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to terminate staff member')
      }

      toast.success('Staff member terminated successfully')
      handleRefresh()
    } catch (error) {
      console.error('Error terminating staff:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to terminate staff member')
    }
  }

  const handleUpdateStatus = async (staffId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/clinic/staff/${staffId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      toast.success('Status updated successfully')
      handleRefresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleCloseStaffModal = () => {
    setShowStaffModal(false)
    setEditingStaff(null)
  }

  // Filter staff based on search and filters
  const filteredStaff = staff.filter((staffMember) => {
    const matchesSearch =
      staffMember.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staffMember.specialty && staffMember.specialty.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter
    const matchesStatus = statusFilter === "all" || staffMember.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor":
        return <Badge className="bg-blue-500">👨‍⚕️ Doctor</Badge>
      case "nurse":
        return <Badge className="bg-green-500">👩‍⚕️ Nurse</Badge>
      case "therapist":
        return <Badge className="bg-purple-500">💆 Therapist</Badge>
      case "admin":
        return <Badge className="bg-orange-500">👔 Admin</Badge>
      case "receptionist":
        return <Badge className="bg-pink-500">📋 Receptionist</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">✅ Active</Badge>
      case "on_leave":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">🏖️ On Leave</Badge>
      case "inactive":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-300">❌ Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <main className="flex-1">
      {/* Header */}
      <div className="border-b bg-background dark:bg-gray-900">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clinic/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <p className="text-sm text-muted-foreground">จัดการทีมงาน</p>
              </div>
            </div>
            <Button onClick={() => setShowStaffModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Staff</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">👨‍⚕️ Doctors</div>
              <div className="text-2xl font-bold text-blue-500">{stats.doctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">👩‍⚕️ Nurses</div>
              <div className="text-2xl font-bold text-green-500">{stats.nurses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">💆 Therapists</div>
              <div className="text-2xl font-bold text-purple-500">{stats.therapists}</div>
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
                    placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือความเชี่ยวชาญ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">👨‍⚕️ Doctor</SelectItem>
                  <SelectItem value="nurse">👩‍⚕️ Nurse</SelectItem>
                  <SelectItem value="therapist">💆 Therapist</SelectItem>
                  <SelectItem value="admin">👔 Admin</SelectItem>
                  <SelectItem value="receptionist">📋 Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">✅ Active</SelectItem>
                  <SelectItem value="on_leave">🏖️ On Leave</SelectItem>
                  <SelectItem value="inactive">❌ Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อทีมงาน ({filteredStaff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Today</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      ไม่พบข้อมูลทีมงาน
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staffMember.avatar_url || undefined} />
                            <AvatarFallback>{staffMember.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{staffMember.full_name}</div>
                            <div className="text-sm text-muted-foreground">{staffMember.specialty || "-"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(staffMember.role)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{staffMember.email}</div>
                          <div className="text-muted-foreground">{staffMember.phone || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(staffMember.status)}</TableCell>
                      <TableCell>
                        {staffMember.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{staffMember.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>👥 {staffMember.patients_today} patients</div>
                          <div className="text-muted-foreground">📅 {staffMember.appointments_today} appts</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {staffMember.join_date ? new Date(staffMember.join_date).toLocaleDateString('th-TH') : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStaff(staffMember)}>
                              <Edit className="mr-2 h-4 w-4" />
                              แก้ไขโปรไฟล์
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(staffMember.id, staffMember.status === 'active' ? 'on_leave' : 'active')}>
                              <UserCog className="mr-2 h-4 w-4" />
                              {staffMember.status === 'active' ? 'Set On Leave' : 'Set Active'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStaff(staffMember.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบออก
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

      {/* Modals */}
      <StaffModal
        open={showStaffModal}
        onClose={handleCloseStaffModal}
        onSuccess={handleRefresh}
        editStaff={editingStaff as any}
        users={users}
      />
    </>
  )
}
