"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">AI</span>
              </div>
              <span className="text-lg font-semibold">{t.brand}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t.footer.product}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.features}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.tryDemo}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t.footer.company}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/case-studies" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.caseStudies}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.careers}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t.footer.legal}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.compliance}
                </Link>
              </li>
              <li>
                <Link href="/pdpa" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.footer.pdpa}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
