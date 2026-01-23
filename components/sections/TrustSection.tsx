"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Shield, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const trustBadges = [
  { icon: Shield, key: "pdpa", color: "blue" },
  { icon: Award, key: "iso", color: "emerald" },
]

const clientLogos = [
  { name: "Siam Beauty", src: "/images/clients/siam-beauty.svg" },
  { name: "Bangkok Clinic", src: "/images/clients/bangkok-clinic.svg" },
  { name: "Thonburi Med", src: "/images/clients/thonburi-med.svg" },
  { name: "Pattaya Skin", src: "/images/clients/pattaya-skin.svg" },
  { name: "Chiang Mai Beauty", src: "/images/clients/chiangmai-beauty.svg" },
  { name: "Phuket Aesthetics", src: "/images/clients/phuket-aesthetics.svg" },
  { name: "Sukhumvit Clinic", src: "/images/clients/sukhumvit-clinic.svg" },
  { name: "Ratchada Beauty", src: "/images/clients/ratchada-beauty.svg" }
]

export function TrustSection() {
  const t = useTranslations("trust")

  return (
    <section className="py-20 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[100px] bg-pink-500/10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[100px] bg-blue-500/10" />
      </div>
      <div className="container relative z-10">
        {/* Trust Badges with Neon Accents */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-pink-500/30 transition-all duration-500 group"
            >
              <div className={cn(
                "p-2 rounded-xl bg-slate-50 group-hover:bg-pink-500/10 transition-colors",
                badge.color === 'blue' ? "group-hover:text-blue-500" : "group-hover:text-pink-500"
              )}>
                <badge.icon className={cn(
                  "w-5 h-5 transition-transform duration-500 group-hover:scale-110",
                  badge.color === 'blue' ? "text-blue-600" : "text-emerald-600"
                )} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-900 transition-colors">{t(`badges.${badge.key}`)}</span>
            </motion.div>
          ))}
        </div>

        {/* Client Logos Marquee - More high-end look */}
        <div className="relative py-4">
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
          
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
              <div key={i} className="flex-shrink-0 px-8 py-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-pink-500/20 hover:bg-white transition-all duration-500 group">
                <img 
                  src={logo.src} 
                  alt={logo.name} 
                  className="h-7 w-auto opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" 
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
            {t("trustedBy")}
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-200" />
        </div>
      </div>
    </section>
  )
}
