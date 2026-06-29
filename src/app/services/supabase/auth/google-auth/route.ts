import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function verifyGoogleToken(credential: string) {
  const response = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + credential);
  if (!response.ok) return null;
  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ success: false, error: "Google credential is required" }, { status: 400 });
    }

    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser || !googleUser.email) {
      return NextResponse.json({ success: false, error: "Invalid Google credential" }, { status: 401 });
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.sub;

    const { data: existingUser, error: lookupError } = await supabaseServer
      .from("auth")
      .select("id, email, phone, civil_status, fullName, profilePicture")
      .eq("email", cleanEmail)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      return NextResponse.json({ success: false, error: lookupError.message }, { status: 500 });
    }

    let userData;

    if (!existingUser) {
      const nameParts = (googleUser.name || "User").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const { data: newUser, error: insertError } = await supabaseServer
        .from("auth")
        .insert([{
          email: cleanEmail,
          fullName: `${firstName} ${lastName}`.trim(),
          password: "",
          phone: "",
          civil_status: "Single",
        }])
        .select("id, email, phone, civil_status, fullName, profilePicture")
        .single();

      if (insertError || !newUser) {
        return NextResponse.json({ success: false, error: insertError?.message || "Failed to create user" }, { status: 500 });
      }

      userData = newUser;
    } else {
      userData = existingUser;
    }

    // Try to set google_id and email_verified — silently fail if columns missing
    await supabaseServer.from("auth").update({ email_verified: true }).eq("email", cleanEmail);
    await supabaseServer.from("auth").update({ google_id: googleId }).eq("email", cleanEmail);

    const final_data = { data: [userData] };
    const token = jwt.sign({ final_data }, process.env.JWT_SECRET || "", { expiresIn: "30d" });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ success: true, token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
