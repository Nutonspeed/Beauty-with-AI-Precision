"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2 } from "lucide-react"

export function PromoCodeManager() {
  const [promoCodes, _setPromoCodes] = useState([
    {
      id: "1",
      code: "WELCOME20",
      description: "Welcome discount for new customers",
      discountType: "percentage",
      discountValue: 20,
      usesCount: 45,
      maxUses: 100,
      active: true,
    },
    {
      id: "2",
      code: "SUMMER50",
      description: "Summer special offer",
      discountType: "fixed",
      discountValue: 50,
      usesCount: 23,
      maxUses: 50,
      active: true,
    },
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Promo Code</CardTitle>
              <CardDescription>Add a new promotional code for customers</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" placeholder="SUMMER2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="points">Loyalty Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" type="number" placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-uses">Max Uses</Label>
                <Input id="max-uses" type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description for internal use" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Promo Codes</CardTitle>
          <CardDescription>Manage existing promotional codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-bold">{promo.code}</code>
                    <Badge variant={promo.active ? "default" : "secondary"}>
                      {promo.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{promo.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}% off`
                        : `$${promo.discountValue} off`}
                    </span>
                    <span className="text-muted-foreground">
                      {promo.usesCount} / {promo.maxUses} uses
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
