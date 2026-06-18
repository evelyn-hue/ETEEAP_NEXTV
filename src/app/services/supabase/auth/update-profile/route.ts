import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    try {
        const { email, fullName, phone, civil_status, profile_pic } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};
        
        if (fullName !== undefined) updateData.fullName = fullName;
        if (phone !== undefined) updateData.phone = phone;
        if (civil_status !== undefined) updateData.civil_status = civil_status;
        if (profile_pic !== undefined) updateData.profilePicture = profile_pic;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, error: "No fields to update" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from("auth")
            .update(updateData)
            .eq("email", email)
            .select();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: data[0] },
            { status: 200 }
        );
    } catch (error) {
        console.log("Something Went Wrong: ", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
