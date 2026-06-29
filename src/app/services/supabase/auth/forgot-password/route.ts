import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: user } = await supabaseServer
      .from("auth")
      .select("id, email")
      .eq("email", cleanEmail)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: true, message: "If the email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    const resetToken = jwt.sign({ email: cleanEmail }, process.env.JWT_SECRET || "", { expiresIn: "15m" });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabaseServer
      .from("auth")
      .update({ reset_token: resetToken, reset_token_expires_at: expiresAt })
      .eq("email", cleanEmail);

    const origin = req.nextUrl.origin;
    const resetLink = `${origin}/auth/reset-password?token=${resetToken}`;

    try {
      await sendResetEmail(cleanEmail, resetLink);
    } catch {
      console.log(`Reset link for ${cleanEmail}: ${resetLink}`);
    }

    return NextResponse.json(
      { success: true, message: "If the email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
