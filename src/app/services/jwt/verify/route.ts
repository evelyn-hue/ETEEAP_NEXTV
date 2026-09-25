import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyJwtToken, extractToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await extractToken(req);

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  const { user: verifiedUser, valid } = verifyJwtToken(token);
  if (!valid || !verifiedUser?.email) {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
  }

  try {
    const { data: userData, error } = await supabaseServer
      .from("auth")
      .select("id, email, phone, civil_status, fullName, profilePicture, applicant_status, email_verified")
      .eq("email", verifiedUser.email)
      .maybeSingle();

    if (error || !userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const role =
      userData.email.toLowerCase() === "admin@admin.com"
        ? "admin"
        : verifiedUser.role || "applicant";

    const payload = {
      ...userData,
      role,
    };

    return NextResponse.json(
      { success: true, message: { final_data: { data: [payload] } } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify token error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}