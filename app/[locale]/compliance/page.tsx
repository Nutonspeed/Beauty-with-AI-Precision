"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"

function MetricsWidget({ isTH }: Readonly<{ isTH: boolean }>) {
  const metricsRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = metricsRef.current
    if (!el) return
    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !fired) {
          fired = true
          usageTracker.trackEngagement("view", "compliance_metrics")
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div
        ref={metricsRef as any}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
        aria-label={isTH ? "ตัวอย่างตัวชี้วัดโมเดล (จำลอง)" : "Sample model metrics (simulated)"}
      >
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">94.2%</div>
          <div className="text-sm text-muted-foreground">{isTH ? "ความไว (Sensitivity)" : "Sensitivity"}</div>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">92.8%</div>
          <div className="text-sm text-muted-foreground">{isTH ? "ความจำเพาะ (Specificity)" : "Specificity"}</div>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">93.5%</div>
          <div className="text-sm text-muted-foreground">{isTH ? "ความแม่นยำโดยรวม" : "Overall accuracy"}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {isTH
          ? "ตัวเลขเป็นตัวอย่างจำลองเพื่อประกอบการสื่อสาร ไม่ใช่ผลการทดสอบเชิงคลินิก และอาจแตกต่างตามการใช้งานจริง"
          : "Numbers are simulated for communication purposes, not clinical test results; real‑world performance may vary."}
      </p>
    </>
  )
}

export default function CompliancePage() {
  const { language } = useLanguage()
  const isTH = language === "th"

  useEffect(() => {
    usageTracker.trackPageView("compliance")
  }, [])


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <header>
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl font-display">
              {isTH ? "ความเป็นส่วนตัวและความสอดคล้อง" : "Privacy & Compliance"}
            </h1>
            <p className="text-muted-foreground">
              {isTH
                ? "ภาพรวมด้านความเป็นส่วนตัวของข้อมูลผู้ป่วย มาตรการความปลอดภัย และการตรวจสอบความถูกต้องของโมเดล AI"
                : "Overview of patient data privacy, security measures, and AI model validation."}
            </p>
          </header>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {isTH ? "ความเป็นส่วนตัวของข้อมูล (PDPA/GDPR)" : "Data Privacy (PDPA/GDPR)"}
            </h2>
            <ul className="list-inside list-disc text-sm text-muted-foreground space-y-2">
              <li>{isTH ? "การเก็บและใช้ข้อมูลตามวัตถุประสงค์ พร้อมการยินยอมที่ชัดเจน" : "Purpose-limited data collection and use with explicit consent."}</li>
              <li>{isTH ? "การเข้ารหัสข้อมูลระหว่างส่งและขณะพัก" : "Encryption in transit and at rest."}</li>
              <li>{isTH ? "การควบคุมสิทธิ์เข้าถึงตามบทบาทและการบันทึกการใช้งาน (audit log)" : "Role-based access control and audit logging."}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {isTH ? "การตรวจสอบความถูกต้องของโมเดล" : "Model Validation"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isTH
                ? "เผยแพร่ผลการประเมินคุณภาพของโมเดลด้วยชุดทดสอบภายใน (ตัวอย่าง: ความไว ความจำเพาะ ความแม่นยำโดยรวม) ทั้งนี้ผลลัพธ์ขึ้นกับบริบทการใช้งานจริง"
                : "We publish internal model evaluation metrics (e.g., sensitivity, specificity, overall accuracy). Results may vary based on real‑world usage context."}
            </p>
            <MetricsWidget isTH={isTH} />
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {isTH ? "คำจำกัดความทางการแพทย์" : "Medical Disclaimer"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isTH
                ? "ระบบนี้ใช้เพื่อสนับสนุนการตัดสินใจของผู้เชี่ยวชาญเท่านั้น ไม่ใช่เพื่อการวินิจฉัยหรือรักษาแทนแพทย์"
                : "This system supports professional decision‑making and is not a substitute for diagnosis or treatment by licensed clinicians."}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">{isTH ? "ติดต่อเรา" : "Contact"}</h2>
            <p className="text-sm text-muted-foreground">
              {isTH
                ? "สำหรับข้อมูลเชิงลึกด้านความปลอดภัยและการปฏิบัติตามมาตรฐาน โปรดติดต่อทีมของเรา"
                : "For detailed security and compliance documentation, contact our team."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
