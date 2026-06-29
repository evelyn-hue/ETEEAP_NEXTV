import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieToken = (await cookies()).get("token")?.value;
  const token = bearer || cookieToken;

  const apikey = process.env.API_KEY;
  if (!apikey) return NextResponse.json({ success: false, error: "API is not Valid" }, { status: 401 });
  if (!token) return NextResponse.json({ success: false, error: "UnAuth" }, { status: 403 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      final_data?: { data?: Array<{ email?: string }> };
      email?: string;
    };
    const email = decoded?.final_data?.data?.[0]?.email || decoded?.email;

    if (!email) {
      return NextResponse.json({ success: false, error: "UnAuth" }, { status: 401 });
    }

    const { data: userData, error } = await supabaseServer
      .from("auth")
      .select("id, email, phone, civil_status, fullName, profilePicture, applicant_status")
      .eq("email", email)
      .single();

    if (error || !userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: { final_data: { data: [userData] } } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify token error:", err);
    return NextResponse.json({ success: false, error: "UnAuth" }, { status: 401 });
  }
}