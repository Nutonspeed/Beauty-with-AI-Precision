"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Save } from "lucide-react"
import { format } from "date-fns"

export function AvailabilityManager() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("18:00")
  const [isAvailable, setIsAvailable] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/schedule/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          day_of_week: selectedDate.getDay(),
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        }),
      })

      if (response.ok) {
        alert("Availability saved successfully!")
      }
    } catch (error) {
      console.error("[v0] Error saving availability:", error)
      alert("Failed to save availability")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Availability for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="available">Available</Label>
            <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>

          {isAvailable && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Availability
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
