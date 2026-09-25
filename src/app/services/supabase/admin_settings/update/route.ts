import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return auth.response;
    }

    let userId = auth.user.id;
    if (!userId) {
      const { data: userData } = await supabaseServer
        .from("auth")
        .select("id")
        .eq("email", auth.user.email)
        .maybeSingle();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { full_name, avatar_url } = body;

    const { data, error } = await supabaseServer
      .from("admin_settings")
      .upsert({
        id: userId,
        ...(full_name !== undefined && { full_name }),
        ...(avatar_url !== undefined && { avatar_url }),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Admin settings updated successfully", data },
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
