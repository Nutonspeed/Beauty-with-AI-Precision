"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, CheckCircle2, FlaskConical, Activity, Zap, Brain, Target, Info, Binary, Microscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface MedicalDecisionSupportProps {
  isEnterprise: boolean
  skinData?: any
}

export function MedicalDecisionSupport({ isEnterprise, skinData: _skinData }: MedicalDecisionSupportProps) {
  const _t = useTranslations()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = () => {
    setIsVerifying(true)
    setTimeout(() => setIsVerifying(false), 2000)
  }

  const criticalObservations = [
    { label: 'Dermal_Stability', val: 'NOMINAL', icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Variance_Level', val: 'LOW_DELTA', icon: Activity, color: 'text-blue-600' },
    { label: 'Protocol_Fit', val: '98.4%', icon: Target, color: 'text-pink-600' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-emerald-500/20 flex flex-col",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-emerald-50 text-emerald-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            CLINICAL_DECISION_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Medical_Decision_Support</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock AI-assisted clinical decision support nodes and automated medical protocol verification.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-emerald-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <ShieldCheck className="mr-4 h-6 w-6" />
            Authorize_Clinical_Sync
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700">
              <Microscope className="h-8 w-8 text-emerald-600 group-hover:text-white" />
            </div>
            Clinical_Decision_Node
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            Autonomous medical oversight and protocol validation matrix
          </CardDescription>
        </div>
        <Badge className="bg-emerald-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-emerald-600/30 uppercase tracking-widest animate-pulse leading-none">
          GOVERNANCE_ACTIVE
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        
        <div className="grid lg:grid-cols-12 gap-16 relative z-10">
          {/* Observation Node interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Critical_Observation_Sync</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {criticalObservations.map((obs, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 group/obs hover:bg-white hover:border-blue-500/20 transition-all duration-700 shadow-inner hover:shadow-premium"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/obs:scale-110 group-hover/obs:border-blue-100 transition-all duration-700", obs.color)}>
                      <obs.icon className="h-7 w-7" />
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-glow-blue" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/obs:text-slate-950 transition-colors leading-none">{obs.label}</p>
                    <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/obs:text-blue-600 transition-colors">{obs.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3.5rem] bg-slate-950 text-white relative overflow-hidden group/box shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover/box:rotate-12 transition-transform duration-1000">
                <FlaskConical className="w-40 h-40 text-white" />
              </div>
              <div className="flex items-center gap-6 relative z-10 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-lg group-hover/box:scale-110 transition-transform">
                  <Zap className="h-7 w-7 animate-pulse" />
                </div>
                <h5 className="text-xl font-black uppercase tracking-tighter italic leading-none">Diagnostic_Rationalization</h5>
              </div>
              <p className="text-lg text-slate-400 font-light italic leading-relaxed relative z-10 tracking-tight">
                AI-Core has identified a 99.8% match with established clinical protocols for epidermal resurfacing. No immediate contraindications detected within the current biometric registry.
              </p>
            </div>
          </div>

          {/* Validation Matrix interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/val transition-all duration-700 hover:bg-white hover:border-emerald-500/20 hover:shadow-premium flex flex-col h-full">
              <div className="space-y-10 flex-1">
                <div className="flex items-center gap-5 ml-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Protocol_Verification_Matrix</h4>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Regulatory_Compliance', status: 'VERIFIED', icon: CheckCircle2, color: 'text-emerald-600' },
                    { label: 'Clinical_Safety_Threshold', status: 'NOMINAL', icon: ShieldCheck, color: 'text-emerald-600' },
                    { label: 'Patient_Consent_PDPA', status: 'SYNCED', icon: Binary, color: 'text-blue-600' },
                    { label: 'Contraindication_Scan', status: 'CLEAR', icon: CheckCircle2, color: 'text-emerald-600' }
                  ].map((check, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm group/row hover:border-emerald-200 transition-all duration-500"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn("h-10 w-10 rounded-xl bg-slate-50 border border-slate-50 flex items-center justify-center shadow-inner group-hover/row:scale-110 transition-transform duration-700", check.color)}>
                          <check.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-black text-slate-500 italic uppercase tracking-tight group-hover/row:text-slate-950 transition-colors leading-none">{check.label}</span>
                      </div>
                      <Badge className={cn("px-4 py-1 rounded-full border-none shadow-sm text-[8px] font-black italic uppercase leading-none", check.color.replace('text', 'bg-opacity-10 bg'))}>
                        {check.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  size="xl" 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-emerald-600 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  {isVerifying ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />}
                  {isVerifying ? 'VERIFYING...' : 'Authorise_Clinical_Path'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <Info className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Medical_Oversight_Layer: 2026_VERSION</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-200 bg-white text-slate-400 text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Standard-MD-v4.8
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  )
}
