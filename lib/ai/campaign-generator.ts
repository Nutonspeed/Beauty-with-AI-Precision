/**
 * AI-Powered Marketing Campaign Generator
 * Intelligent campaign creation with personalization and optimization
 * Competitive advantage: Dynamic, conversion-focused campaigns
 */

import OpenAI from 'openai';
import { LeadData, AIScoreResult } from './lead-scorer';
import { getOpenAIApiKey } from '@/lib/config/ai';

export interface CampaignTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'push' | 'personal';
  category: 'welcome' | 'nurture' | 'conversion' | 'retention' | 'upsell' | 'reactivation';
  description: string;
  triggers: string[];
  successMetrics: string[];
}

export interface GeneratedCampaign {
  id: string;
  name: string;
  type: CampaignTemplate['type'];
  category: CampaignTemplate['category'];
  targetLead: string; // Lead ID
  subjectLine?: string;
  headline?: string;
  content: string;
  callToAction: {
    text: string;
    url?: string;
    type: 'button' | 'link' | 'phone' | 'booking';
  };
  personalizationElements: string[];
  urgencyTriggers: string[];
  followUpSequence: FollowUpStep[];
  expectedResponseRate: number;
  estimatedValue: number;
  optimizationSuggestions: string[];
  aBTestVariants?: CampaignVariant[];
  createdAt: Date;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
}

export interface FollowUpStep {
  id: string;
  delay: number; // hours after initial campaign
  type: 'email' | 'sms' | 'call' | 'social';
  content: string;
  conditions?: string[]; // conditions to trigger this step
}

export interface CampaignVariant {
  id: string;
  name: string;
  subjectLine?: string;
  content: string;
  expectedPerformance: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  unsubscribeRate: number;
  complaintRate: number;
  bestPerformingVariant?: string;
  insights: string[];
  recommendations: string[];
}

export class AIMarketingCampaignGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: getOpenAIApiKey(),
    });
  }

  /**
   * Generate personalized campaign for a lead
   */
  async generateCampaign(
    lead: LeadData,
    score: AIScoreResult,
    locale: 'th' | 'en' = 'th',
    context?: {
      previousCampaigns?: GeneratedCampaign[];
      competitorAnalysis?: string;
      marketTrends?: string;
      seasonalFactors?: string;
    }
  ): Promise<GeneratedCampaign> {
    try {
      const isThai = locale === 'th';
      const prompt = this.buildCampaignPrompt(lead, score, locale, context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: isThai 
              ? `คุณคือผู้เชี่ยวชาญด้านการสร้างแคมเปญการตลาดสำหรับศูนย์ความงาม สร้างแคมเปญที่มีความเป็นส่วนตัวสูง ปรับแต่งมาเพื่อการแปลงเป็นลูกค้าที่เหมาะสมกับแต่ละบุคคล

ตอบกลับเป็น JSON ในรูปแบบนี้:
{
  "name": "ชื่อแคมเปญ",
  "type": "email|sms|social|push|personal",
  "category": "welcome|nurture|conversion|retention|upsell|reactivation",
  "subjectLine": "หัวข้อที่ดึงดูด",
  "headline": "พาดหัวที่น่าสนใจ",
  "content": "เนื้อหาแคมเปญฉบับเต็มในภาษาไทย",
  "callToAction": {
    "text": "ข้อความบนปุ่ม CTA",
    "type": "button|link|phone|booking"
  },
  "personalizationElements": ["รายการ", "ของ", "องค์ประกอบ", "ส่วนบุคคล"],
  "urgencyTriggers": ["รายการ", "ของ", "ตัวกระตุ้น", "ความเร่งด่วน"],
  "followUpSequence": [
    {
      "delay": 24,
      "type": "email",
      "content": "เนื้อหาการติดตามผล",
      "conditions": ["ไม่ได้เปิด", "ไม่ได้คลิก"]
    }
  ],
  "expectedResponseRate": 0-100,
  "estimatedValue": 0,
  "optimizationSuggestions": ["รายการ", "ของ", "คำแนะนำ", "การปรับปรุง"]
}`
              : `You are a master marketing campaign creator for beauty centers. Create highly personalized, conversion-optimized campaigns that resonate with individual leads.

Return JSON in this format:
{
  "name": "campaign name",
  "type": "email|sms|social|push|personal",
  "category": "welcome|nurture|conversion|retention|upsell|reactivation",
  "subjectLine": "compelling subject line",
  "headline": "attention-grabbing headline",
  "content": "full campaign content in English",
  "callToAction": {
    "text": "CTA button text",
    "type": "button|link|phone|booking"
  },
  "personalizationElements": ["array", "of", "dynamic", "elements"],
  "urgencyTriggers": ["array", "of", "urgency", "elements"],
  "followUpSequence": [
    {
      "delay": 24,
      "type": "email",
      "content": "follow up content",
      "conditions": ["not opened", "not clicked"]
    }
  ],
  "expectedResponseRate": 0-100,
  "estimatedValue": 0,
  "optimizationSuggestions": ["array", "of", "optimization", "tips"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: result.name || `Personalized Campaign for ${lead.name}`,
        type: result.type || 'email',
        category: this.determineCategory(score, lead),
        targetLead: lead.id,
        subjectLine: result.subjectLine,
        headline: result.headline,
        content: result.content || '',
        callToAction: result.callToAction || { text: isThai ? 'ติดต่อเรา' : 'Contact Us', type: 'button' },
        personalizationElements: result.personalizationElements || [],
        urgencyTriggers: result.urgencyTriggers || [],
        followUpSequence: result.followUpSequence || [],
        expectedResponseRate: result.expectedResponseRate || 30,
        estimatedValue: result.estimatedValue || score.predictedValue,
        optimizationSuggestions: result.optimizationSuggestions || [],
        createdAt: new Date(),
        status: 'draft',
      };
    } catch (error) {
      console.error('Campaign generation failed:', error);
      return this.getFallbackCampaign(lead, score, locale);
    }
  }

  /**
   * Generate A/B test variants for campaign optimization
   */
  async generateABVariants(baseCampaign: GeneratedCampaign, lead: LeadData): Promise<CampaignVariant[]> {
    try {
      const prompt = this.buildABTestPrompt(baseCampaign, lead);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Create A/B test variants for marketing campaigns. Focus on elements that significantly impact conversion rates.

Return JSON array of variants in this format:
[{
  "name": "variant name",
  "subjectLine": "different subject line",
  "content": "modified content",
  "expectedPerformance": 0-100
}]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      const variants = JSON.parse(response.choices[0]?.message?.content || '[]');
      return Array.isArray(variants) ? variants : [];
    } catch (error) {
      console.error('A/B test generation failed:', error);
      return [];
    }
  }

  /**
   * Optimize campaign based on performance data
   */
  async optimizeCampaign(
    campaign: GeneratedCampaign,
    analytics: CampaignAnalytics
  ): Promise<GeneratedCampaign> {
    try {
      const prompt = this.buildOptimizationPrompt(campaign, analytics);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Optimize marketing campaigns based on performance data. Identify what works and suggest improvements.

Return JSON with optimized campaign elements.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const optimizations = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        ...campaign,
        subjectLine: optimizations.subjectLine || campaign.subjectLine,
        content: optimizations.content || campaign.content,
        callToAction: optimizations.callToAction || campaign.callToAction,
        followUpSequence: optimizations.followUpSequence || campaign.followUpSequence,
        optimizationSuggestions: [
          ...campaign.optimizationSuggestions,
          ...optimizations.newSuggestions || []
        ],
      };
    } catch (error) {
      console.error('Campaign optimization failed:', error);
      return campaign;
    }
  }

  /**
   * Generate campaign sequence for lead nurturing
   */
  async generateNurtureSequence(
    lead: LeadData,
    score: AIScoreResult,
    duration: number = 30 // days
  ): Promise<GeneratedCampaign[]> {
    try {
      const prompt = this.buildSequencePrompt(lead, score, duration);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Create a strategic nurture campaign sequence. Design campaigns that build trust, educate, and convert over time.

Return JSON array of campaigns in sequence.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const sequence = JSON.parse(response.choices[0]?.message?.content || '[]');
      return Array.isArray(sequence) ? sequence.map((camp: any, index: number) => ({
        ...camp,
        id: `sequence_${index + 1}_${Date.now()}`,
        targetLead: lead.id,
        createdAt: new Date(),
        status: 'draft',
        scheduledFor: new Date(Date.now() + (index * 3 * 24 * 60 * 60 * 1000)), // Every 3 days
      })) : [];
    } catch (error) {
      console.error('Nurture sequence generation failed:', error);
      return [];
    }
  }

  /**
   * Analyze campaign performance and provide insights
   */
  async analyzePerformance(campaigns: GeneratedCampaign[]): Promise<{
    overallPerformance: number;
    bestPerformingType: string;
    bestPerformingCategory: string;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildAnalysisPrompt(campaigns);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze marketing campaign performance and provide actionable insights for optimization.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Performance analysis failed:', error);
      return {
        overallPerformance: 0,
        bestPerformingType: 'email',
        bestPerformingCategory: 'nurture',
        insights: [],
        recommendations: [],
      };
    }
  }

  private buildCampaignPrompt(
    lead: LeadData,
    score: AIScoreResult,
    locale: 'th' | 'en' = 'th',
    context?: any
  ): string {
    const isThai = locale === 'th';
    const urgencyLevel = isThai 
      ? (score.urgency === 'critical' ? 'ด่วนมาก' :
         score.urgency === 'high' ? 'ด่วน' :
         score.urgency === 'medium' ? 'ปานกลาง' : 'ไม่ด่วน')
      : (score.urgency === 'critical' ? 'Critical' :
         score.urgency === 'high' ? 'High' :
         score.urgency === 'medium' ? 'Medium' : 'Low');

    if (isThai) {
      return `
สร้างแคมเปญการตลาดส่วนบุคคลสำหรับลูกค้า:

ข้อมูลลูกค้า:
- ชื่อ: ${lead.name}
- อายุ: ${lead.age || 'ไม่ระบุ'}
- ความสนใจ: ${lead.interests.join(', ')}
- งบประมาณ: ${lead.budget || 'ไม่ระบุ'}
- ปัญหาผิว: ${lead.concerns?.join(', ') || 'ไม่ระบุ'}
- แหล่งที่มา: ${lead.source}

คะแนนจาก AI:
- คะแนนรวม: ${score.overallScore}/100
- โอกาสการแปลง: ${score.conversionProbability}%
- ความเร่งด่วน: ${urgencyLevel}
- คำแนะนำต่อไป: ${score.nextBestAction}

ข้อมูลเพิ่มเติม:
- การมีส่วนร่วม: ${JSON.stringify(lead.engagement)}
- ประวัติการรักษา: ${lead.previousPrograms?.join(', ') || 'ไม่มี'}
- ข้อกังวล: ${lead.objections?.join(', ') || 'ไม่มี'}

${context ? `บริบทเพิ่มเติม: ${JSON.stringify(context)}` : ''}

สร้างแคมเปญที่:
1. เป็นส่วนบุคคลและน่าสนใจ
2. ตรงกับความสนใจและความต้องการ
3. สร้างความไว้วางใจและความเชี่ยวชาญ
4. มี Call-to-Action ที่ชัดเจน
5. เหมาะกับระดับความเร่งด่วน
6. รวมองค์ประกอบการเร่งด่วนอย่างเหมาะสม

ให้เนื้อหาในภาษาไทยที่เป็นมิตร สุภาพ และน่าเชื่อถือ
คำนึงถึงวัฒนธรรมไทยและความสุภาพในการสื่อสาร
`;
    }

    return `
Create a personalized marketing campaign for the customer:

Customer Info:
- Name: ${lead.name}
- Age: ${lead.age || 'Not specified'}
- Interests: ${lead.interests.join(', ')}
- Budget: ${lead.budget || 'Not specified'}
- Skin Concerns: ${lead.concerns?.join(', ') || 'Not specified'}
- Source: ${lead.source}

AI Score:
- Overall Score: ${score.overallScore}/100
- Conversion Probability: ${score.conversionProbability}%
- Urgency: ${urgencyLevel}
- Next Best Action: ${score.nextBestAction}

Additional Info:
- Engagement: ${JSON.stringify(lead.engagement)}
- Treatment History: ${lead.previousPrograms?.join(', ') || 'None'}
- Objections: ${lead.objections?.join(', ') || 'None'}

${context ? `Additional Context: ${JSON.stringify(context)}` : ''}

Create a campaign that:
1. Is personalized and engaging
2. Matches customer interests and needs
3. Builds trust and expertise
4. Has a clear Call-to-Action
5. Suits the urgency level
6. Includes appropriate urgency elements

Provide content in a friendly, polite, and trustworthy English tone.
`;
  }

  private buildABTestPrompt(baseCampaign: GeneratedCampaign, lead: LeadData, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    if (isThai) {
      return `
สร้างตัวเลือก A/B testing สำหรับแคมเปญ:

แคมเปญหลัก:
- หัวข้อ: ${baseCampaign.subjectLine}
- ประเภท: ${baseCampaign.type}
- กลุ่มเป้าหมาย: ${lead.name} - ${lead.interests.join(', ')}

สร้าง 3 ตัวเลือกการทดสอบ:
1. เปลี่ยนหัวข้อ (Subject Line)
2. เปลี่ยนเนื้อหา (Content)
3. เปลี่ยน Call-to-Action

แต่ละตัวเลือกควร:
- ต่างจากแคมเปญหลักอย่างมีนัยสำคัญ
- มีโอกาสที่จะให้ผลลัพธ์ที่ดีกว่า
- เหมาะกับกลุ่มเป้าหมาย
`;
    }

    return `
Create A/B testing variants for the campaign:

Main Campaign:
- Subject Line: ${baseCampaign.subjectLine}
- Type: ${baseCampaign.type}
- Target Group: ${lead.name} - ${lead.interests.join(', ')}

Create 3 test variants:
1. Different Subject Line
2. Different Content
3. Different Call-to-Action

Each variant should:
- Differ significantly from the main campaign
- Have potential for better results
- Suit the target audience
`;
  }

  private buildOptimizationPrompt(campaign: GeneratedCampaign, analytics: CampaignAnalytics, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    if (isThai) {
      return `
วิเคราะห์และปรับปรุงแคมเปญ:

ข้อมูลประสิทธิภาพ:
- ส่งแล้ว: ${analytics.sent}
- เปิดอ่าน: ${analytics.opened} (${((analytics.opened / analytics.sent) * 100).toFixed(1)}%)
- คลิก: ${analytics.clicked} (${((analytics.clicked / analytics.opened) * 100).toFixed(1)}%)
- แปลง: ${analytics.converted} (${((analytics.converted / analytics.sent) * 100).toFixed(1)}%)
- รายได้: ฿${analytics.revenue.toLocaleString()}

แคมเปญต้นฉบับ:
- หัวข้อ: ${campaign.subjectLine}
- ประเภท: ${campaign.type}
- เนื้อหา: ${campaign.content.substring(0, 200)}...

ให้คำแนะนำในการปรับปรุง:
1. ปรับหัวข้อให้ดึงดูดมากขึ้น
2. แก้ไขเนื้อหาให้น่าสนใจและมีประสิทธิภาพมากขึ้น
3. ปรับ Call-to-Action ให้ชัดเจนขึ้น
4. แก้ไข follow-up sequence
5. เพิ่ม personalization elements
`;
    }

    return `
Analyze and optimize the campaign:

Performance Info:
- Sent: ${analytics.sent}
- Opened: ${analytics.opened} (${((analytics.opened / analytics.sent) * 100).toFixed(1)}%)
- Clicked: ${analytics.clicked} (${((analytics.clicked / analytics.opened) * 100).toFixed(1)}%)
- Converted: ${analytics.converted} (${((analytics.converted / analytics.sent) * 100).toFixed(1)}%)
- Revenue: THB ${analytics.revenue.toLocaleString()}

Original Campaign:
- Subject: ${campaign.subjectLine}
- Type: ${campaign.type}
- Content: ${campaign.content.substring(0, 200)}...

Provide optimization tips:
1. Catchier subject line
2. More engaging and effective content
3. Clearer Call-to-Action
4. Improved follow-up sequence
5. Enhanced personalization elements
`;
  }

  private buildSequencePrompt(lead: LeadData, score: AIScoreResult, duration: number, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    if (isThai) {
      return `
สร้างลำดับแคมเปญการ nurture เป็นเวลา ${duration} วัน:

ข้อมูลลูกค้า:
- ชื่อ: ${lead.name}
- ความสนใจ: ${lead.interests.join(', ')}
- คะแนน: ${score.overallScore}/100
- ระดับความพร้อม: ${score.priority}

สร้างลำดับ 4-6 แคมเปญที่:
1. เริ่มจากการสร้างความรู้จักและความไว้วางใจ
2. ให้ข้อมูลที่มีคุณค่าเกี่ยวกับปัญหาผิว
3. แสดงผลลัพธ์และความสำเร็จ
4. สร้างความเร่งด่วนในการตัดสินใจ
5. จบด้วยข้อเสนอพิเศษ

แต่ละแคมเปญควรห่างกัน 2-4 วัน และส่งเสริมกันเอง
`;
    }

    return `
Create a nurture campaign sequence for ${duration} days:

Customer Info:
- Name: ${lead.name}
- Interests: ${lead.interests.join(', ')}
- Score: ${score.overallScore}/100
- Priority Level: ${score.priority}

Create a sequence of 4-6 campaigns that:
1. Start with building awareness and trust
2. Provide valuable information about skin concerns
3. Show results and success stories
4. Create urgency for decision making
5. End with a special offer

Each campaign should be 2-4 days apart and mutually reinforcing.
`;
  }

  private buildAnalysisPrompt(campaigns: GeneratedCampaign[], locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    const summary = campaigns.map(c => ({
      type: c.type,
      category: c.category,
      responseRate: c.expectedResponseRate,
      status: c.status,
    }));

    if (isThai) {
      return `
วิเคราะห์ประสิทธิภาพแคมเปญทั้งหมด:

ข้อมูลแคมเปญ: ${JSON.stringify(summary, null, 2)}

ให้ข้อมูลเชิงลึก:
1. ประเภทแคมเปญที่มีประสิทธิภาพสูงสุด
2. หมวดหมู่ที่มี conversion สูงสุด
3. แนวโน้มและรูปแบบ
4. คำแนะนำในการปรับปรุง
5. กลยุทธ์สำหรับอนาคต
`;
    }

    return `
Analyze all campaign performance:

Campaign Info: ${JSON.stringify(summary, null, 2)}

Provide insights on:
1. Top performing campaign types
2. Categories with highest conversion
3. Trends and patterns
4. Optimization tips
5. Future strategies
`;
  }

  private determineCategory(score: AIScoreResult, lead: LeadData): CampaignTemplate['category'] {
    if (score.overallScore >= 80) return 'conversion';
    if (score.priority === 'urgent') return 'conversion';
    if (lead.status === 'hot') return 'conversion';
    if (lead.engagement.appointmentBookings > 0) return 'retention';
    if (lead.previousPrograms && lead.previousPrograms.length > 0) return 'upsell';
    if (lead.engagement.websiteVisits > 5) return 'nurture';
    return 'welcome';
  }

  private getFallbackCampaign(lead: LeadData, score: AIScoreResult, locale: 'th' | 'en' = 'th'): GeneratedCampaign {
    const isThai = locale === 'th';
    return {
      id: `fallback_${Date.now()}`,
      name: `Basic Campaign for ${lead.name}`,
      type: 'email',
      category: 'nurture',
      targetLead: lead.id,
      subjectLine: isThai ? `คำแนะนำพิเศษสำหรับคุณ ${lead.name}` : `Special recommendation for you ${lead.name}`,
      content: isThai 
        ? `สวัสดีค่ะ ${lead.name}

ขอบคุณที่สนใจ${lead.interests.join(' และ ')} ของเรา

เรามีบริการที่เหมาะกับคุณโดยเฉพาะ พร้อมให้คำปรึกษาฟรี

ติดต่อเราได้เลยค่ะ`
        : `Hello ${lead.name}

Thank you for your interest in our ${lead.interests.join(' and ')}.

We have services tailored just for you, with a free consultation available.

Contact us today.`,
      callToAction: {
        text: isThai ? 'ติดต่อปรึกษาฟรี' : 'Free Consultation',
        type: 'button',
      },
      personalizationElements: isThai ? ['ชื่อลูกค้า'] : ['Customer Name'],
      urgencyTriggers: [],
      followUpSequence: [],
      expectedResponseRate: 25,
      estimatedValue: score.predictedValue,
      optimizationSuggestions: isThai ? ['เพิ่มรูปภาพ', 'ปรับหัวข้อให้ดึงดูดมากขึ้น'] : ['Add images', 'Catchier subject line'],
      createdAt: new Date(),
      status: 'draft',
    };
  }
}

export default AIMarketingCampaignGenerator;
