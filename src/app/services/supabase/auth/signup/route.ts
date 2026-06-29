import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendOtpEmail } from "@/lib/resend";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
    const { email, phone, civil_status, password, fullName } = await req.json();

    if (!email) return NextResponse.json({ success: false, error: "Email Not Exist" }, { status: 404 });

    const cleanEmail = email.trim().toLowerCase();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let insertPayload: Record<string, unknown> = { email: cleanEmail, phone, civil_status, password: hashedPassword, fullName };

        // Try with email_verified, fall back if column doesn't exist
        let { error } = await supabaseServer.from("auth").insert([{ ...insertPayload, email_verified: false }]);
        if (error && (error.message.includes("email_verified") || error.code === "42703")) {
            ({ error } = await supabaseServer.from("auth").insert([insertPayload]));
        }

        if (error) {
            const msg = String(error.message || "").toLowerCase();
            if (msg.includes("duplicate") || msg.includes("unique constraint") || (error.code && String(error.code) === "23505")) {
                return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
            }
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Try OTP flow — if columns don't exist, fall back to direct JWT
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { error: otpError } = await supabaseServer
            .from("auth")
            .update({ otp_code: otp, otp_expires_at: expiresAt })
            .eq("email", cleanEmail);

        if (otpError && (otpError.message.includes("otp_code") || otpError.code === "42703")) {
            // OTP columns don't exist — fall back to direct JWT
            const { data: userData } = await supabaseServer.from("auth").select("id, email, phone, civil_status, fullName, profilePicture").eq("email", cleanEmail).limit(1);

            if (userData?.[0]) {
                const final_data = { data: userData };
                const token = jwt.sign({ final_data }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
                const cookieStore = await cookies();
                cookieStore.set({ name: "token", value: token, httpOnly: true, secure: false, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
                return NextResponse.json({ success: true, token }, { status: 200 });
            }
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // OTP flow active
        try {
            await sendOtpEmail(cleanEmail, otp);
        } catch {
            console.log(`OTP for ${cleanEmail}: ${otp}`);
        }

        return NextResponse.json({ success: true, require_otp: true, email: cleanEmail }, { status: 200 });
    } catch (err) {
        console.log("Something Went Wrong: ", err);
        return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
    }
}