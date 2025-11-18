import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Beauty with AI Precision',
  description: 'Common questions about AI skin analysis accuracy, privacy, and usage.',
}

// Basic FAQ data – in real use this would be localized via i18n.
const faqs: { q: string; a: string }[] = [
  { q: 'AI วิเคราะห์ผิวแม่นยำแค่ไหน?', a: 'โมเดลผ่านการทดสอบกับตัวอย่างหลากหลายและปรับปรุงต่อเนื่อง โดยมีการตรวจสอบเชิงคลินิก.' },
  { q: 'ข้อมูลภาพถูกเก็บไว้อย่างไร?', a: 'เข้ารหัสระหว่างส่ง มีตัวเลือกไม่บันทึกภาพถาวร และปฏิบัติตาม PDPA/GDPR.' },
  { q: 'ต้องใช้อุปกรณ์อะไรเป็นพิเศษหรือไม่?', a: 'ใช้อุปกรณ์กล้องมาตรฐานที่มีความละเอียดพอสมควร รองรับทั้งเว็บและมือถือ.' },
]

export default function FaqPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
  return (
    <div className="container py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="mb-8 text-3xl font-bold tracking-tight">คำถามที่พบบ่อย (FAQ)</h1>
      <div className="space-y-6 max-w-3xl">
        {faqs.map(f => (
          <div key={f.q} className="rounded-lg border border-border/70 p-4 bg-muted/30">
            <h2 className="mb-2 text-lg font-semibold">{f.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
