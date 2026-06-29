import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendOtpEmail } from "@/lib/resend";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseServer
      .from("auth")
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq("email", cleanEmail);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    try {
      await sendOtpEmail(cleanEmail, otp);
    } catch {
      // Email send failed but OTP is stored. In dev, log it.
      console.log(`OTP for ${cleanEmail}: ${otp}`);
    }

    return NextResponse.json({ success: true, message: "Verification code sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
