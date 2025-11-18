export type Locale = 'en' | 'th'

type Localized<T = string> = Record<Locale, T>

export type CaseStudy = {
  slug: string
  title: Localized
  summary: Localized
  metrics: Array<{
    label: Localized
    value: string
  }>
  content: Array<{
    heading: Localized
    body: Localized
  }>
  disclaimer?: Localized
}

const studies: CaseStudy[] = [
  {
    slug: 'dermatology-ai-triage',
    title: {
      en: 'AI Dermatology Triage Improves Throughput',
      th: 'ระบบคัดกรองโรคผิวหนังด้วย AI เพิ่มประสิทธิภาพการให้บริการ',
    },
    summary: {
      en: 'Clinic reduced waiting time with fast AI-assisted triage and prioritization.',
      th: 'คลินิคลดเวลารอคอยด้วยการคัดกรองและจัดลำดับความสำคัญด้วย AI อย่างรวดเร็ว',
    },
    metrics: [
      {
        label: { en: 'wait time reduction', th: 'ลดเวลารอคอย' },
        value: '35%'
      },
      {
        label: { en: 'triage accuracy', th: 'ความแม่นยำการคัดกรอง' },
        value: '92%'
      },
      {
        label: { en: 'patient satisfaction', th: 'ความพึงพอใจผู้ป่วย' },
        value: '4.7/5'
      },
    ],
    content: [
      {
        heading: { en: 'Overview', th: 'ภาพรวม' },
        body: {
          en: 'By introducing AI triage for dermatology cases, the clinic accelerated intake, reduced bottlenecks, and improved case prioritization.',
          th: 'ด้วยการนำ AI สำหรับการคัดกรองโรคผิวหนังมาใช้ คลินิคสามารถเร่งกระบวนการรับผู้ป่วย ลดคอขวด และปรับปรุงการจัดลำดับความสำคัญได้',
        },
      },
      {
        heading: { en: 'Approach', th: 'แนวทาง' },
        body: {
          en: 'The team integrated image quality checks, symptom prompts, and AI routing to specialists when needed.',
          th: 'ทีมงานผสานการตรวจสอบคุณภาพภาพ การซักถามอาการ และการส่งต่อหาผู้เชี่ยวชาญโดยอัตโนมัติเมื่อจำเป็น',
        },
      },
      {
        heading: { en: 'Outcome', th: 'ผลลัพธ์' },
        body: {
          en: 'Significant reduction in wait times and better patient satisfaction without extra staffing.',
          th: 'ลดเวลารอคอยอย่างมีนัยสำคัญและยกระดับความพึงพอใจผู้ป่วยได้โดยไม่ต้องเพิ่มบุคลากร',
        },
      },
    ],
    disclaimer: {
      en: 'This is a simulated example for demonstration only, not medical advice.',
      th: 'ตัวอย่างนี้เป็นการจำลองเพื่อการสาธิตเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์',
    },
  },
  {
    slug: 'radiology-workflow-optimizer',
    title: {
      en: 'Radiology Workflow Optimizer',
      th: 'ตัวช่วยเพิ่มประสิทธิภาพเวิร์กโฟลว์รังสีวิทยา',
    },
    summary: {
      en: 'AI-assisted prioritization and quality checks improved report turnaround time.',
      th: 'การจัดลำดับความสำคัญและตรวจสอบคุณภาพด้วย AI ช่วยให้รายงานเสร็จเร็วขึ้น',
    },
    metrics: [
      { label: { en: 'report TAT', th: 'เวลาออกผลรายงาน' }, value: '-28%' },
      { label: { en: 're-scan rate', th: 'อัตราการสแกนซ้ำ' }, value: '-18%' },
      { label: { en: 'throughput', th: 'ปริมาณงาน' }, value: '+22%' },
    ],
    content: [
      {
        heading: { en: 'Overview', th: 'ภาพรวม' },
        body: {
          en: 'Automated checks and AI hints helped radiologists focus on complex cases.',
          th: 'ระบบตรวจสอบอัตโนมัติและคำแนะนำจาก AI ช่วยให้รังสีแพทย์โฟกัสกับเคสที่ซับซ้อนได้ดีขึ้น',
        },
      },
      {
        heading: { en: 'Integration', th: 'การผสานระบบ' },
        body: {
          en: 'Non-disruptive integration with existing PACS/RIS ensured smooth rollout.',
          th: 'ผสานกับ PACS/RIS เดิมโดยไม่รบกวนเวิร์กโฟลว์ ช่วยให้การใช้งานราบรื่น',
        },
      },
    ],
  },
  {
    slug: 'telehealth-assistant',
    title: {
      en: 'Telehealth Assistant for Follow-ups',
      th: 'ผู้ช่วย Telehealth สำหรับการติดตามผล',
    },
    summary: {
      en: 'Automated post-visit nudges and escalation increased adherence and early intervention.',
      th: 'ระบบแจ้งเตือนหลังพบแพทย์และส่งต่อกรณีจำเป็นช่วยเพิ่มการปฏิบัติตามคำแนะนำ',
    },
    metrics: [
      { label: { en: 'adherence rate', th: 'อัตราการปฏิบัติตาม' }, value: '+19%' },
      { label: { en: 'early escalations', th: 'การส่งต่อเชิงรุก' }, value: '+14%' },
    ],
    content: [
      {
        heading: { en: 'Program Design', th: 'การออกแบบโปรแกรม' },
        body: {
          en: 'Used multilingual prompts and symptom trackers to identify risks sooner.',
          th: 'ใช้การแจ้งเตือนหลายภาษาและตัวติดตามอาการเพื่อตรวจพบความเสี่ยงได้เร็วขึ้น',
        },
      },
    ],
  },
]

export function getCaseStudies(locale: Locale) {
  return studies.map((s) => ({
    slug: s.slug,
    title: s.title[locale],
    summary: s.summary[locale],
    metrics: s.metrics.map((m) => ({ label: m.label[locale], value: m.value })),
  }))
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return studies.find((s) => s.slug === slug)
}
