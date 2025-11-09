export type AnalysisMode = "local" | "hf" | "auto"

export const ANALYSIS_MODES: AnalysisMode[] = ["local", "hf", "auto"]

export function parseAnalysisMode(value: unknown, fallback: AnalysisMode = "auto"): AnalysisMode {
  if (typeof value !== "string") {
    return fallback
  }

  const normalized = value.toLowerCase().trim()
  if ((ANALYSIS_MODES as ReadonlyArray<string>).includes(normalized)) {
    return normalized as AnalysisMode
  }

  return fallback
}
