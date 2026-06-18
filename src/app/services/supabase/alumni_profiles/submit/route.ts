import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      full_name,
      nickname,
      graduation_year,
      birthday,
      educational_attainments,
      programs,
      certificates,
      work_experiences,
      experience,
      transformation,
      visibility,
      email,
    } = body;

    if (!full_name || !email) {
      return NextResponse.json(
        { success: false, error: "Full name and email are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .insert([
        {
          full_name,
          nickname,
          graduation_year,
          birthday,
          educational_attainments,
          programs,
          certificates,
          work_experiences,
          experience,
          transformation,
          visibility: visibility || "public",
          verification_status: "pending",
          email,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Alumni profile submitted successfully", data },
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
