'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  Bell, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

interface SystemSettings {
  // General
  siteName: string
  siteUrl: string
  supportEmail: string
  
  // Features
  enableRegistration: boolean
  enableSocialAuth: boolean
  enableEmailVerification: boolean
  enableMaintenanceMode: boolean
  
  // Notifications
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  notificationFromEmail: string
  
  // Security
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  enableTwoFactor: boolean
  
  // Database
  autoBackup: boolean
  backupFrequency: string
  retentionDays: number
}

function SystemSettingsContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings>({
    // General
    siteName: 'Beauty with AI Precision',
    siteUrl: 'https://ai367bar.com',
    supportEmail: 'support@ai367bar.com',
    
    // Features
    enableRegistration: true,
    enableSocialAuth: false,
    enableEmailVerification: true,
    enableMaintenanceMode: false,
    
    // Notifications
    enableEmailNotifications: true,
    enablePushNotifications: false,
    notificationFromEmail: 'noreply@ai367bar.com',
    
    // Security
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableTwoFactor: false,
    
    // Database
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings || settings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        // Use default settings
      }
    }

    if (!loading && user && user.role === 'super_admin') {
      loadSettings()
    }
  }, [loading, user])

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError('Failed to save settings. This feature may need API implementation.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">System Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure global system settings and preferences
          </p>
        </div>

        {saveSuccess && (
          <Alert className="mb-6 bg-green-500/10 text-green-500 border-green-500/20">
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Feature Controls</CardTitle>
            <CardDescription>Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableRegistration" className="cursor-pointer">
                  Enable User Registration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                id="enableRegistration"
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableRegistration: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableSocialAuth" className="cursor-pointer">
                  Enable Social Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow login with Google, Facebook, etc.
                </p>
              </div>
              <Switch
                id="enableSocialAuth"
                checked={settings.enableSocialAuth}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableSocialAuth: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailVerification" className="cursor-pointer">
                  Require Email Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify email before access
                </p>
              </div>
              <Switch
                id="enableEmailVerification"
                checked={settings.enableEmailVerification}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableEmailVerification: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableMaintenanceMode" className="cursor-pointer text-orange-500">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Disable site access for maintenance
                </p>
              </div>
              <Switch
                id="enableMaintenanceMode"
                checked={settings.enableMaintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableMaintenanceMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailNotifications" className="cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableEmailNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enablePushNotifications" className="cursor-pointer">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send browser push notifications
                </p>
              </div>
              <Switch
                id="enablePushNotifications"
                checked={settings.enablePushNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enablePushNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="notificationFromEmail">Notification From Email</Label>
              <Input
                id="notificationFromEmail"
                type="email"
                value={settings.notificationFromEmail}
                onChange={(e) => 
                  setSettings({ ...settings, notificationFromEmail: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => 
                  setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.floor(settings.sessionTimeout / 60)} minutes
              </p>
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => 
                  setSettings({ ...settings, maxLoginAttempts: Number.parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => 
                  setSettings({ ...settings, passwordMinLength: Number.parseInt(e.target.value) })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor" className="cursor-pointer">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableTwoFactor: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Settings
            </CardTitle>
            <CardDescription>Configure backup and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup" className="cursor-pointer">
                  Automatic Backups
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup database
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, autoBackup: checked })
                }
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="retentionDays">Backup Retention (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.retentionDays}
                onChange={(e) => 
                  setSettings({ ...settings, retentionDays: Number.parseInt(e.target.value) })
                }
              />
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Manual Backup Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSave} 
            size="lg" 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/super-admin')}
          >
            Cancel
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SystemSettingsContent />
    </Suspense>
  )
}
