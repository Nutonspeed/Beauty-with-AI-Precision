/**
 * Script to create demo users in Supabase Auth
 * Run this script to set up demo accounts for testing
 *
 * Usage: npx tsx scripts/create-demo-users.ts
 */

import { createClient } from "@supabase/supabase-js"

// Remove quotes from env variables if present
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "")
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "")

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEMO_CLINIC_ID = "00000000-0000-0000-0000-000000000001"

const demoUsers = [
  {
    email: "clinic-owner@example.com",
    password: "password123",
    user_metadata: {
      full_name: "Clinic Owner Demo",
      role: "clinic_owner",
      clinic_id: DEMO_CLINIC_ID,
    },
  },
  {
    email: "sales@example.com",
    password: "password123",
    user_metadata: {
      full_name: "Sales Staff Demo",
      role: "sales_staff",
      clinic_id: DEMO_CLINIC_ID,
    },
  },
  {
    email: "customer@example.com",
    password: "password123",
    user_metadata: {
      full_name: "Customer Demo",
      role: "customer_free",
      clinic_id: null,
    },
  },
  {
    email: "admin@ai367bar.com",
    password: "password123",
    user_metadata: {
      full_name: "Super Admin",
      role: "super_admin",
      clinic_id: null,
    },
  },
]

async function createDemoUsers() {
  console.log("🚀 Creating demo users in Supabase Auth...\n")

  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email}`)

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find((u) => u.email === user.email)

      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: user.password,
          email_confirm: true,
          user_metadata: user.user_metadata,
        })

        if (updateError) {
          console.error(`  ❌ Error updating user: ${updateError.message}`)
          continue
        }

        console.log(`  🔄 Updated existing account (ID: ${existingUser.id})`)
      } else {
        // Create user with admin API
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email for demo accounts
          user_metadata: user.user_metadata,
        })

        if (error) {
          console.error(`  ❌ Error creating user: ${error.message}`)
          continue
        }

        console.log(`  ✅ Created successfully (ID: ${data.user?.id})`)
        console.log(`     Role: ${user.user_metadata.role}`)
        if (user.user_metadata.clinic_id) {
          console.log(`     Clinic ID: ${user.user_metadata.clinic_id}`)
        }
      }

      console.log("")
    } catch (error) {
      console.error(`  ❌ Unexpected error: ${error}`)
    }
  }

  console.log("\n✨ Demo user creation complete!")
  console.log("\n📋 Demo Accounts Summary:")
  console.log("━".repeat(60))
  console.log("Email: clinic-owner@example.com | Password: password123")
  console.log("Role: Clinic Owner | Access: /clinic/dashboard")
  console.log("")
  console.log("Email: sales@example.com | Password: password123")
  console.log("Role: Sales Staff | Access: /sales/dashboard")
  console.log("")
  console.log("Email: customer@example.com | Password: password123")
  console.log("Role: Customer | Access: /analysis")
  console.log("")
  console.log("Email: admin@ai367bar.com | Password: password123")
  console.log("Role: Super Admin | Access: /super-admin")
  console.log("━".repeat(60))
}

createDemoUsers()
  .then(() => {
    console.log("\n✅ Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error)
    process.exit(1)
  })
