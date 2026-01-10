'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, title: 'Clinic Info', icon: Building2 },
  { id: 2, title: 'Owner', icon: User },
  { id: 3, title: 'Plan', icon: CreditCard },
  { id: 4, title: 'Review', icon: CheckCircle2 },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 990, features: ['5 users', '100 customers'] },
  { id: 'professional', name: 'Professional', price: 2490, features: ['20 users', 'Unlimited'] },
  { id: 'enterprise', name: 'Enterprise', price: 4990, features: ['Unlimited', 'All features'] },
];

export default function ClinicOnboardingWizard({ open, onOpenChange, onSuccess }: Props) {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '', slug: '', email: '', phone: '', address: '',
    ownerName: '', ownerEmail: '',
    plan: 'starter', startTrial: true, trialDays: 14,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const genSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name) e.name = 'Required';
      if (!form.slug) e.slug = 'Required';
      if (!form.email) e.email = 'Required';
    }
    if (s === 2) {
      if (!form.ownerName) e.ownerName = 'Required';
      if (!form.ownerEmail) e.ownerEmail = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => Math.min(s + 1, 4)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: t('common.success'), description: t('clinicOnboarding.messages.success') });
      onSuccess?.();
      onOpenChange(false);
      setStep(1);
      setForm({ name: '', slug: '', email: '', phone: '', address: '', ownerName: '', ownerEmail: '', plan: 'starter', startTrial: true, trialDays: 14 });
    } catch {
      toast({ title: t('common.error'), description: t('clinicOnboarding.messages.error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('clinicOnboarding.title')}</DialogTitle>
        </DialogHeader>

        {/* Steps */}
        <div className="flex justify-between mb-6">
          {STEPS.map((s) => (
            <div key={s.id} className={`flex items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className="text-sm hidden sm:inline">{t(`clinicOnboarding.steps.${['info', 'owner', 'plan', 'review'][s.id - 1]}`)}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Clinic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>{t('clinicOnboarding.form.clinicName')} *</Label>
              <Input value={form.name} onChange={(e) => { update('name', e.target.value); update('slug', genSlug(e.target.value)); }} placeholder="Beauty Clinic" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <Label>{t('clinicOnboarding.form.slug')} *</Label>
              <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="beauty-clinic" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div>
              <Label>{t('clinicOnboarding.form.email')} *</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="clinic@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('clinicOnboarding.form.phone')}</Label>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="02-xxx-xxxx" />
              </div>
              <div>
                <Label>{t('clinicOnboarding.form.address')}</Label>
                <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Bangkok" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Owner */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>{t('clinicOnboarding.form.ownerName')} *</Label>
              <Input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="John Doe" />
              {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
            </div>
            <div>
              <Label>{t('clinicOnboarding.form.ownerEmail')} *</Label>
              <Input type="email" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} placeholder="owner@example.com" />
              {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
              <p className="text-xs text-muted-foreground mt-1">{t('clinicOnboarding.form.invitationNote')}</p>
            </div>
          </div>
        )}

        {/* Step 3: Plan */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((p) => (
                <Card key={p.id} className={`cursor-pointer transition ${form.plan === p.id ? 'ring-2 ring-primary' : ''}`} onClick={() => update('plan', p.id)}>
                  <CardContent className="p-4">
                    <div className="font-medium">{t(`clinicOnboarding.plans.${p.id}`)}</div>
                    <div className="text-lg font-bold">฿{p.price.toLocaleString()}/mo</div>
                    <ul className="text-xs text-muted-foreground mt-2">
                      {p.features.map((f) => <li key={f}>• {f}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{t('clinicOnboarding.form.startTrial')}</div>
                <div className="text-sm text-muted-foreground">{t('clinicOnboarding.form.trialDesc', { days: form.trialDays })}</div>
              </div>
              <Switch checked={form.startTrial} onCheckedChange={(v) => update('startTrial', v)} />
            </div>
            {form.startTrial && (
              <div>
                <Label>{t('clinicOnboarding.form.trialDays')}</Label>
                <Select value={String(form.trialDays)} onValueChange={(v) => update('trialDays', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 {t('common.days')}</SelectItem>
                    <SelectItem value="14">14 {t('common.days')}</SelectItem>
                    <SelectItem value="30">30 {t('common.days')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('clinicOnboarding.review.details')}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">{t('clinicOnboarding.form.clinicName')}:</span> {form.name}</div>
                <div><span className="text-muted-foreground">{t('clinicOnboarding.form.slug')}:</span> {form.slug}</div>
                <div><span className="text-muted-foreground">{t('clinicOnboarding.form.email')}:</span> {form.email}</div>
                <div><span className="text-muted-foreground">{t('clinicOnboarding.form.phone')}:</span> {form.phone || '-'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('clinicOnboarding.review.owner')}</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div>{form.ownerName} ({form.ownerEmail})</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('clinicOnboarding.review.subscription')}</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Badge>{t(`clinicOnboarding.plans.${form.plan}`)}</Badge>
                {form.startTrial && <Badge variant="secondary">{t('clinicOnboarding.review.trial', { days: form.trialDays })}</Badge>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('clinicOnboarding.buttons.back')}
          </Button>
          {step < 4 ? (
            <Button onClick={next}>
              {t('clinicOnboarding.buttons.next')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? t('clinicOnboarding.buttons.creating') : t('clinicOnboarding.buttons.create')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
