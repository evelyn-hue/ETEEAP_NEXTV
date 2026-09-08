import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function extractToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function POST(req: NextRequest) {
  try {
    const token = await extractToken(req);
    let userEmail = "";
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { final_data?: { data?: Array<{ email?: string }> } };
        userEmail = String(decoded.final_data?.data?.[0]?.email ?? "").toLowerCase().trim();
      } catch { /* token invalid — fallback to body email */ }
    }
    if (!userEmail) {
      const body = await req.json().catch(() => ({}));
      userEmail = String(body.email ?? "").toLowerCase().trim();
    }
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Enforce 3-day gate (calendar days for v1)
    const { data: formRow } = await supabaseServer
      .from("form")
      .select("created_at, form_status")
      .eq("email", userEmail)
      .maybeSingle();
    if (formRow?.created_at) {
      const daysSince = Math.floor((Date.now() - new Date(String(formRow.created_at)).getTime()) / 86400000);
      if (daysSince < 3) {
        return NextResponse.json({ success: false, error: "You can send a reminder after 3 business days." }, { status: 400 });
      }
      if (daysSince >= 7) {
        return NextResponse.json({ success: false, error: "Application has exceeded 7 days and should be reverted to draft." }, { status: 400 });
      }
      const statusLower = String(formRow.form_status ?? "").toLowerCase();
      if (statusLower !== "under review" && statusLower !== "on hold") {
        return NextResponse.json({ success: false, error: "Reminders are only allowed while under review or on hold." }, { status: 400 });
      }
    }

    // Rate limit: one per 24h
    const { data: last } = await supabaseServer
      .from("act_logs")
      .select("created_at")
      .eq("user", userEmail)
      .eq("actions", "Remind Admin")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last?.created_at) {
      const lastTime = new Date(last.created_at).getTime();
      if (Date.now() - lastTime < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ success: false, error: "You can send a reminder once every 24 hours." }, { status: 429 });
      }
    }

    const { error } = await supabaseServer.from("act_logs").insert([
      {
        user: userEmail,
        actions: "Remind Admin",
        details: `Reminder sent for application (${userEmail}) — follow-up after 3 business days.`,
      },
    ]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Reminder sent" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
