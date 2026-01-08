"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { ClinicIQLogoFull, ClinicIQMark } from "@/components/brand/logo"
import { Mail, Phone, Facebook, Instagram, Youtube, Linkedin } from "lucide-react"

export function Footer() {
  const locale = useLocale();
  const _isThaiLocale = locale === 'th';
  const lp = useLocalizePath()
  const t = useTranslations()

  return (
    <footer className="border-t border-white/5 bg-[#020617] pt-20 pb-10">
      <div className="container px-6">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Portfolio Section */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex flex-col gap-6">
              <ClinicIQLogoFull />
              <p className="text-sm text-slate-400 font-light leading-relaxed max-w-sm">
                {t('footer.description')}
              </p>
            </div>
            
            {/* Social Intelligence Links */}
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social Link" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
            
            {/* Global Communication Channels */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                <Mail className="h-4 w-4 text-primary" />
                <span>ops@cliniciq.ai</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                <Phone className="h-4 w-4 text-primary" />
                <span>+66 2-000-0000</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{t('footer.product')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/features", label: t('nav.features') },
                  { href: "/pricing", label: t('nav.pricing') },
                  { href: "/faq", label: t('nav.faq') },
                  { href: "/analysis", label: t('footer.tryDemo') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-400 font-light transition-colors hover:text-primary flex items-center group">
                      <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{t('footer.company')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/case-studies", label: t('nav.caseStudies') },
                  { href: "/about", label: t('nav.about') },
                  { href: "/contact", label: t('nav.contact') },
                  { href: "/careers", label: t('footer.careers') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-400 font-light transition-colors hover:text-primary flex items-center group">
                      <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{t('footer.legal')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/privacy", label: t('footer.privacy') },
                  { href: "/terms", label: t('footer.terms') },
                  { href: "/compliance", label: t('footer.compliance') },
                  { href: "/pdpa", label: t('footer.pdpa') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-400 font-light transition-colors hover:text-primary flex items-center group">
                      <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Global Compliance Bar */}
        <div className="mt-24 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                <ClinicIQMark className="h-4 w-4 opacity-50" />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                {t('footer.copyright')}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">
              <span className="flex items-center gap-2 hover:text-slate-400 transition-colors cursor-default">
                <div className="h-1 w-1 rounded-full bg-primary" />
                {t('footer.engineeringExcellence')}
              </span>
              <span className="flex items-center gap-2 hover:text-slate-400 transition-colors cursor-default">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {t('footer.pdpaCertified')}
              </span>
              <span className="flex items-center gap-2 hover:text-slate-400 transition-colors cursor-default">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                {t('footer.isoCloud')}
              </span>
              <span className="text-slate-700/50 hidden sm:inline">{t('footer.madeInThailand')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
