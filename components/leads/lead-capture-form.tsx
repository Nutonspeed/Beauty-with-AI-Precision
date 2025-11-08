"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import type { LeadSource, LeadStatus } from "@/types/multi-tenant"

const leadFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  line_id: z.string().optional(),
  status: z.enum(['new', 'contacted', 'hot', 'warm', 'cold']).default('new'),
  source: z.enum(['walk_in', 'online', 'referral', 'event', 'social_media', 'other']).optional(),
  interested_treatments: z.array(z.string()).default([]),
  budget_range: z.string().optional(),
  notes: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

interface LeadCaptureFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId?: string
  defaultValues?: Partial<LeadFormValues>
  onSuccess?: (leadId: string) => void
}

const TREATMENT_OPTIONS = [
  "Acne Treatment",
  "Anti-Aging",
  "Brightening",
  "Hydration",
  "Laser Treatment",
  "Facial Peel",
  "Botox/Fillers",
  "Skin Tightening",
  "Pigmentation Treatment",
  "Scar Treatment",
]

const BUDGET_OPTIONS = [
  "< ฿10,000",
  "฿10,000 - ฿30,000",
  "฿30,000 - ฿50,000",
  "฿50,000 - ฿100,000",
  "> ฿100,000",
]

const SOURCE_LABELS: Record<string, string> = {
  walk_in: "Walk-in",
  online: "Online",
  referral: "Referral",
  event: "Event",
  social_media: "Social Media",
  other: "Other",
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  hot: "Hot Lead",
  warm: "Warm Lead",
  cold: "Cold Lead",
}

export function LeadCaptureForm({
  open,
  onOpenChange,
  analysisId,
  defaultValues,
  onSuccess,
}: LeadCaptureFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      full_name: defaultValues?.full_name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      line_id: defaultValues?.line_id || "",
      status: defaultValues?.status || "new",
      source: defaultValues?.source || undefined,
      interested_treatments: defaultValues?.interested_treatments || [],
      budget_range: defaultValues?.budget_range || undefined,
      notes: defaultValues?.notes || "",
    },
  })

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true)

    try {
      const payload = {
        ...values,
        analysis_id: analysisId,
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create lead")
      }

      const result = await response.json()

      toast.success("Lead captured successfully!")
      
      // Reset form
      form.reset()
      
      // Close dialog
      onOpenChange(false)
      
      // Callback
      if (onSuccess) {
        onSuccess(result.data.id)
      } else {
        // Navigate to leads page
        router.push("/sales/leads")
      }
    } catch (error) {
      console.error("[LeadCaptureForm] Error creating lead:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Capture New Lead
          </DialogTitle>
          <DialogDescription>
            Create a new lead from this customer interaction
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+66 8X XXX XXXX" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="line_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line ID</FormLabel>
                    <FormControl>
                      <Input placeholder="@lineid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lead Status & Source */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Lead Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Interested Treatments */}
            <FormField
              control={form.control}
              name="interested_treatments"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Interested Treatments</FormLabel>
                    <FormDescription>
                      Select all treatments the customer is interested in
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TREATMENT_OPTIONS.map((treatment) => (
                      <FormField
                        key={treatment}
                        control={form.control}
                        name="interested_treatments"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={treatment}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(treatment)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, treatment])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== treatment
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {treatment}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Range */}
            <FormField
              control={form.control}
              name="budget_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((budget) => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Estimated budget for treatments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this lead..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any relevant information about the customer's needs or concerns
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Lead
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
