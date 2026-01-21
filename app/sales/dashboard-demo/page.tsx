import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/locales'

export default function SalesDashboardDemoPage() {
  redirect('/' + defaultLocale + '/sales/dashboard-demo')
}
