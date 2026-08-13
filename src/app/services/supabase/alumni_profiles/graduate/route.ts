import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, program, graduation_year } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { success: false, error: "Email and full name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: formRows, error: formError } = await supabaseServer
      .from("form")
      .select("form_status")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (formError) {
      console.error("Supabase form lookup error:", formError);
      return NextResponse.json(
        { success: false, error: formError.message },
        { status: 500 }
      );
    }

    const formStatus = String(formRows?.[0]?.form_status ?? "").toLowerCase();
    const isApproved = formStatus.includes("approve") || formStatus === "accepted";
    if (!isApproved) {
      return NextResponse.json(
        { success: false, error: "Only approved applications can be marked as graduates." },
        { status: 400 }
      );
    }

    const { data: existing, error: lookupError } = await supabaseServer
      .from("alumni_profiles")
      .select("*")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lookupError) {
      console.error("Supabase lookup error:", lookupError);
      return NextResponse.json(
        { success: false, error: lookupError.message },
        { status: 500 }
      );
    }

    const current = existing?.[0] ?? null;

    if (current) {
      const programs = Array.isArray(current.programs) ? current.programs : [];
      const updates: Record<string, unknown> = {
        is_graduate: true,
        verification_status: "verified",
      };
      if (graduation_year) updates.graduation_year = graduation_year;
      if (program && !programs.includes(program)) {
        updates.programs = [...programs, program];
      }

      const { data, error } = await supabaseServer
        .from("alumni_profiles")
        .update(updates)
        .eq("id", current.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Marked as graduate", data: data?.[0] ?? current },
        { status: 200 }
      );
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .insert([
        {
          full_name,
          email: normalizedEmail,
          programs: program ? [program] : [],
          graduation_year: graduation_year || null,
          is_graduate: true,
          verification_status: "verified",
          visibility: "public",
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
      { success: true, message: "Marked as graduate", data: data?.[0] },
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