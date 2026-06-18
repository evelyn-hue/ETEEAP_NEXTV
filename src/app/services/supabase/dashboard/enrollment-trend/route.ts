import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    // Get enrollment data (applications grouped by created year)
    const { data: enrollmentData } = await supabaseServer
      .from("form")
      .select("created_at");

    // Get alumni data (grouped by graduation year)
    const { data: alumniData } = await supabaseServer
      .from("alumni_profiles")
      .select("graduation_year, created_at");

    // Group by academic year
    const yearMap: Record<string, { enrollment: number; alumni: number }> = {};

    // Process enrollment data
    if (enrollmentData) {
      enrollmentData.forEach((app: { created_at: string }) => {
        if (app.created_at) {
          const date = new Date(app.created_at);
          const year = date.getFullYear();
          const yearKey = `${year}-${year + 1}`;
          yearMap[yearKey] = yearMap[yearKey] || { enrollment: 0, alumni: 0 };
          yearMap[yearKey].enrollment += 1;
        }
      });
    }

    // Process alumni data
    if (alumniData) {
      alumniData.forEach((alumni: { graduation_year: string }) => {
        if (alumni.graduation_year) {
          const yearKey = alumni.graduation_year;
          yearMap[yearKey] = yearMap[yearKey] || { enrollment: 0, alumni: 0 };
          yearMap[yearKey].alumni += 1;
        }
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
