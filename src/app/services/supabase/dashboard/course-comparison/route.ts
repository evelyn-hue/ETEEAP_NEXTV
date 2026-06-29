import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function getCourseAbbrev(course: string) {
  const map: Record<string, string> = {
    "Bachelor of Arts in English Language Studies": "BAELS",
    "Bachelor of Science in Business Administration - Marketing Management": "BSBA-MM",
    "Bachelor of Science in Business Administration - Human Resource Management": "BSBA-HRM",
    "Bachelor of Science in Hospitality Management": "BSHM",
  };

  return map[course] ?? course;
}

export async function POST() {
  try {
    // Get all applications with programs
    const { data: applicationData } = await supabaseServer
      .from("form")
      .select("program, created_at");

    // Get all alumni with programs
    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("programs, created_at");

    // Process course comparison
    const courseMap: Record<string, { applications: number; alumni: number; lastUpdated?: string }> = {};

    // Count applications per course
    if (applicationData) {
      applicationData.forEach((app: { program: string; created_at?: string }) => {
        const course = app.program || "Unknown";
        const row = courseMap[course] || { applications: 0, alumni: 0, lastUpdated: undefined };
        row.applications += 1;
        if (app.created_at) {
          const appDate = new Date(app.created_at).toISOString();
          if (!row.lastUpdated || appDate > row.lastUpdated) {
            row.lastUpdated = appDate;
          }
        }
        courseMap[course] = row;
      });
    }

    // Count alumni per course (programs is an array)
    if (alumniData) {
      alumniData.forEach((alumni: { programs: string[]; created_at?: string }) => {
        if (Array.isArray(alumni.programs)) {
          alumni.programs.forEach((program: string) => {
            const course = program || "Unknown";
            const row = courseMap[course] || { applications: 0, alumni: 0, lastUpdated: undefined };
            row.alumni += 1;
            if (alumni.created_at) {
              const alumniDate = new Date(alumni.created_at).toISOString();
              if (!row.lastUpdated || alumniDate > row.lastUpdated) {
                row.lastUpdated = alumniDate;
              }
            }
            courseMap[course] = row;
          });
        }
      });
    }

    // Convert to array format for chart
    const courseComparison = Object.entries(courseMap).map(([course, data]) => ({
      course,
      courseAbbrev: getCourseAbbrev(course),
      applications: data.applications,
      alumni: data.alumni,
      lastUpdated: data.lastUpdated ?? null,
    }));

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
