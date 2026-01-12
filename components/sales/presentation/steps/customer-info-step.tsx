'use client'

/**
 * Customer Info Step
 * 
 * Collect basic customer information
 * - Name (required)
 * - Phone (required)
 * - Email (optional)
 * - Auto-save as user types
 */

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { User, Phone, Mail, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

interface CustomerInfoStepProps {
  client: {
    id: string
    name: string
    phone: string
    email?: string
  }
  onUpdate: (client: CustomerInfoStepProps['client']) => void
  isOnline: boolean
}

export function CustomerInfoStep({ client, onUpdate, isOnline }: CustomerInfoStepProps) {
  const t = useTranslations()
  const [localClient, setLocalClient] = useState(client)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate phone number (Thai format)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/
    return phoneRegex.test(phone.replace(/[-\s]/g, ''))
  }

  // Validate email
  const validateEmail = (email: string): boolean => {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Update parent component with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Validate before updating
      const newErrors: Record<string, string> = {}
      
      if (!localClient.name.trim()) {
        newErrors.name = t('salesWizard.steps.customer.nameRequired')
      }
      
      if (!localClient.phone.trim()) {
        newErrors.phone = t('salesWizard.steps.customer.phoneRequired')
      } else if (!validatePhone(localClient.phone)) {
        newErrors.phone = t('salesWizard.steps.customer.phoneInvalid')
      }
      
      if (localClient.email && !validateEmail(localClient.email)) {
        newErrors.email = t('salesWizard.steps.customer.emailInvalid')
      }
      
      setErrors(newErrors)
      
      // Only update if valid
      if (Object.keys(newErrors).length === 0) {
        onUpdate(localClient)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localClient, onUpdate, t])

  const handleChange = (field: keyof typeof localClient, value: string) => {
    setLocalClient(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          {t('salesWizard.steps.customer.alertDesc')}
        </AlertDescription>
      </Alert>

      {/* Client Form */}
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="client-name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('salesWizard.steps.customer.nameLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client-name"
            type="text"
            placeholder={t('salesWizard.steps.customer.namePlaceholder')}
            value={localClient.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="client-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('salesWizard.steps.customer.phoneLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client-phone"
            type="tel"
            placeholder={t('salesWizard.steps.customer.phonePlaceholder')}
            value={localClient.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t('salesWizard.steps.customer.phoneDesc')}
          </p>
        </div>

        {/* Email (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="client-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('salesWizard.steps.customer.emailLabel')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="client-email"
            type="email"
            placeholder={t('salesWizard.steps.customer.emailPlaceholder')}
            value={localClient.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t('salesWizard.steps.customer.emailDesc')}
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {localClient.name && localClient.phone && Object.keys(errors).length === 0 && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            {t('salesWizard.steps.customer.saveSuccess')}
          </p>
          <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
            <p><strong>{t('common.name')}:</strong> {localClient.name}</p>
            <p><strong>{t('common.phone')}:</strong> {localClient.phone}</p>
            {localClient.email && (
              <p><strong>{t('common.email')}:</strong> {localClient.email}</p>
            )}
          </div>
        </Card>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
            {t('salesWizard.steps.customer.offlineNotice')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
