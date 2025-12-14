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
      toast({ title: 'Success', description: 'Clinic created!' });
      onSuccess?.();
      onOpenChange(false);
      setStep(1);
      setForm({ name: '', slug: '', email: '', phone: '', address: '', ownerName: '', ownerEmail: '', plan: 'starter', startTrial: true, trialDays: 14 });
    } catch {
      toast({ title: 'Error', description: 'Failed to create clinic', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Clinic</DialogTitle>
        </DialogHeader>

        {/* Steps */}
        <div className="flex justify-between mb-6">
          {STEPS.map((s) => (
            <div key={s.id} className={`flex items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className="text-sm hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Clinic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Clinic Name *</Label>
              <Input value={form.name} onChange={(e) => { update('name', e.target.value); update('slug', genSlug(e.target.value)); }} placeholder="Beauty Clinic" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="beauty-clinic" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="clinic@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="02-xxx-xxxx" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Bangkok" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Owner */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Owner Name *</Label>
              <Input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="John Doe" />
              {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
            </div>
            <div>
              <Label>Owner Email *</Label>
              <Input type="email" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} placeholder="owner@example.com" />
              {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
              <p className="text-xs text-muted-foreground mt-1">Invitation will be sent to this email</p>
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
                    <div className="font-medium">{p.name}</div>
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
                <div className="font-medium">Start with Trial</div>
                <div className="text-sm text-muted-foreground">{form.trialDays} days free trial</div>
              </div>
              <Switch checked={form.startTrial} onCheckedChange={(v) => update('startTrial', v)} />
            </div>
            {form.startTrial && (
              <div>
                <Label>Trial Days</Label>
                <Select value={String(form.trialDays)} onValueChange={(v) => update('trialDays', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
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
              <CardHeader><CardTitle className="text-lg">Clinic Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {form.name}</div>
                <div><span className="text-muted-foreground">Slug:</span> {form.slug}</div>
                <div><span className="text-muted-foreground">Email:</span> {form.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {form.phone || '-'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Owner</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div>{form.ownerName} ({form.ownerEmail})</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Subscription</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Badge>{PLANS.find((p) => p.id === form.plan)?.name}</Badge>
                {form.startTrial && <Badge variant="secondary">{form.trialDays} days trial</Badge>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={next}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Clinic
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
