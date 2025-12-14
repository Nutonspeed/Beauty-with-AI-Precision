export type Locale = 'th' | 'en'

type LocalizedText = string | Record<Locale, string>

type CaseStudyMetric = {
  label: LocalizedText
  value: string
}

type CaseStudyContentSection = {
  heading: LocalizedText
  body: LocalizedText
}

export type CaseStudy = {
  slug: string
  title: LocalizedText
  summary: LocalizedText
  metrics: CaseStudyMetric[]
  content?: CaseStudyContentSection[]
  disclaimer?: LocalizedText
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'queue-reduction-6-weeks',
    title: {
      th: 'ลดเวลารอคิวเฉลี่ย 37% ภายใน 6 สัปดาห์',
      en: 'Reduced average waiting time by 37% in 6 weeks',
    },
    summary: {
      th: 'คลินิก A, กรุงเทพฯ — ปรับ flow ด้วย AI pre-screen และการติดตามอัตโนมัติ',
      en: 'Clinic A, Bangkok — improved flow using AI pre-screening and automated follow-ups',
    },
    metrics: [
      { label: { th: 'เวลารอคิว', en: 'Waiting time' }, value: '-37%' },
      { label: { th: 'อัตราปิดการขาย', en: 'Close rate' }, value: '+12%' },
      { label: { th: 'เวลาตอบกลับลีด', en: 'Lead response time' }, value: '-42%' },
    ],
    content: [
      {
        heading: { th: 'สถานการณ์ก่อนใช้', en: 'Before' },
        body: {
          th: 'ลูกค้าต้องเข้าคลินิกก่อนถึงทราบปัญหาผิว ทำให้คิวแน่นและทีมต้องตอบคำถามซ้ำๆ',
          en: 'Clients needed an in-clinic visit to understand skin concerns, causing long queues and repeated Q&A for staff.',
        },
      },
      {
        heading: { th: 'แนวทางที่ทำ', en: 'What we did' },
        body: {
          th: 'ใช้ AI วิเคราะห์เบื้องต้นจากบ้าน + ส่งข้อเสนอแนะ/นัดหมายอัตโนมัติ + ให้เซลมีข้อมูลครบก่อนคุย',
          en: 'Used at-home AI pre-analysis + automated follow-ups/booking + ensured sales had context before outreach.',
        },
      },
      {
        heading: { th: 'ผลลัพธ์', en: 'Results' },
        body: {
          th: 'ลดเวลารอคิว เพิ่ม conversion และลดภาระงานทีมหน้าร้าน',
          en: 'Reduced waiting time, increased conversion, and lowered front-desk workload.',
        },
      },
    ],
    disclaimer: {
      th: 'เคสจำลองเพื่ออธิบายความสามารถของระบบ ไม่ใช่คำแนะนำทางการแพทย์',
      en: 'Simulated case to demonstrate capabilities. Not medical advice.',
    },
  },
  {
    slug: 'conversion-boost-follow-up',
    title: {
      th: 'เพิ่ม conversion 18% ด้วย follow-up ที่ตรงประเด็น',
      en: 'Boosted conversion by 18% with targeted follow-ups',
    },
    summary: {
      th: 'คลินิก B — ใช้ segmentation จากผลวิเคราะห์ผิวเพื่อส่งข้อเสนอที่เหมาะกับลูกค้า',
      en: 'Clinic B — used segmentation from skin analysis results to send relevant offers',
    },
    metrics: [
      { label: { th: 'Conversion', en: 'Conversion' }, value: '+18%' },
      { label: { th: 'อัตราตอบกลับ', en: 'Reply rate' }, value: '+25%' },
      { label: { th: 'เวลาปิดดีล', en: 'Time to close' }, value: '-20%' },
    ],
    content: [
      {
        heading: { th: 'สิ่งที่ได้เรียนรู้', en: 'Key insight' },
        body: {
          th: 'ลูกค้าตอบสนองดีขึ้นเมื่อข้อความ follow-up อ้างอิงผลลัพธ์ที่เห็นในรายงานและมี next-step ชัดเจน',
          en: 'Customers respond better when follow-ups reference their report and provide clear next steps.',
        },
      },
      {
        heading: { th: 'การนำไปใช้', en: 'Implementation' },
        body: {
          th: 'สร้าง template ข้อความตาม concern หลัก และกำหนด SLA ตอบกลับลีด',
          en: 'Built message templates per primary concern and enforced lead response SLAs.',
        },
      },
    ],
    disclaimer: {
      th: 'เคสจำลองเพื่ออธิบายความสามารถของระบบ ไม่ใช่คำแนะนำทางการแพทย์',
      en: 'Simulated case to demonstrate capabilities. Not medical advice.',
    },
  },
]

function localize(value: LocalizedText, locale: Locale): string {
  if (typeof value === 'string') return value
  return value[locale] || value.th || value.en || ''
}

export function getCaseStudies(locale: Locale): { slug: string; title: string; summary: string; metrics: { label: string; value: string }[] }[] {
  return CASE_STUDIES.map((study) => ({
    slug: study.slug,
    title: localize(study.title, locale),
    summary: localize(study.summary, locale),
    metrics: study.metrics.map((m) => ({ label: localize(m.label, locale), value: m.value })),
  }))
}

export function getCaseStudyBySlug(locale: Locale, slug: string): CaseStudy | null {
  const study = CASE_STUDIES.find((s) => s.slug === slug)
  if (!study) return null

  return {
    ...study,
    title: localize(study.title, locale),
    summary: localize(study.summary, locale),
    metrics: study.metrics.map((m) => ({ label: localize(m.label, locale), value: m.value })),
    content: (study.content || []).map((section) => ({
      heading: localize(section.heading, locale),
      body: localize(section.body, locale),
    })),
    disclaimer: study.disclaimer ? localize(study.disclaimer, locale) : undefined,
  }
}
