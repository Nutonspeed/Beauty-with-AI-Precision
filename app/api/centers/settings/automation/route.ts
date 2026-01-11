import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึงการตั้งค่า automation
    const { data: settings, error } = await supabase
      .from("clinic_settings")
      .select("*")
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

    const settings = await request.json();

    // ตรวจสอบว่ามีการตั้งค่าอยู่แล้วหรือไม่
    const { data: existing } = await supabase
      .from("clinic_settings")
      .select("id")
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
