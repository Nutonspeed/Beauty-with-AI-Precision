/**
 * AI Objection Handler
 * Intelligent objection detection and handling for sales conversations
 * Uses GPT-4 for contextual objection analysis and response generation
 */

import OpenAI from 'openai';

interface ObjectionContext {
  customerProfile?: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    concerns?: string[];
    budget?: 'low' | 'medium' | 'high' | 'premium';
    previousTreatments?: string[];
  };
  treatmentInterest?: string[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentTreatment?: {
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
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Detect objections in user message
   */
  async detectObjection(message: string, context: ObjectionContext): Promise<ObjectionAnalysis> {
    try {
      const prompt = this.buildDetectionPrompt(message, context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert sales objection analyzer for a beauty clinic. Analyze the user's message and classify any objections with high accuracy.

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
    context: ObjectionContext
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
      const prompt = this.buildResponsePrompt(objection, context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a master sales closer for a premium beauty clinic. Generate empathetic, persuasive responses to handle customer objections.

Focus on:
- Building trust and rapport
- Addressing concerns directly
- Providing value and social proof
- Creating urgency without pressure
- Using Thai language appropriately

Return JSON in this format:
{
  "response": "natural conversational response in Thai",
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
        response: result.response || 'ขออภัยค่ะ ฉันไม่เข้าใจความกังวลของคุณ',
        strategy: result.strategy || 'acknowledge',
        followUpActions: result.followUpActions || [],
        conversionProbability: result.conversionProbability || 0.5,
        script: result.script || '',
      };
    } catch (error) {
      console.error('Objection handling failed:', error);
      return this.getFallbackResponse(objection);
    }
  }

  /**
   * Get conversion optimization strategies
   */
  async getConversionStrategies(context: ObjectionContext): Promise<string[]> {
    try {
      const prompt = this.buildStrategyPrompt(context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a sales optimization expert for beauty clinics. Provide specific, actionable strategies to increase conversion rates.

Return JSON array of strategy strings in Thai.`
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

  private buildDetectionPrompt(message: string, context: ObjectionContext): string {
    return `
วิเคราะห์ข้อความของลูกค้าและตรวจสอบ objection:

ข้อความลูกค้า: "${message}"

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'ไม่ระบุ'}
- อายุ: ${context.customerProfile?.age || 'ไม่ระบุ'}
- ความสนใจ: ${context.treatmentInterest?.join(', ') || 'ไม่ระบุ'}
- งบประมาณ: ${context.customerProfile?.budget || 'ไม่ระบุ'}
- Treatment ปัจจุบัน: ${context.currentTreatment?.name || 'ไม่ระบุ'}
- ราคา: ${context.currentTreatment?.price ? `฿${context.currentTreatment.price.toLocaleString()}` : 'ไม่ระบุ'}
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

  private buildResponsePrompt(objection: ObjectionAnalysis, context: ObjectionContext): string {
    const objectionTypes = {
      price: 'กังวลเรื่องราคา',
      time: 'กังวลเรื่องเวลา',
      trust: 'กังวลเรื่องความเชื่อถือ',
      pain: 'กังวลเรื่องความเจ็บปวด',
      commitment: 'ยังไม่พร้อมตัดสินใจ',
      competition: 'เปรียบเทียบกับที่อื่น',
      information: 'ต้องการข้อมูลเพิ่มเติม',
    };

    return `
สร้างการตอบสนองสำหรับ objection: ${objectionTypes[objection.objectionType] || objection.objectionType}

รายละเอียด objection:
- ประเภท: ${objection.objectionType}
- ความมั่นใจ: ${(objection.confidence * 100).toFixed(0)}%
- ความรุนแรง: ${objection.severity}
- keyword: ${objection.keywords.join(', ')}
- สถานการณ์: ${objection.context}

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'คุณลูกค้า'}
- ความสนใจ: ${context.treatmentInterest?.join(', ') || 'ไม่ระบุ'}
- Treatment: ${context.currentTreatment?.name || 'ไม่ระบุ'}
- ราคา: ${context.currentTreatment?.price ? `฿${context.currentTreatment.price.toLocaleString()}` : 'ไม่ระบุ'}

สร้างการตอบสนองที่:
1. แสดงความเข้าใจ (Acknowledge)
2. จัดการ objection โดยตรง
3. ให้ข้อมูลหรือทางเลือก
4. สร้างความเชื่อมั่น
5. ชักชวนให้ตัดสินใจ

ใช้ภาษาที่เป็นมิตร สุภาพ และสร้างความเชื่อถือ
`;
  }

  private buildStrategyPrompt(context: ObjectionContext): string {
    return `
สร้างกลยุทธ์เพิ่ม conversion สำหรับลูกค้า:

ข้อมูลลูกค้า:
- ชื่อ: ${context.customerProfile?.name || 'ไม่ระบุ'}
- ความสนใจ: ${context.treatmentInterest?.join(', ') || 'ไม่ระบุ'}
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

  private getFallbackResponse(objection: ObjectionAnalysis): ObjectionResponse {
    const fallbacks = {
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
    };

    return fallbacks[objection.objectionType] || {
      response: 'เข้าใจค่ะ อยากให้ชี้แจงเพิ่มเติมไหมคะ?',
      strategy: 'acknowledge' as const,
      followUpActions: [],
      conversionProbability: 0.5,
      script: '',
    };
  }
}

export default AIObjectionHandler;
