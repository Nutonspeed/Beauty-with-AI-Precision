"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: { id: string; name: string } | null
  onSuccess: () => void
}

export function TransactionDialog({ open, onOpenChange, item, onSuccess }: TransactionDialogProps) {
  const [transactionType, setTransactionType] = useState("purchase")
  const [quantity, setQuantity] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!item) return

    setSaving(true)
    try {
      const response = await fetch("/api/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_item_id: item.id,
          transaction_type: transactionType,
          quantity: Number.parseInt(quantity),
          unit_cost: Number.parseFloat(unitCost) || 0,
          notes,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setQuantity("")
        setUnitCost("")
        setNotes("")
      }
    } catch (error) {
      console.error("[v0] Error recording transaction:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Transaction - {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          {transactionType === "purchase" && (
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost ($)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !quantity}>
              {saving ? "Recording..." : "Record Transaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
