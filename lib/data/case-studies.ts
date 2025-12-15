export type Locale = "th" | "en" | "zh"

export type LocalizedText = string | Partial<Record<Locale, string>>

export interface CaseStudyMetric {
  label: LocalizedText
  value: string
}

export interface CaseStudySection {
  heading: LocalizedText
  body: LocalizedText
}

export interface CaseStudy {
  slug: string
  title: LocalizedText
  summary: LocalizedText
  metrics: CaseStudyMetric[]
  content?: CaseStudySection[]
  disclaimer?: LocalizedText
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "acne-recovery",
    title: { th: "ฟื้นฟูสิวอักเสบ", en: "Inflammatory Acne Recovery", zh: "炎症性痤疮修复" },
    summary: {
      th: "ตัวอย่างเคสจำลอง: ติดตามความเปลี่ยนแปลงก่อน/หลัง พร้อมแผนดูแลที่สอดคล้องกับคลินิก",
      en: "Simulated case: before/after tracking with a clinic-aligned care plan.",
      zh: "模拟案例：前后对比追踪与诊所一致的护理方案。",
    },
    metrics: [
      { label: { th: "สัปดาห์", en: "Weeks", zh: "周" }, value: "6" },
      { label: { th: "ความพึงพอใจ", en: "Satisfaction", zh: "满意度" }, value: "92%" },
      { label: { th: "ความสม่ำเสมอ", en: "Consistency", zh: "坚持度" }, value: "A" },
    ],
    content: [
      {
        heading: { th: "ภาพรวม", en: "Overview", zh: "概览" },
        body: {
          th: "เคสนี้ใช้เพื่อสาธิตการทำงานของระบบ ไม่ใช่คำแนะนำทางการแพทย์",
          en: "This case is for demonstrating the system and is not medical advice.",
          zh: "本案例用于演示系统功能，不构成医疗建议。",
        },
      },
    ],
    disclaimer: {
      th: "ข้อมูลเป็นตัวอย่างจำลองเพื่อสาธิตระบบเท่านั้น",
      en: "Data is simulated for demonstration purposes only.",
      zh: "数据为演示用途的模拟示例。",
    },
  },
]

function localize(value: LocalizedText, locale: Locale): string {
  if (typeof value === "string") return value
  return value?.[locale] || value?.th || value?.en || value?.zh || ""
}

export function getCaseStudies(locale: Locale): Array<{
  slug: string
  title: string
  summary: string
  metrics: { label: string; value: string }[]
}> {
  return CASE_STUDIES.map((cs) => ({
    slug: cs.slug,
    title: localize(cs.title, locale),
    summary: localize(cs.summary, locale),
    metrics: (cs.metrics || []).map((m) => ({
      label: localize(m.label, locale),
      value: m.value,
    })),
  }))
}

export function getCaseStudyBySlug(_locale: Locale, slug: string): CaseStudy | null {
  const found = CASE_STUDIES.find((cs) => cs.slug === slug)
  return found || null
}
