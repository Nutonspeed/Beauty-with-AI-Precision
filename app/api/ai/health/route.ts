import { NextResponse, type NextRequest } from "next/server"
import { testAIGateway } from "@/lib/ai/gateway-client"
import { withPublicAccess } from "@/lib/auth/middleware"

export const GET = withPublicAccess(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get("mode") // "deep" to run live model checks

    const configuredProviders = [
      Boolean(process.env.OPENAI_API_KEY) && "openai",
      Boolean(process.env.ANTHROPIC_API_KEY) && "anthropic",
      Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY) && "google",
      Boolean(process.env.VERCEL_AI_GATEWAY_KEY) && "vercel-gateway",
    ].filter(Boolean)

    if (mode === "deep") {
      const result = await testAIGateway()
      return NextResponse.json({
        ok: result.success,
        mode: "deep",
        configuredProviders,
        modelsVerified: result.models,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      })
    }

    // shallow check only
    return NextResponse.json({
      ok: true,
      mode: "shallow",
      configuredProviders,
      note: "Add ?mode=deep to run live requests to each model via the AI Gateway",
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}, { rateLimitCategory: 'api' })
