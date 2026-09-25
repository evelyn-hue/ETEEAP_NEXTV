import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { normalizeProgram } from "@/lib/programs";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin(req);
    if (!adminAuth.ok) return adminAuth.response;

    let body: { course?: string | null } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch { /* no body — treat as no filters */ }

    const course = body?.course ? String(body.course).trim() : "";
    const matchesCourse = (program?: string | null) => {
      if (!course) return true;
      return normalizeProgram(program) === normalizeProgram(course);
    };

    // Get enrollment data (applications grouped by created year)
    const { data: enrollmentData } = await supabaseServer
      .from("form")
      .select("created_at, program");

    // Get alumni data (grouped by graduation year)
    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("graduation_year, created_at, programs");

    // Group by academic year
    const yearMap: Record<string, { enrollment: number; alumni: number }> = {};

    // Process enrollment data
    if (enrollmentData) {
      enrollmentData.forEach((app: { created_at: string; program?: string | null }) => {
        if (!app.created_at) return;
        if (!matchesCourse(app.program)) return;
        const date = new Date(app.created_at);
        const year = date.getFullYear();
        const yearKey = `${year}-${year + 1}`;
        yearMap[yearKey] = yearMap[yearKey] || { enrollment: 0, alumni: 0 };
        yearMap[yearKey].enrollment += 1;
      });
    }

    // Process alumni data
    if (alumniData) {
      alumniData.forEach((alumni: { graduation_year: string; programs?: string[] | null }) => {
        if (!alumni.graduation_year) return;
        if (course && !(alumni.programs ?? []).some((program) => matchesCourse(program))) return;
        const yearKey = alumni.graduation_year;
        yearMap[yearKey] = yearMap[yearKey] || { enrollment: 0, alumni: 0 };
        yearMap[yearKey].alumni += 1;
      });
    }

    // Sort by year and convert to array
    const enrollmentTrend = Object.entries(yearMap)
      .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
      .map(([year, data]) => ({
        year,
        enrollment: data.enrollment,
        alumni: data.alumni,
      }));

    return NextResponse.json(
      {
        success: true,
        data: enrollmentTrend,
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