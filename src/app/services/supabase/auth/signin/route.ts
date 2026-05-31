import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabaseServer 
            .from("auth")
            .insert([{ email, password: hashedPassword }]);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
    }
}