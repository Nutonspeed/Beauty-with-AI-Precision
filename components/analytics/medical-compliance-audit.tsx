"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, AlertCircle, CheckCircle2, FileText, Activity, Zap, ArrowRight, ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ComplianceIssue {
  id: string
  caseId: string
  protocol: string
  status: 'safe' | 'warning' | 'critical'
  details: string
  timestamp: string
}

interface MedicalComplianceAuditProps {
  isEnterprise: boolean
}

export function MedicalComplianceAudit({ isEnterprise }: MedicalComplianceAuditProps) {
  const t = useTranslations()
  const [isAuditing, setIsAuditing] = useState(false)

  const complianceIssues: ComplianceIssue[] = [
    { 
      id: '1', 
      caseId: 'CASE_8829', 
      protocol: t('medicalCompliance.cases.case1.protocol'), 
      status: 'safe', 
      details: t('medicalCompliance.cases.case1.details'), 
      timestamp: '2026-01-09 14:20' 
    },
    { 
      id: '2', 
      caseId: 'CASE_8835', 
      protocol: t('medicalCompliance.cases.case2.protocol'), 
      status: 'warning', 
      details: t('medicalCompliance.cases.case2.details'), 
      timestamp: '2026-01-09 16:45' 
    },
    { 
      id: '3', 
      caseId: 'CASE_8840', 
      protocol: t('medicalCompliance.cases.case3.protocol'), 
      status: 'safe', 
      details: t('medicalCompliance.cases.case3.details'), 
      timestamp: '2026-01-10 09:12' 
    },
  ]

  const handleRunAudit = () => {
    setIsAuditing(true)
    setTimeout(() => {
      setIsAuditing(false)
      toast.success(t('medicalCompliance.auditCompleted'))
    }, 3000)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'safe':
        return { label: t('medicalCompliance.verifiedSafe'), color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 }
      case 'critical':
        return { label: t('medicalCompliance.safetyBreach'), color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle }
      default:
        return { label: t('medicalCompliance.auditWarning'), color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertCircle }
    }
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase tracking-widest font-black">{t('medicalCompliance.safeguardLocked')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('medicalCompliance.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('medicalCompliance.safeguardDesc')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-emerald-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('medicalCompliance.initializeAudit')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            {t('medicalCompliance.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('medicalCompliance.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('medicalCompliance.lastAudit')}</p>
            <p className="text-xs font-bold text-slate-400 italic">2026-01-10 07:00 UTC</p>
          </div>
          <Button 
            onClick={handleRunAudit}
            disabled={isAuditing || !isEnterprise}
            className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-[#020617] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-600/20 italic"
          >
            {isAuditing ? <Zap className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            {t('medicalCompliance.runAudit')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Active Audit Log */}
          <div className="lg:col-span-8 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('medicalCompliance.realtimeTelemetry')}</h4>
            <div className="space-y-4">
              {complianceIssues.map((issue) => {
                const config = getStatusConfig(issue.status)
                return (
                  <motion.div 
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/issue"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-inner group-hover/issue:scale-110", config.bg, config.color)}>
                          <config.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{issue.caseId}</span>
                            <h5 className="text-sm font-bold text-white italic">{issue.protocol}</h5>
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-relaxed">{issue.details}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <Badge variant="outline" className={cn("px-4 py-1 text-[9px] font-black tracking-widest border-white/5 italic", config.color, config.bg)}>
                          {config.label}
                        </Badge>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{issue.timestamp}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Remediation & Insights Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{t('medicalCompliance.protocolMatch')}</p>
                  <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">98.4%</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 italic">{t('medicalCompliance.remediationSchema')}</h5>
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    {t('medicalCompliance.remediationDesc')}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic">
                {t('medicalCompliance.generateAuditLedger')}
                <FileText className="ml-3 h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-4">
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              <p className="text-[10px] text-slate-500 font-light italic leading-relaxed uppercase tracking-widest">
                {t('medicalCompliance.complianceEngine')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between w-full">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('medicalCompliance.certifiedISO')}</p>
          <Button variant="ghost" className="text-[9px] font-black text-cyan-400 uppercase tracking-widest italic group/link">
            {t('medicalCompliance.viewArchive')}
            <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
