import { redirect } from "next/navigation"
import { defaultLocale } from '@/i18n/locales'

type ProposalDetailRedirectProps = {
  params: { id: string }
}

export default function ProposalDetailPage({ params }: ProposalDetailRedirectProps) {
  redirect(`/${defaultLocale}/sales/proposals/${params.id}`)
}