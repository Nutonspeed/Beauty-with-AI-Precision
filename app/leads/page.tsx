import { redirect } from 'next/navigation'
 import { defaultLocale } from '@/i18n/request'

export default function LeadsRedirectPage() {
  // Redirect /leads to /sales/leads
  redirect(`/${defaultLocale}/sales/leads`)
}
