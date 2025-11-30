import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * Readiness Check - /api/health/ready
 * Used by load balancers to determine if the app is ready to receive traffic
 */
export async function GET() {
  const checks = {
    database: false,
    cache: true, // Assuming in-memory cache is always ready
    storage: true,
  }

  try {
    // Database check
    const supabase = createServiceClient()
    const { error: dbError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true })
      .limit(1)
    
    checks.database = !dbError

    // Storage check (Supabase Storage)
    try {
      const { error: storageError } = await supabase.storage.listBuckets()
      checks.storage = !storageError
    } catch {
      checks.storage = false
    }

    const allReady = Object.values(checks).every(Boolean)

    return NextResponse.json(
      {
        ready: allReady,
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: allReady ? 200 : 503 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        checks,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
