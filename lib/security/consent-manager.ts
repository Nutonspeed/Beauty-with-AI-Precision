import { createServerClient } from "@/lib/supabase/server"

export type ConsentType = "terms" | "privacy" | "marketing" | "data_processing" | "hipaa"

export interface ConsentRecord {
  userId: string
  consentType: ConsentType
  version: string
  granted: boolean
  ipAddress?: string
}

export async function grantConsent(consent: ConsentRecord) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("user_consents").insert({
      user_id: consent.userId,
      consent_type: consent.consentType,
      version: consent.version,
      granted: consent.granted,
      ip_address: consent.ipAddress,
    })

    if (error) throw error

    console.log("[Consent] Granted:", consent.consentType, "for user:", consent.userId)
    return data
  } catch (error) {
    console.error("[Consent] Failed to grant consent:", error)
    throw error
  }
}

export async function revokeConsent(userId: string, consentType: ConsentType, version: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("user_consents")
      .update({
        granted: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("consent_type", consentType)
      .eq("version", version)

    if (error) throw error

    console.log("[Consent] Revoked:", consentType, "for user:", userId)
  } catch (error) {
    console.error("[Consent] Failed to revoke consent:", error)
    throw error
  }
}

export async function checkConsent(userId: string, consentType: ConsentType): Promise<boolean> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("user_consents")
      .select("granted")
      .eq("user_id", userId)
      .eq("consent_type", consentType)
      .eq("granted", true)
      .is("revoked_at", null)
      .order("granted_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return data?.granted || false
  } catch (error) {
    console.error("[Consent] Failed to check consent:", error)
    return false
  }
}

export async function getUserConsents(userId: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", userId)
      .order("granted_at", { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error("[Consent] Failed to get user consents:", error)
    return []
  }
}
