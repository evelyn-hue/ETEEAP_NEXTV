import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth, isAdminUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;

    const caller = authResult.user;
    const isCallerAdmin = isAdminUser(caller);

    const body = await req.json().catch(() => ({}));
    const { formId, email } = body;

    if (!formId && !email) {
      return NextResponse.json(
        { success: false, error: "formId or email is required" },
        { status: 400 }
      );
    }

    let query = supabaseServer.from("form").select("*");

    if (formId) {
      query = query.eq("id", formId);
    } else if (email) {
      query = query.eq("email", String(email).trim().toLowerCase());
    }

    // IDOR protection: non-admins can only retrieve their own application
    if (!isCallerAdmin) {
      query = query.eq("email", caller.email);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
