'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  Zap, 
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PriorityRankingResult } from '@/lib/ai/priority-ranking';

interface PriorityRankingCardProps {
  rankingResult: PriorityRankingResult;
  locale: 'th' | 'en';
  onBookAppointment?: () => void;
  className?: string;
}

export default function PriorityRankingCard({
  rankingResult,
  locale,
  onBookAppointment,
  className
}: PriorityRankingCardProps) {
  const isTH = locale === 'th';
  
  const priorities = rankingResult.priorities;
  const topPriority = priorities[0];

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Target className="mr-3 h-3.5 w-3.5" />
              {isTH ? 'ลำดับความสำคัญของผิว' : 'Skin Priority Matrix'}
            </Badge>
            <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
              {isTH ? 'การวิเคราะห์ลำดับความสำคัญ' : 'Priority Intelligence'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
              {isTH ? 'ผลลัพธ์การจัดลำดับความสำคัญโดย AI ตามสภาพผิวปัจจุบันของคุณ' : 'AI-driven prioritization based on your unique skin diagnostics'}
            </CardDescription>
          </div>
          
          <Button 
            onClick={onBookAppointment}
            variant="premium" 
            className="h-16 px-10 rounded-2xl shadow-premium italic font-black uppercase tracking-widest text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white transition-all hover:scale-105 active:scale-95"
          >
            {isTH ? 'จองการรักษา' : 'Book Treatment'}
            <Zap className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 bg-slate-50/30">
        {/* Top Priority Highlight */}
        {topPriority && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-600/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative bg-white rounded-[2.5rem] border border-pink-100/50 p-10 shadow-premium">
              <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                <div className="h-24 w-24 rounded-3xl bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm shrink-0">
                  <TrendingUp className="h-10 w-10 text-pink-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-pink-600 text-white border-none rounded-lg px-4 py-1 font-black italic uppercase tracking-widest text-[9px]">
                      {isTH ? 'ความสำคัญสูงสุด' : 'CRITICAL PRIORITY'}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase italic">
                      Score: {topPriority.score.toFixed(1)}/10
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tight">
                    {isTH ? topPriority.concernNameTh : topPriority.concernNameEn}
                  </h3>
                  <p className="text-sm text-slate-600 font-light leading-relaxed italic">
                    {isTH ? topPriority.reasoningTh : topPriority.reasoningEn}
                  </p>
                </div>
                <div className="lg:text-right space-y-4 shrink-0">
                  <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mb-1">Impact Level</p>
                    <p className="text-xl font-black text-pink-600 italic tracking-tighter leading-none">High</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Priority List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {priorities.slice(1).map((item, idx) => (
            <motion.div
              key={item.concernId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium hover:border-pink-500/10 transition-all group/item"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-700",
                    idx === 0 ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black italic uppercase tracking-widest border-slate-200 text-slate-400">
                    {idx === 0 ? (isTH ? 'ความสำคัญลำดับที่ 2' : 'Secondary') : (isTH ? `ความสำคัญลำดับที่ ${idx + 2}` : `Rank ${idx + 2}`)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/item:text-pink-600 transition-colors">
                    {isTH ? item.concernNameTh : item.concernNameEn}
                  </h4>
                  <p className="text-[12px] text-slate-500 font-light leading-snug italic line-clamp-3">
                    {isTH ? item.reasoningTh : item.reasoningEn}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase italic">Diagnostic Score</span>
                  <span className="text-sm font-black text-slate-950 italic">{item.score.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden group/footer">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-pink-500/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-pink-500" />
                <p className="text-[10px] font-black text-pink-500 tracking-[0.3em] uppercase italic leading-none">AI Recommendation Protocol</p>
              </div>
              <p className="text-lg font-light italic text-slate-300 max-w-xl leading-relaxed">
                {isTH 
                  ? 'การวิเคราะห์ลำดับความสำคัญนี้อิงตามสภาพผิวปัจจุบันและความต้องการเฉพาะบุคคล เพื่อให้ได้ผลลัพธ์การรักษาที่มีประสิทธิภาพสูงสุด' 
                  : 'This prioritization sequence is calibrated to your specific dermatological fingerprint for optimized therapeutic outcomes.'}
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase italic mb-1">Precision Rating</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter leading-none">98.4%</p>
                </div>
                <div className="h-14 w-px bg-white/10" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase italic mb-1">Node Sync</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter leading-none italic">ACTIVE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
