import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Token and new password are required" }, { status: 400 });
    }

    let decoded: { email?: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { email?: string };
    } catch {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (!decoded.email) {
      return NextResponse.json({ success: false, error: "Invalid reset token" }, { status: 400 });
    }

    const cleanEmail = decoded.email.trim().toLowerCase();

    const { data: user } = await supabaseServer
      .from("auth")
      .select("id, reset_token, reset_token_expires_at")
      .eq("email", cleanEmail)
      .single();

    if (!user || user.reset_token !== token) {
      return NextResponse.json({ success: false, error: "Invalid or already used reset link" }, { status: 400 });
    }

    if (user.reset_token_expires_at && new Date(user.reset_token_expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Reset link has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await supabaseServer
      .from("auth")
      .update({ password: hashedPassword, reset_token: null, reset_token_expires_at: null })
      .eq("email", cleanEmail);

    return NextResponse.json({ success: true, message: "Password has been reset" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
