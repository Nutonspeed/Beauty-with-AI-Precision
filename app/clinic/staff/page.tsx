// @ts-nocheck
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/supabase/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StaffClient } from "./staff-client"

// TypeScript interfaces
interface StaffMember {
  id: string
  user_id: string
  role: string
  specialty: string | null
  email: string
  phone: string | null
  status: string
  rating: number | null
  patients_today: number
  appointments_today: number
  join_date: string
  avatar_url: string | null
  full_name: string
  user?: {
    full_name: string
    email: string
  }
}

interface StaffStats {
  total: number
  active: number
  on_leave: number
  doctors: number
  nurses: number
  therapists: number
  admins: number
}

export default async function StaffPage() {
  // Authentication check
  const user = await requireRole(['clinic_owner', 'super_admin'])
  const supabase = await createServerClient()

  // Query staff data with JOIN to users table
  const { data: staffData, error: staffError } = await supabase
    .from('clinic_staff')
    .select(`
      *,
      user:users!clinic_staff_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (staffError) {
    console.error('Error fetching staff:', staffError)
  }

  // Calculate stats
  const { count: totalCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })

  const { count: activeCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: onLeaveCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'on_leave')

  const { count: doctorsCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'doctor')

  const { count: nursesCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'nurse')

  const { count: therapistsCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'therapist')

  const { count: adminsCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  const stats: StaffStats = {
    total: totalCount || 0,
    active: activeCount || 0,
    on_leave: onLeaveCount || 0,
    doctors: doctorsCount || 0,
    nurses: nursesCount || 0,
    therapists: therapistsCount || 0,
    admins: adminsCount || 0,
  }

  // Transform data to expected format
  const staff: StaffMember[] = (staffData || []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    role: s.role,
    specialty: s.specialty,
    email: s.email,
    phone: s.phone,
    status: s.status,
    rating: s.rating,
    patients_today: s.patients_today || 0,
    appointments_today: s.appointments_today || 0,
    join_date: s.join_date,
    avatar_url: s.avatar_url,
    full_name: s.user?.full_name || s.email,
    user: s.user,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <StaffClient initialStaff={staff} initialStats={stats} />
      <Footer />
    </div>
  )
}
