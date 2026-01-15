'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Customer } from '@/lib/mock/customer-mock-data';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslations, useLocale } from 'next-intl';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function CustomerForm({ initialData, onSubmit, isSubmitting }: CustomerFormProps) {
  const router = useRouter();
  const t = useTranslations('customers.form');
  const _commonT = useTranslations('common');
  const locale = useLocale();
  
  const formSchema = z.object({
    firstName: z.string().min(2, t('validation.firstName')),
    lastName: z.string().min(1, t('validation.lastName')),
    phone: z.string().min(10, t('validation.phone')),
    email: z.string().email(t('validation.email')).optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: t('validation.gender'),
    }),
    birthDate: z.date({
      required_error: t('validation.birthDate'),
    }),
    address: z.string().optional(),
    allergies: z.string().optional(),
    notes: z.string().optional(),
    membershipLevel: z.enum(['silver', 'gold', 'platinum']).default('silver'),
  });

  type CustomerFormValues = z.infer<typeof formSchema>;
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      phone: initialData.phone,
      email: initialData.email || '',
      gender: initialData.gender as 'male' | 'female' | 'other',
      birthDate: new Date(initialData.birthDate),
      address: initialData.address || '',
      allergies: initialData.allergies?.join(', ') || '',
      notes: initialData.notes || '',
      membershipLevel: initialData.membershipLevel as 'silver' | 'gold' | 'platinum',
    } : {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      gender: 'other',
      birthDate: new Date(),
      address: '',
      allergies: '',
      notes: '',
      membershipLevel: 'silver',
    },
  });

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      await onSubmit(data);
      toast.success(initialData ? t('messages.updateSuccess') : t('messages.addSuccess'));
      router.push('/admin/customers');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t('messages.error'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('fields.firstName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('fields.lastName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('fields.phone')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.email')} {t('fields.optional')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('fields.email')} {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.gender.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.gender.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t('fields.gender.male')}</SelectItem>
                    <SelectItem value="female">{t('fields.gender.female')}</SelectItem>
                    <SelectItem value="other">{t('fields.gender.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.birthDate.label')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: locale === 'th' ? th : enUS })
                        ) : (
                          <span>{t('fields.birthDate.placeholder')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={locale === 'th' ? th : enUS}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="membershipLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.membership.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.membership.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="silver">{t('fields.membership.silver')}</SelectItem>
                    <SelectItem value="gold">{t('fields.membership.gold')}</SelectItem>
                    <SelectItem value="platinum">{t('fields.membership.platinum')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address')} {t('fields.optional')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.address')}
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.allergies.label')} {t('fields.optional')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('fields.allergies.placeholder')}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  {t('fields.allergies.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.notes')} {t('fields.optional')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('fields.notes')}
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/customers')}
            disabled={isSubmitting}
          >
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? t('buttons.update') : t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
