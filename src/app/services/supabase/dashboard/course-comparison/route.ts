import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    // Get all applications with programs
    const { data: applicationData } = await supabaseServer
      .from("form")
      .select("program");

    // Get all alumni with programs
    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("programs");

    // Process course comparison
    const courseMap: Record<string, { applications: number; alumni: number }> = {};

    // Count applications per course
    if (applicationData) {
      applicationData.forEach((app: { program: string }) => {
        const course = app.program || "Unknown";
        courseMap[course] = courseMap[course] || { applications: 0, alumni: 0 };
        courseMap[course].applications += 1;
      });
    }

    // Count alumni per course (programs is an array)
    if (alumniData) {
      alumniData.forEach((alumni: { programs: string[] }) => {
        if (Array.isArray(alumni.programs)) {
          alumni.programs.forEach((program: string) => {
            courseMap[program] = courseMap[program] || { applications: 0, alumni: 0 };
            courseMap[program].alumni += 1;
          });
        }
      });
    }

    // Convert to array format for chart
    const courseComparison = Object.entries(courseMap).map(([course, data]) => ({
      course: course.substring(0, 15), // Shorten for display
      applications: data.applications,
      alumni: data.alumni,
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
