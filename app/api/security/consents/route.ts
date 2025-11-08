import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { grantConsent, revokeConsent, getUserConsents } from "@/lib/security/consent-manager"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consents = await getUserConsents(user.id)

    return NextResponse.json({ consents })
  } catch (error) {
    console.error("Error fetching consents:", error)
    return NextResponse.json({ error: "Failed to fetch consents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { consentType, version, granted } = body

    await grantConsent({
      userId: user.id,
      consentType,
      version,
      granted,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error granting consent:", error)
    return NextResponse.json({ error: "Failed to grant consent" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consentType = searchParams.get("type")
    const version = searchParams.get("version")

    if (!consentType || !version) {
      return NextResponse.json({ error: "Consent type and version are required" }, { status: 400 })
    }

    await revokeConsent(user.id, consentType as any, version)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error revoking consent:", error)
    return NextResponse.json({ error: "Failed to revoke consent" }, { status: 500 })
  }
}
