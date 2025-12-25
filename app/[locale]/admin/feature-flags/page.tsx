'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Settings,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Bot,
  CreditCard,
  Mail,
  MessageSquare,
  BarChart3,
  Languages,
  Palette,
  FileText,
  Zap,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Calendar,
  Gift,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface FeatureFlag {
  id: string
  clinic_id: string
  clinic_name: string
  feature_key: string
  is_enabled: boolean
  metadata: any
  updated_at: string
}

interface ClinicFeatures {
  clinic_id: string
  clinic_name: string
  features: Record<string, {
    id: string
    is_enabled: boolean
    metadata: any
    updated_at: string
  }>
}

const FEATURE_DEFINITIONS = {
  ai_skin_analysis: {
    name: 'AI Skin Analysis',
    description: 'AI-powered skin analysis feature',
    icon: Bot,
    category: 'AI Features',
    defaultEnabled: true,
  },
  ar_visualization: {
    name: 'AR Visualization',
    description: 'AR visualization for treatments',
    icon: Eye,
    category: 'AI Features',
    defaultEnabled: false,
  },
  online_booking: {
    name: 'Online Booking',
    description: 'Online appointment booking',
    icon: Calendar,
    category: 'Core Features',
    defaultEnabled: true,
  },
  payment_gateway: {
    name: 'Payment Gateway',
    description: 'Payment processing',
    icon: CreditCard,
    category: 'Core Features',
    defaultEnabled: true,
  },
  loyalty_program: {
    name: 'Loyalty Program',
    description: 'Customer loyalty points system',
    icon: Gift,
    category: 'Marketing',
    defaultEnabled: false,
  },
  email_notifications: {
    name: 'Email Notifications',
    description: 'Email notifications',
    icon: Mail,
    category: 'Communications',
    defaultEnabled: true,
  },
  sms_notifications: {
    name: 'SMS Notifications',
    description: 'SMS notifications',
    icon: MessageSquare,
    category: 'Communications',
    defaultEnabled: false,
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Advanced analytics dashboard',
    icon: BarChart3,
    category: 'Analytics',
    defaultEnabled: false,
  },
  api_access: {
    name: 'API Access',
    description: 'API access for integrations',
    icon: Globe,
    category: 'Integrations',
    defaultEnabled: false,
  },
  multi_language: {
    name: 'Multi-Language',
    description: 'Multi-language support',
    icon: Languages,
    category: 'Localization',
    defaultEnabled: true,
  },
  custom_branding: {
    name: 'Custom Branding',
    description: 'Custom branding options',
    icon: Palette,
    category: 'Customization',
    defaultEnabled: false,
  },
  export_reports: {
    name: 'Export Reports',
    description: 'Export reports functionality',
    icon: FileText,
    category: 'Analytics',
    defaultEnabled: true,
  },
}

export default function FeatureFlagsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [clinics, setClinics] = useState<ClinicFeatures[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedClinic, setSelectedClinic] = useState('all')
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkFeature, setBulkFeature] = useState('')
  const [bulkEnabled, setBulkEnabled] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchFeatureFlags()
    }
  }, [user, authLoading])

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedClinic !== 'all') params.append('clinicId', selectedClinic)

      const response = await fetch(`/api/admin/feature-flags?${params}`)
      if (!response.ok) throw new Error('Failed to fetch feature flags')
      const data = await response.json()
      setClinics(data.clinics)
    } catch (error) {
      console.error('Error fetching feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (clinicId: string, featureKey: string, currentEnabled: boolean) => {
    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          featureKey,
          isEnabled: !currentEnabled,
        }),
      })

      if (!response.ok) throw new Error('Failed to update feature flag')
      
      await fetchFeatureFlags()
    } catch (error) {
      console.error('Error toggling feature:', error)
    }
  }

  const bulkUpdateFeature = async () => {
    if (!bulkFeature) return

    try {
      const clinicIds = clinics.map(c => c.clinic_id)
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicIds,
          featureKey: bulkFeature,
          isEnabled: bulkEnabled,
        }),
      })

      if (!response.ok) throw new Error('Failed to bulk update')
      
      await fetchFeatureFlags()
      setIsBulkDialogOpen(false)
    } catch (error) {
      console.error('Error bulk updating:', error)
    }
  }

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(Object.values(FEATURE_DEFINITIONS).map(f => f.category)))]

  const getFeatureIcon = (featureKey: string) => {
    const feature = FEATURE_DEFINITIONS[featureKey as keyof typeof FEATURE_DEFINITIONS]
    return feature?.icon || Settings
  }

  const getFeatureName = (featureKey: string) => {
    const feature = FEATURE_DEFINITIONS[featureKey as keyof typeof FEATURE_DEFINITIONS]
    return feature?.name || featureKey
  }

  const getFeatureCategory = (featureKey: string) => {
    const feature = FEATURE_DEFINITIONS[featureKey as keyof typeof FEATURE_DEFINITIONS]
    return feature?.category || 'Other'
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">
            Control feature availability per clinic
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
          <Button onClick={fetchFeatureFlags} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.clinic_id} value={clinic.clinic_id}>
                    {clinic.clinic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading feature flags...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    {Object.keys(FEATURE_DEFINITIONS).map((featureKey) => (
                      <TableHead key={featureKey} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {React.createElement(getFeatureIcon(featureKey), { className: "w-4 h-4" })}
                          <span className="text-xs">{getFeatureName(featureKey)}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((clinic) => (
                    <TableRow key={clinic.clinic_id}>
                      <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                      {Object.keys(FEATURE_DEFINITIONS).map((featureKey) => {
                        const feature = clinic.features[featureKey]
                        const isEnabled = feature?.is_enabled || false
                        const Icon = getFeatureIcon(featureKey)
                        
                        return (
                          <TableCell key={featureKey} className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFeature(clinic.clinic_id, featureKey, isEnabled)}
                              className={`w-16 h-8 p-0 ${
                                isEnabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'
                              }`}
                            >
                              {isEnabled ? (
                                <ToggleRight className="w-6 h-6" />
                              ) : (
                                <ToggleLeft className="w-6 h-6" />
                              )}
                            </Button>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Feature</Label>
              <Select value={bulkFeature} onValueChange={setBulkFeature}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a feature" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEATURE_DEFINITIONS).map(([key, feature]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {React.createElement(feature.icon, { className: "w-4 h-4" })}
                        {feature.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Enable for all clinics</Label>
              <Switch
                checked={bulkEnabled}
                onCheckedChange={setBulkEnabled}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={bulkUpdateFeature} disabled={!bulkFeature}>
                Update All Clinics
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
