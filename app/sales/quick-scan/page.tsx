 import { redirect } from 'next/navigation'
 import { defaultLocale } from '@/i18n/locales'
 
 export default function QuickScanPage() {
   redirect(`/${defaultLocale}/sales/quick-scan`)
 }
