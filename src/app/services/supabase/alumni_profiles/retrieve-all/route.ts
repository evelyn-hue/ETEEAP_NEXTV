import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Enrich profiles missing profile_picture with auth profilePicture
    const enriched = await Promise.all(
      (data || []).map(async (profile) => {
        if (profile.profile_picture) return profile;
        if (!profile.email) return profile;

        try {
          const { data: authUser } = await supabaseServer
            .from("auth")
            .select("profilePicture")
            .eq("email", profile.email.trim().toLowerCase())
            .limit(1)
            .single();

          if (authUser?.profilePicture) {
            return { ...profile, profile_picture: authUser.profilePicture };
          }
        } catch {}

        return profile;
      })
    );

    return NextResponse.json(
      { success: true, data: enriched },
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
