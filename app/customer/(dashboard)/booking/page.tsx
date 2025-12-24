/**
 * Customer Self-Booking Page
 * Allows customers to book their own appointments
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore, isAfter } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description?: string
}

interface Staff {
  id: string
  full_name: string
  avatar_url?: string
}

interface AvailableSlot {
  start_time: string
  end_time: string
  staff_id: string
}

export default function CustomerBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) // 1: Service, 2: Staff, 3: Time, 4: Confirm

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) {
      fetchStaff()
    }
  }, [selectedService])

  useEffect(() => {
    if (selectedService && selectedStaff) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService, selectedStaff])

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setServices(data || [])
  }

  const fetchStaff = async () => {
    if (!selectedService) return
    
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('full_name')
    
    setStaff(data || [])
  }

  const fetchAvailableSlots = async () => {
    if (!selectedService || !selectedStaff) return
    
    setLoading(true)
    
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Get staff availability for the day
    const { data: availability } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', selectedStaff.id)
      .eq('day_of_week', selectedDate.getDay())
      .eq('is_available', true)
      .single()
    
    if (!availability) {
      setAvailableSlots([])
      setLoading(false)
      return
    }
    
    // Get existing appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('staff_id', selectedStaff.id)
      .eq('status', 'confirmed')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
    
    // Generate available slots
    const slots = generateTimeSlots(
      availability.start_time,
      availability.end_time,
      selectedService.duration,
      appointments || []
    )
    
    setAvailableSlots(slots)
    setLoading(false)
  }

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number,
    existingAppointments: any[]
  ): AvailableSlot[] => {
    const slots: AvailableSlot[] = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    let current = new Date(selectedDate)
    current.setHours(startHour, startMin, 0, 0)
    
    const end = new Date(selectedDate)
    end.setHours(endHour, endMin, 0, 0)
    
    while (isBefore(current, end)) {
      const slotEnd = new Date(current.getTime() + duration * 60000)
      
      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        return (isBefore(current, aptEnd) && isAfter(slotEnd, aptStart))
      })
      
      if (!hasConflict && !isAfter(slotEnd, end)) {
        slots.push({
          start_time: current.toISOString(),
          end_time: slotEnd.toISOString(),
          staff_id: selectedStaff!.id
        })
      }
      
      current = new Date(current.getTime() + 30 * 60000) // 30-minute intervals
    }
    
    return slots
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedSlot) return
    
    setLoading(true)
    
    try {
      // Get customer info including clinic_id
      const { data: { user } } = await supabase.auth.getUser()
      const { data: customer } = await supabase
        .from('customers')
        .select('id, clinic_id')
        .eq('user_id', user?.id)
        .single()
      
      if (!customer?.clinic_id) {
        alert('ไม่พบข้อมูลคลินิก กรุณาติดต่อผู้ดูแลระบบ')
        return
      }
      
      // Create appointment
      const response = await fetch('/api/booking/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          clinic_id: customer.clinic_id,
          staff_id: selectedStaff.id,
          service_id: selectedService.id,
          start_time: selectedSlot.start_time,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Redirect to payment or confirmation
        if (data.invoice) {
          router.push(`/customer/payments/${data.invoice.id}`)
        } else {
          router.push('/customer/appointments?booking=success')
        }
      } else {
        alert(data.error || 'การจองนัดหมายไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const renderCalendar = () => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    
    const days = []
    let current = startDate
    
    while (current <= monthEnd || days.length < 35) {
      days.push(new Date(current))
      current = addDays(current, 1)
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map(day => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
          const isSelected = isSameDay(day, selectedDate)
          const isPast = isBefore(day, new Date().setHours(0, 0, 0, 0))
          
          return (
            <button
              key={index}
              onClick={() => !isPast && setSelectedDate(day)}
              disabled={isPast}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
              `}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${bookingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-full h-1 mx-2 ${
                bookingStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {bookingStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>เลือกบริการ</CardTitle>
            <CardDescription>
              เลือกบริการที่คุณต้องการจอง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setBookingStep(2)
                  }}
                  className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.duration} นาที
                  </p>
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    ฿{service.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Staff */}
      {bookingStep === 2 && selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>เลือกผู้ให้บริการ</CardTitle>
            <CardDescription>
              เลือกผู้ให้บริการสำหรับ {selectedService.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.map((person) => (
                <div
                  key={person.id}
                  onClick={() => {
                    setSelectedStaff(person)
                    setBookingStep(3)
                  }}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{person.full_name}</h3>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setBookingStep(1)}
              className="mt-4"
            >
              ย้อนกลับ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Time */}
      {bookingStep === 3 && selectedService && selectedStaff && (
        <Card>
          <CardHeader>
            <CardTitle>เลือกเวลา</CardTitle>
            <CardDescription>
              เลือกวันและเวลาที่สะดวกสำหรับ {selectedService.name} กับ {selectedStaff.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {format(selectedDate, 'MMMM yyyy', { locale: th })}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {renderCalendar()}
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="font-medium mb-4">เวลาที่ว่าง</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        p-3 text-sm border rounded-lg transition-colors
                        ${selectedSlot?.start_time === slot.start_time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      {format(new Date(slot.start_time), 'HH:mm')}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  ไม่มีเวลาว่างในวันที่เลือก
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBookingStep(2)}
              >
                ย้อนกลับ
              </Button>
              <Button
                disabled={!selectedSlot}
                onClick={() => setBookingStep(4)}
              >
                ถัดไป
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {bookingStep === 4 && selectedService && selectedStaff && selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>ยืนยันการนัดหมาย</CardTitle>
            <CardDescription>
              กรุณาตรวจสอบรายละเอียดการนัดหมาย
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">รายละเอียดการนัดหมาย</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>บริการ:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>ผู้ให้บริการ:</span>
                  <span>{selectedStaff.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>วันที่:</span>
                  <span>{format(new Date(selectedSlot.start_time), 'd MMMM yyyy', { locale: th })}</span>
                </div>
                <div className="flex justify-between">
                  <span>เวลา:</span>
                  <span>{format(new Date(selectedSlot.start_time), 'HH:mm')}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>ราคา:</span>
                  <span>฿{selectedService.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBookingStep(3)}
              >
                ย้อนกลับ
              </Button>
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
