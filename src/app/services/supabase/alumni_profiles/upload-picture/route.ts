import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth, isAdminUser } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/documents";

export async function POST(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);
        if (!authResult.ok) return authResult.response;

        const caller = authResult.user;
        const isCallerAdmin = isAdminUser(caller);

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const email = formData.get("email") as string;

        if (!file || !email) {
            return NextResponse.json(
                { success: false, error: "File and email are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!isCallerAdmin && caller.email.toLowerCase() !== normalizedEmail) {
            return NextResponse.json(
                { success: false, error: "Access denied" },
                { status: 403 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size exceeds 5MB limit" },
                { status: 400 }
            );
        }

        const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Only image files (JPG, PNG, WebP) are allowed" },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `alumni-${email}-${Date.now()}-${safeName}`;
        const filePath = `alumni_pics/${fileName}`;

        const { error: uploadError } = await supabaseServer.storage
            .from("profile_pic")
            .upload(filePath, buffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type,
            });

        if (uploadError) {
            return NextResponse.json(
                { success: false, error: uploadError.message },
                { status: 500 }
            );
        }

        const { data: publicUrlData } = supabaseServer.storage
            .from("profile_pic")
            .getPublicUrl(filePath);

        const profilePictureUrl = publicUrlData.publicUrl;

        return NextResponse.json(
            { success: true, data: { profilePictureUrl } },
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
