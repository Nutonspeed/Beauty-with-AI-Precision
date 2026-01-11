// @ts-nocheck
"use client"

/**
 * Workflow Builder Component
 * 
 * Visual workflow editor for creating automation sequences.
 */

import { useState } from "react"
import { useTranslations } from "next-intl"
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
    { value: "send_email", label: t('workflowBuilder.stepTypes.send_email'), icon: Mail, color: "bg-blue-100 text-blue-700" },
    {
      value: "send_sms",
      label: t('workflowBuilder.stepTypes.send_sms'),
      icon: MessageSquare,
      color: "bg-green-100 text-green-700",
    },
    { value: "wait", label: t('workflowBuilder.stepTypes.wait'), icon: Clock, color: "bg-yellow-100 text-yellow-700" },
    { value: "condition", label: t('workflowBuilder.stepTypes.condition'), icon: GitBranch, color: "bg-purple-100 text-purple-700" },
    { value: "tag", label: t('workflowBuilder.stepTypes.tag'), icon: Tag, color: "bg-pink-100 text-pink-700" },
    {
      value: "update_field",
      label: t('workflowBuilder.stepTypes.update_field'),
      icon: Edit,
      color: "bg-orange-100 text-orange-700",
    },
  ]

  const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
    { value: "immediate", label: t('workflowBuilder.triggerTypes.immediate') },
    { value: "scheduled", label: t('workflowBuilder.triggerTypes.scheduled') },
    { value: "event-based", label: t('workflowBuilder.triggerTypes.event-based') },
    { value: "behavioral", label: t('workflowBuilder.triggerTypes.behavioral') },
  ]

  const EVENT_TYPES: { value: EventType; label: string }[] = [
    { value: "signup", label: t('workflowBuilder.eventTypes.signup') },
    { value: "purchase", label: t('workflowBuilder.eventTypes.purchase') },
    { value: "booking", label: t('workflowBuilder.eventTypes.booking') },
    { value: "program_complete", label: t('workflowBuilder.eventTypes.program_complete') },
    { value: "birthday", label: t('workflowBuilder.eventTypes.birthday') },
    { value: "anniversary", label: t('workflowBuilder.eventTypes.anniversary') },
    { value: "abandoned_cart", label: t('workflowBuilder.eventTypes.abandoned_cart') },
    { value: "inactivity", label: t('workflowBuilder.eventTypes.inactivity') },
  ]

export default function WorkflowBuilder({
  onSave,
  onCancel,
  initialData,
}: WorkflowBuilderProps) {
  const t = useTranslations()
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
          subject: "Welcome to our center!",
          body: "Thank you for signing up...",
        },
      },
    ]
  )

  const addStep = (type: WorkflowStep["type"]) => {
    const defaultConfigs: Record<WorkflowStep["type"], unknown> = {
      send_email: {
        subject: t('workflowBuilder.config.emailSubject'),
        body: t('workflowBuilder.config.emailBody'),
      },
      send_sms: {
        message: t('workflowBuilder.config.smsMessage'),
      },
      wait: {
        duration: 24,
        unit: "hours",
      },
      condition: {
        field: "totalServices",
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
      send_email: t('workflowBuilder.stepTypes.send_email'),
      send_sms: t('workflowBuilder.stepTypes.send_sms'),
      wait: t('workflowBuilder.stepTypes.wait'),
      condition: t('workflowBuilder.stepTypes.condition'),
      tag: t('workflowBuilder.stepTypes.tag'),
      update_field: t('workflowBuilder.stepTypes.update_field'),
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
      alert(t('workflowBuilder.alerts.enterName'))
      return
    }
    if (steps.length === 0) {
      alert(t('workflowBuilder.alerts.addStep'))
      return
    }
    if ((trigger === "event-based" || trigger === "behavioral") && !event) {
      alert(t('workflowBuilder.alerts.selectEvent'))
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
          <CardTitle>{t('workflowBuilder.title')}</CardTitle>
          <CardDescription>{t('workflowBuilder.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">{t('workflowBuilder.nameLabel')}</Label>
            <Input
              id="workflow-name"
              placeholder={t('workflowBuilder.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">{t('workflowBuilder.descLabel')}</Label>
            <Textarea
              id="workflow-description"
              placeholder={t('workflowBuilder.descPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('workflowBuilder.triggerType')}</Label>
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
                <Label>{t('workflowBuilder.eventLabel')}</Label>
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
          <CardTitle>{t('workflowBuilder.stepsTitle')}</CardTitle>
          <CardDescription>{t('workflowBuilder.stepsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trigger Indicator */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 text-blue-900">
            <Play className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold">{t('workflowBuilder.triggerLabel')}</p>
              <p className="text-sm opacity-80">
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
                            placeholder={t('workflowBuilder.config.stepName')}
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
                              placeholder={t('workflowBuilder.config.emailSubject')}
                              value={(step.config as { subject?: string }).subject || ""}
                              onChange={(e) => updateStepConfig(index, "subject", e.target.value)}
                            />
                            <Textarea
                              placeholder={t('workflowBuilder.config.emailBody')}
                              value={(step.config as { body?: string }).body || ""}
                              onChange={(e) => updateStepConfig(index, "body", e.target.value)}
                              rows={3}
                            />
                          </>
                        )}
                        {step.type === "send_sms" && (
                          <Textarea
                            placeholder={t('workflowBuilder.config.smsMessage')}
                            value={(step.config as { message?: string }).message || ""}
                            onChange={(e) => updateStepConfig(index, "message", e.target.value)}
                            rows={2}
                            maxLength={160}
                          />
                        )}
                        {step.type === "wait" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.duration')}</Label>
                              <Input
                                type="number"
                                placeholder={t('workflowBuilder.config.duration')}
                                value={(step.config as { duration?: number }).duration || 0}
                                onChange={(e) =>
                                  updateStepConfig(index, "duration", parseInt(e.target.value))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.unit')}</Label>
                              <Select
                                value={(step.config as { unit?: string }).unit || "hours"}
                                onValueChange={(value) => updateStepConfig(index, "unit", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minutes">{t('workflowBuilder.config.units.minutes')}</SelectItem>
                                  <SelectItem value="hours">{t('workflowBuilder.config.units.hours')}</SelectItem>
                                  <SelectItem value="days">{t('workflowBuilder.config.units.days')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        {step.type === "condition" && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.field')}</Label>
                              <Input
                                placeholder={t('workflowBuilder.config.field')}
                                value={(step.config as { field?: string }).field || ""}
                                onChange={(e) => updateStepConfig(index, "field", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.operator')}</Label>
                              <Select
                                value={(step.config as { operator?: string }).operator || "equals"}
                                onValueChange={(value) => updateStepConfig(index, "operator", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">{t('workflowBuilder.config.operators.equals')}</SelectItem>
                                  <SelectItem value="not_equals">{t('workflowBuilder.config.operators.not_equals')}</SelectItem>
                                  <SelectItem value="greater_than">{t('workflowBuilder.config.operators.greater_than')}</SelectItem>
                                  <SelectItem value="less_than">{t('workflowBuilder.config.operators.less_than')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.value')}</Label>
                              <Input
                                placeholder={t('workflowBuilder.config.value')}
                                value={(step.config as { value?: string }).value || ""}
                                onChange={(e) => updateStepConfig(index, "value", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {step.type === "tag" && (
                          <div className="space-y-1">
                            <Label className="text-xs">{t('workflowBuilder.config.tagName')}</Label>
                            <Input
                              placeholder={t('workflowBuilder.config.tagName')}
                              value={(step.config as { tag?: string }).tag || ""}
                              onChange={(e) => updateStepConfig(index, "tag", e.target.value)}
                            />
                          </div>
                        )}
                        {step.type === "update_field" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.fieldName')}</Label>
                              <Input
                                placeholder={t('workflowBuilder.config.fieldName')}
                                value={(step.config as { field?: string }).field || ""}
                                onChange={(e) => updateStepConfig(index, "field", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('workflowBuilder.config.newValue')}</Label>
                              <Input
                                placeholder={t('workflowBuilder.config.newValue')}
                                value={(step.config as { value?: string }).value || ""}
                                onChange={(e) => updateStepConfig(index, "value", e.target.value)}
                              />
                            </div>
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
            <p className="text-sm font-medium text-gray-700 mb-2">{t('workflowBuilder.addStep')}</p>
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
          {t('workflowBuilder.stepCount', { count: steps.length })}
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {t('workflowBuilder.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
