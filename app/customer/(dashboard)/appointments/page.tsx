/**
 * Customer Appointments Page
 * Shows customer's appointment history and upcoming appointments
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, X, CheckCircle, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, isPast, isFuture, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  notes?: string
  services: {
    name: string
    duration: number
    price: number
  }
  staff: {
    full_name: string
  }
  invoice?: {
    id: string
    invoice_number: string
    total_amount: number
    status: string
  }
}

export default function CustomerAppointmentsPage() {
  const supabase = createClient()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) return

    // Fetch appointments with related data
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        services!appointments_service_id_fkey (
          name,
          duration,
          price
        ),
        staff!appointments_staff_id_fkey (
          full_name
        ),
        invoices!appointments_invoice_id_fkey (
          id,
          invoice_number,
          total_amount,
          status
        )
      `)
      .eq('customer_id', customer.id)
      .order('start_time', { ascending: false })

    setAppointments(data || [])
    setLoading(false)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?')) return

    setCancelingId(appointmentId)
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (error) throw error

      // Refresh appointments
      await fetchAppointments()
    } catch (error) {
      console.error('Cancel error:', error)
      alert('ไม่สามารถยกเลิกนัดหมายได้ กรุณาติดต่อคลินิก')
    } finally {
      setCancelingId(null)
    }
  }

  const canCancel = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.start_time)
    const now = new Date()
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntil > 24 && appointment.status !== 'cancelled'
  }

  const upcomingAppointments = appointments.filter(apt => 
    !isPast(new Date(apt.start_time)) && apt.status !== 'cancelled'
  )

  const pastAppointments = appointments.filter(apt => 
    isPast(new Date(apt.start_time)) || apt.status === 'cancelled'
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'ยืนยันแล้ว', variant: 'default' as const },
      pending: { label: 'รอยืนยัน', variant: 'secondary' as const },
      completed: { label: 'เสร็จสิ้น', variant: 'default' as const },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{appointment.services.name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-1" />
              {appointment.staff.full_name}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(appointment.start_time), 'd MMMM yyyy', { locale: th })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {format(new Date(appointment.start_time), 'HH:mm')} - 
              {format(new Date(appointment.end_time), 'HH:mm')}
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-500 mt-2">
                หมายเหตุ: {appointment.notes}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            {getStatusBadge(appointment.status)}
            <p className="font-semibold text-lg">
              ฿{appointment.services.price.toFixed(2)}
            </p>
            {appointment.invoice && (
              <Link href={`/customer/payments/${appointment.invoice.id}`}>
                <Button variant="outline" size="sm">
                  {appointment.invoice.status === 'paid' ? 'ดูใบเสร็จ' : 'ชำระเงิน'}
                </Button>
              </Link>
            )}
          </div>
        </div>
        {canCancel(appointment) && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancelAppointment(appointment.id)}
              disabled={cancelingId === appointment.id}
            >
              {cancelingId === appointment.id ? 'กำลังยกเลิก...' : 'ยกเลิกนัดหมาย'}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              ต้องยกเลิกล่วงหน้าอย่างน้อย 24 ชั่วโมง
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">นัดหมายของฉัน</h2>
        <p className="text-gray-600">ดูและจัดการการนัดหมายของคุณ</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            นัดหมายที่จะถึง ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            ประวัติการนัดหมาย ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่มีนัดหมายที่จะถึง
                </h3>
                <p className="text-gray-600 mb-4">
                  จองนัดหมายของคุณวันนี้
                </p>
                <Link href="/customer/booking">
                  <Button>จองนัดหมาย</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่มีประวัติการนัดหมาย
                </h3>
                <p className="text-gray-600">
                  นัดหมายของคุณจะแสดงที่นี่
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
