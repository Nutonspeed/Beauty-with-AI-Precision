"use client"

import React, { useState, useEffect } from 'react'
import { Clock, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { format } from 'date-fns'

interface StaffAvailability {
  id: string
  staff_id: string
  staff_name: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  max_appointments: number
  slot_duration: number
  break_start_time?: string
  break_end_time?: string
}

interface StaffAvailabilityManagerProps {
  clinicId: string
  staffList: Array<{ id: string; full_name: string }>
  onAvailabilityChange?: () => void
}

const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export function StaffAvailabilityManager({ 
  clinicId, 
  staffList,
  onAvailabilityChange 
}: StaffAvailabilityManagerProps) {
  const [availabilities, setAvailabilities] = useState<StaffAvailability[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<StaffAvailability | null>(null)
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    max_appointments: 1,
    slot_duration: 30,
    break_start_time: '',
    break_end_time: ''
  })

  // Fetch availabilities
  useEffect(() => {
    if (selectedStaff) {
      fetchAvailabilities()
    }
  }, [selectedStaff])

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch(
        `/api/booking/availability?clinic_id=${clinicId}&staff_id=${selectedStaff}`
      )
      const data = await response.json()
      
      if (data.success) {
        setAvailabilities(data.availabilities)
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAvailability 
        ? `/api/booking/availability/${editingAvailability.id}`
        : '/api/booking/availability'
      
      const method = editingAvailability ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clinic_id: clinicId,
          staff_id: selectedStaff
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setIsDialogOpen(false)
        setEditingAvailability(null)
        resetForm()
        fetchAvailabilities()
        onAvailabilityChange?.()
      }
    } catch (error) {
      console.error('Error saving availability:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบเวลาทำงานนี้ใช่หรือไม่?')) return
    
    try {
      const response = await fetch(`/api/booking/availability/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchAvailabilities()
        onAvailabilityChange?.()
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
      max_appointments: 1,
      slot_duration: 30,
      break_start_time: '',
      break_end_time: ''
    })
  }

  const openEditDialog = (availability: StaffAvailability) => {
    setEditingAvailability(availability)
    setFormData({
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      is_available: availability.is_available,
      max_appointments: availability.max_appointments,
      slot_duration: availability.slot_duration,
      break_start_time: availability.break_start_time || '',
      break_end_time: availability.break_end_time || ''
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Staff Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              จัดการเวลาทำงานพนักงาน
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!selectedStaff}
                  onClick={() => {
                    resetForm()
                    setEditingAvailability(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มเวลาทำงาน
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAvailability ? 'แก้ไขเวลาทำงาน' : 'เพิ่มเวลาทำงาน'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>วัน</Label>
                    <Select
                      value={formData.day_of_week.toString()}
                      onValueChange={(value) => 
                        setFormData({ ...formData, day_of_week: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>เวลาเริ่ม</Label>
                      <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => 
                          setFormData({ ...formData, start_time: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>เวลาสิ้นสุด</Label>
                      <Input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => 
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_available}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_available: checked })
                      }
                    />
                    <Label>พร้อมให้บริการ</Label>
                  </div>

                  {formData.is_available && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>จำนวนนัด/ช่วงเวลา</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.max_appointments}
                            onChange={(e) => 
                              setFormData({ ...formData, max_appointments: parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label>ระยะเวลา (นาที)</Label>
                          <Input
                            type="number"
                            min="15"
                            step="15"
                            value={formData.slot_duration}
                            onChange={(e) => 
                              setFormData({ ...formData, slot_duration: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>เวลาพัก (ถ้ามี)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            placeholder="เริ่มพัก"
                            value={formData.break_start_time}
                            onChange={(e) => 
                              setFormData({ ...formData, break_start_time: e.target.value })
                            }
                          />
                          <Input
                            type="time"
                            placeholder="สิ้นสุดพัก"
                            value={formData.break_end_time}
                            onChange={(e) => 
                              setFormData({ ...formData, break_end_time: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button type="submit">
                      {editingAvailability ? 'บันทึก' : 'เพิ่ม'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>เลือกพนักงาน</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกพนักงาน..." />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Availability List */}
      {selectedStaff && (
        <Card>
          <CardHeader>
            <CardTitle>เวลาทำงานประจำสัปดาห์</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                ยังไม่มีการตั้งค่าเวลาทำงาน
              </p>
            ) : (
              <div className="space-y-2">
                {availabilities.map((availability) => (
                  <div
                    key={availability.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      !availability.is_available && "opacity-50"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {dayNames[availability.day_of_week]}
                        </Badge>
                        {availability.is_available ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {availability.start_time} - {availability.end_time}
                        {availability.is_available && (
                          <span className="ml-2">
                            ({availability.max_appointments} นัด/ช่วง, {availability.slot_duration} นาที/นัด)
                          </span>
                        )}
                      </div>
                      {availability.break_start_time && availability.break_end_time && (
                        <div className="text-sm text-muted-foreground">
                          พัก: {availability.break_start_time} - {availability.break_end_time}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(availability)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(availability.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
