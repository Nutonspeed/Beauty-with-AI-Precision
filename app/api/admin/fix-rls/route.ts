import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth/middleware"

async function handler() {
  try {
    console.log("[v0] Starting RLS policy fix...")

    // Create admin client with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Drop problematic policies that cause infinite recursion
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Super admins can view all users" ON users',
      'DROP POLICY IF EXISTS "Clinic owners can view their tenant" ON tenants',
      'DROP POLICY IF EXISTS "Clinic staff can view their clinic users" ON users',
      'DROP POLICY IF EXISTS "Users can view their own profile" ON users',
      'DROP POLICY IF EXISTS "Clinic staff can view clinic tenants" ON tenants'
    ]

    // Execute drop policies
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.warn(`Failed to drop policy: ${policy}`, error.message)
      }
    }

    // Create fixed policies
    const createPolicies = [
      // Users table policies
      `CREATE POLICY "Super admins can view all users" ON users
       FOR ALL USING (role = 'super_admin')`,

      `CREATE POLICY "Clinic owners can view their clinic users" ON users
       FOR ALL USING (
         role = 'clinic_owner' AND clinic_id IN (
           SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
         )
       )`,

      `CREATE POLICY "Clinic staff can view their clinic users" ON users
       FOR ALL USING (
         role IN ('clinic_staff', 'doctor', 'therapist') AND clinic_id IN (
           SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
         )
       )`,

      `CREATE POLICY "Users can view their own profile" ON users
       FOR ALL USING (auth.uid() = id)`,

      // Tenants table policies
      `CREATE POLICY "Clinic owners can view their tenant" ON tenants
       FOR ALL USING (
         clinic_id IN (
           SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid() AND role = 'clinic_owner'
         )
       )`,

      `CREATE POLICY "Clinic staff can view clinic tenants" ON tenants
       FOR ALL USING (
         clinic_id IN (
           SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
         )
       )`
    ]

    // Execute create policies
    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.error(`Failed to create policy:`, error.message)
        return NextResponse.json({ error: `Failed to create policy: ${error.message}` }, { status: 500 })
      }
    }

    console.log("[v0] RLS policies fixed successfully")

    return NextResponse.json({
      success: true,
      message: "RLS policies have been fixed successfully",
      droppedPolicies: dropPolicies.length,
      createdPolicies: createPolicies.length
    })

  } catch (error) {
    console.error("[v0] RLS policy fix failed:", error)
    return NextResponse.json(
      { error: "Failed to fix RLS policies" },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handler)
