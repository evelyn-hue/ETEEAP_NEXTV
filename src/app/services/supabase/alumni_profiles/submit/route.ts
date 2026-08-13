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
      profile_picture,
    } = body;

    if (!full_name || !email) {
      return NextResponse.json(
        { success: false, error: "Full name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (
      !String(full_name).trim() ||
      !String(nickname).trim() ||
      !String(graduation_year).trim() ||
      !String(birthday).trim() ||
      !normalizedEmail ||
      !Array.isArray(educational_attainments) || educational_attainments.length === 0 ||
      !Array.isArray(programs) || programs.length === 0 ||
      !Array.isArray(certificates) || certificates.length === 0 ||
      !Array.isArray(work_experiences) || work_experiences.length === 0 ||
      !String(experience).trim() ||
      !String(transformation).trim() ||
      !String(visibility).trim()
    ) {
      return NextResponse.json(
        { success: false, error: "All alumni form fields are required." },
        { status: 400 }
      );
    }

    const { data: existingProfiles, error: lookupError } = await supabaseServer
      .from("alumni_profiles")
      .select("id, verification_status, created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false });

    if (lookupError) {
      console.error("Supabase lookup error:", lookupError);
      return NextResponse.json(
        { success: false, error: lookupError.message },
        { status: 500 }
      );
    }

    const existingActive = (existingProfiles ?? []).find(
      (profile) => String(profile.verification_status ?? "").toLowerCase() !== "rejected",
    );

    const profilePayload: Record<string, unknown> = {
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
      email: normalizedEmail,
    };

    if (profile_picture) {
      profilePayload.profile_picture = profile_picture;
    }

    if (existingActive) {
      const { data, error } = await supabaseServer
        .from("alumni_profiles")
        .update(profilePayload)
        .eq("id", existingActive.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Alumni profile saved successfully", data },
        { status: 200 }
      );
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .insert([{ ...profilePayload, verification_status: "pending" }])
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
