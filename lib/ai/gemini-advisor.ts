/**
 * Gemini AI Treatment Advisor
 * 
 * Uses Google Gemini 1.5 Flash (Free Tier)
 * - 1,500 requests/day
 * - Thai language support
 * - Multimodal (text + images)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use any for now - will integrate with specific types later
type SkinAnalysis = {
  spots_count?: number;
  pores_count?: number;
  wrinkles_count?: number;
  texture_score?: number;
  redness_score?: number;
  overall_score?: number;
} | null;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});

interface ChatContext {
  skinAnalysis?: SkinAnalysis | null;
  previousMessages?: { role: 'user' | 'assistant'; content: string }[];
  userName?: string;
  age?: number;
  budget?: number;
}

/**
 * Get AI treatment advice based on user question
 */
export async function getChatAdvice(
  userMessage: string,
  context: ChatContext = {}
): Promise<string> {
  try {
    const prompt = buildPrompt(userMessage, context);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('ไม่สามารถติดต่อ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
  }
}

/**
 * Build context-aware prompt
 */
function buildPrompt(message: string, context: ChatContext): string {
  const parts: string[] = [];
  
  // System prompt
  parts.push(`คุณคือ "AI Beauty Advisor" ที่ปรึกษาด้านความงามผิวหน้า

บทบาท:
- ให้คำแนะนำการรักษาผิวหน้าแบบมืออาชีพ
- ตอบเป็นภาษาไทยที่เป็นกันเอง แต่ให้ข้อมูลครบถ้วน
- อธิบายง่ายๆ เข้าใจง่าย
- แนะนำ Treatment ที่เหมาะสมกับงบประมาณ

ข้อจำกัดสำคัญ:
- ⚠️ ไม่วินิจฉัยโรค (ต้องให้แพทย์ผิวหนังวินิจฉัยเท่านั้น)
- ⚠️ ไม่ระบุชื่อยี่ห้อยาหรือผลิตภัณฑ์เฉพาะ
- ✅ แนะนำให้ปรึกษาคลินิกถ้าปัญหารุนแรงหรือไม่แน่ใจ
- ✅ ให้ข้อมูลทั่วไปเกี่ยวกับ Treatment ต่างๆ
`);

  // Add skin analysis context
  if (context.skinAnalysis) {
    const analysis = context.skinAnalysis;
    parts.push(`\nผลวิเคราะห์ผิวของผู้ใช้:
- ฝ้า-กระ: ${analysis.spots_count || 0} จุด (ความรุนแรง: ${getSeverity(analysis.spots_count || 0)})
- รูขุมขน: ${analysis.pores_count || 0} จุด
- ริ้วรอย: ${analysis.wrinkles_count || 0} เส้น
- เนื้อผิว: ${analysis.texture_score || 0}/100
- ความแดง: ${analysis.redness_score || 0}/100
- คะแนนรวม: ${analysis.overall_score || 0}/100
`);
  }

  // Add user info
  if (context.userName) {
    parts.push(`\nชื่อผู้ใช้: ${context.userName}`);
  }
  if (context.age) {
    parts.push(`อายุ: ${context.age} ปี`);
  }
  if (context.budget) {
    parts.push(`งบประมาณ: ${context.budget.toLocaleString()} บาท`);
  }

  // Add chat history (last 3 messages)
  if (context.previousMessages && context.previousMessages.length > 0) {
    parts.push('\nประวัติการสนทนา:');
    context.previousMessages.slice(-3).forEach(msg => {
      parts.push(`${msg.role === 'user' ? 'ผู้ใช้' : 'AI'}: ${msg.content}`);
    });
  }

  // Add current question
  parts.push(`\nคำถามปัจจุบัน: ${message}`);
  parts.push('\nคำตอบ (ภาษาไทย, ประมาณ 150-300 คำ):');

  return parts.join('\n');
}

/**
 * Determine severity level
 */
function getSeverity(count: number): string {
  if (count < 10) return 'เล็กน้อย';
  if (count < 30) return 'ปานกลาง';
  if (count < 50) return 'ค่อนข้างมาก';
  return 'มาก';
}

/**
 * Get treatment recommendations with image
 */
export async function getRecommendationsWithImage(
  imageBase64: string,
  question: string
): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([
      `คุณคือผู้เชี่ยวชาญด้านผิวหน้า วิเคราะห์รูปภาพและตอบคำถาม: ${question}
      
      ให้คำแนะนำเป็นภาษาไทย แต่ห้ามวินิจฉัยโรค (แนะนำให้ปรึกษาแพทย์ถ้าจำเป็น)`,
      imagePart
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    throw new Error('ไม่สามารถวิเคราะห์รูปภาพได้');
  }
}
