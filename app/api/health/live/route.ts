import { NextResponse } from "next/server"

/**
 * Liveness Check - /api/health/live
 * Simple check to see if the app is running
 * Used by Kubernetes/Docker for container health
 */
export async function GET() {
  return NextResponse.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  })
}
