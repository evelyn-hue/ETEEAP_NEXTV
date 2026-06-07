import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { email, phone, status, password, fullName } = await req.json();

    if (!email) return NextResponse.json({ success: false, error: "Email Not Exist" }, { status: 404 });

    const cleanEmail = email.trim().lowwercase();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabaseServer 
            .from("auth")
            .insert([{ cleanEmail, phone, status, password: hashedPassword, fullName }]);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true}, { status: 200 });
    } catch (error) {
        console.log("Something Went Wrong: ", error);
        return NextResponse.json({ success: false, error: error || "An unexpected error occurred" }, { status: 500 });
    }
}