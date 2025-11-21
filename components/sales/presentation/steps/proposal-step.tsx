'use client'

/**
 * Proposal Step Component
 * 
 * Generates pricing proposal with:
 * - Auto-populated treatments & products
 * - Editable quantities and prices
 * - Discount calculator
 * - Payment terms selector
 * - Mobile-optimized pricing table
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText,
  Plus,
  Minus,
  DollarSign,
  CreditCard,
  Package,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProduct3DManager } from '@/lib/ar/product-3d-viewer'
import { getTreatmentById, getTreatmentDisplayName, getTreatmentPrice } from '@/lib/sales/presentation-catalog'
import type { ProposalDetails, ProposalItem } from '@/lib/sales/presentation-types'

interface ProposalStepProps {
  readonly selectedTreatments: string[]
  readonly selectedProducts: string[]
  readonly proposal: ProposalDetails | null
  readonly onUpdate: (proposal: ProposalDetails) => void
  readonly customerName: string
  readonly isOnline: boolean
}

// Product price database (Thai Baht)
const PRODUCT_PRICES: Record<string, number> = {
  'vitamin-c-serum': 2890,
  'retinol-cream': 3490,
  'pico-device': 450000, // Device
  'botox-syringe': 12000,
}

export function ProposalStep({
  selectedTreatments,
  selectedProducts,
  proposal,
  onUpdate,
  customerName,
  isOnline,
}: ProposalStepProps) {
  const manager = getProduct3DManager()

  // Initialize proposal data
  const [items, setItems] = useState<ProposalItem[]>([])
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [paymentTerms, setPaymentTerms] = useState('full')
  const [notes, setNotes] = useState('')

  // Initialize items from selected treatments & products
  useEffect(() => {
    if (proposal) {
      // Load existing proposal
      setItems(proposal.items)
      setDiscountType(proposal.discountType)
      setDiscountValue(proposal.discountValue)
      setPaymentTerms(proposal.paymentTerms)
      setNotes(proposal.notes)
    } else {
      // Create new proposal from selections
      const newItems: ProposalItem[] = []

      // Add treatments
      for (const treatment of selectedTreatments) {
        const treatmentDefinition = getTreatmentById(treatment)
        const price = getTreatmentPrice(treatment)
        newItems.push({
          id: `treatment-${treatment}`,
          name: treatmentDefinition?.name ?? getTreatmentDisplayName(treatment),
          type: 'treatment',
          quantity: 1,
          pricePerUnit: price,
          total: price,
        })
      }

      // Add products
      for (const productId of selectedProducts) {
        const product = manager.getProduct(productId)
        const price = PRODUCT_PRICES[productId] || 2000
        
        if (product) {
          newItems.push({
            id: `product-${productId}`,
            name: product.name,
            type: 'product',
            quantity: 1,
            pricePerUnit: price,
            total: price,
          })
        }
      }

      setItems(newItems)
    }
  }, [selectedTreatments, selectedProducts, proposal, manager])

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = discountType === 'percent' 
    ? (subtotal * discountValue) / 100 
    : discountValue
  const total = Math.max(0, subtotal - discountAmount)

  // Update parent with proposal data
  useEffect(() => {
  const proposalData: ProposalDetails = {
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      total,
      paymentTerms,
      notes,
    }
    onUpdate(proposalData)
  }, [items, subtotal, discountType, discountValue, discountAmount, total, paymentTerms, notes, onUpdate])

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, quantity)
        return {
          ...item,
          quantity: newQuantity,
          total: item.pricePerUnit * newQuantity,
        }
      }
      return item
    }))
  }

  // Update item price
  const updatePrice = (id: string, price: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newPrice = Math.max(0, price)
        return {
          ...item,
          pricePerUnit: newPrice,
          total: newPrice * item.quantity,
        }
      }
      return item
    }))
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Add custom item
  const addCustomItem = () => {
    const newItem: ProposalItem = {
      id: `custom-${Date.now()}`,
      name: 'Custom Item',
      type: 'treatment',
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          Review and adjust the proposal for {customerName}. You can edit quantities, prices, and add custom items.
        </AlertDescription>
      </Alert>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            You're offline. Proposal will be saved locally and can be sent when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Proposal Items</CardTitle>
              <CardDescription>{items.length} items selected</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addCustomItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {items.map((item, _index) => (
            <Card key={item.id} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === 'treatment' ? (
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Package className="h-4 w-4 text-blue-500" />
                        )}
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))
                          }}
                          className="font-medium h-8"
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.type === 'treatment' ? 'Treatment' : 'Product'}
                      </Badge>
                    </div>
                    
                    {/* Remove Button */}
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Mobile-Optimized Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Quantity */}
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>

                    {/* Price Per Unit */}
                    <div className="space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={item.pricePerUnit}
                        onChange={(e) => updatePrice(item.id, Number.parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>

                    {/* Total */}
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-9 px-3 flex items-center bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <span className="text-sm font-semibold text-blue-600">
                          ฿{item.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pricing Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">฿{subtotal.toLocaleString()}</span>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label>Discount</Label>
            <div className="flex gap-2">
              {/* Discount Type Toggle */}
              <Select value={discountType} onValueChange={(v: 'percent' | 'fixed') => setDiscountType(v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="fixed">฿</SelectItem>
                </SelectContent>
              </Select>

              {/* Discount Value */}
              <Input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : subtotal}
                step={discountType === 'percent' ? 1 : 100}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number.parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="flex-1"
              />

              {/* Discount Amount Display */}
              <div className="px-4 flex items-center bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 min-w-[120px]">
                <span className="text-sm font-semibold text-red-600">
                  -฿{discountAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between text-2xl font-bold pt-4 border-t-2 border-primary/30">
            <span>Total:</span>
            <span className="text-primary">฿{total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Terms
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Payment (ชำระเต็มจำนวน)</SelectItem>
                <SelectItem value="installment-3">3 Installments (ผ่อน 3 งวด)</SelectItem>
                <SelectItem value="installment-6">6 Installments (ผ่อน 6 งวด)</SelectItem>
                <SelectItem value="installment-12">12 Installments (ผ่อน 12 งวด)</SelectItem>
                <SelectItem value="deposit-50">50% Deposit (มัดจำ 50%)</SelectItem>
                <SelectItem value="custom">Custom (กำหนดเอง)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Installment Preview */}
          {paymentTerms.startsWith('installment-') && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <AlertDescription className="text-sm">
                {(() => {
                  const months = Number.parseInt(paymentTerms.split('-')[1])
                  const perMonth = Math.ceil(total / months)
                  return `${months} payments of ฿${perMonth.toLocaleString()} per month`
                })()}
              </AlertDescription>
            </Alert>
          )}

          {paymentTerms === 'deposit-50' && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <AlertDescription className="text-sm">
                Deposit: ฿{Math.ceil(total * 0.5).toLocaleString()} | Balance: ฿{Math.floor(total * 0.5).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special conditions, warranties, or instructions..."
              rows={4}
              className={cn(
                "resize-none",
                "min-h-[100px]"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {items.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            No items in proposal. Please go back and select treatments or products.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
