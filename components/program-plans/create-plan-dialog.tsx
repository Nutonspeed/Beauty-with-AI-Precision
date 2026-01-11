"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePlanDialog({ open, onOpenChange, onSuccess }: CreatePlanDialogProps) {
  const [concernType, setConcernType] = useState("")
  const [programs, setPrograms] = useState<{ name: string; sessions: number }[]>([{ name: "", sessions: 1 }])
  const [duration, setDuration] = useState("")
  const [cost, setCost] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleAddProgram = () => {
    setPrograms([...programs, { name: "", sessions: 1 }])
  }

  const handleRemoveProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index))
  }

  const handleProgramChange = (index: number, field: "name" | "sessions", value: string | number) => {
    const updated = [...programs]
    updated[index] = { ...updated[index], [field]: value }
    setPrograms(updated)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/program-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concern_type: concernType,
          programs,
          estimated_duration: duration,
          estimated_cost: Number.parseFloat(cost),
          notes,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        // Reset form
        setConcernType("")
        setPrograms([{ name: "", sessions: 1 }])
        setDuration("")
        setCost("")
        setNotes("")
      }
    } catch (error) {
      console.error("[v0] Error creating plan:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Program Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="concern">Primary Concern</Label>
            <Input
              id="concern"
              placeholder="e.g., Acne Treatment, Anti-Aging"
              value={concernType}
              onChange={(e) => setConcernType(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Programs</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddProgram}>
                <Plus className="h-4 w-4 mr-1" />
                Add Program
              </Button>
            </div>
            {programs.map((program, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Program name"
                  value={program.name}
                  onChange={(e) => handleProgramChange(index, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Sessions"
                  value={program.sessions}
                  onChange={(e) => handleProgramChange(index, "sessions", Number.parseInt(e.target.value))}
                  className="w-24"
                  min={1}
                />
                {programs.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveProgram(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 3 months"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !concernType || programs.some((p) => !p.name)}>
              {saving ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
