import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canManageClinicSettings } from "@/lib/auth/clinic-permissions";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role and clinic_id
    const service = createServiceClient();
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single();

    if (userErr || !userRow?.clinic_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check canonical RBAC
    if (!canManageClinicSettings(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ดึงการตั้งค่า automation สำหรับ clinic นี้เท่านั้น
    const { data: settings, error } = await service
      .from("clinic_settings")
      .select("*")
      .eq("clinic_id", userRow.clinic_id)
      .eq("setting_type", "automation")
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: settings?.settings || {} });
  } catch (error) {
    console.error("Error in GET /api/clinic/settings/automation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role and clinic_id
    const service = createServiceClient();
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single();

    if (userErr || !userRow?.clinic_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check canonical RBAC
    if (!canManageClinicSettings(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await request.json();

    // ตรวจสอบว่ามีการตั้งค่าอยู่แล้วหรือไม่ (สำหรับ clinic นี้)
    const { data: existing } = await service
      .from("clinic_settings")
      .select("id")
      .eq("clinic_id", userRow.clinic_id)
      .eq("setting_type", "automation")
      .maybeSingle();

    let result;
    if (existing) {
      // อัปเดตการตั้งค่าที่มีอยู่
      result = await supabase
        .from("clinic_settings")
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // สร้างการตั้งค่าใหม่
      result = await supabase.from("clinic_settings").insert({
        setting_type: "automation",
        settings,
        created_by: user.id,
      });
    }

    if (result.error) {
      console.error("Error saving settings:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error in POST /api/clinic/settings/automation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
