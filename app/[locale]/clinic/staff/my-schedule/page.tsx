"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function MySchedulePage() {
  const { language } = useLanguage()

  // Mock schedule data
  const todaySchedule = [
    { time: "09:00", customer: "คุณสมหญิง", treatment: "Botox", duration: "30 นาที", room: "ห้อง 1" },
    { time: "10:00", customer: "คุณมานี", treatment: "Filler", duration: "45 นาที", room: "ห้อง 2" },
    { time: "11:00", customer: "คุณวิชัย", treatment: "Laser", duration: "60 นาที", room: "ห้อง 1" },
    { time: "14:00", customer: "คุณสุดา", treatment: "Facial", duration: "90 นาที", room: "ห้อง 3" },
    { time: "16:00", customer: "คุณประภา", treatment: "Consultation", duration: "30 นาที", room: "ห้อง 1" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {language === "th" ? "ตารางงานของฉัน" : "My Schedule"}
            </h1>
            <p className="text-muted-foreground">
              {language === "th" 
                ? `วันนี้ ${new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                : `Today ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{todaySchedule.length}</div>
                <div className="text-sm text-muted-foreground">
                  {language === "th" ? "นัดหมายวันนี้" : "Today's Appointments"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-500">2</div>
                <div className="text-sm text-muted-foreground">
                  {language === "th" ? "เสร็จแล้ว" : "Completed"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-amber-500">3</div>
                <div className="text-sm text-muted-foreground">
                  {language === "th" ? "รอดำเนินการ" : "Pending"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {language === "th" ? "ตารางนัดหมาย" : "Appointment Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold">{item.time}</div>
                      <div className="text-xs text-muted-foreground">{item.duration}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {item.customer}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.treatment}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {item.room}
                    </div>
                    
                    <Badge variant={index < 2 ? "secondary" : "outline"}>
                      {index < 2 
                        ? (language === "th" ? "เสร็จแล้ว" : "Done")
                        : (language === "th" ? "รอ" : "Pending")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
