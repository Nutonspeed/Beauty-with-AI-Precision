'use client';

/**
 * Lead Conversion Optimizer
 * Analyze sales conversion opportunities and recommend actions
 * Competitive advantage: AI-powered sales coaching
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { AIObjectionHandler } from '@/lib/ai/objection-handler';
import { useObjectionDetection } from '@/lib/hooks/use-objection-detection';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  MessageSquare,
  Phone,
  Gift,
  Zap,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  BarChart3
} from 'lucide-react';

interface LeadData {
  id: string;
  name: string;
  source: string;
  lastContact?: Date;
  engagementScore: number;
  visitCount: number;
  programInterest: string[];
  budget?: 'low' | 'medium' | 'high' | 'premium';
  urgency?: 'low' | 'medium' | 'high';
  objections?: string[];
}

interface ConversionAction {
  id: string;
  type: 'call' | 'message' | 'offer' | 'followup' | 'upsell';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  script?: string;
}

interface LeadConversionProps {
  lead: LeadData;
  onActionTaken?: (action: ConversionAction) => void;
  className?: string;
}

// AI Scoring for conversion probability
function calculateConversionProbability(lead: LeadData): number {
  let score = 30; // Base
  
  // Engagement score
  score += lead.engagementScore * 0.3;
  
  // Visit count
  if (lead.visitCount >= 3) score += 15;
  else if (lead.visitCount >= 2) score += 10;
  else if (lead.visitCount >= 1) score += 5;
  
  // Recency
  if (lead.lastContact) {
    const daysSince = Math.floor((Date.now() - lead.lastContact.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 1) score += 20;
    else if (daysSince <= 3) score += 15;
    else if (daysSince <= 7) score += 10;
    else if (daysSince > 14) score -= 10;
  }
  
  // Budget indication
  if (lead.budget === 'high' || lead.budget === 'premium') score += 15;
  else if (lead.budget === 'medium') score += 10;
  
  // Urgency
  if (lead.urgency === 'high') score += 20;
  else if (lead.urgency === 'medium') score += 10;
  
  // Program interest
  if (lead.programInterest.length >= 3) score += 10;
  else if (lead.programInterest.length >= 2) score += 5;
  
  // Objections penalty
  if (lead.objections && lead.objections.length > 0) {
    score -= lead.objections.length * 5;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Generate recommended actions
function generateActions(lead: LeadData, probability: number, t: any): ConversionAction[] {
  const actions: ConversionAction[] = [];
  
  // Based on recency
  if (lead.lastContact) {
    const daysSince = Math.floor((Date.now() - lead.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 3) {
      actions.push({
        id: 'followup_call',
        type: 'call',
        title: t('leadConversionOptimizer.actions.followup.title'),
        description: t('leadConversionOptimizer.actions.followup.description', { days: daysSince }),
        impact: 'high',
        priority: 1,
        script: t('leadConversionOptimizer.actions.followup.script', { name: lead.name, program: lead.programInterest[0] })
      });
    }
  }
  
  // Based on engagement
  if (lead.engagementScore < 50) {
    actions.push({
      id: 'send_content',
      type: 'message',
      title: t('leadConversionOptimizer.actions.content.title'),
      description: t('leadConversionOptimizer.actions.content.description'),
      impact: 'medium',
      priority: 2,
      script: t('leadConversionOptimizer.actions.content.script', { name: lead.name, program: lead.programInterest[0] })
    });
  }
  
  // Based on objections
  if (lead.objections?.includes('price')) {
    actions.push({
      id: 'offer_discount',
      type: 'offer',
      title: t('leadConversionOptimizer.actions.discount.title'),
      description: t('leadConversionOptimizer.actions.discount.description'),
      impact: 'high',
      priority: 1,
      script: t('leadConversionOptimizer.actions.discount.script', { name: lead.name })
    });
  }
  
  if (lead.objections?.includes('time')) {
    actions.push({
      id: 'flexible_booking',
      type: 'message',
      title: t('leadConversionOptimizer.actions.flexible.title'),
      description: t('leadConversionOptimizer.actions.flexible.description'),
      impact: 'medium',
      priority: 2,
      script: t('leadConversionOptimizer.actions.flexible.script', { name: lead.name })
    });
  }
  
  // High probability - push for close
  if (probability >= 70) {
    actions.push({
      id: 'close_deal',
      type: 'call',
      title: t('leadConversionOptimizer.actions.close.title'),
      description: t('leadConversionOptimizer.actions.close.description'),
      impact: 'high',
      priority: 1,
      script: t('leadConversionOptimizer.actions.close.script', { name: lead.name, program: lead.programInterest[0] })
    });
  }
  
  // Upsell opportunity
  if (lead.programInterest.length === 1 && lead.budget !== 'low') {
    actions.push({
      id: 'upsell',
      type: 'upsell',
      title: t('leadConversionOptimizer.actions.upsell.title'),
      description: t('leadConversionOptimizer.actions.upsell.description'),
      impact: 'medium',
      priority: 3,
      script: t('leadConversionOptimizer.actions.upsell.script', { name: lead.name, program: lead.programInterest[0] })
    });
  }
  
  // Sort by priority
  return actions.sort((a, b) => a.priority - b.priority);
}

export function LeadConversionOptimizer({
  lead,
  onActionTaken,
  className = ''
}: LeadConversionProps) {
  const t = useTranslations();
  const [probability, setProbability] = useState(0);
  const [actions, setActions] = useState<ConversionAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<ConversionAction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiObjections, setAiObjections] = useState<any[]>([]);
  const [aiStrategies, setAiStrategies] = useState<string[]>([]);

  const objectionHandler = new AIObjectionHandler();
  
  const { analyzeMessage } = useObjectionDetection({
    enabled: true,
    debounceMs: 500,
  });
  
  useEffect(() => {
    setIsAnalyzing(true);
    
    const analyzeLead = async () => {
      const prob = calculateConversionProbability(lead);
      setProbability(prob);
      setActions(generateActions(lead, prob, t));
      
      // AI-powered objection analysis
      if (lead.objections && lead.objections.length > 0) {
        const objectionAnalyses = [];
        for (const objection of lead.objections) {
          const analysis = await objectionHandler.detectObjection(
            objection === 'price' ? t('leadConversionOptimizer.objectionPrice') : objection === 'time' ? t('leadConversionOptimizer.objectionTime') : objection,
            {
              customerProfile: {
                name: lead.name,
                concerns: lead.programInterest,
                budget: lead.budget as 'low' | 'medium' | 'high' | 'premium' | undefined,
              },
              programInterest: lead.programInterest,
              leadScore: lead.engagementScore,
              urgency: lead.urgency,
            }
          );
          objectionAnalyses.push({ objection, analysis });
        }
        setAiObjections(objectionAnalyses);
      }
      
      // Get AI conversion strategies
      const strategies = await objectionHandler.getConversionStrategies({
        customerProfile: {
          name: lead.name,
          concerns: lead.programInterest,
          budget: lead.budget,
        },
        programInterest: lead.programInterest,
        leadScore: lead.engagementScore,
        urgency: lead.urgency,
      });
      setAiStrategies(strategies);
      
      setIsAnalyzing(false);
    };
    
    analyzeLead();
  }, [lead]);
  
  const getProbabilityColor = () => {
    if (probability >= 70) return 'text-green-400';
    if (probability >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getProbabilityBgColor = () => {
    if (probability >= 70) return 'from-green-600/20 to-emerald-600/20 border-green-500/30';
    if (probability >= 40) return 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30';
    return 'from-red-600/20 to-rose-600/20 border-red-500/30';
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-500">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      default:
        return <Badge className="bg-gray-500">Low</Badge>;
    }
  };
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'offer':
        return <Gift className="w-5 h-5" />;
      case 'upsell':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">{t('leadConversionOptimizer.title')}</CardTitle>
              <p className="text-sm text-gray-400">{t('leadConversionOptimizer.subtitle')}</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Zap className="w-3 h-3 mr-1" />
            AI Analysis
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="py-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 mx-auto mb-3"
            >
              <BarChart3 className="w-10 h-10 text-blue-400" />
            </motion.div>
            <p className="text-white">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {/* Lead Info */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{lead.name}</h3>
                <Badge variant="outline" className="border-white/20 text-gray-400">
                  {lead.source}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {lead.programInterest.map((interest, idx) => (
                  <Badge key={idx} className="bg-purple-500/20 text-purple-300 text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Conversion Probability */}
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getProbabilityBgColor()} border`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{t('salesTools.optimizer.probability')}</span>
                <span className={`text-3xl font-bold ${getProbabilityColor()}`}>
                  {probability}%
                </span>
              </div>
              <Progress value={probability} className="h-3" />
              
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Engagement: {lead.engagementScore}%
                </span>
                <span className="text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Visits: {lead.visitCount}
                </span>
              </div>
            </div>
            
            {/* Objections Warning */}
            {lead.objections && lead.objections.length > 0 && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400">{t('leadConversionOptimizer.concerns')}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lead.objections.map((obj, idx) => (
                        <Badge key={idx} variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                          {obj === 'price' ? t('aiSalesCompanion.keywords.price')[0] : obj === 'time' ? t('aiSalesCompanion.keywords.time')[0] : obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommended Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{t('leadConversionOptimizer.recommendations')}</span>
              </div>
              
              {actions.slice(0, 4).map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedAction?.id === action.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedAction(selectedAction?.id === action.id ? null : action)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      action.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                      action.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{action.title}</p>
                        {getImpactBadge(action.impact)}
                      </div>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  </div>
                  
                  {/* Expanded Script */}
                  {selectedAction?.id === action.id && action.script && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 rounded-lg bg-black/30 border border-white/10"
                    >
                      <p className="text-xs text-gray-400 mb-1">{t('leadConversionOptimizer.scripts')}</p>
                      <p className="text-sm text-white whitespace-pre-line">{action.script}</p>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-blue-600"
                        onClick={() => {
                          navigator.clipboard.writeText(action.script || '');
                          onActionTaken?.(action);
                        }}
                      >
                        {t('leadConversionOptimizer.copyScript')}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              
              {/* AI Conversion Strategies */}
              {aiStrategies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">{t('leadConversionOptimizer.strategies')}</span>
                  </div>
                  
                  {aiStrategies.slice(0, 3).map((strategy, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-gray-300">{strategy}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {t('leadConversionOptimizer.markWon')}
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                {t('leadConversionOptimizer.markLost')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default LeadConversionOptimizer;
