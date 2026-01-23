"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { CenterIQLogoFull, CenterIQMark } from "@/components/brand/logo"
import { Mail, Phone, Facebook, Instagram, Youtube, Linkedin } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { motion } from "framer-motion"

export function Footer() {
  const locale = useLocale();
  const _isThaiLocale = locale === 'th';
  const lp = useLocalizePath()
  const t = useTranslations()

  return (
    <footer className="relative border-t border-slate-100 bg-white pt-24 pb-12 overflow-hidden group/footer">
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      <div className="container px-6 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Portfolio Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <CenterIQLogoFull />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base text-slate-500 font-normal leading-relaxed max-w-md"
              >
                {t('footer.description')}
              </motion.p>
            </div>
            
            {/* Global Communication Channels */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group/item cursor-pointer hover:text-pink-500 transition-colors">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover/item:bg-pink-50 group-hover/item:border-pink-100 transition-all shadow-sm">
                  <Mail className="h-4 w-4 text-pink-500" />
                </div>
                <span>ops@aestheticos.ai</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group/item cursor-pointer hover:text-blue-600 transition-colors">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover/item:bg-blue-50 group-hover/item:border-blue-100 transition-all shadow-sm">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <span>+66 2-000-0000</span>
              </div>
            </div>

            {/* Social Intelligence Links */}
            <div className="flex items-center gap-4 pt-6">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <MagneticButton key={i} strength={0.2}>
                  <motion.a 
                    href="#" 
                    aria-label="Social Link"
                    whileHover={{ y: -4, scale: 1.1 }}
                    className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:bg-pink-50 hover:border-pink-100 transition-all shadow-sm"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                </MagneticButton>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="space-y-8 text-reveal-container">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 text-reveal italic">{t('footer.product')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/features", label: t('nav.features') },
                  { href: "/pricing", label: t('nav.pricing') },
                  { href: "/faq", label: t('nav.faq') },
                  { href: "/demo/center", label: "Center Demo" },
                  { href: "/analysis", label: t('footer.tryDemo') },
                  { href: "/auth/login", label: t('common.login') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-500 font-medium hover:text-pink-500 transition-colors flex items-center group/link">
                      <span className="h-px w-0 bg-pink-500 mr-0 transition-all group-hover/link:w-3 group-hover/link:mr-2" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 text-reveal-container">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 text-reveal italic">{t('footer.company')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/case-studies", label: t('nav.caseStudies') },
                  { href: "/about", label: t('nav.about') },
                  { href: "/contact", label: t('nav.contact') },
                  { href: "/3d-showcase", label: t('nav.3dModels') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-500 font-medium hover:text-blue-600 transition-colors flex items-center group/link">
                      <span className="h-px w-0 bg-blue-600 mr-0 transition-all group-hover/link:w-3 group-hover/link:mr-2" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 text-reveal-container">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 text-reveal italic">{t('footer.legal')}</h3>
              <ul className="space-y-4">
                {[
                  { href: "/privacy", label: t('footer.privacy') },
                  { href: "/terms", label: t('footer.terms') },
                  { href: "/compliance", label: t('footer.compliance') },
                  { href: "/pdpa", label: t('footer.pdpa') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-sm text-slate-500 font-medium hover:text-slate-900 transition-colors flex items-center group/link">
                      <span className="h-px w-0 bg-slate-900 mr-0 transition-all group-hover/link:w-3 group-hover/link:mr-2" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Global Compliance Bar */}
        <div className="mt-20 pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <CenterIQMark className="h-4 w-4 opacity-40 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400">
                {t('footer.copyright')}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span className="flex items-center gap-2 group/status cursor-default">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
                {t('footer.engineeringExcellence')}
              </span>
              <span className="flex items-center gap-2 group/status cursor-default">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-glow-blue animate-pulse" />
                {t('footer.pdpaCertified')}
              </span>
              <span className="flex items-center gap-2 group/status cursor-default">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {t('footer.isoCloud')}
              </span>
              <span className="text-slate-300 hidden sm:inline italic">
                {t('footer.madeInThailand')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
