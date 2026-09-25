import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.ok) return guard.response;

    const bodyData = await req.json().catch(() => ({}));
    const { type, title, body, cover_image, video_url, event_date, event_location, status } = bodyData;

    if (!type || !["blog", "video", "event"].includes(String(type))) {
      return NextResponse.json({ success: false, error: "A valid type (blog, video, event) is required" }, { status: 400 });
    }
    if (!title || !String(title).trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const cleanBody = body ? sanitizeHtml(String(body)) : null;

    const { data, error } = await supabaseServer
      .from("posts")
      .insert([
        {
          type: String(type),
          title: String(title).trim(),
          body: cleanBody,
          cover_image: cover_image ? String(cover_image) : null,
          video_url: video_url ? String(video_url) : null,
          event_date: event_date ? String(event_date) : null,
          event_location: event_location ? String(event_location) : null,
          status: status === "published" ? "published" : "draft",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content created", data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating content:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
