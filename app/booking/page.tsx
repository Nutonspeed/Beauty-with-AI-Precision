"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { format } from "date-fns"

const treatments = [
  { id: "consultation", name: "Free Consultation", duration: "30 min", price: "Free", priceValue: 0 },
  { id: "botox", name: "Botox Treatment", duration: "45 min", price: "฿8,000", priceValue: 8000 },
  { id: "filler", name: "Dermal Filler", duration: "60 min", price: "฿12,000", priceValue: 12000 },
  { id: "laser", name: "Laser Treatment", duration: "45 min", price: "฿6,000", priceValue: 6000 },
  { id: "peel", name: "Chemical Peel", duration: "60 min", price: "฿5,000", priceValue: 5000 },
  { id: "microneedling", name: "Microneedling", duration: "60 min", price: "฿7,000", priceValue: 7000 },
]

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTreatment, setSelectedTreatment] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          treatmentId: selectedTreatment,
          date: date ? format(date, "yyyy-MM-dd") : "",
          time: selectedTime,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const result = await response.json()
      console.log("[v0] Booking created:", result)
      setIsSubmitted(true)
    } catch (err) {
      console.error("[v0] Booking error:", err)
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-20">
          <Card className="w-full max-w-md border-2 border-primary">
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold">Booking Confirmed!</h2>
              <p className="mb-1 text-lg text-primary">การจองสำเร็จ!</p>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                Your appointment has been scheduled. We've sent a confirmation email with all the details.
                <br />
                การนัดหมายของคุณได้รับการจัดเวลาแล้ว เราได้ส่งอีเมลยืนยันพร้อมรายละเอียดทั้งหมด
              </p>
              <div className="mb-6 space-y-2 rounded-lg bg-muted/50 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{date && format(date, "PPP")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Treatment:</span>
                  <span className="font-medium">{treatments.find((t) => t.id === selectedTreatment)?.name}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({ firstName: "", lastName: "", email: "", phone: "", notes: "" })
                  setSelectedTreatment("")
                  setSelectedTime("")
                  setDate(new Date())
                }}
              >
                Book Another Appointment / จองอีกครั้ง
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold">Book an Appointment</h1>
              <p className="text-lg text-primary">จองนัดหมาย</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Schedule your consultation or treatment with our expert team
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Treatment Selection */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Select Treatment / เลือกการรักษา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {treatments.map((treatment) => (
                        <Card
                          key={treatment.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTreatment === treatment.id ? "border-2 border-primary bg-primary/5" : "border"
                          }`}
                          onClick={() => setSelectedTreatment(treatment.id)}
                        >
                          <CardContent className="p-3">
                            <div className="mb-1 font-medium">{treatment.name}</div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {treatment.duration}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {treatment.price}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Date, Time & Details */}
                <div className="space-y-6 lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Select Date & Time / เลือกวันและเวลา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="mb-2 block">Choose Date / เลือกวัน</Label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Choose Time / เลือกเวลา</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="w-full"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Information / ข้อมูลของคุณ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name / ชื่อ</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name / นามสกุล</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email / อีเมล</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone / เบอร์โทร</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="08X-XXX-XXXX"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes / หมายเหตุเพิ่มเติม (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any specific concerns or questions..."
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={!selectedTreatment || !date || !selectedTime || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Booking...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Confirm Booking / ยืนยันการจอง
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
