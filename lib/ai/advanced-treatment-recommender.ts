// Advanced AI Treatment Recommendations
// ใช้ GPT-4 วิเคราะห์และแนะนำ treatment จริงๆ ไม่ใช่ rule-based

import { OpenAI } from 'openai';
import { getOpenAIApiKey } from '@/lib/config/ai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openai) return openai;
  openai = new OpenAI({ apiKey: getOpenAIApiKey() });
  return openai;
}

interface TreatmentRecommendation {
  treatment: string;
  price: number;
  confidence: number;
  reasoning: string;
  expectedResults: string;
  risks: string;
  alternatives: string[];
  maintenance: string;
}

export class AdvancedTreatmentRecommender {
  async recommendTreatments(
    customerProfile: any,
    skinAnalysis: any,
    budget: number,
    goals: string[]
  ): Promise<TreatmentRecommendation[]> {

    const prompt = `
    คุณคือแพทย์ผิวหนัง AI ผู้เชี่ยวชาญ ให้คำแนะนำการรักษาที่เหมาะสม

    ข้อมูลลูกค้า:
    - อายุ: ${customerProfile.age}
    - เพศ: ${customerProfile.gender}
    - ประเภทผิว: ${customerProfile.skinType}
    - ปัญหาผิว: ${customerProfile.concerns?.join(', ')}
    - การรักษาก่อนหน้า: ${customerProfile.previousTreatments?.join(', ')}
    - งบประมาณ: ${budget} บาท
    - เป้าหมาย: ${goals?.join(', ')}

    ผลการวิเคราะห์ผิว:
    - คะแนนสุขภาพผิว: ${skinAnalysis.skinHealthScore}/100
    - ปัญหาหลัก: ${skinAnalysis.primaryConcerns?.join(', ')}

    ให้คำแนะนำ 3-5 การรักษาที่เหมาะสมที่สุด โดย:
    1. จัดลำดับความเหมาะสม
    2. อธิบายเหตุผลทางการแพทย์
    3. ประเมินความเสี่ยง
    4. แนะนำการดูแลหลังรักษา
    5. เสนอทางเลือกอื่น

    คืนค่าเป็น JSON array เท่านั้น:
    [
      {
        "treatment": "ชื่อการรักษาภาษาไทย",
        "price": ราคาเป็นตัวเลข,
        "confidence": 70-100,
        "reasoning": "เหตุผลทางการแพทย์",
        "expectedResults": "ผลลัพธ์ที่คาด",
        "risks": "ความเสี่ยง",
        "alternatives": ["ทางเลือก1", "ทางเลือก2"],
        "maintenance": "การดูแลหลังรักษา"
      }
    ]
    `;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      // Clean and parse JSON
      const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
      const recommendations = JSON.parse(cleanJson);

      // Validate and enhance
      return recommendations.map((rec: any) => ({
        ...rec,
        confidence: Math.min(100, Math.max(0, rec.confidence || 80))
      }));

    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // Fallback to rule-based
      return this.fallbackRecommendations(customerProfile, budget);
    }
  }

  private fallbackRecommendations(customerProfile: any, budget: number): TreatmentRecommendation[] {
    // Enhanced fallback with medical reasoning
    const recommendations: TreatmentRecommendation[] = [];

    if (budget >= 8000 && customerProfile.concerns?.includes('wrinkles')) {
      recommendations.push({
        treatment: "โบท็อกซ์ หน้าผาก",
        price: 8900,
        confidence: 85,
        reasoning: "โบท็อกซ์ช่วยยับยั้งการทำงานของกล้ามเนื้อที่ก่อให้เกิดริ้วรอย ผลลัพธ์อยู่ได้ 3-4 เดือน",
        expectedResults: "ลดริ้วรอยหน้าผาก 80-90% ภายใน 1 สัปดาห์",
        risks: "อาจมีอาการบวมชั่วคราว ไม่พึงประสงค์ต่อผู้ตั้งครรภ์",
        alternatives: ["ไฮฟู่", "เลเซอร์"],
        maintenance: "ฉีดซ้ำทุก 3-4 เดือน"
      });
    }

    return recommendations;
  }
}
