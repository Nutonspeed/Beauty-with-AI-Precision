import { redirect } from 'next/navigation'

const defaultLocale = 'th'

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
