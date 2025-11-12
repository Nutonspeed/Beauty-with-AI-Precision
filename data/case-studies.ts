export type Locale = "th" | "en"

type LocalizedText = {
  th: string
  en: string
}

export type CaseStudy = {
  slug: string
  title: LocalizedText
  summary: LocalizedText
  metrics: Array<{
    label: LocalizedText
    value: string
  }>
  tags: string[]
  disclaimer?: LocalizedText
  content: Array<{
    heading: LocalizedText
    body: LocalizedText
  }>
}

// Note: This is a simulated example for demonstration only (not medical advice)
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "dermacare-consult-efficiency",
    title: {
      th: "Dermacare Clinic — ลดเวลาการปรึกษาและเพิ่มความแม่นยำ",
      en: "Dermacare Clinic — Faster Consults with Higher Accuracy",
    },
    summary: {
      th: "ตัวอย่างจำลอง: ใช้ ClinicIQ เพื่อช่วยเตรียมข้อมูลก่อนแพทย์ตรวจ ลดภาระงานซ้ำ และแสดงภาพเปรียบเทียบคุณภาพผิวแบบอัตโนมัติ",
      en: "Simulated example: ClinicIQ assists pre-consult prep, reduces repetitive tasks, and auto-generates clear skin-quality comparisons.",
    },
    metrics: [
      {
        label: { th: "เวลาปรึกษาต่อเคส", en: "Consult time per case" },
        value: "-35%",
      },
      {
        label: { th: "อัตราการปิดการขาย", en: "Conversion rate" },
        value: "+18%",
      },
      {
        label: { th: "ความพึงพอใจของผู้ใช้", en: "User satisfaction" },
        value: "4.7/5",
      },
    ],
    tags: ["workflow", "ai-assist", "comparison"],
    disclaimer: {
      th: "เป็นเคสตัวอย่างจำลองเพื่ออธิบายศักยภาพของระบบ ไม่ใช่คำแนะนำทางการแพทย์ และผลลัพธ์จริงอาจแตกต่างกัน",
      en: "Simulated example for capability illustration only. Not medical advice. Actual results may vary.",
    },
    content: [
      {
        heading: { th: "บริบทและเป้าหมาย", en: "Context & Goals" },
        body: {
          th: "คลินิกต้องการลดเวลางานเอกสารก่อนการปรึกษาและทำให้ภาพรวมการสื่อสารกับคนไข้เข้าใจง่ายขึ้น โดยยังคงความแม่นยำของข้อมูล",
          en: "The clinic wanted to cut pre-consult paperwork and make patient communication clearer while preserving data accuracy.",
        },
      },
      {
        heading: { th: "วิธีการใช้งาน", en: "Approach" },
        body: {
          th: "นำ ClinicIQ มาเชื่อมต่อการอัปโหลดภาพ ตรวจสอบคุณภาพภาพอัตโนมัติ และสร้างภาพเปรียบเทียบก่อน–หลังในจุดเดียว แสดงผลผ่านแดชบอร์ดที่ติดตามตัวชี้วัดหลัก",
          en: "ClinicIQ handled image ingestion, automated quality checks, and generated before/after comparisons in one place with KPI tracking dashboards.",
        },
      },
      {
        heading: { th: "ผลลัพธ์ (ตัวอย่างจำลอง)", en: "Outcomes (simulated)" },
        body: {
          th: "รอบการปรึกษาสั้นขึ้นด้วยการเตรียมข้อมูลล่วงหน้า การสื่อสารผลลัพธ์กับคนไข้ชัดเจนขึ้น ทำให้การตัดสินใจรักษาเร็วขึ้น",
          en: "Consult cycles shortened via prepped data; results communication improved, speeding up treatment decisions.",
        },
      },
    ],
  },
]

export function getCaseStudies(locale: Locale) {
  return CASE_STUDIES.map((cs) => ({
    slug: cs.slug,
    title: cs.title[locale],
    summary: cs.summary[locale],
    metrics: cs.metrics.map((m) => ({ label: m.label[locale], value: m.value })),
    tags: cs.tags,
  }))
}

export function getCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug)
}
