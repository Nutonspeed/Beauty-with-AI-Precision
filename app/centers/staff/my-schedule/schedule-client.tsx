"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface StaffScheduleClientProps {
  staff: any;
  appointments: any[];
  todayStats: {
    total_appointments: number;
    completed: number;
    in_progress: number;
    pending: number;
    cancelled: number;
    no_show: number;
    revenue: number;
  };
  monthlyStats: {
    total_appointments: number;
    completed: number;
    total_revenue: number;
    completion_rate: number;
  };
}

export default function StaffScheduleClient({
  staff,
  appointments,
  todayStats,
  monthlyStats,
}: StaffScheduleClientProps) {
  const [selectedAppointment, _setSelectedAppointment] = useState<string | null>(
    null
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string
  ) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `/api/center/bookings/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any; icon: any }> = {
      confirmed: {
        label: "รอเข้ารับบริการ",
        variant: "outline",
        icon: Circle,
      },
      in_progress: {
        label: "กำลังให้บริการ",
        variant: "default",
        icon: PlayCircle,
      },
      completed: {
        label: "เสร็จสิ้น",
        variant: "default",
        icon: CheckCircle2,
      },
      cancelled: { label: "ยกเลิก", variant: "destructive", icon: XCircle },
      no_show: {
        label: "ไม่มา",
        variant: "secondary",
        icon: AlertCircle,
      },
    };

    const config = statusMap[status] || statusMap.confirmed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const upcomingAppointments = appointments.filter((apt) =>
    ["confirmed", "in_progress"].includes(apt.status)
  );
  const completedToday = appointments.filter(
    (apt) => apt.status === "completed"
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-white/30">
              <AvatarImage src={staff.profile_image_url} />
              <AvatarFallback className="bg-white text-purple-600 text-xl font-bold">
                {staff.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{staff.name}</h1>
              <p className="text-white/80 flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {staff.role === "doctor" && "ผู้เชี่ยวชาญ"}
                  {staff.role === "nurse" && "ฝ่ายเทคนิค"}
                  {staff.role === "therapist" && "ผู้ให้บริการ"}
                  {staff.role === "admin" && "ผู้ดูแลระบบ"}
                </Badge>
                <span>•</span>
                <span>{format(new Date(), "d MMMM yyyy", { locale: th })}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.total_appointments}</p>
                  <p className="text-xs text-muted-foreground">นัดวันนี้</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.completed}</p>
                  <p className="text-xs text-muted-foreground">เสร็จแล้ว</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.in_progress}</p>
                  <p className="text-xs text-muted-foreground">กำลังบริการ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ฿{todayStats.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">รายได้วันนี้</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">
              ตารางนัด ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              เสร็จแล้ว ({completedToday.length})
            </TabsTrigger>
            <TabsTrigger value="performance">ผลงาน</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">ไม่มีนัดที่รอให้บริการ</h3>
                  <p className="text-muted-foreground">
                    คุณได้ให้บริการนัดหมายครบแล้ววันนี้ 🎉
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className={`transition-all ${
                    selectedAppointment === appointment.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-3 md:min-w-[120px]">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {appointment.appointment_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.program?.duration || 60} นาที
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={appointment.customer?.profile_image_url}
                              />
                              <AvatarFallback>
                                {appointment.client?.name?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {appointment.client?.name || "ลูกค้า"}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {appointment.client?.phone}
                                </span>
                                {appointment.client?.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {appointment.client?.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="font-semibold text-sm mb-1">
                            โปรแกรมความงาม
                          </p>
                          <p className="text-sm">{appointment.program_type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ราคา: ฿{(appointment.total_price || 0).toLocaleString()}
                          </p>
                        </div>

                        {appointment.notes && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              📝 {appointment.notes}
                            </p>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-2 flex-wrap">
                          {appointment.status === "confirmed" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "in_progress"
                                  )
                                }
                                disabled={updatingStatus}
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                เริ่มให้บริการ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "no_show"
                                  )
                                }
                                disabled={updatingStatus}
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                ลูกค้าไม่มา
                              </Button>
                            </>
                          )}

                          {appointment.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "completed"
                                )
                              }
                              disabled={updatingStatus}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              เสร็จสิ้น
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedToday.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    ยังไม่มีนัดที่เสร็จสิ้นวันนี้
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedToday.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {appointment.client?.name}
                          </h3>
                          <Badge variant="default" className="bg-green-600">
                            เสร็จสิ้น
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {appointment.program_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          เวลา: {appointment.appointment_time} | ราคา: ฿
                          {(appointment.total_price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    สถิติ 30 วันล่าสุด
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">นัดหมายทั้งหมด</span>
                    <span className="font-bold text-xl">
                      {monthlyStats.total_appointments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">เสร็จสิ้น</span>
                    <span className="font-bold text-xl text-green-600">
                      {monthlyStats.completed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">อัตราความสำเร็จ</span>
                    <span className="font-bold text-xl text-blue-600">
                      {monthlyStats.completion_rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">รายได้รวม</span>
                    <span className="font-bold text-xl text-purple-600">
                      ฿{monthlyStats.total_revenue.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    ความสำเร็จ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyStats.completion_rate >= 90 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-sm">
                            🏆 ผู้ให้บริการยอดเยี่ยม
                          </p>
                          <p className="text-xs text-muted-foreground">
                            อัตราความสำเร็จเกิน 90%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {monthlyStats.completed >= 50 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm">
                            💪 นักบริการมืออาชีพ
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ให้บริการเสร็จครบ 50+ นัด
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {monthlyStats.total_revenue >= 100000 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-sm">
                            💰 เซลล์ระดับเพชร
                          </p>
                          <p className="text-xs text-muted-foreground">
                            รายได้เกิน 100,000 บาท
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {monthlyStats.completion_rate < 90 &&
                    monthlyStats.completed < 50 &&
                    monthlyStats.total_revenue < 100000 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">
                          ทำงานต่อไปเพื่อปลดล็อกความสำเร็จ! 💪
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
