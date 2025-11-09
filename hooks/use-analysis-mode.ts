"use client"

import { useCallback, useEffect, useState } from "react"
import type { AnalysisMode } from "@/types"
import { parseAnalysisMode } from "@/types"

const STORAGE_KEY = "analysis-mode"

const DEFAULT_MODE: AnalysisMode = parseAnalysisMode(
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ANALYSIS_MODE : undefined,
  "auto",
)

type ModeEvent = CustomEvent<AnalysisMode>

function readStoredMode(): AnalysisMode {
  if (typeof window === "undefined") {
    return DEFAULT_MODE
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return parseAnalysisMode(stored, DEFAULT_MODE)
}

export function useAnalysisMode() {
  const [mode, setModeState] = useState<AnalysisMode>(() => readStoredMode())

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return
      }

      setModeState(parseAnalysisMode(event.newValue, DEFAULT_MODE))
    }

    const handleCustom = (event: Event) => {
      const custom = event as ModeEvent
      setModeState(parseAnalysisMode(custom.detail, DEFAULT_MODE))
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("analysis-mode", handleCustom)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("analysis-mode", handleCustom)
    }
  }, [])

  const setMode = useCallback((next: AnalysisMode) => {
    setModeState(next)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
      window.dispatchEvent(new CustomEvent<AnalysisMode>("analysis-mode", { detail: next }))
    }
  }, [])

  return { mode, setMode }
}
