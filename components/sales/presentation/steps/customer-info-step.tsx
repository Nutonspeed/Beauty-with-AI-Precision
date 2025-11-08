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

interface CustomerInfoStepProps {
  customer: {
    id: string
    name: string
    phone: string
    email?: string
  }
  onUpdate: (customer: CustomerInfoStepProps['customer']) => void
  isOnline: boolean
}

export function CustomerInfoStep({ customer, onUpdate, isOnline }: CustomerInfoStepProps) {
  const [localCustomer, setLocalCustomer] = useState(customer)
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
      
      if (!localCustomer.name.trim()) {
        newErrors.name = 'Name is required'
      }
      
      if (!localCustomer.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!validatePhone(localCustomer.phone)) {
        newErrors.phone = 'Invalid phone number (use 0X-XXXX-XXXX format)'
      }
      
      if (localCustomer.email && !validateEmail(localCustomer.email)) {
        newErrors.email = 'Invalid email address'
      }
      
      setErrors(newErrors)
      
      // Only update if valid
      if (Object.keys(newErrors).length === 0) {
        onUpdate(localCustomer)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localCustomer, onUpdate])

  const handleChange = (field: keyof typeof localCustomer, value: string) => {
    setLocalCustomer(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          Enter customer information to begin the presentation. All data is saved automatically.
        </AlertDescription>
      </Alert>

      {/* Customer Form */}
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="customer-name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customer-name"
            type="text"
            placeholder="Enter customer's full name"
            value={localCustomer.name}
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
          <Label htmlFor="customer-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customer-phone"
            type="tel"
            placeholder="08X-XXXX-XXXX"
            value={localCustomer.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Thai phone number format (10 digits)
          </p>
        </div>

        {/* Email (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="customer-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="customer@example.com"
            value={localCustomer.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used for sending proposal and follow-up
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {localCustomer.name && localCustomer.phone && Object.keys(errors).length === 0 && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            ✓ Customer information saved
          </p>
          <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
            <p><strong>Name:</strong> {localCustomer.name}</p>
            <p><strong>Phone:</strong> {localCustomer.phone}</p>
            {localCustomer.email && (
              <p><strong>Email:</strong> {localCustomer.email}</p>
            )}
          </div>
        </Card>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
            Working offline. Customer data will be synced when connection is restored.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
