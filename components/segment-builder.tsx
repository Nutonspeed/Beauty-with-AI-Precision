// @ts-nocheck
"use client"

/**
 * Segment Builder Component
 * 
 * Visual condition builder for creating customer segments.
 */

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Users, Save, X } from "lucide-react"
import type {
  SegmentCondition,
  SegmentOperator,
  ConditionOperator,
} from "@/lib/marketing/campaign-manager"
import { CampaignManager } from "@/lib/marketing/campaign-manager"

interface SegmentBuilderProps {
  onSave?: (segment: { name: string; description: string; conditions: SegmentCondition[]; operator: SegmentOperator }) => void
  onCancel?: () => void
  initialData?: {
    name: string
    description: string
    conditions: SegmentCondition[]
    operator: SegmentOperator
  }
}

const AVAILABLE_FIELDS = [
  { value: "totalSpent", label: "Total Spent", type: "number" },
  { value: "totalTreatments", label: "Total Treatments", type: "number" },
  { value: "lastActivity", label: "Last Activity (days ago)", type: "number" },
  { value: "signupDate", label: "Signup Date (days ago)", type: "number" },
  { value: "age", label: "Age", type: "number" },
  { value: "gender", label: "Gender", type: "string" },
  { value: "city", label: "City", type: "string" },
  { value: "membershipTier", label: "Membership Tier", type: "string" },
  { value: "preferredTreatment", label: "Preferred Treatment", type: "string" },
]

const NUMERIC_OPERATORS: ConditionOperator[] = [
  "equals",
  "not_equals",
  "greater_than",
  "less_than",
]

const STRING_OPERATORS: ConditionOperator[] = [
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "in",
  "not_in",
]

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "Equals",
  not_equals: "Not Equals",
  greater_than: "Greater Than",
  less_than: "Less Than",
  contains: "Contains",
  not_contains: "Does Not Contain",
  in: "Is One Of",
  not_in: "Is Not One Of",
}

export default function SegmentBuilder({
  onSave,
  onCancel,
  initialData,
}: SegmentBuilderProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [conditions, setConditions] = useState<SegmentCondition[]>(
    initialData?.conditions || [
      {
        field: "totalSpent",
        operator: "greater_than",
        value: "0",
      },
    ]
  )
  const [operator, setOperator] = useState<SegmentOperator>(initialData?.operator || "AND")
  const [estimatedSize, setEstimatedSize] = useState(0)

  const updateEstimatedSize = useCallback(() => {
    try {
      const manager = CampaignManager.getInstance()
      const size = manager.calculateSegmentSize(conditions, operator)
      setEstimatedSize(size)
    } catch (error) {
      console.error("Error calculating segment size:", error)
      setEstimatedSize(0)
    }
  }, [conditions, operator])

  // Update estimated size when conditions change
  useState(() => {
    updateEstimatedSize()
  })

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: "totalSpent",
        operator: "greater_than",
        value: "0",
      },
    ])
  }

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    setConditions(newConditions)
  }

  const updateCondition = (
    index: number,
    updates: Partial<SegmentCondition>
  ) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    setConditions(newConditions)
    updateEstimatedSize()
  }

  const getOperatorsForField = (field: string): ConditionOperator[] => {
    const fieldConfig = AVAILABLE_FIELDS.find((f) => f.value === field)
    if (fieldConfig?.type === "number") {
      return NUMERIC_OPERATORS
    }
    return STRING_OPERATORS
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a segment name")
      return
    }
    if (conditions.length === 0) {
      alert("Please add at least one condition")
      return
    }
    onSave?.({
      name: name.trim(),
      description: description.trim(),
      conditions,
      operator,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
          <CardDescription>Define your customer segment name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="segment-name">Segment Name</Label>
            <Input
              id="segment-name"
              placeholder="e.g., VIP Customers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="segment-description">Description</Label>
            <Input
              id="segment-description"
              placeholder="e.g., High-value customers with multiple treatments"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Segment Conditions</CardTitle>
              <CardDescription>Build rules to define who is in this segment</CardDescription>
            </div>
            <Select
              value={operator}
              onValueChange={(value) => setOperator(value as SegmentOperator)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">Match ALL</SelectItem>
                <SelectItem value="OR">Match ANY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.map((condition, index) => {
            const fieldConfig = AVAILABLE_FIELDS.find((f) => f.value === condition.field)
            const availableOperators = getOperatorsForField(condition.field)

            return (
              <div key={`condition-${condition.field}-${index}`} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Field</Label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      const newFieldConfig = AVAILABLE_FIELDS.find((f) => f.value === value)
                      const newOperators = getOperatorsForField(value)
                      updateCondition(index, {
                        field: value,
                        operator: newOperators[0],
                        value: newFieldConfig?.type === "number" ? "0" : "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) =>
                      updateCondition(index, { operator: value as ConditionOperator })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOperators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OPERATOR_LABELS[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    type={fieldConfig?.type === "number" ? "number" : "text"}
                    placeholder={
                      condition.operator === "in" || condition.operator === "not_in"
                        ? "value1, value2, ..."
                        : "Enter value"
                    }
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeCondition(index)}
                  disabled={conditions.length === 1}
                  className="mb-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )
          })}

          <Button variant="outline" onClick={addCondition} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Audience</CardTitle>
          <CardDescription>Preview of how many customers match this segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{estimatedSize.toLocaleString()}</p>
              <p className="text-sm text-gray-600">customers match your criteria</p>
            </div>
          </div>
          {estimatedSize === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ No customers currently match these conditions. Consider adjusting your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          {operator === "AND" ? "Customers must match ALL conditions" : "Customers must match ANY condition"}
        </Badge>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Segment
          </Button>
        </div>
      </div>
    </div>
  )
}
