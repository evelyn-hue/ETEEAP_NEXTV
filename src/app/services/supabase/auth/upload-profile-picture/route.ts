import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const email = formData.get("email") as string;

        if (!file || !email) {
            return NextResponse.json(
                { success: false, error: "File and email are required" },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const fileName = `${email}-${Date.now()}-${file.name}`;
        const filePath = `profile_pic/${fileName}`;

        const { error: uploadError } = await supabaseServer.storage
            .from("profile_pic")
            .upload(filePath, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (uploadError) {
            return NextResponse.json(
                { success: false, error: uploadError.message },
                { status: 500 }
            );
        }

        // Get the public URL
        const { data: publicUrlData } = supabaseServer.storage
            .from("profile_pic")
            .getPublicUrl(filePath);

        const profilePictureUrl = publicUrlData.publicUrl;

        // Update the auth table with the new profile picture URL
        const { data: updateData, error: updateError } = await supabaseServer
            .from("auth")
            .update({ profilePicture: profilePictureUrl })
            .eq("email", email)
            .select();

        if (updateError) {
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, data: { profilePictureUrl, userInfo: updateData[0] } },
            { status: 200 }
        );
    } catch (error) {
        console.log("Upload error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
