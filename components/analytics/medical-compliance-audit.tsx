"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, AlertCircle, CheckCircle2, FileText, Activity, ArrowRight, ClipboardCheck, ShieldAlert } from "lucide-react"
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
      protocol: t('medicalCompliance.cases.case1.protocol' as any) || 'Hydra-Calibration_v4', 
      status: 'safe', 
      details: t('medicalCompliance.cases.case1.details' as any) || 'Bio-sync parameters within nominal range.', 
      timestamp: '2026-01-09 14:20' 
    },
    { 
      id: '2', 
      caseId: 'CASE_8835', 
      protocol: t('medicalCompliance.cases.case2.protocol' as any) || 'Spectral_Resurfacing', 
      status: 'warning', 
      details: t('medicalCompliance.cases.case2.details' as any) || 'Minor spectral variance detected in peripheral node.', 
      timestamp: '2026-01-09 16:45' 
    },
    { 
      id: '3', 
      caseId: 'CASE_8840', 
      protocol: t('medicalCompliance.cases.case3.protocol' as any) || 'Dermal_Synthesis_Alpha', 
      status: 'safe', 
      details: t('medicalCompliance.cases.case3.details' as any) || 'Full protocol adherence verified.', 
      timestamp: '2026-01-10 09:12' 
    },
  ]

  const handleRunAudit = () => {
    setIsAuditing(true)
    setTimeout(() => {
      setIsAuditing(false)
      toast.success(t('medicalCompliance.auditCompleted' as any) || "Audit Registry Synchronized")
    }, 3000)
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-emerald-50 text-emerald-600 border-none'
      case 'critical':
        return 'bg-rose-50 text-rose-600 border-none'
      default:
        return 'bg-amber-50 text-amber-600 border-none'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'critical':
        return <ShieldAlert className="h-5 w-5 text-rose-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600" />
    }
  }

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-blue-50 text-blue-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            GOVERNANCE_LOCK_ACTIVE
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('medicalCompliance.title' as any) || 'Medical_Compliance_Guardian'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              {t('medicalCompliance.safeguardDesc' as any) || 'Unlock automated medical compliance auditing and real-time protocol safety monitoring.'}
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <ShieldCheck className="mr-4 h-6 w-6" />
            {t('medicalCompliance.initializeAudit' as any) || 'Authorize_Audit_Sync'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700">
              <ShieldCheck className="h-8 w-8 text-emerald-600 group-hover:text-white" />
            </div>
            {t('medicalCompliance.title' as any) || 'Compliance_Audit'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('medicalCompliance.subtitle' as any) || 'Real-time biological protocol safety and integrity auditing'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('medicalCompliance.lastAudit' as any) || 'LAST_NOMINAL_SYNC'}</p>
            <p className="text-sm font-black text-slate-950 italic uppercase leading-none">2026-01-10 07:00 UTC</p>
          </div>
          <Button 
            onClick={handleRunAudit}
            disabled={isAuditing || !isEnterprise}
            variant="premium"
            size="xl"
            className="h-16 px-10 rounded-2xl bg-slate-950 text-white border-none font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:bg-emerald-600 active:scale-95 group/btn"
          >
            {isAuditing ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <Activity className="h-5 w-5 mr-3 group-hover/btn:scale-110 transition-transform" />}
            {t('medicalCompliance.runAudit' as any) || 'Initialize_Audit'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Active Audit Log interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('medicalCompliance.realtimeTelemetry' as any) || 'Safety_Node_Log'}</h4>
            </div>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {complianceIssues.map((issue, idx) => {
                  const styles = getStatusStyles(issue.status)
                  return (
                    <motion.div 
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-500/20 transition-all duration-700 group/issue relative overflow-hidden shadow-inner hover:shadow-premium"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/issue:bg-emerald-500 transition-all duration-700" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div className="flex items-start gap-8">
                          <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover/issue:scale-110 group-hover/issue:bg-white", styles)}>
                            {getStatusIcon(issue.status)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-6">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{issue.caseId}</span>
                              <h5 className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/issue:text-emerald-600 transition-colors">{issue.protocol}</h5>
                            </div>
                            <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">"{issue.details}"</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-4 min-w-[180px]">
                          <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-sm leading-none border-none", styles)}>
                            {issue.status.toUpperCase()}_STATE
                          </Badge>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{issue.timestamp}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Remediation & Insights Column interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium space-y-10 group/stats transition-all duration-700 hover:border-emerald-500/20">
              <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('medicalCompliance.protocolMatch' as any) || 'Global_Compliance_Yield'}</p>
                  <p className="text-4xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none group-hover/stats:scale-105 transition-transform">98.4%</p>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: "98.4%" }} 
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-8">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4 italic">{t('medicalCompliance.remediationSchema' as any) || 'Remediation_Protocols'}</h5>
                <div className="p-8 rounded-[2.5rem] bg-amber-50/50 border border-amber-100 flex items-start gap-6 group/rem hover:bg-white transition-all duration-500 shadow-inner">
                  <div className="h-12 w-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm group-hover/rem:scale-110 transition-transform">
                    <AlertCircle className="h-6 w-6 text-amber-600 animate-pulse" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium italic leading-relaxed tracking-tight">
                    {t('medicalCompliance.remediationDesc' as any) || 'Heuristic node drift detected in sector 4. Automatic parameter calibration recommended before next biological sync.'}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="xl" className="w-full h-18 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all group/btn hover:scale-105 active:scale-95">
                {t('medicalCompliance.generateAuditLedger' as any) || 'Export_Audit_Log'}
                <FileText className="ml-3 h-5 w-5 text-slate-300 group-hover/btn:text-pink-600 transition-colors" />
              </Button>
            </div>

            <div className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group/authority shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover/authority:rotate-12 group-hover/authority:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <div className="flex items-center gap-6 relative z-10 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 shadow-lg">
                  <ClipboardCheck className="h-6 w-6 animate-pulse" />
                </div>
                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">{t('medicalCompliance.complianceEngine' as any) || 'Governance_Validated'}</h5>
              </div>
              <p className="text-sm text-slate-400 font-medium italic leading-relaxed relative z-10 tracking-tight">
                All clinical protocol authorizations are processed via BIP-Governance-v4.8 cluster nodes, ensuring 99.9% sovereign regulatory alignment.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-8">
          <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
            <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">{t('medicalCompliance.certifiedISO' as any) || 'Auth_State: ISO_2026_CERTIFIED'}</p>
          </div>
          <Button variant="ghost" className="h-auto p-0 text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn">
            {t('medicalCompliance.viewArchive' as any) || 'Immutable_Audit_Ledger'}
            <ArrowRight className="ml-4 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
