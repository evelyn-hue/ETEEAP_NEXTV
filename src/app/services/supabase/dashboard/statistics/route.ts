import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    // Get total applications
    const { count: totalApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true });

    // Get pending applications
    const { count: pendingApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true })
      .eq("form_status", "draft");

    // Get approved applications
    const { count: approvedApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true })
      .eq("form_status", "accepted");

    // Get verified alumni
    const { count: verifiedAlumni } = await supabaseServer
      .from("alumni_profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "verified");

    return NextResponse.json(
      {
        success: true,
        data: {
          totalApplications: totalApps || 0,
          pendingReview: pendingApps || 0,
          approved: approvedApps || 0,
          verifiedAlumni: verifiedAlumni || 0,
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
