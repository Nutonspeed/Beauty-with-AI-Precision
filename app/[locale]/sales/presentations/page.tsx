"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Trash2,
  Download,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

interface PresentationRecord {
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  status: 'completed' | 'incomplete'
  currentStep: number
  totalSteps: number
  createdAt: Date
  completedAt: Date | null
  totalValue: number
  signature: string | null
}

const STEP_NAMES = [
  "ข้อมูลลูกค้า",
  "สแกนใบหน้า", 
  "วิเคราะห์ AI",
  "ดู AR Preview",
  "เลือกผลิตภัณฑ์",
  "สร้างใบเสนอราคา",
  "เซ็นสัญญา"
]

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<PresentationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = () => {
    try {
      const records: PresentationRecord[] = []
      
      // Scan localStorage for all presentations
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sales-presentation-')) {
          const customerId = key.replace('sales-presentation-', '')
          const dataStr = localStorage.getItem(key)
          
          if (dataStr) {
            const data = JSON.parse(dataStr)
            
            // Calculate current step
            let currentStep = 0
            if (data.customer?.name) currentStep = 1
            if (data.scannedImages?.front) currentStep = 2
            if (data.analysisResults) currentStep = 3
            if (data.selectedTreatments?.length > 0) currentStep = 4
            if (data.selectedProducts?.length > 0) currentStep = 5
            if (data.proposal) currentStep = 6
            if (data.signature) currentStep = 7
            
            const status = data.completedAt ? 'completed' : 'incomplete'
            const totalValue = data.proposal?.total || 0
            
            records.push({
              customerId,
              customerName: data.customer?.name || 'Unknown',
              customerPhone: data.customer?.phone || '',
              customerEmail: data.customer?.email || '',
              status,
              currentStep,
              totalSteps: 7,
              createdAt: new Date(), // Would be better to store creation time
              completedAt: data.completedAt ? new Date(data.completedAt) : null,
              totalValue,
              signature: data.signature
            })
          }
        }
      }
      
      setPresentations(records)
    } catch (error) {
      console.error('Error loading presentations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (customerId: string) => {
    if (confirm('ต้องการลบ presentation นี้ใช่หรือไม่?')) {
      localStorage.removeItem(`sales-presentation-${customerId}`)
      loadPresentations()
    }
  }

  // Filter and sort presentations
  const filteredPresentations = useMemo(() => {
    let filtered = presentations

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.customerName.toLowerCase().includes(query) ||
        p.customerPhone.includes(query) ||
        p.customerEmail.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'date-asc':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'value-desc':
        filtered.sort((a, b) => b.totalValue - a.totalValue)
        break
      case 'value-asc':
        filtered.sort((a, b) => a.totalValue - b.totalValue)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
    }

    return filtered
  }, [presentations, searchQuery, filterStatus, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const total = presentations.length
    const completed = presentations.filter(p => p.status === 'completed').length
    const incomplete = total - completed
    const totalValue = presentations
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.totalValue, 0)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, incomplete, totalValue, completionRate }
  }, [presentations])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b bg-background">
          <div className="container py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/sales/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Presentation History</h1>
              <p className="text-muted-foreground mt-1">
                รายการ presentations ทั้งหมด
              </p>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">✅ Completed</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">⏱️ Incomplete</div>
                <div className="text-2xl font-bold text-orange-600">{stats.incomplete}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Completion Rate</div>
                <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-purple-600">
                  ฿{stats.totalValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="incomplete">⏱️ Incomplete</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                    <SelectItem value="value-asc">Value (Low to High)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            แสดง {filteredPresentations.length} รายการจาก {presentations.length} รายการทั้งหมด
          </div>

          {/* Presentations List */}
          <div className="space-y-4">
            {filteredPresentations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูล</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา'
                      : 'ยังไม่มี presentation ในระบบ'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPresentations.map((presentation) => (
                <Card key={presentation.customerId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Customer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold text-lg">{presentation.customerName}</h3>
                              <Badge 
                                variant={presentation.status === 'completed' ? 'default' : 'secondary'}
                                className={presentation.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}
                              >
                                {presentation.status === 'completed' ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Step {presentation.currentStep}/7
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {presentation.customerPhone && (
                                <div>📞 {presentation.customerPhone}</div>
                              )}
                              {presentation.customerEmail && (
                                <div>✉️ {presentation.customerEmail}</div>
                              )}
                              {presentation.status === 'incomplete' && (
                                <div className="text-xs mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {STEP_NAMES[presentation.currentStep - 1] || 'เริ่มต้น'}
                                  </Badge>
                                  <span className="ml-2 text-muted-foreground">
                                    → ต่อไป: {STEP_NAMES[presentation.currentStep] || 'เสร็จสิ้น'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar for Incomplete */}
                        {presentation.status === 'incomplete' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round((presentation.currentStep / 7) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                style={{ width: `${(presentation.currentStep / 7) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Value & Date */}
                        <div className="flex items-center gap-4 text-sm">
                          {presentation.status === 'completed' && (
                            <div className="font-medium text-green-600">
                              ฿{presentation.totalValue.toLocaleString()}
                            </div>
                          )}
                          <div className="text-muted-foreground">
                            {presentation.completedAt 
                              ? `เสร็จเมื่อ ${formatDistanceToNow(presentation.completedAt, { addSuffix: true, locale: th })}`
                              : `สร้างเมื่อ ${formatDistanceToNow(presentation.createdAt, { addSuffix: true, locale: th })}`
                            }
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link href={`/sales/wizard/${presentation.customerId}`}>
                          <Button size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            {presentation.status === 'completed' ? 'ดู' : 'ทำต่อ'}
                          </Button>
                        </Link>
                        {presentation.status === 'completed' && (
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(presentation.customerId)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
