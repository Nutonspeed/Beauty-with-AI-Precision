import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
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
      'DROP POLICY IF EXISTS "Super admins can view all tenants" ON tenants',
    ]

    for (const sql of dropPolicies) {
      console.log("[v0] Executing:", sql)
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql })
      if (error) {
        console.log("[v0] Error (may be expected if policy does not exist):", error.message)
      }
    }

    // Create helper functions that bypass RLS
    const createFunctions = `
      -- Function to check if user is super admin (bypasses RLS)
      CREATE OR REPLACE FUNCTION is_super_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()::text
          AND role = 'super_admin'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Function to get user's clinic_id (bypasses RLS)
      CREATE OR REPLACE FUNCTION get_user_clinic_id()
      RETURNS TEXT AS $$
      BEGIN
        RETURN (
          SELECT clinic_id FROM users
          WHERE id = auth.uid()::text
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Function to check if user is clinic owner (bypasses RLS)
      CREATE OR REPLACE FUNCTION is_clinic_owner()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()::text
          AND role = 'clinic_owner'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    console.log("[v0] Creating helper functions...")
    const { error: funcError } = await supabase.rpc("exec_sql", { sql_query: createFunctions })
    if (funcError) {
      console.log("[v0] Function creation error:", funcError.message)
      return NextResponse.json(
        {
          success: false,
          error: funcError.message,
        },
        { status: 500 },
      )
    }

    // Create new policies using the helper functions
    const createPolicies = `
      -- Users table policies
      CREATE POLICY "Super admins can view all users"
        ON users FOR SELECT
        USING (is_super_admin());

      -- Tenants table policies  
      CREATE POLICY "Clinic owners can view their tenant"
        ON tenants FOR SELECT
        USING (
          is_clinic_owner() 
          AND id = get_user_clinic_id()
        );

      CREATE POLICY "Super admins can view all tenants"
        ON tenants FOR SELECT
        USING (is_super_admin());
    `

    console.log("[v0] Creating new policies...")
    const { error: policyError } = await supabase.rpc("exec_sql", { sql_query: createPolicies })
    if (policyError) {
      console.log("[v0] Policy creation error:", policyError.message)
      return NextResponse.json(
        {
          success: false,
          error: policyError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] RLS policies fixed successfully!")
    return NextResponse.json({
      success: true,
      message: "RLS policies fixed successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error fixing RLS policies:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
