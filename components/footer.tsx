"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { ClinicIQLogoFull, ClinicIQMark } from "@/components/brand/logo"
import { Mail, Phone, Facebook, Instagram, Youtube, Linkedin } from "lucide-react"

export function Footer() {
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const lp = useLocalizePath()

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-muted/50">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <ClinicIQLogoFull />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {isThaiLocale 
                ? 'แพลตฟอร์ม AI สำหรับคลินิกความงาม ช่วยเพิ่มประสิทธิภาพการวิเคราะห์ผิวและจัดการลูกค้า'
                : 'AI platform for aesthetic clinics to enhance skin analysis and customer management'
              }
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-pink-500 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-red-500 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-blue-600 hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@cliniciq.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+66 2-XXX-XXXX</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{isThaiLocale ? 'ผลิตภัณฑ์' : 'Product'}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={lp("/features")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'คุณสมบัติ' : 'Features'}
                </Link>
              </li>
              <li>
                <Link href={lp("/pricing")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'ราคา' : 'Pricing'}
                </Link>
              </li>
              <li>
                <Link href={lp("/faq")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'คำถามที่พบบ่อย' : 'FAQ'}
                </Link>
              </li>
              <li>
                <Link href={lp("/analysis")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'ลองใช้งาน' : 'Try Demo'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{isThaiLocale ? 'บริษัท' : 'Company'}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={lp("/case-studies")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'กรณีศึกษา' : 'Case Studies'}
                </Link>
              </li>
              <li>
                <Link href={lp("/about")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'เกี่ยวกับเรา' : 'About'}
                </Link>
              </li>
              <li>
                <Link href={lp("/contact")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'ติดต่อ' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link href={lp("/careers")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'ร่วมงานกับเรา' : 'Careers'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{isThaiLocale ? 'ข้อกำหนดทางกฎหมาย' : 'Legal'}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={lp("/privacy")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'ความเป็นส่วนตัว' : 'Privacy'}
                </Link>
              </li>
              <li>
                <Link href={lp("/terms")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'เงื่อนไขการใช้งาน' : 'Terms'}
                </Link>
              </li>
              <li>
                <Link href={lp("/compliance")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'การปฏิบัติตาม' : 'Compliance'}
                </Link>
              </li>
              <li>
                <Link href={lp("/pdpa")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {isThaiLocale ? 'PDPA' : 'PDPA'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ClinicIQMark className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">{isThaiLocale ? '© 2024 ClinicIQ. สงวนลิขสิทธิ์' : '© 2024 ClinicIQ. All rights reserved'}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                🇹🇭 Made in Thailand
              </span>
              <span>•</span>
              <span>PDPA Compliant</span>
              <span>•</span>
              <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
