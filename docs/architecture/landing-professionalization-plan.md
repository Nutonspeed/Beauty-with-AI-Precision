# ClinicIQ landing professionalization plan

Date: 2025-11-12
Owner: Web/App
Scope: Home (/ and /th)

## 1) Diagnosis (current issues)

- Looks like a generic template: too many generic blocks, gradients, and stock patterns; weak brand POV
- Social proof feels inauthentic: excessive “reviews/voice reviews”, no clear provenance/consent, looks like filler
- Visual hierarchy unclear: multiple competing CTAs; hero message long; low clarity on “who is it for?”
- Trust/compliance signals are weak: little proof of safety, privacy, and clinical rigor
- Content density: unnecessary sections extend page length without value; slow perceived performance

References in repo:
- `app/[locale]/page.tsx` uses `partnerLogos`, `testimonials` grids
- `components/header.tsx` CTA/menu

## 2) Competitive pattern (B2B/B2C medical SaaS)

- Clear, specific value proposition within one screen
- One primary CTA (“Request a demo” or “Start free trial”), one secondary max
- Social proof minimal but high-quality (clinic partners, certifications, outcomes)
- Case study snippets or outcomes metrics, not random reviews or voice clips
- Strong compliance & security page, privacy policy accessible in footer

## 3) Recommended IA (wireframe)

1. Hero
   - Headline: concise, benefit-first
   - Subline: 1–2 lines on AI-assisted aesthetics and operational impact
   - CTAs: Primary = Request a demo; Secondary = Try analysis (if applicable)
2. Proof bar
   - Partner clinics/hospitals/associations (max 6)
3. Value props (3–4)
   - Diagnostics accuracy, workflow speed, revenue impact, patient experience
4. How it works (3 steps)
   - Capture → Analyze → Advise/Record
5. Clinical trust & compliance
   - Certifications, data privacy, model validation summary, disclaimers
6. Case study highlight
   - 1 tile with metrics + link to full case studies
7. Integrations & deployment
   - EHR/EMR, cloud, devices, on-prem options
8. Closing CTA
   - Repeat primary CTA, contact options
9. Footer
   - Privacy, Terms, Compliance, Contact

Notes:
- Remove home-page “voice reviews” and random testimonials; move to Case Studies with consent + transcript

## 4) Social proof guidelines

- Use 2–4 high-cred logos with permission (no placeholders)
- Replace star ratings with outcomes metrics (e.g., “-37% wait time”, “+22% treatment plan acceptance”)
- If keeping testimonials, require: name/role/clinic, consent, and short, specific quote (<25 words)

## 5) Visual direction

- Color: ClinicIQ teal primary (already applied). Limit gradient intensity; keep medical neutrality
- Imagery: avoid playful stock; use device UI, clinician scenes, subtle line icons
- Motion: fluid background retained but damped for reduced-motion/hidden tab (already done)
- Typography: consistent scale (Display: Kanit; Body: Noto Sans Thai); maintain WCAG contrast

## 6) Copy deck (TH/EN)

Hero (TH)
- Headline: ระบบ AI เพื่อคลินิกความงามที่แม่นยำและเชื่อถือได้
- Subline: วิเคราะห์ผิวอัตโนมัติ บริหารคิวและการรักษาอย่างเป็นระบบ ยกระดับประสบการณ์ผู้ป่วยและผลลัพธ์ทางธุรกิจของคลินิก
- CTA Primary: ขอเดโม
- CTA Secondary: ทดลองวิเคราะห์ผิว

Hero (EN)
- Headline: Medical‑grade AI for aesthetic clinics
- Subline: Automated skin analysis, streamlined operations, and better patient experience—designed for clinical reliability.
- CTA Primary: Request a demo
- CTA Secondary: Try analysis

Value props (TH)
- ความแม่นยำระดับคลินิก: โมเดลผ่านการทดสอบกับภาพจริงและเกณฑ์ทางคลินิก
- เวิร์กโฟลว์เร็วขึ้น: จากรับคิว→วิเคราะห์→แนะนำการรักษา ในหน้าจอเดียว
- ปลอดภัยและเป็นส่วนตัว: การจัดเก็บข้อมูลและสิทธิ์เข้าถึงตามมาตรฐาน

Compliance block (TH)
- ความเป็นส่วนตัวของข้อมูลผู้ป่วย: ปฏิบัติตามแนวทางความปลอดภัยและการยินยอม
- การตรวจสอบความถูกต้องของโมเดล: เผยแพร่สรุปตัวชี้วัดการประเมินผล
- คำจำกัดความ/ข้อจำกัดทางการแพทย์: ใช้เพื่อสนับสนุนการตัดสินใจของผู้เชี่ยวชาญเท่านั้น

Case study teaser (TH)
- “ลดเวลารอคิวเฉลี่ย 37% ภายใน 6 สัปดาห์” — คลินิก A, กรุงเทพฯ

Footer microcopy (TH)
- © ClinicIQ. All rights reserved.

## 7) Measurement

- Events:
  - hero_primary_cta_click, hero_secondary_cta_click
  - value_prop_link_click, case_study_view
- KPIs: CTR primary CTA, bounce rate, avg time on hero, conversions to contact/demo

## 8) Implementation mapping

- `app/[locale]/page.tsx`
  - Replace testimonial/voice widgets with value props + case study teaser
  - Ensure single primary CTA + optional secondary
  - Keep partner logos but verify authenticity; reduce to ≤6
- `data/trust.ts`
  - Curate real partner logos; remove placeholders
- `components/*`
  - Add ValueProp, ProofBar, CaseStudyTeaser components if needed
- `pages`
  - Add /case-studies and /compliance (optional but recommended)

## 9) Rollout plan

- Phase A (2–3 hrs): Update landing structure and copy, hide testimonials/voice blocks, wire CTAs + analytics events
- Phase B (half‑day): Create case studies page, compliance page; refine images/icons
- Phase C (1–2 days): A/B hero variants; add downloadable PDFs; finalize partner consents

---

If approved, I will implement Phase A immediately and keep typecheck/tests green, then report the visual/UX delta and wire analytics events for measurement.
