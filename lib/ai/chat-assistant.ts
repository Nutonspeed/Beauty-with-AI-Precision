/**
 * AI Chat Assistant
 * Provides intelligent skincare consultation with Thai language support
 */

import { EnhancedMetricsResult } from './enhanced-skin-metrics';
import { ProgramRecommendation } from './program-recommender';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    metrics?: EnhancedMetricsResult;
    recommendations?: ProgramRecommendation[];
    intent?: string;
    confidence?: number;
  };
}

/**
 * Chat Session Interface
 */
export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    latestMetrics?: EnhancedMetricsResult;
    programHistory?: string[];
    userProfile?: {
      age?: number;
      skinType?: string;
      concerns?: string[];
      budget?: number;
      allergies?: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Intent Classification
 */
type ChatIntent =
  | 'greeting'
  | 'skin_analysis'
  | 'program_inquiry'
  | 'product_recommendation'
  | 'concern_specific'
  | 'booking'
  | 'pricing'
  | 'general_info'
  | 'unknown';

/**
 * Knowledge Base Entry
 */
interface KnowledgeEntry {
  topic: string;
  keywords: string[];
  response: string;
  relatedTopics?: string[];
}

/**
 * AI Chat Assistant Class
 */
export class AIChatAssistant {
  private knowledgeBase: KnowledgeEntry[];
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase();
  }

  /**
   * Initialize Knowledge Base
   */
  private initializeKnowledgeBase(): KnowledgeEntry[] {
    return [
      // Greeting
      {
        topic: 'greeting',
        keywords: ['สวัสดี', 'หวัดดี', 'ดีครับ', 'ดีค่ะ', 'hello', 'hi'],
        response:
          'สวัสดีค่ะ! ยินดีต้อนรับสู่ AI Beauty Center 🌸 ฉันคือผู้ช่วยด้านการดูแลผิว พร้อมให้คำปรึกษาเกี่ยวกับการวิเคราะห์ผิว การรักษา และผลิตภัณฑ์ค่ะ มีอะไรให้ช่วยไหมคะ?',
        relatedTopics: ['skin_analysis', 'program_inquiry'],
      },

      // Skin Analysis
      {
        topic: 'skin_analysis',
        keywords: ['วิเคราะห์ผิว', 'ตรวจผิว', 'ดูผิว', 'analyze skin', 'check skin'],
        response:
          'การวิเคราะห์ผิวของเราใช้ AI ตรวจสอบ 8 ตัวชี้วัดหลัก:\n\n1. จุดด่างดำ (Spots) - ฝ้า กระ จุดดำ\n2. รูขุมขน (Pores) - ขนาดและความชัดเจน\n3. ริ้วรอย (Wrinkles) - ความลึกและประเภท\n4. เนื้อผิว (Texture) - ความเรียบเนียน\n5. ความแดง (Redness) - การอักเสบ\n6. ความชุ่มชื้น (Hydration)\n7. สีผิว (Skin Tone) - ความสม่ำเสมอ\n8. ความยืดหยุ่น (Elasticity)\n\nอยากให้ฉันวิเคราะห์ผิวให้ไหมคะ?',
        relatedTopics: ['program_inquiry', 'concern_specific'],
      },

      // Spots & Dark Spots
      {
        topic: 'spots',
        keywords: ['ฝ้า', 'กระ', 'จุดด่างดำ', 'spots', 'hyperpigmentation', 'จุดดำ'],
        response:
          '**จุดด่างดำและฝ้ากระ** มักเกิดจาก:\n\n• แสงแดด UV (สาเหตุหลัก)\n• ฮอร์โมน (ฝ้าครรภ์)\n• การอักเสบหลังสิว\n• อายุที่เพิ่มขึ้น\n\n**การรักษาที่แนะนำ:**\n1. Laser Program - ยิงเลเซอร์ทำลายเม็ดสี\n2. Chemical Peel - ผลัดเซลล์ผิว\n3. IPL Therapy - แสงกระตุ้นผิว\n4. Medical Skincare - ครีมยับยั้งเม็ดสี\n\n**การป้องกัน:** ใช้ครีมกันแดด SPF 50+ ทุกวัน ❗',
        relatedTopics: ['laser', 'chemical_peel', 'ipl'],
      },

      // Pores
      {
        topic: 'pores',
        keywords: ['รูขุมขน', 'ขุมขนกว้าง', 'pores', 'enlarged pores'],
        response:
          '**รูขุมขนกว้าง** เกิดจาก:\n\n• ผลิตน้ำมันมากเกินไป\n• การสูญเสียความยืดหยุ่นของผิว\n• พันธุกรรม\n• สิวที่ทำให้รูขุมขนขยาย\n\n**การรักษา:**\n1. Microneedling - กระตุ้นคอลลาเจน\n2. Chemical Peel - ลดความมันกลาง\n3. HydraFacial - ล้างรูขุมขนลึก\n4. RF Program - กระชับผิว\n\n**การดูแล:** ล้างหน้าสะอาด 2 ครั้ง/วัน + ใช้ Niacinamide 🌟',
        relatedTopics: ['microneedling', 'hydrafacial', 'rf'],
      },

      // Wrinkles
      {
        topic: 'wrinkles',
        keywords: ['ริ้วรอย', 'เหี่ยว', 'ย่น', 'wrinkles', 'fine lines', 'aging'],
        response:
          '**ริ้วรอยและเส้นเล็ก** เกิดจาก:\n\n• การสูญเสียคอลลาเจนและอีลาสติน\n• แสงแดด UV\n• การแสดงสีหน้าซ้ำๆ\n• อายุที่เพิ่มขึ้น\n• การสูบบุหรี่\n\n**การรักษา:**\n1. Botox - ผ่อนคลายกล้ามเนื้อ (ริ้วรอยแบบ dynamic)\n2. Filler - เติมเต็มริ้วรอยลึก\n3. RF Program - กระตุ้นคอลลาเจน\n4. Laser Resurfacing - ผิวใหม่\n\n**การป้องกัน:** Retinol + Vitamin C + SPF 💪',
        relatedTopics: ['botox', 'filler', 'rf', 'laser'],
      },

      // Acne
      {
        topic: 'acne',
        keywords: ['สิว', 'สิวอักเสบ', 'สิวอุดตัน', 'acne', 'pimples', 'breakout'],
        response:
          '**สิว** มีหลายประเภท:\n\n• สิวอุดตัน (Comedones) - หัวดำ/หัวขาว\n• สิวอักเสบ (Inflammatory) - แดง บวม\n• สิวหนอง (Pustular)\n• สิวซีสต์ (Cystic) - ลึก เจ็บ\n\n**การรักษา:**\n1. Medical Skincare - Retinoid, BHA, Benzoyl Peroxide\n2. Chemical Peel - ลดการอุดตัน\n3. Blue LED Therapy - ฆ่าแบคทีเรีย\n4. Laser (สำหรับรอยสิว)\n\n**หลีกเลี่ยง:** อาหารไขมันสูง นมวัว น้ำตาลมาก 🚫',
        relatedTopics: ['chemical_peel', 'led', 'medical_skincare'],
      },

      // Hydration
      {
        topic: 'hydration',
        keywords: ['แห้ง', 'ขาดน้ำ', 'ผิวแห้ง', 'dry skin', 'dehydrated', 'ความชุ่มชื้น'],
        response:
          '**ผิวขาดน้ำ** แตกต่างจากผิวแห้ง:\n\n• ผิวแห้ง = ขาดน้ำมัน (Dry)\n• ผิวขาดน้ำ = ขาดความชุ่มชื้น (Dehydrated)\n\n**สาเหตุ:**\n• อากาศร้อน แห้ง แอร์\n• ดื่มน้ำน้อย\n• สารทำความสะอาดรุนแรง\n• ฮอร์โมน\n\n**การรักษา:**\n1. HydraFacial - ให้ความชุ่มชื้นลึก\n2. Hyaluronic Acid Filler (เบาบาง)\n3. Medical Skincare - Hyaluronic Acid, Ceramide\n4. RF Program - กระตุ้นผิว\n\n**ดื่มน้ำ 2-3 ลิตร/วัน** 💧',
        relatedTopics: ['hydrafacial', 'medical_skincare'],
      },

      // Laser Program
      {
        topic: 'laser',
        keywords: ['เลเซอร์', 'laser', 'ยิงเลเซอร์'],
        response:
          '**Laser Program** มีหลายประเภท:\n\n• Q-Switch Laser - ลดฝ้า กระ จุดด่างดำ\n• Fractional CO2 - ผิวใหม่ ริ้วรอย\n• Nd:YAG - รักษาสิว รูขุมขน\n• Diode Laser - กำจัดขน\n\n**ราคา:** ฿5,000 - ฿15,000 ต่อครั้ง\n**ระยะเวลา:** 30-60 นาที\n**Downtime:** 3-7 วัน (แล้วแต่ชนิด)\n**จำนวนครั้ง:** 3-6 ครั้ง\n\n**เหมาะกับ:** ฝ้า กระ รอยสิว ริ้วรอย ผิวหมองคล้ำ',
        relatedTopics: ['spots', 'wrinkles', 'acne'],
      },

      // Chemical Peel
      {
        topic: 'chemical_peel',
        keywords: ['พีล', 'ผลัดเซลล์', 'peel', 'chemical peel'],
        response:
          '**Chemical Peel** ผลัดเซลล์ผิว:\n\n**ระดับ:**\n• Superficial (Light) - AHA, BHA, Enzyme\n• Medium - TCA 20-35%\n• Deep - TCA >50%, Phenol\n\n**ราคา:** ฿2,000 - ฿8,000\n**ระยะเวลา:** 30-45 นาที\n**Downtime:** 1-14 วัน (แล้วแต่ความลึก)\n**จำนวนครั้ง:** 4-8 ครั้ง\n\n**เหมาะกับ:** สิว รูขุมขน ฝ้า ผิวหมองคล้ำ เนื้อผิวไม่เรียบ',
        relatedTopics: ['acne', 'pores', 'texture'],
      },

      // Botox
      {
        topic: 'botox',
        keywords: ['โบท็อกซ์', 'botox', 'ริ้วรอยหน้าผาก'],
        response:
          '**Botox (Botulinum Toxin)**\n\nผ่อนคลายกล้ามเนื้อใบหน้า → ลดริ้วรอย\n\n**โซนยอดนิยม:**\n• หน้าผาก\n• ระหว่างคิ้ว (Frown Lines)\n• หางตา (Crow\'s Feet)\n• คาง\n\n**ราคา:** ฿4,000 - ฿12,000 (แล้วแต่โซน + ยูนิต)\n**ระยะเวลา:** 15-30 นาที\n**Downtime:** ไม่มี\n**ผลกินเวลา:** 3-7 วัน\n**อยู่ได้:** 3-6 เดือน\n\n**เหมาะกับ:** ริ้วรอยแบบ dynamic (จากการแสดงออก)',
        relatedTopics: ['wrinkles', 'filler'],
      },

      // Filler
      {
        topic: 'filler',
        keywords: ['ฟิลเลอร์', 'filler', 'เติมเต็ม'],
        response:
          '**Filler (Dermal Filler)**\n\nเติมเต็มปริมาตรและรูปหน้า ส่วนใหญ่ใช้ Hyaluronic Acid\n\n**โซนยอดนิยม:**\n• แก้ม (Cheek Augmentation)\n• ร่องแก้ม (Nasolabial Folds)\n• ใต้ตา (Tear Trough)\n• คาง (Chin)\n• ริมฝีปาก (Lips)\n\n**ราคา:** ฿8,000 - ฿25,000 ต่อซีซี\n**ระยะเวลา:** 30-60 นาที\n**Downtime:** 1-3 วัน (อาจบวมเล็กน้อย)\n**อยู่ได้:** 6-18 เดือน\n\n**เหมาะกับ:** ริ้วรอยลึก ใบหน้าหมองคล้ำ ต้องการเพิ่มมิติ',
        relatedTopics: ['wrinkles', 'botox'],
      },

      // HydraFacial
      {
        topic: 'hydrafacial',
        keywords: ['ไฮดราเฟเชียล', 'hydrafacial', 'ล้างหน้าลึก'],
        response:
          '**HydraFacial**\n\nทำความสะอาดผิวลึก + ให้ความชุ่มชื้น (ไม่เจ็บ ไม่มี downtime)\n\n**ขั้นตอน:**\n1. ทำความสะอาดและ Exfoliate\n2. ดูดสิ่งสกปรกออกจากรูขุมขน (Extraction)\n3. ให้ความชุ่มชื้นและ Serum\n4. ป้องกันด้วย Antioxidant\n\n**ราคา:** ฿2,500 - ฿6,000\n**ระยะเวลา:** 30-45 นาที\n**Downtime:** ไม่มี\n**ความถี่:** เดือนละ 1-2 ครั้ง\n\n**เหมาะกับ:** ทุกสภาพผิว รูขุมขนอุดตัน ผิวแห้ง ผิวหมองคล้ำ',
        relatedTopics: ['pores', 'hydration'],
      },

      // IPL
      {
        topic: 'ipl',
        keywords: ['ไอพีแอล', 'ipl', 'intense pulsed light'],
        response:
          '**IPL (Intense Pulsed Light)**\n\nใช้แสงหลายความยาวคลื่น → รักษาได้หลายปัญหา\n\n**รักษาอะไรได้:**\n• ฝ้า กระ จุดด่างดำ\n• ความแดง หลอดเลือดฝอย\n• รูขุมขน\n• สีผิวไม่สม่ำเสมอ\n\n**ราคา:** ฿4,000 - ฿10,000 ต่อครั้ง\n**ระยะเวลา:** 30-45 นาที\n**Downtime:** 1-3 วัน\n**จำนวนครั้ง:** 4-6 ครั้ง\n\n**เหมาะกับ:** ผิวที่มีปัญหาหลายอย่างพร้อมกัน',
        relatedTopics: ['spots', 'redness', 'pores'],
      },

      // RF Program
      {
        topic: 'rf',
        keywords: ['อาร์เอฟ', 'rf', 'radiofrequency', 'กระชับผิว'],
        response:
          '**RF (Radiofrequency)**\n\nคลื่นความถี่วิทยุ → ความร้อน → กระตุ้นคอลลาเจน\n\n**ประโยชน์:**\n• กระชับผิว (Face Lifting)\n• ลดริ้วรอย\n• กระชับรูขุมขน\n• ลดไขมันใบหน้า\n\n**ราคา:** ฿5,000 - ฿15,000 ต่อครั้ง\n**ระยะเวลา:** 45-60 นาที\n**Downtime:** ไม่มี - 1 วัน\n**จำนวนครั้ง:** 4-8 ครั้ง\n**เห็นผล:** 2-3 เดือนหลังทำครบ\n\n**เหมาะกับ:** ผิวเริ่มหย่อนคล้อย อายุ 30+',
        relatedTopics: ['wrinkles', 'elasticity', 'pores'],
      },

      // LED Therapy
      {
        topic: 'led',
        keywords: ['แอลอีดี', 'led', 'light therapy', 'แสง'],
        response:
          '**LED Light Therapy**\n\nใช้แสงต่างสี → รักษาปัญหาต่างกัน\n\n**สีต่างๆ:**\n• แดง (Red 630-700nm) - กระตุ้นคอลลาเจน ลดริ้วรอย\n• น้ำเงิน (Blue 400-470nm) - ฆ่าแบคทีเรียสิว\n• เขียว (Green 520-560nm) - ลดจุดด่างดำ\n• เหลือง (Yellow 570-590nm) - ลดการอักเสบ\n\n**ราคา:** ฿1,000 - ฿3,000 ต่อครั้ง\n**ระยะเวลา:** 20-30 นาที\n**Downtime:** ไม่มี\n**ความถี่:** สัปดาห์ละ 2-3 ครั้ง\n\n**เหมาะกับ:** ทุกสภาพผิว ไม่มีอาการแพ้',
        relatedTopics: ['acne', 'wrinkles', 'spots'],
      },

      // Medical Skincare
      {
        topic: 'medical_skincare',
        keywords: ['ครีม', 'skincare', 'ผลิตภัณฑ์', 'บำรุง'],
        response:
          '**Medical Skincare**\n\nผลิตภัณฑ์เกรดคลินิก ความเข้มข้นสูง\n\n**สารสำคัญ:**\n• Retinoid (Tretinoin) - ลดริ้วรอย สิว\n• Hydroquinone - ยับยั้งเม็ดสี\n• Vitamin C - Antioxidant ลดฝ้า\n• Niacinamide - ลดรูขุมขน ความมัน\n• Hyaluronic Acid - ความชุ่มชื้น\n• Peptides - กระตุ้นคอลลาเจน\n\n**ราคา:** ฿2,000 - ฿8,000 ต่อผลิตภัณฑ์\n\n**ต้องปรึกษาแพทย์:** Retinoid, Hydroquinone (ใช้ระยะยาว)',
        relatedTopics: ['acne', 'spots', 'wrinkles', 'hydration'],
      },

      // Pricing General
      {
        topic: 'pricing',
        keywords: ['ราคา', 'ค่าใช้จ่าย', 'price', 'cost', 'เท่าไหร่'],
        response:
          '**สรุปราคาทรีทเมนท์:**\n\n💰 ราคาเริ่มต้น:\n• LED Therapy: ฿1,000-3,000\n• Chemical Peel: ฿2,000-8,000\n• HydraFacial: ฿2,500-6,000\n• Medical Skincare: ฿2,000-8,000\n• Microneedling: ฿3,000-10,000\n• Botox: ฿4,000-12,000\n• IPL: ฿4,000-10,000\n• Laser: ฿5,000-15,000\n• RF Program: ฿5,000-15,000\n• Filler: ฿8,000-25,000\n\n**แพ็คเกจ:** มักถูกกว่า 10-30%\n**ปรึกษาฟรี:** ทุกทรีทเมนท์',
      },

      // Booking
      {
        topic: 'booking',
        keywords: ['จอง', 'นัด', 'appointment', 'booking', 'ปรึกษา'],
        response:
          '**การนัดหมาย**\n\nคุณสามารถนัดหมายได้หลายช่องทาง:\n\n📅 ออนไลน์:\n• เว็บไซต์ของเรา (ระบบอัตโนมัติ)\n• LINE Official\n\n📞 โทรศัพท์:\n• 02-XXX-XXXX (จ-ส 9:00-19:00)\n\n**ขั้นตอน:**\n1. เลือกสาขาและบริการ\n2. เลือกวันและเวลา\n3. กรอกข้อมูลส่วนตัว\n4. รอการยืนยันจากคลินิก\n\n**ปรึกษาฟรี** ทุกทรีทเมนท์ 🎁',
      },

      // Default Response
      {
        topic: 'default',
        keywords: [],
        response:
          'ขออภัยค่ะ ฉันไม่แน่ใจว่าเข้าใจคำถามของคุณถูกต้อง คุณต้องการทราบเกี่ยวกับ:\n\n• การวิเคราะห์ผิว 🔬\n• ทรีทเมนท์และการรักษา 💉\n• ผลิตภัณฑ์ดูแลผิว 🧴\n• ราคาและโปรโมชัน 💰\n• การนัดหมาย 📅\n\nกรุณาเลือกหัวข้อที่สนใจ หรือถามคำถามใหม่ค่ะ',
      },
    ];
  }

  /**
   * Classify User Intent
   */
  private classifyIntent(message: string): { intent: ChatIntent; confidence: number } {
    const lowerMessage = message.toLowerCase();

    // Check each knowledge category
    for (const entry of this.knowledgeBase) {
      for (const keyword of entry.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          // Calculate confidence based on keyword match
          const words = lowerMessage.split(/\s+/);
          const matchCount = words.filter((word) =>
            entry.keywords.some((kw) => kw.toLowerCase().includes(word))
          ).length;
          const confidence = Math.min(0.9, 0.5 + matchCount * 0.1);

          return {
            intent: entry.topic as ChatIntent,
            confidence,
          };
        }
      }
    }

    return { intent: 'unknown', confidence: 0.3 };
  }

  /**
   * Generate Response
   */
  async generateResponse(
    userMessage: string,
    context?: {
      metrics?: EnhancedMetricsResult;
      recommendations?: ProgramRecommendation[];
    }
  ): Promise<ChatMessage> {
    // Classify intent
    const { intent, confidence } = this.classifyIntent(userMessage);

    // Find knowledge entry
    let responseText = '';
    const entry = this.knowledgeBase.find((e) => e.topic === intent);
    
    if (entry) {
      responseText = entry.response;

      // Add context-specific information
      if (context?.metrics && intent !== 'greeting') {
        responseText += this.addMetricsContext(context.metrics, intent);
      }

      if (context?.recommendations && (intent === 'program_inquiry' || intent === 'concern_specific')) {
        responseText += this.addRecommendationsContext(context.recommendations);
      }
    } else {
      // Default response
      const defaultEntry = this.knowledgeBase.find((e) => e.topic === 'default');
      responseText = defaultEntry?.response || 'ขออภัยค่ะ ไม่เข้าใจคำถาม';
    }

    // Create response message
    const response: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
      metadata: {
        intent,
        confidence,
        metrics: context?.metrics,
        recommendations: context?.recommendations,
      },
    };

    return response;
  }

  /**
   * Add Metrics Context to Response
   */
  private addMetricsContext(metrics: EnhancedMetricsResult, intent: string): string {
    let contextText = '\n\n**จากผลวิเคราะห์ของคุณ:**\n';

    // Overall health
    contextText += `\n📊 สุขภาพผิวโดยรวม: ${metrics.overallHealth.score.toFixed(1)}/100 (${metrics.overallHealth.grade})`;

    // Add concern-specific context
    if (intent.includes('spot') || intent === 'spots') {
      contextText += `\n• จุดด่างดำ: ${metrics.spots.score.toFixed(1)}/100`;
      contextText += `\n• พบ ${metrics.spots.count} จุด (${metrics.spots.distribution})`;
    }

    if (intent.includes('pore') || intent === 'pores') {
      contextText += `\n• รูขุมขน: ${metrics.pores.score.toFixed(1)}/100`;
      contextText += `\n• พบ ${metrics.pores.count} รู (${metrics.pores.visibility})`;
    }

    if (intent.includes('wrinkle') || intent === 'wrinkles') {
      contextText += `\n• ริ้วรอย: ${metrics.wrinkles.score.toFixed(1)}/100`;
      contextText += `\n• พบ ${metrics.wrinkles.count} เส้น บริเวณ ${metrics.wrinkles.areas.join(', ')}`;
    }

    if (intent.includes('hydration')) {
      contextText += `\n• ความชุ่มชื้น: ${metrics.hydration.score.toFixed(1)}/100`;
      contextText += `\n• ระดับ: ${metrics.hydration.confidence.toFixed(2)}`;
    }

    return contextText;
  }

  /**
   * Add Recommendations Context to Response
   */
  private addRecommendationsContext(recommendations: ProgramRecommendation[]): string {
    if (recommendations.length === 0) return '';

    let contextText = '\n\n**ทรีทเมนท์ที่แนะนำสำหรับคุณ:**\n';

    // Top 3 recommendations
    const topRecommendations = recommendations.slice(0, 3);
    topRecommendations.forEach((rec, index) => {
      contextText += `\n${index + 1}. **${rec.name}** (ความมั่นใจ ${(rec.confidence * 100).toFixed(0)}%)`;
      contextText += `\n   • ราคา: ฿${rec.cost.min.toLocaleString()} - ฿${rec.cost.max.toLocaleString()}`;
      contextText += `\n   • ${rec.reasoning.substring(0, 100)}...`;
    });

    return contextText;
  }

  /**
   * Create Chat Session
   */
  createSession(userId: string): ChatSession {
    return {
      id: `session_${Date.now()}`,
      userId,
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Add Message to History
   */
  addToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);
    // Keep only last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get Conversation History
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear History
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Stream Response (for real-time typing effect)
   */
  async *streamResponse(message: string): AsyncGenerator<string, void, unknown> {
    const response = await this.generateResponse(message);
    const words = response.content.split(' ');

    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay between words
    }
  }
}

export default AIChatAssistant;
