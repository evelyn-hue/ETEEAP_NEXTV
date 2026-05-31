import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { data, error } = await supabaseServer
      .from("auth")
      .select("email,password")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "User not exist please signup" },
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Something Went Wrong: ", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}