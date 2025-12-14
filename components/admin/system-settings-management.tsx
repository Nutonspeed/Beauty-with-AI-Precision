'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Globe,
  Zap,
  Shield,
  CreditCard,
  Save,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
  };
  features: {
    aiAnalysisEnabled: boolean;
    arSimulatorEnabled: boolean;
    videoCallEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  limits: {
    maxClinicsPerOwner: number;
    maxStaffPerClinic: number;
    maxAnalysesPerDay: number;
    maxStoragePerClinicMB: number;
    sessionTimeoutMinutes: number;
  };
  security: {
    requireEmailVerification: boolean;
    require2FA: boolean;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  billing: {
    currency: string;
    taxRate: number;
    freeTrialDays: number;
    gracePeriodDays: number;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    siteName: 'ClinicIQ',
    siteUrl: 'https://cliniciq.app',
    supportEmail: 'support@cliniciq.app',
    defaultLanguage: 'th',
    maintenanceMode: false,
    allowNewRegistrations: true,
  },
  features: {
    aiAnalysisEnabled: true,
    arSimulatorEnabled: true,
    videoCallEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  },
  limits: {
    maxClinicsPerOwner: 5,
    maxStaffPerClinic: 50,
    maxAnalysesPerDay: 100,
    maxStoragePerClinicMB: 5000,
    sessionTimeoutMinutes: 60,
  },
  security: {
    requireEmailVerification: true,
    require2FA: false,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
  },
  billing: {
    currency: 'THB',
    taxRate: 7,
    freeTrialDays: 14,
    gracePeriodDays: 7,
  },
};

export default function SystemSettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system-settings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSettings(data.settings || defaultSettings);
      setLastUpdated(data.updatedAt);
      setUpdatedBy(data.updatedBy);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLastUpdated(data.updatedAt);
      setUpdatedBy(data.updatedBy);
      toast({ title: 'Success', description: 'Settings saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(
    category: K,
    key: keyof SystemSettings[K],
    value: SystemSettings[K][keyof SystemSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" /> System Settings
          </h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleString('th-TH')} by {updatedBy}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general"><Globe className="h-4 w-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="features"><Zap className="h-4 w-4 mr-2" />Features</TabsTrigger>
          <TabsTrigger value="limits"><Settings className="h-4 w-4 mr-2" />Limits</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="h-4 w-4 mr-2" />Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input value={settings.general.siteName} onChange={(e) => updateSetting('general', 'siteName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input value={settings.general.siteUrl} onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input value={settings.general.supportEmail} onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={settings.general.defaultLanguage} onValueChange={(v) => updateSetting('general', 'defaultLanguage', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">Thai</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Disable access for non-admins</p>
                  </div>
                </div>
                <Switch checked={settings.general.maintenanceMode} onCheckedChange={(v) => updateSetting('general', 'maintenanceMode', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow New Registrations</p>
                  <p className="text-sm text-muted-foreground">Enable user self-registration</p>
                </div>
                <Switch checked={settings.general.allowNewRegistrations} onCheckedChange={(v) => updateSetting('general', 'allowNewRegistrations', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'aiAnalysisEnabled', label: 'AI Skin Analysis', desc: 'Enable AI-powered skin analysis' },
                { key: 'arSimulatorEnabled', label: 'AR Simulator', desc: 'Enable AR treatment preview' },
                { key: 'videoCallEnabled', label: 'Video Calls', desc: 'Enable video consultation' },
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS alerts' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send push alerts' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={settings.features[key as keyof typeof settings.features]} onCheckedChange={(v) => updateSetting('features', key as keyof typeof settings.features, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>System Limits</CardTitle>
              <CardDescription>Set resource limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'maxClinicsPerOwner', label: 'Max Clinics per Owner' },
                  { key: 'maxStaffPerClinic', label: 'Max Staff per Clinic' },
                  { key: 'maxAnalysesPerDay', label: 'Max Analyses per Day' },
                  { key: 'maxStoragePerClinicMB', label: 'Max Storage (MB)' },
                  { key: 'sessionTimeoutMinutes', label: 'Session Timeout (min)' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input type="number" value={settings.limits[key as keyof typeof settings.limits]} onChange={(e) => updateSetting('limits', key as keyof typeof settings.limits, parseInt(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-muted-foreground">Users must verify email</p>
                </div>
                <Switch checked={settings.security.requireEmailVerification} onCheckedChange={(v) => updateSetting('security', 'requireEmailVerification', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require 2FA</p>
                  <p className="text-sm text-muted-foreground">Force two-factor auth</p>
                </div>
                <Switch checked={settings.security.require2FA} onCheckedChange={(v) => updateSetting('security', 'require2FA', v)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min Password Length</Label>
                  <Input type="number" value={settings.security.passwordMinLength} onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value) || 8)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input type="number" value={settings.security.maxLoginAttempts} onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)} />
                </div>
                <div className="space-y-2">
                  <Label>Lockout Duration (min)</Label>
                  <Input type="number" value={settings.security.lockoutDurationMinutes} onChange={(e) => updateSetting('security', 'lockoutDurationMinutes', parseInt(e.target.value) || 15)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Payment and subscription config</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.billing.currency} onValueChange={(v) => updateSetting('billing', 'currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" value={settings.billing.taxRate} onChange={(e) => updateSetting('billing', 'taxRate', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Free Trial Days</Label>
                  <Input type="number" value={settings.billing.freeTrialDays} onChange={(e) => updateSetting('billing', 'freeTrialDays', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Grace Period Days</Label>
                  <Input type="number" value={settings.billing.gracePeriodDays} onChange={(e) => updateSetting('billing', 'gracePeriodDays', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
