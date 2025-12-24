/**
 * Revenue Chart Component
 * Displays revenue trends over time
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { th } from 'date-fns/locale'

interface RevenueData {
  date: string
  revenue: number
  transactions: number
}

interface RevenueChartProps {
  clinicId: string
  type?: 'line' | 'bar'
}

export default function RevenueChart({ clinicId, type = 'line' }: RevenueChartProps) {
  const supabase = createClient()
  
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchRevenueData()
  }, [clinicId, period])

  const fetchRevenueData = async () => {
    setLoading(true)
    
    try {
      const endDate = endOfDay(new Date())
      const startDate = startOfDay(subDays(endDate, parseInt(period)))
      
      // Fetch payments for the period
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, invoices!inner(clinic_id)')
        .eq('status', 'completed')
        .eq('invoices.clinic_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Group by date
      const groupedData: Record<string, { revenue: number; transactions: number }> = {}
      
      payments?.forEach(payment => {
        const date = format(new Date(payment.created_at), 'yyyy-MM-dd')
        if (!groupedData[date]) {
          groupedData[date] = { revenue: 0, transactions: 0 }
        }
        groupedData[date].revenue += payment.amount
        groupedData[date].transactions += 1
      })

      // Fill missing dates with 0
      const result: RevenueData[] = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        const dateStr = format(current, 'yyyy-MM-dd')
        const dayData = groupedData[dateStr] || { revenue: 0, transactions: 0 }
        
        result.push({
          date: format(current, 'd MMM', { locale: th }),
          revenue: dayData.revenue,
          transactions: dayData.transactions
        })
        
        current.setDate(current.getDate() + 1)
      }

      setData(result)
    } catch (error) {
      console.error('Revenue chart error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600">
            รายได้: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            รายการ: {payload[0].payload.transactions}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>กราฟรายได้</CardTitle>
          <CardDescription>กำลังโหลดข้อมูล...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>กราฟรายได้</CardTitle>
            <CardDescription>แสดงรายได้ในช่วง {period} วันล่าสุด</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วัน</SelectItem>
              <SelectItem value="30">30 วัน</SelectItem>
              <SelectItem value="90">3 เดือน</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
