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
  Loader2,
  Brain,
  Clock,
  Building2,
  Users,
  Sparkles,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
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
      toast({ title: t('common.success'), description: t('common.saved') });
    } catch {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' });
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight italic flex items-center justify-center md:justify-start gap-4">
            <Settings className="h-8 w-8 text-pink-500 animate-pulse" />
            {t('systemSettings.title')}
          </h2>
          {lastUpdated && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
              {t('systemSettings.lastSync')}: {new Date(lastUpdated).toLocaleString('th-TH')} <span className="mx-2">::</span> {t('systemSettings.operator')}: {updatedBy}
            </p>
          )}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={fetchSettings}>
            <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
            {t('systemSettings.schemaSync')}
          </Button>
          <Button 
            variant="premium" 
            className="h-14 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" 
            onClick={saveSettings} 
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Save className="mr-3 h-4 w-4" />}
            {t('systemSettings.commitChanges')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-10">
        <div className="flex items-center justify-center">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2 flex-wrap justify-center">
            {[
              { value: 'general', icon: Globe, label: t('systemSettings.tabs.general') },
              { value: 'features', icon: Zap, label: t('systemSettings.tabs.features') },
              { value: 'limits', icon: Settings, label: t('systemSettings.tabs.limits') },
              { value: 'security', icon: Shield, label: t('systemSettings.tabs.security') },
              { value: 'billing', icon: CreditCard, label: t('systemSettings.tabs.billing') }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="rounded-xl px-6 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full"
              >
                <tab.icon className="w-4 h-4 mr-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TabsContent value="general" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic uppercase tracking-widest">{t('systemSettings.general.title')}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemSettings.general.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { label: t('systemSettings.general.siteName'), value: settings.general.siteName, key: 'siteName' },
                      { label: t('systemSettings.general.siteUrl'), value: settings.general.siteUrl, key: 'siteUrl' },
                      { label: t('systemSettings.general.supportEmail'), value: settings.general.supportEmail, key: 'supportEmail' }
                    ].map((field) => (
                      <div key={field.key} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{field.label}</Label>
                        <Input 
                          value={field.value} 
                          onChange={(e) => updateSetting('general', field.key as any, e.target.value)}
                          className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 focus:ring-pink-500/20 transition-all font-bold italic"
                        />
                      </div>
                    ))}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('systemSettings.general.language')}</Label>
                      <Select value={settings.general.defaultLanguage} onValueChange={(v) => updateSetting('general', 'defaultLanguage', v)}>
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 appearance-none transition-all italic px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                          <SelectItem value="th" className="text-[10px] font-black uppercase tracking-widest italic">THAI_TH</SelectItem>
                          <SelectItem value="en" className="text-[10px] font-black uppercase tracking-widest italic">ENGLISH_US</SelectItem>
                          <SelectItem value="zh" className="text-[10px] font-black uppercase tracking-widest italic">CHINESE_ZH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-rose-500/[0.03] border border-rose-500/20 flex items-center justify-between group/alert">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shadow-inner group-hover/alert:scale-110 transition-transform duration-700">
                        <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-widest">{t('systemSettings.general.maintenance')}</p>
                        <p className="text-[10px] text-slate-500 font-light mt-1">{t('systemSettings.general.maintenanceDesc')}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.general.maintenanceMode} 
                      onCheckedChange={(v) => updateSetting('general', 'maintenanceMode', v)}
                      className="data-[state=checked]:bg-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-white italic uppercase tracking-widest">{t('systemSettings.general.publicIngestion')}</p>
                      <p className="text-[10px] text-slate-500 font-light">{t('systemSettings.general.publicIngestionDesc')}</p>
                    </div>
                    <Switch 
                      checked={settings.general.allowNewRegistrations} 
                      onCheckedChange={(v) => updateSetting('general', 'allowNewRegistrations', v)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Toggles Tab */}
            <TabsContent value="features" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic uppercase tracking-widest">{t('systemSettings.features.title')}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemSettings.features.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { key: 'aiAnalysisEnabled', label: t('systemSettings.features.aiAnalysis.label'), desc: t('systemSettings.features.aiAnalysis.desc'), icon: Brain },
                      { key: 'arSimulatorEnabled', label: t('systemSettings.features.arSimulator.label'), desc: t('systemSettings.features.arSimulator.desc'), icon: Sparkles },
                      { key: 'videoCallEnabled', label: t('systemSettings.features.videoCall.label'), desc: t('systemSettings.features.videoCall.desc'), icon: Globe },
                      { key: 'emailNotifications', label: t('systemSettings.features.email.label'), desc: t('systemSettings.features.email.desc'), icon: Globe },
                      { key: 'smsNotifications', label: t('systemSettings.features.sms.label'), desc: t('systemSettings.features.sms.desc'), icon: Globe },
                      { key: 'pushNotifications', label: t('systemSettings.features.push.label'), desc: t('systemSettings.features.push.desc'), icon: Globe },
                    ].map(({ key, label, desc, icon: Icon }, idx) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group/feature"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/feature:scale-110 transition-transform">
                            <Icon className="h-5 w-5 text-slate-500 group-hover/feature:text-pink-400 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white italic uppercase tracking-widest">{label}</p>
                            <p className="text-[9px] text-slate-600 font-light mt-0.5">{desc}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.features[key as keyof typeof settings.features]} 
                          onCheckedChange={(v) => updateSetting('features', key as keyof typeof settings.features, v)}
                          className="data-[state=checked]:bg-pink-600"
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Limits Tab */}
            <TabsContent value="limits" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic uppercase tracking-widest">{t('systemSettings.limits.title')}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemSettings.limits.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      { key: 'maxClinicsPerOwner', label: t('systemSettings.limits.maxClinics'), icon: Building2 },
                      { key: 'maxStaffPerClinic', label: t('systemSettings.limits.maxStaff'), icon: Users },
                      { key: 'maxAnalysesPerDay', label: t('systemSettings.limits.maxAnalyses'), icon: Brain },
                      { key: 'maxStoragePerClinicMB', label: t('systemSettings.limits.maxStorage'), icon: Database },
                      { key: 'sessionTimeoutMinutes', label: t('systemSettings.limits.sessionTimeout'), icon: Clock },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="space-y-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-cyan-500" />
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{label}</Label>
                        </div>
                        <Input 
                          type="number" 
                          value={settings.limits[key as keyof typeof settings.limits]} 
                          onChange={(e) => updateSetting('limits', key as keyof typeof settings.limits, parseInt(e.target.value) || 0)}
                          className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-cyan-500/30 transition-all font-black italic text-xl tracking-tighter"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic uppercase tracking-widest">{t('systemSettings.security.title')}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemSettings.security.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-widest">{t('systemSettings.security.originValidation')}</p>
                        <p className="text-[10px] text-slate-500 font-light mt-1">{t('systemSettings.security.originValidationDesc')}</p>
                      </div>
                      <Switch checked={settings.security.requireEmailVerification} onCheckedChange={(v) => updateSetting('security', 'requireEmailVerification', v)} className="data-[state=checked]:bg-pink-600" />
                    </div>
                    <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-widest">{t('systemSettings.security.multiFactor')}</p>
                        <p className="text-[10px] text-slate-500 font-light mt-1">{t('systemSettings.security.multiFactorDesc')}</p>
                      </div>
                      <Switch checked={settings.security.require2FA} onCheckedChange={(v) => updateSetting('security', 'require2FA', v)} className="data-[state=checked]:bg-pink-600" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { key: 'passwordMinLength', label: t('systemSettings.security.passwordMin') },
                      { key: 'maxLoginAttempts', label: t('systemSettings.security.maxLoginAttempts') },
                      { key: 'lockoutDurationMinutes', label: t('systemSettings.security.lockoutDuration') },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic ml-4">{label}</Label>
                        <Input 
                          type="number" 
                          value={settings.security[key as 'passwordMinLength' | 'maxLoginAttempts' | 'lockoutDurationMinutes']} 
                          onChange={(e) => updateSetting('security', key as any, parseInt(e.target.value) || 8)}
                          className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-rose-500/30 transition-all font-black italic text-xl tracking-tighter"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic uppercase tracking-widest">{t('systemSettings.billing.title')}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemSettings.billing.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('systemSettings.billing.currency')}</Label>
                      <Select value={settings.billing.currency} onValueChange={(v) => updateSetting('billing', 'currency', v)}>
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 appearance-none transition-all italic px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                          <SelectItem value="THB" className="text-[10px] font-black uppercase tracking-widest italic">THAI_BAHT_THB</SelectItem>
                          <SelectItem value="USD" className="text-[10px] font-black uppercase tracking-widest italic">US_DOLLAR_USD</SelectItem>
                          <SelectItem value="EUR" className="text-[10px] font-black uppercase tracking-widest italic">EURO_EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('systemSettings.billing.taxRate')}</Label>
                      <Input 
                        type="number" 
                        value={settings.billing.taxRate} 
                        onChange={(e) => updateSetting('billing', 'taxRate', parseFloat(e.target.value) || 0)} 
                        className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-emerald-500/30 transition-all font-black italic text-xl tracking-tighter"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('systemSettings.billing.trialDays')}</Label>
                      <Input 
                        type="number" 
                        value={settings.billing.freeTrialDays} 
                        onChange={(e) => updateSetting('billing', 'freeTrialDays', parseInt(e.target.value) || 0)}
                        className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-emerald-500/30 transition-all font-black italic text-xl tracking-tighter"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('systemSettings.billing.gracePeriod')}</Label>
                      <Input 
                        type="number" 
                        value={settings.billing.gracePeriodDays} 
                        onChange={(e) => updateSetting('billing', 'gracePeriodDays', parseInt(e.target.value) || 0)}
                        className="h-14 px-6 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-emerald-500/30 transition-all font-black italic text-xl tracking-tighter"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
