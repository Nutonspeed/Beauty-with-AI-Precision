"use client"

import { useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useTranslations, useLocale } from "next-intl"
import { Cpu } from "lucide-react"

export default function RoiMiniCalculator() {
  const t = useTranslations()
  const locale = useLocale()
  const [leads, setLeads] = useState(120)
  const [avgBill, setAvgBill] = useState(4500)
  const [conv, setConv] = useState(12)
  const [improve, setImprove] = useState(8)

  const emit = (payload: any) => {
    try {
      if (typeof window !== "undefined") {
        const ev = new CustomEvent("roi:change", { detail: { ...payload, ts: Date.now() } })
        window.dispatchEvent(ev)
      }
    } catch {}
  }

  const { newConv, addedDeals, addedRevenue } = useMemo(() => {
    const baseConv = Math.max(0, Math.min(100, conv)) / 100
    const uplift = Math.max(0, Math.min(100, improve)) / 100
    const newConv = Math.min(1, baseConv * (1 + uplift))
    const addedDeals = Math.round(leads * (newConv - baseConv))
    const addedRevenue = Math.max(0, Math.round(addedDeals * avgBill))
    return { newConv, addedDeals, addedRevenue }
  }, [leads, avgBill, conv, improve])

  return (
    <div className="grid gap-12 md:grid-cols-2 items-center">
      <div className="space-y-10">
        <div className="grid gap-8">
          <div className="space-y-3">
            <Label htmlFor="leads" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-1">
              {t('roi.leadsPerMonth')}
            </Label>
            <div className="relative group">
              <Input
                id="leads"
                type="number"
                inputMode="numeric"
                className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 transition-all pl-6 italic font-bold"
                value={leads}
                onChange={(e) => {
                  const v = Number(e.target.value || 0)
                  setLeads(v)
                  emit({ leads: v, avgBill, conv, improve })
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="avg" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-1">
              {t('roi.avgBill', { currency: locale === 'th' ? t('roi.currencyThai') : 'THB' })}
            </Label>
            <Input
              id="avg"
              type="number"
              inputMode="numeric"
              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 transition-all pl-6 italic font-bold"
              value={avgBill}
              onChange={(e) => {
                const v = Number(e.target.value || 0)
                setAvgBill(v)
                emit({ leads, avgBill: v, conv, improve })
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="conv" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                {t('roi.currentConversion')}
              </Label>
              <span className="font-mono text-xs text-pink-500 font-black italic">{conv}%</span>
            </div>
            <Slider
              value={[conv]}
              min={1}
              max={60}
              step={1}
              onValueChange={(v) => {
                setConv(v[0])
                emit({ leads, avgBill, conv: v[0], improve })
              }}
              className="py-4"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="improve" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                {t('roi.expectedImprovement')}
              </Label>
              <span className="font-mono text-xs text-cyan-500 font-black italic">{improve}%</span>
            </div>
            <Slider
              value={[improve]}
              min={0}
              max={50}
              step={1}
              onValueChange={(v) => {
                setImprove(v[0])
                emit({ leads, avgBill, conv, improve: v[0] })
              }}
              className="py-4"
            />
          </div>
        </div>
      </div>

      <div className="relative group p-10 lg:p-14 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
          <Cpu className="w-32 h-32 text-pink-500" />
        </div>
        <div className="space-y-10 relative z-10">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Target Optimization</p>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-400 italic leading-none">{t('roi.newConversion')}</span>
              <span className="text-5xl font-black text-white italic tracking-tighter">{Math.round(newConv * 100)}%</span>
            </div>
          </div>

          <div className="space-y-2 pt-8 border-t border-white/5">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Projected Deal Inflow</p>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-400 italic leading-none">{t('roi.addedDeals')}</span>
              <span className="text-5xl font-black text-pink-500 italic tracking-tighter">+{addedDeals}</span>
            </div>
          </div>

          <div className="space-y-2 pt-8 border-t border-white/5">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Forecasted Revenue Yield</p>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-400 italic leading-none">{t('roi.addedRevenue')}</span>
              <span className="text-5xl font-black text-cyan-400 italic tracking-tighter">฿{addedRevenue.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[8px] font-medium text-slate-700 uppercase tracking-widest leading-relaxed pt-4 italic">
            * {t('roi.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
