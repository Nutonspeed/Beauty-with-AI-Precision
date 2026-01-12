import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email-service";

interface InventoryAlert {
  id: string;
  product_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  category: string;
  last_updated: string;
}

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
    const { data: settings } = await supabase
      .from("center_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const threshold =
      settings?.settings?.inventory_alert_threshold || 10;
    const alertsEnabled =
      settings?.settings?.inventory_alerts_enabled !== false;

    if (!alertsEnabled) {
      return NextResponse.json({
        alerts: [],
        message: "Inventory alerts are disabled",
      });
    }

    // ดึงสินค้าที่มีจำนวนต่ำกว่า threshold
    const { data: lowStockItems, error } = await supabase
      .from("center_inventory")
      .select("*")
      .lt("current_stock", threshold)
      .order("current_stock", { ascending: true });

    if (error) {
      console.error("Error fetching low stock items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const alerts: InventoryAlert[] = (lowStockItems || []).map((item) => ({
      id: item.id,
      product_name: item.product_name,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      unit: item.unit,
      category: item.category,
      last_updated: item.updated_at || item.created_at,
    }));

    // คำนวณสรุป
    const summary = {
      total_alerts: alerts.length,
      critical_items: alerts.filter((a) => a.current_stock === 0).length,
      low_items: alerts.filter(
        (a) => a.current_stock > 0 && a.current_stock < threshold / 2
      ).length,
      warning_items: alerts.filter(
        (a) => a.current_stock >= threshold / 2 && a.current_stock < threshold
      ).length,
    };

    return NextResponse.json({
      alerts,
      summary,
      threshold,
    });
  } catch (error) {
    console.error("Error in GET /api/center/automation/inventory-alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือน (เรียกใช้โดย cron job)
export async function POST() {
  try {
    const supabase = await createClient();

    // ใช้ service role สำหรับ background job
    const { data: settings } = await supabase
      .from("center_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const threshold = settings?.settings?.inventory_alert_threshold || 10;
    const alertsEnabled = settings?.settings?.inventory_alerts_enabled !== false;
    const alertEmails = settings?.settings?.inventory_alert_emails || [];

    if (!alertsEnabled || alertEmails.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Alerts disabled or no recipients",
      });
    }

    // ดึงสินค้าที่มีจำนวนต่ำ
    const { data: lowStockItems } = await supabase
      .from("center_inventory")
      .select("*")
      .lt("current_stock", threshold)
      .order("current_stock", { ascending: true });

    if (!lowStockItems || lowStockItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No low stock items",
      });
    }

    // สร้างเนื้อหาอีเมล
    const emailSubject = `⚠️ แจ้งเตือนสินค้าคงเหลือต่ำ - ${lowStockItems.length} รายการ`;
    
    const criticalItems = lowStockItems.filter((item) => item.current_stock === 0);
    const lowItems = lowStockItems.filter(
      (item) => item.current_stock > 0 && item.current_stock < threshold / 2
    );
    const warningItems = lowStockItems.filter(
      (item) => item.current_stock >= threshold / 2 && item.current_stock < threshold
    );

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; }
    .alert-section { margin: 20px 0; }
    .alert-critical { background: #fee; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; }
    .alert-low { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
    .alert-warning { background: #fef9e7; border-left: 4px solid #eab308; padding: 15px; margin: 10px 0; }
    .item-name { font-weight: bold; font-size: 16px; }
    .item-stock { color: #666; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 แจ้งเตือนสินค้าคงเหลือต่ำ</h1>
      <p>คลินิกของคุณมีสินค้าที่ต้องการสั่งซื้อเพิ่ม</p>
    </div>
    
    <div class="content">
      <h2>สรุปรายการ</h2>
      <ul>
        <li>🔴 สินค้าหมด: <strong>${criticalItems.length}</strong> รายการ</li>
        <li>🟠 สินค้าคงเหลือน้อย: <strong>${lowItems.length}</strong> รายการ</li>
        <li>🟡 สินค้าใกล้หมด: <strong>${warningItems.length}</strong> รายการ</li>
      </ul>

      ${
        criticalItems.length > 0
          ? `
      <div class="alert-section">
        <h3>🔴 สินค้าหมด (ต้องสั่งด่วน!)</h3>
        ${criticalItems
          .map(
            (item) => `
        <div class="alert-critical">
          <div class="item-name">${item.product_name}</div>
          <div class="item-stock">คงเหลือ: <strong>0 ${item.unit}</strong> | หมวด: ${item.category}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        lowItems.length > 0
          ? `
      <div class="alert-section">
        <h3>🟠 สินค้าคงเหลือน้อย</h3>
        ${lowItems
          .map(
            (item) => `
        <div class="alert-low">
          <div class="item-name">${item.product_name}</div>
          <div class="item-stock">คงเหลือ: <strong>${item.current_stock} ${item.unit}</strong> | หมวด: ${item.category}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        warningItems.length > 0
          ? `
      <div class="alert-section">
        <h3>🟡 สินค้าใกล้หมด</h3>
        ${warningItems
          .map(
            (item) => `
        <div class="alert-warning">
          <div class="item-name">${item.product_name}</div>
          <div class="item-stock">คงเหลือ: <strong>${item.current_stock} ${item.unit}</strong> | หมวด: ${item.category}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>อีเมลนี้ถูกส่งอัตโนมัติจากระบบจัดการคลินิก</p>
      <p><small>กรุณาตรวจสอบและสั่งซื้อสินค้าเพื่อไม่ให้บริการหยุดชะงัก</small></p>
    </div>
  </div>
</body>
</html>
    `;

    // Send inventory alert emails via Resend
    for (const email of alertEmails) {
      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailBody,
      });
    }
    console.log("Sent inventory alert email to:", alertEmails);
    console.log("Low stock items:", lowStockItems.length);

    // บันทึก log การส่งแจ้งเตือน
    await supabase.from("automation_logs").insert({
      automation_type: "inventory_alert",
      status: "sent",
      recipients: alertEmails,
      data: {
        total_items: lowStockItems.length,
        critical: criticalItems.length,
        low: lowItems.length,
        warning: warningItems.length,
      },
    });

    return NextResponse.json({
      success: true,
      alerts_sent: lowStockItems.length,
      recipients: alertEmails.length,
    });
  } catch (error) {
    console.error("Error sending inventory alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
