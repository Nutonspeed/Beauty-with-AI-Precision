 import { redirect } from 'next/navigation'
 import { defaultLocale } from '@/i18n/request'
 
 export default function QuickScanPage() {
   redirect(`/${defaultLocale}/sales/quick-scan`)
 }
