import {
  analyzeWithGPT4o,
  analyzeWithClaude,
  analyzeWithGemini,
  type AIModelResponse,
  type SkinAnalysisPrompt
} from './gateway-client'

export type AnalysisType = SkinAnalysisPrompt['analysisType']
export type AnalysisLanguage = SkinAnalysisPrompt['language']

export interface ModelSummary {
  skinType: string
  concerns: string[]
  confidence: number
  recommendations: string[]
  visiaScores: Record<string, number>
  processingTime: number
}

export interface GatewayAnalysisResult {
  skinType: string
  concerns: string[]
  severity: Record<string, number>
  skinTone: string
  texture: string
  consensusScore: number
  confidence: number
  processingTime: number
  detailedAnalysis: string
  modelResults: {
    gpt4o?: ModelSummary
    claude?: ModelSummary
    gemini?: ModelSummary
  }
}

const severityWeights: Record<string, number> = {
  mild: 4,
  moderate: 7,
  severe: 10
}

function summarizeModel(modelName: string, result: AIModelResponse | undefined): ModelSummary | undefined {
  if (!result) return undefined

  return {
    skinType: inferSkinType(result),
    concerns: result.concerns?.map(concern => concern.type) ?? [],
    confidence: averageConfidence(result),
    recommendations: result.recommendations ?? [],
    visiaScores: result.visiaScores ?? {},
    processingTime: result.processingTime ?? 0
  }
}

function inferSkinType(result: AIModelResponse): string {
  const concern = result.concerns?.[0]
  if (concern?.type) {
    return concern.type
  }
  return 'balanced'
}

function averageConfidence(result: AIModelResponse): number {
  if (!result.concerns?.length) return 0.5
  const total = result.concerns.reduce((sum, concern) => sum + (concern.confidence ?? 0.5), 0)
  return total / result.concerns.length
}

function combineConcerns(models: AIModelResponse[]): string[] {
  const concernSet = new Set<string>()
  models.forEach(model => {
    model.concerns?.forEach(concern => {
      if (concern.type) {
        concernSet.add(concern.type)
      }
    })
  })
  return Array.from(concernSet)
}

function combineSeverity(models: AIModelResponse[]): Record<string, number> {
  const severityMap: Record<string, number[]> = {}

  models.forEach(model => {
    model.concerns?.forEach(concern => {
      if (!concern.type) return
      const severityValue = severityWeights[concern.severity ?? 'moderate'] || 5
      if (!severityMap[concern.type]) {
        severityMap[concern.type] = []
      }
      severityMap[concern.type].push(severityValue)
    })
  })

  return Object.entries(severityMap).reduce<Record<string, number>>((acc, [type, values]) => {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length
    acc[type] = Math.round(avg)
    return acc
  }, {})
}

function buildDetailedAnalysis(models: Record<string, AIModelResponse | undefined>): string {
  const sections: string[] = []

  Object.entries(models).forEach(([model, result]) => {
    if (!result) return
    const concernSummary = result.concerns
      ?.map(concern => `${concern.type} (${concern.severity})`)
      .join(', ')

    sections.push(
      `${model.toUpperCase()} concerns: ${concernSummary ?? 'No concerns detected'} | ` +
        `Recommendations: ${(result.recommendations ?? []).join('; ') || 'None'}`
    )
  })

  return sections.join('\n')
}

export async function analyzeSkinWithAIGateway(
  imageBuffer: Buffer,
  options: { language?: AnalysisLanguage; analysisType?: AnalysisType } = {}
): Promise<GatewayAnalysisResult> {
  const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
  const prompt: SkinAnalysisPrompt = {
    imageBase64,
    language: options.language ?? 'en',
    analysisType: options.analysisType ?? 'detailed'
  }

  const [gpt4oResult, claudeResult, geminiResult] = await Promise.allSettled([
    analyzeWithGPT4o(prompt),
    analyzeWithClaude(prompt),
    analyzeWithGemini(prompt)
  ])

  const successfulResults = [gpt4oResult, claudeResult, geminiResult]
    .filter((result): result is PromiseFulfilledResult<AIModelResponse> => result.status === 'fulfilled')
    .map(result => result.value)

  if (!successfulResults.length) {
    throw new Error('AI Gateway failed: all model calls were unsuccessful')
  }

  const modelMap: Record<string, AIModelResponse | undefined> = {
    gpt4o: gpt4oResult.status === 'fulfilled' ? gpt4oResult.value : undefined,
    claude: claudeResult.status === 'fulfilled' ? claudeResult.value : undefined,
    gemini: geminiResult.status === 'fulfilled' ? geminiResult.value : undefined
  }

  const modelResults = {
    gpt4o: summarizeModel('gpt4o', modelMap.gpt4o),
    claude: summarizeModel('claude', modelMap.claude),
    gemini: summarizeModel('gemini', modelMap.gemini)
  }

  const visiaScores = successfulResults
    .map(result => result.visiaScores)
    .filter(Boolean) as Record<string, number>[]

  const skinType = modelResults.gpt4o?.skinType || modelResults.claude?.skinType || 'balanced'
  const concerns = combineConcerns(successfulResults)
  const severity = combineSeverity(successfulResults)
  const consensusScore = successfulResults.length / 3
  const confidence = successfulResults.reduce((sum, result) => sum + averageConfidence(result), 0) / successfulResults.length
  const processingTime = successfulResults.reduce((sum, result) => sum + (result.processingTime ?? 0), 0)
  const detailedAnalysis = buildDetailedAnalysis(modelMap)
  const textureScore = visiaScores[0]?.texture ?? 50

  return {
    skinType,
    concerns,
    severity,
    skinTone: visiaScores[0]?.evenness ? `Tone Score ${visiaScores[0].evenness}` : 'balanced',
    texture: textureScore > 70 ? 'smooth' : textureScore > 40 ? 'normal' : 'rough',
    consensusScore,
    confidence,
    processingTime,
    detailedAnalysis,
    modelResults
  }
}
