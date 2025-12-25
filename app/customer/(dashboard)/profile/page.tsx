/**
 * Customer Profile Page
 * Allows customers to manage their personal information
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CustomerProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  birth_date?: string
  gender?: string
  allergies?: string
  medical_notes?: string
}

export default function CustomerProfilePage() {
  const supabase = createClient()
  
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: '',
    allergies: '',
    medical_notes: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        birth_date: data.birth_date || '',
        gender: data.gender || '',
        allergies: data.allergies || '',
        medical_notes: data.medical_notes || ''
      })
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          allergies: formData.allergies || null,
          medical_notes: formData.medical_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (error) throw error

      toast.success('บันทึกข้อมูลสำเร็จ')
      await fetchProfile()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">โปรไฟล์ของฉัน</h2>
        <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              ข้อมูลพื้นฐาน
            </CardTitle>
            <CardDescription>
              ข้อมูลส่วนตัวพื้นฐานของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                ไม่สามารถเปลี่ยนอีเมลได้
              </p>
            </div>
            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="08x-xxx-xxxx"
              />
            </div>
            <div>
              <Label htmlFor="birth_date">วันเกิด</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">เพศ</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              ที่อยู่
            </CardTitle>
            <CardDescription>
              ที่อยู่สำหรับการติดต่อ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="กรอกที่อยู่ของคุณ"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลทางการแพทย์</CardTitle>
            <CardDescription>
              ข้อมูลสำคัญสำหรับการบริการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="allergies">ประวัติการแพ้</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="ระบุสิ่งที่แพ้ เช่น ยา อาหาร หรืออื่นๆ"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="medical_notes">หมายเหตุทางการแพทย์</Label>
              <Textarea
                id="medical_notes"
                value={formData.medical_notes}
                onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                placeholder="ข้อมูลอื่นๆ ที่แพทย์ควรทราบ"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึกข้อมูล
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
