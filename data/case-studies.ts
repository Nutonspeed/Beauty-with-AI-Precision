export type Locale = 'en' | 'th'

export interface CaseStudy {
  id: string
  slug: string
  title: Record<Locale, string>
  summary: Record<Locale, string>
  description: {
    en: string
    th: string
  }
  content: Array<{
    heading: Record<Locale, string>
    body: Record<Locale, string>
  }>
  image?: string
  category?: string
  date?: string
  metrics: Array<{
    label: Record<Locale, string>
    value: string
  }>
  disclaimer?: Record<Locale, string>
}

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'ai-skin-analysis-success',
    title: {
      en: 'AI Skin Analysis Success Story',
      th: 'เคสความสำเร็จการวิเคราะห์ผิวด้วย AI'
    },
    summary: {
      en: 'How AI-powered skin analysis transformed customer experience',
      th: 'การวิเคราะห์ผิวด้วย AI เปลี่ยนแปลงประสบการณ์ลูกค้า'
    },
    description: {
      en: 'How AI-powered skin analysis transformed customer experience',
      th: 'การวิเคราะห์ผิวด้วย AI เปลี่ยนแปลงประสบการณ์ลูกค้า'
    },
    content: [
      {
        heading: { en: 'Overview', th: 'ภาพรวม' },
        body: { en: 'Detailed case study content...', th: 'เนื้อหาเคสศึกษาโดยละเอียด...' }
      },
      {
        heading: { en: 'Results', th: 'ผลลัพธ์' },
        body: { en: 'More content here...', th: 'เนื้อหาเพิ่มเติม...' }
      }
    ],
    metrics: [
      { 
        label: { en: 'Improvement', th: 'การปรับปรุง' },
        value: '95%'
      },
      { 
        label: { en: 'Satisfaction', th: 'ความพึงพอใจ' },
        value: '98%'
      }
    ],
    disclaimer: {
      en: 'Results may vary',
      th: 'ผลลัพธ์อาจแตกต่างกัน'
    },
    image: '/case-studies/ai-analysis.jpg',
    category: 'AI Analysis',
    date: '2024-01-15'
  }
]

export function getCaseStudies(locale: Locale = 'en') {
  return caseStudies.map(study => ({
    slug: study.slug,
    title: study.title[locale],
    summary: study.summary[locale],
    metrics: study.metrics.map(m => ({
      label: m.label[locale],
      value: m.value
    }))
  }))
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(study => study.slug === slug)
}
