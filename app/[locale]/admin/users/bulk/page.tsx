'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  Building,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface BulkUser {
  email: string
  name?: string
  role: 'super_admin' | 'clinic_admin' | 'staff' | 'customer'
  clinic_id?: string
  phone?: string
  status?: 'pending' | 'active' | 'suspended'
}

interface UserPreview {
  row: number
  data: BulkUser
  errors: string[]
  isValid: boolean
}

interface ExistingUser {
  id: string
  email: string
  name: string
  role: string
  clinic_id: string
  status: string
  created_at: string
}

export default function BulkUserManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // States
  const [activeTab, setActiveTab] = useState('import')
  const [csvData, setCsvData] = useState<UserPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedUsers, setProcessedUsers] = useState<{
    success: BulkUser[]
    failed: { user: BulkUser; error: string }[]
  }>({ success: [], failed: [] })
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([])
  const [selectedClinic, setSelectedClinic] = useState('')
  const [bulkRole, setBulkRole] = useState<'clinic_admin' | 'staff' | 'customer'>('customer')
  
  // Dialog states
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchClinics()
      fetchExistingUsers()
    }
  }, [user, authLoading])

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/admin/clinics')
      if (!response.ok) throw new Error('Failed to fetch clinics')
      const data = await response.json()
      setClinics(data.clinics || [])
    } catch (error) {
      console.error('Error fetching clinics:', error)
    }
  }

  const fetchExistingUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=1000')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setExistingUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    const users: UserPreview[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const userData: any = {}
      const errors: string[] = []
      
      // Map CSV columns to user data
      headers.forEach((header, index) => {
        const value = values[index] || ''
        switch (header) {
          case 'email':
            userData.email = value
            if (!value || !value.includes('@')) {
              errors.push('Invalid email')
            }
            break
          case 'name':
            userData.name = value
            break
          case 'role':
            userData.role = value
            if (!['super_admin', 'clinic_admin', 'staff', 'customer'].includes(value)) {
              errors.push('Invalid role')
            }
            break
          case 'clinic_id':
            userData.clinic_id = value
            break
          case 'phone':
            userData.phone = value
            break
          case 'status':
            userData.status = value
            break
        }
      })
      
      // Check for duplicate email
      const isDuplicate = existingUsers.some(u => u.email === userData.email) ||
                         users.some(u => u.data.email === userData.email)
      if (isDuplicate) {
        errors.push('Email already exists')
      }
      
      users.push({
        row: i + 1,
        data: userData,
        errors,
        isValid: errors.length === 0
      })
    }
    
    setCsvData(users)
    setIsPreviewDialogOpen(true)
  }

  const processBulkUsers = async () => {
    setIsProcessing(true)
    const success: BulkUser[] = []
    const failed: { user: BulkUser; error: string }[] = []
    
    for (const preview of csvData) {
      if (!preview.isValid) {
        failed.push({ user: preview.data, error: preview.errors.join(', ') })
        continue
      }
      
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preview.data)
        })
        
        if (!response.ok) {
          const error = await response.text()
          throw new Error(error)
        }
        
        success.push(preview.data)
      } catch (error) {
        failed.push({ 
          user: preview.data, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    setProcessedUsers({ success, failed })
    setIsProcessing(false)
    setIsPreviewDialogOpen(false)
    setIsResultDialogOpen(true)
  }

  const downloadTemplate = () => {
    const csv = `email,name,role,clinic_id,phone,status
john.doe@example.com,John Doe,customer,clinic-uuid-here,+66123456789,active
jane.smith@example.com,Jane Smith,staff,clinic-uuid-here,+66123456790,active`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-users-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const createBulkUsers = async () => {
    if (!selectedClinic || !bulkRole) return
    
    setIsProcessing(true)
    const success: BulkUser[] = []
    const failed: { user: BulkUser; error: string }[] = []
    
    // Generate 10 sample users
    for (let i = 1; i <= 10; i++) {
      const userData: BulkUser = {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        role: bulkRole,
        clinic_id: selectedClinic,
        status: 'active'
      }
      
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        
        if (!response.ok) {
          const error = await response.text()
          throw new Error(error)
        }
        
        success.push(userData)
      } catch (error) {
        failed.push({ 
          user: userData, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    setProcessedUsers({ success, failed })
    setIsProcessing(false)
    setIsResultDialogOpen(true)
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
          <h1 className="text-3xl font-bold">Bulk User Management</h1>
          <p className="text-muted-foreground">
            Import, export, and manage users in bulk
          </p>
        </div>
        <Button onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import">Import Users</TabsTrigger>
          <TabsTrigger value="create">Bulk Create</TabsTrigger>
          <TabsTrigger value="export">Export Users</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Users from CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Upload CSV File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">CSV Format:</h4>
                <code className="text-sm">
                  email,name,role,clinic_id,phone,status
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Required: email, role<br />
                  Optional: name, clinic_id (for non-customers), phone, status
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Bulk Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Clinic</Label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>User Role</Label>
                <Select value={bulkRole} onValueChange={(value: any) => setBulkRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={createBulkUsers} disabled={!selectedClinic || isProcessing}>
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Create 10 Sample Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Export all users to CSV for backup or analysis.
              </p>
              <Button className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Export All Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Import ({csvData.length} users)</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{csvData.filter(u => u.isValid).length} Valid</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{csvData.filter(u => !u.isValid).length} Invalid</span>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.map((preview) => (
                  <TableRow key={preview.row}>
                    <TableCell>{preview.row}</TableCell>
                    <TableCell>{preview.data.email}</TableCell>
                    <TableCell>{preview.data.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={preview.isValid ? 'default' : 'destructive'}>
                        {preview.data.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{preview.data.clinic_id || '-'}</TableCell>
                    <TableCell>{preview.data.status || '-'}</TableCell>
                    <TableCell>
                      {preview.errors.length > 0 && (
                        <div className="text-red-500 text-sm">
                          {preview.errors.join(', ')}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={processBulkUsers}
                disabled={csvData.filter(u => u.isValid).length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Import {csvData.filter(u => u.isValid).length} Users
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Success</span>
                  </div>
                  <p className="text-2xl font-bold">{processedUsers.success.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <p className="text-2xl font-bold">{processedUsers.failed.length}</p>
                </CardContent>
              </Card>
            </div>
            
            {processedUsers.failed.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Failed Imports:</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {processedUsers.failed.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{item.user.email}</span>: {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={() => setIsResultDialogOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
