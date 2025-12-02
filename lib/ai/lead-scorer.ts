/**
 * AI-Powered Lead Scoring System
 * Intelligent lead analysis and scoring using GPT-4
 * Competitive advantage: Predictive analytics and personalized insights
 */

import OpenAI from 'openai';

export interface LeadData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  source: string;
  status: 'hot' | 'warm' | 'cold';
  budget?: 'low' | 'medium' | 'high' | 'premium';
  timeline?: string;
  interests: string[];
  concerns?: string[];
  skinType?: string;
  previousTreatments?: string[];
  location?: string;
  engagement: {
    websiteVisits: number;
    emailOpens: number;
    emailClicks: number;
    chatInteractions: number;
    socialEngagement: number;
    contentDownloads: number;
    appointmentBookings: number;
  };
  lastActivity: Date;
  firstContact: Date;
  totalInteractions: number;
  responseTime?: number; // average response time in hours
  objections?: string[];
  competitorMentions?: string[];
}

export interface AIScoreResult {
  overallScore: number; // 0-100
  confidence: number; // 0-1
  conversionProbability: number; // 0-100
  predictedValue: number; // in THB
  predictedLTV: number; // Lifetime Value
  urgency: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunityFactors: string[];
  nextBestAction: string;
  suggestedTimeline: string;
  personalizedMessage?: string;
}

export interface LeadSegmentation {
  segment: string;
  description: string;
  characteristics: string[];
  conversionRate: number;
  averageValue: number;
  recommendedStrategy: string;
}

export class AILeadScorer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Score a lead using AI analysis
   */
  async scoreLead(lead: LeadData): Promise<AIScoreResult> {
    try {
      const prompt = this.buildScoringPrompt(lead);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert lead scoring analyst for a premium beauty clinic. Analyze lead data and provide detailed scoring with predictive insights.

Return JSON in this format:
{
  "overallScore": 0-100,
  "confidence": 0.0-1.0,
  async segmentLeads(leads: LeadData[]): Promise<LeadSegmentation[]> {
    // Use production reference data for proven segmentation
    const segments: LeadSegmentation[] = [];

    for (const lead of leads) {
      const score = await this.scoreLead(lead);
      const segment = PRODUCTION_REFERENCE_DATA.customerSegments.tech_savvy; // Default segment

      segments.push({
        segment: segment.segmentId,
        description: segment.description,
        characteristics: segment.characteristics,
        conversionRate: segment.conversionRate,
        averageValue: segment.averageOrderValue,
        recommendedStrategy: segment.recommendedStrategy,
      });
    }

    return segments;
  }

  async generateCampaign(lead: LeadData, score: AIScoreResult): Promise<any> {
    try {
      const prompt = this.buildCampaignPrompt(lead, score);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a marketing campaign specialist for beauty clinics. Create personalized, high-converting marketing campaigns.

Return JSON in this format:
{
  "campaignName": "campaign title",
  "campaignType": "email|sms|social|personal",
  "subjectLine": "attention-grabbing subject",
  "content": "full campaign content in Thai",
  "callToAction": "specific CTA",
  "expectedResponseRate": 0-100,
  "followUpSequence": ["step1", "step2"],
  "personalizationElements": ["dynamic", "elements"],
  "urgencyTriggers": ["urgency", "elements"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Campaign generation failed:', error);
      return this.getFallbackCampaign(lead);
    }
  }

  /**
   * Predict lead behavior and conversion patterns
   */
  async predictBehavior(lead: LeadData, historicalData?: LeadData[]): Promise<any> {
    try {
      const prompt = this.buildPredictionPrompt(lead, historicalData);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a predictive analytics expert. Forecast lead behavior and conversion patterns.

Return JSON in this format:
{
  "shortTermConversion": 0-100,
  "mediumTermConversion": 0-100,
  "longTermConversion": 0-100,
  "churnRisk": 0-100,
  "engagementTrend": "increasing|stable|decreasing",
  "bestContactTime": "time range",
  "preferredChannel": "email|phone|chat|social",
  "priceSensitivity": "low|medium|high",
  "brandLoyalty": 0-100,
  "recommendationLikelihood": 0-100
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Behavior prediction failed:', error);
      return {};
    }
  }

  private buildScoringPrompt(lead: LeadData): string {
    const daysSinceLastActivity = Math.floor((Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceFirstContact = Math.floor((Date.now() - lead.firstContact.getTime()) / (1000 * 60 * 60 * 24));

    return `
วิเคราะห์ Lead นี้และให้คะแนนอย่างละเอียด:

ข้อมูลลูกค้า:
- ชื่อ: ${lead.name}
- อายุ: ${lead.age || 'ไม่ระบุ'}
- เพศ: ${lead.gender || 'ไม่ระบุ'}
- แหล่งที่มา: ${lead.source}
- สถานะปัจจุบัน: ${lead.status}
- งบประมาณ: ${lead.budget || 'ไม่ระบุ'}
- ช่วงเวลา: ${lead.timeline || 'ไม่ระบุ'}
- สนใจ: ${lead.interests.join(', ')}
- ปัญหาผิว: ${lead.concerns?.join(', ') || 'ไม่ระบุ'}
- ประเภทผิว: ${lead.skinType || 'ไม่ระบุ'}
- การรักษาก่อนหน้า: ${lead.previousTreatments?.join(', ') || 'ไม่มี'}

สถิติการมีส่วนร่วม:
- การเข้าชมเว็บไซต์: ${lead.engagement.websiteVisits}
- การเปิดอีเมล: ${lead.engagement.emailOpens}
- การคลิกอีเมล: ${lead.engagement.emailClicks}
- การสนทนาผ่านแชท: ${lead.engagement.chatInteractions}
- การมีส่วนร่วมในโซเชียล: ${lead.engagement.socialEngagement}
- การดาวน์โหลดเนื้อหา: ${lead.engagement.contentDownloads}
- การจองนัดหมาย: ${lead.engagement.appointmentBookings}

ระยะเวลา:
- กิจกรรมล่าสุด: ${daysSinceLastActivity} วันที่แล้ว
- ติดต่อครั้งแรก: ${daysSinceFirstContact} วันที่แล้ว
- จำนวนการติดต่อทั้งหมด: ${lead.totalInteractions}
- เวลาตอบสนองเฉลี่ย: ${lead.responseTime || 'ไม่ระบุ'} ชั่วโมง

ปัจจัยเสี่ยง:
- ข้อกังวล: ${lead.objections?.join(', ') || 'ไม่มี'}
- การพูดถึงคู่แข่ง: ${lead.competitorMentions?.join(', ') || 'ไม่มี'}

ให้คะแนนและวิเคราะห์:
1. คะแนนรวม (0-100): พิจารณาปัจจัยทั้งหมด
2. ความมั่นใจในการคะแนน: ความเชื่อมั่นในการวิเคราะห์
3. โอกาสการแปลงเป็นลูกค้า: ความน่าจะเป็นที่จะซื้อ
4. มูลค่าที่คาดการณ์: ในหน่วยบาทไทย
5. LTV ที่คาดการณ์: มูลค่าตลอดอายุการใช้งาน
6. ระดับความเร่งด่วน: ควรติดตามด่วนแค่ไหน
7. ระดับความสำคัญ: ลำดับความสำคัญในการติดตาม

ให้คำแนะนำเฉพาะบุคคลและกลยุทธ์การตลาดที่เหมาะสม
`;
  }

  private buildSegmentationPrompt(leads: LeadData[]): string {
    const summary = leads.slice(0, 10).map(lead => ({
      name: lead.name,
      source: lead.source,
      budget: lead.budget,
      interests: lead.interests,
      engagement: lead.engagement,
      score: this.calculateBasicScore(lead),
    }));

    return `
วิเคราะห์กลุ่มลูกค้า ${leads.length} คน และแบ่งเป็นกลุ่มที่มีความหมาย:

ข้อมูลสรุปของลูกค้า (10 คนแรก):
${JSON.stringify(summary, null, 2)}

สร้างกลุ่มลูกค้าที่มีลักษณะคล้ายกัน โดยพิจารณา:
- พฤติกรรมการซื้อ (budget, interests)
- แหล่งที่มา (source)
- ระดับการมีส่วนร่วม (engagement)
- โอกาสการแปลงเป็นลูกค้า

สำหรับแต่ละกลุ่ม ให้:
- ชื่อกลุ่มที่สื่อความหมาย
- คำอธิบายกลุ่ม
- ลักษณะสำคัญ
- อัตราการแปลงเป็นลูกค้าโดยเฉลี่ย
- มูลค่าโดยเฉลี่ย
- กลยุทธ์การตลาดที่แนะนำ

แบ่งเป็น 4-6 กลุ่มหลัก
`;
  }

  private buildCampaignPrompt(lead: LeadData, score: AIScoreResult): string {
    return `
สร้างแคมเปญการตลาดส่วนบุคคลสำหรับลูกค้า:

ข้อมูลลูกค้า:
- ชื่อ: ${lead.name}
- สนใจ: ${lead.interests.join(', ')}
- งบประมาณ: ${lead.budget}
- คะแนน: ${score.overallScore}/100
- โอกาสการแปลง: ${score.conversionProbability}%

คำแนะนำจาก AI: ${score.nextBestAction}

สร้างแคมเปญที่:
1. เป็นส่วนบุคคลและน่าสนใจ
2. ตรงกับความสนใจของลูกค้า
3. สร้างความเร่งด่วนอย่างเหมาะสม
4. มี Call-to-Action ที่ชัดเจน
5. เหมาะกับช่องทางการติดต่อ

ให้เนื้อหาในภาษาไทยที่เป็นมิตรและน่าเชื่อถือ
`;
  }

  private buildPredictionPrompt(lead: LeadData, historicalData?: LeadData[]): string {
    return `
คาดการณ์พฤติกรรมของลูกค้า:

ข้อมูลลูกค้า:
- ชื่อ: ${lead.name}
- การมีส่วนร่วม: ${JSON.stringify(lead.engagement)}
- กิจกรรมล่าสุด: ${lead.lastActivity.toISOString()}
- จำนวนการติดต่อ: ${lead.totalInteractions}

${historicalData ? `ข้อมูลประวัติ (${historicalData.length} ลูกค้า): ${JSON.stringify(historicalData.slice(0, 5).map(l => ({ engagement: l.engagement, converted: l.status === 'hot' })), null, 2)}` : ''}

คาดการณ์:
- โอกาสการแปลงในระยะสั้น/กลาง/ยาว
- ความเสี่ยงที่จะหลุดออก
- แนวโน้มการมีส่วนร่วม
- ช่องทางติดต่อที่ดีที่สุด
- ความไวต่อราคา
- ความภักดีต่อแบรนด์
`;
  }

  private calculateBasicScore(lead: LeadData): number {
    let score = 30;

    // Engagement factors
    score += lead.engagement.websiteVisits * 2;
    score += lead.engagement.emailOpens * 3;
    score += lead.engagement.chatInteractions * 5;
    score += lead.engagement.socialEngagement * 1;

    // Budget factor
    if (lead.budget === 'premium') score += 20;
    else if (lead.budget === 'high') score += 15;
    else if (lead.budget === 'medium') score += 10;

    // Interest factor
    score += lead.interests.length * 5;

    // Recency factor
    const daysSinceActivity = Math.floor((Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity <= 1) score += 20;
    else if (daysSinceActivity <= 3) score += 15;
    else if (daysSinceActivity <= 7) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private getFallbackScore(lead: LeadData): AIScoreResult {
    const basicScore = this.calculateBasicScore(lead);

    return {
      overallScore: basicScore,
      confidence: 0.6,
      conversionProbability: Math.round(basicScore * 0.6),
      predictedValue: basicScore * 200,
      predictedLTV: basicScore * 600,
      urgency: basicScore > 70 ? 'high' : basicScore > 40 ? 'medium' : 'low',
      priority: basicScore > 70 ? 'urgent' : basicScore > 40 ? 'high' : 'medium',
      insights: ['ใช้ระบบการให้คะแนนพื้นฐานเนื่องจาก AI ไม่พร้อมใช้งาน'],
      recommendations: ['ติดต่อลูกค้าเพื่อรวบรวมข้อมูลเพิ่มเติม'],
      riskFactors: ['ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์เชิงลึก'],
      opportunityFactors: ['มีโอกาสในการพัฒนาความสัมพันธ์'],
      nextBestAction: 'ส่งอีเมลแนะนำบริการ',
      suggestedTimeline: 'ภายใน 48 ชั่วโมง',
    };
  }

  private getDefaultSegments(): LeadSegmentation[] {
    return [
      {
        segment: 'High-Value Prospects',
        description: 'ลูกค้าที่มีงบประมาณสูงและสนใจบริการพรีเมียม',
        characteristics: ['งบประมาณสูง', 'สนใจหลายบริการ', 'การมีส่วนร่วมสูง'],
        conversionRate: 75,
        averageValue: 45000,
        recommendedStrategy: 'Personal consultation + VIP treatment packages'
      },
      {
        segment: 'Engaged Browsers',
        description: 'ลูกค้าที่เข้าชมเว็บไซต์บ่อยแต่ยังไม่ได้ตัดสินใจ',
        characteristics: ['เข้าชมเว็บไซต์บ่อย', 'ดาวน์โหลดเนื้อหา', 'ยังไม่ได้ติดต่อ'],
        conversionRate: 45,
        averageValue: 25000,
        recommendedStrategy: 'Educational content + limited-time offers'
      },
      {
        segment: 'Cold Leads',
        description: 'ลูกค้าที่มีกิจกรรมน้อยและยังไม่พร้อม',
        characteristics: ['กิจกรรมน้อย', 'ไม่ได้เปิดอีเมล', 'ไม่ได้สนทนา'],
        conversionRate: 15,
        averageValue: 12000,
        recommendedStrategy: 'Nurturing campaigns + retargeting ads'
      }
    ];
  }

  private getFallbackCampaign(lead: LeadData): any {
    return {
      campaignName: 'Personalized Welcome',
      campaignType: 'email',
      subjectLine: `สวัสดี ${lead.name} - คำแนะนำพิเศษสำหรับคุณ`,
      content: `สวัสดีค่ะ ${lead.name}\n\nขอบคุณที่สนใจ${lead.interests.join(' และ ')} ของเรา\n\nเรามีบริการที่เหมาะกับคุณโดยเฉพาะ ติดต่อปรึกษาฟรีได้เลยค่ะ`,
      callToAction: 'ติดต่อปรึกษาฟรี',
      expectedResponseRate: 30,
      followUpSequence: ['ส่งข้อมูลเพิ่มเติม', 'ติดตามผ่านโทรศัพท์'],
      personalizationElements: ['ชื่อลูกค้า', 'ความสนใจ'],
      urgencyTriggers: ['จำกัดเวลา 7 วัน']
    };
  }
}

export default AILeadScorer;
