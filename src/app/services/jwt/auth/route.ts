import { NextResponse, NextRequest } from "next/server";
import { verifySession, createToken, setAuthCookie } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * DEPRECATED / SECURED:
 * Tokens must only be minted upon verified sign-in (password or OAuth).
 * This endpoint now requires an active valid session to refresh a token,
 * completely blocking unauthenticated token minting.
 */
export async function POST(req: NextRequest) {
  const user = await verifySession(req);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Token generation requires verified authentication",
      },
      { status: 401 }
    );
  }

  const { data: dbUser } = await supabaseServer
    .from("auth")
    .select("id, email, phone, civil_status, fullName, profilePicture, applicant_status")
    .eq("email", user.email)
    .maybeSingle();

  if (!dbUser) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const token = createToken({
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    phone: dbUser.phone,
    civil_status: dbUser.civil_status,
    profilePicture: dbUser.profilePicture,
    applicant_status: dbUser.applicant_status,
    role: user.role,
  });

  await setAuthCookie(token);

  return NextResponse.json({ success: true, token }, { status: 200 });
}
