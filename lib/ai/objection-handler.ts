/**
 * AI Objection Handler
 * Intelligent objection detection and handling for sales conversations
 * Uses GPT-4 for contextual objection analysis and response generation
 */

import OpenAI from 'openai';
import { getOpenAIApiKey } from '@/lib/config/ai';

export interface ObjectionContext {
  customerProfile?: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    concerns?: string[];
    budget?: 'low' | 'medium' | 'high' | 'premium';
    previousPrograms?: string[];
  };
  programInterest?: string[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentProgram?: {
    name: string;
    price: number;
    category: string;
  };
  leadScore?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export interface ObjectionAnalysis {
  objectionType: 'price' | 'time' | 'trust' | 'pain' | 'commitment' | 'competition' | 'information' | 'none';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
  context: string;
}

export interface ObjectionResponse {
  response: string;
  strategy: 'acknowledge' | 'reframe' | 'evidence' | 'alternative' | 'urgency' | 'social_proof';
  followUpActions: string[];
  conversionProbability: number;
  script: string;
}

export class AIObjectionHandler {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: getOpenAIApiKey(),
    });
  }

  /**
   * Detect objections in user message
   */
  async detectObjection(message: string, context: ObjectionContext, locale: 'th' | 'en' = 'th'): Promise<ObjectionAnalysis> {
    try {
      const prompt = this.buildDetectionPrompt(message, context, locale);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: locale === 'th' 
              ? `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์ข้อโต้แย้งจากการขายสำหรับศูนย์ความงาม วิเคราะห์ข้อความของผู้ใช้และจัดประเภทข้อโต้แย้งอย่างแม่นยำ

ตอบกลับเป็น JSON ในรูปแบบนี้:
{
  "objectionType": "price|time|trust|pain|commitment|competition|information|none",
  "confidence": 0.0-1.0,
  "severity": "low|medium|high",
  "keywords": ["รายการ", "ของ", "คำ", "หลัก"],
  "context": "คำอธิบายสั้นๆ เกี่ยวกับบริบทของข้อโต้แย้ง"
}`
              : `You are an expert sales objection analyzer for a beauty center. Analyze the user's message and classify any objections with high accuracy.

Return JSON in this format:
{
  "objectionType": "price|time|trust|pain|commitment|competition|information|none",
  "confidence": 0.0-1.0,
  "severity": "low|medium|high",
  "keywords": ["array", "of", "key", "words"],
  "context": "brief explanation of the objection context"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        objectionType: result.objectionType || 'none',
        confidence: result.confidence || 0,
        severity: result.severity || 'low',
        keywords: result.keywords || [],
        context: result.context || '',
      };
    } catch (error) {
      console.error('Objection detection failed:', error);
      return {
        objectionType: 'none',
        confidence: 0,
        severity: 'low',
        keywords: [],
        context: 'Analysis failed',
      };
    }
  }

  /**
   * Generate contextual response to handle objection
   */
  async handleObjection(
    objection: ObjectionAnalysis,
    context: ObjectionContext,
    locale: 'th' | 'en' = 'th'
  ): Promise<ObjectionResponse> {
    if (objection.objectionType === 'none') {
      return {
        response: '',
        strategy: 'acknowledge',
        followUpActions: [],
        conversionProbability: 0.8,
        script: '',
      };
    }

    try {
      const isThai = locale === 'th';
      const prompt = this.buildResponsePrompt(objection, context, locale);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: isThai
              ? `คุณคือผู้เชี่ยวชาญการปิดการขายสำหรับศูนย์ความงามระดับพรีเมียม สร้างการตอบสนองที่เห็นอกเห็นใจและจูงใจเพื่อจัดการกับข้อโต้แย้งของลูกค้า

เน้นที่:
- การสร้างความไว้วางใจและความสัมพันธ์
- การจัดการข้อกังวลโดยตรง
- การมอบคุณค่าและหลักฐานทางสังคม
- การสร้างความเร่งด่วนโดยไม่มีแรงกดดัน
- การใช้ภาษาไทยอย่างเหมาะสม

ตอบกลับเป็น JSON ในรูปแบบนี้:
{
  "response": "การตอบสนองที่เป็นธรรมชาติในบทสนทนาภาษาไทย",
  "strategy": "acknowledge|reframe|evidence|alternative|urgency|social_proof",
  "followUpActions": ["การดำเนินการ1", "การดำเนินการ2"],
  "conversionProbability": 0.0-1.0,
  "script": "สคริปต์การขายที่สมบูรณ์พร้อมการจัดการข้อโต้แย้ง"
}`
              : `You are a master sales closer for a premium beauty center. Generate empathetic, persuasive responses to handle customer objections.

Focus on:
- Building trust and rapport
- Addressing concerns directly
- Providing value and social proof
- Creating urgency without pressure
- Using appropriate language

Return JSON in this format:
{
  "response": "natural conversational response",
  "strategy": "acknowledge|reframe|evidence|alternative|urgency|social_proof",
  "followUpActions": ["action1", "action2"],
  "conversionProbability": 0.0-1.0,
  "script": "complete sales script with objection handling"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        response: result.response || (isThai ? 'ขออภัยค่ะ ฉันไม่เข้าใจความกังวลของคุณ' : 'I am sorry, I do not quite understand your concern.'),
        strategy: result.strategy || 'acknowledge',
        followUpActions: result.followUpActions || [],
        conversionProbability: result.conversionProbability || 0.5,
        script: result.script || '',
      };
    } catch (error) {
      console.error('Objection handling failed:', error);
      return this.getFallbackResponse(objection, locale);
    }
  }

  /**
   * Get conversion optimization strategies
   */
  async getConversionStrategies(context: ObjectionContext, locale: 'th' | 'en' = 'th'): Promise<string[]> {
    try {
      const prompt = this.buildStrategyPrompt(context, locale);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: locale === 'th'
              ? `คุณคือผู้เชี่ยวชาญด้านการเพิ่มประสิทธิภาพการขายสำหรับศูนย์ความงาม มอบกลยุทธ์ที่ชัดเจนและนำไปปฏิบัติได้เพื่อเพิ่มอัตราการแปลงเป็นลูกค้า

ตอบกลับเป็นอาเรย์ JSON ของสตริงกลยุทธ์ในภาษาไทย`
              : `You are a sales optimization expert for beauty centers. Provide specific, actionable strategies to increase conversion rates.

Return JSON array of strategy strings.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 500,
      });

      const strategies = JSON.parse(response.choices[0]?.message?.content || '[]');
      return Array.isArray(strategies) ? strategies : [];
    } catch (error) {
      console.error('Strategy generation failed:', error);
      return [];
    }
  }

  private buildDetectionPrompt(message: string, context: ObjectionContext, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    if (isThai) {
      return `
วิเคราะห์ข้อความของลูกค้าและตรวจสอบ objection:

ข้อความลูกค้า: "${message}"

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'ไม่ระบุ'}
- อายุ: ${context.customerProfile?.age || 'ไม่ระบุ'}
- ความสนใจ: ${context.programInterest?.join(', ') || 'ไม่ระบุ'}
- งบประมาณ: ${context.customerProfile?.budget || 'ไม่ระบุ'}
- Program ปัจจุบัน: ${context.currentProgram?.name || 'ไม่ระบุ'}
- ราคา: ${context.currentProgram?.price ? `฿${context.currentProgram.price.toLocaleString()}` : 'ไม่ระบุ'}
- Lead Score: ${context.leadScore || 'ไม่ระบุ'}

ประเภท objection ที่พบบ่อย:
- price: กังวลเรื่องราคาแพงไป
- time: ไม่มีเวลา ไม่สะดวก
- trust: ไม่เชื่อถือคลินิก/แพทย์
- pain: กลัวเจ็บ กังวลผลข้างเคียง
- commitment: ไม่พร้อมตัดสินใจ
- competition: ไปที่อื่นถูกกว่า/ดีกว่า
- information: ต้องการข้อมูลเพิ่มเติม

คำสำคัญที่บ่งบอก objection:
ราคา: แพง, ถูก, เท่าไหร่, คุ้มไหม, ลดราคา
เวลา: ไม่มีเวลา, ยุ่ง, สะดวกไหม, วันไหน, เวลาไหน
ความเชื่อถือ: เชื่อไหม, ปลอดภัยไหม, แพทย์ดีไหม, ผลลัพธ์จริงไหม
ความเจ็บปวด: เจ็บไหม, กลัว, ผลข้างเคียง, ต้องพักฟื้นกี่วัน
การตัดสินใจ: คิดก่อน, คุยกับคนอื่น, ยังไม่แน่ใจ, รออีกสักพัก
`;
    }

    return `
Analyze customer message and detect objections:

Customer Message: "${message}"

Customer Info:
- Name: ${context.customerProfile?.name || 'Not specified'}
- Age: ${context.customerProfile?.age || 'Not specified'}
- Interests: ${context.programInterest?.join(', ') || 'Not specified'}
- Budget: ${context.customerProfile?.budget || 'Not specified'}
- Current Program: ${context.currentProgram?.name || 'Not specified'}
- Price: ${context.currentProgram?.price ? `฿${context.currentProgram.price.toLocaleString()}` : 'Not specified'}
- Lead Score: ${context.leadScore || 'Not specified'}

Common Objection Types:
- price: Concerned about the price being too high
- time: No time, not convenient
- trust: Does not trust the clinic/doctor
- pain: Fear of pain, concerned about side effects
- commitment: Not ready to decide
- competition: Going elsewhere is cheaper/better
- information: Needs more information

Keywords indicating objections:
Price: expensive, cheap, how much, worth it, discount
Time: no time, busy, convenient, when, what time
Trust: can I trust, safe, good doctor, real results
Pain: does it hurt, scared, side effects, recovery time
Decision: think about it, talk to someone, not sure, wait a while
`;
  }

  private buildResponsePrompt(objection: ObjectionAnalysis, context: ObjectionContext, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    const objectionTypes = isThai ? {
      price: 'กังวลเรื่องราคา',
      time: 'กังวลเรื่องเวลา',
      trust: 'กังวลเรื่องความเชื่อถือ',
      pain: 'กังวลเรื่องความเจ็บปวด',
      commitment: 'ยังไม่พร้อมตัดสินใจ',
      competition: 'เปรียบเทียบกับที่อื่น',
      information: 'ต้องการข้อมูลเพิ่มเติม',
    } : {
      price: 'Concerned about price',
      time: 'Concerned about time',
      trust: 'Concerned about trust',
      pain: 'Concerned about pain',
      commitment: 'Not ready to decide',
      competition: 'Comparing with others',
      information: 'Needs more information',
    };

    if (isThai) {
      return `
สร้างการตอบสนองสำหรับ objection: ${(objectionTypes as any)[objection.objectionType] || objection.objectionType}

รายละเอียด objection:
- ประเภท: ${objection.objectionType}
- ความมั่นใจ: ${(objection.confidence * 100).toFixed(0)}%
- ความรุนแรง: ${objection.severity}
- keyword: ${objection.keywords.join(', ')}
- สถานการณ์: ${objection.context}

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'คุณลูกค้า'}
- ความสนใจ: ${context.programInterest?.join(', ') || 'ไม่ระบุ'}
- Program: ${context.currentProgram?.name || 'ไม่ระบุ'}
- ราคา: ${context.currentProgram?.price ? `฿${context.currentProgram.price.toLocaleString()}` : 'ไม่ระบุ'}

สร้างการตอบสนองที่:
1. แสดงความเข้าใจ (Acknowledge)
2. จัดการ objection โดยตรง
3. ให้ข้อมูลหรือทางเลือก
4. สร้างความเชื่อมั่น
5. ชักชวนให้ตัดสินใจ

ใช้ภาษาที่เป็นมิตร สุภาพ และสร้างความเชื่อถือ
`;
    }

    return `
Generate response for objection: ${(objectionTypes as any)[objection.objectionType] || objection.objectionType}

Objection Details:
- Type: ${objection.objectionType}
- Confidence: ${(objection.confidence * 100).toFixed(0)}%
- Severity: ${objection.severity}
- Keywords: ${objection.keywords.join(', ')}
- Context: ${objection.context}

Customer Info:
- Name: ${context.customerProfile?.name || 'Customer'}
- Interests: ${context.programInterest?.join(', ') || 'Not specified'}
- Program: ${context.currentProgram?.name || 'Not specified'}
- Price: ${context.currentProgram?.price ? `฿${context.currentProgram.price.toLocaleString()}` : 'Not specified'}

Generate a response that:
1. Acknowledges the concern
2. Handles the objection directly
3. Provides information or alternatives
4. Builds confidence
5. Encourages decision making

Use friendly, polite, and professional language.
`;
  }

  private buildStrategyPrompt(context: ObjectionContext, locale: 'th' | 'en' = 'th'): string {
    const isThai = locale === 'th';
    if (isThai) {
      return `
สร้างกลยุทธ์เพิ่ม conversion สำหรับลูกค้า:

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'ไม่ระบุ'}
- ความสนใจ: ${context.programInterest?.join(', ') || 'ไม่ระบุ'}
- งบประมาณ: ${context.customerProfile?.budget || 'ไม่ระบุ'}
- Lead Score: ${context.leadScore || 'ไม่ระบุ'}
- Urgency: ${context.urgency || 'ไม่ระบุ'}

กลยุทธ์ที่ควรมี:
1. การสร้างความสัมพันธ์ (Relationship building)
2. การแสดงผลลัพธ์ (Show results/Social proof)
3. การจัดการ objection (Objection handling)
4. การสร้าง urgency (Create urgency)
5. การติดตาม (Follow-up strategy)
6. การให้ส่วนลด/โปรโมชั่น (Discounts/Promotions)
7. การแนะนำแพ็คเกจ (Package suggestions)
8. การให้ข้อมูลเพิ่มเติม (Additional information)

ให้กลยุทธ์ที่เป็นรูปธรรมและนำไปปฏิบัติได้
`;
    }

    return `
Generate conversion optimization strategies for the customer:

Customer Info:
- Name: ${context.customerProfile?.name || 'Not specified'}
- Interests: ${context.programInterest?.join(', ') || 'Not specified'}
- Budget: ${context.customerProfile?.budget || 'Not specified'}
- Lead Score: ${context.leadScore || 'Not specified'}
- Urgency: ${context.urgency || 'Not specified'}

Suggested strategies:
1. Relationship building
2. Show results/Social proof
3. Objection handling
4. Create urgency
5. Follow-up strategy
6. Discounts/Promotions
7. Package suggestions
8. Additional information

Provide concrete and actionable strategies.
`;
  }

  private getFallbackResponse(objection: ObjectionAnalysis, locale: 'th' | 'en' = 'th'): ObjectionResponse {
    const isThai = locale === 'th';
    const fallbacks = isThai ? {
      price: {
        response: 'เข้าใจค่ะ ราคาเป็นเรื่องสำคัญ เรามีโปรโมชั่นและผ่อนชำระหลายทางเลือก อยากให้ดูรายละเอียดไหมคะ?',
        strategy: 'alternative' as const,
        followUpActions: ['เสนอโปรโมชั่น', 'อธิบายการผ่อนชำระ'],
        conversionProbability: 0.6,
        script: 'คุณ[ชื่อ]คะ เราเข้าใจค่ะ ราคาเป็นปัจจัยสำคัญ เรามีทางเลือกดังนี้...'
      },
      time: {
        response: 'เข้าใจค่ะ ตารางเวลาเป็นเรื่องสำคัญ เรามีเวลาการให้บริการที่หลากหลาย รวมถึงหลังเลิกงานและวันหยุด สะดวกช่วงไหนคะ?',
        strategy: 'alternative' as const,
        followUpActions: ['เสนอเวลาที่ยืดหยุ่น', 'นัดหมายล่วงหน้า'],
        conversionProbability: 0.7,
        script: 'คุณ[ชื่อ]คะ เข้าใจว่ามีงานยุ่งค่ะ แต่เรามีบริการหลังเลิกงาน...'
      },
      trust: {
        response: 'เข้าใจค่ะ ความเชื่อถือเป็นสิ่งสำคัญ เรามีแพทย์ผู้เชี่ยวชาญและลูกค้าหลายท่านที่พอใจกับผลลัพธ์ อยากให้ดูรีวิวและผลงานไหมคะ?',
        strategy: 'evidence' as const,
        followUpActions: ['แสดงผลงาน', 'แนะนำแพทย์', 'เสนอปรึกษาฟรี'],
        conversionProbability: 0.65,
        script: 'คุณ[ชื่อ]คะ เราเข้าใจความกังวลค่ะ ลองดูรีวิวจากลูกค้าจริงก่อนไหมคะ...'
      },
    } : {
      price: {
        response: 'I understand that price is an important factor. We have several promotions and flexible payment options. Would you like to see the details?',
        strategy: 'alternative' as const,
        followUpActions: ['Offer promotion', 'Explain payment plans'],
        conversionProbability: 0.6,
        script: 'Hello [Name], we understand that price is a key factor. We have the following options...'
      },
      time: {
        response: 'I understand that timing is important. We have various service times, including after-work hours and weekends. Which time works best for you?',
        strategy: 'alternative' as const,
        followUpActions: ['Offer flexible timing', 'Pre-book appointment'],
        conversionProbability: 0.7,
        script: 'Hello [Name], I understand you are busy, but we have services after work hours...'
      },
      trust: {
        response: 'I understand that trust is crucial. We have specialist doctors and many satisfied customers. Would you like to see our portfolio and reviews?',
        strategy: 'evidence' as const,
        followUpActions: ['Show portfolio', 'Introduce doctors', 'Offer free consultation'],
        conversionProbability: 0.65,
        script: 'Hello [Name], we understand your concern. Would you like to see real customer reviews first?'
      },
    };

    return (fallbacks as any)[objection.objectionType] || {
      response: isThai ? 'เข้าใจค่ะ อยากให้ชี้แจงเพิ่มเติมไหมคะ?' : 'I understand. Would you like me to clarify further?',
      strategy: 'acknowledge' as const,
      followUpActions: [],
      conversionProbability: 0.5,
      script: '',
    };
  }
}

export default AIObjectionHandler;
