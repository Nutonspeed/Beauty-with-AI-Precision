"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Phone, MessageCircle } from "lucide-react"

interface Lead {
  id: string
  name: string
  phone: string
  status: "hot" | "warm" | "new" | "cold"
  lastActivity: string
  potentialValue: number
  avatar?: string
  treatment: string
  score: number
}

interface PipelineData {
  leads: Lead[]
  totalValue: number
  averageValue: number
}

export function LivePipeline() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPipeline() {
      try {
        const response = await fetch("/api/clinic/dashboard/pipeline")
        if (!response.ok) {
          throw new Error(`Failed to fetch pipeline: ${response.status}`)
        }
        const result = await response.json()
        
        // Transform pipeline data to leads format
        const allLeads: Lead[] = []
        if (result.pipeline) {
          Object.entries(result.pipeline).forEach(([_status, leads]) => {
            (leads as any[]).forEach((lead) => {
              allLeads.push({
                id: lead.id,
                name: lead.full_name || 'Unknown',
                phone: lead.phone || 'N/A',
                status: mapLeadStatus(lead.lead_status),
                lastActivity: formatLastActivity(lead.created_at),
                potentialValue: calculatePotentialValue(lead.lead_score),
                treatment: 'Consultation', // Default, would come from lead data
                score: lead.lead_score || 0
              })
            })
          })
        }
        
        // Sort by score and take top leads
        allLeads.sort((a, b) => b.score - a.score)
        const topLeads = allLeads.slice(0, 10)
        
        setData({
          leads: topLeads,
          totalValue: topLeads.reduce((sum, lead) => sum + lead.potentialValue, 0),
          averageValue: topLeads.length > 0 
            ? topLeads.reduce((sum, lead) => sum + lead.potentialValue, 0) / topLeads.length 
            : 0
        })
      } catch (err) {
        console.error("[LivePipeline] Error:", err)
        setError(err instanceof Error ? err.message : "Failed to load pipeline")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPipeline()
    const interval = setInterval(fetchPipeline, 2 * 60 * 1000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const mapLeadStatus = (status: string): "hot" | "warm" | "new" | "cold" => {
    if (status === "qualified" || status === "proposal_sent") return "hot"
    if (status === "contacted" || status === "negotiation") return "warm"
    if (status === "new") return "new"
    return "cold"
  }

  const formatLastActivity = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "เมื่อสักครู่"
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} วันที่แล้ว`
  }

  const calculatePotentialValue = (score: number): number => {
    // Estimate potential value based on lead score
    // High score (80-100) = 25k-40k, Medium (60-79) = 15k-25k, Low (0-59) = 8k-15k
    if (score >= 80) return Math.floor(25000 + (score - 80) * 750)
    if (score >= 60) return Math.floor(15000 + (score - 60) * 500)
    return Math.floor(8000 + score * 100)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load pipeline. Please try again.</p>
      </div>
    )
  }

  const hotLeads = data.leads.filter(l => l.status === 'hot')
  const warmLeads = data.leads.filter(l => l.status === 'warm')
  const newLeads = data.leads.filter(l => l.status === 'new')

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "warm": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hot": return "🔥 Hot Lead"
      case "warm": return "🌡️ Warm Lead"
      case "new": return "🆕 New Lead"
      default: return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hot Leads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 Hot Leads Pipeline
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">{hotLeads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>ไม่มี hot leads ในขณะนี้</p>
              <p className="text-sm mt-2">ติดต่อลูกค้าใหม่เพื่อสร้างโอกาส</p>
            </div>
          ) : (
            hotLeads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.treatment}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lead.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">{formatCurrency(lead.potentialValue)}</div>
                <div className="text-sm text-muted-foreground">Score: {lead.score}%</div>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pipeline Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((newLeads.length / Math.max(data.leads.length, 1)) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium">{newLeads.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Warm Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((warmLeads.length / Math.max(data.leads.length, 1)) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium">{warmLeads.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hot Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((hotLeads.length / Math.max(data.leads.length, 1)) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium">{hotLeads.length}</span>
                </div>
              </div>
            </div>

            {/* Total Pipeline Value */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Pipeline Value</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(data.totalValue)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average deal size: {formatCurrency(Math.round(data.averageValue))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Hot Lead
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Proposal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
