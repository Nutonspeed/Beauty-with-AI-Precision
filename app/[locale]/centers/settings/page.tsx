"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Clock, 
  Bell, 
  CreditCard, 
  BarChart3, 
  Save, 
  Settings,
  MessageSquare,
  DollarSign,
  Zap
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CenterSettings {
  // Center Info
  center_name: string;
  center_email: string;
  center_phone: string;
  center_address: string;
  
  // Booking Settings
  allow_online_booking: boolean;
  require_payment: boolean;
  cancellation_hours: number;
  auto_confirm: boolean;
  buffer_time_minutes: number;
  
  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  booking_reminders: boolean;
  reminder_hours_before: number;
  
  // Payment Settings
  require_deposit: boolean;
  deposit_percentage: number;
  accepted_payment_methods: string[];
}

export default function CenterSettingsPage() {
  const t = useTranslations('centerSettings');
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [promptPayId, setPromptPayId] = useState('');
  const [promptPayType, setPromptPayType] = useState<'mobile' | 'citizen_id'>('mobile');
  const [isPromptPaySaving, setIsPromptPaySaving] = useState(false);
  const [kpiTargetsText, setKpiTargetsText] = useState('');
  const [isKpiLoading, setIsKpiLoading] = useState(true);
  const [isKpiSaving, setIsKpiSaving] = useState(false);
  const [settings, setSettings] = useState<CenterSettings>({
    center_name: '',
    center_email: '',
    center_phone: '',
    center_address: '',
    allow_online_booking: true,
    require_payment: false,
    cancellation_hours: 24,
    auto_confirm: false,
    buffer_time_minutes: 15,
    email_notifications: true,
    sms_notifications: false,
    booking_reminders: true,
    reminder_hours_before: 24,
    require_deposit: false,
    deposit_percentage: 20,
    accepted_payment_methods: ['cash', 'credit_card', 'promptpay']
  });

  useEffect(() => {
    fetchSettings();
  }, [t]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only center_owner and super_admin can access settings
    if (!['center_owner', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    // Load settings
    const loadSettings = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/center/settings');
        // const data = await response.json();
        // setSettings(data);
        
        // Mock data for now
        setSettings({
          center_name: 'Aesthetic Intelligence Hub',
          center_email: 'center@example.com',
          center_phone: '02-123-4567',
          center_address: '123 Aesthetic Blvd, Bangkok 10110',
          allow_online_booking: true,
          require_payment: false,
          cancellation_hours: 24,
          auto_confirm: false,
          buffer_time_minutes: 15,
          email_notifications: true,
          sms_notifications: false,
          booking_reminders: true,
          reminder_hours_before: 24,
          require_deposit: false,
          deposit_percentage: 20,
          accepted_payment_methods: ['cash', 'credit_card', 'promptpay']
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: t('errorGeneric'),
          description: t('loadError'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const loadPromptPay = async () => {
      try {
        const res = await fetch('/api/center/settings/promptpay', { method: 'GET' });
        if (!res.ok) {
          return;
        }
        const data = await res.json().catch(() => ({}));
        setPromptPayId(typeof data.promptpay_id === 'string' ? data.promptpay_id : '');
        setPromptPayType(data.promptpay_type === 'citizen_id' ? 'citizen_id' : 'mobile');
      } catch {
        // ignore
      }
    };

    const loadKpiTargets = async () => {
      try {
        const res = await fetch('/api/center/kpi-targets', { method: 'GET' });
        if (!res.ok) {
          throw new Error(`Failed to load KPI targets (${res.status})`);
        }

        const data = await res.json();
        const targets = data?.targets && typeof data.targets === 'object' ? data.targets : {};
        setKpiTargetsText(JSON.stringify(targets, null, 2));
      } catch (error) {
        console.error('Error loading KPI targets:', error);
        setKpiTargetsText('{}');
      } finally {
        setIsKpiLoading(false);
      }
    };

    loadSettings();
    loadKpiTargets();
    loadPromptPay();
  }, [user, authLoading, router, lp, toast, t]);

  const handleSavePromptPay = async () => {
    setIsPromptPaySaving(true);
    try {
      const res = await fetch('/api/center/settings/promptpay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptpay_id: promptPayId,
          promptpay_type: promptPayType,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Failed to save (${res.status})`);
      }

      toast({
        title: t('successTitle'),
        description: t('promptPaySuccess'),
      });
    } catch (error: any) {
      toast({
        title: t('errorGeneric'),
        description: error?.message || t('promptPayError'),
        variant: 'destructive',
      });
    } finally {
      setIsPromptPaySaving(false);
    }
  };

  const parseTargets = () => {
    try {
      const parsed = JSON.parse(kpiTargetsText || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ok: false as const, error: 'targets must be a JSON object' };
      }
      return { ok: true as const, value: parsed };
    } catch {
      return { ok: false as const, error: 'Invalid JSON format' };
    }
  };

  const handleSaveKpiTargets = async () => {
    const parsed = parseTargets();
    if (!parsed.ok) {
      toast({
        title: t('errorGeneric'),
        description: parsed.error,
        variant: 'destructive',
      });
      return;
    }

    setIsKpiSaving(true);
    try {
      const res = await fetch('/api/center/kpi-targets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: parsed.value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Failed to save KPI targets (${res.status})`);
      }

      const data = await res.json().catch(() => null);
      const targets = data?.targets && typeof data.targets === 'object' ? data.targets : parsed.value;
      setKpiTargetsText(JSON.stringify(targets, null, 2));

      toast({
        title: t('successTitle'),
        description: t('kpiSuccess'),
      });
    } catch (error: any) {
      console.error('Error saving KPI targets:', error);
      toast({
        title: t('errorGeneric'),
        description: error?.message || t('kpiError'),
        variant: 'destructive',
      });
    } finally {
      setIsKpiSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/center/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('successTitle'),
        description: t('saveSuccessDesc'),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('errorGeneric'),
        description: t('saveError'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Settings Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Settings className="mr-3 h-3.5 w-3.5 animate-spin-slow" />
                {t('labels.aestheticParamConfig')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                {t('tabs.general')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Settings</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                {t('labels.orchestrateProtocols')}
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('labels.syncingNode')}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5" />
                    {t('labels.commitChanges')}
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2">
                <TabsTrigger value="general" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                  <Building2 className="h-4 w-4 mr-3" />
                  General
                </TabsTrigger>
                <TabsTrigger value="booking" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                  <Clock className="h-4 w-4 mr-3" />
                  Temporal
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                  <Bell className="h-4 w-4 mr-3" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="payment" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="kpi" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                  <BarChart3 className="h-4 w-4 mr-3" />
                  KPI Nodes
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* General Settings Infrastructure */}
                <TabsContent value="general" className="mt-0 outline-none">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{t('labels.centerIdentity')}</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('labels.centerNodeParams')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-10">
                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('labels.centerNodeIdentifier')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            value={settings.center_name}
                            onChange={(e) => setSettings({...settings, center_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('labels.authorizedSyncEmail')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            type="email"
                            value={settings.center_email}
                            onChange={(e) => setSettings({...settings, center_email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('labels.directTransmissionLine')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            value={settings.center_phone}
                            onChange={(e) => setSettings({...settings, center_phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Center Node Location</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            value={settings.center_address}
                            onChange={(e) => setSettings({...settings, center_address: e.target.value})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Booking Settings Infrastructure */}
                <TabsContent value="booking" className="mt-0 outline-none">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Temporal Protocols</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Define reservation and cycle constraints</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-12">
                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="flex items-center justify-between p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-inner group/toggle">
                          <div className="space-y-2">
                            <Label className="text-lg font-bold text-white italic transition-colors group-hover/toggle:text-pink-400">Online Reservation Inflow</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Allow decentralized bookings</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-pink-600"
                            checked={settings.allow_online_booking}
                            onCheckedChange={(checked) => setSettings({...settings, allow_online_booking: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-inner group/toggle">
                          <div className="space-y-2">
                            <Label className="text-lg font-bold text-white italic transition-colors group-hover/toggle:text-pink-400">Autonomous Confirmation</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Bypass aesthetic verification nodes</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-pink-600"
                            checked={settings.auto_confirm}
                            onCheckedChange={(checked) => setSettings({...settings, auto_confirm: checked})}
                          />
                        </div>
                      </div>

                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Cancellation Buffer (Hours)</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            type="number"
                            value={settings.cancellation_hours}
                            onChange={(e) => setSettings({...settings, cancellation_hours: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Inter-Cycle Buffer (Minutes)</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            type="number"
                            value={settings.buffer_time_minutes}
                            onChange={(e) => setSettings({...settings, buffer_time_minutes: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings Infrastructure */}
                <TabsContent value="notifications" className="mt-0 outline-none">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Alert Infrastructures</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Configure real-time communication nodes</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-12">
                      <div className="grid gap-10 md:grid-cols-3">
                        <div className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] shadow-inner group/alert">
                          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/alert:scale-110 transition-transform duration-700">
                            <Bell className="h-8 w-8" />
                          </div>
                          <div className="text-center space-y-2">
                            <Label className="text-lg font-bold text-white italic">Email Protocol</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Sync via SMTP nodes</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-blue-600"
                            checked={settings.email_notifications}
                            onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                          />
                        </div>
                        <div className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] shadow-inner group/alert">
                          <div className="h-16 w-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover/alert:scale-110 transition-transform duration-700">
                            <MessageSquare className="h-8 w-8" />
                          </div>
                          <div className="text-center space-y-2">
                            <Label className="text-lg font-bold text-white italic">SMS Protocol</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Direct carrier transmission</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-pink-600"
                            checked={settings.sms_notifications}
                            onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
                          />
                        </div>
                        <div className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] shadow-inner group/alert">
                          <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover/alert:scale-110 transition-transform duration-700">
                            <Clock className="h-8 w-8" />
                          </div>
                          <div className="text-center space-y-2">
                            <Label className="text-lg font-bold text-white italic">Reminder Sync</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Temporal alert automation</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-cyan-600"
                            checked={settings.booking_reminders}
                            onCheckedChange={(checked) => setSettings({...settings, booking_reminders: checked})}
                          />
                        </div>
                      </div>

                      {settings.booking_reminders && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 max-w-md mx-auto">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic text-center block">Transmission Lead Time (Hours)</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-cyan-500/30 focus:ring-cyan-500/20 transition-all px-6 text-center text-lg font-bold"
                            type="number"
                            value={settings.reminder_hours_before}
                            onChange={(e) => setSettings({...settings, reminder_hours_before: parseInt(e.target.value)})}
                          />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Settings Infrastructure */}
                <TabsContent value="payment" className="mt-0 outline-none">
                  <div className="space-y-10">
                    <Card className="border-pink-500/20 bg-pink-500/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                            <CreditCard className="h-8 w-8 text-pink-400" />
                            PromptPay Gateway Node
                          </CardTitle>
                          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Authorized inflow vector synchronization</CardDescription>
                        </div>
                        <Button 
                          variant="premium" 
                          size="lg" 
                          className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          onClick={handleSavePromptPay} 
                          disabled={isPromptPaySaving}
                        >
                          {isPromptPaySaving ? (
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Syncing Node...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Save className="h-4 w-4" />
                              Authorize Node
                            </div>
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-10 lg:p-12 space-y-10">
                        <div className="grid gap-10 md:grid-cols-2">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">PromptPay Node ID</Label>
                            <Input
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 font-mono text-xs"
                              value={promptPayId}
                              onChange={(e) => setPromptPayId(e.target.value)}
                              placeholder="10-digit mobile or 13-digit ID"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Identification Vector</Label>
                            <Select value={promptPayType} onValueChange={(v: 'mobile' | 'citizen_id') => setPromptPayType(v)}>
                              <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                                <SelectValue placeholder="Node Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                                <SelectItem value="mobile" className="text-[10px] font-black uppercase tracking-widest italic">Mobile Infrastructure</SelectItem>
                                <SelectItem value="citizen_id" className="text-[10px] font-black uppercase tracking-widest italic">Citizen ID Hub</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CardContent className="p-10 lg:p-12 space-y-12">
                        <div className="flex items-center justify-between p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-inner group/toggle">
                          <div className="space-y-2">
                            <Label className="text-lg font-bold text-white italic transition-colors group-hover/toggle:text-pink-400">Pre-Authorization Deposit</Label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Require financial commitment at reservation</p>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-pink-600"
                            checked={settings.require_deposit}
                            onCheckedChange={(checked) => setSettings({...settings, require_deposit: checked})}
                          />
                        </div>

                        {settings.require_deposit && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 max-w-md mx-auto">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic text-center block">Deposit Vector Intensity (%)</Label>
                            <Input
                              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 text-center text-lg font-bold"
                              type="number"
                              min="0"
                              max="100"
                              value={settings.deposit_percentage}
                              onChange={(e) => setSettings({...settings, deposit_percentage: parseInt(e.target.value)})}
                            />
                          </motion.div>
                        )}

                        <div className="space-y-6">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Authorized Inflow Methods</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                              { id: 'cash', label: 'Fiat (Cash)', icon: DollarSign, color: 'text-blue-400' },
                              { id: 'credit_card', label: 'Credit Infrastructure', icon: CreditCard, color: 'text-purple-400' },
                              { id: 'promptpay', label: 'PromptPay Node', icon: Zap, color: 'text-pink-400' }
                            ].map((method) => (
                              <div 
                                key={method.id} 
                                className={cn(
                                  "flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500 cursor-pointer group/method",
                                  settings.accepted_payment_methods.includes(method.id) 
                                    ? "bg-white/[0.03] border-pink-500/30 shadow-inner" 
                                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                                )}
                                onClick={() => {
                                  const methods = settings.accepted_payment_methods.includes(method.id)
                                    ? settings.accepted_payment_methods.filter(m => m !== method.id)
                                    : [...settings.accepted_payment_methods, method.id];
                                  setSettings({...settings, accepted_payment_methods: methods});
                                }}
                              >
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-all duration-500", settings.accepted_payment_methods.includes(method.id) ? "bg-pink-600/20 text-pink-400" : "bg-white/5 text-slate-600")}>
                                  <method.icon className="h-5 w-5" />
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest italic", settings.accepted_payment_methods.includes(method.id) ? "text-white" : "text-slate-600")}>{method.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* KPI Settings Infrastructure */}
                <TabsContent value="kpi" className="mt-0 outline-none">
                  <Card className="border-cyan-500/20 bg-cyan-500/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                          <BarChart3 className="h-8 w-8 text-cyan-400" />
                          Performance Benchmark Nodes
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Define global performance intelligence parameters</CardDescription>
                      </div>
                      <Button 
                        variant="premium" 
                        size="lg" 
                        className="h-14 px-8 rounded-2xl shadow-2xl shadow-cyan-500/20 text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all bg-cyan-600 border-none"
                        onClick={handleSaveKpiTargets} 
                        disabled={isKpiSaving}
                      >
                        {isKpiSaving ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Syncing KPI...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Save className="h-4 w-4" />
                            Authorize KPI
                          </div>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12">
                      {isKpiLoading ? (
                        <div className="py-20 text-center space-y-6">
                          <Loader2 className="mx-auto h-12 w-12 text-cyan-500 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Initializing KPI Nodes...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Intelligence Hash (JSON Node)</Label>
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2rem] blur opacity-20 group-focus-within:opacity-100 transition duration-1000" />
                            <Textarea
                              className="rounded-[2rem] border-white/5 bg-white/[0.03] text-cyan-400 placeholder:text-slate-700 px-8 py-8 resize-none font-mono text-xs leading-relaxed min-h-[400px] focus:border-cyan-500/30 transition-all relative z-10"
                              value={kpiTargetsText}
                              onChange={(e) => setKpiTargetsText(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
