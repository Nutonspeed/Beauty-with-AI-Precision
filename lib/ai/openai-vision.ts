/**
 * Google Gemini 2.0 Flash Vision API Service
 * ใช้สำหรับวิเคราะห์ผิวหน้าเชิงลึก (ฟรี 1,500 requests/วัน)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '@/lib/config/ai';

const GEMINI_MODEL_ID = 'gemini-2.0-flash-exp';

function createGeminiModel() {
  const apiKey = getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL_ID,
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    },
  });
}

export interface SkinAnalysisResult {
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  concerns: Array<'acne' | 'wrinkles' | 'dark_spots' | 'large_pores' | 'redness' | 'dullness'>;
  severity: {
    acne?: number;
    wrinkles?: number;
    dark_spots?: number;
    large_pores?: number;
    redness?: number;
    dullness?: number;
  };
  recommendations: Array<{
    category: string;
    product: string;
    reason: string;
  }>;
  treatmentPlan?: string;
  confidence: number;
}

/**
 * Prompt สำหรับวิเคราะห์ผิวหน้า
 */
const SKIN_ANALYSIS_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านผิวหนังและความงามระดับมืออาชีพ วิเคราะห์รูปภาพใบหน้าที่ให้มา และตอบเป็น JSON format ตามโครงสร้างด้านล่าง:

{
  "skinType": "oily" | "dry" | "combination" | "normal" | "sensitive",
  "concerns": ["acne", "wrinkles", "dark_spots", "large_pores", "redness", "dullness"],
  "severity": {
    "acne": 1-10,
    "wrinkles": 1-10,
    "dark_spots": 1-10,
    "large_pores": 1-10,
    "redness": 1-10,
    "dullness": 1-10
  },
  "recommendations": [
    {
      "category": "cleanser" | "serum" | "moisturizer" | "treatment",
      "product": "ชื่อผลิตภัณฑ์หรือส่วนผสมที่แนะนำ",
      "reason": "เหตุผลที่แนะนำ"
    }
  ],
  "treatmentPlan": "แผนการรักษาที่แนะนำ",
  "confidence": 0-1
}

วิเคราะห์อย่างละเอียด:
1. ประเภทผิว (Skin Type): ดูจากความมันวาว, ความแห้ง, และลักษณะของรูขุมขน
2. ปัญหาผิว (Concerns): ตรวจหาทุกปัญหาที่มองเห็น
3. ระดับความรุนแรง (Severity): ให้คะแนน 1-10 (1=เล็กน้อย, 10=รุนแรงมาก)
4. คำแนะนำ (Recommendations): แนะนำผลิตภัณฑ์และส่วนผสมที่เหมาะสม
5. แผนการรักษา (Treatment Plan): แนะนำขั้นตอนการดูแลผิว

ตอบเป็น JSON เท่านั้น ไม่ต้องมีข้อความอธิบายเพิ่มเติม`;

/**
 * วิเคราะห์ผิวหน้าด้วย Gemini 2.0 Flash Vision
 */
export async function analyzeSkinWithAI(
  imageInput: string | Buffer,
  _options?: {
    language?: 'th' | 'en';
    detailLevel?: 'basic' | 'detailed';
  }
): Promise<SkinAnalysisResult> {
  try {
    const model = createGeminiModel();

    // Handle both URL and Buffer inputs
    let base64Image: string;
    
    if (Buffer.isBuffer(imageInput)) {
      // Direct Buffer input
      base64Image = imageInput.toString('base64');
    } else if (imageInput.startsWith('data:image')) {
      // Data URL (base64)
      base64Image = imageInput.replace(/^data:image\/\w+;base64,/, '');
    } else if (imageInput.startsWith('http')) {
      // URL - fetch it
      const imageResponse = await fetch(imageInput);
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString('base64');
    } else {
      // Assume it's already base64
      base64Image = imageInput;
    }

    // Prepare vision content
    const prompt = SKIN_ANALYSIS_PROMPT;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response (remove markdown code blocks if present)
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysisResult = JSON.parse(jsonContent) as SkinAnalysisResult;

    // Validate result
    if (!analysisResult.skinType || !analysisResult.concerns) {
      throw new Error('Invalid response format from Gemini');
    }

    return analysisResult;
  } catch (error) {
    console.error('Gemini Vision analysis error:', error);
    throw new Error('Failed to analyze skin with Gemini Vision');
  }
}

/**
 * วิเคราะห์ผิวหน้าแบบเร็ว (สำหรับ demo)
 */
export async function quickSkinAnalysis(imageInput: string | Buffer): Promise<{
  skinType: string;
  mainConcerns: string[];
  quickTips: string[];
}> {
  try {
    const model = createGeminiModel();

    // Handle both URL and Buffer inputs
    let base64Image: string;
    
    if (Buffer.isBuffer(imageInput)) {
      base64Image = imageInput.toString('base64');
    } else if (imageInput.startsWith('data:image')) {
      base64Image = imageInput.replace(/^data:image\/\w+;base64,/, '');
    } else if (imageInput.startsWith('http')) {
      const imageResponse = await fetch(imageInput);
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString('base64');
    } else {
      base64Image = imageInput;
    }

    const prompt = `วิเคราะห์รูปภาพใบหน้านี้และบอก:
1. ประเภทผิว (oily/dry/combination/normal/sensitive)
2. ปัญหาหลัก 3 อันดับแรก
3. คำแนะนำเบื้องต้น 3 ข้อ

ตอบสั้นๆ เป็น JSON:
{
  "skinType": "...",
  "mainConcerns": ["...", "...", "..."],
  "quickTips": ["...", "...", "..."]
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response (remove markdown code blocks if present)
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Quick analysis error:', error);
    throw new Error('Failed to perform quick analysis');
  }
}
