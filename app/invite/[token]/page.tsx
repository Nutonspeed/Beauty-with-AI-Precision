import AcceptInvitationClient from '@/components/invitations/accept-invitation-client'

interface AcceptInvitationPageProps {
  readonly params: Promise<{ token: string }>
}

export default async function AcceptInvitationPage({ params }: AcceptInvitationPageProps) {
  const { token } = await params
  return <AcceptInvitationClient token={token} />
}
