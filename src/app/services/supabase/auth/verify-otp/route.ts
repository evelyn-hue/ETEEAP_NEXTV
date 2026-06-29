import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabaseServer
      .from("auth")
      .select("id, email, phone, civil_status, fullName, profilePicture, otp_code, otp_expires_at")
      .eq("email", cleanEmail)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if ((data as Record<string, unknown>).otp_code !== String(otp).trim()) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    if ((data as Record<string, unknown>).otp_expires_at && new Date((data as Record<string, unknown>).otp_expires_at as string) < new Date()) {
      return NextResponse.json({ success: false, error: "Verification code has expired" }, { status: 400 });
    }

    await supabaseServer
      .from("auth")
      .update({ email_verified: true, otp_code: null, otp_expires_at: null })
      .eq("email", cleanEmail);

    const final_data = { data: [{ id: data.id, email: data.email, phone: data.phone, civil_status: data.civil_status, fullName: data.fullName, profilePicture: data.profilePicture }] };
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
