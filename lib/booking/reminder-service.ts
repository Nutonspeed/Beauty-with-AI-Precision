import { createClient } from '@/lib/supabase/server'
import { sendAppointmentReminderEmail, sendAppointmentConfirmationEmail } from '@/lib/email/gmail-templates'
import { format, addDays, subDays, addHours } from 'date-fns'
import { th } from 'date-fns/locale'

interface AppointmentReminder {
  id: string
  customer_email: string
  customer_name: string
  staff_name: string
  service_name: string
  start_time: string
  end_time: string
  clinic_name: string
  notes?: string
}

export class ReminderService {
  /**
   * Send confirmation email when appointment is created
   */
  static async sendConfirmation(appointmentId: string) {
    const supabase = await createClient()
    
    // Get appointment details with relations
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers!appointments_customer_id_fkey (
          full_name,
          email
        ),
        staff!appointments_staff_id_fkey (
          full_name
        ),
        services!appointments_service_id_fkey (
          name,
          duration
        ),
        clinics!appointments_clinic_id_fkey (
          name,
          address,
          phone
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      console.error('Error fetching appointment for confirmation:', error)
      return { success: false, error: 'Appointment not found' }
    }

    try {
      await sendAppointmentConfirmationEmail({
        to: appointment.customers.email,
        customerName: appointment.customers.full_name,
        staffName: appointment.staff.full_name,
        serviceName: appointment.services.name,
        appointmentDate: format(new Date(appointment.start_time), 'd MMMM yyyy', { locale: th }),
        appointmentTime: format(new Date(appointment.start_time), 'HH:mm'),
        duration: appointment.services.duration,
        clinicName: appointment.clinics.name,
        clinicAddress: appointment.clinics.address,
        clinicPhone: appointment.clinics.phone,
        notes: appointment.notes
      })

      // Update reminder_sent flag
      await supabase
        .from('appointments')
        .update({ 
          reminder_sent: true,
          reminder_type: 'confirmation'
        })
        .eq('id', appointmentId)

      return { success: true }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      return { success: false, error: 'Failed to send email' }
    }
  }

  /**
   * Send reminder email 24 hours before appointment
   */
  static async sendReminder(appointmentId: string) {
    const supabase = await createClient()
    
    // Get appointment details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers!appointments_customer_id_fkey (
          full_name,
          email,
          phone
        ),
        staff!appointments_staff_id_fkey (
          full_name
        ),
        services!appointments_service_id_fkey (
          name,
          duration
        ),
        clinics!appointments_clinic_id_fkey (
          name,
          address,
          phone
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      console.error('Error fetching appointment for reminder:', error)
      return { success: false, error: 'Appointment not found' }
    }

    try {
      await sendAppointmentReminderEmail({
        to: appointment.customers.email,
        customerName: appointment.customers.full_name,
        staffName: appointment.staff.full_name,
        serviceName: appointment.services.name,
        appointmentDate: format(new Date(appointment.start_time), 'd MMMM yyyy', { locale: th }),
        appointmentTime: format(new Date(appointment.start_time), 'HH:mm'),
        duration: appointment.services.duration,
        clinicName: appointment.clinics.name,
        clinicAddress: appointment.clinics.address,
        clinicPhone: appointment.clinics.phone,
        customerPhone: appointment.customers.phone,
        notes: appointment.notes
      })

      // Update reminder_sent flag
      await supabase
        .from('appointments')
        .update({ 
          reminder_sent: true,
          reminder_type: 'daily_reminder',
          reminder_sent_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      return { success: true }
    } catch (emailError) {
      console.error('Error sending reminder email:', emailError)
      return { success: false, error: 'Failed to send email' }
    }
  }

  /**
   * Process all appointments that need reminders
   * This should be called by a cron job daily
   */
  static async processDailyReminders() {
    const supabase = await createClient()
    
    // Get appointments for tomorrow that haven't received reminders
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStart = format(tomorrow, 'yyyy-MM-dd 00:00:00')
    const tomorrowEnd = format(tomorrow, 'yyyy-MM-dd 23:59:59')

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id')
      .gte('start_time', tomorrowStart)
      .lte('start_time', tomorrowEnd)
      .eq('status', 'confirmed')
      .is('reminder_sent', false)

    if (error) {
      console.error('Error fetching appointments for reminders:', error)
      return { success: false, error: 'Failed to fetch appointments' }
    }

    console.log(`Processing ${appointments?.length || 0} reminders for tomorrow`)

    const results = []
    for (const appointment of appointments || []) {
      const result = await this.sendReminder(appointment.id)
      results.push({ appointmentId: appointment.id, ...result })
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`Reminders sent: ${successful} successful, ${failed} failed`)

    return { 
      success: true, 
      total: appointments?.length || 0,
      successful,
      failed,
      results 
    }
  }

  /**
   * Send same-day reminder (2 hours before)
   */
  static async processSameDayReminders() {
    const supabase = await createClient()
    
    // Get appointments in next 2 hours that haven't received same-day reminders
    const now = new Date()
    const twoHoursLater = addHours(now, 2)
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        customers!appointments_customer_id_fkey (email, full_name),
        services!appointments_service_id_fkey (name),
        clinics!appointments_clinic_id_fkey (name)
      `)
      .gte('start_time', now.toISOString())
      .lte('start_time', twoHoursLater.toISOString())
      .eq('status', 'confirmed')
      .or('reminder_type.neq.same_day_reminder,reminder_type.is.null')

    if (error) {
      console.error('Error fetching same-day appointments:', error)
      return { success: false, error: 'Failed to fetch appointments' }
    }

    console.log(`Processing ${appointments?.length || 0} same-day reminders`)

    const results = []
    for (const appointment of appointments || []) {
      try {
        // Send SMS or LINE notification for same-day
        // TODO: Implement SMS/LINE integration
        
        // Update reminder type
        await supabase
          .from('appointments')
          .update({ 
            reminder_type: 'same_day_reminder',
            reminder_sent_at: new Date().toISOString()
          })
          .eq('id', appointment.id)

        results.push({ appointmentId: appointment.id, success: true })
      } catch (error) {
        console.error(`Failed to send same-day reminder for ${appointment.id}:`, error)
        results.push({ appointmentId: appointment.id, success: false, error: error.message })
      }
    }

    return { 
      success: true, 
      total: appointments?.length || 0,
      results 
    }
  }

  /**
   * Send cancellation notice
   */
  static async sendCancellationNotice(appointmentId: string, reason?: string) {
    const supabase = await createClient()
    
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers!appointments_customer_id_fkey (full_name, email),
        staff!appointments_staff_id_fkey (full_name),
        services!appointments_service_id_fkey (name),
        clinics!appointments_clinic_id_fkey (name)
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      console.error('Error fetching appointment for cancellation:', error)
      return { success: false, error: 'Appointment not found' }
    }

    try {
      // TODO: Create cancellation email template
      // For now, just log
      console.log(`Cancellation notice for ${appointment.customers.email}:`, reason)
      
      return { success: true }
    } catch (error) {
      console.error('Error sending cancellation notice:', error)
      return { success: false, error: 'Failed to send notice' }
    }
  }
}
