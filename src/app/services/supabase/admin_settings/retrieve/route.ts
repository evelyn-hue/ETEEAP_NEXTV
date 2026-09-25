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

    const { data, error } = await supabaseServer
      .from("admin_settings")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If no settings exist, create default ones
    if (!data) {
      const { data: newData, error: insertError } = await supabaseServer
        .from("admin_settings")
        .insert([{ id: userId, full_name: auth.user.fullName || "Admin User", avatar_url: null }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: newData },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data },
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
