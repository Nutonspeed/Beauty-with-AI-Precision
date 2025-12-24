/**
 * Payment Success Page
 * Shows after successful Stripe payment
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setError('ไม่พบข้อมูลการชำระเงิน')
      setLoading(false)
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      // In production, you'd verify the session with Stripe
      // For now, just show success
      
      // Get invoice info from session metadata or redirect
      setLoading(false)
    } catch (error) {
      console.error('Payment verification error:', error)
      setError('ไม่สามารถตรวจสอบการชำระเงินได้')
      setLoading(false)
    }
  }

  const handleDownloadReceipt = async () => {
    // TODO: Download receipt PDF
    console.log('Download receipt')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/customer/payments">
          <Button>กลับไปหน้าการชำระเงิน</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ชำระเงินสำเร็จ!
          </h1>
          <p className="text-gray-600 mb-6">
            การชำระเงินของคุณได้รับการยืนยันเรียบร้อยแล้ว
          </p>
          <p className="text-sm text-gray-500">
            อีเมลยืนยันการชำระเงินจะถูกส่งไปยังอีเมลของคุณ
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>ขั้นตอนถัดไป</CardTitle>
          <CardDescription>
            คุณสามารถทำสิ่งต่อไปนี้ได้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/customer/appointments">
              <Button variant="outline" className="w-full">
                ดูนัดหมายของฉัน
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลดใบเสร็จ
            </Button>
          </div>
          <Link href="/customer/booking">
            <Button className="w-full">
              จองนัดหมายเพิ่มเติม
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Link href="/customer">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าแรก
          </Button>
        </Link>
      </div>
    </div>
  )
}
