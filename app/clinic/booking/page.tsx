"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { BookingCalendar } from '@/components/booking/booking-calendar'
import { StaffAvailabilityManager } from '@/components/booking/staff-availability'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  staff_name: string
  service_name: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  room_name?: string
  notes?: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface Staff {
  id: string
  full_name: string
}

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [bookingForm, setBookingForm] = useState({
    customer_id: '',
    staff_id: '',
    service_id: '',
    room_id: '',
    start_time: '',
    notes: ''
  })

  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [clinicId, setClinicId] = useState<string>('')

  // Get current user and clinic
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Get user's clinic
        const { data: profile } = await supabase
          .from('users')
          .select('clinic_id')
          .eq('id', user.id)
          .single()
        if (profile?.clinic_id) {
          setClinicId(profile.clinic_id)
        }
      }
    }
    getUser()
  }, [])

  // Fetch data when clinic is loaded
  useEffect(() => {
    if (clinicId) {
      fetchBookings()
      fetchServices()
      fetchStaff()
      fetchCustomers()
    }
  }, [clinicId, selectedDate])

  const fetchBookings = async () => {
    if (!clinicId) return
    
    const startDate = selectedDate 
      ? format(startOfDay(selectedDate), 'yyyy-MM-dd')
      : format(startOfDay(new Date()), 'yyyy-MM-dd')
    const endDate = selectedDate
      ? format(addDays(selectedDate, 30), 'yyyy-MM-dd')
      : format(addDays(new Date(), 30), 'yyyy-MM-dd')

    try {
      const response = await fetch(
        `/api/booking/calendar?clinic_id=${clinicId}&start_date=${startDate}&end_date=${endDate}`
      )
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchServices = async () => {
    if (!clinicId) return
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchStaff = async () => {
    if (!clinicId) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('clinic_id', clinicId)
        .in('role', ['clinic_owner', 'clinic_admin', 'sales_staff'])
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  const fetchCustomers = async () => {
    if (!clinicId) return
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/booking/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          clinic_id: clinicId
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'จองนัดหมายสำเร็จแล้ว' })
        setIsBookingDialogOpen(false)
        setBookingForm({
          customer_id: '',
          staff_id: '',
          service_id: '',
          room_id: '',
          start_time: '',
          notes: ''
        })
        fetchBookings()
      } else {
        setMessage({ type: 'error', text: data.error || 'จองนัดหมายไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = (booking: Booking) => {
    // TODO: Open booking details dialog
    console.log('Booking clicked:', booking)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการการนัดหมาย</h1>
          <p className="text-muted-foreground">
            จองนัดหมายและจัดการตารางเวลาของคลินิก
          </p>
        </div>
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              จองนัดหมายใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>จองนัดหมายใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <Label>ลูกค้า</Label>
                <Select
                  value={bookingForm.customer_id}
                  onValueChange={(value) => 
                    setBookingForm({ ...bookingForm, customer_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกลูกค้า..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>พนักงานผู้ให้บริการ</Label>
                <Select
                  value={bookingForm.staff_id}
                  onValueChange={(value) => 
                    setBookingForm({ ...bookingForm, staff_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกพนักงาน..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>บริการ</Label>
                <Select
                  value={bookingForm.service_id}
                  onValueChange={(value) => 
                    setBookingForm({ ...bookingForm, service_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบริการ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} นาที - ฿{service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>วันและเวลา</Label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md"
                  value={bookingForm.start_time}
                  onChange={(e) => 
                    setBookingForm({ ...bookingForm, start_time: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>หมายเหตุ</Label>
                <Textarea
                  placeholder="ข้อมูลเพิ่มเติม..."
                  value={bookingForm.notes}
                  onChange={(e) => 
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                />
              </div>

              {message && (
                <div className={cn(
                  "p-3 rounded-md flex items-center gap-2",
                  message.type === 'success' 
                    ? "bg-green-50 text-green-800" 
                    : "bg-red-50 text-red-800"
                )}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBookingDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'กำลังจอง...' : 'จองนัดหมาย'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">ปฏิทินการนัดหมาย</TabsTrigger>
          <TabsTrigger value="availability">จัดการเวลาทำงาน</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <BookingCalendar
            bookings={bookings}
            onDateSelect={setSelectedDate}
            onBookingClick={handleBookingClick}
          />
        </TabsContent>

        <TabsContent value="availability">
          <StaffAvailabilityManager
            clinicId={clinicId}
            staffList={staff}
            onAvailabilityChange={fetchBookings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
