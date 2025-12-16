import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/^['"]|['"]$/g, "")
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").replace(/^['"]|['"]$/g, "")
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^['"]|['"]$/g, "")

const testEmail = process.env.SALES_TEST_EMAIL || "sales@example.com"
const testPassword = process.env.SALES_TEST_PASSWORD || "password123"

function requireEnv(label: string, value: string) {
  if (!value) {
    throw new Error(`Missing env var for ${label}`)
  }
}

requireEnv("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)", supabaseUrl)
requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)
requireEnv("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceKey)

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log("\n🧪 Sales Smoke Test (DB/RLS)\n")

  console.log("1) Sign in")
  const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authError || !authData.user) {
    throw new Error(`Login failed: ${authError?.message || "No user"}`)
  }

  const userId = authData.user.id
  console.log("   ✅ Logged in", { userId, email: testEmail })

  console.log("2) Load user row (service role)")
  const { data: userRow, error: userRowError } = await admin
    .from("users")
    .select("id, role, clinic_id")
    .eq("id", userId)
    .single()

  if (userRowError || !userRow) {
    throw new Error(`Failed to load users row: ${userRowError?.message || "No row"}`)
  }

  if (!userRow.clinic_id) {
    throw new Error("User clinic_id is null; sales RLS requires clinic_id")
  }

  console.log("   ✅ User row", { role: userRow.role, clinicId: userRow.clinic_id })

  const now = Date.now()
  const leadEmail = `smoke-${now}@example.com`

  console.log("3) Insert sales_lead as authenticated user (tests RLS)")
  const { data: lead, error: leadError } = await userClient
    .from("sales_leads")
    .insert({
      sales_user_id: userId,
      clinic_id: userRow.clinic_id,
      name: `Smoke Lead ${now}`,
      email: leadEmail,
      status: "new",
      source: "website",
      score: 10,
      tags: ["smoke_test"],
      metadata: { smoke_test: true },
    })
    .select("id, clinic_id, sales_user_id")
    .single()

  if (leadError || !lead) {
    throw new Error(`Lead insert failed: ${leadError?.message || "No lead"}`)
  }

  console.log("   ✅ Lead created", lead)

  console.log("4) Insert sales_proposal as authenticated user (tests RLS)")
  const { data: proposal, error: proposalError } = await userClient
    .from("sales_proposals")
    .insert({
      lead_id: lead.id,
      sales_user_id: userId,
      clinic_id: userRow.clinic_id,
      title: `Smoke Proposal ${now}`,
      status: "draft",
      treatments: [
        {
          name: "Smoke Treatment",
          price: 1000,
          sessions: 1,
          description: "smoke",
        },
      ],
      subtotal: 1000,
      total_value: 1000,
      metadata: { smoke_test: true },
    })
    .select("id, lead_id, clinic_id, sales_user_id")
    .single()

  if (proposalError || !proposal) {
    throw new Error(`Proposal insert failed: ${proposalError?.message || "No proposal"}`)
  }

  console.log("   ✅ Proposal created", proposal)

  console.log("5) Call increment_proposal_view_count RPC")
  const { data: viewResult, error: viewError } = await userClient.rpc("increment_proposal_view_count", {
    proposal_id: proposal.id,
    user_id: userId,
  })

  if (viewError) {
    throw new Error(`RPC failed: ${viewError.message}`)
  }

  console.log("   ✅ RPC ok", viewResult)

  console.log("6) Cleanup (service role)")
  const { error: deleteError } = await admin.from("sales_leads").delete().eq("id", lead.id)
  if (deleteError) {
    throw new Error(`Cleanup failed: ${deleteError.message}`)
  }

  console.log("   ✅ Cleanup ok")

  await userClient.auth.signOut()
  console.log("\n✅ Sales smoke test finished successfully\n")
}

main().catch((error) => {
  console.error("\n❌ Sales smoke test failed:\n", error)
  process.exit(1)
})
