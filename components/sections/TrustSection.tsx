"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Shield, Award, Lock, CheckCircle2 } from "lucide-react"

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
    <section className="py-16 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="container">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <badge.icon className={`w-5 h-5 text-${badge.color}-500`} />
              <span className="text-sm font-semibold text-slate-700">{t(`badges.${badge.key}`)}</span>
            </motion.div>
          ))}
        </div>

        {/* Client Logos Marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />
          
          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...clientLogos, ...clientLogos].map((logo, i) => (
              <div key={i} className="flex-shrink-0 px-6 py-4 rounded-xl bg-white border border-slate-100">
                <img src={logo.src} alt={logo.name} className="h-8 w-auto opacity-60 grayscale" />
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">{t("trustedBy")}</p>
      </div>
    </section>
  )
}
