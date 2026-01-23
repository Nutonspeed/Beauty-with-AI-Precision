'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


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
  Database,
  ChevronRight,
  ShieldCheck,
  Activity,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/hooks/use-toast';

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
    maxCentersPerOwner: number;
    maxStaffPerCenter: number;
    maxAnalysesPerDay: number;
    maxStoragePerCenterMB: number;
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
    siteName: 'CenterIQ',
    siteUrl: 'https://centeriq.app',
    supportEmail: 'support@centeriq.app',
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
    maxCentersPerOwner: 5,
    maxStaffPerCenter: 50,
    maxAnalysesPerDay: 100,
    maxStoragePerCenterMB: 5000,
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
  const _locale = useLocale();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
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
      <div className="flex items-center justify-center py-40">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Accessing Configuration Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Configuration Header interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <Settings className="w-8 h-8 text-pink-600 animate-glow-pulse" />
            </div>
            {t('systemSettings.title' as any) || 'Global_Protocol_Control'}
          </h2>
          {lastUpdated && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
              {t('systemSettings.lastSync' as any) || 'Temporal Sync'}: <span className="text-slate-950">{new Date(lastUpdated).toLocaleString('th-TH')}</span> <span className="text-slate-200 mx-2">//</span> OPERATOR: <span className="text-pink-600">{updatedBy}</span>
            </p>
          )}
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={fetchSettings}>
            <RefreshCw className={cn("mr-3 h-4 w-4 text-pink-600", loading && "animate-spin")} />
            {t('systemSettings.schemaSync' as any) || 'SYNC_LOGIC'}
          </Button>
          <Button 
            variant="premium" 
            className="h-14 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" 
            onClick={saveSettings} 
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Save className="mr-3 h-4 w-4" />}
            {t('systemSettings.commitChanges' as any) || 'COMMIT_PROTOCOL'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex items-center justify-center">
          <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
            {[
              { value: 'general', icon: Globe, label: 'General_Uplink' },
              { value: 'features', icon: Zap, label: 'Feature_Matrix' },
              { value: 'limits', icon: Settings, label: 'Node_Density' },
              { value: 'security', icon: Shield, label: 'Auth_Protocols' },
              { value: 'billing', icon: CreditCard, label: 'Yield_Vector' }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full"
              >
                <tab.icon className="mr-3 h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent value="general" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-widest">{t('systemSettings.general.title' as any) || 'Primary_Uplink_Parameters'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('systemSettings.general.desc' as any) || 'Base system identifiers and global node states'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 space-y-12 bg-white">
                  <div className="grid md:grid-cols-2 gap-10">
                    {[
                      { label: 'Network_Entity_Name', value: settings.general.siteName, key: 'siteName', placeholder: 'NODE_ID' },
                      { label: 'Core_Uplink_URL', value: settings.general.siteUrl, key: 'siteUrl', placeholder: 'https://sync.ai' },
                      { label: 'Technical_Support_Node', value: settings.general.supportEmail, key: 'supportEmail', placeholder: 'ops@sync.ai' }
                    ].map((field) => (
                      <div key={field.key} className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">{field.label}</Label>
                        <Input 
                          value={field.value} 
                          onChange={(e) => updateSetting('general', field.key as any, e.target.value)}
                          placeholder={field.placeholder}
                          className="h-16 px-8 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all font-bold italic shadow-inner"
                        />
                      </div>
                    ))}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">Baseline_Temporal_Language</Label>
                      <div className="relative group/sel">
                        <select 
                          value={settings.general.defaultLanguage} 
                          onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                          className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black italic text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer shadow-inner uppercase"
                        >
                          <option value="th">THAI_TH</option>
                          <option value="en">ENGLISH_US</option>
                          <option value="zh">CHINESE_ZH</option>
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/sel:text-pink-600 transition-colors">
                          <ChevronRight className="h-5 w-5 transform rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    <div className="p-10 rounded-[3rem] bg-rose-50/50 border border-rose-100 flex items-center justify-between group/alert shadow-inner relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-rose-300">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/alert:scale-110 transition-transform duration-1000">
                        <AlertTriangle className="w-32 h-32 text-rose-600" />
                      </div>
                      <div className="flex items-center gap-8 relative z-10">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-rose-100 flex items-center justify-center shadow-sm group-hover/alert:scale-110 transition-transform duration-700">
                          <AlertTriangle className="h-8 w-8 text-rose-600 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('systemSettings.general.maintenance' as any) || 'Emergency_Lockdown_Mode'}</p>
                          <p className="text-[11px] text-slate-500 font-medium italic tracking-tight">{t('systemSettings.general.maintenanceDesc' as any) || 'Suspend all public node interfaces for scheduled synchronization'}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.general.maintenanceMode} 
                        onCheckedChange={(v) => updateSetting('general', 'maintenanceMode', v)}
                        className="data-[state=checked]:bg-rose-600 scale-125"
                      />
                    </div>

                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-between group/reg shadow-inner relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-pink-500/20">
                      <div className="flex items-center gap-8 relative z-10">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/reg:scale-110 transition-transform duration-700">
                          <Users className="h-8 w-8 text-pink-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('systemSettings.general.publicIngestion' as any) || 'Global_Entity_Ingestion'}</p>
                          <p className="text-[11px] text-slate-500 font-medium italic tracking-tight">{t('systemSettings.general.publicIngestionDesc' as any) || 'Allow new identity nodes to synchronize with the BIP ecosystem'}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.general.allowNewRegistrations} 
                        onCheckedChange={(v) => updateSetting('general', 'allowNewRegistrations', v)}
                        className="data-[state=checked]:bg-pink-600 scale-125"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-widest">{t('systemSettings.features.title' as any) || 'Neural_Logic_Matrix'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('systemSettings.features.desc' as any) || 'Manage active diagnostic and communication modules'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 bg-white">
                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { key: 'aiAnalysisEnabled', label: 'AI_Synchronicity_Analysis', desc: 'Core neural skin diagnostic mapping', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { key: 'arSimulatorEnabled', label: 'Dimensional_AR_Synthesis', desc: 'Predictive visual outcome generation', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
                      { key: 'videoCallEnabled', label: 'Remote_Tele-Consultation', desc: 'Authorized real-time video uplink', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { key: 'emailNotifications', label: 'Email_Relay_Protocols', desc: 'Synchronized SMTP event broadcasts', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { key: 'smsNotifications', label: 'SMS_Binary_Payloads', desc: 'Direct cell-node synchronization', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { key: 'pushNotifications', label: 'Push_Mesh_Relay', desc: 'System-wide event multicast', icon: Info, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    ].map(({ key, label, desc, icon: Icon, color, bg }, idx) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-pink-500/20 transition-all duration-700 group/feature shadow-inner hover:shadow-premium"
                      >
                        <div className="flex items-center gap-8">
                          <div className={cn("h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/feature:scale-110 transition-transform duration-700", bg)}>
                            <Icon className={cn("h-8 w-8", color)} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/feature:text-pink-600 transition-colors leading-none">{label}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{desc}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.features[key as keyof typeof settings.features]} 
                          onCheckedChange={(v) => updateSetting('features', key as keyof typeof settings.features, v)}
                          className="data-[state=checked]:bg-pink-600 scale-125"
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limits" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-widest">{t('systemSettings.limits.title' as any) || 'Global_Node_Density'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('systemSettings.limits.desc' as any) || 'Resource allocation parameters for global aesthetic network'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 bg-white">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[
                      { key: 'maxCentersPerOwner', label: 'Owner_Node_Capacity', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { key: 'maxStaffPerCenter', label: 'Center_Unit_Personnel', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { key: 'maxAnalysesPerDay', label: 'Neural_Cycle_Peak', icon: Brain, color: 'text-pink-600', bg: 'bg-pink-50' },
                      { key: 'maxStoragePerCenterMB', label: 'Asset_Storage_MB', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { key: 'sessionTimeoutMinutes', label: 'Temporal_Session_Limit', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map(({ key, label, icon: Icon, color, bg }) => (
                      <div key={key} className="space-y-6 p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/limit transition-all duration-700 hover:bg-white hover:border-blue-500/20 hover:shadow-premium">
                        <div className="flex items-center gap-5">
                          <div className={cn("h-12 w-12 rounded-xl bg-white border border-slate-50 shadow-sm flex items-center justify-center group-hover/limit:scale-110 transition-transform duration-700", bg)}>
                            <Icon className={cn("h-6 w-6", color)} />
                          </div>
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/limit:text-slate-950 transition-colors leading-none">{label}</Label>
                        </div>
                        <Input 
                          type="number" 
                          value={settings.limits[key as keyof typeof settings.limits]} 
                          onChange={(e) => updateSetting('limits', key as keyof typeof settings.limits, parseInt(e.target.value) || 0)}
                          className="h-16 px-8 rounded-2xl border-slate-100 bg-white text-slate-950 focus:border-blue-500/30 transition-all font-black italic text-3xl tracking-tighter uppercase shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-rose-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-widest">{t('systemSettings.security.title' as any) || 'Entity_Authorization_Mesh'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('systemSettings.security.desc' as any) || 'Global encryption and identity verification protocols'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 bg-white space-y-12">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-between group/sec shadow-inner transition-all duration-700 hover:bg-white hover:border-rose-500/20">
                      <div className="space-y-2">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/sec:text-rose-600 transition-colors">{t('systemSettings.security.originValidation' as any) || 'Identity_Verification'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{t('systemSettings.security.originValidationDesc' as any) || 'Require email binding for node authorization'}</p>
                      </div>
                      <Switch checked={settings.security.requireEmailVerification} onCheckedChange={(v) => updateSetting('security', 'requireEmailVerification', v)} className="data-[state=checked]:bg-rose-600 scale-125" />
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-between group/sec shadow-inner transition-all duration-700 hover:bg-white hover:border-rose-500/20">
                      <div className="space-y-2">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/sec:text-rose-600 transition-colors">{t('systemSettings.security.multiFactor' as any) || 'Dual_Node_Auth'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{t('systemSettings.security.multiFactorDesc' as any) || 'Enable 2FA for all executive identity nodes'}</p>
                      </div>
                      <Switch checked={settings.security.require2FA} onCheckedChange={(v) => updateSetting('security', 'require2FA', v)} className="data-[state=checked]:bg-rose-600 scale-125" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-10">
                    {[
                      { key: 'passwordMinLength', label: 'Password_Bit_Length', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                      { key: 'maxLoginAttempts', label: 'Failed_Cycle_Limit', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
                      { key: 'lockoutDurationMinutes', label: 'Temporal_Node_Lock', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map(({ key, label, icon: Icon, color, bg }) => (
                      <div key={key} className="space-y-6 p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/limit transition-all duration-700 hover:bg-white hover:border-rose-500/20 hover:shadow-premium">
                        <div className="flex items-center gap-5">
                          <div className={cn("h-12 w-12 rounded-xl bg-white border border-slate-50 shadow-sm flex items-center justify-center group-hover/limit:scale-110 transition-transform duration-700", bg)}>
                            <Icon className={cn("h-6 w-6", color)} />
                          </div>
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/limit:text-slate-950 transition-colors leading-none">{label}</Label>
                        </div>
                        <Input 
                          type="number" 
                          value={settings.security[key as 'passwordMinLength' | 'maxLoginAttempts' | 'lockoutDurationMinutes']} 
                          onChange={(e) => updateSetting('security', key as any, parseInt(e.target.value) || 8)}
                          className="h-16 px-8 rounded-2xl border-slate-100 bg-white text-slate-950 focus:border-rose-500/30 transition-all font-black italic text-3xl tracking-tighter uppercase shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-widest">{t('systemSettings.billing.title' as any) || 'Financial_Yield_Protocols'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('systemSettings.billing.desc' as any) || 'Global monetization and economic node parameters'}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-16 bg-white space-y-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">{t('systemSettings.billing.currency' as any) || 'Currency_Vector'}</Label>
                      <div className="relative group/sel">
                        <select 
                          value={settings.billing.currency} 
                          onChange={(e) => updateSetting('billing', 'currency', e.target.value)}
                          className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black italic text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 appearance-none transition-all cursor-pointer shadow-inner uppercase"
                        >
                          <option value="THB">THAI_BAHT_THB</option>
                          <option value="USD">US_DOLLAR_USD</option>
                          <option value="EUR">EURO_EUR</option>
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/sel:text-emerald-600 transition-colors">
                          <ChevronRight className="h-5 w-5 transform rotate-90" />
                        </div>
                      </div>
                    </div>
                    {[
                      { key: 'taxRate', label: 'Tax_Ratio_%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { key: 'freeTrialDays', label: 'Trial_Sequence_Days', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { key: 'gracePeriodDays', label: 'Grace_Cycle_Days', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map(({ key, label, icon: _Icon, color: _color, bg: _bg }) => (
                      <div key={key} className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">{label}</Label>
                        <Input 
                          type="number" 
                          value={settings.billing[key as 'taxRate' | 'freeTrialDays' | 'gracePeriodDays']} 
                          onChange={(e) => updateSetting('billing', key as any, parseFloat(e.target.value) || 0)} 
                          className="h-16 px-8 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 focus:border-emerald-500/30 transition-all font-black italic text-3xl tracking-tighter uppercase shadow-inner"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Global Status interface */}
      <div className="px-10 lg:p-12 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-all duration-700">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Database className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Configuration_Registry_State: <span className="text-slate-950">OPTIMAL</span></p>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-slate-50 text-[10px] font-black italic shadow-sm uppercase tracking-widest">
          <ShieldCheck className="mr-3 h-4 w-4 text-emerald-500" />
          Governance_Validated: 2026_PRO
        </Badge>
      </div>
    </div>
  );
}

function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
