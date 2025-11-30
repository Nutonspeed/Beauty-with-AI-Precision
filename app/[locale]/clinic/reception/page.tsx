import { redirect } from 'next/navigation'

/**
 * Clinic Reception - Redirects to Booking Queue
 */
export default function ClinicReceptionPage() {
  redirect('/th/booking')
}
