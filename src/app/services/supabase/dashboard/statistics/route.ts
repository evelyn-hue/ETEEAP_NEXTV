import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    // Get total applications
    const { count: totalApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true });

    // Get pending applications (draft and under review)
    const { count: pendingApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true })
      .in("form_status", ["draft", "Under Review"]);

    // Get approved applications (accepted or approved)
    const { count: approvedApps } = await supabaseServer
      .from("form")
      .select("*", { count: "exact", head: true })
      .in("form_status", ["accepted", "Approve"]);

    // Get pending alumni submissions
    const { count: pendingAlumni } = await supabaseServer
      .from("alumni_profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending");

    // Get total alumni profiles
    const { count: totalAlumni } = await supabaseServer
      .from("alumni_profiles")
      .select("*", { count: "exact", head: true });

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
          pendingAlumni: pendingAlumni || 0,
          totalAlumni: totalAlumni || 0,
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
