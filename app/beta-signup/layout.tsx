import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Join Beta Testing - AI367',
  description: 'เข้าร่วม AI367 Beta Testing Program! ทดลองใช้ระบบวิเคราะห์ผิวหน้าด้วย AI + AR Treatment Simulator ก่อนใคร พร้อมรับสิทธิพิเศษมากมาย',
  keywords: 'AI367, beta testing, skin analysis, AR simulator, beauty tech, skincare',
  openGraph: {
    title: 'Join AI367 Beta Testing Program',
    description: 'รับสิทธิ์ Premium 6 เดือนฟรี (มูลค่า ฿1,794) พร้อม early access features',
    images: ['/og-beta-signup.png'],
  },
}

export default function BetaSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
