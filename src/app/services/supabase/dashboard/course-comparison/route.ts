import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { supportedPrograms, getCourseAbbrev, normalizeProgram } from "@/lib/programs";

export async function POST(req: NextRequest) {
  try {
    let body: { year?: string | null; course?: string | null } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch { /* no body — treat as no filters */ }

    const year = body?.year ? String(body.year).trim() : "";
    const course = body?.course ? String(body.course).trim() : "";

    const { data: applicationData } = await supabaseServer
      .from("form")
      .select("program, created_at");

    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("programs, graduation_year, created_at");

    const courseMap: Record<string, { applications: number; alumni: number; lastUpdated?: string }> = {};

    supportedPrograms.forEach((courseName) => {
      courseMap[courseName] = { applications: 0, alumni: 0, lastUpdated: undefined };
    });

    const matchesCourse = (program?: string | null) => {
      if (!course) return true;
      return normalizeProgram(program) === normalizeProgram(course);
    };

    if (applicationData) {
      applicationData.forEach((app: { program?: string | null; created_at?: string }) => {
        if (year && app.created_at) {
          const appYear = String(new Date(app.created_at).getFullYear());
          if (appYear !== year) return;
        }
        const courseName = normalizeProgram(app.program);
        if (!courseName || !matchesCourse(app.program)) {
          return;
        }

        const row = courseMap[courseName];
        row.applications += 1;
        if (app.created_at) {
          const appDate = new Date(app.created_at).toISOString();
          if (!row.lastUpdated || appDate > row.lastUpdated) {
            row.lastUpdated = appDate;
          }
        }
      });
    }

    if (alumniData) {
      alumniData.forEach((alumni: { programs?: string[] | null; graduation_year?: string | null; created_at?: string }) => {
        if (!Array.isArray(alumni.programs)) {
          return;
        }

        if (year && alumni.graduation_year && String(alumni.graduation_year).trim() !== year) {
          return;
        }

        alumni.programs.forEach((program: string) => {
          const courseName = normalizeProgram(program);
          if (!courseName || !matchesCourse(program)) {
            return;
          }

          const row = courseMap[courseName];
          row.alumni += 1;
          if (alumni.created_at) {
            const alumniDate = new Date(alumni.created_at).toISOString();
            if (!row.lastUpdated || alumniDate > row.lastUpdated) {
              row.lastUpdated = alumniDate;
            }
          }
        });
      });
    }

    const courseComparison = supportedPrograms.map((courseName) => {
      const data = courseMap[courseName];
      return {
        course: courseName,
        courseAbbrev: getCourseAbbrev(courseName),
        applications: data.applications,
        alumni: data.alumni,
        lastUpdated: data.lastUpdated ?? null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: courseComparison,
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