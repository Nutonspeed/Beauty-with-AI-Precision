'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  Building,
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface ClinicPerformance {
  id: string
  name: string
  metrics: {
    patients: {
      total: number
      new: number
      recurring: number
      growthRate: number
    }
    revenue: {
      total: number
      monthly: number
      averagePerPatient: number
      growthRate: number
    }
    appointments: {
      total: number
      completed: number
      cancelled: number
      noShow: number
      completionRate: number
    }
    satisfaction: {
      averageRating: number
      totalReviews: number
      responseRate: number
    }
    efficiency: {
      avgAppointmentDuration: number
      patientsPerDay: number
      utilizationRate: number
    }
  }
  ranking: {
    overall: number
    patients: number
    revenue: number
    satisfaction: number
  }
  trend: {
    patients: 'up' | 'down' | 'stable'
    revenue: 'up' | 'down' | 'stable'
    satisfaction: 'up' | 'down' | 'stable'
  }
}

export default function ClinicPerformancePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [clinics, setClinics] = useState<ClinicPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [metric, setMetric] = useState('all')
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchPerformanceData()
    }
  }, [user, authLoading, period, metric])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        period,
        metric,
      })

      const response = await fetch(`/api/admin/clinic-performance?${params}`)
      if (!response.ok) throw new Error('Failed to fetch performance data')
      const data = await response.json()
      setClinics(data.clinics)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getRankingColor = (rank: number, total: number) => {
    const percentile = (rank / total) * 100
    if (percentile <= 20) return 'text-green-600 bg-green-100'
    if (percentile <= 40) return 'text-blue-600 bg-blue-100'
    if (percentile <= 60) return 'text-yellow-600 bg-yellow-100'
    if (percentile <= 80) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const exportReport = async () => {
    try {
      const params = new URLSearchParams({
        period,
        metric,
        format: 'csv',
      })

      const response = await fetch(`/api/admin/clinic-performance/export?${params}`)
      if (!response.ok) throw new Error('Failed to export report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clinic-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (loading) {
    return <div className="text-center py-8">Loading performance data...</div>
  }

  const topClinics = clinics.sort((a, b) => a.ranking.overall - b.ranking.overall).slice(0, 10)
  const selectedClinicData = selectedClinic ? clinics.find(c => c.id === selectedClinic) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clinic Performance Metrics</h1>
          <p className="text-muted-foreground">
            Compare and analyze clinic performance across key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchPerformanceData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Performing Clinics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClinics.map((clinic, index) => (
              <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{clinic.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rank #{clinic.ranking.overall} overall
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-medium">{formatCurrency(clinic.metrics.revenue.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Patients</p>
                    <p className="font-medium">{formatNumber(clinic.metrics.patients.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{clinic.metrics.satisfaction.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(clinic.trend.revenue)}
                    {getTrendIcon(clinic.trend.patients)}
                    {getTrendIcon(clinic.trend.satisfaction)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topClinics.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="metrics.revenue.total" name="Revenue" fill="#8884d8" />
                    <Bar dataKey="metrics.patients.total" name="Patients" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topClinics.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="metrics.satisfaction.averageRating" name="Rating" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Highest Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clinics
                    .sort((a, b) => b.metrics.revenue.total - a.metrics.revenue.total)
                    .slice(0, 5)
                    .map((clinic, index) => (
                      <div key={clinic.id} className="flex justify-between items-center">
                        <span className="text-sm">{clinic.name}</span>
                        <span className="font-medium">{formatCurrency(clinic.metrics.revenue.total)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fastest Growing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clinics
                    .filter(c => c.trend.revenue === 'up')
                    .sort((a, b) => b.metrics.revenue.growthRate - a.metrics.revenue.growthRate)
                    .slice(0, 5)
                    .map((clinic, index) => (
                      <div key={clinic.id} className="flex justify-between items-center">
                        <span className="text-sm">{clinic.name}</span>
                        <span className="font-medium text-green-600">+{clinic.metrics.revenue.growthRate.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average per Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clinics
                    .sort((a, b) => b.metrics.revenue.averagePerPatient - a.metrics.revenue.averagePerPatient)
                    .slice(0, 5)
                    .map((clinic, index) => (
                      <div key={clinic.id} className="flex justify-between items-center">
                        <span className="text-sm">{clinic.name}</span>
                        <span className="font-medium">{formatCurrency(clinic.metrics.revenue.averagePerPatient)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Acquisition & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topClinics.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="metrics.patients.new" name="New Patients" fill="#8884d8" />
                  <Bar dataKey="metrics.patients.recurring" name="Recurring Patients" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClinics.slice(0, 5).map((clinic) => (
                    <div key={clinic.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{clinic.name}</span>
                        <span>{clinic.metrics.appointments.completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={clinic.metrics.appointments.completionRate} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Patient Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClinics.slice(0, 5).map((clinic) => (
                    <div key={clinic.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{clinic.name}</span>
                        <span>{clinic.metrics.efficiency.patientsPerDay} patients/day</span>
                      </div>
                      <Progress value={(clinic.metrics.efficiency.patientsPerDay / 50) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clinics Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Overall Rank</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Trends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>
                    <Badge className={getRankingColor(clinic.ranking.overall, clinics.length)}>
                      #{clinic.ranking.overall}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(clinic.metrics.revenue.total)}</TableCell>
                  <TableCell>{formatNumber(clinic.metrics.patients.total)}</TableCell>
                  <TableCell>{clinic.metrics.appointments.completionRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{clinic.metrics.satisfaction.averageRating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {getTrendIcon(clinic.trend.revenue)}
                      {getTrendIcon(clinic.trend.patients)}
                      {getTrendIcon(clinic.trend.satisfaction)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
