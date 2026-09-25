import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.ok) return guard.response;

    const body = await req.json().catch(() => ({}));
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseServer.from("posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content deleted" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting content:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
