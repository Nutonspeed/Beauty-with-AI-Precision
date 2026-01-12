import { analyzeSkinWithGemini } from "./gemini-advisor";
import { HuggingFaceAnalyzer } from "./huggingface-analyzer";
import { detectAcne, classifySkinType, detectFaceCharacteristics } from "./huggingface-client";

export interface SkinAnalysisResult {
  skinAge: number;
  skinType: string;
  concerns: Array<{
    name: string;
    severity: number;
    description: string;
  }>;
  recommendations: Array<{
    program: string;
    sessions: number;
    price: number;
    duration: string;
    expectedOutcome: string;
  }>;
  confidenceScore: number;
  provider: "gemini" | "huggingface" | "hybrid";
  specializedMetrics?: {
    acneSeverity?: string;
    acneScore?: number;
    detectedSkinType?: string;
    skinTypeConfidence?: number;
    wrinklesScore?: number;
    spotsScore?: number;
  };
  simulationData?: {
    description: string;
    expectedVisualChanges: string[];
  };
}

/**
 * Aesthetic Intelligence Hub
 * Coordinates analysis between Gemini (Vision/Logic) and Hugging Face (Specialized Detectors)
 */
export async function analyzeSkinAesthetic(
  imageBase64: string,
  userInfo?: { name?: string; age?: number }
): Promise<SkinAnalysisResult> {
  console.log("Starting Aesthetic Intelligence Analysis...");
  const startTime = Date.now();

  try {
    // 1. Primary Analysis with Gemini (Professional Aesthetic Logic)
    const geminiResult = await analyzeSkinWithGemini(imageBase64, userInfo);

    // 2. Specialized Detection with Hugging Face in parallel
    let specializedMetrics: any = {};
    
    try {
      const [acneRes, skinTypeRes, faceCharRes] = await Promise.all([
        detectAcne(imageBase64).catch(e => ({ success: false as const, error: e })),
        classifySkinType(imageBase64).catch(e => ({ success: false as const, error: e })),
        detectFaceCharacteristics(imageBase64).catch(e => ({ success: false as const, error: e }))
      ]);

      if ('result' in acneRes && acneRes.success && acneRes.result && Array.isArray(acneRes.result)) {
        const topAcne = acneRes.result[0];
        specializedMetrics.acneSeverity = topAcne.label;
        specializedMetrics.acneScore = Math.round(topAcne.score * 100);
      }

      if ('result' in skinTypeRes && skinTypeRes.success && skinTypeRes.result && Array.isArray(skinTypeRes.result)) {
        const topSkinType = skinTypeRes.result[0];
        specializedMetrics.detectedSkinType = topSkinType.label;
        specializedMetrics.skinTypeConfidence = Math.round(topSkinType.score * 100);
      }

      if ('result' in faceCharRes && faceCharRes.success && faceCharRes.result && Array.isArray(faceCharRes.result)) {
        // Look for wrinkles and spots in face characteristics
        const wrinkles = faceCharRes.result.find((r: any) => r.label.toLowerCase().includes('wrinkle'));
        const spots = faceCharRes.result.find((r: any) => r.label.toLowerCase().includes('pigment') || r.label.toLowerCase().includes('spot'));
        
        if (wrinkles) specializedMetrics.wrinklesScore = Math.round(wrinkles.score * 100);
        if (spots) specializedMetrics.spotsScore = Math.round(spots.score * 100);
      }
    } catch (hfError) {
      console.warn("Hugging Face specialized detection encountered issues:", hfError);
    }

    // 3. Generate Simulation Data (Qualitative description of the "After" state)
    const simulationData = {
      description: `จำลองผลลัพธ์หลังรับบริการโปรแกรม ${geminiResult.recommendations[0]?.program || 'ความงาม'}`,
      expectedVisualChanges: [
        "ผิวพรรณดูเรียบเนียนขึ้นสม่ำเสมอ",
        "ความเข้มของจุดด่างดำจางลงอย่างเห็นได้ชัด",
        "ริ้วรอยร่องตื้นดูตื้นขึ้น",
        "ความมันส่วนเกินบนใบหน้าสมดุลขึ้น"
      ]
    };
    
    const result: SkinAnalysisResult = {
      ...geminiResult,
      skinType: specializedMetrics.detectedSkinType || (geminiResult as any).skinType || "Normal",
      confidenceScore: 0.96,
      provider: "hybrid",
      specializedMetrics: Object.keys(specializedMetrics).length > 0 ? specializedMetrics : undefined,
      simulationData
    };

    console.log(`Analysis completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error("Aesthetic Intelligence Hub Error:", error);
    throw error;
  }
}

/**
 * Generate a visual simulation prompt for Image Gen AI
 */
export async function getSimulationPrompt(result: SkinAnalysisResult): Promise<string> {
  return `A high-resolution professional aesthetic after-program photo. 
    Skin type: ${result.skinType}. 
    Improvements: Reduced ${result.concerns.map(c => c.name).join(', ')}. 
    Result: Radiant, healthy, and youthful skin. Professional studio lighting.`;
}
