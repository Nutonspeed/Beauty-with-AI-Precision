import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/request'

export default function SalesNotesPage() {
  redirect('/' + defaultLocale + '/sales/notes')
}
