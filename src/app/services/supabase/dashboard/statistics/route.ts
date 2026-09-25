import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { normalizeProgram } from "@/lib/programs";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin(req);
    if (!adminAuth.ok) return adminAuth.response;

    let body: { year?: string | null; course?: string | null } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch { /* no body — treat as no filters */ }

    const year = body?.year ? String(body.year).trim() : "";
    const course = body?.course ? String(body.course).trim() : "";

    const matchesYear = (date?: string | null) => {
      if (!year) return true;
      if (!date) return false;
      return String(new Date(date).getFullYear()) === year;
    };
    const matchesGraduationYear = (gy?: string | null) => {
      if (!year) return true;
      return String(gy ?? "").trim() === year;
    };
    const matchesCourse = (program?: string | null) => {
      if (!course) return true;
      return normalizeProgram(program) === normalizeProgram(course);
    };

    const { data: forms } = await supabaseServer
      .from("form")
      .select("form_status, program, created_at");

    const { data: alumni } = await supabaseServer
      .from("alumni_profiles")
      .select("verification_status, is_graduate, graduation_year, programs");

    const formRows = (forms ?? []) as Array<{ form_status?: string | null; program?: string | null; created_at?: string | null }>;
    const alumniRows = (alumni ?? []) as Array<{
      verification_status?: string | null;
      is_graduate?: boolean | null;
      graduation_year?: string | null;
      programs?: string[] | null;
    }>;

    let totalApplications = 0;
    let pendingReview = 0;
    let approved = 0;
    let pendingAlumni = 0;
    let verifiedAlumni = 0;
    let totalAlumni = 0;

    formRows.forEach((row) => {
      if (!matchesYear(row.created_at) || !matchesCourse(row.program)) return;
      totalApplications += 1;
      const status = String(row.form_status ?? "").toLowerCase();
      if (status === "draft" || status === "under review") pendingReview += 1;
      if (status === "accepted" || status === "approve") approved += 1;
    });

    alumniRows.forEach((row) => {
      if (!matchesGraduationYear(row.graduation_year)) return;
      const belongsToCourse = course
        ? (row.programs ?? []).some((program) => matchesCourse(program))
        : true;
      if (!belongsToCourse) return;

      totalAlumni += 1;
      const status = String(row.verification_status ?? "").toLowerCase();
      if (status === "pending") pendingAlumni += 1;
      if (status === "verified") verifiedAlumni += 1;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          totalApplications,
          pendingReview,
          approved,
          pendingAlumni,
          verifiedAlumni,
          totalAlumni,
        },
      },
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