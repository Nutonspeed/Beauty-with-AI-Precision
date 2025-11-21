"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { getCaseStudies } from "../../../data/case-studies"

export default function CaseStudiesPage() {
  const { language } = useLanguage()
  const isTH = language === "th"

  useEffect(() => {
    usageTracker.trackPageView("case-studies")
  }, [])

  const items = useMemo(() => getCaseStudies(language), [language])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl font-display">
              {isTH ? "เคสศึกษา" : "Case Studies"}
            </h1>
            <p className="text-muted-foreground">
              {isTH
                ? "ตัวอย่างเคส (จำลอง) เพื่ออธิบายศักยภาพของ ClinicIQ — ไม่ใช่คำแนะนำทางการแพทย์"
                : "Simulated examples to illustrate ClinicIQ capabilities — not medical advice."}
            </p>
          </div>

          <ul className="grid gap-6 md:grid-cols-2">
            {items.map((item: { slug: string; title: string; summary: string; metrics: { label: string; value: string }[] }) => (
              <li key={item.slug} className="rounded-lg border border-border/60 p-5 hover:border-primary/50">
                <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {isTH ? "เคสศึกษา" : "Case Study"}
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  <Link href={`/case-studies/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">{item.summary}</p>
                <div className="mb-4 flex flex-wrap gap-3">
                  {item.metrics.slice(0, 2).map((m: { label: string; value: string }) => (
                    <div key={`${m.label}-${m.value}`} className="rounded-md bg-muted px-3 py-1 text-sm">
                      <span className="font-medium">{m.value}</span>
                      <span className="text-muted-foreground"> · {m.label}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/case-studies/${item.slug}`} className="text-primary underline underline-offset-2">
                  {isTH ? "อ่านรายละเอียด" : "Read more"}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Link href="/" className="text-primary underline underline-offset-2">
              {isTH ? "กลับสู่หน้าแรก" : "Back to home"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
