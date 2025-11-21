// @ts-nocheck
"use client"

/**
 * Workflow Builder Component
 * 
 * Visual workflow editor for creating automation sequences.
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Save,
  X,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Tag,
  Edit,
  ArrowDown,
  Play,
} from "lucide-react"
import type { WorkflowStep, TriggerType, EventType } from "@/lib/marketing/campaign-manager"

interface WorkflowBuilderProps {
  onSave?: (workflow: {
    name: string
    description: string
    trigger: TriggerType
    event?: EventType
    steps: WorkflowStep[]
  }) => void
  onCancel?: () => void
  initialData?: {
    name: string
    description: string
    trigger: TriggerType
    event?: EventType
    steps: WorkflowStep[]
  }
}

const STEP_TYPES = [
  { value: "send_email", label: "Send Email", icon: Mail, color: "bg-blue-100 text-blue-700" },
  {
    value: "send_sms",
    label: "Send SMS",
    icon: MessageSquare,
    color: "bg-green-100 text-green-700",
  },
  { value: "wait", label: "Wait", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  { value: "condition", label: "Condition", icon: GitBranch, color: "bg-purple-100 text-purple-700" },
  { value: "tag", label: "Add Tag", icon: Tag, color: "bg-pink-100 text-pink-700" },
  {
    value: "update_field",
    label: "Update Field",
    icon: Edit,
    color: "bg-orange-100 text-orange-700",
  },
]

const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "scheduled", label: "Scheduled" },
  { value: "event-based", label: "Event-Based" },
  { value: "behavioral", label: "Behavioral" },
]

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "signup", label: "User Signup" },
  { value: "purchase", label: "Purchase" },
  { value: "booking", label: "Booking Made" },
  { value: "treatment_complete", label: "Treatment Completed" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "abandoned_cart", label: "Abandoned Cart" },
  { value: "inactivity", label: "Inactivity Period" },
]

export default function WorkflowBuilder({
  onSave,
  onCancel,
  initialData,
}: WorkflowBuilderProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [trigger, setTrigger] = useState<TriggerType>(initialData?.trigger || "event-based")
  const [event, setEvent] = useState<EventType | undefined>(initialData?.event || "signup")
  const [steps, setSteps] = useState<WorkflowStep[]>(
    initialData?.steps || [
      {
        type: "send_email",
        name: "Welcome Email",
        config: {
          subject: "Welcome to our clinic!",
          body: "Thank you for signing up...",
        },
      },
    ]
  )

  const addStep = (type: WorkflowStep["type"]) => {
    const defaultConfigs: Record<WorkflowStep["type"], unknown> = {
      send_email: {
        subject: "Email Subject",
        body: "Email body content...",
      },
      send_sms: {
        message: "SMS message content...",
      },
      wait: {
        duration: 24,
        unit: "hours",
      },
      condition: {
        field: "totalTreatments",
        operator: "greater_than",
        value: "0",
      },
      tag: {
        tag: "customer-tag",
      },
      update_field: {
        field: "status",
        value: "active",
      },
    }

    const stepNames: Record<WorkflowStep["type"], string> = {
      send_email: "Send Email",
      send_sms: "Send SMS",
      wait: "Wait",
      condition: "Check Condition",
      tag: "Add Tag",
      update_field: "Update Field",
    }

    setSteps([
      ...steps,
      {
        type,
        name: stepNames[type],
        config: defaultConfigs[type],
      },
    ])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...updates }
    setSteps(newSteps)
  }

  const updateStepConfig = (index: number, configKey: string, configValue: unknown) => {
    const newSteps = [...steps]
    newSteps[index] = {
      ...newSteps[index],
      config: {
        ...newSteps[index].config,
        [configKey]: configValue,
      },
    }
    setSteps(newSteps)
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a workflow name")
      return
    }
    if (steps.length === 0) {
      alert("Please add at least one step")
      return
    }
    if ((trigger === "event-based" || trigger === "behavioral") && !event) {
      alert("Please select an event for this trigger type")
      return
    }

    onSave?.({
      name: name.trim(),
      description: description.trim(),
      trigger,
      event: (trigger === "event-based" || trigger === "behavioral") ? event : undefined,
      steps,
    })
  }

  const getStepIcon = (type: WorkflowStep["type"]) => {
    const stepType = STEP_TYPES.find((s) => s.value === type)
    return stepType?.icon || Mail
  }

  const getStepColor = (type: WorkflowStep["type"]) => {
    const stepType = STEP_TYPES.find((s) => s.value === type)
    return stepType?.color || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Workflow Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>Define your automation workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              placeholder="e.g., Post-Treatment Follow-up"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              placeholder="Describe what this workflow does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={trigger} onValueChange={(value) => setTrigger(value as TriggerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(trigger === "event-based" || trigger === "behavioral") && (
              <div className="space-y-2">
                <Label>Event</Label>
                <Select
                  value={event}
                  onValueChange={(value) => setEvent(value as EventType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Build your automation sequence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trigger Indicator */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <Play className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Trigger</p>
              <p className="text-sm text-gray-600">
                {TRIGGER_TYPES.find((t) => t.value === trigger)?.label}
                {event && ` - ${EVENT_TYPES.find((e) => e.value === event)?.label}`}
              </p>
            </div>
          </div>

          {/* Steps List */}
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step.type)
            const stepColor = getStepColor(step.type)

            return (
              <div key={`step-${step.type}-${index}`}>
                {/* Arrow */}
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-gray-400" />
                </div>

                {/* Step Card */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${stepColor}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Input
                            value={step.name}
                            onChange={(e) => updateStep(index, { name: e.target.value })}
                            className="font-medium"
                            placeholder="Step name"
                          />
                          <Badge variant="outline" className="mt-1">
                            {STEP_TYPES.find((s) => s.value === step.type)?.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(index)}
                          disabled={steps.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Step Configuration */}
                      <div className="space-y-2">
                        {step.type === "send_email" && (
                          <>
                            <Input
                              placeholder="Email subject"
                              value={(step.config as { subject?: string }).subject || ""}
                              onChange={(e) => updateStepConfig(index, "subject", e.target.value)}
                            />
                            <Textarea
                              placeholder="Email body"
                              value={(step.config as { body?: string }).body || ""}
                              onChange={(e) => updateStepConfig(index, "body", e.target.value)}
                              rows={3}
                            />
                          </>
                        )}
                        {step.type === "send_sms" && (
                          <Textarea
                            placeholder="SMS message (max 160 characters)"
                            value={(step.config as { message?: string }).message || ""}
                            onChange={(e) => updateStepConfig(index, "message", e.target.value)}
                            rows={2}
                            maxLength={160}
                          />
                        )}
                        {step.type === "wait" && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Duration"
                              value={(step.config as { duration?: number }).duration || 0}
                              onChange={(e) =>
                                updateStepConfig(index, "duration", parseInt(e.target.value))
                              }
                            />
                            <Select
                              value={(step.config as { unit?: string }).unit || "hours"}
                              onValueChange={(value) => updateStepConfig(index, "unit", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {step.type === "condition" && (
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Field"
                              value={(step.config as { field?: string }).field || ""}
                              onChange={(e) => updateStepConfig(index, "field", e.target.value)}
                            />
                            <Select
                              value={(step.config as { operator?: string }).operator || "equals"}
                              onValueChange={(value) => updateStepConfig(index, "operator", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Value"
                              value={(step.config as { value?: string }).value || ""}
                              onChange={(e) => updateStepConfig(index, "value", e.target.value)}
                            />
                          </div>
                        )}
                        {step.type === "tag" && (
                          <Input
                            placeholder="Tag name"
                            value={(step.config as { tag?: string }).tag || ""}
                            onChange={(e) => updateStepConfig(index, "tag", e.target.value)}
                          />
                        )}
                        {step.type === "update_field" && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Field name"
                              value={(step.config as { field?: string }).field || ""}
                              onChange={(e) => updateStepConfig(index, "field", e.target.value)}
                            />
                            <Input
                              placeholder="New value"
                              value={(step.config as { value?: string }).value || ""}
                              onChange={(e) => updateStepConfig(index, "value", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add Step Buttons */}
          <div className="pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Add Step</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STEP_TYPES.map((stepType) => {
                const Icon = stepType.icon
                return (
                  <Button
                    key={stepType.value}
                    variant="outline"
                    onClick={() => addStep(stepType.value as WorkflowStep["type"])}
                    className="justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {stepType.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {steps.length} {steps.length === 1 ? "step" : "steps"} in workflow
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  )
}
