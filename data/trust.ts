export type PartnerLogo = {
  name: string
  href?: string
  src?: string // URL or path under public
}

export type ComplianceBadge = {
  label: string
}

export type Testimonial = {
  quote: string
  author: string
  role: string
  metric?: string
}

// Placeholders removed intentionally to avoid template feel; add approved logos when available.
// Note: Removed placeholder logos. Populate with real, consented assets when ready.
export const partnerLogos: PartnerLogo[] = []

export const complianceBadges: ComplianceBadge[] = [
  { label: "PDPA‑ready" },
  { label: "GDPR‑friendly" },
  { label: "Data Encryption" },
  { label: "Audit Logging" },
]

export const testimonials: Testimonial[] = [
  {
    quote: "เพิ่มอัตราปิดการขายได้ชัดเจน เพราะลูกค้าเห็นภาพและเชื่อข้อมูลมากขึ้น",
    author: "คุณเมย์",
    role: "ผู้จัดการคลินิก A",
    metric: "+22% conversion ใน 60 วัน",
  },
  {
    quote: "เวลาแนะนำทรีตเมนต์สั้นลง แต่ลูกค้าเข้าใจมากขึ้นด้วย AR",
    author: "คุณตั้ม",
    role: "ที่ปรึกษาด้านผิว",
    metric: "-35% เวลาตัดสินใจ",
  },
  {
    quote: "รายงานดูมืออาชีพ มั่นใจด้าน PDPA และการเก็บข้อมูล",
    author: "นพ. ศุภชัย",
    role: "แพทย์ผิวหนัง",
    metric: "100% เข้ารหัสและมี audit log",
  },
]
