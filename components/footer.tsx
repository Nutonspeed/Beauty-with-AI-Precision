"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { ClinicIQLogoFull, ClinicIQMark } from "@/components/brand/logo"
import { Mail, Phone, Facebook, Instagram, Youtube, Linkedin } from "lucide-react"

import { motion } from "framer-motion"

export function Footer() {
  const locale = useLocale();
  const _isThaiLocale = locale === 'th';
  const lp = useLocalizePath()
  const t = useTranslations()

  return (
    <footer className="relative border-t border-slate-100 bg-white pt-32 pb-16 overflow-hidden">
      {/* Precision Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-0 left-0 w-[20%] h-[20%] bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <div className="container px-6 relative z-10">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Portfolio Section */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex flex-col gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <ClinicIQLogoFull />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-400 font-light leading-relaxed max-w-md italic"
              >
                {t('footer.description')}
              </motion.p>
            </div>
            
            {/* Global Communication Channels */}
            <div className="space-y-4 pt-4 border-l border-slate-100 pl-8">
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 group cursor-pointer hover:text-blue-600 transition-colors">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-blue-500/30 transition-all">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <span>ops@aestheticos.ai</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 group cursor-pointer hover:text-blue-600 transition-colors">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-blue-500/30 transition-all">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <span>+66 2-000-0000</span>
              </div>
            </div>

            {/* Social Intelligence Links */}
            <div className="flex items-center gap-5 pt-6">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  href="#" 
                  aria-label="Social Link"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500/30 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{t('footer.product')}</h3>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  { href: "/features", label: t('nav.features') },
                  { href: "/pricing", label: t('nav.pricing') },
                  { href: "/faq", label: t('nav.faq') },
                  { href: "/demo/center", label: "Center Demo" },
                  { href: "/analysis", label: t('footer.tryDemo') },
                  { href: "/auth/login", label: t('common.login') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-[13px] text-slate-500 font-bold uppercase tracking-widest transition-all hover:text-blue-600 flex items-center group">
                      <span className="h-px w-0 bg-blue-600 mr-0 group-hover:w-4 group-hover:mr-3 transition-all duration-500" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{t('footer.company')}</h3>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  { href: "/case-studies", label: t('nav.caseStudies') },
                  { href: "/about", label: t('nav.about') },
                  { href: "/contact", label: t('nav.contact') },
                  { href: "/3d-showcase", label: t('nav.3dModels') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-[13px] text-slate-500 font-bold uppercase tracking-widest transition-all hover:text-blue-600 flex items-center group">
                      <span className="h-px w-0 bg-blue-600 mr-0 group-hover:w-4 group-hover:mr-3 transition-all duration-500" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{t('footer.legal')}</h3>
              <ul className="space-y-4 sm:space-y-5">
                {[
                  { href: "/privacy", label: t('footer.privacy') },
                  { href: "/terms", label: t('footer.terms') },
                  { href: "/compliance", label: t('footer.compliance') },
                  { href: "/pdpa", label: t('footer.pdpa') }
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={lp(link.href)} className="text-[13px] text-slate-400 font-bold uppercase tracking-widest transition-all hover:text-white flex items-center group">
                      <span className="h-px w-0 bg-pink-500 mr-0 group-hover:w-4 group-hover:mr-3 transition-all duration-500" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Global Compliance Bar */}
        <div className="mt-32 pt-10 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                <ClinicIQMark className="h-5 w-5 opacity-40 text-blue-600" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                {t('footer.copyright')}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span className="flex items-center gap-3 hover:text-blue-600 transition-colors cursor-default group">
                <div className="h-1 w-1 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                {t('footer.engineeringExcellence')}
              </span>
              <span className="flex items-center gap-3 hover:text-blue-600 transition-colors cursor-default group">
                <div className="h-1 w-1 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                {t('footer.pdpaCertified')}
              </span>
              <span className="flex items-center gap-3 hover:text-blue-600 transition-colors cursor-default group">
                <div className="h-1 w-1 rounded-full bg-cyan-500 group-hover:scale-150 transition-transform" />
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
