import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { type, status } = await req.json();

    let query = supabaseServer
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (type && ["blog", "video", "event"].includes(String(type))) {
      query = query.eq("type", String(type));
    }

    if (status && ["draft", "published"].includes(String(status))) {
      query = query.eq("status", String(status));
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
    console.error("Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
