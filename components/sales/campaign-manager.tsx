/**
 * AI Campaign Generator Interface
 * Interactive campaign creation and management
 * Competitive advantage: AI-powered campaign personalization
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Sparkles,
  Target,
  Clock,
  Users,
  TrendingUp,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AIMarketingCampaignGenerator, GeneratedCampaign, CampaignVariant } from '@/lib/ai/campaign-generator';
import { AILeadScorer, LeadData, AIScoreResult } from '@/lib/ai/lead-scorer';

interface CampaignManagerProps {
  leads?: LeadData[];
  onCampaignCreated?: (campaign: GeneratedCampaign) => void;
}

export function CampaignManager({ leads = [], onCampaignCreated }: CampaignManagerProps) {
  const t = useTranslations();
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [leadScore, setLeadScore] = useState<AIScoreResult | null>(null);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [campaignVariants, setCampaignVariants] = useState<CampaignVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const [campaignGenerator] = useState(() => new AIMarketingCampaignGenerator());
  const [aiScorer] = useState(() => new AILeadScorer());

  // Mock leads for demonstration
  useEffect(() => {
    if (leads.length === 0) {
      const mockLeads: LeadData[] = [
        {
          id: '1',
          name: 'Somjai Raksauy',
          email: 'somjai@email.com',
          phone: '081-234-5678',
          source: 'Facebook Ads',
          status: 'hot',
          budget: 'high',
          interests: t.raw('campaignManager.mock.interests1') as string[],
          concerns: t.raw('campaignManager.mock.concerns1') as string[],
          age: 28,
          gender: 'female',
          engagement: {
            websiteVisits: 15,
            emailOpens: 12,
            emailClicks: 8,
            chatInteractions: 6,
            socialEngagement: 20,
            contentDownloads: 3,
            appointmentBookings: 2,
          },
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          firstContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          totalInteractions: 66,
          responseTime: 2,
        },
        {
          id: '2',
          name: 'Wichai Jaidee',
          email: 'wichai@email.com',
          phone: '082-345-6789',
          source: 'Google Search',
          status: 'warm',
          budget: 'medium',
          interests: t.raw('campaignManager.mock.interests2') as string[],
          concerns: t.raw('campaignManager.mock.concerns2') as string[],
          age: 45,
          gender: 'male',
          engagement: {
            websiteVisits: 8,
            emailOpens: 5,
            emailClicks: 2,
            chatInteractions: 3,
            socialEngagement: 8,
            contentDownloads: 1,
            appointmentBookings: 0,
          },
          lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
          firstContact: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          totalInteractions: 27,
          responseTime: 4,
        },
      ];
      // Note: In real implementation, this would be passed as props or fetched from API
    }
  }, [leads]);

  const handleLeadSelect = async (lead: LeadData) => {
    setSelectedLead(lead);
    setIsGenerating(true);

    try {
      // Get AI score for the lead
      const score = await aiScorer.scoreLead(lead);
      setLeadScore(score);

      // Generate personalized campaign
      const campaign = await campaignGenerator.generateCampaign(lead, score);
      setGeneratedCampaign(campaign);

      onCampaignCreated?.(campaign);
    } catch (error) {
      console.error('Campaign generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateABVariants = async () => {
    if (!generatedCampaign || !selectedLead) return;

    setIsOptimizing(true);
    try {
      const variants = await campaignGenerator.generateABVariants(generatedCampaign, selectedLead);
      setCampaignVariants(variants);
    } catch (error) {
      console.error('A/B test generation failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'social':
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t('salesProposalGenerator.title')}</CardTitle>
                <p className="text-sm text-gray-600">{t('salesTools.subtitle')}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('salesProposalGenerator.customerSelection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedLead?.id === lead.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLeadSelect(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-600">{lead.source}</div>
                    </div>
                    <Badge
                      className={
                        lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                        lead.status === 'warm' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {lead.status === 'hot' ? t('salesLeads.status.hot') : lead.status === 'warm' ? t('salesLeads.status.warm') : t('salesLeads.status.cold')}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {t('salesLeads.table.interests')}: {lead.interests.join(', ')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Preview */}
        <div className="lg:col-span-2">
          {isGenerating ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('salesProposalGenerator.generating')}</p>
            </Card>
          ) : generatedCampaign ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="create">{t('campaignManager.listTab')}</TabsTrigger>
                <TabsTrigger value="variants">{t('campaignManager.optimizerTab')}</TabsTrigger>
                <TabsTrigger value="insights">{t('campaignManager.insightsTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{generatedCampaign.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getChannelColor(generatedCampaign.type)}>
                          {getChannelIcon(generatedCampaign.type)}
                          {generatedCampaign.type === 'email' ? t('salesLeadDetail.dialog.types.email') :
                           generatedCampaign.type === 'sms' ? 'SMS' :
                           generatedCampaign.type === 'social' ? (t('nav.socialTool') || 'Social') : t('salesLeadDetail.dialog.types.note')}
                        </Badge>
                        <Badge variant="outline">
                          {t(`campaignManager.categories.${generatedCampaign.category}` as any)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Campaign Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-600">
                          {generatedCampaign.expectedResponseRate}%
                        </div>
                        <div className="text-xs text-blue-600">{t('salesTools.stats.conversion')}</div>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-600">
                          ฿{generatedCampaign.estimatedValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">{t('salesDashboard.metrics.attribution')}</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-purple-600">
                          {generatedCampaign.followUpSequence.length}
                        </div>
                        <div className="text-xs text-purple-600">{t('salesLeads.table.followUp')}</div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-orange-600">
                          {leadScore?.conversionProbability.toFixed(0)}%
                        </div>
                        <div className="text-xs text-orange-600">{t('salesTools.optimizer.probability')}</div>
                      </div>
                    </div>

                    {/* Campaign Content */}
                    <div className="space-y-4">
                      {generatedCampaign.subjectLine && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('salesLeadDetail.dialog.subject')}</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                            {generatedCampaign.subjectLine}
                          </div>
                        </div>
                      )}

                      {generatedCampaign.headline && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('salesLeadDetail.dialog.subject')}</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-lg font-medium">
                            {generatedCampaign.headline}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('salesLeadDetail.dialog.descriptionLabel')}</label>
                        <div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                          {generatedCampaign.content}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('salesTools.tips.urgency')}</label>
                          <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="font-medium text-green-800">{generatedCampaign.callToAction.text}</div>
                            <div className="text-xs text-green-600 mt-1">
                              {t('salesLeadDetail.dialog.type')}: {t(`campaignManager.ctaTypes.${generatedCampaign.callToAction.type}` as any)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('salesTools.profile.concerns')}</label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {generatedCampaign.personalizationElements.map((element, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                        <Send className="w-4 h-4 mr-2" />
                        {t('salesWizard.steps.summary.sendEmail')}
                      </Button>
                      <Button variant="outline" onClick={generateABVariants} disabled={isOptimizing}>
                        {isOptimizing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            {t('salesProposalGenerator.generating')}
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            {t('salesTools.optimizer.strategies')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4">
                {campaignVariants.length > 0 ? (
                  <div className="space-y-4">
                    {campaignVariants.map((variant, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{t('salesTools.optimizer.strategies')} {index + 1}: {variant.name}</CardTitle>
                            <Badge variant="outline">
                              {t('salesTools.optimizer.probability')}: {variant.expectedPerformance}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {variant.subjectLine && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">{t('salesLeadDetail.dialog.subject')}</label>
                              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                {variant.subjectLine}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-gray-700">{t('salesLeadDetail.dialog.descriptionLabel')}</label>
                            <div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                              {variant.content}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Target className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{t('salesActivityFeed.noActivity')}</h3>
                        <p className="text-gray-600 mt-1">
                          {t('salesActivityFeed.emptyDesc')}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('salesTools.tips.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedCampaign.optimizationSuggestions.slice(0, 3).map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('salesTools.tips.urgency')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedCampaign.urgencyTriggers.map((trigger, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{trigger}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : selectedLead ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('salesProposalGenerator.generating')}</p>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('salesProposalGenerator.customerSelection')}</h3>
                  <p className="text-gray-600 mt-1">
                    {t('campaignManager.emptyState')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampaignManager;
