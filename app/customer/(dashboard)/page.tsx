/**
 * Customer Dashboard
 * Main portal page for customers
 */

import { createClient } from '@/lib/supabase/server'
import { Calendar, CreditCard, History, User } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  
  // Get user info
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  // Get upcoming appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      services!appointments_service_id_fkey (
        name,
        duration
      ),
      staff!appointments_staff_id_fkey (
        full_name
      )
    `)
    .eq('customer_id', customer?.id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3)

  // Get unpaid invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customer?.id)
    .eq('status', 'sent')
    .order('issue_date', { ascending: false })
    .limit(3)

  const upcomingCount = appointments?.length || 0
  const unpaidCount = invoices?.length || 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          ยินดีต้อนรับ, {customer?.full_name}
        </h2>
        <p className="mt-1 text-gray-600">
          จัดการการนัดหมายและการชำระเงินของคุณ
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              จองนัดหมาย
            </CardTitle>
            <CardDescription>
              จองนัดหมายใหม่
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/booking">
              <Button className="w-full">
                จองเลย
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <History className="h-5 w-5 mr-2 text-green-600" />
              ประวัติการนัดหมาย
            </CardTitle>
            <CardDescription>
              {upcomingCount} นัดหมายที่จะถึง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/appointments">
              <Button variant="outline" className="w-full">
                ดูทั้งหมด
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              การชำระเงิน
            </CardTitle>
            <CardDescription>
              {unpaidCount} ใบแจ้งหนี้รอชำระ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/payments">
              <Button variant="outline" className="w-full">
                จัดการ
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-gray-600" />
              โปรไฟล์
            </CardTitle>
            <CardDescription>
              จัดการข้อมูลส่วนตัว
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/profile">
              <Button variant="outline" className="w-full">
                แก้ไข
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {appointments && appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>นัดหมายที่จะถึงนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{apt.services?.name}</p>
                    <p className="text-sm text-gray-600">
                      กับ {apt.staff?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.start_time).toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : apt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status === 'confirmed' ? 'ยืนยันแล้ว' :
                       apt.status === 'pending' ? 'รอยืนยัน' : apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/customer/appointments">
                <Button variant="outline">ดูนัดหมายทั้งหมด</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unpaid Invoices */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ใบแจ้งหนี้รอชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      วันที่ {new Date(invoice.issue_date).toLocaleDateString('th-TH')}
                    </p>
                    <p className="text-sm text-gray-500">
                      ครบกำหนด {new Date(invoice.due_date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ฿{invoice.total_amount.toFixed(2)}
                    </p>
                    <Link href={`/customer/payments/${invoice.id}`}>
                      <Button size="sm" className="mt-1">
                        ชำระเงิน
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/customer/payments">
                <Button variant="outline">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!appointments || appointments.length === 0) && 
       (!invoices || invoices.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ยังไม่มีนัดหมาย
            </h3>
            <p className="text-gray-600 mb-4">
              จองนัดหมายแรกของคุณวันนี้
            </p>
            <Link href="/customer/booking">
              <Button>จองนัดหมาย</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
