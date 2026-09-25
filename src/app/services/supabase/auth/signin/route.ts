import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("auth")
      .select("id, email, password, phone, civil_status, fullName, profilePicture, applicant_status, email_verified")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isAdmin = email === "admin@admin.com";

    // Enforce OTP email verification for regular applicants if flag is explicitly false
    if (data.email_verified === false && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          require_otp: true,
          email: data.email,
          message: "Please verify your email address before signing in.",
        },
        { status: 403 }
      );
    }

    const role = isAdmin ? "admin" : "applicant";
    const userPayload = {
      id: data.id,
      email: data.email,
      phone: data.phone ?? "",
      civil_status: data.civil_status ?? "",
      fullName: data.fullName ?? "",
      profilePicture: data.profilePicture ?? "",
      applicant_status: data.applicant_status ?? "",
      role,
    };

    const token = createToken(userPayload, role);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        token,
        user: userPayload,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign-in server error: ", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during sign in" },
      { status: 500 }
    );
  }
}