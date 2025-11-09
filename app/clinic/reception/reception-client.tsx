"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  User,
  Phone,
  CheckCircle2,
  UserCheck,
  Users,
  AlertCircle,
  Search,
  QrCode,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { th } from "date-fns/locale";
import { getStatusColor, STATUS_LABELS } from "@/lib/ui/colors";

interface ReceptionClientProps {
  bookings: any[];
  stats: {
    total: number;
    checked_in: number;
    waiting: number;
    pending: number;
    completed: number;
    no_show: number;
  };
}

export default function ReceptionClient({
  bookings: initialBookings,
  stats: initialStats,
}: ReceptionClientProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleCheckIn = async (bookingId: string) => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/clinic/bookings/${bookingId}/check-in`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error checking in:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusInfo = (status: string) => {
    // Use centralized color system
    const colors = getStatusColor(status as keyof typeof STATUS_LABELS);
    const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

    return {
      label,
      color: colors.text,
      bgColor: colors.background,
      badgeColor: colors.badge,
    };
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.customer?.name?.toLowerCase().includes(query) ||
      booking.customer?.phone?.includes(query) ||
      booking.id.toLowerCase().includes(query)
    );
  });

  const pendingBookings = filteredBookings.filter(
    (b) => b.status === "confirmed"
  );
  const arrivedBookings = filteredBookings.filter((b) => b.status === "arrived");
  const inProgressBookings = filteredBookings.filter(
    (b) => b.status === "in_progress"
  );

  const getCurrentTime = () => {
    return format(new Date(), "HH:mm");
  };

  const getWaitTime = (appointmentTime: string) => {
    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const appointmentDate = new Date();
    appointmentDate.setHours(hours, minutes, 0);
    const now = new Date();
    const diff = differenceInMinutes(appointmentDate, now);
    if (diff < 0) return "เลยเวลา";
    if (diff === 0) return "ถึงเวลา";
    return `อีก ${diff} นาที`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏥 Reception Check-in</h1>
              <p className="text-white/80">
                {format(new Date(), "EEEE, d MMMM yyyy", { locale: th })} •{" "}
                {format(new Date(), "HH:mm")} น.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                รีเฟรช
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="lg">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Walk-in
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ลูกค้า Walk-in (ไม่มีนัด)</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input placeholder="ชื่อลูกค้า" />
                    <Input placeholder="เบอร์โทร" />
                    <Input placeholder="การรักษา" />
                    <Button className="w-full">สร้างนัดใหม่</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">นัดทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">รอเช็คอิน</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6 text-center">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-3xl font-bold text-orange-600">
                {stats.waiting}
              </p>
              <p className="text-xs text-muted-foreground">เช็คอินแล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold">{stats.checked_in}</p>
              <p className="text-xs text-muted-foreground">กำลังบริการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">เสร็จสิ้น</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-3xl font-bold">{stats.no_show}</p>
              <p className="text-xs text-muted-foreground">ไม่มา</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ค้นหา: ชื่อ, เบอร์โทร, หรือรหัสนัด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Main Grid - 3 Columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Column 1: Pending Check-in */}
          <div className="space-y-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                รอเช็คอิน ({pendingBookings.length})
              </h2>
            </div>

            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    ไม่มีนัดที่รอเช็คอิน
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.status);
                return (
                  <Card
                    key={booking.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      {/* Time Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {booking.appointment_time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getWaitTime(booking.appointment_time)}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusInfo.bgColor}>
                          <span className={statusInfo.color}>
                            {statusInfo.label}
                          </span>
                        </Badge>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={booking.customer?.profile_image_url}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {booking.customer?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {booking.customer?.name || "ลูกค้า"}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.customer?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Treatment */}
                      <div className="bg-muted/50 rounded p-2 mb-3">
                        <p className="text-sm font-medium">
                          {booking.treatment_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ผู้ให้บริการ: {booking.staff?.name || "-"}
                        </p>
                      </div>

                      {/* Check-in Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                        size="lg"
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={isChecking}
                      >
                        <UserCheck className="w-5 h-5 mr-2" />
                        เช็คอิน
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Column 2: Checked In (Waiting) */}
          <div className="space-y-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                เช็คอินแล้ว - รอให้บริการ ({arrivedBookings.length})
              </h2>
            </div>

            {arrivedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    ไม่มีลูกค้ารอให้บริการ
                  </p>
                </CardContent>
              </Card>
            ) : (
              arrivedBookings.map((booking, index) => {
                const statusInfo = getStatusInfo(booking.status);
                return (
                  <Card
                    key={booking.id}
                    className="border-orange-200 dark:border-orange-800"
                  >
                    <CardContent className="p-4">
                      {/* Queue Number */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-orange-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {booking.appointment_time}
                          </p>
                          <Badge className={statusInfo.bgColor}>
                            <span className={statusInfo.color}>
                              {statusInfo.label}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={booking.customer?.profile_image_url}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                            {booking.customer?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {booking.customer?.name || "ลูกค้า"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.treatment_type}
                          </p>
                        </div>
                      </div>

                      {/* Staff Assignment */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          👤 {booking.staff?.name || "รอมอบหมาย"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Column 3: In Progress */}
          <div className="space-y-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                กำลังให้บริการ ({inProgressBookings.length})
              </h2>
            </div>

            {inProgressBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    ยังไม่มีการให้บริการ
                  </p>
                </CardContent>
              </Card>
            ) : (
              inProgressBookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.status);
                return (
                  <Card
                    key={booking.id}
                    className="border-purple-200 dark:border-purple-800"
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-lg">
                          {booking.appointment_time}
                        </p>
                        <Badge className={statusInfo.bgColor}>
                          <span className={statusInfo.color}>
                            {statusInfo.label}
                          </span>
                        </Badge>
                      </div>

                      {/* Customer & Staff */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={booking.customer?.profile_image_url}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {booking.customer?.name?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {booking.customer?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ลูกค้า
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {booking.staff?.name || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ผู้ให้บริการ
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Treatment */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="text-sm font-medium">
                          {booking.treatment_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ระยะเวลา: {booking.treatment?.duration || 60} นาที
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
