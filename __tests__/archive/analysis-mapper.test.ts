import { describe, it, expect } from "vitest"
import { mapBrowserResultToAnalysis, mapCloudEnsembleToAnalysis, getGrade } from "@/lib/ai/analysis-mapper"

describe("analysis-mapper", () => {
  it("grades scores correctly", () => {
    expect(getGrade(95)).toBe("A")
    expect(getGrade(85)).toBe("B")
    expect(getGrade(75)).toBe("C")
    expect(getGrade(65)).toBe("D")
    expect(getGrade(10)).toBe("F")
  })

  it("maps browser result with evenness fallback and hydration fallback", () => {
    const result = {
      skinAnalysis: {
        overallScore: 80,
        visiaMetrics: {
          wrinkles: 60,
          spots: 70,
          pores: 65,
          texture: 75,
          // evenness missing -> fallback to 100 - brownSpots
          brownSpots: 20,
          // hydration missing -> fallback to qualityReport.score
        },
        recommendations: ["Use sunscreen", "Hydrate"],
        processingTime: 1234,
        concerns: [],
      },
      faceDetection: { confidence: 0.9, landmarks: [], processingTime: 100 },
      qualityReport: { score: 55 },
      totalProcessingTime: 2345,
      analysisMethod: "browser",
      tier: "free",
    }

    const mapped = mapBrowserResultToAnalysis(result as any, "free")
    expect(mapped.overall_score).toBe(80)
    expect(mapped.metrics.evenness.score).toBe(80) // 100 - brownSpots 20
    expect(mapped.metrics.hydration.score).toBe(55) // fallback to qualityReport.score
    expect(mapped.recommendations.length).toBe(2)
    expect(mapped.confidence).toBe(90)
  })

  it("maps cloud ensemble to analysis shape", () => {
    const cloud: any = {
      overallScore: 82,
      visiaScores: {
        wrinkles: 70,
        spots: 65,
        pores: 60,
        texture: 75,
        evenness: 80,
        firmness: 77,
        radiance: 72,
        hydration: 68,
      },
      recommendations: ["Vitamin C", "Retinol"],
      confidence: 0.85,
      totalProcessingTime: 1500,
      modelsUsed: ["gpt-4o", "claude-3.5-sonnet"],
    }

    const mapped = mapCloudEnsembleToAnalysis(cloud, "premium")
    expect(mapped.overall_score).toBe(82)
    expect(mapped.metrics.texture.score).toBe(75)
    expect(mapped.confidence).toBe(85)
    expect(mapped.recommendations[0].priority).toBe("high")
  })
})
