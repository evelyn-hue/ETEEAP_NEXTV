import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { formId, email } = await req.json();

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
      query = query.eq("email", email);
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
