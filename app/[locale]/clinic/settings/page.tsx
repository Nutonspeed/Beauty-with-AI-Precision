"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Clock, 
  Bell, 
  CreditCard,
  BarChart3,
  Save,
  Settings
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClinicSettings {
  // Clinic Info
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  
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

export default function ClinicSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [kpiTargetsText, setKpiTargetsText] = useState('');
  const [isKpiLoading, setIsKpiLoading] = useState(true);
  const [isKpiSaving, setIsKpiSaving] = useState(false);
  const [settings, setSettings] = useState<ClinicSettings>({
    clinic_name: '',
    clinic_email: '',
    clinic_phone: '',
    clinic_address: '',
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
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only clinic_owner and super_admin can access settings
    if (!['clinic_owner', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    // Load settings
    const loadSettings = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/clinic/settings');
        // const data = await response.json();
        // setSettings(data);
        
        // Mock data for now
        setSettings({
          clinic_name: 'AI Beauty Clinic',
          clinic_email: 'clinic@example.com',
          clinic_phone: '02-123-4567',
          clinic_address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
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
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดการตั้งค่าได้',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const loadKpiTargets = async () => {
      try {
        const res = await fetch('/api/clinic/kpi-targets', { method: 'GET' });
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
  }, [user, authLoading, router, lp, toast]);

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
        title: 'เกิดข้อผิดพลาด',
        description: parsed.error,
        variant: 'destructive',
      });
      return;
    }

    setIsKpiSaving(true);
    try {
      const res = await fetch('/api/clinic/kpi-targets', {
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
        title: 'บันทึกสำเร็จ',
        description: 'KPI Targets ได้รับการบันทึกแล้ว',
      });
    } catch (error: any) {
      console.error('Error saving KPI targets:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error?.message || 'ไม่สามารถบันทึก KPI Targets ได้',
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
      // const response = await fetch('/api/clinic/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าได้รับการบันทึกแล้ว'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
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
          <p className="text-muted-foreground">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">ตั้งค่าคลินิก</h1>
        </div>
        <p className="text-muted-foreground">
          จัดการการตั้งค่าและการกำหนดค่าคลินิกของคุณ
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            ทั่วไป
          </TabsTrigger>
          <TabsTrigger value="booking">
            <Clock className="h-4 w-4 mr-2" />
            การจอง
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            การแจ้งเตือน
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            การชำระเงิน
          </TabsTrigger>
          <TabsTrigger value="kpi">
            <BarChart3 className="h-4 w-4 mr-2" />
            KPI
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลคลินิก</CardTitle>
              <CardDescription>
                ข้อมูลพื้นฐานและรายละเอียดติดต่อคลินิก
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">ชื่อคลินิก</Label>
                <Input
                  id="clinic_name"
                  value={settings.clinic_name}
                  onChange={(e) => setSettings({...settings, clinic_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_email">อีเมล</Label>
                <Input
                  id="clinic_email"
                  type="email"
                  value={settings.clinic_email}
                  onChange={(e) => setSettings({...settings, clinic_email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="clinic_phone"
                  value={settings.clinic_phone}
                  onChange={(e) => setSettings({...settings, clinic_phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_address">ที่อยู่</Label>
                <Input
                  id="clinic_address"
                  value={settings.clinic_address}
                  onChange={(e) => setSettings({...settings, clinic_address: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการจอง</CardTitle>
              <CardDescription>
                กำหนดกฎและข้อจำกัดสำหรับการจองออนไลน์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>เปิดการจองออนไลน์</Label>
                  <p className="text-sm text-muted-foreground">
                    อนุญาตให้ลูกค้าจองนัดหมายผ่านเว็บไซต์
                  </p>
                </div>
                <Switch
                  checked={settings.allow_online_booking}
                  onCheckedChange={(checked) => setSettings({...settings, allow_online_booking: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ยืนยันอัตโนมัติ</Label>
                  <p className="text-sm text-muted-foreground">
                    ยืนยันการจองโดยอัตโนมัติโดยไม่ต้องตรวจสอบ
                  </p>
                </div>
                <Switch
                  checked={settings.auto_confirm}
                  onCheckedChange={(checked) => setSettings({...settings, auto_confirm: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation_hours">เวลายกเลิกล่วงหน้า (ชั่วโมง)</Label>
                <Input
                  id="cancellation_hours"
                  type="number"
                  value={settings.cancellation_hours}
                  onChange={(e) => setSettings({...settings, cancellation_hours: parseInt(e.target.value)})}
                />
                <p className="text-sm text-muted-foreground">
                  ลูกค้าต้องยกเลิกการจองล่วงหน้าอย่างน้อย
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buffer_time">เวลาบัฟเฟอร์ระหว่างนัดหมาย (นาที)</Label>
                <Input
                  id="buffer_time"
                  type="number"
                  value={settings.buffer_time_minutes}
                  onChange={(e) => setSettings({...settings, buffer_time_minutes: parseInt(e.target.value)})}
                />
                <p className="text-sm text-muted-foreground">
                  เวลาว่างระหว่างนัดหมายแต่ละรายการ
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
              <CardDescription>
                กำหนดวิธีการแจ้งเตือนลูกค้าและพนักงาน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การแจ้งเตือนทางอีเมล</Label>
                  <p className="text-sm text-muted-foreground">
                    ส่งการยืนยันและเตือนความจำทางอีเมล
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การแจ้งเตือนทาง SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    ส่งข้อความเตือนความจำทาง SMS
                  </p>
                </div>
                <Switch
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>เตือนความจำการจอง</Label>
                  <p className="text-sm text-muted-foreground">
                    ส่งการเตือนความจำก่อนนัดหมาย
                  </p>
                </div>
                <Switch
                  checked={settings.booking_reminders}
                  onCheckedChange={(checked) => setSettings({...settings, booking_reminders: checked})}
                />
              </div>

              {settings.booking_reminders && (
                <div className="space-y-2">
                  <Label htmlFor="reminder_hours">เตือนก่อนนัดหมาย (ชั่วโมง)</Label>
                  <Input
                    id="reminder_hours"
                    type="number"
                    value={settings.reminder_hours_before}
                    onChange={(e) => setSettings({...settings, reminder_hours_before: parseInt(e.target.value)})}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการชำระเงิน</CardTitle>
              <CardDescription>
                กำหนดวิธีการชำระเงินและนโยบายเงินมัดจำ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ต้องการเงินมัดจำ</Label>
                  <p className="text-sm text-muted-foreground">
                    ต้องการเงินมัดจำเมื่อจองนัดหมาย
                  </p>
                </div>
                <Switch
                  checked={settings.require_deposit}
                  onCheckedChange={(checked) => setSettings({...settings, require_deposit: checked})}
                />
              </div>

              {settings.require_deposit && (
                <div className="space-y-2">
                  <Label htmlFor="deposit_percentage">เปอร์เซ็นต์เงินมัดจำ (%)</Label>
                  <Input
                    id="deposit_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.deposit_percentage}
                    onChange={(e) => setSettings({...settings, deposit_percentage: parseInt(e.target.value)})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>วิธีการชำระเงินที่รับ</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cash"
                      checked={settings.accepted_payment_methods.includes('cash')}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.accepted_payment_methods, 'cash']
                          : settings.accepted_payment_methods.filter(m => m !== 'cash');
                        setSettings({...settings, accepted_payment_methods: methods});
                      }}
                    />
                    <label htmlFor="cash" className="text-sm">เงินสด</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="credit_card"
                      checked={settings.accepted_payment_methods.includes('credit_card')}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.accepted_payment_methods, 'credit_card']
                          : settings.accepted_payment_methods.filter(m => m !== 'credit_card');
                        setSettings({...settings, accepted_payment_methods: methods});
                      }}
                    />
                    <label htmlFor="credit_card" className="text-sm">บัตรเครดิต/เดบิต</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="promptpay"
                      checked={settings.accepted_payment_methods.includes('promptpay')}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.accepted_payment_methods, 'promptpay']
                          : settings.accepted_payment_methods.filter(m => m !== 'promptpay');
                        setSettings({...settings, accepted_payment_methods: methods});
                      }}
                    />
                    <label htmlFor="promptpay" className="text-sm">พร้อมเพย์</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi">
          <Card>
            <CardHeader>
              <CardTitle>KPI Targets</CardTitle>
              <CardDescription>
                กำหนดเป้าหมาย KPI ของคลินิก (เก็บเป็น JSON)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isKpiLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังโหลด KPI Targets...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="kpi_targets">Targets (JSON)</Label>
                    <Textarea
                      id="kpi_targets"
                      value={kpiTargetsText}
                      onChange={(e) => setKpiTargetsText(e.target.value)}
                      rows={14}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveKpiTargets} disabled={isKpiSaving}>
                      {isKpiSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          บันทึก KPI Targets
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
