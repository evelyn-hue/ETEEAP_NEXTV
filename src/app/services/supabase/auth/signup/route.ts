import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const { email, phone, civil_status, password, fullName } = await req.json();

    if (!email) return NextResponse.json({ success: false, error: "Email Not Exist" }, { status: 404 });

    const cleanEmail = email.trim().toLowerCase();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabaseServer 
            .from("auth")
            .insert([{ email: cleanEmail, phone, civil_status, password: hashedPassword, fullName }]);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Generate JWT token for auto-login
        const apikey = process.env.API_KEY;
        if (!apikey) return NextResponse.json({ success: false, error: "API is not Valid" }, { status: 401 });

        // Retrieve the newly created user
        const { data: userData, error: selectError } = await supabaseServer
            .from("auth")
            .select("id, email, phone, civil_status, fullName, profilePicture")
            .eq("email", cleanEmail)
            .limit(1);

        if (selectError || !userData || userData.length === 0) {
            return NextResponse.json({ success: false, error: "Failed to retrieve user data" }, { status: 500 });
        }

        const final_data = { data: userData };

        const token = jwt.sign(
            { final_data },
            process.env.JWT_SECRET || "",
            { expiresIn: "30d" }
        );

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
        console.log("Something Went Wrong: ", error);
        return NextResponse.json({ success: false, error: error || "An unexpected error occurred" }, { status: 500 });
    }
}