import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.ok) return guard.response;

    const bodyData = await req.json().catch(() => ({}));
    const { id, title, body, cover_image, video_url, event_date, event_location, status } = bodyData;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = String(title).trim();
    if (body !== undefined) updates.body = body ? sanitizeHtml(String(body)) : null;
    if (cover_image !== undefined) updates.cover_image = cover_image ? String(cover_image) : null;
    if (video_url !== undefined) updates.video_url = video_url ? String(video_url) : null;
    if (event_date !== undefined) updates.event_date = event_date ? String(event_date) : null;
    if (event_location !== undefined) updates.event_location = event_location ? String(event_location) : null;
    if (status !== undefined) updates.status = status === "published" ? "published" : "draft";

    const { data, error } = await supabaseServer
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content updated", data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating content:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
