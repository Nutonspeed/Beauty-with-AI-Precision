"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    unit_price: "",
    quantity_in_stock: "",
    min_stock_level: "",
    unit_of_measure: "",
    supplier_name: "",
    supplier_contact: "",
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unit_price: Number.parseFloat(formData.unit_price),
          quantity_in_stock: Number.parseInt(formData.quantity_in_stock),
          min_stock_level: Number.parseInt(formData.min_stock_level),
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          name: "",
          sku: "",
          category: "",
          description: "",
          unit_price: "",
          quantity_in_stock: "",
          min_stock_level: "",
          unit_of_measure: "",
          supplier_name: "",
          supplier_contact: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding item:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Input
                id="unit_of_measure"
                placeholder="e.g., pieces, ml, kg"
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity_in_stock}
                onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Min Stock Level</Label>
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_contact">Supplier Contact</Label>
              <Input
                id="supplier_contact"
                value={formData.supplier_contact}
                onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.name}>
              {saving ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
