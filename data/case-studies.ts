export type Locale = 'en' | 'th' | 'zh'

export type CaseStudyMetric = {
  label: string
  value: string
}

export type CaseStudyContentSection = {
  heading: Record<Locale, string> | string
  body: Record<Locale, string> | string
}

export type CaseStudy = {
  slug: string
  title: string
  summary: string
  metrics: CaseStudyMetric[]
  content?: CaseStudyContentSection[]
  disclaimer?: Record<Locale, string> | string
}

const caseStudiesByLocale: Record<string, CaseStudy[]> = {
  en: [
    {
      slug: "bangkok-clinic-efficiency",
      title: "Bangkok Clinic Cut Wait Times By 37%",
      summary: "AI triage plus automated prep flows reduced the average waiting room time from 45 to 28 minutes in six weeks.",
      metrics: [
        { label: "Wait Time", value: "-37%" },
        { label: "Conversion", value: "+18%" },
        { label: "NPS", value: "+12" },
      ],
    },
    {
      slug: "phuket-premium-upsell",
      title: "Phuket Flagship Added ฿1.2M Upsell Pipeline",
      summary: "3D visualization during consults increased acceptance of premium treatment bundles for high-end tourists.",
      metrics: [
        { label: "AOV", value: "+32%" },
        { label: "Upsell", value: "+44%" },
        { label: "Time to Close", value: "-22%" },
      ],
    },
    {
      slug: "chiangmai-remote-followup",
      title: "Chiang Mai Chain Digitized Remote Follow-ups",
      summary: "Hybrid AR check-ins plus automation saved nurses 12 hours per week and kept retention above 92%.",
      metrics: [
        { label: "Retention", value: "92%" },
        { label: "Hours Saved", value: "12h" },
        { label: "Lead Response", value: "<5m" },
      ],
    },
  ],
  th: [
    {
      slug: "bangkok-clinic-efficiency",
      title: "คลินิกกรุงเทพฯ ลดเวลารอคิวได้ 37%",
      summary: "ใช้ AI ช่วยประเมินปัญหาผิวและจัดคิวอัตโนมัติ ทำให้เวลารอเฉลี่ยลดจาก 45 นาทีเหลือ 28 นาทีภายใน 6 สัปดาห์.",
      metrics: [
        { label: "เวลารอ", value: "-37%" },
        { label: "Conversion", value: "+18%" },
        { label: "NPS", value: "+12" },
      ],
    },
    {
      slug: "phuket-premium-upsell",
      title: "สาขาภูเก็ตเพิ่มยอดขายแพ็กเกจพรีเมียม 1.2 ล้าน",
      summary: "การใช้โมเดล 3D ระหว่างให้คำปรึกษาทำให้ลูกค้าระดับไฮเอนด์ตัดสินใจซื้อแพ็กเกจพรีเมียมง่ายขึ้น.",
      metrics: [
        { label: "ตั๋วเฉลี่ย", value: "+32%" },
        { label: "Upsell", value: "+44%" },
        { label: "เวลาปิดการขาย", value: "-22%" },
      ],
    },
    {
      slug: "chiangmai-remote-followup",
      title: "เครือเชียงใหม่ดูแล follow-up ออนไลน์",
      summary: "ใช้ AR ตรวจเช็กระยะไกลร่วมกับระบบอัตโนมัติ ช่วยประหยัดเวลาพยาบาล 12 ชั่วโมงต่อสัปดาห์และรักษา retention 92%.",
      metrics: [
        { label: "Retention", value: "92%" },
        { label: "ชั่วโมงที่ประหยัด", value: "12h" },
        { label: "ตอบกลับลีด", value: "<5m" },
      ],
    },
  ],
}

export function getCaseStudies(locale: Locale): CaseStudy[] {
  if (caseStudiesByLocale[locale]) {
    return caseStudiesByLocale[locale]
  }
  // fallback to English
  return caseStudiesByLocale.en
}

export function getCaseStudyBySlug(locale: Locale, slug: string): CaseStudy | undefined {
  const list = caseStudiesByLocale[locale] ?? caseStudiesByLocale.en
  const found = list.find((cs) => cs.slug === slug)
  if (found) return found
  // fallback to English if not found in locale
  return caseStudiesByLocale.en.find((cs) => cs.slug === slug)
}
