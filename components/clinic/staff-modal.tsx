"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'

interface StaffMember {
  id: string
  user_id: string
  clinic_id: string | null
  role: string
  specialty: string | null
  status: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  rating: number
  working_hours: any
  days_off: string[] | null
  hired_date: string | null
  bio: string | null
  certifications: string[] | null
  languages: string[] | null
  metadata: any
}

interface StaffModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editStaff?: StaffMember | null
  users?: Array<{ id: string; email: string; full_name: string }>
}

const ROLES = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' }
]

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export default function StaffModal({ 
  open, 
  onClose, 
  onSuccess, 
  editStaff,
  users = []
}: StaffModalProps) {
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('receptionist')
  const [specialty, setSpecialty] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [hiredDate, setHiredDate] = useState('')
  const [bio, setBio] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseExpiry, setLicenseExpiry] = useState('')
  
  // Working hours state
  const [workingHours, setWorkingHours] = useState<any>({})
  const [daysOff, setDaysOff] = useState<string[]>([])
  
  // Arrays
  const [certifications, setCertifications] = useState<string[]>([''])
  const [languages, setLanguages] = useState<string[]>(['th'])

  // Pre-fill form if editing
  useEffect(() => {
    if (editStaff) {
      setUserId(editStaff.user_id || '')
      setRole(editStaff.role || 'receptionist')
      setSpecialty(editStaff.specialty || '')
      setFullName(editStaff.full_name || '')
      setEmail(editStaff.email || '')
      setPhone(editStaff.phone || '')
      setHiredDate(editStaff.hired_date || '')
      setBio(editStaff.bio || '')
      setWorkingHours(editStaff.working_hours || {})
      setDaysOff(editStaff.days_off || [])
      setCertifications(editStaff.certifications && editStaff.certifications.length > 0 ? editStaff.certifications : [''])
      setLanguages(editStaff.languages || ['th'])
      setLicenseNumber(editStaff.metadata?.license_number || '')
      setLicenseExpiry(editStaff.metadata?.license_expiry || '')
    } else {
      // Reset form
      setUserId('')
      setRole('receptionist')
      setSpecialty('')
      setFullName('')
      setEmail('')
      setPhone('')
      setHiredDate('')
      setBio('')
      setWorkingHours({})
      setDaysOff([])
      setCertifications([''])
      setLanguages(['th'])
      setLicenseNumber('')
      setLicenseExpiry('')
    }
  }, [editStaff, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!editStaff && !userId) {
      toast.error('Please select a user')
      return
    }
    if (!fullName || !email) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        role,
        full_name: fullName,
        email,
        phone: phone || null,
        specialty: specialty || null,
        hired_date: hiredDate || null,
        bio: bio || null,
        working_hours: workingHours,
        days_off: daysOff.length > 0 ? daysOff : null,
        certifications: certifications.filter(c => c.trim() !== ''),
        languages: languages.filter(l => l.trim() !== ''),
        license_number: licenseNumber || null,
        license_expiry: licenseExpiry || null
      }

      if (!editStaff) {
        payload.user_id = userId
        payload.clinic_id = null // Will be set by RLS or app logic
      }

      const url = editStaff 
        ? `/api/clinic/staff/${editStaff.id}`
        : '/api/clinic/staff'
      
      const method = editStaff ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save staff member')
      }

      toast.success(editStaff ? 'Staff member updated successfully' : 'Staff member created successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving staff:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save staff member')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCertification = () => {
    setCertifications([...certifications, ''])
  }

  const handleRemoveCertification = (index: number) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((_, i) => i !== index))
    }
  }

  const handleCertificationChange = (index: number, value: string) => {
    const updated = [...certifications]
    updated[index] = value
    setCertifications(updated)
  }

  const handleAddLanguage = () => {
    setLanguages([...languages, ''])
  }

  const handleRemoveLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index))
    }
  }

  const handleLanguageChange = (index: number, value: string) => {
    const updated = [...languages]
    updated[index] = value
    setLanguages(updated)
  }

  const handleWorkingHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...(workingHours[day] || {}),
        [field]: value
      }
    })
  }

  const handleToggleDayOff = (day: string) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter(d => d !== day))
    } else {
      setDaysOff([...daysOff, day])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection (only for new staff) */}
          {!editStaff && (
            <div className="space-y-2">
              <Label htmlFor="user">User Account *</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Dr. Sarah Johnson"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g., Dermatology, Laser Treatments"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hiredDate">Hired Date</Label>
                  <Input
                    id="hiredDate"
                    type="date"
                    value={hiredDate}
                    onChange={(e) => setHiredDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description about this staff member..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* License Information (for doctors/nurses) */}
          {(role === 'doctor' || role === 'nurse') && (
            <Card>
              <CardHeader>
                <CardTitle>License Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g., MD12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Working Schedule</CardTitle>
              <CardDescription>Set working hours for each day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAYS_OF_WEEK.map(day => {
                const isDayOff = daysOff.includes(day.value)
                return (
                  <div key={day.value} className="flex items-center gap-4">
                    <div className="w-32">
                      <Badge variant={isDayOff ? "outline" : "default"}>
                        {day.label}
                      </Badge>
                    </div>
                    
                    <Button
                      type="button"
                      variant={isDayOff ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleDayOff(day.value)}
                    >
                      {isDayOff ? 'Day Off' : 'Working'}
                    </Button>

                    {!isDayOff && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={workingHours[day.value]?.start || ''}
                          onChange={(e) => handleWorkingHoursChange(day.value, 'start', e.target.value)}
                          placeholder="Start"
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={workingHours[day.value]?.end || ''}
                          onChange={(e) => handleWorkingHoursChange(day.value, 'end', e.target.value)}
                          placeholder="End"
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Professional certifications and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    placeholder="e.g., Board Certified Dermatologist"
                  />
                  {certifications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveCertification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCertification}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Languages spoken by this staff member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {languages.map((lang, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={lang}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    placeholder="e.g., th, en, zh"
                  />
                  {languages.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveLanguage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLanguage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
