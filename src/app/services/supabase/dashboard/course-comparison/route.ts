import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const supportedPrograms = [
  "Bachelor of Arts in English Language Studies",
  "Bachelor of Science in Business Administration - Marketing Management",
  "Bachelor of Science in Business Administration - Human Resource Management",
  "Bachelor of Science in Hospitality Management",
] as const;

function getCourseAbbrev(course: string) {
  const map: Record<string, string> = {
    "Bachelor of Arts in English Language Studies": "BAELS",
    "Bachelor of Science in Business Administration - Marketing Management": "BSBA-MM",
    "Bachelor of Science in Business Administration - Human Resource Management": "BSBA-HRM",
    "Bachelor of Science in Hospitality Management": "BSHM",
  };

  return map[course] ?? course;
}

function normalizeProgram(program?: string | null) {
  const value = String(program ?? "").trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (value.includes("baels") || value.includes("english language studies")) {
    return supportedPrograms[0];
  }

  if ((value.includes("bsba") || value.includes("marketing")) && (value.includes("marketing") || value.includes("mm"))) {
    return supportedPrograms[1];
  }

  if ((value.includes("bsba") || value.includes("human resource")) && (value.includes("human resource") || value.includes("hrm"))) {
    return supportedPrograms[2];
  }

  if (value.includes("hospitality") || value.includes("bshm")) {
    return supportedPrograms[3];
  }

  return null;
}

export async function POST() {
  try {
    const { data: applicationData } = await supabaseServer
      .from("form")
      .select("program, created_at");

    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("programs, created_at");

    const courseMap: Record<string, { applications: number; alumni: number; lastUpdated?: string }> = {};

    supportedPrograms.forEach((course) => {
      courseMap[course] = { applications: 0, alumni: 0, lastUpdated: undefined };
    });

    if (applicationData) {
      applicationData.forEach((app: { program?: string | null; created_at?: string }) => {
        const course = normalizeProgram(app.program);
        if (!course) {
          return;
        }

        const row = courseMap[course];
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
      alumniData.forEach((alumni: { programs?: string[] | null; created_at?: string }) => {
        if (!Array.isArray(alumni.programs)) {
          return;
        }

        alumni.programs.forEach((program: string) => {
          const course = normalizeProgram(program);
          if (!course) {
            return;
          }

          const row = courseMap[course];
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

    const courseComparison = supportedPrograms.map((course) => {
      const data = courseMap[course];
      return {
        course,
        courseAbbrev: getCourseAbbrev(course),
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
