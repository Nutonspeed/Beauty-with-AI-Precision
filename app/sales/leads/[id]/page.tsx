 import { redirect } from 'next/navigation'
 import { defaultLocale } from '@/i18n/request'
 
 type LeadDetailRedirectProps = {
   params: { id: string }
 }
 
 export default function LeadDetailPage({ params }: LeadDetailRedirectProps) {
   redirect(`/${defaultLocale}/sales/leads/${params.id}`)
 }
