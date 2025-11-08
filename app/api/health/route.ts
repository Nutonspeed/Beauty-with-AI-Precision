import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Use service client to bypass RLS for health check
    const supabase = createServiceClient()

    // Check database connection by querying a simple value
    const { error } = await supabase.from("users").select("count", { count: "exact", head: true }).limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      database: "connected",
      uptime: process.uptime(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
