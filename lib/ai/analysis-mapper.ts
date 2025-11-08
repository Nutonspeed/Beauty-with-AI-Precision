import type { EnsembleAnalysisResult } from "./multi-model-analyzer"

// Shared helpers for grading and descriptions
export function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

export function getWrinkleDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Excellent skin condition. Minimal fine lines detected." : "สภาพผิวยอดเยี่ยม ตรวจพบริ้วรอยน้อยมาก"
  }
  if (score >= 70) {
    return lang === "en"
      ? "Fine lines visible around eyes and forehead. Good skin elasticity maintained."
      : "มีริ้วรอยเล็กน้อยรอบดวงตาและหน้าผาก ความยืดหยุ่นของผิวยังดี"
  }
  return lang === "en" ? "Moderate wrinkles detected. Consider anti-aging treatments." : "พบริ้วรอยปานกลาง แนะนำการรักษาต้านริ้วรอย"
}

export function getSpotsDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Clear skin with minimal pigmentation." : "ผิวใส มีจุดด่างดำน้อยมาก"
  }
  if (score >= 70) {
    return lang === "en"
      ? "Some pigmentation and age spots detected. Recommend brightening treatments."
      : "พบจุดด่างดำและฝ้าบางส่วน แนะนำการรักษาเพื่อปรับสีผิว"
  }
  return lang === "en" ? "Multiple dark spots detected. Brightening treatment recommended." : "พบจุดด่างดำหลายจุด แนะนำการรักษาเพื่อผิวกระจ่างใส"
}

export function getPoresDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Excellent pore condition. Very fine pores." : "สภาพรูขุมขนยอดเยี่ยม รูขุมขนละเอียดมาก"
  }
  if (score >= 70) {
    return lang === "en" ? "Pores slightly visible in T-zone. Overall good pore condition." : "รูขุมขนมองเห็นเล็กน้อยบริเวณ T-zone สภาพรูขุมขนโดยรวมดี"
  }
  return lang === "en" ? "Enlarged pores detected. Pore tightening treatment recommended." : "พบรูขุมขนกว้าง แนะนำการรักษาเพื่อกระชับรูขุมขน"
}

export function getTextureDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en"
      ? "Smooth skin texture with minimal roughness. Excellent condition."
      : "พื้นผิวผิวเรียบเนียนมีความขรุขระน้อยมาก สภาพดีเยี่ยม"
  }
  if (score >= 70) {
    return lang === "en" ? "Good skin texture. Some minor uneven areas detected." : "พื้นผิวผิวดี พบบริเวณที่ไม่เรียบเล็กน้อย"
  }
  return lang === "en" ? "Rough skin texture detected. Resurfacing treatment recommended." : "พบพื้นผิวผิวขรุขระ แนะนำการรักษาเพื่อปรับผิว"
}

export function getEvennessDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Very even skin tone throughout." : "สีผิวสม่ำเสมอมาก"
  }
  if (score >= 70) {
    return lang === "en" ? "Mild uneven skin tone. Some areas of hyperpigmentation noted." : "สีผิวไม่สม่ำเสมอเล็กน้อย พบบริเวณที่มีเม็ดสีเข้มขึ้นบางส่วน"
  }
  return lang === "en" ? "Uneven skin tone. Color correction treatment recommended." : "สีผิวไม่สม่ำเสมอ แนะนำการรักษาเพื่อปรับสีผิว"
}

export function getFirmnessDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Excellent skin firmness and elasticity." : "ความกระชับและยืดหยุ่นของผิวยอดเยี่ยม"
  }
  if (score >= 70) {
    return lang === "en" ? "Good skin firmness and elasticity. Minimal sagging observed." : "ความกระชับและยืดหยุ่นของผิวดี มีความหย่อนคล้อยน้อยมาก"
  }
  return lang === "en" ? "Loss of firmness detected. Skin tightening treatment recommended." : "พบการสูญเสียความกระชับ แนะนำการรักษาเพื่อกระชับผิว"
}

export function getRadianceDescription(score: number, lang: "en" | "th"): string {
  if (score >= 85) {
    return lang === "en" ? "Radiant and glowing skin." : "ผิวกระจ่างใสและเปล่งปลั่ง"
  }
  if (score >= 70) {
    return lang === "en" ? "Skin appears slightly dull. Could benefit from brightening treatments." : "ผิวดูหมองคล้ำเล็กน้อย อาจได้รับประโยชน์จากการบำรุงเพื่อเพิ่มความกระจ่างใส"
  }
  return lang === "en" ? "Dull skin detected. Brightening treatment highly recommended." : "พบผิวหมองคล้ำ แนะนำการรักษาเพื่อผิวกระจ่างใสอย่างยิ่ง"
}

// Map pre-analyzed browser result into API response shape
export function mapBrowserResultToAnalysis(result: any, tier: string) {
  return {
    overall_score: result.skinAnalysis.overallScore,
    image_url: undefined,
    metrics: {
      wrinkles: {
        score: result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles,
        grade:
          result.skinAnalysis.visiaMetrics.wrinkles?.grade ??
          getGrade(result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles),
  trend: result.skinAnalysis.visiaMetrics.wrinkles?.trend ?? "stable",
        description_en: getWrinkleDescription(
          result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles,
          "en",
        ),
        description_th: getWrinkleDescription(
          result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles,
          "th",
        ),
      },
      spots: {
        score: result.skinAnalysis.visiaMetrics.spots?.score ?? result.skinAnalysis.visiaMetrics.spots,
        grade:
          result.skinAnalysis.visiaMetrics.spots?.grade ??
          getGrade(result.skinAnalysis.visiaMetrics.spots?.score ?? result.skinAnalysis.visiaMetrics.spots),
  trend: result.skinAnalysis.visiaMetrics.spots?.trend ?? "stable",
        description_en: getSpotsDescription(
          result.skinAnalysis.visiaMetrics.spots?.score ?? result.skinAnalysis.visiaMetrics.spots,
          "en",
        ),
        description_th: getSpotsDescription(
          result.skinAnalysis.visiaMetrics.spots?.score ?? result.skinAnalysis.visiaMetrics.spots,
          "th",
        ),
      },
      pores: {
        score: result.skinAnalysis.visiaMetrics.pores?.score ?? result.skinAnalysis.visiaMetrics.pores,
        grade:
          result.skinAnalysis.visiaMetrics.pores?.grade ??
          getGrade(result.skinAnalysis.visiaMetrics.pores?.score ?? result.skinAnalysis.visiaMetrics.pores),
  trend: result.skinAnalysis.visiaMetrics.pores?.trend ?? "stable",
        description_en: getPoresDescription(
          result.skinAnalysis.visiaMetrics.pores?.score ?? result.skinAnalysis.visiaMetrics.pores,
          "en",
        ),
        description_th: getPoresDescription(
          result.skinAnalysis.visiaMetrics.pores?.score ?? result.skinAnalysis.visiaMetrics.pores,
          "th",
        ),
      },
      texture: {
        score: result.skinAnalysis.visiaMetrics.texture?.score ?? result.skinAnalysis.visiaMetrics.texture,
        grade:
          result.skinAnalysis.visiaMetrics.texture?.grade ??
          getGrade(result.skinAnalysis.visiaMetrics.texture?.score ?? result.skinAnalysis.visiaMetrics.texture),
  trend: result.skinAnalysis.visiaMetrics.texture?.trend ?? "stable",
        description_en: getTextureDescription(
          result.skinAnalysis.visiaMetrics.texture?.score ?? result.skinAnalysis.visiaMetrics.texture,
          "en",
        ),
        description_th: getTextureDescription(
          result.skinAnalysis.visiaMetrics.texture?.score ?? result.skinAnalysis.visiaMetrics.texture,
          "th",
        ),
      },
      evenness: {
        score:
          result.skinAnalysis.visiaMetrics.evenness?.score ??
          result.skinAnalysis.visiaMetrics.evenness ??
          100 - (result.skinAnalysis.visiaMetrics.brownSpots?.score ?? result.skinAnalysis.visiaMetrics.brownSpots ?? 0),
        grade: getGrade(
          result.skinAnalysis.visiaMetrics.evenness?.score ??
            result.skinAnalysis.visiaMetrics.evenness ??
            100 - (result.skinAnalysis.visiaMetrics.brownSpots?.score ?? result.skinAnalysis.visiaMetrics.brownSpots ?? 0),
        ),
  trend: result.skinAnalysis.visiaMetrics.evenness?.trend ?? "stable",
        description_en: getEvennessDescription(
          result.skinAnalysis.visiaMetrics.evenness?.score ??
            result.skinAnalysis.visiaMetrics.evenness ??
            100 - (result.skinAnalysis.visiaMetrics.brownSpots?.score ?? result.skinAnalysis.visiaMetrics.brownSpots ?? 0),
          "en",
        ),
        description_th: getEvennessDescription(
          result.skinAnalysis.visiaMetrics.evenness?.score ??
            result.skinAnalysis.visiaMetrics.evenness ??
            100 - (result.skinAnalysis.visiaMetrics.brownSpots?.score ?? result.skinAnalysis.visiaMetrics.brownSpots ?? 0),
          "th",
        ),
      },
      firmness: {
        score:
          result.skinAnalysis.visiaMetrics.firmness?.score ??
          result.skinAnalysis.visiaMetrics.firmness ??
          100 - (result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles ?? 0),
        grade: getGrade(
          result.skinAnalysis.visiaMetrics.firmness?.score ??
            result.skinAnalysis.visiaMetrics.firmness ??
            100 - (result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles ?? 0),
        ),
  trend: result.skinAnalysis.visiaMetrics.firmness?.trend ?? "stable",
        description_en: getFirmnessDescription(
          result.skinAnalysis.visiaMetrics.firmness?.score ??
            result.skinAnalysis.visiaMetrics.firmness ??
            100 - (result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles ?? 0),
          "en",
        ),
        description_th: getFirmnessDescription(
          result.skinAnalysis.visiaMetrics.firmness?.score ??
            result.skinAnalysis.visiaMetrics.firmness ??
            100 - (result.skinAnalysis.visiaMetrics.wrinkles?.score ?? result.skinAnalysis.visiaMetrics.wrinkles ?? 0),
          "th",
        ),
      },
      radiance: {
        score:
          result.skinAnalysis.visiaMetrics.radiance?.score ??
          result.skinAnalysis.visiaMetrics.radiance ??
          100 - (result.skinAnalysis.visiaMetrics.redAreas?.score ?? result.skinAnalysis.visiaMetrics.redAreas ?? 0),
        grade: getGrade(
          result.skinAnalysis.visiaMetrics.radiance?.score ??
            result.skinAnalysis.visiaMetrics.radiance ??
            100 - (result.skinAnalysis.visiaMetrics.redAreas?.score ?? result.skinAnalysis.visiaMetrics.redAreas ?? 0),
        ),
  trend: result.skinAnalysis.visiaMetrics.radiance?.trend ?? "stable",
        description_en: getRadianceDescription(
          result.skinAnalysis.visiaMetrics.radiance?.score ??
            result.skinAnalysis.visiaMetrics.radiance ??
            100 - (result.skinAnalysis.visiaMetrics.redAreas?.score ?? result.skinAnalysis.visiaMetrics.redAreas ?? 0),
          "en",
        ),
        description_th: getRadianceDescription(
          result.skinAnalysis.visiaMetrics.radiance?.score ??
            result.skinAnalysis.visiaMetrics.radiance ??
            100 - (result.skinAnalysis.visiaMetrics.redAreas?.score ?? result.skinAnalysis.visiaMetrics.redAreas ?? 0),
          "th",
        ),
      },
      hydration: {
        score:
          result.skinAnalysis.visiaMetrics.hydration?.score ??
          result.skinAnalysis.visiaMetrics.hydration ??
          result.qualityReport.score,
        grade: getGrade(
          result.skinAnalysis.visiaMetrics.hydration?.score ??
            result.skinAnalysis.visiaMetrics.hydration ??
            result.qualityReport.score,
        ),
  trend: result.skinAnalysis.visiaMetrics.hydration?.trend ?? "stable",
        description_en: "Well-hydrated skin with good moisture retention.",
        description_th: "ผิวชุ่มชื้นดี กักเก็บความชุ่มชื้นได้ดี",
      },
    },
    recommendations: result.skinAnalysis.recommendations.map((rec: string, index: number) => ({
      title_en: rec,
      title_th: rec,
      description_en: rec,
      description_th: rec,
      priority: index < 2 ? ("high" as const) : ("medium" as const),
    })),
    skin_type: "normal" as const,
    age_estimate: 35,
    confidence: result.faceDetection.confidence * 100,
    aiData: {
      totalProcessingTime: result.totalProcessingTime,
      faceDetection: {
        landmarks: result.faceDetection.landmarks,
        confidence: result.faceDetection.confidence,
        processingTime: result.faceDetection.processingTime || 0,
      },
      skinAnalysis: {
        overallScore: result.skinAnalysis.overallScore,
        processingTime: result.skinAnalysis.processingTime || 0,
        concerns: result.skinAnalysis.concerns,
      },
      qualityReport: result.qualityReport,
      cloudAnalysis: result.cloudAnalysis,
      analysisMethod: result.analysisMethod,
      tier: result.tier,
    },
  }
}

// Map cloud ensemble result into API response shape
export function mapCloudEnsembleToAnalysis(cloud: EnsembleAnalysisResult, tier: string) {
  return {
    overall_score: cloud.overallScore,
    image_url: undefined,
    metrics: {
      wrinkles: {
        score: cloud.visiaScores.wrinkles,
        grade: getGrade(cloud.visiaScores.wrinkles),
        trend: "stable" as const,
        description_en: getWrinkleDescription(cloud.visiaScores.wrinkles, "en"),
        description_th: getWrinkleDescription(cloud.visiaScores.wrinkles, "th"),
      },
      spots: {
        score: cloud.visiaScores.spots,
        grade: getGrade(cloud.visiaScores.spots),
        trend: "stable" as const,
        description_en: getSpotsDescription(cloud.visiaScores.spots, "en"),
        description_th: getSpotsDescription(cloud.visiaScores.spots, "th"),
      },
      pores: {
        score: cloud.visiaScores.pores,
        grade: getGrade(cloud.visiaScores.pores),
        trend: "stable" as const,
        description_en: getPoresDescription(cloud.visiaScores.pores, "en"),
        description_th: getPoresDescription(cloud.visiaScores.pores, "th"),
      },
      texture: {
        score: cloud.visiaScores.texture,
        grade: getGrade(cloud.visiaScores.texture),
        trend: "stable" as const,
        description_en: getTextureDescription(cloud.visiaScores.texture, "en"),
        description_th: getTextureDescription(cloud.visiaScores.texture, "th"),
      },
      evenness: {
        score: cloud.visiaScores.evenness,
        grade: getGrade(cloud.visiaScores.evenness),
        trend: "stable" as const,
        description_en: getEvennessDescription(cloud.visiaScores.evenness, "en"),
        description_th: getEvennessDescription(cloud.visiaScores.evenness, "th"),
      },
      firmness: {
        score: cloud.visiaScores.firmness,
        grade: getGrade(cloud.visiaScores.firmness),
        trend: "stable" as const,
        description_en: getFirmnessDescription(cloud.visiaScores.firmness, "en"),
        description_th: getFirmnessDescription(cloud.visiaScores.firmness, "th"),
      },
      radiance: {
        score: cloud.visiaScores.radiance,
        grade: getGrade(cloud.visiaScores.radiance),
        trend: "stable" as const,
        description_en: getRadianceDescription(cloud.visiaScores.radiance, "en"),
        description_th: getRadianceDescription(cloud.visiaScores.radiance, "th"),
      },
      hydration: {
        score: cloud.visiaScores.hydration,
        grade: getGrade(cloud.visiaScores.hydration),
        trend: "stable" as const,
        description_en: "Well-hydrated skin with good moisture retention.",
        description_th: "ผิวชุ่มชื้นดี กักเก็บความชุ่มชื้นได้ดี",
      },
    },
    recommendations: cloud.recommendations.map((rec: string, index: number) => ({
      title_en: rec,
      title_th: rec,
      description_en: rec,
      description_th: rec,
      priority: index < 2 ? ("high" as const) : ("medium" as const),
    })),
    skin_type: "normal" as const,
    age_estimate: 35,
    confidence: Math.round((cloud.confidence || 0.8) * 100),
    aiData: {
      totalProcessingTime: cloud.totalProcessingTime,
      faceDetection: undefined,
      skinAnalysis: undefined,
      qualityReport: undefined,
      cloudAnalysis: cloud,
      analysisMethod: "cloud-only" as const,
      tier,
    },
  }
}
