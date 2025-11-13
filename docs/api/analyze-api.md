# Analyze API Quick Guide

This guide helps QA/devs quickly exercise the skin analysis endpoints for both browser JSON (pre-analyzed) and server-side multipart (cloud ensemble) flows.

## Endpoints

- POST /api/analyze
  - Content-Types
    - application/json: accept pre-analyzed browser results
    - multipart/form-data: server performs cloud ensemble analysis
- GET /api/ai/health
  - mode=shallow (default): lists configured providers
  - mode=deep: runs a lightweight request through the AI Gateway to each model

## JSON flow (browser pre-analysis)

Request (application/json):

{
  "result": {
    "faceDetection": { "landmarks": [], "confidence": 0.95, "processingTime": 120 },
    "skinAnalysis": {
      "overallScore": 82,
      "visiaMetrics": {
        "wrinkles": 70,
        "spots": 65,
        "pores": 68,
        "texture": 75,
        "brownSpots": 20,
        "redAreas": 15
      },
      "recommendations": ["Sunscreen SPF 50+", "Vitamin C"]
    },
    "qualityReport": { "score": 60 },
    "totalProcessingTime": 2330,
    "analysisMethod": "browser",
    "tier": "free"
  },
  "tier": "free"
}

Response shape (excerpt):

{
  "success": true,
  "analysis": {
    "overall_score": 82,
    "metrics": {
      "wrinkles": { "score": 70, "grade": "C", "trend": "stable", ... },
      "evenness": { "score": 80, ... },
      "hydration": { "score": 60, ... }
    },
    "recommendations": [{ "title_en": "Sunscreen SPF 50+", "priority": "high" }, ...],
    "confidence": 95,
    "aiData": { "analysisMethod": "browser", "tier": "free" }
  },
  "tier": "free",
  "timestamp": "..."
}

Notes:

- evenness fallback = 100 - (brownSpots)
- hydration fallback = qualityReport.score

## Multipart flow (server ensemble)

Request (multipart/form-data):

- image: file (jpg/png)
- tier: free | premium | clinical

Behavior by tier:

- free -> analysisType = quick
- premium -> detailed
- clinical -> medical

Response shape (excerpt):

{
  "success": true,
  "analysis": {
    "overall_score": 84,
    "metrics": {
      "wrinkles": { "score": 72, "grade": "C" },
      "texture": { "score": 78, "grade": "C" },
      ...
    },
    "recommendations": [{ "title_en": "Vitamin C", "priority": "high" }],
    "confidence": 85,
    "aiData": {
      "analysisMethod": "cloud-only",
      "tier": "premium",
      "totalProcessingTime": 1520,
      "cloudAnalysis": { "modelsUsed": ["gpt-4o", "claude-3.5-sonnet"], ... }
    }
  },
  "tier": "premium",
  "timestamp": "..."
}

## Health checks

- Shallow: GET /api/ai/health
  - { ok: true, configuredProviders: ["openai", "anthropic", ...] }
- Deep: GET /api/ai/health?mode=deep
  - { ok: true|false, modelsVerified: ["gpt-4o", ...], errors: [] }

## Tips

- JSON flow is fast and deterministic for UI tests.
- Multipart flow validates the cloud ensemble and mapping.
- If deep health fails, check provider API keys and the Vercel AI Gateway key in env.
