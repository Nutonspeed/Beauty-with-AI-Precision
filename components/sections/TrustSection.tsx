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
    <section className="py-24 bg-transparent border-y border-slate-100/50 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-pink-500/[0.03]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/[0.03]" />
      </div>
      <div className="container relative z-10 px-6">
        {/* Trust Badges with Neon Accents */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-premium hover:border-pink-500/30 transition-all duration-700 group cursor-default"
            >
              <div className={cn(
                "p-3 rounded-2xl bg-white shadow-inner group-hover:bg-pink-50 transition-colors duration-500",
                badge.color === 'blue' ? "text-blue-600" : "text-emerald-600"
              )}>
                <badge.icon className="w-5 h-5 transition-transform duration-700 group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-950 transition-colors italic leading-none">{t(`badges.${badge.key}`)}</span>
            </motion.div>
          ))}
        </div>

        {/* Client Logos Marquee - More high-end look */}
        <div className="relative py-8">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#f8f6f2] via-[#f8f6f2]/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#f8f6f2] via-[#f8f6f2]/80 to-transparent z-10" />
          
          <motion.div
            className="flex gap-20 items-center"
            animate={{ x: [0, -1600] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            {[...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
              <div key={i} className="flex-shrink-0 group">
                <img 
                  src={logo.src} 
                  alt={logo.name} 
                  className="h-8 w-auto opacity-30 grayscale brightness-0 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-in-out hover:scale-110" 
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
