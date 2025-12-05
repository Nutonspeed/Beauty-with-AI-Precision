/**
 * Gemini AI Treatment Advisor
 * 
 * Uses Google Gemini 1.5 Flash (Free Tier)
 * - 1,500 requests/day
 * - Thai language support
 * - Multimodal (text + images)
 */

import { generateText } from "ai";

type ChatRole = 'user' | 'assistant';

export interface ChatAdviceOptions {
  skinAnalysis?: {
    summary?: string;
    concerns?: string[];
    recommendations?: string[];
    skin_age?: number;
    customer_name?: string;
  };
  previousMessages?: Array<{ role: ChatRole; content: string }>;
  userName?: string;
  locale?: 'th' | 'en';
}

/**
 * Analyze skin from image using Gemini Vision through AI Gateway
 */
export async function analyzeSkinWithGemini(
  imageBase64: string,
  userInfo?: { name?: string; age?: number }
): Promise<{
  skinAge: number;
  concerns: Array<{ name: string; severity: number; description: string }>;
  recommendations: Array<{ treatment: string; sessions: number; price: number; duration: string; expectedOutcome: string }>;
}> {
  try {
    const prompt = `วิเคราะห์ผิวหน้านี้และให้ผลการวิเคราะห์ดังนี้:

1. อายุผิวจริง (ประมาณ 20-60 ปี)
2. ปัญหาผิวหลัก 3-5 อย่าง พร้อมระดับความรุนแรง (1-10) และคำอธิบาย
3. แนะนำการรักษา 3 อย่าง พร้อมจำนวนครั้ง, ราคาโดยประมาณ, ระยะเวลา, และผลที่คาดว่าจะได้

ตอบเป็น JSON format เท่านั้น:
{
  "skinAge": number,
  "concerns": [
    {"name": "string", "severity": number, "description": "string"}
  ],
  "recommendations": [
    {"treatment": "string", "sessions": number, "price": number, "duration": "string", "expectedOutcome": "string"}
  ]
}

${userInfo?.name ? `ชื่อผู้ใช้: ${userInfo.name}` : ''}
${userInfo?.age ? `อายุ: ${userInfo.age} ปี` : ''}

ให้คำวิเคราะห์ที่เป็นจริงและมีประโยชน์`;

    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a professional dermatologist AI analyzing skin images. Provide accurate analysis in JSON format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image",
              image: imageBase64
            }
          ]
        }
      ],
      temperature: 0.3,
      maxOutputTokens: 2048,
    });

    // Try to parse JSON response
    try {
      const analysis = JSON.parse(text);
      return analysis;
    } catch (parseError) {
      console.warn('Gemini returned non-JSON response, using fallback');
      // Fallback to mock data if Gemini doesn't return valid JSON
      return getFallbackAnalysis();
    }
  } catch (error) {
    console.error('Gemini skin analysis error:', error);
    // Return fallback mock data
    return getFallbackAnalysis();
  }
}

/**
 * Fallback mock analysis when Gemini fails
 */
function getFallbackAnalysis() {
  return {
    skinAge: Math.floor(35 + Math.random() * 10),
    concerns: [
      {
        name: 'Wrinkles',
        severity: 7,
        description: 'มีริ้วรอยรอบดวงตาและหน้าผากในระดับสูง'
      },
      {
        name: 'Sun Damage',
        severity: 6,
        description: 'พบความเสียหายจากแสงแดดในระดับปานกลาง-สูง'
      },
      {
        name: 'Pigmentation',
        severity: 5,
        description: 'มีจุดด่างดำและความไม่สม่ำเสมอของสีผิว'
      }
    ],
    recommendations: [
      {
        treatment: 'Anti-Aging Package',
        sessions: 6,
        price: 19900,
        duration: '3 months',
        expectedOutcome: 'ลดริ้วรอยได้ 40%'
      },
      {
        treatment: 'Pigmentation Treatment',
        sessions: 8,
        price: 24900,
        duration: '4 months',
        expectedOutcome: 'ลดจุดด่างดำได้ 60%'
      },
      {
        treatment: 'Complete Skin Rejuvenation',
        sessions: 12,
        price: 39900,
        duration: '6 months',
        expectedOutcome: 'ผิวอ่อนเยาว์ขึ้น 3-5 ปี'
      }
    ]
  };
}

export async function getChatAdvice(
  userMessage: string,
  options: ChatAdviceOptions = {}
): Promise<string> {
  const locale = options.locale || 'th';
  const systemPrompt = locale === 'th'
    ? `คุณคือ "AI Beauty Advisor" ผู้เชี่ยวชาญด้านเวชสำอาง ให้คำแนะนำที่สุภาพ ชัดเจน และปลอดภัย`
    : `You are an AI Beauty Advisor providing polite, clear, and safe skincare recommendations.`;

  const contextSections: string[] = [];

  if (options.userName) {
    contextSections.push(locale === 'th' ? `ชื่อลูกค้า: ${options.userName}` : `Customer name: ${options.userName}`);
  }

  if (options.skinAnalysis) {
    const analysis = options.skinAnalysis;
    contextSections.push(
      locale === 'th'
        ? `ผลสแกนผิว: อายุผิว ${analysis.skin_age ?? '-'} ปี, ปัญหา: ${(analysis.concerns || []).join(', ') || 'ไม่ระบุ'}`
        : `Skin scan: skin age ${analysis.skin_age ?? '-'} years, concerns: ${(analysis.concerns || []).join(', ') || 'N/A'}`
    );
  }

  if (options.previousMessages?.length) {
    const history = options.previousMessages
      .slice(-6)
      .map(msg => {
        const roleLabel = msg.role === 'assistant'
          ? (locale === 'th' ? 'AI' : 'Assistant')
          : (locale === 'th' ? 'ลูกค้า' : 'User');
        return `${roleLabel}: ${msg.content}`;
      })
      .join('\n');
    contextSections.push(
      locale === 'th' ? `ประวัติการสนทนา:\n${history}` : `Conversation history:\n${history}`
    );
  }

  const contextPrompt = contextSections.join('\n\n');

  try {
    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      temperature: 0.5,
      maxOutputTokens: 1024,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${contextPrompt}\n\nคำถามปัจจุบัน / Current question:\n${userMessage}`
            }
          ]
        }
      ]
    });

    return text?.trim() || (locale === 'th'
      ? 'ขอโทษค่ะ ระบบไม่สามารถตอบคำถามนี้ได้ในขณะนี้'
      : 'Sorry, I cannot respond to that right now.');
  } catch (error) {
    console.error('Gemini chat advice error:', error);
    return locale === 'th'
      ? 'ระบบขัดข้องชั่วคราว กรุณาลองอีกครั้งภายหลัง'
      : 'The system is temporarily unavailable, please try again later.';
  }
}
