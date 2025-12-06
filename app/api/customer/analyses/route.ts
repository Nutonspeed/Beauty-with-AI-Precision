import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withClinicAuth } from "@/lib/auth/middleware"

export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: analyses, error } = await supabase
      .from("skin_analyses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, analyses });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
});
